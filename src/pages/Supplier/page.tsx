import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SupplierTable from "../../components/tables/BasicTables/SuppliersTable";
import AddSupplierModal from "../../components/modals/SupplierModal";
import { useGetAllSuppliersQuery , useCreateSupplierMutation, useUpdateSupplierMutation, CreateSupplier, Supplier} from "../../redux/services/supplier";
import {SupplierFormData} from '../../components/modals/SupplierModal'
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import { handleApiError, handleApiSuccess } from "../../helper/error_handler";

const SupplierPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const { data, isLoading, error } = useGetAllSuppliersQuery({
    page,
    limit,
    search: search || undefined,
  });
  
  // Debug logging
  console.log('Supplier Data:', data);
  console.log('Is Loading:', isLoading);
  console.log('Error:', error);
  console.log('Suppliers Array:', data?.data);
  
  const [createSupplier] = useCreateSupplierMutation()
  const [updateSupplier] = useUpdateSupplierMutation()
  
  // Add state to control modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  

  const handleSearch = () => {
    setPage(1);
  };

  // Handle form submission for adding
  const handleAddSupplier = async (supplierData: SupplierFormData) => {
    try {
      const payload: CreateSupplier = {
        name: supplierData.name,
        phone: supplierData.phone,
        address: supplierData.address,
        company_name: supplierData.company_name,
        opening_balance: supplierData.opening_balance || 0,
      }
      const res = await createSupplier(payload).unwrap();
      if(res?.data) handleApiSuccess(`${res.data.name} created successfully`);
      setIsAddModalOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to create supplier");
    }
  };

  // Handle form submission for editing
  const handleEditSupplier = async (supplierData: SupplierFormData) => {
    if (!selectedSupplier) return;

    try {
      const payload: CreateSupplier = {
        name: supplierData.name,
        phone: supplierData.phone,
        address: supplierData.address,
        company_name: supplierData.company_name,
        opening_balance: supplierData.opening_balance || 0,
      }
      const res = await updateSupplier({ id: selectedSupplier.id, ...payload }).unwrap();
      if(res?.data) handleApiSuccess(`${res.data.name} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      handleApiError(error, "Failed to update supplier");
    }
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
          addButtonText="Add New Supplier"
          onAddClick={() => setIsAddModalOpen(true)} // Open modal on click!
          extra={
            <SearchBar
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
              placeholder="Search suppliers..."
            />
          }
        >
          <SupplierTable
            suppliers={data?.data ?? []}
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
