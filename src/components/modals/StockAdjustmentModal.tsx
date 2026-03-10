// components/modals/StockAdjustmentModal.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import { useGetAllItemsQuery } from "../../redux/services/item";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockAdjustmentFormData) => void;
  preSelectedItemId?: number;
}

export interface StockAdjustmentFormData {
  item_id: number;
  quantity: number;
  unit_price: number;
  reason: string;
  notes?: string;
}

const REASON_OPTIONS = [
  { id: "Opening Stock", name: "Opening Stock" },
  { id: "Damage/Loss", name: "Damage/Loss" },
  { id: "Found/Recovery", name: "Found/Recovery" },
  { id: "Inventory Count Correction", name: "Inventory Count Correction" },
  { id: "Expired", name: "Expired" },
  { id: "Return to Supplier", name: "Return to Supplier" },
  { id: "Sample/Testing", name: "Sample/Testing" },
  { id: "Other", name: "Other" },
];

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preSelectedItemId,
}) => {
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItemLabel, setSelectedItemLabel] = useState("");
  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery({
    page: 1,
    limit: 30,
    search: itemSearch || undefined,
  });

  const [formData, setFormData] = useState<StockAdjustmentFormData>({
    item_id: 0,
    quantity: 0,
    unit_price: 0,
    reason: "",
    notes: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (preSelectedItemId) {
        setFormData({
          item_id: preSelectedItemId,
          quantity: 0,
          unit_price: 0,
          reason: "",
          notes: "",
        });
        setSelectedItemLabel("");
      } else {
        setFormData({
          item_id: 0,
          quantity: 0,
          unit_price: 0,
          reason: "",
          notes: "",
        });
        setSelectedItemLabel("");
      }
      setItemSearch("");
    }
  }, [isOpen, preSelectedItemId]);

  // Sync selected item label when it appears in API results
  useEffect(() => {
    if (formData.item_id && itemsData?.data) {
      const item = itemsData.data.find((i) => i.id === formData.item_id);
      if (item)
        setSelectedItemLabel(`${item.name} (Current: ${Number(item.quantity).toFixed(0)})`);
    }
  }, [formData.item_id, itemsData?.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.item_id) {
      alert("Please select an item");
      return;
    }
    if (formData.quantity === 0) {
      alert("Quantity cannot be zero");
      return;
    }
    if (formData.quantity > 0 && formData.unit_price <= 0) {
      alert("Unit price must be greater than 0 when adding stock");
      return;
    }
    if (!formData.reason) {
      alert("Please enter a reason");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof StockAdjustmentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const apiItemOptions =
    itemsData?.data?.map((item) => ({
      id: item.id,
      name: `${item.name} (Current: ${Number(item.quantity).toFixed(0)})`,
    })) || [];
  const apiIds = new Set(apiItemOptions.map((o) => o.id));
  const selectedId = formData.item_id;
  const selectedNotInResults = selectedId && !apiIds.has(selectedId);
  const selectedItemFromData = selectedId && itemsData?.data?.find((i) => i.id === selectedId);
  const selectedItemOption =
    selectedNotInResults
      ? selectedItemFromData
        ? {
            id: selectedItemFromData.id,
            name: `${selectedItemFromData.name} (Current: ${Number(selectedItemFromData.quantity).toFixed(0)})`,
          }
        : selectedItemLabel
          ? { id: selectedId, name: selectedItemLabel }
          : { id: selectedId, name: `Item #${selectedId}` }
      : null;
  const itemOptions = selectedItemOption
    ? [selectedItemOption, ...apiItemOptions]
    : apiItemOptions;

  const isAddingStock = formData.quantity > 0;
  const isRemovingStock = formData.quantity < 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Stock Adjustment
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add or remove stock with reason and notes
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Selection */}
          <div>
            <SelectDropdown
              label="Select Item"
              options={itemOptions}
              value={formData.item_id}
              onChange={(value) => {
                const id = Number(value);
                handleChange("item_id", id);
                const opt = itemOptions.find((o) => o.id === id);
                setSelectedItemLabel(opt ? String(opt.name) : "");
              }}
              placeholder={itemsLoading ? "Loading items..." : "Search and select item..."}
              searchable
              onSearchChange={setItemSearch}
              optionsAreFiltered={true}
              disabled={itemsLoading || !!preSelectedItemId}
            />
            {preSelectedItemId && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Item is pre-selected and cannot be changed
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">
              Quantity *
              <span className="ml-2 text-xs font-normal text-gray-500">
                (Positive to add, Negative to remove)
              </span>
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="e.g., 100 or -50"
              value={formData.quantity === 0 ? "" : formData.quantity}
              onChange={(e) =>
                handleChange("quantity", e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
            {isAddingStock && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Adding {formData.quantity} units to stock
              </p>
            )}
            {isRemovingStock && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Removing {Math.abs(formData.quantity)} units from stock
              </p>
            )}
          </div>

          {/* Unit Price - Only required when adding stock */}
          <div>
            <Label htmlFor="unit_price">
              Unit Price *
              {isRemovingStock && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Not used when removing stock)
                </span>
              )}
            </Label>
            <Input
              id="unit_price"
              type="number"
              min="0"
              placeholder="0.00"
              value={formData.unit_price === 0 ? "" : formData.unit_price}
              onChange={(e) =>
                handleChange("unit_price", e.target.value === "" ? 0 : Number(e.target.value))
              }
              disabled={isRemovingStock}
            />
            {isAddingStock && formData.unit_price > 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total value: {(formData.quantity * formData.unit_price).toFixed(2)}
              </p>
            )}
          </div>

          {/* Reason Selection */}
          <div>
            <SelectDropdown
              label="Reason"
              options={REASON_OPTIONS}
              value={formData.reason}
              onChange={(value) => handleChange("reason", String(value))}
              placeholder="Select reason for adjustment..."
              searchable
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Additional details about this adjustment..."
            />
          </div>

          {/* Summary Box */}
          {formData.quantity !== 0 && (
            <div className={`p-4 rounded-lg border ${
              isAddingStock 
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            }`}>
              <h4 className={`text-sm font-semibold mb-2 ${
                isAddingStock 
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}>
                Adjustment Summary
              </h4>
              <ul className={`text-xs space-y-1 ${
                isAddingStock 
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}>
                <li>• {isAddingStock ? "Adding" : "Removing"} {Math.abs(formData.quantity)} units</li>
                {isAddingStock && <li>• At {formData.unit_price.toFixed(2)} per unit</li>}
                {isAddingStock && <li>• Total value: {(formData.quantity * formData.unit_price).toFixed(2)}</li>}
                <li>• Reason: {formData.reason || "Not selected"}</li>
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Adjust Stock
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default StockAdjustmentModal;
