import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import SelectDropdown from "../../components/form/SelectDropdown";
import {
  useGetAllSaleInvoicesQuery,
  SaleInvoice,
  PaymentStatus,
} from "../../redux/services/saleInvoice";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import SaleInvoiceTable from "../../components/tables/BasicTables/SaleInvoiceTable";
import { handleApiSuccess } from "../../helper/error_handler";

const SaleInvoicePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: customersData } = useGetAllCustomersQuery({});

  const { data, isLoading } = useGetAllSaleInvoicesQuery({
    search: search || undefined,
    limit,
    page,
    customer_id: customerFilter ? Number(customerFilter) : undefined,
    payment_status: paymentStatusFilter
      ? (paymentStatusFilter as PaymentStatus)
      : undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const handleExportCSV = () => {
    handleApiSuccess("Export feature coming soon");
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleAddNewInvoice = () => {
    navigate("/sale-invoices/create");
  };

  const handleViewClick = (invoice: SaleInvoice) => {
    navigate(`/sale-invoices/view/${invoice.id}`);
  };

  return (
    <>
      <PageMeta
        title="Sale Invoices"
        description="Manage your sale invoices"
      />
      <PageBreadcrumb pageTitle="Sale Invoices" />
      <div className="space-y-6">
        <ComponentCard
          title="Sale Invoices"
          exportButtonText="Export Invoices CSV"
          addButtonText="Add New Invoice"
          onExportClick={handleExportCSV}
          onAddClick={handleAddNewInvoice}
          extra={
            <div className="flex flex-col lg:flex-row gap-3 w-full lg:items-center">
              <div className="w-full lg:w-auto lg:flex-1">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onSubmit={handleSearch}
                  placeholder="Search invoices..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Customers" },
                      ...(customersData?.data || []).map((customer) => ({
                        id: customer.id,
                        name: customer.name,
                      })),
                    ]}
                    value={customerFilter}
                    onChange={(value) => {
                      setCustomerFilter(String(value));
                      setPage(1);
                    }}
                    placeholder="All Customers"
                    searchable={true}
                  />
                </div>
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
                <DateRangeFilter
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromChange={(v) => {
                    setFromDate(v);
                    setPage(1);
                  }}
                  onToChange={(v) => {
                    setToDate(v);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          }
        >
          <SaleInvoiceTable
            invoices={data?.data ?? []}
            loading={isLoading}
            onView={handleViewClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.meta?.totalItems ?? 0}
              onPageChange={setPage}
            />
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default SaleInvoicePage;
