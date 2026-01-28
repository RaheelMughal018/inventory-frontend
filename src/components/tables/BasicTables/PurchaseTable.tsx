import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  PurchaseInvoice,
  useDeletePurchaseInvoiceMutation,
} from "../../../redux/services/purchaseInvoice";
import { CloseIcon, PencilIcon, EyeIcon } from "../../../icons"; // Add DollarIcon
import { TailSpin } from "react-loader-spinner";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { toast } from "sonner";

interface PurchaseTableProps {
  purchases: PurchaseInvoice[];
  loading: boolean;
  onEdit?: (purchase: PurchaseInvoice) => void;
  onView?: (purchase: PurchaseInvoice) => void;
  onDelete?: (purchase: PurchaseInvoice) => void; // ✅ Added
  onAddPayment?: (purchase: PurchaseInvoice) => void; // ✅ Added
}

export default function PurchaseTable({
  purchases,
  loading,
  onEdit,
  onView,
  onDelete,
  onAddPayment,
}: PurchaseTableProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseInvoice | null>(null);
  const [deletePurchase, { isLoading }] = useDeletePurchaseInvoiceMutation();

  const handleDelete = async () => {
    if (!selectedPurchase) return;

    try {
      const res = await deletePurchase(selectedPurchase.id).unwrap();
      if (res.message) {
        toast.success(res.message);
        closeModal();
      }

      // Call onDelete callback if provided
      onDelete?.(selectedPurchase);

      setSelectedPurchase(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error while deleting this purchase invoice");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      draft: {
        label: "Draft",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      },
      pending: {
        label: "Pending",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      completed: {
        label: "Completed",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const PaymentStatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      partial: {
        label: "Partial",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      paid: {
        label: "Paid",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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
                  Items
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Balance Due
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
                  Payment
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

            {!loading && purchases.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-6 text-gray-500">
                  No Purchase Invoices Found
                </TableCell>
              </TableRow>
            )}

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {purchase.invoice_number}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {purchase.supplier_name}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(purchase.invoice_date)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {purchase.items.length} items
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {formatCurrency(purchase.grand_total)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span
                      className={`font-medium ${purchase.balance_due > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {formatCurrency(purchase.balance_due)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <StatusBadge status={purchase.status} />
                  </TableCell>

                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex flex-col gap-1">
                      <PaymentStatusBadge status={purchase.payment_status} />
                      {purchase.payment_status === "partial" && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Paid: {formatCurrency(purchase.paid_amount)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      {onView && (
                        <button
                          onClick={() => onView(purchase)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="View Invoice"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}

                      {onEdit && (
                        <button
                          onClick={() => onEdit(purchase)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Edit Invoice"
                        >
                          <PencilIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                      )}

                      {onAddPayment && purchase.balance_due > 0 && (
                        <button
                          onClick={() => onAddPayment(purchase)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Add Payment"
                        >
                          dollar icon
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          openModal();
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-600 dark:text-red-400"
                        title="Delete Invoice"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
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
              {selectedPurchase?.invoice_number}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
