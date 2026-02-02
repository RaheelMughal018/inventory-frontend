// pages/AccountPage.tsx
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import FinancialLedgerTable from "../../components/tables/BasicTables/FinancialLedger";
import { useGetAllFinancialLedgerQuery } from "../../redux/services/financialLedger";



const FinancialLedgerPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;

  const { data, isLoading } = useGetAllFinancialLedgerQuery({
    search: search || undefined,
    limit,
    skip,
  });

 

  // Handle search
  const handleSearch = () => {
    setPage(1);
  };


 

 

  

  return (
    <>
      <PageMeta title="Financial-Ledger" description="Financial-ledger page" />
      <PageBreadcrumb pageTitle="Financial" />
      <div className="space-y-6">
        <SimpleComponentCard
          title="Financial-Ledger"
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
              placeholder="Search..." 
            />
          }
        >
          <FinancialLedgerTable
            ledgers={data?.data ?? []}
            loading={isLoading}
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

export default FinancialLedgerPage;
