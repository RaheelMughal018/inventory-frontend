import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "sonner";
import ItemsTable from "../../components/tables/BasicTables/ItemsTable";
import {
  CreateItem,
  Item,
  useCreateItemMutation,
  useGetAllItemsQuery,
  useUpdateItemMutation,
} from "../../redux/services/item";
import { ItemFormData } from "../../components/modals/ItemModal";
import ItemModal from "../../components/modals/ItemModal";
import { useGetAllCategorysQuery } from "../../redux/services/category";

const ItemPage = () => {
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery();
  const { data: categoriesData } = useGetAllCategorysQuery();
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();

  // Add state for modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting items to CSV");
    // Your export logic here
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
      if (res) {
        toast.success(`${res.name} is created successfully`);
      }
    } catch (error) {
      console.log("🚀 ~ handleAddItem ~ error:", error);
      toast.error("Error while creating item");
    }

    // Close modal after submission
    setIsAddModalOpen(false);
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
      if (res) {
        toast.success(`${res.name} is updated successfully`);
      }
    } catch (error) {
      console.log("🚀 ~ handleEditItem ~ error:", error);
      toast.error("Error while updating item");
    }

    // Close modal after submission
    setIsEditModalOpen(false);
    setSelectedItem(null);
    setSelectedCategoryId("");
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
        >
          <ItemsTable
            items={itemsData?.items ?? []}
            loading={itemsLoading}
            onEdit={handleEditClick}
          />
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
