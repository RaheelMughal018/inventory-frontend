import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Radio from "../form/input/Radio";
import CategorySelect from "../form/CategorySelect";
import { Item, ItemType, UnitType } from "../../redux/services/item";
import { Category } from "../../redux/services/category";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void;
  initialData?: Item | null;
  mode?: "add" | "edit";
  categories: Category[];
  categoryId?: number; // For edit mode, we need the category ID separately
}

export interface ItemFormData {
  name: string;
  item_type: ItemType;
  unit_type: UnitType;
  category_id: number; // Category ID as number
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  categories,
  categoryId,
}) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    item_type: ItemType.RAW,
    unit_type: UnitType.PCS,
    category_id: 0,
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        item_type: initialData.item_type || ItemType.RAW,
        unit_type: initialData.unit_type || UnitType.PCS,
        category_id: initialData.category_id || 0,
      });
      return;
    }

    // Reset to default for add mode
    setFormData({
      name: "",
      item_type: ItemType.RAW,
      unit_type: UnitType.PCS,
      category_id: 0,
    });
  }, [isOpen, initialData, mode, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Item name is required!");
      return;
    }
    if (!formData.category_id) {
      alert("Category is required!");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof ItemFormData, value: string | ItemType | UnitType | number) => {
    if (field === 'category_id') {
      setFormData((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Item" : "Add New Item"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit" ? "Update item details" : "Enter item details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div>
            <Label htmlFor="item-name">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="item-name"
              type="text"
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Category Selection */}
          <div>
            <CategorySelect
              categories={categories}
              value={String(formData.category_id)}
              onChange={(categoryId) => handleChange("category_id", categoryId)}
              label="Category"
              placeholder="Search and select category..."
              required
            />
            {mode === "edit" && initialData?.category && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Current category: <span className="font-medium">{initialData?.category?.name || "N/A"}</span>
              </p>
            )}
          </div>

          {/* Item Type */}
          <div>
            <Label className="mb-3">
              Item Type <span className="text-red-500">*</span>
            </Label>
            <div className="flex space-x-6">
              <Radio
                id="item-type-raw"
                name="item_type"
                value={ItemType.RAW}
                checked={formData.item_type === ItemType.RAW}
                label="Raw Material"
                onChange={(value) => handleChange("item_type", value as ItemType)}
                disabled={mode === "edit"}
              />
              <Radio
                id="item-type-final"
                name="item_type"
                value={ItemType.FINAL}
                checked={formData.item_type === ItemType.FINAL}
                label="Final Product"
                onChange={(value) => handleChange("item_type", value as ItemType)}
                disabled={mode === "edit"}
              />
            </div>
            {mode === "edit" && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Item type cannot be changed after creation
              </p>
            )}
          </div>

          {/* Unit */}
          <div>
            <Label className="mb-3">
              Unit <span className="text-red-500">*</span>
            </Label>
            <div className="flex space-x-6">
              <Radio
                id="item-unit-pcs"
                name="unit_type"
                value={UnitType.PCS}
                checked={formData.unit_type === UnitType.PCS}
                label="PCS"
                onChange={(value) => handleChange("unit_type", value as UnitType)}
                disabled={mode === "edit"}
              />
              <Radio
                id="item-unit-set"
                name="unit_type"
                value={UnitType.SET}
                checked={formData.unit_type === UnitType.SET}
                label="SET"
                onChange={(value) => handleChange("unit_type", value as UnitType)}
                disabled={mode === "edit"}
              />
            </div>
            {mode === "edit" && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Unit type cannot be changed after creation
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {mode === "edit" ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ItemModal;
