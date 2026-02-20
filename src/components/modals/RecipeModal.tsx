import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import { Recipe, RecipeIngredient } from "../../redux/services/recipe";
import { Item, ItemType } from "../../redux/services/item";
import Button from "../ui/button/Button";

export interface RecipeFormData {
  name: string;
  description?: string;
  final_product_id: number;
  ingredients: RecipeIngredient[];
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeFormData) => void;
  mode: "add" | "edit";
  initialData?: Recipe | null;
  items: Item[];
  isLoading?: boolean;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  items,
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [finalProductId, setFinalProductId] = useState<number>(0);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { item_id: 0, quantity: 1 },
  ]);

  // Get FINAL and RAW items
  const finalProducts = items.filter((item) => item.item_type === ItemType.FINAL);
  const rawItems = items.filter((item) => item.item_type === ItemType.RAW);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setFinalProductId(initialData.final_product_id);
      setIngredients(
        initialData.ingredients.map((ing) => ({
          item_id: ing.item_id,
          quantity: Number(ing.quantity),
        }))
      );
    } else {
      setName("");
      setDescription("");
      setFinalProductId(0);
      setIngredients([{ item_id: 0, quantity: 1 }]);
    }
  }, [isOpen, mode, initialData]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      alert("Recipe name is required");
      return;
    }

    if (mode === "add" && !finalProductId) {
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

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      final_product_id: finalProductId,
      ingredients: validIngredients,
    });
  };

  const finalProductOptions = finalProducts.map((item) => ({
    id: item.id,
    name: `${item.name} (Stock: ${Number(item.quantity).toFixed(0)})`,
  }));

  const rawItemOptions = rawItems.map((item) => ({
    id: item.id,
    name: `${item.name} (Stock: ${Number(item.quantity).toFixed(0)})`,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Recipe" : "Create Recipe"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit"
              ? "Update recipe details and ingredients. Note: Only editable if no DONE production exists."
              : "Define a recipe for a final product with its raw material ingredients."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Final Product Selection */}
          {mode === "add" ? (
            <div>
              <Label htmlFor="final_product">
                Final Product <span className="text-red-500">*</span>
              </Label>
              <SelectDropdown
                options={finalProductOptions}
                value={finalProductId}
                onChange={(value) => setFinalProductId(Number(value))}
                placeholder="Select final product..."
                searchable
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only FINAL type items can be selected
              </p>
            </div>
          ) : (
            <div>
              <Label>Final Product</Label>
              <p className="mt-1 text-gray-800 dark:text-white font-medium">
                {initialData?.final_product.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                (Cannot be changed after creation)
              </p>
            </div>
          )}

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

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>
                Ingredients (Raw Items) <span className="text-red-500">*</span>
              </Label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                + Add Ingredient
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Specify quantity per unit of final product
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <Label htmlFor={`ingredient-${index}`} className="text-xs">
                      Raw Item
                    </Label>
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

                  <div className="w-32">
                    <Label htmlFor={`quantity-${index}`} className="text-xs">
                      Quantity/Unit
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="0.001"
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                  ? "Update Recipe"
                  : "Create Recipe"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RecipeModal;
