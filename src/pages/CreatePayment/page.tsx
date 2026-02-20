import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import SelectDropdown from "../../components/form/SelectDropdown";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { useCreatePaymentMutation } from "../../redux/services/payment";
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const [supplierId, setSupplierId] = useState<number>(0);
  const [accountId, setAccountId] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [createPayment, { isLoading: creating }] = useCreatePaymentMutation();
  const { data: suppliersData } = useGetAllSuppliersQuery({});
  const { data: accountsData } = useGetAllAccountsQuery({});

  const suppliers = suppliersData?.data ?? [];
  const accounts = accountsData?.data ?? [];

  const supplierOptions = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
  }));
  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!supplierId || !accountId) {
      alert("Please select supplier and account");
      return;
    }
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    try {
      await createPayment({
        supplier_id: supplierId,
        account_id: accountId,
        amount: numAmount,
        payment_date: paymentDate || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();
      handleApiSuccess("Payment created successfully");
      navigate("/payments");
    } catch (error: unknown) {
      handleApiError(error, "Failed to create payment");
    }
  };

  return (
    <>
      <PageMeta title="Create Payment" description="Record a direct payment to supplier" />
      <PageBreadcrumb pageTitle="Create Payment" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <SimpleComponentCard
          title="Direct Payment to Supplier"
          desc="Record a payment that reduces the supplier's outstanding balance. Money is deducted from the selected account."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Supplier <span className="text-red-500">*</span>
              </Label>
              <SelectDropdown
                options={supplierOptions}
                value={supplierId}
                onChange={(v) => setSupplierId(Number(v))}
                placeholder="Select supplier..."
                searchable
                disabled={!supplierOptions.length}
              />
            </div>
            <div>
              <Label>
                Account (money from) <span className="text-red-500">*</span>
              </Label>
              <SelectDropdown
                options={accountOptions}
                value={accountId}
                onChange={(v) => setAccountId(Number(v))}
                placeholder="Select account..."
                searchable
                disabled={!accountOptions.length}
              />
            </div>
            <div>
              <Label>
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Cannot exceed supplier outstanding balance
              </p>
            </div>
            <div>
              <Label>Payment Date (optional)</Label>
              <DatePicker
                id="payment-date"
                placeholder="Select date (default: today)"
                onChange={(_d, dateStr) => setPaymentDate(dateStr ?? "")}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Direct payment to clear balance"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </SimpleComponentCard>

        <SimpleComponentCard title="Actions" desc="Save or cancel">
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/payments")}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? "Creating..." : "Create Payment"}
            </Button>
          </div>
        </SimpleComponentCard>
      </form>
    </>
  );
};

export default CreatePaymentPage;
