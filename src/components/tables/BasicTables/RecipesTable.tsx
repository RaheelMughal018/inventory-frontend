import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CloseIcon, EyeIcon, PencilIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { Modal } from "../../ui/modal";
import {
  Recipe,
  useDeleteRecipeMutation,
} from "../../../redux/services/recipe";
import formatDateTime from "../../../helper/date_converter";
import { handleApiError, handleApiSuccess } from "../../../helper/error_handler";

interface RecipesTableProps {
  recipes: Recipe[];
  loading: boolean;
  onView?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
}

export default function RecipesTable({
  recipes,
  loading,
  onView,
  onEdit,
}: RecipesTableProps) {
  const { isOpen, closeModal, openModal } = useModal();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleteRecipe, { isLoading }] = useDeleteRecipeMutation();

  const handleDeleteClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    openModal();
  };

  const handleDelete = async () => {
    if (!selectedRecipe) return;
    try {
      await deleteRecipe(selectedRecipe.id).unwrap();
      handleApiSuccess("Recipe deleted successfully");
      closeModal();
      setSelectedRecipe(null);
    } catch (err: unknown) {
      handleApiError(err, "Failed to delete recipe");
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
                  Final Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Recipe Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ingredients
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Cost / Unit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex justify-center">
                      <TailSpin height={32} width={32} color="#3b82f6" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : recipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No recipes found. Add a recipe for a final product.
                  </TableCell>
                </TableRow>
              ) : (
                recipes.map((recipe) => (
                  <TableRow
                    key={recipe.id}
                    className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]"
                  >
                    <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                      {recipe.final_product.name}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                      {recipe.name}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {recipe.ingredients.length} item{recipe.ingredients.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                      <div className="flex items-center gap-2">
                        <span>{Number(recipe.current_cost_per_unit ?? 0).toFixed(2)}</span>
                        {recipe.has_unpriced_ingredient && (
                          <span
                            title="One or more ingredients have no price yet (avg_price = 0). Cost is incomplete."
                            className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            !
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {formatDateTime(recipe.created_at)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(recipe)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                            title="View"
                          >
                            <EyeIcon className="size-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(recipe)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                            title="Edit"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(recipe)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          title="Delete"
                        >
                          <CloseIcon className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => { closeModal(); setSelectedRecipe(null); }} className="max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Delete Recipe
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the recipe &quot;{selectedRecipe?.name}&quot; for &quot;{selectedRecipe?.final_product.name}&quot;?
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Note: Recipe can only be deleted if no production batches are using it.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { closeModal(); setSelectedRecipe(null); }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
