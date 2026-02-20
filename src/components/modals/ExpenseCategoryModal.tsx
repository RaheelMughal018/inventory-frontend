import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { ExpenseCategory } from "../../redux/services/expenseCategory";

interface ExpenseCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCategoryFormData) => void;
  initialData?: ExpenseCategory | null;
  mode?: "add" | "edit";
}

export interface ExpenseCategoryFormData {
  name: string;
  description?: string;
}

const ExpenseCategoryModal: React.FC<ExpenseCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<ExpenseCategoryFormData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description ?? "",
      });
      return;
    }

    setFormData({ name: "", description: "" });
  }, [isOpen, initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }
    onSubmit({
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
    });
  };

  const handleChange = (field: keyof ExpenseCategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Expense Category" : "Add Expense Category"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit"
              ? "Update expense category name and description"
              : "Enter expense category name (e.g. Utilities, Office supplies)"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="expense-category-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expense-category-name"
              type="text"
              placeholder="e.g. Utilities"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="expense-category-desc">Description (Optional)</Label>
            <textarea
              id="expense-category-desc"
              placeholder="e.g. Electricity, gas, water"
              value={formData.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

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
              {mode === "edit" ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ExpenseCategoryModal;
