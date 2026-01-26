import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomerTable from "../../components/tables/BasicTables/CustomersTable";
import AddCustomerModal from "../../components/modals/AddCustomerModal"; // Import modal
import { useGetAllCustomersQuery } from "../../redux/services/customer";

const CustomerPage = () => {
  const { data, isLoading } = useGetAllCustomersQuery();

  // Add state for modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting customers to CSV");
    // Your export logic here
  };

  // Handle form submission
  const handleAddCustomer = (customerData: any) => {
    console.log("Adding customer:", customerData);
    // TODO: Call your API here to add customer
    // Example: await addCustomerApi(customerData);

    // Close modal after submission
    setIsAddModalOpen(false);

    // Optionally refresh the customer list
    // refetch();
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
          />
        </ComponentCard>
      </div>

      {/* Modal - Opens when "Add New Customer" button is clicked */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </>
  );
};

export default CustomerPage;
