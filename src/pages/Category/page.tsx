import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CategoryTable from "../../components/tables/BasicTables/CategoryTable";
import { Category, CreateCategory, useCreateCategoryMutation, useGetAllCategoriesQuery, useUpdateCategoryMutation } from "../../redux/services/category";
import { CategoryFormData } from "../../components/modals/CategoryModal";
import CategoryModal from "../../components/modals/CategoryModal";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const CategoryPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useGetAllCategoriesQuery({
    search: search || undefined,
    limit,
    page,
  });
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

  const handleSearch = () => {
    setPage(1);
  };

  // Handle form submission
  const handleAddCategory = async (categoryData: CategoryFormData) => {
    try {
      const payload: CreateCategory = {
        name: categoryData.name,
      };

      const res = await createCategory(payload).unwrap();
      if (res) handleApiSuccess(`${res.data.name} is created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create category");
    }
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
      if (res) handleApiSuccess(`${res.data.name} is updated successfully`);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      handleApiError(error, "Failed to update category");
    }
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
          <CategoryTable
            categories={data?.data ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.meta?.totalItems ?? 0}
              onPageChange={setPage}
            />
          </div>
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
