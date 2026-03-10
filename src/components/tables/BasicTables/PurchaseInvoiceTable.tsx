import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  PurchaseInvoice,
  PaymentStatus,
} from "../../../redux/services/purchaseInvoice";
import { CloseIcon, PencilIcon, EyeIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import formatDateTime from "../../../helper/date_converter";

interface PurchaseInvoiceTableProps {
  invoices: PurchaseInvoice[];
  loading: boolean;
  onEdit?: (invoice: PurchaseInvoice) => void;
  onView?: (invoice: PurchaseInvoice) => void;
  onDelete?: (invoice: PurchaseInvoice) => void;
}

export default function PurchaseInvoiceTable({
  invoices,
  loading,
  onEdit,
  onView,
  onDelete,
}: PurchaseInvoiceTableProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedInvoice) return;

    try {
      setIsDeleting(true);
      onDelete?.(selectedInvoice);
      setSelectedInvoice(null);
      closeModal();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(numAmount)) return "";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

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
    <>
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
                  Supplier
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
                <TableCell>
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
                <TableCell className="text-center py-6 text-gray-500">
                  No Purchase Invoices Found
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
                    {invoice.supplier_name || `Supplier #${invoice.supplier_id}`}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDateTime(invoice.invoice_date)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatCurrency(invoice.paid_amount)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span
                      className={`font-medium ${
                        invoice.outstanding_amount && Number(invoice.outstanding_amount) > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {formatCurrency(invoice.outstanding_amount || 0)}
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

                      {onEdit && invoice.payment_status === PaymentStatus.UNPAID && (
                        <button
                          onClick={() => onEdit(invoice)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Edit Invoice"
                        >
                          <PencilIcon width={40} />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            openModal();
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-600 dark:text-red-400"
                          title="Delete Invoice"
                        >
                          <CloseIcon />
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

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Purchase Invoice
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete invoice{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedInvoice?.invoice_number}
            </span>
            ? This action cannot be undone and will reverse all stock adjustments.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
