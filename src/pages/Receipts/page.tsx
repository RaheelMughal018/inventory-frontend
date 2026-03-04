import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import ReceiptsTable from "../../components/tables/BasicTables/ReceiptsTable";
import { useGetAllReceiptsQuery } from "../../redux/services/receipt";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";
import SearchBar from "../../components/common/SearchBar";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import { useGetAllAccountsQuery } from "../../redux/services/account";

const ReceiptsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [accountId, setAccountId] = useState<number | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading } = useGetAllReceiptsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    customer_id: customerId === "" ? undefined : customerId,
    account_id: accountId === "" ? undefined : accountId,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const { data: customersData } = useGetAllCustomersQuery({});
  const { data: accountsData } = useGetAllAccountsQuery({});

  const receipts = data?.data ?? [];
  const totalItems = data?.meta?.totalItems ?? 0;

  const customerOptions =
    customersData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];
  const accountOptions =
    accountsData?.data?.map((a) => ({ id: a.id, name: a.name })) ?? [];

  return (
    <>
      <PageMeta
        title="Receipts"
        description="View and manage customer receipts (received amount without invoice)"
      />
      <PageBreadcrumb pageTitle="Receipts" />

      <div className="space-y-6">
        <ComponentCard
          title="Receipts"
          addButtonText="Add Receipt"
          onAddClick={() => navigate("/receipts/create")}
          extra={
            <div className="flex flex-wrap items-end gap-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={() => setPage(1)}
                placeholder="Search by receipt # or customer..."
              />
              <div className="w-44">
                <Label>Customer</Label>
                <SelectDropdown
                  options={[
                    { id: "" as const, name: "All" },
                    ...customerOptions,
                  ]}
                  value={customerId}
                  onChange={(v) => {
                    setCustomerId(v === "" ? "" : Number(v));
                    setPage(1);
                  }}
                  placeholder="All customers"
                  searchable
                />
              </div>
              <div className="w-44">
                <Label>Account</Label>
                <SelectDropdown
                  options={[
                    { id: "" as const, name: "All" },
                    ...accountOptions,
                  ]}
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
                  id="receipts-from"
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
                  id="receipts-to"
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
          <ReceiptsTable
            receipts={receipts}
            loading={isLoading}
            onView={(receipt) => navigate(`/receipts/view/${receipt.id}`)}
          />
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

export default ReceiptsPage;
