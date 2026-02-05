import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ItemsTable from "../../components/tables/BasicTables/ItemsTable";
import {
  CreateItem,
  Item,
  ItemType,
  useCreateItemMutation,
  useGetAllItemsQuery,
  useUpdateItemMutation,
} from "../../redux/services/item";
import { ItemFormData } from "../../components/modals/ItemModal";
import ItemModal from "../../components/modals/ItemModal";
import { useGetAllCategoriesQuery } from "../../redux/services/category";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const ItemPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const skip = (page - 1) * limit;

  const { data: categoriesData } = useGetAllCategoriesQuery({});
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  
  // Add state for modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | "">("");
  
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery({
    search: search || undefined,
    limit,
    skip,
    item_type: itemTypeFilter || undefined,
  });

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting items to CSV");
    // Your export logic here
  };

  const handleSearch = () => {
    setPage(1);
  };

  // Handle form submission for adding
  const handleAddItem = async (itemData: ItemFormData) => {
    try {
      const payload: CreateItem = {
        name: itemData.name,
        type: itemData.type,
        unit_type: itemData.unit_type,
        category_id: itemData.category_id,
      };

      const res = await createItem(payload).unwrap();
      if (res) handleApiSuccess(`${res.name} is created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create item");
    }
  };

  // Handle form submission for editing
  const handleEditItem = async (itemData: ItemFormData) => {
    if (!selectedItem) return;

    try {
      const payload: CreateItem = {
        name: itemData.name,
        type: itemData.type,
        unit_type: itemData.unit_type,
        category_id: itemData.category_id,
      };

      const res = await updateItem({
        id: selectedItem.id,
        ...payload,
      }).unwrap();
      if (res) handleApiSuccess(`${res.name} is updated successfully`);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      setSelectedCategoryId("");
    } catch (error) {
      handleApiError(error, "Failed to update item");
    }
  };

  // Handle edit button click
  const handleEditClick = (item: Item) => {
    setSelectedItem(item);
    // Use category_id from the item
    setSelectedCategoryId(item.category_id || "");
    setIsEditModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Items"
        description="Items page where you can check your list of items"
      />

      <PageBreadcrumb pageTitle="Items" />
      <div className="space-y-6">
        <ComponentCard
          title="Item Table"
          exportButtonText="Export Items CSV"
          addButtonText="Add New Item"
          onExportClick={handleExportCSV}
          onAddClick={() => setIsAddModalOpen(true)}
          extra={
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSubmit={handleSearch}
                placeholder="Search items..."
              />
                <select
                value={itemTypeFilter}
                onChange={(e) => {
                  setItemTypeFilter(e.target.value as ItemType | "");
                  setPage(1);
                }}
                className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="">All Types</option>
                <option value={ItemType.FINAL_PRODUCT}>Final Product</option>
                <option value={ItemType.RAW_MATERIAL}>Raw Material</option>
              </select>
            </div>
          }
        >
          <ItemsTable
            items={itemsData?.items ?? []}
            loading={itemsLoading}
            onEdit={handleEditClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={itemsData?.total ?? 0}
              onPageChange={setPage}
            />
          </div>
        </ComponentCard>
      </div>

      {/* Modal - Opens when "Add New Item" button is clicked */}
      <ItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
        mode="add"
        categories={categoriesData?.categories ?? []}
      />

      {/* Modal - Opens when edit button is clicked */}
      <ItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          setSelectedCategoryId("");
        }}
        onSubmit={handleEditItem}
        initialData={selectedItem}
        mode="edit"
        categories={categoriesData?.categories ?? []}
        categoryId={selectedCategoryId}
      />
    </>
  );
};

export default ItemPage;
