// pages/SupplierStatementPage.tsx
import { useState } from "react";
import SimpleComponentCard from "../../components/common/SimpleCardComponent";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useGetSupplierStatementQuery } from "../../redux/services/supplierStatement";
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";
import { handleApiError, handleApiSuccess, handleQueryError } from "../../helper/error_handler";
import SelectDropdown from "../../components/form/SelectDropdown";
import DatePicker from "../../components/form/date-picker";
import formatDateTime from "../../helper/date_converter";
import { TailSpin } from "react-loader-spinner";
import Button from "../../components/ui/button/Button";
import { generateSupplierStatementPDF } from "../../helper/pdf_generator";

const SupplierStatementPage = () => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: suppliersData, isLoading: suppliersLoading } = useGetAllSuppliersQuery({});
  const { data: statementData, isLoading: statementLoading, error } = useGetSupplierStatementQuery(
    {
      supplier_id: selectedSupplierId,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    },
    {
      skip: !selectedSupplierId,
    }
  );

  const statement = statementData?.data;

  // Transform suppliers for dropdown
  const supplierOptions =
    suppliersData?.data?.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
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
      generateSupplierStatementPDF(statement, fromDate, toDate);
      handleApiSuccess("PDF generated successfully");
    } catch (error) {
      handleApiError(error, "Failed to generate PDF");
    }
  };

  return (
    <>
      <PageMeta title="Supplier Statement" description="View supplier account statement" />
      <PageBreadcrumb pageTitle="Supplier Statement" />
      
      <div className="space-y-6">
        {/* Supplier Selection Card */}
        <SimpleComponentCard 
          title="Select Supplier & Date Range"
          extra={
            statement && (
              <Button
                variant="green"
                onClick={handleGeneratePDF}
                className="px-4"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </Button>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier Dropdown */}
            <div>
              <SelectDropdown
                label="Supplier"
                options={supplierOptions}
                value={selectedSupplierId}
                onChange={(value) => setSelectedSupplierId(Number(value))}
                placeholder={suppliersLoading ? "Loading suppliers..." : "Search and select supplier..."}
                searchable
                disabled={suppliersLoading}
              />
            </div>

            {/* From Date */}
            <div>
              <DatePicker
                id="from-date"
                label="From Date (Optional)"
                placeholder="Select start date"
                onChange={(_, dateString) => setFromDate(dateString)}
              />
            </div>

            {/* To Date */}
            <div>
              <DatePicker
                id="to-date"
                label="To Date (Optional)"
                placeholder="Select end date"
                onChange={(_, dateString) => setToDate(dateString)}
              />
            </div>
          </div>

          {/* Date Range Info */}
          {(fromDate || toDate) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Filtering:</strong> {fromDate ? `From ${formatDateTime(fromDate)}` : "All transactions"} 
                {toDate ? ` to ${formatDateTime(toDate)}` : fromDate ? " onwards" : ""}
              </p>
              {(fromDate || toDate) && (
                <button
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 hover:text-blue-700"
                >
                  Clear date filters
                </button>
              )}
            </div>
          )}
        </SimpleComponentCard>

        {/* Loading State */}
        {statementLoading && (
          <div className="flex justify-center items-center py-12">
            <TailSpin height={50} width={50} color="#667085" ariaLabel="loading" />
          </div>
        )}

        {/* Error State */}
        {error && selectedSupplierId > 0 && (
          <div className="text-center py-12 bg-white dark:bg-white/[0.03] rounded-xl border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{handleQueryError(error, "Failed to load supplier statement")}</p>
          </div>
        )}

        {/* Statement Content */}
        {statement && !statementLoading && (
          <>
            {/* Supplier Details Card */}
            <SimpleComponentCard title="Supplier Details">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Supplier Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {statement.supplier_name}
                  </p>
                </div>
                {statement.company_name && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Company Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {statement.company_name}
                    </p>
                  </div>
                )}
                {statement.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {statement.phone}
                    </p>
                  </div>
                )}
                {statement.address && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {statement.address}
                    </p>
                  </div>
                )}
              </div>
            </SimpleComponentCard>

            {/* Balance Summary Card */}
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
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Purchases</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                    {formatCurrency(statement.summary.total_purchases)}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                    {formatCurrency(statement.summary.total_payments)}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Current Balance</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                    {formatCurrency(statement.current_balance)}
                  </p>
                </div>
              </div>
            </SimpleComponentCard>

            <SimpleComponentCard title="Balance Summary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Purchases</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                    {formatCurrency(statement.summary.total_purchases)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {/* {statement.summary.invoice_count} invoices */}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                    {formatCurrency(statement.summary.total_payments)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {/* {statement.summary.payment_count} payments */}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                    {formatCurrency(statement.summary.outstanding_balance)}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {statement.summary.unpaid_invoice_count} unpaid, {statement.summary.partial_invoice_count} partial
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Current Balance</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                    {formatCurrency(statement.current_balance)}
                  </p>
                </div>
              </div>
            </SimpleComponentCard>

            {/* Invoices Table */}
            <SimpleComponentCard title={`Purchase Invoices (${statement.invoices.length})`}>
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
                        Paid Amount
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
                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      statement.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(invoice.invoice_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {invoice.due_date ? formatDateTime(invoice.due_date) : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total_amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                            {formatCurrency(invoice.paid_amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(invoice.outstanding_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                invoice.payment_status === 'PAID'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : invoice.payment_status === 'PARTIAL'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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

            {/* Payments Table */}
            <SimpleComponentCard title={`Payments History (${statement.payments.length})`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Payment #
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
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {statement.payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                          No payments found
                        </td>
                      </tr>
                    ) : (
                      statement.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {payment.payment_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(payment.payment_date)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {payment.account_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {payment.invoice_number || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {payment.notes || "—"}
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

        {/* Empty State */}
        {selectedSupplierId === 0 && (
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
              Select a Supplier
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Choose a supplier from the dropdown above to view their complete account statement including invoices and payments.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SupplierStatementPage;
