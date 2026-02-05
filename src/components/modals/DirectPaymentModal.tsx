import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import SelectDropdown from "../form/SelectDropdown";
import { useGetSupplierOutstandingQuery } from "../../redux/services/supplierPayment";
import { handleApiError } from "../../helper/error_handler";

interface DirectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DirectPaymentFormData) => void;
  accounts: { id: string; name: string}[];
  supplierId: number;
}

export interface DirectPaymentFormData {
account_id: string;
amount: number;
}

const DirectPaymentModal: React.FC<DirectPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  supplierId,
}) => {
  const [formData, setFormData] = useState<DirectPaymentFormData>({
    account_id: "",
    amount: 0,
  });
  const {data:outstandingData} = useGetSupplierOutstandingQuery(supplierId, {
    skip: !supplierId,
  })
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      account_id: "",
      amount: outstandingData?.outstanding_balance ?? 0,
    });
  }, [isOpen, supplierId, outstandingData]);

  const handleSubmit = () => {

    if (!formData.account_id || formData.account_id === "") {
      handleApiError("Please select an account");
    }

    if (formData.amount <= 0) {
      handleApiError("Payment amount must be greater than 0");
    }

    if (formData.amount > (outstandingData?.total_debit ?? 0)) {
      handleApiError("Payment amount cannot exceed debit amount");
    }

    try {
      onSubmit(formData);
    } catch (error: unknown) {
      handleApiError(error, "Failed to submit payment");
    }
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
            Record payment for this supplier
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
              value={formData.account_id}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  account_id: String(value),
                }))
              }
              placeholder="Select payment account..."
              searchable
            />
          </div>

          {/* Total Amount */}
          <div>
            <Label>Total Amount</Label>
            <Input value={outstandingData?.total_debit ?? 0} disabled />
          </div>
          {/* Total Amount */}
          <div>
            <Label>Credit Amount</Label>
            <Input value={outstandingData?.total_credit ?? 0} disabled />
          </div>
          {/* Total Amount */}
          <div>
            <Label>Outstanding Balance</Label>
            <Input value={outstandingData?.outstanding_balance ?? 0} disabled />
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
              max={outstandingData?.total_debit ?? 0}
              placeholder="0.00"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: e.target.value === "" ? 0 : Number(e.target.value),
                }))
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Payment</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DirectPaymentModal;
