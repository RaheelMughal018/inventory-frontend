import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SupplierTable from "../../components/tables/BasicTables/SuppliersTable";
import AddSupplierModal from "../../components/modals/SupplierModal"; // Import modal
import { useGetAllSuppliersQuery , useCreateSupplierMutation, useUpdateSupplierMutation, CreateSupplier, Supplier} from "../../redux/services/supplier";
import {SupplierFormData} from '../../components/modals/SupplierModal'
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import { SupplierPurchaseSummary, useGetSuppliersSummaryQuery } from "../../redux/services/purchaseInvoice";
import { useModal } from "../../hooks/useModal";
import DirectPaymentModal, { DirectPaymentFormData } from "../../components/modals/DirectPaymentModal";
import { CreateDirectPayment, useCreateDirectPaymentMutation, useGetSupplierOutstandingQuery } from "../../redux/services/supplierPayment";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const SupplierPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;
  const { data, isLoading } = useGetAllSuppliersQuery({
    search: search || undefined,
    limit,
    skip,
  });
  
  const [createSupplier] = useCreateSupplierMutation()
  const [updateSupplier] = useUpdateSupplierMutation()
  const {data:summary} = useGetSuppliersSummaryQuery()
  const {data:accountsData} = useGetAllAccountsQuery({})
  const [createDirectPayment] = useCreateDirectPaymentMutation()
  // Add state to control modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  

  const handleSearch = () => {
    setPage(1);
  };

  // Handle form submission for adding
  const handleAddSupplier = async (supplierData: SupplierFormData) => {
    try {
      const payload: CreateSupplier = {
        name: supplierData.name,
        phone: supplierData.phone,
        city: supplierData.city,
        company_name: supplierData.company_name ?? ""
      }
      const res = await createSupplier(payload).unwrap();
      if(res) handleApiSuccess(`${res.name} is created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create supplier");
    }
  };

  // Handle form submission for editing
  const handleEditSupplier = async (supplierData: SupplierFormData) => {
    if (!selectedSupplier) return;

    try {
      const payload: CreateSupplier = {
        name: supplierData.name,
        phone: supplierData.phone,
        city: supplierData.city,
        company_name: supplierData.company_name ?? ""
      }
      const res = await updateSupplier({ id: selectedSupplier.id, ...payload }).unwrap();
      if(res) handleApiSuccess(`${res.name} is updated successfully`);
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      handleApiError(error, "Failed to update supplier");
    }
  };

  // Handle edit button click
  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleAddPayment = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsPaymentModalOpen(true)
  }
  const summaryMap: Record<number, SupplierPurchaseSummary> = {};
  summary?.summaries?.forEach((s) => {
    summaryMap[s.supplier_id] = s;
  });

  const accountOptions =
  accountsData?.accounts?.map((acc) => ({
    id: acc.id,
    name: `${acc.name} - ${acc.type}`,
  })) || [];
  
 

const handlePaymentSubmit = async (data: DirectPaymentFormData) => {
  if (!selectedSupplier) return;
  try {
    const payload: CreateDirectPayment = {
      supplier_id: selectedSupplier?.id ?? 0,
      amount: data.amount,
      account_id: data.account_id,
      allocation_method: "FIFO",

    }
    const res = await createDirectPayment(payload).unwrap();
    if(res){
      handleApiSuccess("Payment created successfully");
      setIsPaymentModalOpen(false);
    }
  } catch (error) {
    handleApiError(error, "Failed to create direct payment");
  }
};

  return (
    <>
      <PageMeta
        title="Supplier"
        description="Supplier page where you can check your list of suppliers"
      />

      <PageBreadcrumb pageTitle="Supplier's" />

      <div className="space-y-6">
        <ComponentCard
          title="Supplier Table"
          addButtonText="Add New Supplier"
          onAddClick={() => setIsAddModalOpen(true)} // Open modal on click!
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
              placeholder="Search suppliers..."
            />
          }
        >
          {summary?.total && (
            <div className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total purchases</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{summary.total.total_purchases.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total paid</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{summary.total.total_paid.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outstanding</p>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{summary.total.outstanding_balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total invoices</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{summary.total.total_invoices}</p>
              </div>
            </div>
          )}
          <SupplierTable
            suppliers={data?.suppliers ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
            summaries = {summaryMap}
            onAddPayment={handleAddPayment}
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

      {/* Modal - Opens when "Add New Supplier" button is clicked */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSupplier}
        mode="add"
      />

      {/* Modal - Opens when edit button is clicked */}
      <AddSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleEditSupplier}
        initialData={selectedSupplier}
        mode="edit"
      />

    {/* Modal - Opens when add payment button is clicked */}
    {isPaymentModalOpen && (
    <DirectPaymentModal
      isOpen={isPaymentModalOpen}
      onClose={() => { setIsPaymentModalOpen(false); setSelectedSupplier(null); }}
      onSubmit={handlePaymentSubmit}
      accounts={accountOptions}
      supplierId={selectedSupplier?.id ?? 0}
      />
    )}
    </>
  );
};

export default SupplierPage;
