import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useGetReceiptByIdQuery } from "../redux/services/receipt";
import Button from "../components/ui/button/Button";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import formatDateTime from "../helper/date_converter";
import { handleQueryError } from "../helper/error_handler";

const ViewReceiptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useGetReceiptByIdQuery(Number(id) || 0, {
    skip: !id,
  });

  const receipt = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading receipt...
          </p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    const errorMessage = handleQueryError(
      error,
      "Receipt not found or failed to load"
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error Loading Receipt
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
          <Button
            onClick={() => navigate("/receipts")}
            className="mt-4"
          >
            Back to Receipts
          </Button>
        </div>
      </div>
    );
  }

  const receiptNumber = receipt.receipt_number ?? `#${receipt.id}`;
  const amount = Number(receipt.amount).toFixed(2);

  return (
    <>
      <PageMeta
        title={`Receipt ${receiptNumber}`}
        description="View receipt details"
      />
      <PageBreadcrumb pageTitle={`Receipt ${receiptNumber}`} />

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {receiptNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Created on {formatDateTime(receipt.created_at)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/receipts")}
            className="px-6"
          >
            Back
          </Button>
        </div>

        <SimpleComponentCard title="Receipt Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Receipt Number
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {receiptNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Receipt Date
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {formatDateTime(receipt.receipt_date)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Customer
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {receipt.customer_name ?? `Customer #${receipt.customer_id}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {receipt.account_name ?? `Account #${receipt.account_id}`}
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
            {receipt.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notes
                </label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {receipt.notes}
                </p>
              </div>
            )}
          </div>
        </SimpleComponentCard>
      </div>
    </>
  );
};

export default ViewReceiptPage;
