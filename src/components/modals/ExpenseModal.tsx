import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import DatePicker from "../form/date-picker";
import { ExpenseCreate } from "../../redux/services/expense";
import { toast } from "sonner";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreate) => void;
  accounts: { id: string; name: string }[];
  expenseCategories: { id: string; name: string }[];
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  expenseCategories,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<ExpenseCreate>({
    date: today,
    amount: 0,
    account_id: "",
    expense_category_id: "",
    description: null,
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      date: today,
      amount: 0,
      account_id: "",
      expense_category_id: "",
      description: null,
    });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast.warning("Amount must be greater than 0");
      return;
    }
    if (!formData.account_id) {
      toast.warning("Please select an account");
      return;
    }
    if (!formData.expense_category_id) {
      toast.warning("Please select an expense category");
      return;
    }
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      description: formData.description?.trim() || undefined,
    });
  };

  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      setFormData((prev) => ({
        ...prev,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Add Expense
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Record a new expense (amount, account, category)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="expense-date">Date</Label>
            <DatePicker
              id="expense-date"
              placeholder="Select date"
              defaultDate={new Date(formData.date ?? today)}
              onChange={handleDateChange}
            />
          </div>

          <div>
            <Label htmlFor="expense-amount">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expense-amount"
              type="number"
              min={0.01}
              step={0.01}
              placeholder="0.00"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: e.target.value ? Number(e.target.value) : 0,
                }))
              }
            />
          </div>

          <div>
            <Label>
              Account <span className="text-red-500">*</span>
            </Label>
            <SelectDropdown
              options={accounts}
              value={formData.account_id}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, account_id: String(value) }))
              }
              placeholder="Select account"
              searchable
              className="w-full"
            />
          </div>

          <div>
            <Label>
              Expense Category <span className="text-red-500">*</span>
            </Label>
            <SelectDropdown
              options={expenseCategories}
              value={formData.expense_category_id}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  expense_category_id: String(value),
                }))
              }
              placeholder="Select category"
              searchable
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="expense-description">Description (optional)</Label>
            <textarea
              id="expense-description"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
              rows={3}
              placeholder="Optional notes"
              value={formData.description ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value || null,
                }))
              }
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
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
