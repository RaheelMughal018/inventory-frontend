import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CloseIcon, EyeIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { Modal } from "../../ui/modal";
import { Receipt, useDeleteReceiptMutation } from "../../../redux/services/receipt";
import { handleApiError, handleApiSuccess } from "../../../helper/error_handler";

interface ReceiptsTableProps {
  receipts: Receipt[];
  loading: boolean;
  onView?: (receipt: Receipt) => void;
}

export default function ReceiptsTable({
  receipts,
  loading,
  onView,
}: ReceiptsTableProps) {
  const { isOpen, closeModal, openModal } = useModal();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [deleteReceipt, { isLoading: deleting }] = useDeleteReceiptMutation();

  const handleDeleteClick = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    openModal();
  };

  const handleDelete = async () => {
    if (!selectedReceipt) return;
    try {
      await deleteReceipt(selectedReceipt.id).unwrap();
      handleApiSuccess("Receipt deleted successfully");
      closeModal();
      setSelectedReceipt(null);
    } catch (error: unknown) {
      handleApiError(error, "Failed to delete receipt");
    }
  };

  const formatDate = (dateString: string) => {
    return typeof dateString === "string"
      ? dateString.slice(0, 10)
      : new Date(dateString).toISOString().slice(0, 10);
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
                  Receipt #
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
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Account
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Notes
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
              ) : receipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-gray-500"
                  >
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => (
                  <TableRow
                    key={receipt.id}
                    className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]"
                  >
                    <TableCell className="px-5 py-3 font-mono text-sm text-gray-800 dark:text-white/90">
                      {receipt.receipt_number ?? `#${receipt.id}`}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {formatDate(receipt.receipt_date)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                      {receipt.customer_name ?? `Customer #${receipt.customer_id}`}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {receipt.account_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-white/90">
                      {Number(receipt.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate">
                      {receipt.notes ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-end">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(receipt)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                            title="View receipt"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(receipt)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete receipt"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setSelectedReceipt(null);
        }}
        className="max-w-sm"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Receipt
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete receipt{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedReceipt?.receipt_number ?? `#${selectedReceipt?.id}`}
            </span>{" "}
            ({selectedReceipt?.customer_name},{" "}
            {Number(selectedReceipt?.amount ?? 0).toFixed(2)})? This will
            reverse the customer and account balances.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                closeModal();
                setSelectedReceipt(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
