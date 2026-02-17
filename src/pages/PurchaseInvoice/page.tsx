import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import SelectDropdown from "../../components/form/SelectDropdown";
import {
  useGetAllPurchaseInvoicesQuery,
  PurchaseInvoice,
  PaymentStatus,
  useDeletePurchaseInvoiceMutation,
} from "../../redux/services/purchaseInvoice";
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";
import PurchaseInvoiceTable from "../../components/tables/BasicTables/PurchaseInvoiceTable";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const PurchaseInvoicePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filter states
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");

  const { data: suppliersData } = useGetAllSuppliersQuery({});
  const [deletePurchaseInvoice] = useDeletePurchaseInvoiceMutation();

  // Fetch purchase invoices
  const { data, isLoading } = useGetAllPurchaseInvoicesQuery({
    search: search || undefined,
    limit,
    page,
    supplier_id: supplierFilter ? Number(supplierFilter) : undefined,
    payment_status: paymentStatusFilter ? (paymentStatusFilter as PaymentStatus) : undefined,
  });

  // Handle export CSV
  const handleExportCSV = () => {
    handleApiSuccess("Export feature coming soon");
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
  };

  // Handle Add New Invoice - Navigate to create page
  const handleAddNewInvoice = () => {
    navigate("/purchase-invoices/create");
  };

  // Handle Edit Invoice - Navigate to edit page
  const handleEditClick = (invoice: PurchaseInvoice) => {
    navigate(`/purchase-invoices/edit/${invoice.id}`);
  };

  // Handle View Invoice - Navigate to view page
  const handleViewClick = (invoice: PurchaseInvoice) => {
    navigate(`/purchase-invoices/view/${invoice.id}`);
  };

  // Handle Delete Invoice
  const handleDeleteClick = async (invoice: PurchaseInvoice) => {
    try {
      const res = await deletePurchaseInvoice(invoice.id).unwrap();
      if (res?.data?.message) {
        handleApiSuccess(res.data.message);
      }
    } catch (error) {
      handleApiError(error, "Failed to delete invoice");
    }
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
          onAddClick={handleAddNewInvoice}
          extra={
            <div className="flex flex-col lg:flex-row gap-3 w-full lg:items-center">
              {/* Search Bar */}
              <div className="w-full lg:w-auto lg:flex-1">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onSubmit={handleSearch}
                  placeholder="Search invoices..."
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Supplier Filter */}
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Suppliers" },
                      ...(suppliersData?.data || []).map((supplier) => ({
                        id: supplier.id,
                        name: supplier.name,
                      })),
                    ]}
                    value={supplierFilter}
                    onChange={(value) => {
                      setSupplierFilter(String(value));
                      setPage(1);
                    }}
                    placeholder="All Suppliers"
                    searchable={true}
                  />
                </div>

                {/* Payment Status Filter */}
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Statuses" },
                      { id: PaymentStatus.PAID, name: "Paid" },
                      { id: PaymentStatus.UNPAID, name: "Unpaid" },
                      { id: PaymentStatus.PARTIAL, name: "Partial" },
                    ]}
                    value={paymentStatusFilter}
                    onChange={(value) => {
                      setPaymentStatusFilter(String(value));
                      setPage(1);
                    }}
                    placeholder="All Statuses"
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          }
        >
          <PurchaseInvoiceTable
            invoices={data?.data ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
            onView={handleViewClick}
            onDelete={handleDeleteClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.meta?.totalItems ?? data?.data?.length ?? 0}
              onPageChange={setPage}
            />
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default PurchaseInvoicePage;
