import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CloseIcon, PencilIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { Modal } from "../../ui/modal";
import { toast } from "sonner";
import {
  ExpenseCategory,
  useDeleteExpenseCategoryMutation,
} from "../../../redux/services/expenseCategory";
import formatDateTime from "../../../helper/date_converter";

interface ExpenseCategoryTableProps {
  categories: ExpenseCategory[];
  loading: boolean;
  onEdit?: (category: ExpenseCategory) => void;
}

export default function ExpenseCategoryTable({
  categories,
  loading,
  onEdit,
}: ExpenseCategoryTableProps) {
  const { isOpen, closeModal, openModal } = useModal();
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [deleteCategory, { isLoading }] = useDeleteExpenseCategoryMutation();

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      const res = await deleteCategory(selectedCategory.id).unwrap();
      if (res.message) {
        toast.success(res.message);
        closeModal();
      }
      setSelectedCategory(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Error deleting expense category");
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Id
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created on
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex justify-center items-center py-10">
                    <TailSpin
                      height={40}
                      width={40}
                      color="#667085"
                      ariaLabel="loading"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  No expense categories found
                </TableCell>
              </TableRow>
            )}

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {cat.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {cat.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDateTime(cat.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span
                        className="cursor-pointer"
                        onClick={() => onEdit?.(cat)}
                      >
                        <PencilIcon width={40} />
                      </span>
                      <span
                        className="cursor-pointer text-red-800"
                        onClick={() => {
                          setSelectedCategory(cat);
                          openModal();
                        }}
                      >
                        <CloseIcon />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Expense Category
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedCategory?.name}
            </span>
            ? Categories with expenses cannot be deleted.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
