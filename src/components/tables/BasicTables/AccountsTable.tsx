import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  useDeleteAccountMutation,
  useClearOpeningBalanceMutation,
  Account,
  AccountType,
} from "../../../redux/services/account";
import { CloseIcon, PencilIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import formatDateTime from "../../../helper/date_converter";
import { handleApiError, handleApiSuccess } from "../../../helper/error_handler";

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  onEdit?: (account: Account) => void;
  onClearOpeningBalance?: (account: Account) => void;
}

export default function AccountsTable({
  accounts,
  loading,
  onEdit,
  onClearOpeningBalance,
}: AccountsTableProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const {
    isOpen: isClearModalOpen,
    openModal: openClearModal,
    closeModal: closeClearModal,
  } = useModal();
  const [clearAccount, setClearAccount] = useState<Account | null>(null);
  const [clearAmount, setClearAmount] = useState<string>("");
  const [clearOpeningBalance, { isLoading: isClearing }] =
    useClearOpeningBalanceMutation();

  const handleDelete = async () => {
    if (!selectedAccount) return;

    try {
      const res = await deleteAccount(selectedAccount.id).unwrap();
      if (res.message) handleApiSuccess(res.message);
      closeModal();
      setSelectedAccount(null);
    } catch (error) {
      handleApiError(error, "Failed to delete account");
    }
  };

  const handleClearOpeningBalance = async () => {
    if (!clearAccount) return;
    const amount = parseFloat(clearAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      handleApiError(null, "Please enter a valid amount");
      return;
    }

    try {
      await clearOpeningBalance({ accountId: clearAccount.id, amount }).unwrap();
      handleApiSuccess("Opening balance cleared successfully");
      closeClearModal();
      setClearAccount(null);
      setClearAmount("");
      onClearOpeningBalance?.(clearAccount);
    } catch (error) {
      handleApiError(error, "Failed to clear opening balance");
    }
  };

  return (
    <>
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
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Bank Details
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Opening Balance
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Current Balance
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
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

            {!loading && accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  No accounts found
                </TableCell>
              </TableRow>
            )}

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {accounts.map((account) => {
                const isBankAccount = account.account_type === AccountType.BANK;
                
                return (
                  <TableRow key={account.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {account.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {account.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        account.account_type === AccountType.BANK
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : account.account_type === AccountType.IN_HAND
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : account.account_type === AccountType.JAZZCASH
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      }`}>
                        {account.account_type.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {isBankAccount && (account.bank_name || account.account_number) ? (
                        <div className="text-xs">
                          {account.bank_name && (
                            <div className="font-medium">{account.bank_name}</div>
                          )}
                          {account.account_number && (
                            <div className="text-gray-400 dark:text-gray-500">
                              A/C: {account.account_number}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-medium">
                      {account.opening_balance != null
                        ? Number(account.opening_balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm dark:text-gray-400">
                      <span className={`font-semibold ${
                        Number(account.current_balance) > 0
                          ? "text-green-600 dark:text-green-400"
                          : Number(account.current_balance) < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}>
                        {account.current_balance != null
                          ? Number(account.current_balance).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDateTime(account.created_at)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setClearAccount(account);
                            setClearAmount("");
                            openClearModal();
                          }}
                          className="text-xs px-2 py-1 rounded border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          title="Clear opening balance"
                        >
                          Clear
                        </button>
                        <span
                          className="cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => onEdit?.(account)}
                          title="Edit account"
                        >
                          <PencilIcon width={40} />
                        </span>
                        <span
                          className="cursor-pointer text-red-800 dark:text-red-400 hover:opacity-70 transition-opacity"
                          onClick={() => {
                            setSelectedAccount(account);
                            openModal();
                          }}
                          title="Delete account"
                        >
                          <CloseIcon />
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Clear Opening Balance Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => {
          closeClearModal();
          setClearAccount(null);
          setClearAmount("");
        }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Clear Opening Balance
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the amount to pay/clear from{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {clearAccount?.name}
            </span>
            . Current balance:{" "}
            <span className="font-semibold">
              {clearAccount
                ? Number(clearAccount.current_balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "—"}
            </span>
            . Balance can go negative (overdraft).
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={clearAmount}
              onChange={(e) => setClearAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeClearModal}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              disabled={isClearing || !clearAmount}
              onClick={handleClearOpeningBalance}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearing ? "Clearing..." : "Clear"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Account
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedAccount?.name}
            </span>
            ? This action cannot be undone.
          </p>

          {selectedAccount && Number(selectedAccount.current_balance) !== 0 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Warning:</strong> This account has a non-zero balance of{" "}
                {Number(selectedAccount.current_balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}. Deleting may affect your financial records.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
