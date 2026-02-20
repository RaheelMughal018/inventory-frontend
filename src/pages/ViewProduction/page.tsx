import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import Button from "../../components/ui/button/Button";
import {
  useGetProductionByIdQuery,
  useGetProductionFeasibilityQuery,
  ProductionStatus,
} from "../../redux/services/production";
import formatDateTime from "../../helper/date_converter";
import { TailSpin } from "react-loader-spinner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

const ViewProductionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productionId = Number(id);

  const { data: productionData, isLoading: productionLoading } = useGetProductionByIdQuery(
    productionId,
    { skip: !productionId }
  );
  const { data: feasibilityData } = useGetProductionFeasibilityQuery(productionId, {
    skip: !productionId || !productionData?.data,
  });

  const production = productionData?.data;
  const feasibility = feasibilityData?.data;

  const getStatusBadge = (status: ProductionStatus) => {
    const colors = {
      [ProductionStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      [ProductionStatus.IN_PROCESS]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      [ProductionStatus.DONE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[status] ?? colors[ProductionStatus.DRAFT];
  };

  if (productionLoading || !productionId) {
    return (
      <>
        <PageMeta title="Production" description="View production details" />
        <PageBreadcrumb pageTitle="Production" />
        <div className="flex justify-center items-center py-20">
          <TailSpin height={48} width={48} color="#3b82f6" />
        </div>
      </>
    );
  }

  if (!production) {
    return (
      <>
        <PageMeta title="Production Not Found" description="Production not found" />
        <PageBreadcrumb pageTitle="Production Not Found" />
        <SimpleComponentCard title="Not Found" desc="The production batch could not be found">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Production batch not found</p>
            <Button variant="primary" onClick={() => navigate("/production")} className="mt-4">
              Back to Production
            </Button>
          </div>
        </SimpleComponentCard>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`Production - ${production.batch_number}`}
        description={`View production batch ${production.batch_number}`}
      />
      <PageBreadcrumb pageTitle={`Batch: ${production.batch_number}`} />

      <div className="space-y-6">
        {/* Header & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {production.batch_number}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {production.recipe.name} · {production.recipe.final_product.name}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/production")}>
            ← Back to Production
          </Button>
        </div>

        {/* Summary */}
        <SimpleComponentCard title="Summary" desc="Batch overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</p>
              <span className={`inline-block mt-1 px-2 py-1 rounded text-sm font-medium ${getStatusBadge(production.status)}`}>
                {production.status}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</p>
              <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
                {production.quantity}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Cost</p>
              <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
                {Number(production.total_cost).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost per Unit</p>
              <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
                {Number(production.cost_per_unit).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created by:</span>{" "}
              <span className="text-gray-800 dark:text-white">{production.admin.name}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created:</span>{" "}
              <span className="text-gray-800 dark:text-white">{formatDateTime(production.created_at)}</span>
            </div>
            {production.start_date && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Started:</span>{" "}
                <span className="text-gray-800 dark:text-white">{formatDateTime(production.start_date)}</span>
              </div>
            )}
            {production.completion_date && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Completed:</span>{" "}
                <span className="text-gray-800 dark:text-white">{formatDateTime(production.completion_date)}</span>
              </div>
            )}
            {production.notes && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Notes:</span>{" "}
                <span className="text-gray-800 dark:text-white">{production.notes}</span>
              </div>
            )}
          </div>
        </SimpleComponentCard>

        {/* Ingredients (Production) */}
        <SimpleComponentCard
          title="Production Ingredients"
          desc="Raw materials used for this batch (quantity per unit × batch quantity)"
        >
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Item
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Qty per Unit
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Total Required
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Avg Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    From Recipe
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {production.production_ingredients.map((ing) => {
                  const qtyPerUnit = Number(ing.quantity);
                  const totalRequired = qtyPerUnit * production.quantity;
                  const lineCost = totalRequired * Number(ing.item.avg_price);
                  return (
                    <TableRow key={ing.id} className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]">
                      <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                        {ing.item.name}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {qtyPerUnit.toFixed(0)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {totalRequired.toFixed(0)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {Number(ing.item.avg_price).toFixed(2)} (line: {lineCost.toFixed(2)})
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <span className={ing.is_from_recipe ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                          {ing.is_from_recipe ? "Yes" : "Added"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </SimpleComponentCard>

        {/* Feasibility (for DRAFT/IN_PROCESS) */}
        {feasibility && production.status !== ProductionStatus.DONE && (
          <SimpleComponentCard title="Stock Feasibility" desc="Current stock check for this batch">
            <div className={`p-4 rounded-lg ${feasibility.canProduce ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"}`}>
              <p className={feasibility.canProduce ? "text-green-800 dark:text-green-200 font-medium" : "text-amber-800 dark:text-amber-200 font-medium"}>
                {feasibility.canProduce ? "✓ Stock is sufficient" : "✗ Insufficient stock for some ingredients"}
              </p>
              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                Estimated cost: {Number(feasibility.total_estimated_cost).toFixed(2)}
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {feasibility.ingredients.map((ing) => (
                <div
                  key={ing.item_id}
                  className="flex justify-between items-center p-2 rounded bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm"
                >
                  <span className="text-gray-800 dark:text-white">{ing.item_name}</span>
                  <span className={ing.sufficient ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    Need: {ing.required.toFixed(0)} | Available: {ing.available.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </SimpleComponentCard>
        )}

        {/* Production Items (Serial Numbers) - when DONE */}
        {production.status === ProductionStatus.DONE && production.production_items?.length > 0 && (
          <SimpleComponentCard title="Produced Units" desc="Serial numbers of finished units">
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      #
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Serial Number
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Cost per Unit
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {production.production_items.map((item, index) => (
                    <TableRow key={item.id} className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]">
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-3 font-mono text-gray-800 dark:text-white/90">
                        {item.serial_number}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {Number(item.cost_per_unit).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SimpleComponentCard>
        )}
      </div>
    </>
  );
};

export default ViewProductionPage;
