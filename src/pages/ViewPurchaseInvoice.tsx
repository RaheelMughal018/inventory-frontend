// pages/ViewPurchaseInvoicePage.tsx
import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useGetPurchaseInvoiceByIdQuery, PaymentStatus } from "../redux/services/purchaseInvoice";
import Button from "../components/ui/button/Button";
import { DownloadIcon } from "../icons";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import formatDateTime from "../helper/date_converter";
import { handleQueryError, handleApiError, handleApiSuccess } from "../helper/error_handler";
import { generateInvoicePDF } from "../helper/pdf_generator";

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const statusStyles = {
    [PaymentStatus.PAID]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", 
    [PaymentStatus.PARTIAL]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    [PaymentStatus.UNPAID]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || statusStyles[PaymentStatus.UNPAID]
      }`}
    >
      {status}
    </span>
  );
};

const ViewPurchaseInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, error } = useGetPurchaseInvoiceByIdQuery(Number(id) || 0, {
    skip: !id,
  });

  const invoice = data?.data;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !invoice) {
    const errorMessage = handleQueryError(error, "Invoice not found or failed to load");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error Loading Invoice
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
          <Button
            onClick={() => navigate("/purchase-invoices")}
            className="mt-4"
          >
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(numAmount)) return "";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const handleGeneratePDF = () => {
    try {
      generateInvoicePDF(invoice);
      handleApiSuccess("PDF generated successfully");
    } catch (error) {
      handleApiError(error, "Failed to generate PDF");
    }
  };

  const handleEdit = () => {
    navigate(`/purchase-invoices/edit/${id}`);
  };

  const handleBack = () => {
    navigate("/purchase-invoices");
  };

  return (
    <>
      <PageMeta
        title={`Invoice ${invoice.invoice_number}`}
        description="View purchase invoice details"
      />
      <PageBreadcrumb pageTitle={`Invoice ${invoice.invoice_number}`} />

      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Created on {formatDateTime(invoice.created_at)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="px-6">
              Back
            </Button>
            <Button variant="green" onClick={handleGeneratePDF} className="px-6">
             PDF <DownloadIcon height={25} width={20}/>  
            </Button>
            {invoice.payment_status === PaymentStatus.UNPAID && (
              <Button variant="outline" onClick={handleEdit} className="px-6">
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Information */}
            <SimpleComponentCard title="Supplier Information">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Supplier Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {invoice.supplier_name || `Supplier #${invoice.supplier_id}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Admin
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {invoice.admin_name || `Admin #${invoice.admin_id}`}
                  </p>
                </div>
                {invoice.due_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Due Date
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDateTime(invoice.due_date)}
                    </p>
                  </div>
                )}
              </div>
            </SimpleComponentCard>

            {/* Invoice Items */}
            <SimpleComponentCard title="Invoice Items">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                          {item.item_name || `Item #${item.item_id}`}
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="mt-6 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {Number(invoice.tax) > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                {Number(invoice.discount) > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Discount</span>
                    <span className="font-medium">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span>Total Amount</span>
                  <span>{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </SimpleComponentCard>

            {/* Notes */}
            {invoice.notes && (
              <SimpleComponentCard title="Notes">
                <p className="text-gray-700 dark:text-gray-300">{invoice.notes}</p>
              </SimpleComponentCard>
            )}
          </div>

          {/* Right Column - Summary & Status */}
          <div className="space-y-6">
            {/* Payment Status */}
            <SimpleComponentCard title="Payment Status">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <PaymentStatusBadge status={invoice.payment_status} />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(invoice.paid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Outstanding</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(invoice.outstanding_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </SimpleComponentCard>

            {/* Invoice Summary */}
            <SimpleComponentCard title="Invoice Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice Number</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(invoice.invoice_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Items Count</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.items?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created By</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.admin_name || `Admin #${invoice.admin_id}`}
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

export default ViewPurchaseInvoicePage;
