// components/modals/AddCustomerModal.tsx
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Radio from "../form/input/Radio";
import { Customer } from "../../redux/services/customer";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Customer | null;
  mode?: "add" | "edit";
}

export interface CustomerFormData {
  type: "individual" | "organization";
  name: string;
  phone: string;
  city: string;
  company_name?: string;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    type: "individual",
    name: "",
    phone: "",
    city: "",
    company_name: "",
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      const customerType = initialData.company_name
        ? "organization"
        : "individual";

      setFormData({
        type: customerType,
        name: initialData.name || "",
        phone: initialData.phone || "",
        city: initialData.city || "",
        company_name: initialData.company_name || "",
      });
      return;
    }

    setFormData({
      type: "individual",
      name: "",
      phone: "",
      city: "",
      company_name: "",
    });
  }, [isOpen, initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Phone number is required!");
      return;
    }
    if (!formData.city.trim()) {
      alert("City is required!");
      return;
    }
    if (
      formData.type === "organization" &&
      !formData.company_name?.trim()
    ) {
      alert("Organization name is required!");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6 sm:p-8">
        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {mode === "edit" ? "Edit Customer" : "Add New Customer"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "edit" ? "Update customer details" : "Enter customer details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div>
            <Label className="mb-3">
              Customer Type <span className="text-red-500">*</span>
            </Label>
            <div className="flex space-x-6">
              <Radio
                id="customer-type-individual"
                name="type"
                value="individual"
                checked={formData.type === "individual"}
                label="Individual"
                onChange={(value) => handleChange("type", value)}
              />

              <Radio
                id="customer-type-organization"
                name="type"
                value="organization"
                checked={formData.type === "organization"}
                label="Organization"
                onChange={(value) => handleChange("type", value)}
              />
            </div>
          </div>

          {/* Name Fields */}
          {formData.type === "individual" ? (
            <div>
              <Label htmlFor="customer-name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="customer-organization-name">
                  Organization Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer-organization-name"
                  type="text"
                  placeholder="ABC Corporation"
                  value={formData.company_name || ""}
                  onChange={(e) =>
                    handleChange("company_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="customer-contact-name">
                  Contact Person Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer-contact-name"
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
            <Label htmlFor="customer-phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="customer-city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-city"
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
              {mode === "edit" ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddCustomerModal;
