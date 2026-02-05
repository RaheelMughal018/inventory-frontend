import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "sonner";
import { useListRecipesQuery } from "../../redux/services/recipe";
import {
  useProductionPreviewQuery,
  useProductionFeasibilityMutation,
  useCreateProductionDraftMutation,
  useExecuteProductionDraftMutation,
  useCompleteProductionBatchMutation,
  useListProductionBatchesQuery,
  useDeleteProductionBatchMutation,
  ProductionFeasibilityResponse,
  ProductionBatchResponse,
} from "../../redux/services/production";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TailSpin } from "react-loader-spinner";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import { TrashBinIcon, EyeIcon, CheckCircleIcon } from "../../icons";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const SERIAL_PREFIX = "LEH-";

function ProductionPage() {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState<number[]>([1]);
  const [feasibilityResult, setFeasibilityResult] =
    useState<ProductionFeasibilityResponse | null>(null);
  const [draftBatch, setDraftBatch] = useState<ProductionBatchResponse | null>(
    null,
  );
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [batchToComplete, setBatchToComplete] =
    useState<ProductionBatchResponse | null>(null);

  const { data: recipesData } = useListRecipesQuery({});
  const recipes = recipesData?.recipes ?? [];
  const finalProductOptions = recipes.map((r) => ({
    id: r.final_product_id,
    name: r.final_product_name,
  }));

  const { data: preview, isLoading: previewLoading } =
    useProductionPreviewQuery(
      {
        final_product_id: selectedProductId,
        quantity: Math.max(1, quantity),
      },
      { skip: !selectedProductId || quantity < 1 },
    );

  const [checkFeasibility, { isLoading: feasibilityLoading }] =
    useProductionFeasibilityMutation();
  const [createDraft, { isLoading: draftLoading }] =
    useCreateProductionDraftMutation();
  const [executeDraft, { isLoading: executeLoading }] =
    useExecuteProductionDraftMutation();
  const [completeBatch, { isLoading: completeLoading }] =
    useCompleteProductionBatchMutation();
  const [deleteBatch, { isLoading: deleteLoading }] =
    useDeleteProductionBatchMutation();

  const { data: batchesData, isLoading: batchesLoading } =
    useListProductionBatchesQuery({});

  const handleCheckFeasibility = async () => {
    if (!selectedProductId || quantity < 1) {
      toast.error("Select a product and enter quantity");
      return;
    }
    try {
      const result = await checkFeasibility({
        final_product_id: selectedProductId,
        quantity,
      }).unwrap();
      setFeasibilityResult(result);
    } catch (err: unknown) {
      handleApiError(err, "Feasibility check failed");
    }
  };

  const useMaxProducible = () => {
    if (feasibilityResult && feasibilityResult.max_producible_quantity > 0) {
      setQuantity(feasibilityResult.max_producible_quantity);
      handleApiSuccess(
        `Quantity set to ${feasibilityResult.max_producible_quantity}`,
      );
    }
  };

  const handleStartProduction = async () => {
    if (!selectedProductId || quantity < 1) return;
    
    // Validate serial numbers
    const validSerials = serialNumbers.filter(num => num > 0).map(num => String(num));
    if (validSerials.length !== quantity) {
      toast.error(`Please enter ${quantity} valid serial numbers`);
      return;
    }
    
    try {
      const batch = await createDraft({
        final_product_id: selectedProductId,
        quantity,
        serial_numbers: validSerials,
      }).unwrap();
      setDraftBatch(batch);
      setFeasibilityResult(null);
      handleApiSuccess(
        `Draft created. Confirm to deduct raw items and complete production.`,
      );
    } catch (err: unknown) {
      handleApiError(err, "Failed to create production draft");
    }
  };

  const handleExecuteDraft = async (batch: ProductionBatchResponse) => {
    try {
      await executeDraft(batch.id).unwrap();
      handleApiSuccess(
        "Raw items deducted. Complete the batch to add final product to stock.",
      );
      setDraftBatch(null);
    } catch (err: unknown) {
      handleApiError(err, "Failed to execute production");
    }
  };

  const handleCompleteBatch = async (batch: ProductionBatchResponse) => {
    try {
      await completeBatch(batch.id).unwrap();
      handleApiSuccess("Production complete. Final product added to stock.");
      setConfirmCompleteOpen(false);
      setBatchToComplete(null);
    } catch (err: unknown) {
      handleApiError(err, "Failed to complete batch");
    }
  };

  const openCompleteModal = (batch: ProductionBatchResponse) => {
    setBatchToComplete(batch);
    setConfirmCompleteOpen(true);
  };

  const handleDeleteBatch = async (batch: ProductionBatchResponse) => {
    if (!window.confirm(`Are you sure you want to delete batch ${batch.id}?`)) {
      return;
    }
    try {
      await deleteBatch(batch.id).unwrap();
      handleApiSuccess("Batch deleted successfully");
    } catch (err: unknown) {
      handleApiError(err, "Failed to delete batch");
    }
  };

  const batches = batchesData?.batches ?? [];

  return (
    <>
      <PageMeta
        title="Production"
        description="Build final products from raw items. Preview requirements, check stock, and run production."
      />
      <PageBreadcrumb pageTitle="Production" />
      <div className="space-y-6">
        <SimpleComponentCard
          title="Start production"
          desc="Select a final product and quantity. Preview raw requirements and check if you have enough stock."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Final product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setFeasibilityResult(null);
                  }}
                  className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 min-w-[200px]"
                >
                  <option value="">Select product</option>
                  {finalProductOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity to build
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const newQty = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setQuantity(newQty);
                    setFeasibilityResult(null);
                    // Adjust serial numbers array based on new quantity
                    setSerialNumbers((prev) => {
                      const newSerials = Array.from({ length: newQty }, (_, i) => prev[i] || i + 1);
                      return newSerials;
                    });
                  }}
                  className="h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-24"
                />
              </div>
              <Button
                variant="green"
                onClick={handleCheckFeasibility}
                disabled={
                  !selectedProductId || quantity < 1 || feasibilityLoading
                }
                className="h-11 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {feasibilityLoading ? "Checking..." : "Check if I can build"}
              </Button>
              {feasibilityResult &&
                !feasibilityResult.feasible &&
                feasibilityResult.max_producible_quantity > 0 && (
                  <button
                    type="button"
                    onClick={useMaxProducible}
                    className="h-11 px-4 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
                  >
                    Use max ({feasibilityResult.max_producible_quantity})
                  </button>
                )}
            </div>

            {feasibilityResult && (
              <div
                className={`p-4 rounded-xl border ${
                  feasibilityResult.feasible
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                }`}
              >
                {feasibilityResult.feasible ? (
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    You can build {feasibilityResult.requested_quantity}{" "}
                    unit(s). Stock is sufficient.
                  </p>
                ) : (
                  <>
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      {feasibilityResult.message}
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      You can build up to{" "}
                      <strong>
                        {feasibilityResult.max_producible_quantity}
                      </strong>{" "}
                      unit(s) with current stock.
                    </p>
                    {feasibilityResult.insufficient_items.length > 0 && (
                      <ul className="mt-2 text-sm list-disc list-inside text-amber-700 dark:text-amber-300">
                        {feasibilityResult.insufficient_items.map((item) => (
                          <li key={item.raw_item_id}>
                            {item.raw_item_name}: need {item.required_quantity},
                            have {item.available_quantity} (short{" "}
                            {item.shortfall})
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            {preview && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <strong className="text-gray-800 dark:text-white/90">{preview.final_product_name}</strong> <span className="text-gray-600 dark:text-gray-400">— Build {preview.quantity} unit(s)</span>
                  {preview.total_estimated_cost != null && (
                    <p className="text-gray-600 dark:text-white/90">
                      Total estimated cost: ${Number(preview.total_estimated_cost).toFixed(2)}
                    </p>
                  )}
                </div>
                {previewLoading ? (
                  <div className="p-8 flex justify-center">
                    <TailSpin height={32} width={32} color="#3b82f6" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Raw item
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Qty per unit
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Required total
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Available
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Status
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          Est. cost
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.raw_requirements.map((req) => (
                        <TableRow
                          key={req.raw_item_id}
                          className="border-b border-gray-200 last:border-0 dark:border-gray-700"
                        >
                          <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                            {req.raw_item_name}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                            {Number(req.quantity_per_unit)}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                            {Number(req.quantity_required)}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                            {req.available_quantity}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                            <span
                              className={
                                req.sufficient
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }
                            >
                              {req.sufficient ? "OK" : "Insufficient"}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                            {req.avg_price != null
                              ? `$${(Number(req.quantity_required) * req.avg_price).toFixed(2)}`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}

            {preview && (
              <>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Serial numbers (integers only, prefix "{SERIAL_PREFIX}" will be added automatically)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {serialNumbers.map((serial, index) => (
                      <div key={index}>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          #{index + 1}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={serial || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10) || 0;
                            setSerialNumbers((prev) => {
                              const newSerials = [...prev];
                              newSerials[index] = value;
                              return newSerials;
                            });
                          }}
                          placeholder="e.g., 1"
                          className="w-full h-9 rounded-lg border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="primary"
                    onClick={handleStartProduction}
                    disabled={draftLoading || !selectedProductId || quantity < 1}
                  >
                    {draftLoading ? "Creating..." : "Start production"}
                  </Button>
                </div>
              </>
            )}

            {/* {draftBatch && (
              <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20">
                <p className="font-medium text-brand-800 dark:text-brand-200">
                  Draft created (Batch: {draftBatch.id}). Confirm to deduct raw
                  items and then complete to add final product to stock.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExecuteDraft(draftBatch)}
                    disabled={executeLoading}
                    className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {executeLoading
                      ? "Confirming..."
                      : "Confirm (deduct raw items)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftBatch(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </SimpleComponentCard>

        <SimpleComponentCard
          title="Production batches"
          desc="Recent batches. Confirm draft batches to deduct raw items; complete IN_PROCESS batches to add final product to stock."
        >
          {batchesLoading ? (
            <div className="p-8 flex justify-center">
              <TailSpin height={32} width={32} color="#3b82f6" />
            </div>
          ) : batches.length === 0 ? (
            <p className="py-6 text-center text-gray-500 dark:text-gray-400">
              No production batches yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Batch ID
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Product
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Qty
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Stage
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      View
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow
                      key={b.id}
                      className="border-b border-gray-100 dark:border-white/[0.05]"
                    >
                      <TableCell className="px-5 py-3 font-mono text-sm text-gray-800 dark:text-white/90">
                        {b.id}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                        {b.final_product_name}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {b.quantity_produced}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <span
                          className={
                            b.stage === "DONE"
                              ? "text-green-600 dark:text-green-400"
                              : b.stage === "IN_PROCESS"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          {b.stage}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/production/batches/view/${b.id}`)}
                          className="p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="size-5" />
                        </button>
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {b.stage === "DRAFT" && (
                            <button
                              type="button"
                              onClick={() => handleExecuteDraft(b)}
                              disabled={executeLoading}
                              className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Confirm batch"
                            >
                              <CheckCircleIcon className="size-5" />
                            </button>
                          )}
                          {b.stage === "IN_PROCESS" && (
                            <button
                              type="button"
                              onClick={() => openCompleteModal(b)}
                              disabled={completeLoading}
                              className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Complete batch"
                            >
                              <CheckCircleIcon className="size-5" />
                            </button>
                          )}
                          {b.stage === "DONE" && (
                            <span className="text-gray-400 text-sm px-2">—</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteBatch(b)}
                            disabled={deleteLoading}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete batch"
                          >
                            <TrashBinIcon className="size-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SimpleComponentCard>
      </div>

      <Modal
        isOpen={confirmCompleteOpen}
        onClose={() => {
          setConfirmCompleteOpen(false);
          setBatchToComplete(null);
        }}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Complete production
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This will add <strong>{batchToComplete?.quantity_produced}</strong>{" "}
            unit(s) of &quot;{batchToComplete?.final_product_name}&quot; to
            stock. Raw items were already deducted. Continue?
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmCompleteOpen(false);
                setBatchToComplete(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                batchToComplete && handleCompleteBatch(batchToComplete)
              }
              disabled={completeLoading}
              className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {completeLoading ? "Completing..." : "Complete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ProductionPage;
