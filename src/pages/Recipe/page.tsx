import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RecipesTable from "../../components/tables/BasicTables/RecipesTable";
import {
  useGetAllRecipesQuery,
  Recipe,
} from "../../redux/services/recipe";

const RecipePage = () => {
  const navigate = useNavigate();

  // Fetch recipes
  const { data: recipesData, isLoading: recipesLoading } = useGetAllRecipesQuery();

  const recipes = recipesData?.data ?? [];

  const handleAddClick = () => {
    navigate("/recipes/create");
  };

  const handleEdit = (recipe: Recipe) => {
    navigate(`/recipes/edit/${recipe.id}`);
  };

  const handleView = (recipe: Recipe) => {
    navigate(`/recipes/edit/${recipe.id}`);
  };

  return (
    <>
      <PageMeta
        title="Recipes"
        description="Manage recipes for final products with raw material ingredients"
      />
      <PageBreadcrumb pageTitle="Recipes" />
      <div className="space-y-6">
        <ComponentCard
          title="Recipes"
          addButtonText="Add Recipe"
          onAddClick={handleAddClick}
        >
          <RecipesTable
            recipes={recipes}
            loading={recipesLoading}
            onView={handleView}
            onEdit={handleEdit}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default RecipePage;
