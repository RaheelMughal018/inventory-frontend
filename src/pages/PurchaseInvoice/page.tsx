// pages/PurchaseInvoicePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router"; 
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  useGetAllPurchaseInvoicesQuery,
  PurchaseInvoiceSummary,
} from "../../redux/services/purchaseInvoice"; 
import { toast } from "sonner";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import PurchaseTable from "../../components/tables/BasicTables/PurchaseTable";
import {useAddPurchaseInvoicePaymentMutation} from "../../redux/services/purchaseInvoice";
import PaymentModal, { PaymentFormData } from "../../components/modals/PaymentModal";
import { useGetAllAccountsQuery } from "../../redux/services/account";

const PurchaseInvoicePage = () => {
  const navigate = useNavigate(); 
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;

  // Fetch purchase invoices
  const { data, isLoading } = useGetAllPurchaseInvoicesQuery({
    search: search || undefined,
    limit,
    skip,
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoiceSummary | null>(null);
  const [addPayment] = useAddPurchaseInvoicePaymentMutation();
  const {data:accountsData} = useGetAllAccountsQuery({})

  // Handle search
  const handleSearch = () => {
    setPage(1);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting purchase invoices to CSV");
    toast.info("Export feature coming soon");
  };

  // ✅ ADD: Handle Add New Invoice - Navigate to create page
  const handleAddNewInvoice = () => {
    navigate("/purchase/create");
  };

  // ✅ ADD: Handle Edit Invoice - Navigate to edit page
  const handleEditClick = (invoice: PurchaseInvoiceSummary) => {
    navigate(`/purchase-invoices/edit/${invoice.id}`);
  };

  // ✅ ADD: Handle View Invoice - Navigate to view page
  const handleViewClick = (invoice: PurchaseInvoiceSummary) => {
    navigate(`/purchase-invoices/view/${invoice.id}`);
  };

  // ✅ ADD: Handle Add Payment - Navigate to payment page
  const handleAddPaymentClick = (invoice: PurchaseInvoiceSummary) => {
    setSelectedInvoice(invoice)
    setIsPaymentModalOpen(true)
  };

  // ✅ ADD: Handle Delete Invoice
  const handleDeleteClick = (invoice: PurchaseInvoiceSummary) => {
    toast.info(`Delete not implemented for invoice ${invoice.id} yet`);
    console.log("Delete invoice:", invoice.id);
  };

  // ✅ ADD: Callback for when delete is successful in child table
  const handleDeleteSuccess = (invoice: PurchaseInvoiceSummary) => {
    toast.success(`Invoice ${invoice.id} deleted successfully`);
    // The table will automatically refetch due to invalidated tags
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
  console.log("🚀 ~ handlePaymentSubmit ~ data:", data)
  if (!selectedInvoice) return;

  try {
    await addPayment({
      invoice_id: selectedInvoice.id,
      data: {
        account_id: data.payment_account_id,
        amount: data.payment_amount,
      },
    }).unwrap();

    toast.success("Payment recorded successfully");

    // close modal & reset state
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);

    // optionally refetch the invoices
  } catch (error) {
    console.log("🚀 ~ handlePaymentSubmit ~ error:", error)
    toast.error("Failed to add payment");
  }
};

const accountOptions =
  accountsData?.accounts?.map((acc) => ({
    id: acc.id,
    name: `${acc.name} - ${acc.type}`,
  })) || [];


  return (
    <>
      <PageMeta
        title="Purchase Invoices"
        description="Manage your purchase invoices"
      />
      <PageBreadcrumb pageTitle="Purchase Invoices" />
      <div className="space-y-6">
        <ComponentCard
          title="Purchase Invoices"
          exportButtonText="Export Invoices CSV"
          addButtonText="Add New Invoice"
          onExportClick={handleExportCSV}
          onAddClick={handleAddNewInvoice} 
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
              placeholder="Search invoices by number or supplier..."
            />
          }
        >
          <PurchaseTable
            purchases={data?.invoices ?? []}
            loading={isLoading}
            onEdit={handleEditClick} // ✅ Pass navigation handler
            onView={handleViewClick} // ✅ Pass navigation handler
            onDelete={handleDeleteClick} // ✅ Pass delete handler
            onAddPayment={handleAddPaymentClick} // ✅ Pass add payment handler
            onDeleteSuccess={handleDeleteSuccess} // ✅ Optional: for success notification
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.total ?? 0}
              onPageChange={setPage}
            />
          </div>
        </ComponentCard>
      </div>

      {selectedInvoice && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => { setIsPaymentModalOpen(false); setSelectedInvoice(null); }}
          onSubmit={handlePaymentSubmit}
          totalAmount={Number(selectedInvoice.balance_due)}
          accounts={accountOptions}
        />
      )}
    </>
  );
};

export default PurchaseInvoicePage;
