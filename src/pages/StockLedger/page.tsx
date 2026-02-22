import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import StockLedgerTable from "../../components/tables/BasicTables/StockLedger";
import { useGetAllStockLedgerQuery } from "../../redux/services/stockLedger";
import DatePicker from "../../components/form/date-picker";

const StockLedgerPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const skip = (page - 1) * limit;
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { data, isLoading } = useGetAllStockLedgerQuery({
    search: search || undefined,
    limit,
    skip,
    start_date: startDate,
    end_date: endDate,
  });

  const handleStartDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T00:00:00`;
      setStartDate(formatted);
      setPage(1);
    } else {
      setStartDate(undefined);
    }
  };

  const handleEndDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T00:00:00`;
      setEndDate(formatted);
      setPage(1);
    } else {
      setEndDate(undefined);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  return (
    <>
      <PageMeta title="Stock Ledger" description="Stock ledger page" />
      <PageBreadcrumb pageTitle="Stock Ledger" />
      <div className="space-y-6">
        <SimpleComponentCard
          title="Stock Ledger"
          extra={
            <div className="flex gap-3 items-end flex-wrap">
              <div className="w-44">
                <DatePicker
                  id="stock-start-date"
                  label="Start Date"
                  placeholder="Start date"
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="w-44">
                <DatePicker
                  id="stock-end-date"
                  label="End Date"
                  placeholder="End date"
                  onChange={handleEndDateChange}
                />
              </div>
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={handleSearch}
                placeholder="Search..."
              />
            </div>
          }
        >
          <StockLedgerTable
            entries={data?.data ?? []}
            loading={isLoading}
            totals={data?.total_dic}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.count ?? 0}
              onPageChange={setPage}
            />
          </div>
        </SimpleComponentCard>
      </div>
    </>
  );
};

export default StockLedgerPage;
