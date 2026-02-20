import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import SelectDropdown from "../../components/form/SelectDropdown";
import Button from "../../components/ui/button/Button";
import {
  useGetRecipeByIdQuery,
  useUpdateRecipeMutation,
  useGetRecipeCostQuery,
  RecipeIngredient,
} from "../../redux/services/recipe";
import { useGetAllItemsQuery, ItemType } from "../../redux/services/item";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import { TailSpin } from "react-loader-spinner";

const EditRecipePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const recipeId = Number(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { item_id: 0, quantity: 1 },
  ]);

  // Fetch recipe and items
  const { data: recipeData, isLoading: recipeLoading } = useGetRecipeByIdQuery(recipeId, {
    skip: !recipeId,
  });
  const { data: costData, isLoading: costLoading } = useGetRecipeCostQuery(recipeId, {
    skip: !recipeId,
  });
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery({});
  const [updateRecipe, { isLoading: updating }] = useUpdateRecipeMutation();

  const recipe = recipeData?.data;
  const cost = costData?.data;
  const items = itemsData?.data ?? [];
  const rawItems = items.filter((item) => item.item_type === ItemType.RAW);

  const rawItemOptions = rawItems.map((item) => ({
    id: item.id,
    name: `${item.name} (Stock: ${Number(item.quantity).toFixed(0)}, Price: $${Number(item.avg_price).toFixed(2)})`,
  }));

  // Initialize form with recipe data
  useEffect(() => {
    if (recipe) {
      setName(recipe.name || "");
      setDescription(recipe.description || "");
      setIngredients(
        recipe.ingredients.map((ing) => ({
          item_id: ing.item_id,
          quantity: Number(ing.quantity),
        }))
      );
    }
  }, [recipe]);

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { item_id: 0, quantity: 1 }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof RecipeIngredient,
    value: number
  ) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate estimated cost with current form data
  const calculateEstimatedCost = () => {
    let total = 0;
    ingredients.forEach((ing) => {
      if (ing.item_id > 0 && ing.quantity > 0) {
        const item = rawItems.find((r) => r.id === ing.item_id);
        if (item) {
          total += Number(item.avg_price) * ing.quantity;
        }
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
      await updateRecipe({
        id: recipeId,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          ingredients: validIngredients,
        },
      }).unwrap();
      handleApiSuccess("Recipe updated successfully");
      navigate("/recipes");
    } catch (err: unknown) {
      handleApiError(err, "Failed to update recipe");
    }
  };

  if (recipeLoading || itemsLoading) {
    return (
      <>
        <PageMeta title="Edit Recipe" description="Edit recipe details" />
        <PageBreadcrumb pageTitle="Edit Recipe" />
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

  const estimatedCost = calculateEstimatedCost();

  return (
    <>
      <PageMeta title="Edit Recipe" description="Edit recipe details and ingredients" />
      <PageBreadcrumb pageTitle="Edit Recipe" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <SimpleComponentCard title="Basic Information" desc="Update the recipe details">
          <div className="space-y-4">
            {/* Final Product (Read-only) */}
            <div>
              <Label>Final Product</Label>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-800 dark:text-white">
                  {recipe.final_product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Stock: {Number(recipe.final_product.quantity).toFixed(0)} | Avg Price: $
                  {Number(recipe.final_product.avg_price).toFixed(2)}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Final product cannot be changed after creation
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

        {/* Current Cost from Backend */}
        {cost && (
          <SimpleComponentCard 
            title="Current Cost Analysis" 
            desc="Based on saved recipe with current material prices"
          >
            <div className="space-y-3">
              {/* Total Cost */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Current Cost per Unit
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Calculated from saved recipe ingredients
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${cost.cost_per_unit.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {costLoading ? (
                <div className="flex justify-center py-4">
                  <TailSpin height={24} width={24} color="#3b82f6" />
                </div>
              ) : (
                <div className="space-y-2">
                  {cost.breakdown.map((item) => (
                    <div
                      key={item.item_id}
                      className="flex justify-between items-center p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {item.item_name}
                      </span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {item.quantity} × ${item.avg_price.toFixed(2)} ={" "}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          ${item.line_cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SimpleComponentCard>
        )}

        {/* Ingredients */}
        <SimpleComponentCard
          title="Ingredients"
          desc="Modify raw materials and their quantities per unit of final product"
          extra={
            <Button type="button" variant="primary" onClick={addIngredient}>
              + Add Ingredient
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Recipe can only be edited if no production is DONE. Changes
                won't affect completed production batches.
              </p>
            </div>

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
                    onChange={(value) =>
                      updateIngredient(index, "item_id", Number(value))
                    }
                    placeholder="Select raw item..."
                    searchable
                  />
                </div>

                <div className="w-40">
                  <Label className="text-xs mb-1">Quantity per Unit</Label>
                  <Input
                    type="number"
                    
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
                      $
                      {ingredient.item_id > 0
                        ? (
                            Number(
                              rawItems.find((r) => r.id === ingredient.item_id)
                                ?.avg_price || 0
                            ) * ingredient.quantity
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

            {/* Estimated Cost with New Changes */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    New Estimated Cost per Unit
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Based on current form data (not saved yet)
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ${estimatedCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </SimpleComponentCard>

        {/* Actions */}
        <SimpleComponentCard title="Actions" desc="Save or cancel your changes">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/recipes")}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updating}>
              {updating ? "Updating..." : "Update Recipe"}
            </Button>
          </div>
        </SimpleComponentCard>
      </form>
    </>
  );
};

export default EditRecipePage;
