import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomerTable from "../../components/tables/BasicTables/CustomersTable";
import AddCustomerModal from "../../components/modals/CustomerModal"; // Import modal
import {
  CreateCustomer,
  Customer,
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
  useUpdateCustomerMutation,
} from "../../redux/services/customer";
import { CustomerFormData } from "../../components/modals/CustomerModal";
import { toast } from "sonner";

const CustomerPage = () => {
  const { data, isLoading } = useGetAllCustomersQuery();
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  // Add state for modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting customers to CSV");
    // Your export logic here
  };

  // Handle form submission
  const handleAddCustomer = async (customerData: CustomerFormData) => {
    try {
      const payload: CreateCustomer = {
        name: customerData.name,
        phone: customerData.phone,
        city: customerData.city,
        company_name: customerData.company_name ?? "",
      };

      const res = await createCustomer(payload).unwrap();
      if (res) toast.success(`${res.name} is created successfully`);
    } catch (error) {
      console.log("🚀 ~ handleAddCustomer ~ error:", error);
      toast.error("Error while creating customer");
    }

    // Close modal after submission
    setIsAddModalOpen(false);
  };

  const handleEditCustomer = async (customerData: CustomerFormData) => {
    if (!selectedCustomer) return;

    try {
      const payload: CreateCustomer = {
        name: customerData.name,
        phone: customerData.phone,
        city: customerData.city,
        company_name: customerData.company_name ?? "",
      };

      const res = await updateCustomer({
        id: selectedCustomer.id,
        ...payload,
      }).unwrap();
      if (res) toast.success(`${res.name} is updated successfully`);
    } catch (error) {
      console.log("🚀 ~ handleEditCustomer ~ error:", error);
      toast.error("Error while updating customer");
    }

    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Customer"
        description="Customer page where you can check your list of customers"
      />

      <PageBreadcrumb pageTitle="Customer's" />
      <div className="space-y-6">
        <ComponentCard
          title="Customer Table"
          exportButtonText="Export Customers CSV"
          addButtonText="Add New Customer"
          onExportClick={handleExportCSV} // Connect export handler
          onAddClick={() => setIsAddModalOpen(true)} // Open modal on click!
        >
          <CustomerTable
            customers={data?.customers ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
          />
        </ComponentCard>
      </div>

      {/* Modal - Opens when "Add New Customer" button is clicked */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCustomer}
        mode="add"
      />

      {/* Modal - Opens when edit button is clicked */}
      <AddCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleEditCustomer}
        initialData={selectedCustomer}
        mode="edit"
      />
    </>
  );
};

export default CustomerPage;
