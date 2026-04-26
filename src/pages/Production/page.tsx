import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import {
  useGetAllProductionsQuery,
  useCreateProductionMutation,
  useStartProductionMutation,
  useCompleteProductionMutation,
  useDeleteProductionMutation,
  // useGetProductionFeasibilityQuery,
  Production,
  ProductionStatus,
} from "../../redux/services/production";
import { useGetAllRecipesQuery } from "../../redux/services/recipe";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import SelectDropdown from "../../components/form/SelectDropdown";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { TailSpin } from "react-loader-spinner";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import formatDateTime from "../../helper/date_converter";

const ProductionPage = () => {
  const navigate = useNavigate();

  // Form state for creating production
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [productionExpense, setProductionExpense] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Serial numbers modal state
  const { isOpen: serialModalOpen, openModal: openSerialModal, closeModal: closeSerialModal } = useModal();
  const [productionToComplete, setProductionToComplete] = useState<Production | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

  // Start production confirmation modal
  const { isOpen: startConfirmOpen, openModal: openStartConfirm, closeModal: closeStartConfirm } = useModal();
  const [productionToStart, setProductionToStart] = useState<Production | null>(null);

  // Delete production confirmation modal
  const { isOpen: deleteConfirmOpen, openModal: openDeleteConfirm, closeModal: closeDeleteConfirm } = useModal();
  const [productionToDelete, setProductionToDelete] = useState<Production | null>(null);

  // Fetch data
  const { data: recipesData, isLoading: recipesLoading } = useGetAllRecipesQuery();
  const { data: productionsData, isLoading: productionsLoading, refetch } = useGetAllProductionsQuery();

  // // Get feasibility when recipe and quantity are selected
  // const shouldFetchFeasibility = selectedRecipeId > 0 && quantity > 0;
  // const selectedRecipe = recipesData?.data?.find((r) => r.id === selectedRecipeId);
  // const { data: feasibilityData, isLoading: feasibilityLoading } = useGetProductionFeasibilityQuery(
  //   selectedRecipe?.id || 0,
  //   {
  //     skip: !shouldFetchFeasibility || !selectedRecipe,
  //   }
  // );

  // Mutations
  const [createProduction, { isLoading: creating }] = useCreateProductionMutation();
  const [startProduction, { isLoading: starting }] = useStartProductionMutation();
  const [completeProduction, { isLoading: completing }] = useCompleteProductionMutation();
  const [deleteProduction, { isLoading: deleting }] = useDeleteProductionMutation();

  const recipes = recipesData?.data ?? [];
  const productions = productionsData?.data ?? [];

  const recipeOptions = recipes.map((recipe) => ({
    id: recipe.id,
    name: `${recipe.name} (${recipe.final_product.name})`,
  }));

  // Handle create production
  const handleCreateProduction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecipeId || !batchNumber.trim() || quantity < 1) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await createProduction({
        recipe_id: selectedRecipeId,
        quantity,
        batch_number: batchNumber.trim(),
        production_expense: productionExpense > 0 ? productionExpense : undefined,
        notes: notes.trim() || undefined,
      }).unwrap();
      handleApiSuccess("Production created in DRAFT status");

      // Reset form
      setSelectedRecipeId(0);
      setQuantity(1);
      setBatchNumber("");
      setProductionExpense(0);
      setNotes("");
    } catch (err: unknown) {
      handleApiError(err, "Failed to create production");
    }
  };

  // Handle start production (DRAFT → IN_PROCESS) — called from confirmation modal
  const handleStartProduction = async () => {
    if (!productionToStart) return;

    try {
      await startProduction(productionToStart.id).unwrap();
      handleApiSuccess("Production started. Raw materials deducted from stock.");
      closeStartConfirm();
      setProductionToStart(null);
      refetch();
    } catch (err: unknown) {
      handleApiError(err, "Failed to start production");
    }
  };

  // Open serial modal for completing production
  const handleOpenCompleteModal = (production: Production) => {
    setProductionToComplete(production);
    setSerialNumbers(Array.from({ length: production.quantity }, () => ""));
    openSerialModal();
  };

  // Handle complete production (IN_PROCESS → DONE)
  const handleCompleteProduction = async () => {
    if (!productionToComplete) return;

    // Validate serial numbers
    const validSerials = serialNumbers.filter((s) => s.trim().length > 0);
    if (validSerials.length !== productionToComplete.quantity) {
      alert(`Please enter exactly ${productionToComplete.quantity} serial numbers`);
      return;
    }

    // Check for duplicates
    const uniqueSerials = new Set(validSerials);
    if (uniqueSerials.size !== validSerials.length) {
      alert("Duplicate serial numbers are not allowed");
      return;
    }

    try {
      await completeProduction({
        id: productionToComplete.id,
        data: { serialNumbers: validSerials },
      }).unwrap();
      handleApiSuccess("Production completed. Final products added to stock.");
      closeSerialModal();
      setProductionToComplete(null);
      setSerialNumbers([]);
      refetch();
    } catch (err: unknown) {
      handleApiError(err, "Failed to complete production");
    }
  };

  // Handle delete production — called from confirmation modal
  const handleDeleteProduction = async () => {
    if (!productionToDelete) return;

    try {
      await deleteProduction(productionToDelete.id).unwrap();
      handleApiSuccess("Production deleted successfully");
      closeDeleteConfirm();
      setProductionToDelete(null);
      refetch();
    } catch (err: unknown) {
      handleApiError(err, "Failed to delete production");
    }
  };

  // Get status badge color
  const getStatusBadge = (status: ProductionStatus) => {
    const colors = {
      [ProductionStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      [ProductionStatus.IN_PROCESS]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      [ProductionStatus.DONE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[status] || colors[ProductionStatus.DRAFT];
  };

  // const feasibility = feasibilityData?.data;

  return (
    <>
      <PageMeta
        title="Production"
        description="Manage production batches - create, start, and complete manufacturing processes"
      />
      <PageBreadcrumb pageTitle="Production" />

      <div className="space-y-6">
        {/* Create Production Form */}
        <SimpleComponentCard title="Create Production Batch" desc="Create a new production batch in DRAFT status">
          <form onSubmit={handleCreateProduction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recipe Selection */}
              <div>
                <Label htmlFor="recipe">
                  Recipe <span className="text-red-500">*</span>
                </Label>
                <SelectDropdown
                  options={recipeOptions}
                  value={selectedRecipeId}
                  onChange={(value) => {
                    setSelectedRecipeId(Number(value));
                    setBatchNumber(`BATCH-${Date.now()}`);
                  }}
                  placeholder={recipesLoading ? "Loading recipes..." : "Select recipe..."}
                  searchable
                  disabled={recipesLoading}
                />
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Batch Number */}
              <div>
                <Label htmlFor="batch_number">
                  Batch Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="batch_number"
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., BATCH-2026-001"
                />
              </div>

              {/* Per-unit production expense */}
              <div>
                <Label htmlFor="production_expense">Production Expense / Unit (Optional)</Label>
                <Input
                  id="production_expense"
                  type="number"
                  min="0"
                  step="any"
                  value={productionExpense || ""}
                  onChange={(e) => setProductionExpense(parseFloat(e.target.value) || 0)}
                  placeholder="Added to each unit cost (labor, electricity, etc.)"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            {/* Feasibility Check */}
            {/* {selectedRecipeId > 0 && (
              <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">Feasibility Check</h4>
                {feasibilityLoading ? (
                  <div className="flex justify-center py-4">
                    <TailSpin height={24} width={24} color="#3b82f6" />
                  </div>
                ) : feasibility ? (
                  <>
                    <div
                      className={`p-3 rounded-lg mb-3 ${
                        feasibility.canProduce
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      <p
                        className={
                          feasibility.canProduce
                            ? "text-green-800 dark:text-green-200 font-medium"
                            : "text-red-800 dark:text-red-200 font-medium"
                        }
                      >
                        {feasibility.canProduce
                          ? `✓ Stock is sufficient to produce ${quantity} unit(s)`
                          : `✗ Insufficient stock to produce ${quantity} unit(s)`}
                      </p>
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                        Estimated cost: {Number(feasibility.total_estimated_cost).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {feasibility.ingredients.map((ing) => (
                        <div
                          key={ing.item_id}
                          className="flex justify-between items-center text-sm p-2 rounded bg-white dark:bg-gray-900/50"
                        >
                          <span className="text-gray-800 dark:text-white">{ing.item_name}</span>
                          <span
                            className={
                              ing.sufficient
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            Need: {ing.required.toFixed(0)} | Available: {ing.available.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Select a recipe and quantity to check feasibility
                  </p>
                )}
              </div>
            )} */}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" disabled={creating || !selectedRecipeId || !batchNumber.trim()}>
                {creating ? "Creating..." : "Create Production"}
              </Button>
            </div>
          </form>
        </SimpleComponentCard>

        {/* Productions List */}
        <SimpleComponentCard title="Production Batches" desc="Manage existing production batches">
          {productionsLoading ? (
            <div className="flex justify-center py-12">
              <TailSpin height={40} width={40} color="#3b82f6" />
            </div>
          ) : productions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No production batches yet. Create one above to get started.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Batch #
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Recipe / Product
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Quantity
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Cost
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Created
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                      View
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productions.map((production) => (
                    <TableRow key={production.id} className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]">
                      <TableCell className="px-5 py-3 font-mono text-sm text-gray-800 dark:text-white/90">
                        {production.batch_number}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <div>
                          <p className="text-gray-800 dark:text-white/90 font-medium">
                            {production.recipe.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {production.recipe.final_product.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                        {production.quantity}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(production.status)}`}>
                          {production.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {Number(production.total_cost).toFixed(2)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400 text-sm">
                        {formatDateTime(production.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/production/view/${production.id}`)}
                          className="p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                          title="View details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-end">
                        <div className="flex justify-end gap-2">
                          {production.status === ProductionStatus.DRAFT && (
                            <Button
                              variant="primary"
                              onClick={() => {
                                setProductionToStart(production);
                                openStartConfirm();
                              }}
                              disabled={starting}
                              className="text-xs px-3 py-1"
                            >
                              Start
                            </Button>
                          )}
                          {production.status === ProductionStatus.IN_PROCESS && (
                            <Button
                              variant="green"
                              onClick={() => handleOpenCompleteModal(production)}
                              disabled={completing}
                              className="text-xs px-3 py-1"
                            >
                              Complete
                            </Button>
                          )}
                          {production.status === ProductionStatus.DRAFT && (
                            <button
                              type="button"
                              onClick={() => {
                                setProductionToDelete(production);
                                openDeleteConfirm();
                              }}
                              disabled={deleting}
                              className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
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

      {/* Start Production Confirmation Modal */}
      <Modal isOpen={startConfirmOpen} onClose={closeStartConfirm}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Start Production
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start production batch{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {productionToStart?.batch_number}
            </span>
            ? This will deduct raw materials from stock.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeStartConfirm}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleStartProduction}
              disabled={starting}
            >
              {starting ? "Starting..." : "Start"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Production Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={closeDeleteConfirm}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Production
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete batch{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {productionToDelete?.batch_number}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDeleteConfirm}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteProduction}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Serial Numbers Modal */}
      <Modal isOpen={serialModalOpen} onClose={closeSerialModal} className="max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Enter Serial Numbers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter {productionToComplete?.quantity} unique serial numbers for the final products.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto mb-4">
            {serialNumbers.map((serial, index) => (
              <div key={index}>
                <Label htmlFor={`serial-${index}`} className="text-xs">
                  Unit #{index + 1}
                </Label>
                <Input
                  id={`serial-${index}`}
                  type="text"
                  value={serial}
                  onChange={(e) => {
                    const updated = [...serialNumbers];
                    updated[index] = e.target.value;
                    setSerialNumbers(updated);
                  }}
                  placeholder={`e.g., LEH-00${index + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={closeSerialModal} disabled={completing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCompleteProduction} disabled={completing}>
              {completing ? "Completing..." : "Complete Production"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductionPage;
