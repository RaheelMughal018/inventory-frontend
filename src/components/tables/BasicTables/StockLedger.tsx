import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TailSpin } from "react-loader-spinner";

import formatDate from "../../../helper/date_converter";
import { StockLedgerEntry, StockLedgerTotals } from "../../../redux/services/stockLedger";

interface StockLedgerTableProps {
  entries: StockLedgerEntry[];
  loading: boolean;
  totals?: StockLedgerTotals;
}

export default function StockLedgerTable({
  entries,
  loading,
  totals,
}: StockLedgerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Id
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Item Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Ref Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Ref Id
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Qty In
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Qty Out
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
                Created on
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>
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

            {!loading && entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  No stock ledger entries found
                </TableCell>
              </TableRow>
            )}

            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {entry.id}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {entry.item?.name ?? entry.item_id}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {entry.ref_type.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {entry.ref_id}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {entry.qty_in}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {entry.qty_out}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {entry.unit_price}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatDate(entry.created_at)}
                </TableCell>
              </TableRow>
            ))}
            {!loading && entries.length > 0 && totals && (
              <TableRow className="border-t-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] font-semibold">
                <TableCell className="px-5 py-3 text-start" colSpan={4}>
                  <span className="text-gray-700 text-theme-sm dark:text-gray-300">Total</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                  {totals.total_qty_in ?? 0}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                  {totals.total_qty_out ?? 0}
                </TableCell>
                <TableCell className="px-4 py-3">{" "}</TableCell>
                <TableCell className="px-4 py-3">{" "}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
