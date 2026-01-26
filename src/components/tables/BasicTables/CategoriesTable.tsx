import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Category,
  useDeleteCategoryMutation,
} from "../../../redux/services/category";
import { CloseIcon, PencilIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { Modal } from "../../ui/modal";
import { toast } from "sonner";

interface CategoriesTableProps {
  categories: Category[];
  loading: boolean;
  onEdit?: (category: Category) => void;
}

export default function CategoriesTable({
  categories,
  loading,
  onEdit,
}: CategoriesTableProps) {
  const { isOpen, closeModal, openModal } = useModal();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      const res = await deleteCategory(selectedCategory.id).unwrap();
      if (res.message) {
        toast.success(res.message);
        closeModal();
      }
      setSelectedCategory(null);
    } catch (error) {
      console.log("🚀 ~ handleDelete ~ error:", error);
      toast.error("Error while deleting the category");
    }
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    openModal();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <TailSpin color="#3B82F6" height={50} width={50} />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No categories found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
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
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-gray-300">
                    {category.id}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-800 text-theme-sm font-medium dark:text-gray-300">
                    {category.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-theme-sm dark:text-gray-400">
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit?.(category)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                        title="Edit category"
                      >
                        <PencilIcon width="16" height="16" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                        title="Delete category"
                      >
                        <CloseIcon width="16" height="16" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delete Category
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete{" "}
            <strong>{selectedCategory?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <TailSpin color="#ffffff" height={16} width={16} />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
