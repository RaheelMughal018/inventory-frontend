import { useState, useMemo } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ExpenseTable from "../../components/tables/BasicTables/ExpenseTable";
import ExpenseBulkModal from "../../components/modals/ExpenseBulkModal";
import {
  useGetAllExpensesQuery,
  useCreateBulkByDayMutation,
  BulkExpensesByDay,
  Expense,
} from "../../redux/services/expense";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { useGetAllExpenseCategoriesQuery } from "../../redux/services/expenseCategory";
import DatePicker from "../../components/form/date-picker";
import SelectDropdown from "../../components/form/SelectDropdown";
import SearchBar from "../../components/common/SearchBar";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import Label from "../../components/form/Label";

const ExpensePage = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [categoryFilterId, setCategoryFilterId] = useState<number | "all">("all");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const { data: expensesData, isLoading } = useGetAllExpensesQuery({
    from: fromDate || undefined,
    to: toDate || undefined,
    search: search.trim() || undefined,
  });
  const [createBulkByDay] = useCreateBulkByDayMutation();
  const { data: accountsData } = useGetAllAccountsQuery({});
  const { data: categoriesData } = useGetAllExpenseCategoriesQuery();

  const expenses = useMemo((): Expense[] => {
    const raw = expensesData ?? [];
    if (categoryFilterId === "all") return raw;
    return raw.filter((e) => e.category_id === categoryFilterId);
  }, [expensesData, categoryFilterId]);

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const handleBulkExpenses = async (payload: BulkExpensesByDay) => {
    try {
      await createBulkByDay(payload).unwrap();
      handleApiSuccess(`${payload.expenses.length} expense(s) added successfully`);
      setIsBulkModalOpen(false);
    } catch (error: unknown) {
      handleApiError(error, "Failed to add bulk expenses");
    }
  };

  const accounts = accountsData?.data ?? [];
  const categories = categoriesData ?? [];

  const accountOptions = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
  }));
  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));
  const categoryFilterOptions: { id: number | "all"; name: string }[] = [
    { id: "all", name: "All Categories" },
    ...categoryOptions,
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
                onSubmit={() => {}}
                placeholder="Search description, notes, category, account..."
              />
              <div className="w-44">
                <Label>From</Label>
                <DatePicker
                  id="expense-from-date"
                  placeholder="From date"
                  onChange={(_selectedDates, dateStr) => setFromDate(dateStr || "")}
                />
              </div>
              <div className="w-44">
                <Label>To</Label>
                <DatePicker
                  id="expense-to-date"
                  placeholder="To date"
                  onChange={(_selectedDates, dateStr) => setToDate(dateStr || "")}
                />
              </div>
              <div className="w-48">
                <SelectDropdown
                  options={categoryFilterOptions}
                  value={categoryFilterId}
                  onChange={(value) =>
                    setCategoryFilterId(value === "all" ? "all" : Number(value))
                  }
                  placeholder="Filter by category..."
                  searchable
                />
              </div>
            </div>
          }
        >
          <ExpenseTable
            expenses={expenses}
            loading={isLoading}
            totalAmount={totalAmount}
          />
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
