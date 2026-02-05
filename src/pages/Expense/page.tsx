import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import ExpenseTable from "../../components/tables/BasicTables/ExpenseTable";
import ExpenseBulkModal from "../../components/modals/ExpenseBulkModal";
import {
  useGetAllExpensesQuery,
  useCreateExpensesBulkMutation,
  ExpenseCreateBulk,
} from "../../redux/services/expense";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { useGetAllExpenseCategoriesQuery } from "../../redux/services/expenseCategory";
import DatePicker from "../../components/form/date-picker";
import SelectDropdown from "../../components/form/SelectDropdown";
import SearchBar from "../../components/common/SearchBar";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const ExpensePage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [expenseCategoryId, setExpenseCategoryId] = useState<string | null>(
    null
  );
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const { data, isLoading } = useGetAllExpensesQuery({
    limit,
    skip,
    search: search || undefined,
    start_date: startDate,
    end_date: endDate,
    expense_category_id: expenseCategoryId ?? undefined,
  });
  const [createExpensesBulk] = useCreateExpensesBulkMutation();
  const { data: accountsData } = useGetAllAccountsQuery({});
  const { data: categoriesData } = useGetAllExpenseCategoriesQuery({});

  const handleStartDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      setStartDate(formatted);
      setPage(1);
    } else {
      setStartDate(undefined);
    }
  };

  const handleEndDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      setEndDate(formatted);
      setPage(1);
    } else {
      setEndDate(undefined);
    }
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleBulkExpenses = async (payload: ExpenseCreateBulk) => {
    try {
      await createExpensesBulk(payload).unwrap();
      handleApiSuccess(`${payload.expenses.length} expense(s) added successfully`);
      setIsBulkModalOpen(false);
    } catch (error: unknown) {
      handleApiError(error, "Failed to add bulk expenses");
    }
  };

  const accountOptions =
    accountsData?.accounts?.map((acc) => ({
      id: acc.id,
      name: `${acc.name} - ${acc.type}`,
    })) ?? [];
  const categoryOptions =
    categoriesData?.categories?.map((cat) => ({
      id: cat.id,
      name: cat.name,
    })) ?? [];
  const expenseCategoryFilterOptions = [
    { id: "all", name: "All Categories" },
    ...(categoriesData?.categories?.map((c) => ({ id: c.id, name: c.name })) ??
      []),
  ];

  return (
    <>
      <PageMeta title="Expenses" description="Manage expenses" />
      <PageBreadcrumb pageTitle="Expenses" />
      <div className="space-y-6">
        <ComponentCard
          title="Expenses"
          addButtonText="Add expenses"
          onAddClick={() => setIsBulkModalOpen(true)}
          extra={
            <div className="flex gap-3 items-end flex-wrap">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={handleSearch}
                placeholder="Search by name or description..."
              />
              <div className="w-44">
                <DatePicker
                  id="expense-start-date"
                  label="Start Date"
                  placeholder="Start date"
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="w-44">
                <DatePicker
                  id="expense-end-date"
                  label="End Date"
                  placeholder="End date"
                  onChange={handleEndDateChange}
                />
              </div>
              <SelectDropdown
                options={expenseCategoryFilterOptions}
                value={expenseCategoryId ?? "all"}
                onChange={(value) => {
                  setExpenseCategoryId(value === "all" ? null : String(value));
                  setPage(1);
                }}
                placeholder="Filter by category..."
                searchable
                className="w-48"
              />
            </div>
          }
        >
          <ExpenseTable
            expenses={data?.expenses ?? []}
            loading={isLoading}
            totalAmount={data?.total_amount}
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

      <ExpenseBulkModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={handleBulkExpenses}
        accounts={accountOptions}
        expenseCategories={categoryOptions}
      />
    </>
  );
};

export default ExpensePage;
