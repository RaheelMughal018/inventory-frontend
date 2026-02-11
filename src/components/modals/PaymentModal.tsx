import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import SelectDropdown from "../form/SelectDropdown";
import { handleApiError } from "../../helper/error_handler";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  totalAmount: number;
  accounts: { id: string; name: string}[];
}

export interface PaymentFormData {
  payment_account_id: string;
  payment_amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  accounts,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_account_id: "",
    payment_amount: totalAmount,
  });

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      payment_account_id: "",
      payment_amount: totalAmount,
    });
  }, [isOpen, totalAmount]);

  const handleSubmit = () => {

    if (!formData.payment_account_id) {
      handleApiError("Please select an account");
    }

    if (formData.payment_amount <= 0) {
      handleApiError("Payment amount must be greater than 0");
    }

    if (formData.payment_amount > totalAmount) {
        handleApiError("Payment amount cannot exceed total amount");
    }

    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Payment
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Record payment for this invoice
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account */}
          <div>
            <Label>
              Payment Account <span className="text-red-500">*</span>
            </Label>
            <SelectDropdown
              options={accounts}
              value={formData.payment_account_id}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_account_id: String(value),
                }))
              }
              placeholder="Select payment account..."
              searchable
            />
          </div>

          {/* Total Amount */}
          <div>
            <Label>Total Amount</Label>
            <Input value={totalAmount} disabled />
          </div>

          {/* Pay Amount */}
          <div>
            <Label>
              Pay Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              max={totalAmount}
              placeholder="0.00"
              value={formData.payment_amount === 0 ? "" : formData.payment_amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_amount: e.target.value === "" ? 0 : Number(e.target.value),
                }))
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-base-500 shadow-theme-xs hover:bg-base-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
