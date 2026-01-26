import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Category } from "../../redux/services/category";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  editingCategory?: Category | null;
  isLoading?: boolean;
}

export interface CategoryFormData {
  name: string;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
      });
    } else {
      setFormData({
        name: "",
      });
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Category name is required!");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {editingCategory
              ? "Update category details"
              : "Enter category details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div>
            <Label htmlFor="category-name" className="mb-2">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category-name"
              type="text"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {editingCategory ? "Updating..." : "Adding..."}
                </span>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Add Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;
