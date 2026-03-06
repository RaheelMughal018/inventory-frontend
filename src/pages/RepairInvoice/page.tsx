import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import SelectDropdown from "../../components/form/SelectDropdown";
import {
  useGetAllRepairInvoicesQuery,
  RepairInvoice,
  RepairStatus,
} from "../../redux/services/repairInvoice";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import RepairInvoiceTable from "../../components/tables/BasicTables/RepairInvoiceTable";
import { handleApiSuccess } from "../../helper/error_handler";

const REPAIR_STATUS_OPTIONS: { id: string; name: string }[] = [
  { id: "", name: "All statuses" },
  { id: "PENDING", name: "Pending" },
  { id: "IN_PROGRESS", name: "In Progress" },
  { id: "COMPLETED", name: "Completed" },
  { id: "DELIVERED", name: "Delivered" },
];

const RepairInvoicePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>("");
  const [focFilter, setFocFilter] = useState<string>("");

  const { data: customersData } = useGetAllCustomersQuery({});

  const { data, isLoading } = useGetAllRepairInvoicesQuery({
    page,
    limit,
    customer_id: customerFilter ? Number(customerFilter) : undefined,
    repair_status: repairStatusFilter ? (repairStatusFilter as RepairStatus) : undefined,
    is_foc: focFilter === "true" ? true : focFilter === "false" ? false : undefined,
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
              <div className="w-full sm:w-36">
                <SelectDropdown
                  options={[
                    { id: "", name: "All" },
                    { id: "false", name: "Paid" },
                    { id: "true", name: "FOC" },
                  ]}
                  value={focFilter}
                  onChange={(value) => {
                    setFocFilter(String(value));
                    setPage(1);
                  }}
                  placeholder="FOC / Paid"
                  searchable={false}
                />
              </div>
            </div>
          }
        >
          <RepairInvoiceTable
            invoices={data?.data ?? []}
            loading={isLoading}
            onView={handleView}
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

export default RepairInvoicePage;
