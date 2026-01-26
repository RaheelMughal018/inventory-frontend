// components/modals/AddSupplierModal.tsx
import React, { useState } from "react";
import { Modal } from "../../components/ui/modal"; // Your existing modal
import Input from "../form/input/InputField"; // Your Input component
import Label from "../form/Label"; // Your Label component
import Radio from "../form/input/Radio"; // Your Radio component

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
}

interface SupplierFormData {
  type: "individual" | "organization";
  name: string;
  phone: string;
  city: string;
  organization_name?: string;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    type: "individual",
    name: "",
    phone: "",
    city: "",
    organization_name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof SupplierFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Add New Supplier
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter supplier details
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
                value="organization"
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
                  value={formData.organization_name || ""}
                  onChange={(e) =>
                    handleChange("organization_name", e.target.value)
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
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              placeholder="Enter city name"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
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
              Add Supplier
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddSupplierModal;
