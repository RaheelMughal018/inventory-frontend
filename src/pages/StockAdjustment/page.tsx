// pages/StockAdjustmentPage.tsx
import { useState, useEffect } from "react";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import StockAdjustmentModal, {
  StockAdjustmentFormData,
} from "../../components/modals/StockAdjustmentModal";
import {
  useAdjustStockMutation,
  useGetStockHistoryQuery,
} from "../../redux/services/stockAdjustment";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import Pagination from "../../components/common/Pagination";
import StockAdjustmentHistoryTable from "../../components/tables/BasicTables/StockAdjustmentHistoryTable";
import { useGetAllItemsQuery } from "../../redux/services/item";
import SelectDropdown from "../../components/form/SelectDropdown";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

const StockAdjustmentPage = () => {
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [selectedItemLabel, setSelectedItemLabel] = useState<string>("");
  const [itemSearch, setItemSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(30);

  const { data: itemsData, isLoading: itemsLoading } = useGetAllItemsQuery({
    page: 1,
    limit: 30,
    search: itemSearch || undefined,
  });
  // Keep selected item label in sync when it appears in API results (e.g. after clearing search)
  useEffect(() => {
    if (selectedItemId && itemsData?.data) {
      const item = itemsData.data.find((i) => i.id === selectedItemId);
      if (item)
        setSelectedItemLabel(`${item.name} (Stock: ${Number(item.quantity).toFixed(0)})`);
    }
  }, [selectedItemId, itemsData?.data]);
  const { data: historyData, isLoading: historyLoading } = useGetStockHistoryQuery(
    {
      item_id: selectedItemId,
      page,
      limit,
    },
    {
      skip: !selectedItemId,
    }
  );

  const [adjustStock] = useAdjustStockMutation();

  // Modal states
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Handle stock adjustment submission
  const handleAdjustStock = async (adjustmentData: StockAdjustmentFormData) => {
    try {
      const res = await adjustStock(adjustmentData).unwrap();
      handleApiSuccess(res.data.message || "Stock adjusted successfully");
      setIsAdjustModalOpen(false);
      setPage(1); // Reset to first page to see new adjustment
    } catch (error) {
      handleApiError(error, "Failed to adjust stock");
    }
  };

  // Transform items for dropdown; keep selected item in list if not in search results
  const apiItemOptions =
    itemsData?.data?.map((item) => ({
      id: item.id,
      name: `${item.name} (Stock: ${Number(item.quantity).toFixed(0)})`,
    })) || [];
  const apiIds = new Set(apiItemOptions.map((o) => o.id));
  const selectedOptionNotInResults = selectedItemId && !apiIds.has(selectedItemId);
  const selectedItemOption =
    selectedOptionNotInResults && selectedItemLabel
      ? { id: selectedItemId, name: selectedItemLabel }
      : null;
  const itemOptions = selectedItemOption
    ? [selectedItemOption, ...apiItemOptions]
    : apiItemOptions;

  // Get selected item details
  const selectedItem = itemsData?.data?.find((item) => item.id === selectedItemId);

  return (
    <>
      <PageMeta title="Stock Adjustment" description="Adjust item stock levels" />
      <PageBreadcrumb pageTitle="Stock Adjustment" />
      <div className="space-y-6">
        {/* Item Selection Card */}
        <SimpleComponentCard
          title="Item Selection"
          extra={
            <Button
              onClick={() => setIsAdjustModalOpen(true)}
              disabled={!selectedItemId}
              className="px-4"
            >
              Adjust Stock
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Dropdown */}
            <div>
              <SelectDropdown
                label="Select Item to View History"
                options={itemOptions}
                value={selectedItemId}
                onChange={(value) => {
                  const id = Number(value);
                  setSelectedItemId(id);
                  setPage(1);
                  const opt = itemOptions.find((o) => o.id === id);
                  setSelectedItemLabel(opt ? String(opt.name) : "");
                }}
                placeholder={itemsLoading ? "Loading items..." : "Search and select item..."}
                searchable
                onSearchChange={setItemSearch}
                optionsAreFiltered={true}
                disabled={itemsLoading}
              />
            </div>

            {/* Item Details */}
            {selectedItem && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <Label className="mb-3">Current Stock Details</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Item Name:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedItem.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedItem.category?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Current Quantity:</span>
                    <p className="font-semibold text-green-600 dark:text-green-400 mt-1 text-lg">
                      {Number(selectedItem.quantity).toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Average Price:</span>
                    <p className="font-semibold text-blue-600 dark:text-blue-400 mt-1 text-lg">
                      {Number(selectedItem.avg_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Item Type:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedItem.item_type}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Unit Type:</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedItem.unit_type}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SimpleComponentCard>

        {/* Stock Adjustment History */}
        {selectedItemId > 0 && (
          <SimpleComponentCard
            title={`Stock Adjustment History - ${selectedItem?.name || "Item"}`}
          >
            <StockAdjustmentHistoryTable
              adjustments={historyData?.data ?? []}
              loading={historyLoading}
            />
            <div className="pt-4">
              <Pagination
                currentPage={page}
                pageSize={limit}
                total={historyData?.meta?.totalItems ?? 0}
                onPageChange={setPage}
              />
            </div>
          </SimpleComponentCard>
        )}

        {/* Empty State */}
        {selectedItemId === 0 && (
          <div className="text-center py-12 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select an Item
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Choose an item from the dropdown above to view its stock adjustment history and make adjustments.
            </p>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSubmit={handleAdjustStock}
        preSelectedItemId={selectedItemId > 0 ? selectedItemId : undefined}
      />
    </>
  );
};

export default StockAdjustmentPage;
