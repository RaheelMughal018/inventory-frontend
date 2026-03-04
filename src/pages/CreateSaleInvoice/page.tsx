// pages/CreateSaleInvoicePage.tsx – same UI as CreatePurchaseInvoice with Serial + Unit Type columns
import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetAllItemsQuery } from "../../redux/services/item";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import {
  CreateSaleInvoice,
  PaymentStatus,
  SaleInvoiceItemDto,
  useCreateSaleInvoiceMutation,
} from "../../redux/services/saleInvoice";
import Button from "../../components/ui/button/Button";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";
import { ItemType, UnitType } from "../../redux/services/item";

interface SaleInvoiceItem {
  item_id: number;
  item_name: string;
  item_type: ItemType;
  unit_type: UnitType;
  serial_number: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const CreateSaleInvoicePage = () => {
  const navigate = useNavigate();
  const [createSaleInvoice, { isLoading }] = useCreateSaleInvoiceMutation();

  const [itemSearch, setItemSearch] = useState("");
  const { data: itemsData, isLoading: itemLoading } = useGetAllItemsQuery({
    search: itemSearch || undefined,
    limit: 30,
    page: 1,
  });
  const { data: customersData, isLoading: customerLoading } = useGetAllCustomersQuery({});
  const { data: accountsData, isLoading: accountsLoading } = useGetAllAccountsQuery({});

  const [customerId, setCustomerId] = useState<number | string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString());
  const [dueDate, setDueDate] = useState<string>("");
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);
  const [accountId, setAccountId] = useState<string>("");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [items, setItems] = useState<SaleInvoiceItem[]>([
    {
      item_id: 0,
      item_name: "",
      item_type: ItemType.RAW,
      unit_type: UnitType.PCS,
      serial_number: "",
      quantity: 0,
      unit_price: 0,
      line_total: 0,
    },
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const totalAmount = subtotal + tax - discount;

  const handleAddItem = () => {
    const newItem: SaleInvoiceItem = {
      item_id: 0,
      item_name: "",
      item_type: ItemType.RAW,
      unit_type: UnitType.PCS,
      serial_number: "",
      quantity: 0,
      unit_price: 0,
      line_total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof SaleInvoiceItem,
    value: string | number,
  ) => {
    const updatedItems = [...items];
    const existing = updatedItems[index];
    if (!existing) return;

    const item: SaleInvoiceItem = { ...existing };

    if (field === "item_name") item.item_name = String(value);
    if (field === "quantity") item.quantity = Number(value);
    if (field === "unit_price") item.unit_price = Number(value);
    if (field === "line_total") item.line_total = Number(value);
    if (field === "serial_number") item.serial_number = String(value);
    if (field === "item_id") item.item_id = Number(value);
    if (field === "item_type") item.item_type = value as ItemType;
    if (field === "unit_type") item.unit_type = value as UnitType;

    if (field === "quantity" || field === "unit_price") {
      item.line_total = item.quantity * item.unit_price;
    }

    if (field === "item_id") {
      const selectedItem = itemsData?.data?.find((i) => i.id === Number(value));
      if (selectedItem) {
        item.item_name = selectedItem.name;
        item.item_type = selectedItem.item_type;
        item.unit_type = selectedItem.unit_type;
        const avgPrice =
          typeof selectedItem.avg_price === "string"
            ? parseFloat(selectedItem.avg_price)
            : selectedItem.avg_price;
        item.unit_price = avgPrice || 0;
        if (selectedItem.item_type === ItemType.FINAL) {
          item.quantity = 1;
          item.line_total = item.unit_price;
        } else {
          item.line_total = item.quantity * item.unit_price;
        }
      }
    }

    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      handleApiError(null, "At least one item is required");
    }
  };

  const buildItemsPayload = (): SaleInvoiceItemDto[] => {
    return items
      .filter((r) => r.item_id > 0)
      .map((r) => {
        if (r.item_type === ItemType.FINAL) {
          return {
            item_id: r.item_id,
            serial_number: r.serial_number || undefined,
            quantity: 1,
          };
        }
        return { item_id: r.item_id, quantity: r.quantity || undefined };
      })
      .filter(
        (d) =>
          (d.serial_number !== undefined && d.serial_number !== "") ||
          (d.quantity !== undefined && d.quantity > 0),
      );
  };

  const handleSubmit = async () => {
    if (!customerId) {
      handleApiError(null, "Please select a customer");
      return;
    }
    const payloadItems = buildItemsPayload();
    if (payloadItems.length === 0) {
      handleApiError(null, "Please add at least one item with serial number (FINAL) or quantity (RAW)");
      return;
    }

    if (paymentStatus === PaymentStatus.PAID && receivedAmount !== totalAmount) {
      handleApiError(null, "Received amount must equal total amount for PAID status");
      return;
    }
    if (
      paymentStatus === PaymentStatus.PARTIAL &&
      (receivedAmount <= 0 || receivedAmount >= totalAmount)
    ) {
      handleApiError(
        null,
        "Received amount must be between 0 and total amount for PARTIAL status",
      );
      return;
    }
    if (
      (paymentStatus === PaymentStatus.PAID ||
        paymentStatus === PaymentStatus.PARTIAL) &&
      !accountId
    ) {
      handleApiError(null, "Please select an account for payment");
      return;
    }

    const payload: CreateSaleInvoice = {
      customer_id: Number(customerId),
      invoice_date: invoiceDate,
      due_date: dueDate || undefined,
      items: payloadItems,
      tax: tax || 0,
      discount: discount || 0,
      payment_status: paymentStatus,
      account_id: accountId ? Number(accountId) : undefined,
      received_amount: receivedAmount || 0,
      notes: notes || undefined,
    };

    try {
      const response = await createSaleInvoice(payload).unwrap();
      handleApiSuccess(
        `Sale invoice ${response.data.invoice_number} created successfully`,
      );
      navigate("/sale-invoices");
    } catch (error) {
      handleApiError(error, "Failed to create sale invoice");
    }
  };

  const handleCancel = () => {
    if (items.length > 0 || customerId) {
      if (
        window.confirm(
          "Are you sure you want to cancel? All changes will be lost.",
        )
      ) {
        navigate("/sale-invoices");
      }
    } else {
      navigate("/sale-invoices");
    }
  };

  const customerOptions =
    customersData?.data?.map((c) => ({ id: c.id, name: c.name })) || [];

  const apiItemOptions =
    itemsData?.data?.map((item) => ({ id: item.id, name: item.name })) || [];
  const apiIds = new Set(apiItemOptions.map((o) => o.id));
  const selectedOnly = items
    .filter((row) => row.item_id && !apiIds.has(row.item_id))
    .map((row) => ({
      id: row.item_id,
      name: row.item_name || `Item #${row.item_id}`,
    }));
  const itemOptions = [...apiItemOptions];
  selectedOnly.forEach((opt) => {
    if (!itemOptions.some((o) => o.id === opt.id)) itemOptions.push(opt);
  });

  const accountOptions =
    accountsData?.data?.map((account) => ({
      id: account.id,
      name: `${account.name} (${account.account_type})`,
    })) || [];

  return (
    <>
      <PageMeta
        title="Create Sale Invoice"
        description="Create a new sale invoice"
      />
      <PageBreadcrumb pageTitle="Create Sale Invoice" />

      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Sale Invoice
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details below to create a new sale invoice. FINAL: use
              serial number (qty=1). RAW: use quantity.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6"
            >
              {isLoading ? "Creating..." : "Save Invoice"}
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SelectDropdown
                  label="Customer"
                  required
                  options={customerOptions}
                  value={customerId}
                  onChange={(value) => setCustomerId(Number(value))}
                  placeholder={
                    customerLoading
                      ? "Loading customers..."
                      : "Search and select customer..."
                  }
                  searchable
                  disabled={customerLoading}
                />
              </div>

              <div>
                <DatePicker
                  id="invoice-date"
                  label="Invoice Date"
                  placeholder="Select invoice date"
                  defaultDate={invoiceDate}
                  onChange={(_, currentDateString) => {
                    setInvoiceDate(currentDateString);
                  }}
                />
              </div>

              <div>
                <DatePicker
                  id="due-date"
                  label="Due Date (Optional)"
                  placeholder="Select due date"
                  onChange={(_, currentDateString) => {
                    setDueDate(currentDateString);
                  }}
                />
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Invoice Items
                </h3>
                <Button
                  variant="outline"
                  onClick={handleAddItem}
                  className="text-sm"
                >
                  + Add Item
                </Button>
              </div>

              <div className="">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Serial
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <SelectDropdown
                            options={itemOptions}
                            value={item.item_id || ""}
                            onChange={(value) =>
                              handleUpdateItem(index, "item_id", Number(value))
                            }
                            placeholder={
                              itemLoading
                                ? "Loading items..."
                                : "Search and select item..."
                            }
                            searchable
                            onSearchChange={setItemSearch}
                            optionsAreFiltered={true}
                            disabled={itemLoading}
                            className="w-72"
                            triggerClassName="h-9 px-3 py-1 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {item.item_type === ItemType.FINAL ? (
                            <input
                              type="text"
                              value={item.serial_number}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "serial_number",
                                  e.target.value,
                                )
                              }
                              placeholder="Serial number"
                              className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white min-w-[100px]"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {item.item_id ? item.unit_type : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={
                              item.quantity === 0 ? "" : item.quantity
                            }
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "quantity",
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            disabled={item.item_type === ItemType.FINAL}
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white disabled:opacity-70"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              item.unit_price === 0 ? "" : item.unit_price
                            }
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "unit_price",
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {item.line_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                            disabled={items.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Payment */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Invoice Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax === 0 ? "" : tax}
                    onChange={(e) =>
                      setTax(e.target.value === "" ? 0 : Number(e.target.value))
                    }
                    className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Discount
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) =>
                      setDiscount(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">
                      Total Amount
                    </span>
                    <span className="text-brand-600 dark:text-brand-400">
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Payment Details
              </h3>

              <div>
                <Label>
                  Payment Status <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setPaymentStatus(PaymentStatus.UNPAID);
                      setReceivedAmount(0);
                      setAccountId("");
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded border ${
                      paymentStatus === PaymentStatus.UNPAID
                        ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Unpaid
                  </button>
                  <button
                    onClick={() => setPaymentStatus(PaymentStatus.PARTIAL)}
                    className={`flex-1 px-3 py-2 text-sm rounded border ${
                      paymentStatus === PaymentStatus.PARTIAL
                        ? "bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-400"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Partial
                  </button>
                  <button
                    onClick={() => {
                      setPaymentStatus(PaymentStatus.PAID);
                      setReceivedAmount(totalAmount);
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded border ${
                      paymentStatus === PaymentStatus.PAID
                        ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              {(paymentStatus === PaymentStatus.PAID ||
                paymentStatus === PaymentStatus.PARTIAL) && (
                <>
                  <div>
                    <SelectDropdown
                      label="Payment Account"
                      required
                      options={accountOptions}
                      value={accountId}
                      onChange={(value) => setAccountId(String(value))}
                      placeholder={
                        accountsLoading
                          ? "Loading accounts..."
                          : "Search and select account..."
                      }
                      searchable
                      disabled={accountsLoading}
                    />
                  </div>

                  <div>
                    <Label>
                      Received Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={
                        receivedAmount === 0 ? "" : receivedAmount
                      }
                      onChange={(e) =>
                        setReceivedAmount(
                          e.target.value === ""
                            ? 0
                            : Number(e.target.value),
                        )
                      }
                      placeholder="0.00"
                    />
                    {paymentStatus === PaymentStatus.PAID &&
                      receivedAmount !== totalAmount && (
                        <p className="text-xs text-red-500 mt-1">
                          Must equal total amount (
                          {totalAmount.toFixed(2)})
                        </p>
                      )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Quick Stats
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Items Count
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Quantity
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {items
                    .reduce((sum, item) => sum + item.quantity, 0)
                    .toFixed(1)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (Optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSaleInvoicePage;
