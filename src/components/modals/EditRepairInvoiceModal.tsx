import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import SelectDropdown from "../form/SelectDropdown";
import Button from "../ui/button/Button";
import {
  RepairInvoice,
  UpdateRepairInvoiceDto,
} from "../../redux/services/repairInvoice";
import { useGetAllCustomersQuery } from "../../redux/services/customer";

interface EditRepairInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateRepairInvoiceDto) => void;
  invoice: RepairInvoice | null;
  isLoading?: boolean;
}

const EditRepairInvoiceModal: React.FC<EditRepairInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  isLoading = false,
}) => {
  const [customerId, setCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [receivedDate, setReceivedDate] = useState<string>("");
  const [serviceCharges, setServiceCharges] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [technicianNotes, setTechnicianNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { data: customersData } = useGetAllCustomersQuery(
    { search: customerSearch || undefined, limit: 30 },
    { skip: !isOpen },
  );

  useEffect(() => {
    if (!invoice || !isOpen) return;
    setCustomerId(String(invoice.customer_id));
    setSerialNumber(invoice.serial_number ?? "");
    setItemDescription(invoice.item_description ?? "");
    setReceivedDate(invoice.received_date ? invoice.received_date.slice(0, 10) : "");
    setServiceCharges(Number(invoice.service_charges ?? 0));
    setNotes(invoice.notes ?? "");
    setTechnicianNotes(invoice.technician_notes ?? "");
    setError("");
  }, [invoice, isOpen]);

  const customerOptions = (() => {
    const seen = new Map<string, { id: string; name: string }>();
    (customersData?.data ?? []).forEach((c) => {
      seen.set(String(c.id), { id: String(c.id), name: c.name });
    });
    if (invoice && !seen.has(String(invoice.customer_id))) {
      seen.set(String(invoice.customer_id), {
        id: String(invoice.customer_id),
        name: invoice.customer_name ?? `Customer #${invoice.customer_id}`,
      });
    }
    return Array.from(seen.values());
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setError("");

    if (!customerId) {
      setError("Customer is required");
      return;
    }
    if (serviceCharges < 0) {
      setError("Service charges cannot be negative");
      return;
    }

    const payload: UpdateRepairInvoiceDto = {};
    if (Number(customerId) !== invoice.customer_id) {
      payload.customer_id = Number(customerId);
    }
    const trimmedSerial = serialNumber.trim();
    if (trimmedSerial !== (invoice.serial_number ?? "")) {
      payload.serial_number = trimmedSerial || null;
    }
    const trimmedDesc = itemDescription.trim();
    if (trimmedDesc !== (invoice.item_description ?? "")) {
      payload.item_description = trimmedDesc || null;
    }
    if (receivedDate && receivedDate !== invoice.received_date.slice(0, 10)) {
      payload.received_date = receivedDate;
    }
    if (Number(serviceCharges) !== Number(invoice.service_charges ?? 0)) {
      payload.service_charges = Number(serviceCharges);
    }
    if (notes !== (invoice.notes ?? "")) {
      payload.notes = notes;
    }
    if (technicianNotes !== (invoice.technician_notes ?? "")) {
      payload.technician_notes = technicianNotes;
    }

    if (Object.keys(payload).length === 0) {
      setError("No changes to save");
      return;
    }
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Edit Repair Invoice {invoice?.invoice_number}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Editable as long as no receipts are attached. Items[], FOC, and payment data
            are not editable here — cancel and recreate if those changed.
          </p>
        </div>

        <div>
          <Label>Customer *</Label>
          <SelectDropdown
            options={customerOptions}
            value={customerId}
            onChange={(value) => setCustomerId(String(value))}
            placeholder="Select customer"
            searchable
            onSearchChange={setCustomerSearch}
            optionsAreFiltered
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Serial Number</Label>
            <Input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Optional (FINAL by serial)"
            />
          </div>
          <div>
            <Label>Item Description</Label>
            <Input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="External item description"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Received Date</Label>
            <Input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Service Charges</Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={serviceCharges}
              onChange={(e) => setServiceCharges(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Customer-facing notes"
          />
        </div>

        <div>
          <Label>Technician Notes</Label>
          <Input
            type="text"
            value={technicianNotes}
            onChange={(e) => setTechnicianNotes(e.target.value)}
            placeholder="Internal technician notes"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditRepairInvoiceModal;
