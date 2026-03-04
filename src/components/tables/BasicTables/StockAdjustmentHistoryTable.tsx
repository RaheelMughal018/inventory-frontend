import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { StockAdjustment } from "../../../redux/services/stockAdjustment";
import { TailSpin } from "react-loader-spinner";
import formatDateTime from "../../../helper/date_converter";

interface StockAdjustmentHistoryTableProps {
  adjustments: StockAdjustment[];
  loading: boolean;
}

export default function StockAdjustmentHistoryTable({
  adjustments,
  loading,
}: StockAdjustmentHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Quantity
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Unit Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Reason
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Notes
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Adjusted By
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          {loading && (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex justify-center items-center py-10">
                  <TailSpin
                    height={40}
                    width={40}
                    color="#667085"
                    ariaLabel="loading"
                  />
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && adjustments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No adjustment history found
              </TableCell>
            </TableRow>
          )}

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {adjustments.map((adjustment) => {
              const quantity = Number(adjustment.quantity);
              const isAddition = quantity > 0;
              const avgPrice = Number(adjustment.avg_price);

              return (
                <TableRow key={adjustment.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{adjustment.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="text-xs">
                      <div className="font-medium">
                        {formatDateTime(adjustment.adjustment_date)}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        {formatDateTime(adjustment.created_at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isAddition
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {isAddition ? "+" : ""}
                      {quantity.toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-medium">
                    {avgPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {adjustment.reason}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {adjustment.notes ? (
                      <div className="text-xs max-w-xs truncate" title={adjustment.notes}>
                        {adjustment.notes}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {adjustment.admin_name ? (
                      <div className="text-xs">
                        <div className="font-medium">{adjustment.admin_name}</div>
                        <div className="text-gray-400 dark:text-gray-500">
                          ID: {adjustment.admin_id}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Admin #{adjustment.admin_id}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
