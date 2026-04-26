import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import Button from "../ui/button/Button";
import { Account } from "../../redux/services/account";

interface TransferAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    transfer_date?: string;
    notes?: string;
  }) => void;
  accounts: Account[];
  isLoading?: boolean;
}

const TransferAccountModal: React.FC<TransferAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  isLoading = false,
}) => {
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setFromId("");
      setToId("");
      setAmount(0);
      setTransferDate("");
      setNotes("");
      setError("");
    }
  }, [isOpen]);

  const fromAccount = accounts.find((a) => String(a.id) === fromId);
  const fromBalance = fromAccount ? Number(fromAccount.current_balance) : 0;

  const accountOptions = accounts.map((a) => ({
    id: String(a.id),
    name: `${a.name} (${a.account_type}) — Bal ${Number(a.current_balance).toFixed(2)}`,
  }));

  const toOptions = accountOptions.filter((opt) => opt.id !== fromId);
  const fromOptions = accountOptions.filter((opt) => opt.id !== toId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromId || !toId) {
      setError("Select both source and destination accounts");
      return;
    }
    if (fromId === toId) {
      setError("Source and destination must be different");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (amount > fromBalance) {
      setError(`Amount exceeds source balance (${fromBalance.toFixed(2)})`);
      return;
    }

    onSubmit({
      from_account_id: Number(fromId),
      to_account_id: Number(toId),
      amount,
      transfer_date: transferDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Transfer Between Accounts
        </h3>

        <div>
          <Label>From Account *</Label>
          <SelectDropdown
            options={fromOptions}
            value={fromId}
            onChange={(value) => setFromId(String(value))}
            placeholder="Select source account"
            searchable
          />
        </div>

        <div>
          <Label>To Account *</Label>
          <SelectDropdown
            options={toOptions}
            value={toId}
            onChange={(value) => setToId(String(value))}
            placeholder="Select destination account"
            searchable
          />
        </div>

        <div>
          <Label>Amount *</Label>
          <Input
            type="number"
            min="0.01"
            step="any"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
          {fromAccount && (
            <p className="mt-1 text-xs text-gray-500">
              Available: {fromBalance.toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <Label>Transfer Date</Label>
          <Input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
          />
        </div>

        <div>
          <Label>Notes</Label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferAccountModal;
