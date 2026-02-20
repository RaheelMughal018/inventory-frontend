import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import PaymentsTable from "../../components/tables/BasicTables/PaymentsTable";
import { useGetPaymentsQuery } from "../../redux/services/payment";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";
import SearchBar from "../../components/common/SearchBar";
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";
import { useGetAllAccountsQuery } from "../../redux/services/account";

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [accountId, setAccountId] = useState<number | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading } = useGetPaymentsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    supplier_id: supplierId === "" ? undefined : supplierId,
    account_id: accountId === "" ? undefined : accountId,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const { data: suppliersData } = useGetAllSuppliersQuery({});
  const { data: accountsData } = useGetAllAccountsQuery({});

  const payments = data?.data ?? [];
  const meta = data?.meta;
  const totalItems = meta?.totalItems ?? 0;

  const supplierOptions =
    suppliersData?.data?.map((s) => ({ id: s.id, name: s.name })) ?? [];
  const accountOptions =
    accountsData?.data?.map((a) => ({ id: a.id, name: a.name })) ?? [];

  

  return (
    <>
      <PageMeta title="Payments" description="View and manage supplier payments" />
      <PageBreadcrumb pageTitle="Payments" />

      <div className="space-y-6">
        <ComponentCard
          title="Payments"
          addButtonText="Add Payment"
          onAddClick={() => navigate("/payments/create")}
          extra={
            <div className="flex flex-wrap items-end gap-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={() => setPage(1)}
                placeholder="Search by payment # or supplier..."
              />
              <div className="w-44">
                <Label>Supplier</Label>
                <SelectDropdown
                  options={[{ id: "" as const, name: "All" }, ...supplierOptions]}
                  value={supplierId}
                  onChange={(v) => {
                    setSupplierId(v === "" ? "" : Number(v));
                    setPage(1);
                  }}
                  placeholder="All suppliers"
                  searchable
                />
              </div>
              <div className="w-44">
                <Label>Account</Label>
                <SelectDropdown
                  options={[{ id: "" as const, name: "All" }, ...accountOptions]}
                  value={accountId}
                  onChange={(v) => {
                    setAccountId(v === "" ? "" : Number(v));
                    setPage(1);
                  }}
                  placeholder="All accounts"
                  searchable
                />
              </div>
              
              <div className="w-40">
                <Label>From</Label>
                <DatePicker
                  id="payments-from"
                  placeholder="From date"
                  onChange={(_d, dateStr) => {
                    setFromDate(dateStr ?? "");
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-40">
                <Label>To</Label>
                <DatePicker
                  id="payments-to"
                  placeholder="To date"
                  onChange={(_d, dateStr) => {
                    setToDate(dateStr ?? "");
                    setPage(1);
                  }}
                />
              </div>
            </div>
          }
        >
          <PaymentsTable payments={payments} loading={isLoading} />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={totalItems}
              onPageChange={setPage}
            />
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default PaymentsPage;
