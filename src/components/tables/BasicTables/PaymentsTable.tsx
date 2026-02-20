import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CloseIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { Modal } from "../../ui/modal";
import { Payment, useDeletePaymentMutation } from "../../../redux/services/payment";
import { handleApiError, handleApiSuccess } from "../../../helper/error_handler";

interface PaymentsTableProps {
  payments: Payment[];
  loading: boolean;
  onPageChange?: (page: number) => void;
  canDelete?: (payment: Payment) => boolean;
}

export default function PaymentsTable({
  payments,
  loading,
  canDelete = (p) => !p.purchase_invoice_id,
}: PaymentsTableProps) {
  const { isOpen, closeModal, openModal } = useModal();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deletePayment, { isLoading: deleting }] = useDeletePaymentMutation();

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    openModal();
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;
    try {
      await deletePayment(selectedPayment.id).unwrap();
      handleApiSuccess("Payment deleted successfully");
      closeModal();
      setSelectedPayment(null);
    } catch (error: unknown) {
      handleApiError(error, "Failed to delete payment");
    }
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
                  Payment #
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
                  Supplier
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
                  Invoice
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created by
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
                  <TableCell colSpan={8}>
                    <div className="flex justify-center items-center py-10">
                      <TailSpin height={40} width={40} color="#667085" ariaLabel="loading" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]"
                  >
                    <TableCell className="px-5 py-3 font-mono text-sm text-gray-800 dark:text-white/90">
                      {payment.payment_number}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {typeof payment.payment_date === "string"
                        ? payment.payment_date.slice(0, 10)
                        : new Date(payment.payment_date).toISOString().slice(0, 10)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
                      {payment.supplier_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {payment.account_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-white/90">
                      ${Number(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {payment.invoice_number ?? (
                        <span className="text-amber-600 dark:text-amber-400">Direct</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {payment.admin_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-end">
                      {canDelete(payment) ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(payment)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete (direct payments only)"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
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
          setSelectedPayment(null);
        }}
        className="max-w-sm"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Payment
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete payment{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedPayment?.payment_number}
            </span>{" "}
            ({selectedPayment?.supplier_name}, ${Number(selectedPayment?.amount ?? 0).toFixed(2)})?
            This will reverse the supplier and account balances.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                closeModal();
                setSelectedPayment(null);
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
