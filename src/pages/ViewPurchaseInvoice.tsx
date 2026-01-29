// pages/ViewPurchaseInvoicePage.tsx
import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useAddPurchaseInvoicePaymentMutation, useDeletePaymentMutation, useGetPurchaseInvoiceByIdQuery } from "../redux/services/purchaseInvoice";
import Button from "../components/ui/button/Button";
import { toast } from "sonner";
import { DownloadIcon, TrashBinIcon } from "../icons";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import PaymentModal, { PaymentFormData } from "../components/modals/PaymentModal";
import { useGetAllAccountsQuery } from "../redux/services/account";
import { useState } from "react";
import {generateInvoicePDF} from "../helper/pdf_generator.ts"

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", 
    PARTIAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    UNPAID: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[status as keyof typeof statusStyles] || statusStyles.UNPAID
      }`}
    >
      {status}
    </span>
  );
};

const ViewPurchaseInvoicePage = () => {
  const [deletePayment ] = useDeletePaymentMutation()
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [addPayment] = useAddPurchaseInvoicePaymentMutation()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { data: invoice, isLoading, error } = useGetPurchaseInvoiceByIdQuery(id || "", {
    skip: !id,
  });
  const {data:accountsData} = useGetAllAccountsQuery({})
  const accountOptions =
  accountsData?.accounts?.map((acc) => ({
    id: acc.id,
    name: `${acc.name} - ${acc.type}`,
    type: acc.type,
    
  })) || [];

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    console.log("🚀 ~ handlePaymentSubmit ~ data:", data)
  
    try {
      await addPayment({
        invoice_id: invoice!.id,
        data: {
          account_id: data.payment_account_id,
          amount: data.payment_amount,
        },
      }).unwrap();
  
      toast.success("Payment recorded successfully");
  
      // close modal & reset state
      setIsPaymentModalOpen(false);
  
      // optionally refetch the invoices
    } catch (error) {
      console.log("🚀 ~ handlePaymentSubmit ~ error:", error)
      toast.error(error?.data?.message||"Failed to add payment");
    }
  };
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error Loading Invoice
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Invoice not found or failed to load
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGeneratePDF = () => {
    try {
      generateInvoicePDF(invoice);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } 
  };

  const handleEdit = () => {
    navigate(`/purchase-invoices/edit/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      // TODO: Implement delete functionality
      toast.success("Invoice deleted successfully");
      navigate("/purchase-invoices");
    }
  };

 
  const handleDeletePayment = async (payment_id:string)=>{
    try {
      const res = await deletePayment(payment_id);
      if(res){
        toast.success(res?.data?.message)
      }
    } catch (error) {
      // toast.error(error.data.message)
      console.log("🚀 ~ handleDeletePayment ~ error:", error)
      
    }
  }

  return (
    <>
      <PageMeta
        title={`Invoice ${invoice.id}`}
        description="View purchase invoice details"
      />
      <PageBreadcrumb pageTitle={`Invoice ${invoice.id}`} />

      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoice {invoice.id}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Created on {formatDate(invoice.created_at)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="green" onClick={handleGeneratePDF} className="px-6">
             PDF <DownloadIcon height={25} width={20}/>  
            </Button>
            <Button variant="outline" onClick={handleEdit} className="px-6">
              Edit
            </Button>
            <Button variant="primary" onClick={handleDelete} className="px-6">
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Information */}
            <SimpleComponentCard title="Supplier Information">
              <div className="flex justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Supplier Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {invoice.supplier.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Supplier ID
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {invoice.supplier.user_id}
                    </p>
                  </div>
                  
                </div>
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
                        Item ID
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
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                          {item.item_name}
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                          {item.item_id}
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          ${item.unit_price}
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                          ${item.line_total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SimpleComponentCard>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <SimpleComponentCard title="Payment History">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {invoice.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                            {payment.id}
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {payment.account_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {payment.account_type}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {payment.payment_type}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                            ${payment.amount}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="px-4 py-4 text-sm text-red-600 dark:text-red-400 text-center">
                            <TrashBinIcon height={20} width={20} className="cursor-pointer" onClick={()=>handleDeletePayment(payment.id)}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                      ${invoice.total_amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${invoice.paid_amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Balance Due</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      ${invoice.balance_due}
                    </span>
                  </div>
                </div>

                {invoice.balance_due > 0 && (
                  <div className="pt-4">
                    <Button
                      onClick={()=>setIsPaymentModalOpen(true)}
                      className="w-full justify-center"
                    >
                      Add Payment
                    </Button>
                  </div>
                )}
              </div>
            </SimpleComponentCard>

            {/* Invoice Summary */}
            <SimpleComponentCard title="Invoice Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Items Count</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.items.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Quantity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payments Made</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.payments?.length || 0}
                  </span>
                </div>
              </div>
            </SimpleComponentCard>

          </div>
        </div>
      </div>

       <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => { setIsPaymentModalOpen(false)}}
          onSubmit={handlePaymentSubmit}
          totalAmount={invoice.balance_due}
          accounts={accountOptions}
        />
    </>
  );
};

export default ViewPurchaseInvoicePage;