import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Supplier,
  useDeleteSupplierMutation,
} from "../../../redux/services/supplier";
import { CloseIcon, PencilIcon } from "../../../icons";
import { TailSpin } from "react-loader-spinner";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import {  useState } from "react";
import { toast } from "sonner";
import { SupplierPurchaseSummary } from "../../../redux/services/purchaseInvoice";


interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit?: (supplier: Supplier) => void;
  summaries?: Record<number, SupplierPurchaseSummary>; 

}
export default function SupplierTable({
  suppliers,
  loading,
  onEdit,
  summaries
}: SupplierTableProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
 
  const [deleteSupplier, { isLoading }] = useDeleteSupplierMutation();

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      const res = await deleteSupplier(selectedSupplier.id).unwrap();
      if (res.message) {
        toast.success(res.message);
        closeModal();
      }

      setSelectedSupplier(null);
    } catch (error) {
      closeModal();
      console.log("🚀 ~ handleDelete ~ error:", error);
      toast.error("Error while deleteing this supplier");
    }
  };
 

  


  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Id
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Company Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  City
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Due Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Paid Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Purchases
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            {loading && (
              <TableRow>
                <TableCell>
                  <div className="flex justify-center items-center py-10">
                    <TailSpin
                      height={40}
                      width={40}
                      color="#667085"
                      ariaLabel="loading"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && suppliers.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-6 text-gray-500">
                  No Supplier Found
                </TableCell>
              </TableRow>
            )}

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {supplier.user_id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {supplier.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {supplier.company_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {supplier.city}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {supplier.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <span
                      className={`font-medium ${summaries?.[supplier.id]?.outstanding_balance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    > 
                       {summaries?.[supplier.id]?.outstanding_balance ?? "-"} 
                      </span>
                    </TableCell> 
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {summaries?.[supplier.id]?.total_paid ?? "-"}
                      </span>
                    </TableCell> 
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {summaries?.[supplier.id]?.total_purchases ?? "-"}
                      </span>
                    </TableCell> 
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex items-center">
                      <span 
                        className="cursor-pointer"
                        onClick={() => onEdit?.(supplier)}
                      >
                        <PencilIcon width={40} />
                      </span>
                      <span className="cursor-pointer text-red-800"
                      onClick={()=>{
                    setSelectedSupplier(supplier)
                    openModal()
                  }}
                      >
                        <CloseIcon />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete Supplier
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              {selectedSupplier?.name}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              disabled={isLoading}
              onClick={() => handleDelete()}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
