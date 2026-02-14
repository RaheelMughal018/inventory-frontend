// pages/CreatePurchaseInvoicePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {useGetAllItemsQuery} from "../../redux/services/item"
import {useGetAllSuppliersQuery} from "../../redux/services/supplier"
import {
  type PurchaseInvoiceCreate,
  useCreatePurchaseInvoiceMutation,
} from "../../redux/services/purchaseInvoice";
import { toast } from "sonner";
import Button from "../../components/ui/button/Button";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import { useGetAllAccountsQuery } from "../../redux/services/account";
import PaymentModal, { PaymentFormData } from "../../components/modals/PaymentModal";

// Mock data - replace with API calls later


interface InvoiceItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

const CreatePurchaseInvoicePage = () => {
  const navigate = useNavigate();
  const [createPurchaseInvoice, { isLoading }] =
    useCreatePurchaseInvoiceMutation();
  const {data: accountsData} = useGetAllAccountsQuery({})
 
  const {data:itemsData, isLoading:itemLoading} = useGetAllItemsQuery({
    
  })
  const {data:supplierData, isLoading:supplierLoading} = useGetAllSuppliersQuery({
    
  })
  // Form state
  const [supplierId, setSupplierId] = useState<number|string>();
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

const [paymentData, setPaymentData] = useState<{
  payment_account_id: string | null;
  payment_amount: number;
}>({
  payment_account_id: null,
  payment_amount: 0,
});

const accountOptions =
  accountsData?.accounts?.map((acc) => ({
    id: acc.id,
    name: `${acc.name} - ${acc.type}`,
  })) || [];

  // Items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "",
      item_name: "",
      quantity: 0,
      unit_price: 0.0,
      line_total: 0.0,
    },
  ]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const discountAmount = 0;
  const totalAmount = subtotal - discountAmount;

  // Add new item row
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: "",
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
    if (field === "id") item.id = String(value);

    // Recalculate line total if quantity or unit_price changes
    if (field === "quantity" || field === "unit_price") {
      item.line_total = item.quantity * item.unit_price;
    }

    // Update item name if item_id changes
    if (field === "id") {
      const selectedItem = itemsData?.items?.find((i) => i.id === String(value));
      if (selectedItem) {
        item.item_name = selectedItem.name;
        item.unit_price = selectedItem.avg_price;
        item.line_total = item.quantity * selectedItem.avg_price;
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

    if (items.some((item) => !item.id || item.quantity <= 0)) {
      toast.error("Please fill all item details correctly");
      return;
    }

    try {
      // Transform data to match API payload
      const payload: PurchaseInvoiceCreate = {
        supplier_id: supplierId,
        items: items.map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        invoice_date: invoiceDate, // YYYY-MM-DD format from date picker state
        payment_amount: paymentData.payment_amount,
        payment_account_id: paymentData.payment_account_id,
      };
      console.log("🚀 ~ handleSubmit ~ payload:", payload)

      const response = await createPurchaseInvoice(payload).unwrap();
      toast.success(`Invoice created successfully: ${response.id}`);
      navigate("/purchase");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (items.length > 0 || invoiceDate || supplierId !== 1) {
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
    supplierData?.suppliers?.map((supplier) => ({
      id: supplier.id,
      name: `${supplier.name}`,
    })) || [];

  // Transform items for SelectDropdown
  const itemOptions =
    itemsData?.items?.map((item) => ({
      id: item.id,
      name: `${item.name}`,
    })) || [];

    const handlePaymentSave = (data: PaymentFormData) => {
  setPaymentData({
    payment_account_id: data.payment_account_id,
    payment_amount: data.payment_amount,
  });

  setIsPaymentModalOpen(false);
};


  return (
    <>
      <PageMeta
        title="Create Purchase Invoice"
        description="Create a new purchase invoice"
      />
      <PageBreadcrumb
        pageTitle="Create Purchase Invoice"
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
            {/* <ComponentCard title="Basic Information"> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Selection */}
               {/* Supplier Selection */}
              <div>
                <SelectDropdown
                  label="Supplier"
                  required
                  options={supplierOptions}
                  value={supplierId}
                  onChange={(value) => setSupplierId(value)}
                  placeholder={
                    supplierLoading
                      ? "Loading suppliers..."
                      : "Search and select supplier..."
                  }
                  searchable
                  disabled={supplierLoading}
                />
              </div>

              {/* Date (UI-only for now) */}
              <div>

                <DatePicker
                  id="invoice-date"
                  label="Invoice Date"
                  placeholder="Select a date"
                  defaultDate={invoiceDate}
                  onChange={(_, currentDateString) => {
                    setInvoiceDate(currentDateString);
                  }}
                />
              </div>
            </div>
            {/* </ComponentCard> */}

            {/* Items Card */}
            <div className="flex items-center justify-between">

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
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                        <SelectDropdown
                          options={itemOptions}
                          value={item.id}
                          onChange={(value) =>
                            handleUpdateItem(index, "id", String(value))
                          }
                          placeholder={
                            itemLoading
                              ? "Loading items..."
                              : "Search and select item..."
                          }
                          searchable
                          disabled={itemLoading}
                          className="w-72"
                          triggerClassName="h-9 px-3 py-1 text-xs"
                        />
                      </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "quantity",
                                e.target.value === "" ? 0 : Number(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {item.line_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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

            {/* Notes Card removed (moved to top right) */}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Invoice Summary
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{subtotal.toFixed(2)}</span>
              </div>

              {/* <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax (15%)
                </span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div> */}

              {/* <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                <span className="font-medium">
                  ${shippingCharges.toFixed(2)}
                </span>
              </div> */}

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                 Pay 
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {paymentData.payment_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  -{discountAmount.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-brand-600 dark:text-brand-400">
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              </div>
            {/* Quick Stats */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Quick Stats 
              </h3>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Items Count
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Items
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Payment 
              </h3>
              <Button
                  variant="primary"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full justify-center py-3"
                >
                  Pay
                </Button> 
                
              </div>

           
          </div>
        </div>
      </div>

      <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handlePaymentSave}
          totalAmount={totalAmount}
          accounts={accountOptions}
/>
    </>
  );
};

export default CreatePurchaseInvoicePage;
