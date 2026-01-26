import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CategoriesTable from "../../components/tables/BasicTables/CategoriesTable";
import AddCategoryModal, {
  CategoryFormData,
} from "../../components/modals/AddCategoryModal";
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  Category,
} from "../../redux/services/category";
import { toast } from "sonner";

const CategoryPage = () => {
  const { data, isLoading, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Handle export CSV
  const handleExportCSV = () => {
    try {
      if (!data?.categories || data.categories.length === 0) {
        toast.info("No categories to export");
        return;
      }

      // Prepare CSV data
      const headers = ["ID", "Name", "Created At"];
      const rows = data.categories.map((cat) => [
        cat.id,
        cat.name,
        new Date(cat.created_at).toLocaleDateString(),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `categories_${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Categories exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export categories");
    }
  };

  // Handle form submission for add/edit
  const handleSubmitCategory = async (formData: CategoryFormData) => {
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory({
          id: editingCategory.id,
          ...formData,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await createCategory(formData).unwrap();
        toast.success("Category added successfully");
      }

      // Close modal and reset
      setIsAddModalOpen(false);
      setEditingCategory(null);

      // Refresh data
      refetch();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error?.data?.message || "Failed to save category");
    }
  };

  // Handle edit click
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
  };

  // Handle add new click
  const handleAddNewClick = () => {
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Categories"
        description="Manage your product categories"
      />

      <PageBreadcrumb pageTitle="Item Categories" />
      <div className="space-y-6">
        <ComponentCard
          title="Categories"
          exportButtonText="Export Categories CSV"
          addButtonText="Add New Category"
          onExportClick={handleExportCSV}
          onAddClick={handleAddNewClick}
        >
          <CategoriesTable
            categories={data?.categories ?? []}
            loading={isLoading}
            onEdit={handleEditCategory}
          />
        </ComponentCard>
      </div>

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
        editingCategory={editingCategory}
        isLoading={isCreating || isUpdating}
      />
    </>
  );
};

export default CategoryPage;
