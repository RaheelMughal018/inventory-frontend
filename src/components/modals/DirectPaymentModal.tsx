import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import SelectDropdown from "../form/SelectDropdown";
import { toast } from "sonner";
import { useGetSupplierOutstandingQuery } from "../../redux/services/supplierPayment";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.account_id || formData.account_id === "") {
      toast.warning("Please select an account");
      return;
    }

    if (formData.amount <= 0) {
      toast.warning("Payment amount must be greater than 0");
      return;
    }

    if (formData.amount > (outstandingData?.total_debit ?? 0)) {
      toast.warning("Payment amount cannot exceed debit amount");
      return;
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
              max={outstandingData?.total_debit ?? 0}
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Payment</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DirectPaymentModal;
