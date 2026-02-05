import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "sonner";
import RecipesTable from "../../components/tables/BasicTables/RecipesTable";
import {
  RecipeResponse,
  useListRecipesQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
} from "../../redux/services/recipe";
import { useGetAllItemsQuery } from "../../redux/services/item";
import { ItemType } from "../../redux/services/item";
import RecipeModal, { RecipeFormData } from "../../components/modals/RecipeModal";
import SearchBar from "../../components/common/SearchBar";

const RecipePage = () => {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeResponse | null>(null);

  const { data: recipesData, isLoading } = useListRecipesQuery({
    search: search || undefined,
    limit: 100,
    skip: 0,
  });
  const { data: itemsData } = useGetAllItemsQuery({});
  const [createRecipe] = useCreateRecipeMutation();
  const [updateRecipe] = useUpdateRecipeMutation();

  const finalProducts = (itemsData?.items ?? []).filter(
    (i) => i.type === ItemType.FINAL_PRODUCT
  );
  const rawItems = (itemsData?.items ?? []).filter(
    (i) => i.type === ItemType.RAW_MATERIAL
  );

  const handleAdd = async (form: RecipeFormData) => {
    try {
      await createRecipe({
        final_product_id: form.final_product_id,
        name: form.name || undefined,
        items: form.items,
      }).unwrap();
      toast.success("Recipe created successfully");
      setIsAddOpen(false);
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail;
      toast.error(msg || "Failed to create recipe");
    }
  };

  const handleEdit = async (form: RecipeFormData) => {
    if (!selectedRecipe) return;
    try {
      await updateRecipe({
        recipeId: selectedRecipe.id,
        data: { name: form.name || undefined, items: form.items },
      }).unwrap();
      toast.success("Recipe updated successfully");
      setIsEditOpen(false);
      setSelectedRecipe(null);
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail;
      toast.error(msg || "Failed to update recipe");
    }
  };

  return (
    <>
      <PageMeta title="Recipes" description="Manage recipes for final products (raw items and quantities)" />
      <PageBreadcrumb pageTitle="Recipes" />
      <div className="space-y-6">
        <ComponentCard
          title="Recipes"
          addButtonText="Add Recipe"
          onAddClick={() => setIsAddOpen(true)}
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={() => {}}
              placeholder="Search recipes..."
            />
          }
        >
          <RecipesTable
            recipes={recipesData?.recipes ?? []}
            loading={isLoading}
            onEdit={(r) => {
              setSelectedRecipe(r);
              setIsEditOpen(true);
            }}
          />
        </ComponentCard>
      </div>

      <RecipeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
        mode="add"
        finalProducts={finalProducts}
        rawItems={rawItems}
      />
      <RecipeModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRecipe(null);
        }}
        onSubmit={handleEdit}
        mode="edit"
        initialData={selectedRecipe}
        finalProducts={finalProducts}
        rawItems={rawItems}
      />
    </>
  );
};

export default RecipePage;
