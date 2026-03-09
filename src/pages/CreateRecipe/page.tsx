import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import SelectDropdown from "../../components/form/SelectDropdown";
import Button from "../../components/ui/button/Button";
import { useCreateRecipeMutation, RecipeIngredient } from "../../redux/services/recipe";
import { useGetAllItemsQuery, ItemType } from "../../redux/services/item";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

/** Local row type: same as RecipeIngredient + item_name for display (like purchase invoice) */
interface RecipeIngredientRow extends RecipeIngredient {
  item_name: string;
}

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [finalProductId, setFinalProductId] = useState<number>(0);
  const [finalProductSearch, setFinalProductSearch] = useState("");
  const [finalProductLabel, setFinalProductLabel] = useState("");
  const [rawItemSearch, setRawItemSearch] = useState("");
  const [selectedRawItemPrices, setSelectedRawItemPrices] = useState<Record<number, number>>({});
  const [ingredients, setIngredients] = useState<RecipeIngredientRow[]>([
    { item_id: 0, quantity: 1, item_name: "" },
  ]);

  // Fetch items by search (like Stock Adjustment / Purchase Invoice)
  const { data: finalProductsData, isLoading: finalProductsLoading } = useGetAllItemsQuery({
    page: 1,
    limit: 30,
    search: finalProductSearch || undefined,
    item_type: ItemType.FINAL,
  });
  const { data: rawItemsData, isLoading: rawItemsLoading } = useGetAllItemsQuery({
    page: 1,
    limit: 30,
    search: rawItemSearch || undefined,
    item_type: ItemType.RAW,
  });
  const [createRecipe, { isLoading: creating }] = useCreateRecipeMutation();

  const finalProducts = finalProductsData?.data ?? [];
  const rawItems = rawItemsData?.data ?? [];
  const itemsLoading = finalProductsLoading || rawItemsLoading;

  // Final product options: API results + selected if not in results
  const apiFinalOptions = finalProducts.map((item) => ({
    id: item.id,
    name: item.name,
  }));
  const finalIds = new Set(apiFinalOptions.map((o) => o.id));
  const finalProductOptions =
    finalProductId && !finalIds.has(finalProductId) && finalProductLabel
      ? [{ id: finalProductId, name: finalProductLabel }, ...apiFinalOptions]
      : apiFinalOptions;

  // Sync final product label when it appears in API results
  useEffect(() => {
    if (!finalProductId || !finalProductsData?.data?.length) return;
    const item = finalProductsData.data.find((i) => i.id === finalProductId);
    if (item) setFinalProductLabel(`${item.name} (Stock: ${Number(item.quantity).toFixed(0)})`);
  }, [finalProductId, finalProductsData?.data]);

  // Raw item options: API results + selected row items so they stay visible (like purchase invoice)
  const apiRawOptions = rawItems.map((item) => ({
    id: item.id,
    name: item.name,
  }));
  const rawIds = new Set(apiRawOptions.map((o) => o.id));
  const selectedOnly = ingredients
    .filter((row) => row.item_id > 0 && !rawIds.has(row.item_id))
    .map((row) => ({ id: row.item_id, name: row.item_name || `Item #${row.item_id}` }));
  const rawItemOptions = [...apiRawOptions];
  selectedOnly.forEach((opt) => {
    if (!rawItemOptions.some((o) => o.id === opt.id)) rawItemOptions.push(opt);
  });

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { item_id: 0, quantity: 1, item_name: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof RecipeIngredientRow,
    value: number | string,
    opts?: { item_name?: string }
  ) => {
    setIngredients((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };
      if (field === "item_id") {
        row.item_id = Number(value);
        if (opts?.item_name != null) row.item_name = opts.item_name;
      } else if (field === "quantity") {
        row.quantity = Number(value);
      } else if (field === "item_name") {
        row.item_name = String(value);
      }
      updated[index] = row;
      return updated;
    });
    if (field === "item_id" && Number(value) > 0) {
      const item = rawItems.find((r) => r.id === Number(value));
      if (item)
        setSelectedRawItemPrices((prev) => ({
          ...prev,
          [Number(value)]: Number(item.avg_price),
        }));
    }
  };

  // Calculate estimated cost (use API result or stored price when item not in search results)
  const getRawItemPrice = (itemId: number): number => {
    const fromApi = rawItems.find((r) => r.id === itemId);
    if (fromApi) return Number(fromApi.avg_price);
    return selectedRawItemPrices[itemId] ?? 0;
  };
  const calculateEstimatedCost = () => {
    let total = 0;
    ingredients.forEach((ing) => {
      if (ing.item_id > 0 && ing.quantity > 0) {
        const price = getRawItemPrice(ing.item_id);
        total += price * ing.quantity;
      }
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      alert("Recipe name is required");
      return;
    }

    if (!finalProductId) {
      alert("Please select a final product");
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.item_id > 0 && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      alert("Add at least one ingredient with a valid quantity");
      return;
    }

    // Check for duplicate ingredients
    const itemIds = validIngredients.map((ing) => ing.item_id);
    const uniqueIds = new Set(itemIds);
    if (itemIds.length !== uniqueIds.size) {
      alert("Duplicate ingredients are not allowed");
      return;
    }

    try {
      await createRecipe({
        name: name.trim(),
        description: description.trim() || undefined,
        final_product_id: finalProductId,
        ingredients: validIngredients.map(({ item_id, quantity }) => ({ item_id, quantity })),
      }).unwrap();
      handleApiSuccess("Recipe created successfully");
      navigate("/recipes");
    } catch (err: unknown) {
      handleApiError(err, "Failed to create recipe");
    }
  };

  const estimatedCost = calculateEstimatedCost();

  return (
    <>
      <PageMeta title="Create Recipe" description="Create a new recipe for a final product" />
      <PageBreadcrumb pageTitle="Create Recipe" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <SimpleComponentCard title="Basic Information" desc="Define the recipe details">
          <div className="space-y-4">
            {/* Final Product */}
            <div>
              <Label>
                Final Product <span className="text-red-500">*</span>
              </Label>
              <SelectDropdown
                options={finalProductOptions}
                value={finalProductId}
                onChange={(value) => {
                  const id = Number(value);
                  setFinalProductId(id);
                  const opt = finalProductOptions.find((o) => o.id === id);
                  setFinalProductLabel(opt ? String(opt.name) : "");
                }}
                placeholder={itemsLoading ? "Loading products..." : "Search and select final product..."}
                searchable
                onSearchChange={setFinalProductSearch}
                optionsAreFiltered={true}
                disabled={itemsLoading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only FINAL type items can be selected. Each final product can have only one recipe.
              </p>
            </div>

            {/* Recipe Name */}
            <div>
              <Label htmlFor="name">
                Recipe Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Standard Car Assembly"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about this recipe..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </SimpleComponentCard>

        {/* Ingredients */}
        <SimpleComponentCard
          title="Ingredients"
          desc="Add raw materials and their quantities per unit of final product"
          extra={
            <Button type="button" variant="primary" onClick={addIngredient}>
              + Add Ingredient
            </Button>
          }
        >
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex gap-3 items-start p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1">
                  <Label className="text-xs mb-1">Raw Item</Label>
                  <SelectDropdown
                    options={rawItemOptions}
                    value={ingredient.item_id}
                    onChange={(value) => {
                      const id = Number(value);
                      const opt = rawItemOptions.find((o) => o.id === id);
                      updateIngredient(index, "item_id", id, {
                        item_name: opt ? String(opt.name) : "",
                      });
                    }}
                    placeholder={rawItemsLoading ? "Loading..." : "Search and select raw item..."}
                    searchable
                    onSearchChange={setRawItemSearch}
                    optionsAreFiltered={true}
                    disabled={rawItemsLoading}
                  />
                </div>

                <div className="w-40">
                  <Label className="text-xs mb-1">Quantity per Unit</Label>
                  <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Qty"
                  />
                </div>

                <div className="w-32">
                  <Label className="text-xs mb-1">Line Cost</Label>
                  <div className="h-11 flex items-center px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-800 dark:text-white/90">
                      {ingredient.item_id > 0
                        ? (
                            getRawItemPrice(ingredient.item_id) * ingredient.quantity
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length <= 1}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Remove ingredient"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {/* Estimated Cost Summary */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Estimated Cost per Unit
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Based on current average prices of raw materials
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {estimatedCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </SimpleComponentCard>

        {/* Actions */}
        <SimpleComponentCard title="Actions" desc="Save or cancel">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/recipes")}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating || itemsLoading}>
              {creating ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </SimpleComponentCard>
      </form>
    </>
  );
};

export default CreateRecipePage;
