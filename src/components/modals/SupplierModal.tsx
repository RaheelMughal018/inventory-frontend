// components/modals/AddSupplierModal.tsx
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal"; // Your existing modal
import Input from "../form/input/InputField"; // Your Input component
import Label from "../form/Label"; // Your Label component
import Radio from "../form/input/Radio"; // Your Radio component
import { Supplier } from "../../redux/services/supplier";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
  initialData?: Supplier | null;
  mode?: "add" | "edit";
}

export interface SupplierFormData {
  type: "individual" | "organization";
  name: string;
  phone: string;
  address: string;
  company_name?: string;
  opening_balance?: number;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    type: "individual",
    name: "",
    phone: "",
    address: "",
    company_name: "",
    opening_balance: 0,
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        // Determine type based on company_name
        const supplierType = initialData.company_name ? "organization" : "individual";
        setFormData({
          type: supplierType,
          name: initialData.name || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
          company_name: initialData.company_name || "",
          opening_balance: initialData.opening_balance || 0,
        });
      } else {
        // Reset to default for add mode
        setFormData({
          type: "individual",
          name: "",
          phone: "",
          address: "",
          company_name: "",
          opening_balance: 0,
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof SupplierFormData, value: string | number) => {
    if (field === 'opening_balance') {
      setFormData((prev) => ({ 
        ...prev, 
        [field]: typeof value === 'string' ? (value ? parseFloat(value) : 0) : value 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value as string }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Supplier" : "Add New Supplier"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit" ? "Update supplier details" : "Enter supplier details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection - Organization or Individual */}
          <div>
            <Label className="mb-3">Supplier Type *</Label>
            <div className="flex space-x-6">
              <Radio
                id="type-individual"
                name="type"
                value="individual"
                checked={formData.type === "individual"}
                label="Individual"
                onChange={(value) => handleChange("type", value)}
              />

              <Radio
                id="type-organization"
                name="type"
                value="company_name"
                checked={formData.type === "organization"}
                label="Organization"
                onChange={(value) => handleChange("type", value)}
              />
            </div>
          </div>

          {/* Name Fields - Dynamic based on type */}
          {formData.type === "individual" ? (
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="organization_name">Organization Name *</Label>
                <Input
                  id="organization_name"
                  type="text"
                  placeholder="ABC Corporation"
                  value={formData.company_name || ""}
                  onChange={(e) =>
                    handleChange("company_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="contact_name">Contact Person Name *</Label>
                <Input
                  id="contact_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          {/* Opening Balance Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Opening Balance (Optional)
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add any existing balance you owe to this supplier
              </p>
            </div>

            {/* Opening Balance Amount */}
            <div>
              <Label htmlFor="opening_balance">Amount</Label>
              <Input
                id="opening_balance"
                type="number"
                min="0"
                placeholder="0.00"
                value={formData.opening_balance?.toString() || ''}
                onChange={(e) => handleChange("opening_balance", e.target.value)}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {mode === "edit" ? "Update Supplier" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddSupplierModal;
