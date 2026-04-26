import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import SelectDropdown from "../../components/form/SelectDropdown";
import {
  useGetAllRepairInvoicesQuery,
  useUpdateRepairInvoiceMutation,
  RepairInvoice,
  RepairStatus,
  PaymentStatusRepair,
  UpdateRepairInvoiceDto,
} from "../../redux/services/repairInvoice";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import RepairInvoiceTable from "../../components/tables/BasicTables/RepairInvoiceTable";
import DateRangeFilter from "../../components/common/DateRangeFilter";
import EditRepairInvoiceModal from "../../components/modals/EditRepairInvoiceModal";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const REPAIR_STATUS_OPTIONS: { id: string; name: string }[] = [
  { id: "", name: "All statuses" },
  { id: "PENDING", name: "Pending" },
  { id: "IN_PROGRESS", name: "In Progress" },
  { id: "COMPLETED", name: "Completed" },
  { id: "DELIVERED", name: "Delivered" },
];

const PAYMENT_STATUS_OPTIONS: { id: string; name: string }[] = [
  { id: "", name: "All payments" },
  { id: "PAID", name: "Paid" },
  { id: "PARTIAL", name: "Partial" },
  { id: "UNPAID", name: "Unpaid" },
];

const FOC_OPTIONS: { id: string; name: string }[] = [
  { id: "", name: "All (FOC + Charged)" },
  { id: "false", name: "Charged only" },
  { id: "true", name: "FOC only" },
];

const RepairInvoicePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [focFilter, setFocFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: customersData } = useGetAllCustomersQuery({});

  const [editingInvoice, setEditingInvoice] = useState<RepairInvoice | null>(null);
  const [updateRepairInvoice, { isLoading: isUpdating }] = useUpdateRepairInvoiceMutation();

  const { data, isLoading } = useGetAllRepairInvoicesQuery({
    page,
    limit,
    customer_id: customerFilter ? Number(customerFilter) : undefined,
    repair_status: repairStatusFilter ? (repairStatusFilter as RepairStatus) : undefined,
    payment_status: paymentStatusFilter
      ? (paymentStatusFilter as PaymentStatusRepair)
      : undefined,
    is_foc: focFilter === "true" ? true : focFilter === "false" ? false : undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const handleExportCSV = () => {
    handleApiSuccess("Export feature coming soon");
  };

  const handleAddNew = () => {
    navigate("/repair-invoices/create");
  };

  const handleView = (invoice: RepairInvoice) => {
    navigate(`/repair-invoices/view/${invoice.id}`);
  };

  const handleEdit = (invoice: RepairInvoice) => {
    setEditingInvoice(invoice);
  };

  const handleSubmitEdit = async (payload: UpdateRepairInvoiceDto) => {
    if (!editingInvoice) return;
    try {
      await updateRepairInvoice({ id: editingInvoice.id, body: payload }).unwrap();
      handleApiSuccess(`Repair invoice ${editingInvoice.invoice_number} updated`);
      setEditingInvoice(null);
    } catch (err) {
      handleApiError(err, "Failed to update repair invoice");
    }
  };

  const customerOptions = [
    { id: "", name: "All Customers" },
    ...(customersData?.data ?? []).map((c) => ({ id: String(c.id), name: c.name })),
  ];

  return (
    <>
      <PageMeta title="Repair Invoices" description="Manage repair invoices" />
      <PageBreadcrumb pageTitle="Repair Invoices" />
      <div className="space-y-6">
        <ComponentCard
          title="Repair Invoices"
          exportButtonText="Export CSV"
          addButtonText="Add Repair Invoice"
          onExportClick={handleExportCSV}
          onAddClick={handleAddNew}
          extra={
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-wrap">
              <div className="w-full sm:w-48">
                <SelectDropdown
                  options={customerOptions}
                  value={customerFilter}
                  onChange={(value) => {
                    setCustomerFilter(String(value));
                    setPage(1);
                  }}
                  placeholder="All Customers"
                  searchable
                />
              </div>
              <div className="w-full sm:w-40">
                <SelectDropdown
                  options={REPAIR_STATUS_OPTIONS}
                  value={repairStatusFilter}
                  onChange={(value) => {
                    setRepairStatusFilter(String(value));
                    setPage(1);
                  }}
                  placeholder="Repair status"
                  searchable={false}
                />
              </div>
              <div className="w-full sm:w-40">
                <SelectDropdown
                  options={PAYMENT_STATUS_OPTIONS}
                  value={paymentStatusFilter}
                  onChange={(value) => {
                    setPaymentStatusFilter(String(value));
                    setPage(1);
                  }}
                  placeholder="Payment status"
                  searchable={false}
                />
              </div>
              <div className="w-full sm:w-44">
                <SelectDropdown
                  options={FOC_OPTIONS}
                  value={focFilter}
                  onChange={(value) => {
                    setFocFilter(String(value));
                    setPage(1);
                  }}
                  placeholder="FOC / Charged"
                  searchable={false}
                />
              </div>
              <DateRangeFilter
                idSuffix="repair"
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
          }
        >
          <RepairInvoiceTable
            invoices={data?.data ?? []}
            loading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
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

      <EditRepairInvoiceModal
        isOpen={editingInvoice !== null}
        onClose={() => setEditingInvoice(null)}
        onSubmit={handleSubmitEdit}
        invoice={editingInvoice}
        isLoading={isUpdating}
      />
    </>
  );
};

export default RepairInvoicePage;
