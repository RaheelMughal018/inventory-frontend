// pages/PurchaseInvoicePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router"; 
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  useGetAllPurchaseInvoicesQuery,
  PurchaseInvoiceSummary,
  useDeletePurchaseInvoicesMutation,
  InvoiceStatusEnum,
} from "../../redux/services/purchaseInvoice"; 
import Pagination from "../../components/common/Pagination";
import PurchaseTable from "../../components/tables/BasicTables/PurchaseTable";
import {useAddPurchaseInvoicePaymentMutation} from "../../redux/services/purchaseInvoice";
import PaymentModal, { PaymentFormData } from "../../components/modals/PaymentModal";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const PurchaseInvoicePage = () => {
  const navigate = useNavigate(); 
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
   const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<InvoiceStatusEnum | null>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoiceSummary | null>(null);
  const [addPayment] = useAddPurchaseInvoicePaymentMutation();
  const {data:accountsData} = useGetAllAccountsQuery({})
  const {data:suppliersData} = useGetAllSuppliersQuery({})
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [deletePurchase] = useDeletePurchaseInvoicesMutation();
  // Fetch purchase invoices
  const { data, isLoading } = useGetAllPurchaseInvoicesQuery({
    limit,
    skip,
    supplier_id: selectedSupplierId ?? undefined,
    payment_status: selectedPaymentStatus ?? undefined,
    start_date: startDate,
    end_date: endDate,
  },

);
 
const handleStartDateChange = (selectedDates: Date[]) => {
  const d = selectedDates[0]
  if (selectedDates.length > 0) {
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T00:00:00`; 

    setStartDate(formatted);
    setPage(1); // reset pagination
  } else {
    setStartDate(undefined);
  }
};

const handleEndDateChange = (selectedDates: Date[]) => {
  if (selectedDates.length > 0) {
    const d = selectedDates[0]
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T00:00:00`;
    setEndDate(formatted);
    setPage(1);
  } else {
    setEndDate(undefined);
  }
};

  // Handle export CSV
  const handleExportCSV = () => {
    handleApiSuccess("Export feature coming soon");
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
  }
  
  // ✅ ADD: Handle Delete Invoice
  const handleDeleteClick = async (invoice: PurchaseInvoiceSummary) => {
      try {
        const res = await deletePurchase(invoice.id).unwrap()
        if(res){
          handleApiSuccess(res.message);
        }
      } catch (error) {
        handleApiError(error, "Failed to delete invoice");
      }
  };

  // ✅ ADD: Callback for when delete is successful in child table
  const handleDeleteSuccess = (invoice: PurchaseInvoiceSummary) => {
    handleApiSuccess(`Invoice ${invoice.id} deleted successfully`);
    // The table will automatically refetch due to invalidated tags
  };
  
  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!selectedInvoice) return;
    
    try {
      await addPayment({
        invoice_id: selectedInvoice.id,
      data: {
        account_id: data.payment_account_id,
        amount: data.payment_amount,
      },
    }).unwrap();
    
    handleApiSuccess("Payment recorded successfully");
    
    // close modal & reset state
    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
    
    // optionally refetch the invoices
  } catch (error) {
    handleApiError(error, "Failed to add payment");
  }
};

const accountOptions =
accountsData?.accounts?.map((acc) => ({
  id: acc.id,
  name: `${acc.name} - ${acc.type}`,
})) || [];

const supplierOptions = [
  { id: "all", name: "All Suppliers" },
  ...(suppliersData?.suppliers?.map((s) => ({
    id: s.id,
    name: s.name,
  })) || []),
];
 const paymentStatusOptions = [
    { id: "all", name: "All Statuses" },
    { id: "PAID", name: "Paid" },
    { id: "UNPAID", name: "Unpaid" },
    { id: "PARTIAL", name: "Partial" },
  ];


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
              <div className="flex gap-3 items-end">
                    {/* Start Date */}
                    <div className="w-44">
                      <DatePicker
                        id="start-date"
                        label="Start Date"
                        placeholder="Start date"
                        onChange={handleStartDateChange}
                      />
                    </div>

                    {/* End Date */}
                    <div className="w-44">
                      <DatePicker
                        id="end-date"
                        label="End Date"
                        placeholder="End date"
                        onChange={handleEndDateChange}
                      />
                    </div>

              <SelectDropdown 
               options={supplierOptions}
               value={selectedSupplierId ?? "all"}
               onChange={(value) => {
                 if (value === "all") {
                   setSelectedSupplierId(null);
                 } else {
                   setSelectedSupplierId(Number(value));
                 }
                 setPage(1); // reset pagination
               }}
               placeholder="Filter by supplier..."
               searchable 
               className="w-3xs"
              />
             <SelectDropdown
                  options={paymentStatusOptions}
                  value={selectedPaymentStatus ?? "all"}
                  onChange={(value) => {
                    if (value === "all") {
                      setSelectedPaymentStatus(null);
                    } else {
                      setSelectedPaymentStatus(value as InvoiceStatusEnum);
                    }
                    setPage(1); // reset pagination
                  }}
                  placeholder="Filter by status..."
                  searchable
                  className="w-3xs"
                /> 
                </div>
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
