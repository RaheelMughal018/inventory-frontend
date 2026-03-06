import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import type { RepairInvoice, RepairStatus, PaymentStatusRepair } from "../../../redux/services/repairInvoice";
import { EyeIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import formatDateTime from "../../../helper/date_converter";

interface RepairInvoiceTableProps {
  invoices: RepairInvoice[];
  loading: boolean;
  onView?: (invoice: RepairInvoice) => void;
}

const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

const REPAIR_STATUS_CLASS: Record<RepairStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  DELIVERED: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

const PAYMENT_STATUS_CLASS: Record<PaymentStatusRepair, string> = {
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  PARTIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  UNPAID: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function RepairInvoiceTable({
  invoices,
  loading,
  onView,
}: RepairInvoiceTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Invoice #
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Customer
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Item / Serial
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Received
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Repair Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Total
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Payment
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {loading && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex justify-center items-center py-10">
                  <TailSpin height={40} width={40} color="#667085" ariaLabel="loading" />
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No Repair Invoices Found
              </TableCell>
            </TableRow>
          )}

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {invoice.invoice_number}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {invoice.customer_name ?? `Customer #${invoice.customer_id}`}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {invoice.serial_number ?? invoice.item_description ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatDateTime(invoice.received_date)}
                </TableCell>
                <TableCell className="px-2 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      REPAIR_STATUS_CLASS[invoice.repair_status as RepairStatus] ??
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {REPAIR_STATUS_LABELS[invoice.repair_status as RepairStatus] ?? invoice.repair_status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                  {invoice.is_foc ? (
                    <span className="text-gray-500">FOC</span>
                  ) : (
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {Number(invoice.total_amount).toFixed(2)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-2 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      PAYMENT_STATUS_CLASS[invoice.payment_status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {invoice.payment_status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(invoice)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="View"
                      >
                        <EyeIcon width={16} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
