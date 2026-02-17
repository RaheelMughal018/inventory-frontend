// components/modals/AddAccountModal.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
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
  id?: number;
  name: string;
  account_type: AccountType;
  account_number?: string;
  bank_name?: string;
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
    name: "",
    account_type: AccountType.IN_HAND,
    account_number: "",
    bank_name: "",
    opening_balance: 0,
  });

  const handleSelectChange =
    (field: keyof AccountFormData) => (value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value as AccountType,
      }));
    };

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({
          id: initialData.id,
          account_type: (initialData.account_type as AccountType) || AccountType.IN_HAND,
          name: initialData.name || "",
          account_number: initialData.account_number || "",
          bank_name: initialData.bank_name || "",
          opening_balance: initialData.opening_balance ? Number(initialData.opening_balance) : 0,
        });
      } else {
        setFormData({
          name: "",
          account_type: AccountType.IN_HAND,
          account_number: "",
          bank_name: "",
          opening_balance: 0,
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for BANK type
    if (formData.account_type === AccountType.BANK) {
      if (!formData.account_number || !formData.bank_name) {
        alert("Account number and bank name are required for BANK type accounts");
        return;
      }
    }
    
    onSubmit(formData);
  };

  const handleChange = (field: keyof AccountFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isBankAccount = formData.account_type === AccountType.BANK;

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
              ? "Update account details"
              : "Enter account details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div>
            <Label className="mb-3">Account Type *</Label>
            <SelectDropdown
              options={types}
              value={formData.account_type}
              onChange={handleSelectChange("account_type")}
              label=""
              placeholder="Select account type..."
              required
              searchable={true}
              name="account_type"
              disabled={mode === "edit"} // Can't change type after creation
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Account type cannot be changed after creation
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Account Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Main Business Account"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Bank-specific fields - Only shown for BANK type */}
          {isBankAccount && (
            <>
              <div>
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  type="text"
                  placeholder="e.g., Allied Bank"
                  value={formData.bank_name || ""}
                  onChange={(e) => handleChange("bank_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="account_number">Account Number *</Label>
                <Input
                  id="account_number"
                  type="text"
                  placeholder="e.g., 1234567890"
                  value={formData.account_number || ""}
                  onChange={(e) => handleChange("account_number", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Opening Balance - Only for add mode */}
          {mode === "add" && (
            <div>
              <Label htmlFor="opening_balance">Opening Balance</Label>
              <Input
                id="opening_balance"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={formData.opening_balance ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    opening_balance: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
              />
            </div>
          )}

          {mode === "edit" && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Opening balance cannot be modified after account creation. The current balance is {Number(initialData?.current_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
              </p>
            </div>
          )}

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
