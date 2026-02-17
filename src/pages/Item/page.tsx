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
import SelectDropdown from "../../components/form/SelectDropdown";

const ItemPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: categoriesData } = useGetAllCategoriesQuery({});
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  
  // Add state for modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  
  // Filter states
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("");
  
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery({
    search: search || undefined,
    limit,
    page,
    item_type: itemTypeFilter ? (itemTypeFilter as ItemType) : undefined,
    category_id: categoryFilter ? Number(categoryFilter) : undefined,
    stock_status: stockStatusFilter ? (stockStatusFilter as 'in_stock' | 'out_of_stock') : undefined,
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
        item_type: itemData.item_type,
        unit_type: itemData.unit_type,
        category_id: itemData.category_id,
      };

      const res = await createItem(payload).unwrap();
      if (res) handleApiSuccess(`${res.data.name} is created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create item");
    }
  };

  // Handle form submission for editing
  const handleEditItem = async (itemData: ItemFormData) => {
    if (!selectedItem) return;

    try {
      const payload = {
        name: itemData.name,
        category_id: itemData.category_id,
      };

      const res = await updateItem({
        id: selectedItem.id,
        ...payload,
      }).unwrap();
      if (res) handleApiSuccess(`${res.data.name} is updated successfully`);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      setSelectedCategoryId(0);
    } catch (error) {
      handleApiError(error, "Failed to update item");
    }
  };

  // Handle edit button click
  const handleEditClick = (item: Item) => {
    setSelectedItem(item);
    // Use category_id from the item
    setSelectedCategoryId(item.category_id || 0);
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
            <div className="flex flex-col lg:flex-row gap-3 w-full lg:items-center">
              {/* Search Bar */}
              <div className="w-full lg:w-auto lg:flex-1">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onSubmit={handleSearch}
                  placeholder="Search items..."
                />
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Item Type Filter */}
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Types" },
                      { id: ItemType.RAW, name: "Raw Material" },
                      { id: ItemType.FINAL, name: "Final Product" },
                    ]}
                    value={itemTypeFilter}
                    onChange={(value) => {
                      setItemTypeFilter(String(value));
                      setPage(1);
                    }}
                    placeholder="All Types"
                    searchable={false}
                  />
                </div>

                {/* Category Filter */}
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Categories" },
                      ...(categoriesData?.data || []).map((cat) => ({
                        id: cat.id,
                        name: cat.name,
                      })),
                    ]}
                    value={categoryFilter}
                    onChange={(value) => {
                      setCategoryFilter(String(value));
                      setPage(1);
                    }}
                    placeholder="All Categories"
                    searchable={true}
                  />
                </div>

                {/* Stock Status Filter */}
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Stock Status" },
                      { id: "in_stock", name: "In Stock" },
                      { id: "out_of_stock", name: "Out of Stock" },
                    ]}
                    value={stockStatusFilter}
                    onChange={(value) => {
                      setStockStatusFilter(String(value));
                      setPage(1);
                    }}
                    placeholder="All Stock Status"
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          }
        >
          <ItemsTable
            items={itemsData?.data ?? []}
            loading={itemsLoading}
            onEdit={handleEditClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={itemsData?.meta?.totalItems ?? itemsData?.data?.length ?? 0}
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
        categories={categoriesData?.data ?? []}
      />

      {/* Modal - Opens when edit button is clicked */}
      <ItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          setSelectedCategoryId(0);
        }}
        onSubmit={handleEditItem}
        initialData={selectedItem}
        mode="edit"
        categories={categoriesData?.data ?? []}
        categoryId={selectedCategoryId}
      />
    </>
  );
};

export default ItemPage;
