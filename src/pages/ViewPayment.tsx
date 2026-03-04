import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useGetPaymentByIdQuery } from "../redux/services/payment";
import Button from "../components/ui/button/Button";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import formatDateTime from "../helper/date_converter";
import { handleQueryError } from "../helper/error_handler";

const ViewPaymentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: payment, isLoading, error } = useGetPaymentByIdQuery(
    Number(id) || 0,
    { skip: !id }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading payment...
          </p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    const errorMessage = handleQueryError(
      error,
      "Payment not found or failed to load"
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error Loading Payment
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
          <Button onClick={() => navigate("/payments")} className="mt-4">
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  const amount = Number(payment.amount).toFixed(2);

  return (
    <>
      <PageMeta
        title={`Payment ${payment.payment_number}`}
        description="View payment details"
      />
      <PageBreadcrumb pageTitle={`Payment ${payment.payment_number}`} />

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {payment.payment_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Created on {formatDateTime(payment.created_at)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/payments")}
            className="px-6"
          >
            Back
          </Button>
        </div>

        <SimpleComponentCard title="Payment Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Payment Number
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {payment.payment_number}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Payment Date
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {formatDateTime(payment.payment_date)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Supplier
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {payment.supplier_name ?? `Supplier #${payment.supplier_id}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {payment.account_name ?? `Account #${payment.account_id}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Amount
              </label>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {amount}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Invoice
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {payment.invoice_number ?? (
                  <span className="text-amber-600 dark:text-amber-400">
                    Direct payment
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created by
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {payment.admin_name ?? `Admin #${payment.admin_id}`}
              </p>
            </div>
            {payment.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notes
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>
        </SimpleComponentCard>
      </div>
    </>
  );
};

export default ViewPaymentPage;
