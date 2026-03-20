import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import SelectDropdown from "../../components/form/SelectDropdown";
import Button from "../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import {
  useGetRecipeByIdQuery,
  useGetRecipeCostQuery,
  useUpdateRecipeMutation,
  useAddIngredientMutation,
  useUpdateIngredientMutation,
  useRemoveIngredientMutation,
  RecipeIngredientResponse,
} from "../../redux/services/recipe";
import { useGetAllItemsQuery, ItemType } from "../../redux/services/item";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import { TailSpin } from "react-loader-spinner";
import { PencilIcon, CloseIcon } from "../../icons";
import formatDateTime from "../../helper/date_converter";

const EditRecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = Number(id);

  // Edit recipe info state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editExtraExpense, setEditExtraExpense] = useState<number>(0);

  // Inline ingredient editing
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0);

  // Add ingredient
  const [addItemId, setAddItemId] = useState<number>(0);
  const [addItemName, setAddItemName] = useState("");
  const [addQty, setAddQty] = useState<number>(1);
  const [addSearch, setAddSearch] = useState("");

  // Remove ingredient confirmation
  const { isOpen: isRemoveOpen, openModal: openRemove, closeModal: closeRemove } = useModal();
  const [removingIngredient, setRemovingIngredient] = useState<RecipeIngredientResponse | null>(null);

  // Queries
  const { data: recipeData, isLoading: recipeLoading } = useGetRecipeByIdQuery(recipeId, {
    skip: !recipeId,
  });
  const { data: costData, isLoading: costLoading } = useGetRecipeCostQuery(recipeId, {
    skip: !recipeId,
  });
  const { data: addItemsData, isLoading: addItemsLoading } = useGetAllItemsQuery({
    page: 1,
    limit: 30,
    search: addSearch || undefined,
    item_type: ItemType.RAW,
  });

  // Mutations
  const [updateRecipe, { isLoading: updatingInfo }] = useUpdateRecipeMutation();
  const [addIngredient, { isLoading: adding }] = useAddIngredientMutation();
  const [updateIngredient, { isLoading: updatingIngredient }] = useUpdateIngredientMutation();
  const [removeIngredient, { isLoading: removing }] = useRemoveIngredientMutation();

  const recipe = recipeData?.data;
  const cost = costData?.data;

  // Add item options: API results + currently selected item (to keep it visible)
  const apiAddOptions = (addItemsData?.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
  }));
  const addOptions =
    addItemId > 0 && !apiAddOptions.some((o) => o.id === addItemId)
      ? [{ id: addItemId, name: addItemName }, ...apiAddOptions]
      : apiAddOptions;

  // Already-used item IDs to prevent duplicates
  const usedItemIds = new Set((recipe?.ingredients ?? []).map((ing) => ing.item_id));

  // Handlers — edit recipe info
  const handleStartEditInfo = () => {
    if (!recipe) return;
    setEditName(recipe.name || "");
    setEditDescription(recipe.description || "");
    setEditExtraExpense(Number(recipe.extra_expenses) || 0);
    setIsEditingInfo(true);
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
  };

  const handleSaveInfo = async () => {
    try {
      await updateRecipe({
        id: recipeId,
        data: {
          name: editName.trim() || undefined,
          description: editDescription.trim() || undefined,
          extra_expenses: editExtraExpense || 0,
        },
      }).unwrap();
      handleApiSuccess("Recipe updated");
      setIsEditingInfo(false);
    } catch (err: unknown) {
      handleApiError(err, "Failed to update recipe");
    }
  };

  // Handlers — inline ingredient quantity edit
  const handleStartEditIngredient = (ing: RecipeIngredientResponse) => {
    setEditingIngredientId(ing.item_id);
    setEditingQty(Number(ing.quantity));
  };

  const handleCancelEditIngredient = () => {
    setEditingIngredientId(null);
  };

  const handleSaveIngredient = async (itemId: number) => {
    if (editingQty <= 0) {
      handleApiError(null, "Quantity must be greater than 0");
      return;
    }
    try {
      await updateIngredient({
        id: recipeId,
        itemId,
        data: { quantity: editingQty },
      }).unwrap();
      handleApiSuccess("Ingredient updated");
      setEditingIngredientId(null);
    } catch (err: unknown) {
      handleApiError(err, "Failed to update ingredient");
    }
  };

  // Handlers — remove ingredient
  const handleRemoveClick = (ing: RecipeIngredientResponse) => {
    setRemovingIngredient(ing);
    openRemove();
  };

  const handleConfirmRemove = async () => {
    if (!removingIngredient) return;
    try {
      await removeIngredient({ id: recipeId, itemId: removingIngredient.item_id }).unwrap();
      handleApiSuccess("Ingredient removed");
      closeRemove();
      setRemovingIngredient(null);
    } catch (err: unknown) {
      handleApiError(err, "Failed to remove ingredient");
    }
  };

  // Handlers — add ingredient
  const handleAddIngredient = async () => {
    if (!addItemId) {
      handleApiError(null, "Please select a raw item");
      return;
    }
    if (addQty <= 0) {
      handleApiError(null, "Quantity must be greater than 0");
      return;
    }
    if (usedItemIds.has(addItemId)) {
      handleApiError(null, "This item is already an ingredient");
      return;
    }
    try {
      await addIngredient({ id: recipeId, data: { item_id: addItemId, quantity: addQty } }).unwrap();
      handleApiSuccess("Ingredient added");
      setAddItemId(0);
      setAddItemName("");
      setAddQty(1);
      setAddSearch("");
    } catch (err: unknown) {
      handleApiError(err, "Failed to add ingredient");
    }
  };

  if (recipeLoading || !recipeId) {
    return (
      <>
        <PageMeta title="Recipe" description="View recipe details" />
        <PageBreadcrumb pageTitle="Recipe" />
        <div className="flex justify-center items-center py-20">
          <TailSpin height={48} width={48} color="#3b82f6" />
        </div>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <PageMeta title="Recipe Not Found" description="Recipe not found" />
        <PageBreadcrumb pageTitle="Recipe Not Found" />
        <SimpleComponentCard title="Recipe Not Found" desc="The requested recipe could not be found">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Recipe not found</p>
            <Button variant="primary" onClick={() => navigate("/recipes")} className="mt-4">
              Back to Recipes
            </Button>
          </div>
        </SimpleComponentCard>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`Recipe: ${recipe.name}`}
        description={`View recipe for ${recipe.final_product.name}`}
      />
      <PageBreadcrumb pageTitle={`Recipe: ${recipe.name}`} />

      <div className="space-y-6">
        {/* Recipe Information */}
        <SimpleComponentCard
          title="Recipe Information"
          desc="Details about this recipe"
          extra={
            !isEditingInfo ? (
              <Button type="button" variant="outline" size="sm" onClick={handleStartEditInfo}>
                <PencilIcon className="size-4 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCancelEditInfo}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveInfo}
                  disabled={updatingInfo}
                >
                  {updatingInfo ? "Saving..." : "Save"}
                </Button>
              </div>
            )
          }
        >
          {!isEditingInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Final Product
                </p>
                <p className="mt-1 font-medium text-gray-800 dark:text-white">
                  {recipe.final_product.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Recipe Name
                </p>
                <p className="mt-1 text-gray-800 dark:text-white">{recipe.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Description
                </p>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {recipe.description || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Extra Expenses / unit
                </p>
                <p className="mt-1 text-gray-800 dark:text-white">
                  {Number(recipe.extra_expenses ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Final Product Stock
                </p>
                <p className="mt-1 text-gray-800 dark:text-white">
                  {Number(recipe.final_product.quantity).toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Created
                </p>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {formatDateTime(recipe.created_at)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-lg">
              <div>
                <Label htmlFor="edit-name">Recipe Name</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Standard Car Assembly"
                />
              </div>
              <div>
                <Label htmlFor="edit-desc">Description (Optional)</Label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional notes..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <Label htmlFor="edit-extra">Extra Expenses / unit (Optional)</Label>
                <Input
                  id="edit-extra"
                  type="number"
                  min={0}
                  step={0.01}
                  value={editExtraExpense === 0 ? "" : editExtraExpense}
                  onChange={(e) =>
                    setEditExtraExpense(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
        </SimpleComponentCard>

        {/* Cost Analysis */}
        <SimpleComponentCard
          title="Cost Analysis"
          desc="Current cost per unit based on live ingredient prices"
        >
          {costLoading ? (
            <div className="flex justify-center py-8">
              <TailSpin height={32} width={32} color="#3b82f6" />
            </div>
          ) : cost ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Total Cost per Unit
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                    Ingredients + extra expenses at current prices
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {cost.cost_per_unit.toFixed(2)}
                </p>
              </div>

              {cost.breakdown.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/5">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Raw Item
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Qty / Unit
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                          Avg Price
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                          Line Cost
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cost.breakdown.map((item) => (
                        <TableRow
                          key={item.item_id}
                          className="border-b border-gray-100 last:border-0 dark:border-white/5"
                        >
                          <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                            {item.item_name}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
                            {item.avg_price.toFixed(2)}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-end font-medium text-gray-800 dark:text-white/90">
                            {item.line_cost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {Number(recipe.extra_expenses ?? 0) > 0 && (
                        <TableRow className="border-b border-gray-100 last:border-0 dark:border-white/5 bg-gray-50 dark:bg-white/2">
                          <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400 italic" colSpan={3}>
                            Extra expenses
                          </TableCell>
                          <TableCell className="px-5 py-3 text-end font-medium text-gray-800 dark:text-white/90">
                            {Number(recipe.extra_expenses).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-4">Cost data unavailable.</p>
          )}
        </SimpleComponentCard>

        {/* Ingredients */}
        <SimpleComponentCard
          title="Ingredients"
          desc="Raw materials required per unit of final product"
        >
          <div className="space-y-4">
            {/* Existing ingredients table */}
            {recipe.ingredients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                No ingredients added yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Raw Item
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                        Qty / Unit
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                        Avg Price
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients.map((ing) => (
                      <TableRow
                        key={ing.item_id}
                        className="border-b border-gray-100 last:border-0 dark:border-white/5"
                      >
                        <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                          {ing.item.name}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-center">
                          {editingIngredientId === ing.item_id ? (
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number"
                                min={0.001}
                                step={0.001}
                                value={editingQty}
                                onChange={(e) => setEditingQty(parseFloat(e.target.value) || 0)}
                                className="w-24 h-9 rounded-lg border border-gray-300 px-2 text-sm text-center dark:border-gray-600 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveIngredient(ing.item_id)}
                                disabled={updatingIngredient}
                                className="px-2 py-1 text-xs rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                              >
                                {updatingIngredient ? "…" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditIngredient}
                                className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">
                              {Number(ing.quantity)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
                          {Number(ing.item.avg_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-end">
                          <div className="flex justify-end gap-1">
                            {editingIngredientId !== ing.item_id && (
                              <button
                                type="button"
                                onClick={() => handleStartEditIngredient(ing)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                title="Edit quantity"
                              >
                                <PencilIcon className="size-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveClick(ing)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                              title="Remove ingredient"
                            >
                              <CloseIcon className="size-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Add ingredient */}
            <div className="p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Add Ingredient
              </p>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs mb-1">Raw Item</Label>
                  <SelectDropdown
                    options={addOptions.filter((o) => !usedItemIds.has(o.id))}
                    value={addItemId}
                    onChange={(value) => {
                      const numId = Number(value);
                      setAddItemId(numId);
                      const opt = addOptions.find((o) => o.id === numId);
                      setAddItemName(opt ? String(opt.name) : "");
                    }}
                    placeholder={addItemsLoading ? "Loading..." : "Search raw item..."}
                    searchable
                    onSearchChange={setAddSearch}
                    optionsAreFiltered={true}
                    disabled={addItemsLoading}
                  />
                </div>
                <div className="w-32">
                  <Label className="text-xs mb-1">Qty / Unit</Label>
                  <Input
                    type="number"
                    min={0.001}
                    step={0.001}
                    value={addQty}
                    onChange={(e) => setAddQty(parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddIngredient}
                  disabled={adding || !addItemId}
                >
                  {adding ? "Adding..." : "+ Add"}
                </Button>
              </div>
            </div>
          </div>
        </SimpleComponentCard>

        {/* Footer actions */}
        {/* <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => navigate("/recipes")}>
            ← Back to Recipes
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(`/recipes/edit/${recipeId}`)}
          >
            Full Edit
          </Button>
        </div> */}
      </div>

      {/* Remove ingredient confirmation modal */}
      <Modal
        isOpen={isRemoveOpen}
        onClose={() => { closeRemove(); setRemovingIngredient(null); }}
        className="max-w-sm"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Remove Ingredient
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Remove <strong>{removingIngredient?.item.name}</strong> from this recipe?
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { closeRemove(); setRemovingIngredient(null); }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              disabled={removing}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {removing ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditRecipePage;
