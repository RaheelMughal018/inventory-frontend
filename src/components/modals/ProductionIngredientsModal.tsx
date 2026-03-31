import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import { ProductionIngredientResponse } from "../../redux/services/production";
import { useGetAllItemsQuery, ItemType } from "../../redux/services/item";
import Button from "../ui/button/Button";

export interface IngredientRow {
  item_id: number;
  quantity: number;
}

interface ProductionIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ingredients: IngredientRow[]) => void;
  currentIngredients: ProductionIngredientResponse[];
  finalProductId: number;
  isLoading?: boolean;
}

const ProductionIngredientsModal: React.FC<ProductionIngredientsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentIngredients,
  finalProductId,
  isLoading = false,
}) => {
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [itemSearch, setItemSearch] = useState("");

  const { data: itemsData } = useGetAllItemsQuery(
    {
      limit: 30,
      item_type: ItemType.RAW,
      search: itemSearch || undefined,
    },
    { skip: !isOpen }
  );

  const rawItems = (itemsData?.data ?? []).filter(
    (item) => item.id !== finalProductId
  );

  const rawItemOptions = rawItems.map((item) => ({
    id: item.id,
    name: `${item.name} (Stock: ${Number(item.quantity).toFixed(0)})`,
  }));

  useEffect(() => {
    if (!isOpen) return;
    if (currentIngredients.length > 0) {
      setIngredients(
        currentIngredients.map((ing) => ({
          item_id: ing.item_id,
          quantity: Number(ing.quantity),
        }))
      );
    } else {
      setIngredients([{ item_id: 0, quantity: 1 }]);
    }
    setItemSearch("");
  }, [isOpen, currentIngredients]);

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { item_id: 0, quantity: 1 }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientRow,
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

    const validIngredients = ingredients.filter(
      (ing) => ing.item_id > 0 && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      alert("Add at least one ingredient with a valid quantity");
      return;
    }

    const itemIds = validIngredients.map((ing) => ing.item_id);
    const uniqueIds = new Set(itemIds);
    if (itemIds.length !== uniqueIds.size) {
      alert("Duplicate ingredients are not allowed");
      return;
    }

    if (validIngredients.some((ing) => ing.item_id === finalProductId)) {
      alert("Final product cannot be an ingredient");
      return;
    }

    onSubmit(validIngredients);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Edit Production Ingredients
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Customize ingredients for this batch only. This does not change the
            original recipe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <Label htmlFor={`ing-item-${index}`} className="text-xs">
                      Raw Item
                    </Label>
                    <SelectDropdown
                      options={rawItemOptions}
                      value={ingredient.item_id}
                      onChange={(value) =>
                        updateIngredient(index, "item_id", Number(value))
                      }
                      onSearchChange={setItemSearch}
                      optionsAreFiltered={true}
                      placeholder="Search raw item..."
                      searchable
                    />
                  </div>

                  <div className="w-32">
                    <Label htmlFor={`ing-qty-${index}`} className="text-xs">
                      Quantity/Unit
                    </Label>
                    <Input
                      id={`ing-qty-${index}`}
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
              {isLoading ? "Saving..." : "Save Ingredients"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProductionIngredientsModal;
