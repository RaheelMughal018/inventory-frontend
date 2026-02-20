import { useState, useMemo } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ExpenseCategoryTable from "../../components/tables/BasicTables/ExpenseCategoryTable";
import {
  CreateExpenseCategory,
  ExpenseCategory,
  useCreateExpenseCategoryMutation,
  useGetAllExpenseCategoriesQuery,
  useUpdateExpenseCategoryMutation,
} from "../../redux/services/expenseCategory";
import { ExpenseCategoryFormData } from "../../components/modals/ExpenseCategoryModal";
import ExpenseCategoryModal from "../../components/modals/ExpenseCategoryModal";
import SearchBar from "../../components/common/SearchBar";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const ExpenseCategoryPage = () => {
  const [search, setSearch] = useState("");

  const { data: categoriesData, isLoading } = useGetAllExpenseCategoriesQuery();
  const [createCategory] = useCreateExpenseCategoryMutation();
  const [updateCategory] = useUpdateExpenseCategoryMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data ?? [];

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.trim().toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description ?? "").toLowerCase().includes(term)
    );
  }, [categories, search]);

  const handleExportCSV = () => {
    handleApiSuccess("Export feature coming soon");
  };

  const handleAddCategory = async (formData: ExpenseCategoryFormData) => {
    try {
      const payload: CreateExpenseCategory = {
        name: formData.name,
        description: formData.description,
      };
      const res = await createCategory(payload).unwrap();
      handleApiSuccess(`${(res as ExpenseCategory).name} created successfully`);
      setIsAddModalOpen(false);
    } catch (error: unknown) {
      handleApiError(error, "Failed to create expense category");
    }
  };

  const handleEditCategory = async (formData: ExpenseCategoryFormData) => {
    if (!selectedCategory) return;
    try {
      const res = await updateCategory({
        id: selectedCategory.id,
        data: { name: formData.name, description: formData.description },
      }).unwrap();
      handleApiSuccess(`${(res as ExpenseCategory).name} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      handleApiError(error, "Failed to update expense category");
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
        description="Manage expense categories (Utilities, Office supplies, etc.)"
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
                onSubmit={() => {}}
                placeholder="Search categories..."
              />
            </div>
          }
        >
          <ExpenseCategoryTable
            categories={filteredCategories}
            loading={isLoading}
            onEdit={handleEditClick}
          />
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
        initialData={selectedCategory ?? undefined}
        mode="edit"
      />
    </>
  );
};

export default ExpenseCategoryPage;
