import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SupplierTable from "../../components/tables/BasicTables/SuppliersTable";
import AddSupplierModal from "../../components/modals/AddSupplierModal"; // Import modal
import { useGetAllSuppliersQuery } from "../../redux/services/supplier";

const SupplierPage = () => {
  const { data, isLoading } = useGetAllSuppliersQuery();

  // Add state to control modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting suppliers to CSV");
    // Add your export logic here
  };

  // Handle form submission
  const handleAddSupplier = (supplierData: any) => {
    console.log("Adding supplier:", supplierData);
    // TODO: Call your API here to add supplier
    // Example: await addSupplierApi(supplierData);

    // Close modal after submission
    setIsAddModalOpen(false);

    // Optionally refresh the supplier list
    // refetch();
  };

  return (
    <>
      <PageMeta
        title="Supplier"
        description="Supplier page where you can check your list of suppliers"
      />

      <PageBreadcrumb pageTitle="Supplier's" />

      <div className="space-y-6">
        <ComponentCard
          title="Supplier Table"
          exportButtonText="Export Suppliers CSV"
          addButtonText="Add New Supplier"
          onExportClick={handleExportCSV} // Connect export handler
          onAddClick={() => setIsAddModalOpen(true)} // Open modal on click!
        >
          <SupplierTable
            suppliers={data?.suppliers ?? []}
            loading={isLoading}
          />
        </ComponentCard>
      </div>

      {/* Modal - Opens when "Add New Supplier" button is clicked */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSupplier}
      />
    </>
  );
};

export default SupplierPage;
