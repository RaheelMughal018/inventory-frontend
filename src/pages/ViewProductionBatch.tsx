import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import Button from "../components/ui/button/Button";
import { toast } from "sonner";
import {
  useGetProductionBatchDetailQuery,
  useUpdateProductionBatchMutation,
  useDeleteProductionBatchMutation,
  UpdateBatchRecipeItem,
} from "../redux/services/production";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { TailSpin } from "react-loader-spinner";
import { PlusIcon, CloseIcon, TrashBinIcon } from "../icons";
import Input from "../components/form/input/InputField";
import SelectDropdown from "../components/form/SelectDropdown";
import { useGetAllItemsQuery } from "../redux/services/item";

const ViewProductionBatch = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: batch, isLoading, error } = useGetProductionBatchDetailQuery(id || "", { skip: !id });
  const [updateBatch, { isLoading: updating }] = useUpdateProductionBatchMutation();
  const [deleteBatch, { isLoading: deleting }] = useDeleteProductionBatchMutation();
  const { data: itemsData } = useGetAllItemsQuery({});

  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState<number>(1);
  const [editedSerials, setEditedSerials] = useState<string[]>([]);
  const [editedRecipe, setEditedRecipe] = useState<UpdateBatchRecipeItem[]>([]);

  const rawItemOptions =
    itemsData?.items?.map((item) => ({ id: item.id, name: item.name })) ?? [];

  const startEditing = () => {
    if (!batch) return;
    setEditedQuantity(batch.quantity_produced);
    setEditedSerials([...batch.serial_numbers]);
    setEditedRecipe(
      batch.recipe_items.map((r) => ({
        raw_item_id: r.raw_item_id,
        quantity_per_unit: Number(r.quantity_per_unit),
      }))
    );
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!batch) return;
    try {
      await updateBatch({
        batchId: batch.id,
        data: {
          quantity: editedQuantity,
          serial_numbers: editedSerials.filter((s) => s.trim()),
          recipe_items: editedRecipe,
        },
      }).unwrap();
      toast.success("Batch updated successfully");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail;
      toast.error(msg || "Failed to update batch");
    }
  };

  const addRecipeRow = () => {
    setEditedRecipe((prev) => [...prev, { raw_item_id: "", quantity_per_unit: 0 }]);
  };

  const removeRecipeRow = (index: number) => {
    setEditedRecipe((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRecipeRow = (index: number, field: keyof UpdateBatchRecipeItem, value: string | number) => {
    setEditedRecipe((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSerial = () => {
    setEditedSerials((prev) => [...prev, ""]);
  };

  const updateSerial = (index: number, value: string) => {
    setEditedSerials((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeSerial = (index: number) => {
    setEditedSerials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteBatch = async () => {
    if (!batch) return;
    if (!window.confirm(`Are you sure you want to delete batch ${batch.id}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteBatch(batch.id).unwrap();
      toast.success("Batch deleted successfully");
      navigate("/production");
    } catch (err: unknown) {
      const msg = (err as { data?: { detail?: string } })?.data?.detail;
      toast.error(msg || "Failed to delete batch");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <TailSpin height={48} width={48} color="#3b82f6" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Batch not found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Failed to load batch details
          </p>
          <Button onClick={() => navigate("/production")} className="mt-4">
            Back to Production
          </Button>
        </div>
      </div>
    );
  }

  const stageBadge = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
    IN_PROCESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    DONE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <>
      <PageMeta title={`Batch ${batch.id}`} description="Production batch details" />
      <PageBreadcrumb pageTitle="Production Batch Details" />

      <div className="space-y-6">
        {/* Batch overview */}
        <SimpleComponentCard title="Batch overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Batch ID</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Final product</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.final_product_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity produced</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.quantity_produced}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stage</p>
              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${stageBadge[batch.stage]}`}>
                {batch.stage}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total cost</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.total_estimated_cost}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost per unit</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.cost_per_unit}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {new Date(batch.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {new Date(batch.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </SimpleComponentCard>

        {/* Serial numbers */}
        <SimpleComponentCard title="Serial numbers">
          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {batch.serial_numbers.map((serial, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-white font-mono"
                >
                  {serial}
                </span>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {editedSerials.map((serial, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Serial number"
                    value={serial}
                    onChange={(e) => updateSerial(idx, e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeSerial(idx)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSerial}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                <PlusIcon className="size-4" />
                Add serial
              </button>
            </div>
          )}
        </SimpleComponentCard>

        {/* Recipe items */}
        <SimpleComponentCard
          title="Recipe items"
          extra={
            !isEditing ? (
              <Button size="sm" variant="outline" onClick={startEditing}>
                Edit recipe
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSaveChanges} disabled={updating}>
                  {updating ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )
          }
        >
          {!isEditing ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
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
                      Total qty
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Avg price
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {batch.recipe_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                        {item.raw_item_name}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {item.quantity_per_unit}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {item.total_quantity}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {item.avg_price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800/95 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5 w-12">#</th>
                        <th className="px-4 py-3.5 min-w-[180px]">Raw item *</th>
                        <th className="px-4 py-3.5 w-40">Qty per unit *</th>
                        <th className="px-4 py-3.5 w-14" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50">
                      {editedRecipe.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <SelectDropdown
                              options={rawItemOptions}
                              value={item.raw_item_id}
                              onChange={(value) => updateRecipeRow(idx, "raw_item_id", String(value))}
                              placeholder="Select raw item"
                              searchable
                              className="w-full"
                              listClassName="max-h-80"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0.01}
                              step={0.01}
                              placeholder="0.00"
                              value={item.quantity_per_unit === 0 ? "" : item.quantity_per_unit}
                              onChange={(e) =>
                                updateRecipeRow(idx, "quantity_per_unit", e.target.value ? Number(e.target.value) : 0)
                              }
                              className="w-full text-right"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeRecipeRow(idx)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <CloseIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                type="button"
                onClick={addRecipeRow}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                <PlusIcon className="size-5" />
                Add raw item
              </button>
            </div>
          )}
        </SimpleComponentCard>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/production")}>
            Back to Production
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteBatch}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:border-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
          >
            <TrashBinIcon className="size-4" />
            {deleting ? "Deleting..." : "Delete Batch"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ViewProductionBatch;
