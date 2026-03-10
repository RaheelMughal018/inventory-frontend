import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetAllCustomersQuery,
} from "../../redux/services/customer";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import { useGetAllItemsQuery, ItemType } from "../../redux/services/item";
import {
  CreateRepairInvoiceDto,
  CreateRepairInvoiceItemDto,
  PaymentStatusRepair,
  useCreateRepairInvoiceMutation,
} from "../../redux/services/repairInvoice";
import Button from "../../components/ui/button/Button";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";

interface LineItem {
  item_id: number;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  inventory_count: boolean;
}

const CreateRepairInvoicePage = () => {
  const navigate = useNavigate();
  const [createRepairInvoice, { isLoading }] = useCreateRepairInvoiceMutation();

  const { data: customersData } = useGetAllCustomersQuery({});
  const { data: accountsData } = useGetAllAccountsQuery({});
  const [itemSearch, setItemSearch] = useState("");
  const { data: itemsData } = useGetAllItemsQuery({
    page: 1,
    limit: 30,
    search: itemSearch || undefined,
    item_type: ItemType.RAW,
  });

  const [customerId, setCustomerId] = useState<number | string>("");
  const [isFoc, setIsFoc] = useState(false);
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [serialNumber, setSerialNumber] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusRepair>("UNPAID");
  const [accountId, setAccountId] = useState<string>("");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const [lines, setLines] = useState<LineItem[]>([
    { item_id: 0, item_name: "", description: "", quantity: 1, unit_price: 0, total: 0, inventory_count: true },
  ]);

  const totalAmount = lines.reduce((sum, l) => sum + l.total, 0);

  const handleAddLine = () => {
    setLines([
      ...lines,
      { item_id: 0, item_name: "", description: "", quantity: 1, unit_price: 0, total: 0, inventory_count: true },
    ]);
  };

  const handleUpdateLine = (
    index: number,
    field: keyof LineItem,
    value: string | number | boolean
  ) => {
    const next = [...lines];
    const row = next[index];
    if (!row) return;
    if (field === "description") row.description = String(value);
    if (field === "quantity") row.quantity = Number(value);
    if (field === "unit_price") row.unit_price = Number(value);
    if (field === "item_id") row.item_id = Number(value);
    if (field === "item_name") row.item_name = String(value);
    if (field === "inventory_count") row.inventory_count = Boolean(value);
    row.total = row.quantity * row.unit_price;
    setLines(next);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) {
      handleApiError(null, "At least one line item is required");
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const buildPayload = (): CreateRepairInvoiceDto => {
    const receivedDateIso =
      receivedDate && receivedDate.length >= 10
        ? new Date(receivedDate).toISOString()
        : new Date().toISOString();

    const items: CreateRepairInvoiceItemDto[] = lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      ...(l.item_id > 0 && { item_id: l.item_id }),
      ...(l.inventory_count && { inventory_count: true }),
    }));

    const payload: CreateRepairInvoiceDto = {
      customer_id: Number(customerId),
      is_foc: isFoc,
      received_date: receivedDateIso,
      items,
      ...(serialNumber.trim() && { serial_number: serialNumber.trim() }),
      ...(itemDescription.trim() && { item_description: itemDescription.trim() }),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(technicianNotes.trim() && { technician_notes: technicianNotes.trim() }),
    };

    if (!isFoc) {
      payload.payment_status = paymentStatus;
      if (paymentStatus === "PAID" || paymentStatus === "PARTIAL") {
        payload.account_id = Number(accountId);
        payload.received_amount = receivedAmount;
      }
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!customerId) {
      handleApiError("Please select a customer");
      return;
    }
    const validLines = lines.filter((l) => l.description.trim() || l.quantity > 0 && l.unit_price >= 0);
    if (validLines.length === 0) {
      handleApiError("Add at least one line with description, quantity and unit price");
      return;
    }

    if (!isFoc) {
      if (paymentStatus === "PAID" && receivedAmount !== totalAmount) {
        handleApiError("Received amount must equal total when status is PAID");
        return;
      }
      if (paymentStatus === "PARTIAL" && (receivedAmount <= 0 || receivedAmount >= totalAmount)) {
        handleApiError("Received amount must be between 0 and total for PARTIAL");
        return;
      }
      if (
        (paymentStatus === "PAID" || paymentStatus === "PARTIAL") &&
        (!accountId || Number(accountId) <= 0)
      ) {
        handleApiError("Please select an account for payment");
        return;
      }
    }

    try {
      const payload = buildPayload();
      const response = await createRepairInvoice(payload).unwrap();
      const inv = response.data;
      handleApiSuccess(`Repair invoice ${inv.invoice_number} created`);
      navigate("/repair-invoices");
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error)
      handleApiError(error, "Failed to create repair invoice");
    }
  };

  const customerOptions = customersData?.data?.map((c) => ({ id: c.id, name: c.name })) ?? [];
  const accountOptions =
    accountsData?.data?.map((a) => ({ id: a.id, name: `${a.name} (${a.account_type})` })) ?? [];
  const rawItemOptions =
    itemsData?.data?.filter((i) => i.item_type === ItemType.RAW).map((i) => ({ id: i.id, name: i.name })) ?? [];

  return (
    <>
      <PageMeta title="Create Repair Invoice" description="Create a new repair invoice" />
      <PageBreadcrumb pageTitle="Create Repair Invoice" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Repair Invoice
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add customer, item details and line items. FOC repairs do not require payment.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/repair-invoices")} className="px-6">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="px-6">
              {isLoading ? "Creating..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SimpleComponentCard title="Customer & Item">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer *</Label>
                  <SelectDropdown
                    options={customerOptions}
                    value={customerId}
                    onChange={(v) => setCustomerId(Number(v))}
                    placeholder="Select customer"
                    searchable
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFoc}
                      onChange={(e) => setIsFoc(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">FOC (Free of cost)</span>
                  </label>
                </div>
                <div>
                  <Label>Received date *</Label>
                  <DatePicker
                    id="received-date"
                    placeholder="Received date"
                    defaultDate={receivedDate}
                    onChange={(_, dateString) => setReceivedDate(dateString || "")}
                  />
                </div>
                <div>
                  <Label>Serial number (optional)</Label>
                  <Input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Serial number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Item description (optional)</Label>
                  <Input
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="e.g. Customer's laptop"
                  />
                </div>
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard
              title="Line items"
              extra={
                <Button variant="outline" onClick={handleAddLine} className="text-sm">
                  + Add line
                </Button>
              }
            >
              <div className="">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-[200px] min-w-[200px]">Part (optional)</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[140px]">Description *</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20">Qty</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-28">Unit price</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-24">Total</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-28">Inventory count</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lines.map((line, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 align-top w-[200px] min-w-[200px]">
                          <div className="min-w-0">
                            <SelectDropdown
                              options={[{ id: 0, name: "—" }, ...rawItemOptions]}
                              value={line.item_id || ""}
                              onChange={(v) => {
                                const id = Number(v);
                                handleUpdateLine(index, "item_id", id);
                                const item = itemsData?.data?.find((i) => i.id === id);
                                handleUpdateLine(index, "item_name", item?.name ?? "");
                              }}
                              placeholder="Part from stock"
                              searchable
                              onSearchChange={setItemSearch}
                              optionsAreFiltered
                              triggerClassName="h-9 min-h-9 text-sm min-w-0 overflow-hidden"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => handleUpdateLine(index, "description", e.target.value)}
                            placeholder="Description"
                            className="w-full min-w-[140px] px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={line.quantity === 0 ? "" : line.quantity}
                            onChange={(e) =>
                              handleUpdateLine(index, "quantity", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unit_price === 0 ? "" : line.unit_price}
                            onChange={(e) =>
                              handleUpdateLine(index, "unit_price", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-gray-900 dark:text-white">
                          {line.total.toFixed(2)}
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={line.inventory_count}
                            onChange={(e) => handleUpdateLine(index, "inventory_count", e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(index)}
                            disabled={lines.length === 1}
                            className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard title="Notes">
              <div className="space-y-4">
                <div>
                  <Label>Notes (optional)</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <Label>Technician notes (optional)</Label>
                  <textarea
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    placeholder="Technician notes"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>
            </SimpleComponentCard>
          </div>

          <div className="space-y-6">
            {!isFoc && (
              <SimpleComponentCard title="Payment">
                <div className="space-y-4">
                  <div>
                    <Label>Payment status</Label>
                    <SelectDropdown
                      options={[
                        { id: "UNPAID", name: "Unpaid" },
                        { id: "PARTIAL", name: "Partial" },
                        { id: "PAID", name: "Paid" },
                      ]}
                      value={paymentStatus}
                      onChange={(v) => setPaymentStatus(v as PaymentStatusRepair)}
                      placeholder="Status"
                      searchable={false}
                    />
                  </div>
                  {(paymentStatus === "PAID" || paymentStatus === "PARTIAL") && (
                    <>
                      <div>
                        <Label>Account *</Label>
                        <SelectDropdown
                          options={accountOptions}
                          value={accountId}
                          onChange={(v) => setAccountId(String(v))}
                          placeholder="Select account"
                          searchable
                        />
                      </div>
                      <div>
                        <Label>Received amount *</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={receivedAmount === 0 ? "" : receivedAmount}
                          onChange={(e) =>
                            setReceivedAmount(e.target.value === "" ? 0 : Number(e.target.value))
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </>
                  )}
                </div>
              </SimpleComponentCard>
            )}

            <SimpleComponentCard title="Summary">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Total amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {isFoc ? "FOC" : totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </SimpleComponentCard>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRepairInvoicePage;
