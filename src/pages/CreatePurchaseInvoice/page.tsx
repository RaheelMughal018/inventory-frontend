// pages/CreatePurchaseInvoicePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useCreatePurchaseInvoiceMutation } from "../../redux/services/purchaseInvoice";
import { toast } from "sonner";
import Button from "../../components/ui/button/Button";

// Mock data - replace with API calls later
const mockSuppliers = [
  { id: 1, name: "ABC Suppliers Ltd", email: "supplier@example.com" },
  { id: 2, name: "XYZ Wholesale", email: "xyz@example.com" },
  { id: 3, name: "Global Traders", email: "global@example.com" },
];

const mockItems = [
  { id: "ITM-ABC123", name: "Widget A", unit_price: 2.0, stock: 100 },
  { id: "ITM-DEF456", name: "Widget B", unit_price: 3.5, stock: 50 },
  { id: "ITM-GHI789", name: "Widget C", unit_price: 5.0, stock: 75 },
  { id: "ITM-JKL012", name: "Widget D", unit_price: 7.5, stock: 25 },
];

interface InvoiceItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const CreatePurchaseInvoicePage = () => {
  const navigate = useNavigate();
  const [createPurchaseInvoice, { isLoading }] =
    useCreatePurchaseInvoiceMutation();

  // Form state
  const [supplierId, setSupplierId] = useState<number>(1);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState<string>("");

  // Items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "temp-1",
      item_id: "ITM-ABC123",
      item_name: "Widget A",
      quantity: 1,
      unit_price: 2.0,
      line_total: 2.0,
    },
  ]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const taxRate = 0.15; // 15% tax
  const taxAmount = subtotal * taxRate;
  const shippingCharges = 5.0;
  const discountAmount = 0;
  const totalAmount = subtotal + taxAmount + shippingCharges - discountAmount;

  // Add new item row
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `temp-${Date.now()}`,
      item_id: "",
      item_name: "",
      quantity: 1,
      unit_price: 0,
      line_total: 0,
    };
    setItems([...items, newItem]);
  };

  // Update item
  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any,
  ) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    item[field] = value;

    // Recalculate line total if quantity or unit_price changes
    if (field === "quantity" || field === "unit_price") {
      item.line_total = item.quantity * item.unit_price;
    }

    // Update item name if item_id changes
    if (field === "item_id") {
      const selectedItem = mockItems.find((i) => i.id === value);
      if (selectedItem) {
        item.item_name = selectedItem.name;
        item.unit_price = selectedItem.unit_price;
        item.line_total = item.quantity * selectedItem.unit_price;
      }
    }

    setItems(updatedItems);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    } else {
      toast.error("At least one item is required");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (items.some((item) => !item.item_id || item.quantity <= 0)) {
      toast.error("Please fill all item details correctly");
      return;
    }

    try {
      // Transform data to match API payload
      const payload = {
        supplier_id: supplierId,
        invoice_date: invoiceDate,
        items: items.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        notes: notes || undefined,
      };

      const response = await createPurchaseInvoice(payload).unwrap();
      toast.success(`Invoice created successfully: ${response.id}`);
      navigate("/purchase-invoices"); // Redirect back to list
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (items.length > 0 || notes || supplierId !== 1) {
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

  return (
    <>
      <PageMeta
        title="Create Purchase Invoice"
        description="Create a new purchase invoice"
      />
      <PageBreadcrumb
        pageTitle="Create Purchase Invoice"
        breadcrumbs={[
          { title: "Purchase Invoices", path: "/purchase-invoices" },
          { title: "Create Invoice", path: "#" },
        ]}
      />

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
            {/* Supplier & Date Card */}
            <ComponentCard title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">Select a supplier</option>
                    {mockSuppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Invoice Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </ComponentCard>

            {/* Items Card */}
            <ComponentCard
              title="Invoice Items"
              extra={
                <Button
                  variant="outline"
                  onClick={handleAddItem}
                  className="text-sm"
                >
                  + Add Item
                </Button>
              }
            >
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
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <select
                            value={item.item_id}
                            onChange={(e) =>
                              handleUpdateItem(index, "item_id", e.target.value)
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          >
                            <option value="">Select item</option>
                            {mockItems.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ${product.unit_price} (Stock:{" "}
                                {product.stock})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "unit_price",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ${item.line_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
            </ComponentCard>

            {/* Notes Card */}
            <ComponentCard title="Additional Information">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Add any additional notes or instructions..."
                />
              </div>
            </ComponentCard>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <ComponentCard title="Invoice Summary">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax (15%)
                  </span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping
                  </span>
                  <span className="font-medium">
                    ${shippingCharges.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Discount
                  </span>
                  <span className="font-medium">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </ComponentCard>

            {/* Quick Stats */}
            <ComponentCard title="Quick Stats">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Items Count
                  </span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Items
                  </span>
                  <span className="font-medium">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Avg. Item Price
                  </span>
                  <span className="font-medium">
                    $
                    {items.length > 0
                      ? (subtotal / items.length).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            </ComponentCard>

            {/* Save Actions */}
            <div className="sticky top-6">
              <ComponentCard>
                <div className="space-y-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full justify-center py-3"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Creating Invoice...
                      </>
                    ) : (
                      "Save & Create Invoice"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full justify-center py-3"
                  >
                    Cancel
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    The invoice will be created as a draft and can be edited
                    later.
                  </p>
                </div>
              </ComponentCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePurchaseInvoicePage;
