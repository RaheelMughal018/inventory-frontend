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
  useGetItemSummaryQuery,
  useUpdateItemMutation,
} from "../../redux/services/item";
import { ItemFormData } from "../../components/modals/ItemModal";
import ItemModal from "../../components/modals/ItemModal";
import { useGetAllCategoriesQuery } from "../../redux/services/category";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import SelectDropdown from "../../components/form/SelectDropdown";
import { generateItemsPDF } from "../../helper/pdf_generator";

const ItemPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(30);

  const [categoryFilterSearch, setCategoryFilterSearch] = useState("");
  const { data: categoriesFilterData } = useGetAllCategoriesQuery({
    page: 1,
    limit: 30,
    search: categoryFilterSearch || undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const { data: categoriesModalData } = useGetAllCategoriesQuery({
    page: 1,
    limit: 100,
  });
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

  const { data: summaryData } = useGetItemSummaryQuery();
  const summary = summaryData?.data;

  // Handle export as PDF (all items, simple table)
  const handleExportPDF = async () => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api/v1";

      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100000");
      if (search) params.set("search", search);
      if (itemTypeFilter) params.set("item_type", itemTypeFilter);
      if (categoryFilter) params.set("category_id", categoryFilter);
      if (stockStatusFilter) params.set("stock_status", stockStatusFilter);

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_BASE_URL}/items?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch items (${response.status})`);
      }

      const json = await response.json();
      // Response may be { data: Item[] } or { data: { data: Item[] } }
      const rawData = json?.data;
      const allItems =
        Array.isArray(rawData) && rawData.length
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

      generateItemsPDF(allItems);
      handleApiSuccess("Items PDF generated successfully");
    } catch (error) {
      handleApiError(error, "Failed to generate items PDF");
    }
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
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Total Stock Value</p>
              <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
                {Number(summary.total_stock_value).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Total Units in Stock</p>
              <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
                {Number(summary.total_units).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Items In Stock</p>
              <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
                {summary.in_stock_count} <span className="text-sm font-normal text-gray-400">/ {summary.total_items}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Raw / Final</p>
              <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
                {summary.raw_count} <span className="text-sm font-normal text-gray-400">/ {summary.final_count}</span>
              </p>
            </div>
          </div>
        )}

        <ComponentCard
          title="Item Table"
          exportButtonText="Export Items PDF"
          addButtonText="Add New Item"
          onExportClick={handleExportPDF}
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

                {/* Category Filter - search triggers API with pagination */}
                <div className="w-full sm:w-48">
                  <SelectDropdown
                    options={[
                      { id: "", name: "All Categories" },
                      ...(categoriesFilterData?.data || []).map((cat) => ({
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
                    onSearchChange={setCategoryFilterSearch}
                    optionsAreFiltered={true}
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
              total={itemsData?.meta?.totalItems ?? 0}
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
        categories={categoriesModalData?.data ?? []}
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
        categories={categoriesModalData?.data ?? []}
        categoryId={selectedCategoryId}
      />
    </>
  );
};

export default ItemPage;
