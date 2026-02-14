// components/modals/AddAccountModal.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal"; // Your existing modal
import Input from "../form/input/InputField"; // Your Input component
import Label from "../form/Label"; // Your Label component
import { Account, AccountType } from "../../redux/services/account";
import SelectDropdown from "../form/SelectDropdown";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  initialData?: Account | null;
  types?: Array<{ id: AccountType; name: string }>;
  mode?: "add" | "edit";
}

export interface AccountFormData {
  id: string;
  name: string;
  type: AccountType;
  opening_balance?: number;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  types = [],

  mode = "add",
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    id: "",
    type: AccountType.CASH,
    name: "",
    opening_balance: 0,
  });

  const handleSelectChange =
    (field: keyof AccountFormData) => (value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value as AccountType, // Type assertion for enum
      }));
    };

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          id: initialData.id,
          type: initialData.type || AccountType.CASH,
          name: initialData.name || "",
          opening_balance: initialData.opening_balance ?? 0,
        });
      } else {
        setFormData({
          id: "",
          type: AccountType.CASH,
          name: "",
          opening_balance: 0,
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof AccountFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Account" : "Add New Account"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit"
              ? "Update Account details"
              : "Enter Account details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection - Organization or Individual */}
          <div>
            <Label className="mb-3">Account Type *</Label>
            <SelectDropdown
              options={types}
              value={formData.type}
              onChange={handleSelectChange("type")}
              label=""
              placeholder="Select account type..."
              required
              searchable={true}
              name="type"
            />
          </div>

          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="opening_balance">Opening Balance</Label>
            <Input
              id="opening_balance"
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              value={formData.opening_balance ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  opening_balance: e.target.value === "" ? 0 : Number(e.target.value),
                }))
              }
            />
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
              {mode === "edit" ? "Update Account" : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddAccountModal;
