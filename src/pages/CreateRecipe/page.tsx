import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import SelectDropdown from "../../components/form/SelectDropdown";
import {
  useCreateRecipeMutation,
  RecipeItemCreate,
} from "../../redux/services/recipe";
import { useGetAllItemsQuery } from "../../redux/services/item";
import { ItemType } from "../../redux/services/item";
import { handleApiError } from "../../helper/error_handler";
import { toast } from "sonner";

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const [createRecipe, { isLoading }] = useCreateRecipeMutation();
  const { data: itemsData } = useGetAllItemsQuery({});

  const [finalProductId, setFinalProductId] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState<
    { raw_item_id: string; quantity_per_unit: number }[]
  >([{ raw_item_id: "", quantity_per_unit: 0 }]);

  const finalProducts = (itemsData?.items ?? []).filter(
    (i) => i.type === ItemType.FINAL_PRODUCT
  );
  const rawItems = (itemsData?.items ?? []).filter(
    (i) => i.type === ItemType.RAW_MATERIAL
  );

  const finalProductOptions = finalProducts.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const rawItemOptions = rawItems.map((r) => ({
    id: r.id,
    name: `${r.name} (stock: ${r.total_quantity})`,
  }));

  const addRow = () => {
    setItems((prev) => [...prev, { raw_item_id: "", quantity_per_unit: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (
    index: number,
    field: "raw_item_id" | "quantity_per_unit",
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCancel = () => {
    navigate("/recipes");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(
      (row) => row.raw_item_id && row.quantity_per_unit > 0
    );
    if (validItems.length === 0) {
      handleApiError("Add at least one ingredient with a positive quantity.");
      return;
    }
    if (!finalProductId) {
      handleApiError("Select a final product.");
      return;
    }

    try {
      await createRecipe({
        final_product_id: finalProductId,
        name: name.trim() || undefined,
        items: validItems as RecipeItemCreate[],
      }).unwrap();
      toast.success("Recipe created successfully");
      navigate("/recipes");
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail;
      toast.error(msg || "Failed to create recipe");
    }
  };

  return (
    <>
      <PageMeta
        title="Create Recipe"
        description="Create a new recipe for a final product"
      />
      <PageBreadcrumb pageTitle="Create Recipe" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Recipe
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Define which raw items and how much is needed per unit of final
              product.
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </div>

        <SimpleComponentCard title="Recipe Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>
                Final Product <span className="text-red-500">*</span>
              </Label>
              <SelectDropdown
                options={finalProductOptions}
                value={finalProductId}
                onChange={(value) => setFinalProductId(String(value))}
                placeholder="Select final product..."
                searchable
                required
              />
            </div>
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
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cost per Unit
              </p>
              <p className="mt-1 text-gray-800 dark:text-white font-medium">—</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ingredients Count
              </p>
              <p className="mt-1 text-gray-800 dark:text-white">
                {items.filter((r) => r.raw_item_id && r.quantity_per_unit > 0).length} items
              </p>
            </div>
          </div>
        </SimpleComponentCard>

        <SimpleComponentCard
          title="Ingredients (raw items & quantity per 1 unit)"
          desc="Raw materials and quantities required for one unit of the final product"
          extra={
            <button
              type="button"
              onClick={addRow}
              className="text-sm text-brand-500 hover:underline"
            >
              + Add row
            </button>
          }
        >
          <div className="h-full rounded-xl border border-gray-200 dark:border-white/[0.05] min-h-[12rem]">
            <div className="space-y-2 p-4">
              {items.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1 min-w-0">
                    <SelectDropdown
                      options={rawItemOptions}
                      value={row.raw_item_id}
                      onChange={(value) =>
                        updateRow(index, "raw_item_id", String(value))
                      }
                      placeholder="Select raw item..."
                      searchable
                      className="w-full"
                    />
                  </div>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={row.quantity_per_unit || ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "quantity_per_unit",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Qty"
                    className="w-24 h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={items.length <= 1}
                    className="p-2 h-11 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-40"
                    title="Remove row"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </SimpleComponentCard>
      </form>
    </>
  );
};

export default CreateRecipePage;
