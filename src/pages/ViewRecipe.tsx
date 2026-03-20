import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import Button from "../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import {
  useGetRecipeByIdQuery,
  useGetRecipeCostQuery,
  RecipeIngredientResponse,
  CostBreakdown,
} from "../redux/services/recipe";
import { TailSpin } from "react-loader-spinner";
import formatDateTime from "../helper/date_converter";
import { handleApiError, handleApiSuccess } from "../helper/error_handler";
import { generateRecipePDF } from "../helper/pdf_generator";
import { DownloadIcon } from "../icons";

const ViewRecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = Number(id);

  // Queries
  const { data: recipeData, isLoading: recipeLoading } = useGetRecipeByIdQuery(recipeId, {
    skip: !recipeId,
  });
  const { data: costData, isLoading: costLoading } = useGetRecipeCostQuery(recipeId, {
    skip: !recipeId,
  });

  const recipe = recipeData?.data;
  const cost = costData?.data;

  const handleGeneratePDF = () => {
    if (!recipe) return;
    try {
      generateRecipePDF(recipe, cost ?? null);
      handleApiSuccess("PDF generated successfully");
    } catch (error) {
      handleApiError(error, "Failed to generate PDF");
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
        {/* Header with actions */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {recipe.name || recipe.final_product.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Created on {formatDateTime(recipe.created_at)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/recipes")} className="px-6">
              Back
            </Button>
            <Button variant="green" onClick={handleGeneratePDF} className="px-6">
              PDF <DownloadIcon height={25} width={20} />
            </Button>
          </div>
        </div>

        {/* Recipe Information */}
        <SimpleComponentCard
          title="Recipe Information"
          desc="Details about this recipe"
        >
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
                      {cost.breakdown.map((item: CostBreakdown) => (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipe.ingredients.map((ing: RecipeIngredientResponse) => (
                    <TableRow
                      key={ing.item_id}
                      className="border-b border-gray-100 last:border-0 dark:border-white/5"
                    >
                      <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                        {ing.item.name}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
                        {Number(ing.quantity)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
                        {Number(ing.item.avg_price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SimpleComponentCard>
      </div>
    </>
  );
};

export default ViewRecipePage;
