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
import { useCreateReceiptMutation } from "../../redux/services/receipt";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const CreateReceiptPage = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState<number>(0);
  const [accountId, setAccountId] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [createReceipt, { isLoading: creating }] = useCreateReceiptMutation();
  const { data: customersData } = useGetAllCustomersQuery({});
  const { data: accountsData } = useGetAllAccountsQuery({});

  const customers = customersData?.data ?? [];
  const accounts = accountsData?.data ?? [];

  const customerOptions = customers.map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!customerId || !accountId) {
      handleApiError(null, "Please select customer and account");
      return;
    }
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      handleApiError(null, "Please enter a valid amount greater than 0");
      return;
    }

    try {
      await createReceipt({
        customer_id: customerId,
        account_id: accountId,
        amount: numAmount,
        receipt_date: receiptDate || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();
      handleApiSuccess("Receipt created successfully");
      navigate("/receipts");
    } catch (error: unknown) {
      handleApiError(error, "Failed to create receipt");
    }
  };

  return (
    <>
      <PageMeta
        title="Create Receipt"
        description="Record received amount from customer (without invoice)"
      />
      <PageBreadcrumb pageTitle="Create Receipt" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <SimpleComponentCard
          title="Receive Amount from Customer"
          desc="Record a receipt that increases the customer's credit / reduces outstanding. Money is added to the selected account. No sale invoice linked."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Customer <span className="text-red-500">*</span>
              </Label>
              <SelectDropdown
                options={customerOptions}
                value={customerId}
                onChange={(v) => setCustomerId(Number(v))}
                placeholder="Select customer..."
                searchable
                disabled={!customerOptions.length}
              />
            </div>
            <div>
              <Label>
                Account (money to) <span className="text-red-500">*</span>
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
                Amount received from customer (e.g. advance payment)
              </p>
            </div>
            <div>
              <Label>Receipt Date (optional)</Label>
              <DatePicker
                id="receipt-date"
                placeholder="Select date (default: today)"
                onChange={(_d, dateStr) => setReceiptDate(dateStr ?? "")}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Advance payment"
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
              onClick={() => navigate("/receipts")}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? "Creating..." : "Create Receipt"}
            </Button>
          </div>
        </SimpleComponentCard>
      </form>
    </>
  );
};

export default CreateReceiptPage;
