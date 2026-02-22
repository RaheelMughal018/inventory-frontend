// pages/CreatePurchaseInvoicePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetAllItemsQuery } from "../../redux/services/item";
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import {
  type CreatePurchaseInvoice,
  type PurchaseInvoiceItemDto,
  PaymentStatus,
  useCreatePurchaseInvoiceMutation,
} from "../../redux/services/purchaseInvoice";
import Button from "../../components/ui/button/Button";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

interface InvoiceItem {
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const CreatePurchaseInvoicePage = () => {
  const navigate = useNavigate();
  const [createPurchaseInvoice, { isLoading }] = useCreatePurchaseInvoiceMutation();

  const [itemSearch, setItemSearch] = useState("");
  const { data: itemsData, isLoading: itemLoading } = useGetAllItemsQuery({
    search: itemSearch || undefined,
    limit: 30,
    page: 1,
  });
  const { data: supplierData, isLoading: supplierLoading } = useGetAllSuppliersQuery({});
  const { data: accountsData, isLoading: accountsLoading } = useGetAllAccountsQuery({});

  // Form state
  const [supplierId, setSupplierId] = useState<number | string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString());
  const [dueDate, setDueDate] = useState<string>("");
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);
  const [accountId, setAccountId] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      item_id: 0,
      item_name: "",
      quantity: 0,
      unit_price: 0.0,
      line_total: 0.0,
    },
  ]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const totalAmount = subtotal + tax - discount;

  // Add new item row
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      item_id: 0,
      item_name: "",
      quantity: 0,
      unit_price: 0,
      line_total: 0,
    };
    setItems([...items, newItem]);
  };

  // Update item
  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const updatedItems = [...items];
    const existing = updatedItems[index];
    if (!existing) return;

    const item: InvoiceItem = { ...existing };

    if (field === "item_name") item.item_name = String(value);
    if (field === "quantity") item.quantity = Number(value);
    if (field === "unit_price") item.unit_price = Number(value);
    if (field === "line_total") item.line_total = Number(value);
    if (field === "item_id") item.item_id = Number(value);

    // Recalculate line total if quantity or unit_price changes
    if (field === "quantity" || field === "unit_price") {
      item.line_total = item.quantity * item.unit_price;
    }

    // Update item name if item_id changes
    if (field === "item_id") {
      const selectedItem = itemsData?.data?.find((i) => i.id === Number(value));
      if (selectedItem) {
        item.item_name = selectedItem.name;
        const avgPrice = typeof selectedItem.avg_price === 'string' 
          ? parseFloat(selectedItem.avg_price) 
          : selectedItem.avg_price;
        item.unit_price = avgPrice || 0;
        item.line_total = item.quantity * item.unit_price;
      }
    }

    updatedItems[index] = item;
    setItems(updatedItems);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    } else {
      handleApiError(null, "At least one item is required");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!supplierId) {
      handleApiError(null, "Please select a supplier");
      return;
    }

    if (items.length === 0) {
      handleApiError(null, "Please add at least one item");
      return;
    }

    if (items.some((item) => !item.item_id || item.quantity <= 0)) {
      handleApiError(null, "Please fill all item details correctly");
      return;
    }

    // Validate payment data
    if (paymentStatus === PaymentStatus.PAID && paidAmount !== totalAmount) {
      handleApiError(null, "Paid amount must equal total amount for PAID status");
      return;
    }

    if (paymentStatus === PaymentStatus.PARTIAL && (paidAmount <= 0 || paidAmount >= totalAmount)) {
      handleApiError(null, "Paid amount must be between 0 and total amount for PARTIAL status");
      return;
    }

    if ((paymentStatus === PaymentStatus.PAID || paymentStatus === PaymentStatus.PARTIAL) && !accountId) {
      handleApiError(null, "Please select an account for payment");
      return;
    }

    try {
      // Transform data to match API payload
      const invoiceItems: PurchaseInvoiceItemDto[] = items.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const payload: CreatePurchaseInvoice = {
        supplier_id: Number(supplierId),
        items: invoiceItems,
        invoice_date: invoiceDate,
        due_date: dueDate || undefined,
        tax: tax || 0,
        discount: discount || 0,
        payment_status: paymentStatus,
        account_id: accountId ? Number(accountId) : undefined,
        paid_amount: paidAmount || 0,
        notes: notes || undefined,
      };

      const response = await createPurchaseInvoice(payload).unwrap();
      handleApiSuccess(`Invoice ${response.data.invoice_number} created successfully`);
      navigate("/purchase-invoices");
    } catch (error) {
      handleApiError(error, "Failed to create invoice");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (items.length > 0 || supplierId) {
      if (
        window.confirm(
          "Are you sure you want to cancel? All changes will be lost.",
        )
      ) {
        navigate("/purchase-invoices");
      }
    } else {
      navigate("/purchase-invoices");
    }
  };

  // Transform suppliers for SelectDropdown
  const supplierOptions =
    supplierData?.data?.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
    })) || [];

  // Transform items for SelectDropdown (include selected row items so they stay visible when not in search results)
  const apiItemOptions =
    itemsData?.data?.map((item) => ({ id: item.id, name: item.name })) || [];
  const apiIds = new Set(apiItemOptions.map((o) => o.id));
  const selectedOnly = items
    .filter((row) => row.item_id && !apiIds.has(row.item_id))
    .map((row) => ({ id: row.item_id, name: row.item_name || `Item #${row.item_id}` }));
  const itemOptions = [...apiItemOptions];
  selectedOnly.forEach((opt) => {
    if (!itemOptions.some((o) => o.id === opt.id)) itemOptions.push(opt);
  });

  // Transform accounts for SelectDropdown
  const accountOptions =
    accountsData?.data?.map((account) => ({
      id: account.id,
      name: `${account.name} (${account.account_type})`,
    })) || [];

  return (
    <>
      <PageMeta
        title="Create Purchase Invoice"
        description="Create a new purchase invoice"
      />
      <PageBreadcrumb pageTitle="Create Purchase Invoice" />

      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Purchase Invoice
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details below to create a new purchase invoice
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
            {/* Supplier & Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Selection */}
              <div>
                <SelectDropdown
                  label="Supplier"
                  required
                  options={supplierOptions}
                  value={supplierId}
                  onChange={(value) => setSupplierId(Number(value))}
                  placeholder={
                    supplierLoading
                      ? "Loading suppliers..."
                      : "Search and select supplier..."
                  }
                  searchable
                  disabled={supplierLoading}
                />
              </div>

              {/* Invoice Date */}
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

              {/* Due Date */}
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
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "quantity",
                                e.target.value === "" ? 0 : Number(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price === 0 ? "" : item.unit_price}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "unit_price",
                                e.target.value === "" ? 0 : Number(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          ${item.line_total.toFixed(2)}
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
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Tax Input */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax === 0 ? "" : tax}
                    onChange={(e) => setTax(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white text-sm"
                    placeholder="0.00"
                  />
                </div>

                {/* Discount Input */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) => setDiscount(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:text-white text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      ${totalAmount.toFixed(2)}
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

              {/* Payment Status */}
              <div>
                <Label>Payment Status <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setPaymentStatus(PaymentStatus.UNPAID);
                      setPaidAmount(0);
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
                      setPaidAmount(totalAmount);
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

              {/* Show payment fields if PAID or PARTIAL */}
              {(paymentStatus === PaymentStatus.PAID || paymentStatus === PaymentStatus.PARTIAL) && (
                <>
                  {/* Account Selection */}
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

                  {/* Paid Amount */}
                  <div>
                    <Label>Paid Amount <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={paidAmount === 0 ? "" : paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                      placeholder="0.00"
                    />
                    {paymentStatus === PaymentStatus.PAID && paidAmount !== totalAmount && (
                      <p className="text-xs text-red-500 mt-1">
                        Must equal total amount (${totalAmount.toFixed(2)})
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
                <span className="text-gray-600 dark:text-gray-400">Items Count</span>
                <span className="font-medium text-gray-900 dark:text-white">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Quantity</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {items.reduce((sum, item) => sum + item.quantity, 0).toFixed(3)}
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

export default CreatePurchaseInvoicePage;
