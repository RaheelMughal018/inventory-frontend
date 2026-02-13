import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RecipesTable from "../../components/tables/BasicTables/RecipesTable";
import { useListRecipesQuery } from "../../redux/services/recipe";
import SearchBar from "../../components/common/SearchBar";

const RecipePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: recipesData, isLoading } = useListRecipesQuery({
    search: search || undefined,
    limit: 100,
    skip: 0,
  });

  const handleAddRecipe = () => {
    navigate("/recipes/create");
  };

  const handleView = (recipe: { id: string }) => {
    navigate(`/recipes/view/${recipe.id}`);
  };

  const handleEdit = (recipe: { id: string }) => {
    navigate(`/recipes/view/${recipe.id}?mode=edit`);
  };

  return (
    <>
      <PageMeta
        title="Recipes"
        description="Manage recipes for final products (raw items and quantities)"
      />
      <PageBreadcrumb pageTitle="Recipes" />
      <div className="space-y-6">
        <ComponentCard
          title="Recipes"
          addButtonText="Add Recipe"
          onAddClick={handleAddRecipe}
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
            onView={handleView}
            onEdit={handleEdit}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default RecipePage;
