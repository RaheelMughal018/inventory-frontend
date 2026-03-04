// pages/EditPurchaseInvoicePage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetAllItemsQuery } from "../../redux/services/item";
import {
  type UpdatePurchaseInvoice,
  type PurchaseInvoiceItemDto,
  useGetPurchaseInvoiceByIdQuery,
  useUpdatePurchaseInvoiceMutation,
} from "../../redux/services/purchaseInvoice";
import Button from "../../components/ui/button/Button";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

interface InvoiceItem {
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const EditPurchaseInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id);

  const { data: invoiceData, isLoading: invoiceLoading } = useGetPurchaseInvoiceByIdQuery(invoiceId, {
    skip: !invoiceId,
  });
  const invoice = invoiceData?.data;

  const [updatePurchaseInvoice, { isLoading: isUpdating }] = useUpdatePurchaseInvoiceMutation();
  const [itemSearch, setItemSearch] = useState("");
  const { data: itemsData, isLoading: itemLoading } = useGetAllItemsQuery({
    search: itemSearch || undefined,
    limit: 30,
    page: 1,
  });

  // Form state
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
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

  // Load invoice data when available
  useEffect(() => {
    if (invoice) {
      setInvoiceDate(invoice.invoice_date || "");
      setDueDate(invoice.due_date || "");
      setTax(Number(invoice.tax) || 0);
      setDiscount(Number(invoice.discount) || 0);
      setNotes(invoice.notes || "");

      if (invoice.items && invoice.items.length > 0) {
        setItems(
          invoice.items.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name || "",
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            line_total: Number(item.total_price),
          }))
        );
      }
    }
  }, [invoice]);

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
    if (items.length === 0) {
      handleApiError(null, "Please add at least one item");
      return;
    }

    if (items.some((item) => !item.item_id || item.quantity <= 0)) {
      handleApiError(null, "Please fill all item details correctly");
      return;
    }

    try {
      // Transform data to match API payload
      const invoiceItems: PurchaseInvoiceItemDto[] = items.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const payload: UpdatePurchaseInvoice = {
        id: invoiceId,
        invoice_date: invoiceDate || undefined,
        due_date: dueDate || undefined,
        items: invoiceItems,
        tax: tax || 0,
        discount: discount || 0,
        notes: notes || undefined,
      };

      const response = await updatePurchaseInvoice(payload).unwrap();
      handleApiSuccess(`Invoice ${response.data.invoice_number} updated successfully`);
      navigate("/purchase-invoices");
    } catch (error) {
      handleApiError(error, "Failed to update invoice");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All changes will be lost.",
      )
    ) {
      navigate("/purchase-invoices");
    }
  };

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

  // Loading state
  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Invoice Not Found
          </h2>
          <Button onClick={() => navigate("/purchase-invoices")} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Edit Invoice ${invoice.invoice_number}`}
        description="Edit purchase invoice"
      />
      <PageBreadcrumb pageTitle={`Edit Invoice ${invoice.invoice_number}`} />

      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update invoice details below
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-6"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Info (Read-only) */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-3">
                Supplier Information (Read-only)
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Supplier: </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.supplier_name || `Supplier #${invoice.supplier_id}`}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status: </span>
                  <span className={`text-sm font-medium ${
                    invoice.payment_status === 'PAID' 
                      ? 'text-green-600 dark:text-green-400'
                      : invoice.payment_status === 'PARTIAL'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {invoice.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  defaultDate={dueDate}
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

              <div className="overflow-x-auto">
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

          {/* Right Column - Summary */}
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
                    {subtotal.toFixed(2)}
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
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
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

export default EditPurchaseInvoicePage;
