// pages/CustomerStatement/page.tsx
import { useState } from "react";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useGetCustomerStatementQuery } from "../../redux/services/customerStatement";
import { useGetAllCustomersQuery } from "../../redux/services/customer";
import {
  handleApiError,
  handleApiSuccess,
  handleQueryError,
} from "../../helper/error_handler";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import formatDateTime from "../../helper/date_converter";
import { TailSpin } from "react-loader-spinner";
import Button from "../../components/ui/button/Button";
import { generateCustomerStatementPDF } from "../../helper/pdf_generator";

const CustomerStatementPage = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});
  const { data: statementData, isLoading: statementLoading, error } =
    useGetCustomerStatementQuery(
      {
        customer_id: selectedCustomerId,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      },
      {
        skip: !selectedCustomerId,
      }
    );

  const statement = statementData?.data;

  const customerOptions =
    customersData?.data?.map((customer) => ({
      id: customer.id,
      name: customer.name,
    })) || [];

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (Number.isNaN(numAmount)) return "";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const handleGeneratePDF = () => {
    if (!statement) {
      handleApiError(null, "No statement data available");
      return;
    }

    try {
      generateCustomerStatementPDF(statement, fromDate, toDate);
      handleApiSuccess("PDF generated successfully");
    } catch (error) {
      handleApiError(error, "Failed to generate PDF");
    }
  };

  return (
    <>
      <PageMeta
        title="Customer Statement"
        description="View customer account statement"
      />
      <PageBreadcrumb pageTitle="Customer Statement" />

      <div className="space-y-6">
        {/* Customer Selection Card */}
        <SimpleComponentCard
          title="Select Customer & Date Range"
          extra={
            statement && (
              <Button
                variant="green"
                onClick={handleGeneratePDF}
                className="px-4"
              >
                <svg
                  className="w-4 h-4 mr-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </Button>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SelectDropdown
                label="Customer"
                options={customerOptions}
                value={selectedCustomerId}
                onChange={(value) => setSelectedCustomerId(Number(value))}
                placeholder={
                  customersLoading
                    ? "Loading customers..."
                    : "Search and select customer..."
                }
                searchable
                disabled={customersLoading}
              />
            </div>

            <div>
              <DatePicker
                id="from-date"
                label="From Date (Optional)"
                placeholder="Select start date"
                onChange={(_, dateString) => setFromDate(dateString)}
              />
            </div>

            <div>
              <DatePicker
                id="to-date"
                label="To Date (Optional)"
                placeholder="Select end date"
                onChange={(_, dateString) => setToDate(dateString)}
              />
            </div>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Filtering:</strong>{" "}
                {fromDate ? `From ${formatDateTime(fromDate)}` : "All transactions"}
                {toDate
                  ? ` to ${formatDateTime(toDate)}`
                  : fromDate
                    ? " onwards"
                    : ""}
              </p>
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 hover:text-blue-700"
              >
                Clear date filters
              </button>
            </div>
          )}
        </SimpleComponentCard>

        {statementLoading && (
          <div className="flex justify-center items-center py-12">
            <TailSpin height={50} width={50} color="#667085" ariaLabel="loading" />
          </div>
        )}

        {error && selectedCustomerId > 0 && (
          <div className="text-center py-12 bg-white dark:bg-white/[0.03] rounded-xl border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">
              {handleQueryError(error, "Failed to load customer statement")}
            </p>
          </div>
        )}

        {statement && !statementLoading && (
          <>
            <SimpleComponentCard title="Customer Details">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {statement.customer_name}
                  </p>
                </div>
                {statement.company_name && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Company Name
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {statement.company_name}
                    </p>
                  </div>
                )}
                {statement.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {statement.phone}
                    </p>
                  </div>
                )}
                {statement.address && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Address
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {statement.address}
                    </p>
                  </div>
                )}
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard title="Opening Balance">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Opening Balance
                  </p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-2">
                    {formatCurrency(statement.opening_balance)}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                    {formatCurrency(statement.summary.total_sales)}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Total Receipts
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                    {formatCurrency(statement.summary.total_receipts)}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                    {formatCurrency(statement.current_balance)}
                  </p>
                </div>
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard title="Balance Summary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                    {formatCurrency(statement.summary.total_sales)}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Total Receipts
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                    {formatCurrency(statement.summary.total_receipts)}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Outstanding Balance
                  </p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                    {formatCurrency(statement.summary.outstanding_balance)}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {statement.summary.unpaid_invoice_count} unpaid,{" "}
                    {statement.summary.partial_invoice_count} partial
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                    {formatCurrency(statement.current_balance)}
                  </p>
                </div>
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard
              title={`Sale Invoices (${statement.invoices.length})`}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Invoice #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Received Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Outstanding
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {statement.invoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      statement.invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(invoice.invoice_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {invoice.due_date
                              ? formatDateTime(invoice.due_date)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total_amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                            {formatCurrency(invoice.received_amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(invoice.outstanding_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                invoice.payment_status === "PAID"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : invoice.payment_status === "PARTIAL"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {invoice.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard
              title={`Receipts History (${statement.receipts.length})`}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Receipt #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {statement.receipts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                        >
                          No receipts found
                        </td>
                      </tr>
                    ) : (
                      statement.receipts.map((receipt) => (
                        <tr
                          key={receipt.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {receipt.receipt_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(receipt.receipt_date)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(receipt.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {receipt.account_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {receipt.notes || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SimpleComponentCard>
          </>
        )}

        {selectedCustomerId === 0 && (
          <div className="text-center py-12 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select a Customer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Choose a customer from the dropdown above to view their complete
              account statement including sale invoices and receipts.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerStatementPage;
