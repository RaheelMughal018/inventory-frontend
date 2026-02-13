import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import DatePicker from "../form/date-picker";
import { ExpenseCreate, ExpenseCreateBulk } from "../../redux/services/expense";
import { PlusIcon, CloseIcon } from "../../icons";
import { toast } from "sonner";

interface ExpenseRow {
  name: string;
  amount: number;
  account_id: string;
  expense_category_id: string;
  description: string;
}

const emptyRow = (): ExpenseRow => ({
  name: "",
  amount: 0,
  account_id: "",
  expense_category_id: "",
  description: "",
});

interface ExpenseBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreateBulk) => void;
  accounts: { id: string; name: string }[];
  expenseCategories: { id: string; name: string }[];
}

const ExpenseBulkModal: React.FC<ExpenseBulkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  expenseCategories,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<ExpenseRow[]>([emptyRow()]);

  useEffect(() => {
    if (!isOpen) return;
    setDate(new Date().toISOString().slice(0, 10));
    setRows([emptyRow()]);
  }, [isOpen]);

  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      setDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }
  };

  const updateRow = (index: number, field: keyof ExpenseRow, value: string | number) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUserId = localStorage.getItem("id");
    const user_id = loggedInUserId ? Number(loggedInUserId) : undefined;

    const expenses: ExpenseCreate[] = rows
      .filter(
        (r) =>
          r.amount > 0 &&
          r.account_id &&
          r.expense_category_id
      )
      .map((r) => ({
        date,
        name: r.name.trim() || undefined,
        amount: Number(r.amount),
        account_id: r.account_id,
        expense_category_id: r.expense_category_id,
        description: r.description.trim() || undefined,
        user_id: user_id ?? 0,
      }));

    if (expenses.length === 0) {
      toast.warning("Add at least one valid row (amount > 0, account and category selected).");
      return;
    }

    onSubmit({
      date,
      expenses,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-[90rem] w-[95vw] sm:w-[85vw]">
      <div className="p-6 sm:p-8 lg:p-10 shadow-xl">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700/80">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Add bulk expenses
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Add multiple expenses for the same date. Use <span className="font-medium text-gray-700 dark:text-gray-300">Add row</span> to add more entries.
          </p>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="w-44">
              <Label htmlFor="bulk-expense-date">Date</Label>
              <DatePicker
                id="bulk-expense-date"
                placeholder="Select date"
                defaultDate={date}
                onChange={handleDateChange}
              />
            </div>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:hover:border-brand-500 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors"
            >
              <PlusIcon className="size-5 shrink-0" />
              Add row
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              {rows.length} row{rows.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800/95 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider shadow-sm">
                  <tr>
                    <th className="px-4 py-3.5 w-12">#</th>
                    <th className="px-4 py-3.5 min-w-[140px]">Name</th>
                    <th className="px-4 py-3.5 w-32">Amount *</th>
                    <th className="px-4 py-3.5 min-w-[180px]">Account *</th>
                    <th className="px-4 py-3.5 min-w-[160px]">Category *</th>
                    <th className="px-4 py-3.5 min-w-[200px]">Description</th>
                    <th className="px-4 py-3.5 w-14" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50">
                  {rows.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Name (optional)"
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[120px]"
                          value={row.name}
                          onChange={(e) =>
                            updateRow(index, "name", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0.01}
                          step={0.01}
                          placeholder="0.00"
                          value={row.amount === 0 ? "" : row.amount}
                          onChange={(e) =>
                            updateRow(
                              index,
                              "amount",
                              e.target.value ? Number(e.target.value) : 0
                            )
                          }
                          className="w-full max-w-28 text-right tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <SelectDropdown
                          options={accounts}
                          value={row.account_id}
                          onChange={(value) =>
                            updateRow(index, "account_id", String(value))
                          }
                          placeholder="Select account"
                          searchable
                          className="w-full min-w-[160px]"
                          listClassName="max-h-80"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <SelectDropdown
                          options={expenseCategories}
                          value={row.expense_category_id}
                          onChange={(value) =>
                            updateRow(index, "expense_category_id", String(value))
                          }
                          placeholder="Select category"
                          searchable
                          className="w-full min-w-[140px]"
                          listClassName="max-h-80"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Optional notes"
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          value={row.description}
                          onChange={(e) =>
                            updateRow(index, "description", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          disabled={rows.length <= 1}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent transition-colors"
                          title="Remove row"
                        >
                          <CloseIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium rounded-xl bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-colors"
            >
              Save {rows.filter((r) => r.amount > 0 && r.account_id && r.expense_category_id).length} expense(s)
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ExpenseBulkModal;
