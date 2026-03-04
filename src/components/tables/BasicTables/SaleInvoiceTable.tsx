import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  SaleInvoice,
  PaymentStatus,
} from "../../../redux/services/saleInvoice";
import { EyeIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import formatDateTime from "../../../helper/date_converter";

interface SaleInvoiceTableProps {
  invoices: SaleInvoice[];
  loading: boolean;
  onView?: (invoice: SaleInvoice) => void;
}


export default function SaleInvoiceTable({
  invoices,
  loading,
  onView,
}: SaleInvoiceTableProps) {
  const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
    const statusConfig: Record<
      PaymentStatus,
      { label: string; className: string }
    > = {
      [PaymentStatus.UNPAID]: {
        label: "Unpaid",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      [PaymentStatus.PARTIAL]: {
        label: "Partial",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      [PaymentStatus.PAID]: {
        label: "Paid",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
    };
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>
        {config.label}
      </span>
    );
  };

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
                Invoice #
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Customer
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
                Total Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Paid Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Outstanding
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

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

          {!loading && invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No Sale Invoices Found
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
                  {invoice.customer_name || `Customer #${invoice.customer_id}`}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatDateTime(invoice.invoice_date)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {(invoice.total_amount)}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {(invoice.paid_amount ?? 0)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <span
                    className={`font-medium ${
                      invoice.outstanding_amount &&
                      Number(invoice.outstanding_amount) > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {(invoice.outstanding_amount || 0)}
                  </span>
                </TableCell>
                <TableCell className="px-2 py-2 text-center">
                  <PaymentStatusBadge status={invoice.payment_status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(invoice)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="View Invoice"
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
