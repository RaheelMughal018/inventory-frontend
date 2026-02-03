import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "sonner";
import ExpenseCategoryTable from "../../components/tables/BasicTables/ExpenseCategoryTable";
import {
  ExpenseCategory,
  CreateExpenseCategory,
  useCreateExpenseCategoryMutation,
  useGetAllExpenseCategoriesQuery,
  useUpdateExpenseCategoryMutation,
} from "../../redux/services/expenseCategory";
import { ExpenseCategoryFormData } from "../../components/modals/ExpenseCategoryModal";
import ExpenseCategoryModal from "../../components/modals/ExpenseCategoryModal";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

const ExpenseCategoryPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;

  const { data, isLoading } = useGetAllExpenseCategoriesQuery({
    search: search || undefined,
    limit,
    skip,
  });
  const [createCategory] = useCreateExpenseCategoryMutation();
  const [updateCategory] = useUpdateExpenseCategoryMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);

  const handleExportCSV = () => {
    toast.info("Export feature coming soon");
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handleAddCategory = async (formData: ExpenseCategoryFormData) => {
    try {
      const payload: CreateExpenseCategory = { name: formData.name };
      const res = await createCategory(payload).unwrap();
      if (res) toast.success(`${res.name} created successfully`);
      setIsAddModalOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Error creating expense category");
    }
  };

  const handleEditCategory = async (formData: ExpenseCategoryFormData) => {
    if (!selectedCategory) return;
    try {
      const payload: CreateExpenseCategory = { name: formData.name };
      const res = await updateCategory({
        id: selectedCategory.id,
        ...payload,
      }).unwrap();
      if (res) toast.success(`${res.name} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Error updating expense category");
    }
  };

  const handleEditClick = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Expense Categories"
        description="Manage expense categories (bills, bike repair, etc.)"
      />
      <PageBreadcrumb pageTitle="Expense Categories" />
      <div className="space-y-6">
        <ComponentCard
          title="Expense Categories"
          exportButtonText="Export CSV"
          addButtonText="Add Expense Category"
          onExportClick={handleExportCSV}
          onAddClick={() => setIsAddModalOpen(true)}
          extra={
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={handleSearch}
                placeholder="Search categories..."
              />
            </div>
          }
        >
          <ExpenseCategoryTable
            categories={data?.categories ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
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

      <ExpenseCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCategory}
        mode="add"
      />
      <ExpenseCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleEditCategory}
        initialData={selectedCategory}
        mode="edit"
      />
    </>
  );
};

export default ExpenseCategoryPage;
