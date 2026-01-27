import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "sonner";
import CategoryTable from "../../components/tables/BasicTables/CategoryTable";
import { Category, CreateCategory, useCreateCategoryMutation, useGetAllCategorysQuery, useUpdateCategoryMutation } from "../../redux/services/category";
import { CategoryFormData } from "../../components/modals/CategoryModal";
import CategoryModal from "../../components/modals/CategoryModal";

const CategoryPage = () => {
  const { data, isLoading } = useGetAllCategorysQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  // Add state for modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting customers to CSV");
    // Your export logic here
  };

  // Handle form submission
  const handleAddCategory = async (categoryData: CategoryFormData) => {
    try {
      const payload: CreateCategory = {
        name: categoryData.name,
      };

      const res = await createCategory(payload).unwrap();
      if (res) toast.success(`${res.name} is created successfully`);
    } catch (error) {
      console.log("🚀 ~ handleAddCustomer ~ error:", error);
      toast.error("Error while creating customer");
    }

    // Close modal after submission
    setIsAddModalOpen(false);
  };

  const handleEditCategory = async (categoryData: CategoryFormData) => {
    if (!selectedCategory) return;

    try {
      const payload: CreateCategory = {
        name: categoryData.name
      };

      const res = await updateCategory({
        id: selectedCategory.id,
        ...payload,
      }).unwrap();
      if (res) toast.success(`${res.name} is updated successfully`);
    } catch (error) {
      console.log("🚀 ~ handleEditCustomer ~ error:", error);
      toast.error("Error while updating category");
    }

    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Categories"
        description="Categories page where you can check your list of categories"
      />

      <PageBreadcrumb pageTitle="Categories" />
      <div className="space-y-6">
        <ComponentCard
          title="Category Table"
          exportButtonText="Export Category CSV"
          addButtonText="Add New Category"
          onExportClick={handleExportCSV} // Connect export handler
          onAddClick={() => setIsAddModalOpen(true)} // Open modal on click!
        >
          <CategoryTable
            categories={data?.categories ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
          />
        </ComponentCard>
      </div>

      {/* Modal - Opens when "Add New Customer" button is clicked */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCategory}
        mode="add"
      />

      {/* Modal - Opens when edit button is clicked */}
      <CategoryModal
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

export default CategoryPage;
