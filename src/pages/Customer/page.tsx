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
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const CustomerPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading } = useGetAllCustomersQuery({
    page,
    limit,
    search: search || undefined,
  });
  console.log("🚀 ~ CustomerPage ~ data:", data)
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

  const handleSearch = () => {
    setPage(1);
  };

  // Handle form submission
  const handleAddCustomer = async (customerData: CustomerFormData) => {
    try {
      const payload: CreateCustomer = {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        company_name: customerData.company_name,
        opening_balance: customerData.opening_balance || 0,
      };

      const res = await createCustomer(payload).unwrap();
      if (res?.data) handleApiSuccess(`${res.data.name} created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
    }
  };

  const handleEditCustomer = async (customerData: CustomerFormData) => {
    if (!selectedCustomer) return;

    try {
      const payload: CreateCustomer = {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        company_name: customerData.company_name,
        opening_balance: customerData.opening_balance || 0,
      };

      const res = await updateCustomer({
        id: selectedCustomer.id,
        ...payload,
      }).unwrap();
      if (res?.data) handleApiSuccess(`${res.data.name} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      handleApiError(error, "Failed to update customer");
    }
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
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
              placeholder="Search customers..."
            />
          }
        >
          <CustomerTable
            customers={data?.data ?? []}
            loading={isLoading}
            onEdit={handleEditClick}
          />
          <div className="pt-4">
            <Pagination
              currentPage={page}
              pageSize={limit}
              total={data?.meta?.totalItems ?? 0}
              onPageChange={setPage}
            />
          </div>
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
