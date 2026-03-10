import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import {
  useGetRepairInvoiceByIdQuery,
  useUpdateRepairInvoiceStatusMutation,
  RepairStatus,
} from "../redux/services/repairInvoice";
import Button from "../components/ui/button/Button";
import SimpleComponentCard from "../components/common/SimpleCardComponent";
import formatDateTime from "../helper/date_converter";
import {
  handleQueryError,
  handleApiSuccess,
  handleApiError,
} from "../helper/error_handler";
import SelectDropdown from "../components/form/SelectDropdown";
import { DownloadIcon } from "../icons";
import { generateRepairInvoicePDF } from "../helper/pdf_generator";

const ALLOWED_NEXT_STATUS: Record<RepairStatus, RepairStatus | ""> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: "DELIVERED",
  DELIVERED: "",
};

const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

const REPAIR_STATUS_CLASS: Record<RepairStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  DELIVERED: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

const ViewRepairInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [updateStatus, { isLoading: updating }] = useUpdateRepairInvoiceStatusMutation();

  const { data, isLoading, error } = useGetRepairInvoiceByIdQuery(Number(id) || 0, {
    skip: !id,
  });

  const invoice = data?.data;
  const currentStatus = (invoice?.repair_status ?? "PENDING") as RepairStatus;
  const nextStatus = ALLOWED_NEXT_STATUS[currentStatus];
  const statusOptions = nextStatus
    ? [{ id: nextStatus, name: REPAIR_STATUS_LABELS[nextStatus] }]
    : [];

  const [selectedNextStatus, setSelectedNextStatus] = useState<string>("");

  const handleUpdateStatus = async () => {
    if (!id || !selectedNextStatus) return;
    try {
      await updateStatus({
        id: Number(id),
        body: { repair_status: selectedNextStatus as RepairStatus },
      }).unwrap();
      handleApiSuccess("Status updated");
      setSelectedNextStatus("");
    } catch (err) {
      handleApiError(err, "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading repair invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    const errorMessage = handleQueryError(error, "Repair invoice not found or failed to load");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error Loading Repair Invoice
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
          <Button onClick={() => navigate("/repair-invoices")} className="mt-4">
            Back to Repair Invoices
          </Button>
        </div>
      </div>
    );
  }

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <>
      <PageMeta
        title={`Repair Invoice ${invoice.invoice_number}`}
        description="View repair invoice details"
      />
      <PageBreadcrumb pageTitle={`Repair Invoice ${invoice.invoice_number}`} />

      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Received {formatDateTime(invoice.received_date)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/repair-invoices")}
              className="px-6"
            >
              Back
            </Button>
            <Button
              variant="green"
              onClick={() => {
                try {
                  generateRepairInvoicePDF(invoice);
                  handleApiSuccess("PDF generated successfully");
                } catch (error) {
                  handleApiError(error, "Failed to generate PDF");
                }
              }}
              className="px-6"
            >
              PDF <DownloadIcon height={25} width={20} />
            </Button>
          </div>
        </div>

        <SimpleComponentCard title="Customer & Item">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {invoice.customer_name ?? `Customer #${invoice.customer_id}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Serial / Item</p>
              <p className="text-gray-900 dark:text-white mt-1">
                {invoice.serial_number ?? invoice.item_description ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Repair status</p>
              <p className="mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    REPAIR_STATUS_CLASS[invoice.repair_status as RepairStatus] ??
                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {REPAIR_STATUS_LABELS[invoice.repair_status as RepairStatus] ?? invoice.repair_status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">FOC</p>
              <p className="text-gray-900 dark:text-white mt-1">{invoice.is_foc ? "Yes" : "No"}</p>
            </div>
          </div>
        </SimpleComponentCard>

        {nextStatus && (
          <SimpleComponentCard title="Update status">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Allowed next: {REPAIR_STATUS_LABELS[nextStatus]}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <SelectDropdown
                options={statusOptions}
                value={selectedNextStatus}
                onChange={(v) => setSelectedNextStatus(String(v))}
                placeholder="Select new status"
                searchable={false}
                className="w-48"
              />
              <Button
                onClick={handleUpdateStatus}
                disabled={!selectedNextStatus || updating}
                className="px-4"
              >
                {updating ? "Updating..." : "Update status"}
              </Button>
            </div>
          </SimpleComponentCard>
        )}

        <SimpleComponentCard title="Amounts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {!invoice.is_foc && (
              <>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Parts cost</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {formatAmount(invoice.parts_cost ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Service charges</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {formatAmount(invoice.service_charges ?? 0)}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total amount</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {invoice.is_foc ? "FOC" : formatAmount(invoice.total_amount)}
              </p>
            </div>
            {!invoice.is_foc && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Received / Payment</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {formatAmount(invoice.received_amount ?? 0)} — {invoice.payment_status}
                </p>
              </div>
            )}
          </div>
        </SimpleComponentCard>

        <SimpleComponentCard title={`Line items (${invoice.items?.length ?? 0})`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                   Name 
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Unit price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Inventory count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(invoice.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No line items
                    </td>
                  </tr>
                ) : (
                  (invoice.items ?? []).map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {line.item_name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {line.description}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {formatAmount(line.unit_price)}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                        {formatAmount(line.total_price)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {line.inventory_count ? "Yes" : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SimpleComponentCard>

        {(invoice.repair_date || invoice.delivery_date) && (
          <SimpleComponentCard title="Dates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoice.repair_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Repair date</p>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {formatDateTime(invoice.repair_date)}
                  </p>
                </div>
              )}
              {invoice.delivery_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delivery date</p>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {formatDateTime(invoice.delivery_date)}
                  </p>
                </div>
              )}
            </div>
          </SimpleComponentCard>
        )}

        {(invoice.notes || invoice.technician_notes) && (
          <SimpleComponentCard title="Notes">
            <div className="space-y-4">
              {invoice.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-white mt-1">{invoice.notes}</p>
                </div>
              )}
              {invoice.technician_notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Technician notes</p>
                  <p className="text-gray-900 dark:text-white mt-1">{invoice.technician_notes}</p>
                </div>
              )}
            </div>
          </SimpleComponentCard>
        )}
      </div>
    </>
  );
};

export default ViewRepairInvoicePage;
