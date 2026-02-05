import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { RecipeResponse, RecipeItemCreate } from "../../redux/services/recipe";
import { Item } from "../../redux/services/item";

export interface RecipeFormData {
  final_product_id: string;
  name: string;
  items: { raw_item_id: string; quantity_per_unit: number }[];
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeFormData) => void;
  mode: "add" | "edit";
  initialData?: RecipeResponse | null;
  finalProducts: Item[];
  rawItems: Item[];
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  finalProducts,
  rawItems,
}) => {
  const [finalProductId, setFinalProductId] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState<{ raw_item_id: string; quantity_per_unit: number }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      setFinalProductId(initialData.final_product_id);
      setName(initialData.name || "");
      setItems(
        initialData.items.map((i) => ({
          raw_item_id: i.raw_item_id,
          quantity_per_unit: Number(i.quantity_per_unit),
        }))
      );
      return;
    }
    setFinalProductId("");
    setName("");
    setItems([{ raw_item_id: "", quantity_per_unit: 0 }]);
  }, [isOpen, mode, initialData]);

  const addRow = () => {
    setItems((prev) => [...prev, { raw_item_id: "", quantity_per_unit: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: "raw_item_id" | "quantity_per_unit", value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((row) => row.raw_item_id && row.quantity_per_unit > 0);
    if (validItems.length === 0) {
      alert("Add at least one ingredient with a positive quantity.");
      return;
    }
    if (mode === "add" && !finalProductId) {
      alert("Select a final product.");
      return;
    }
    onSubmit({
      final_product_id: finalProductId,
      name: name.trim() || undefined,
      items: validItems as RecipeItemCreate[],
    } as RecipeFormData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Recipe" : "Add Recipe"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit"
              ? "Update ingredients and quantities for this final product."
              : "Define which raw items and how much is needed per unit of final product."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "add" && (
            <div>
              <Label>Final Product</Label>
              <select
                value={finalProductId}
                onChange={(e) => setFinalProductId(e.target.value)}
                className="mt-1 w-full h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Select final product</option>
                {finalProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {mode === "edit" && (
            <div>
              <Label>Final Product</Label>
              <p className="mt-1 text-gray-800 dark:text-white font-medium">
                {initialData?.final_product_name ?? "—"}
              </p>
            </div>
          )}

          <div>
            <Label>Recipe name (optional)</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Noodle Recipe"
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ingredients (raw items & quantity per 1 unit)</Label>
              <button
                type="button"
                onClick={addRow}
                className="text-sm text-brand-500 hover:underline"
              >
                + Add row
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={row.raw_item_id}
                    onChange={(e) => updateRow(index, "raw_item_id", e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Select raw item</option>
                    {rawItems.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (stock: {r.total_quantity})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={row.quantity_per_unit || ""}
                    onChange={(e) =>
                      updateRow(index, "quantity_per_unit", parseFloat(e.target.value) || 0)
                    }
                    placeholder="Qty"
                    className="w-24 h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={items.length <= 1}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-40"
                    title="Remove row"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
            >
              {mode === "edit" ? "Update Recipe" : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RecipeModal;
