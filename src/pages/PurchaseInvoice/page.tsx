// pages/PurchaseInvoicePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  useGetAllPurchaseInvoicesQuery,
  PurchaseInvoice,
} from "../../redux/services/purchaseInvoice"; // ✅ REMOVE unused mutations
import { toast } from "sonner";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import PurchaseTable from "../../components/tables/BasicTables/PurchaseTable";

const PurchaseInvoicePage = () => {
  const navigate = useNavigate(); // ✅ ADD NAVIGATION
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
  const handleEditClick = (invoice: PurchaseInvoice) => {
    navigate(`/purchase-invoices/edit/${invoice.id}`);
  };

  // ✅ ADD: Handle View Invoice - Navigate to view page
  const handleViewClick = (invoice: PurchaseInvoice) => {
    navigate(`/purchase-invoices/view/${invoice.id}`);
  };

  // ✅ ADD: Handle Add Payment - Navigate to payment page
  const handleAddPaymentClick = (invoice: PurchaseInvoice) => {
    navigate(`/purchase-invoices/${invoice.id}/add-payment`);
  };

  // ✅ ADD: Handle Delete Invoice
  const handleDeleteClick = (invoice: PurchaseInvoice) => {
    if (
      window.confirm(
        `Are you sure you want to delete invoice ${invoice.invoice_number}?`,
      )
    ) {
      // TODO: Implement delete mutation here
      toast.info(`Invoice ${invoice.invoice_number} would be deleted`);
      console.log("Delete invoice:", invoice.id);
    }
  };

  // ✅ ADD: Callback for when delete is successful in child table
  const handleDeleteSuccess = (invoice: PurchaseInvoice) => {
    toast.success(`Invoice ${invoice.invoice_number} deleted successfully`);
    // The table will automatically refetch due to invalidated tags
  };

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
          onAddClick={handleAddNewInvoice} // ✅ Use navigation handler
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
            purchases={data?.purchase_invoices ?? []}
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
    </>
  );
};

export default PurchaseInvoicePage;
