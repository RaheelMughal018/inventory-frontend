import { useState } from "react"; // Add this import
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SupplierTable from "../../components/tables/BasicTables/SuppliersTable";
import AddSupplierModal from "../../components/modals/SupplierModal"; // Import modal
import { useGetAllSuppliersQuery , useCreateSupplierMutation, useUpdateSupplierMutation, CreateSupplier, Supplier} from "../../redux/services/supplier";
import {SupplierFormData} from '../../components/modals/SupplierModal'
import { toast } from "sonner";
const SupplierPage = () => {
  const { data, isLoading } = useGetAllSuppliersQuery();
  const [createSupplier] = useCreateSupplierMutation()
  const [updateSupplier] = useUpdateSupplierMutation()
  // Add state to control modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting suppliers to CSV");
    // Add your export logic here
  };

  // Handle form submission for adding
  const handleAddSupplier = async (supplierData: SupplierFormData) => {
   try {
    
    const payload: CreateSupplier = {
      name: supplierData.name,
      phone: supplierData.phone,
      city: supplierData.city,
      company_name: supplierData.company_name ?? ""
    }
    const res = await createSupplier(payload).unwrap();
    if(res){
      toast.success(`${res.name} is created successfully`)
    }
   } catch (error) {
   console.log(error) 
   toast.error("Error while creating supplier")
   } 

    // Close modal after submission
    setIsAddModalOpen(false);
  };

  // Handle form submission for editing
  const handleEditSupplier = async (supplierData: SupplierFormData) => {
    if (!selectedSupplier) return;

    try {
      const payload: CreateSupplier = {
        name: supplierData.name,
        phone: supplierData.phone,
        city: supplierData.city,
        company_name: supplierData.company_name ?? ""
      }
      const res = await updateSupplier({ id: selectedSupplier.id, ...payload }).unwrap();
      if(res){
        toast.success(`${res.name} is updated successfully`)
      }
    } catch (error) {
      console.log(error) 
      toast.error("Error while updating supplier")
    } 

    // Close modal after submission
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
  };

  // Handle edit button click
  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
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
            onEdit={handleEditClick}
          />
        </ComponentCard>
      </div>

      {/* Modal - Opens when "Add New Supplier" button is clicked */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSupplier}
        mode="add"
      />

      {/* Modal - Opens when edit button is clicked */}
      <AddSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleEditSupplier}
        initialData={selectedSupplier}
        mode="edit"
      />
    </>
  );
};

export default SupplierPage;
