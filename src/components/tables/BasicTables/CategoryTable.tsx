import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {CloseIcon, PencilIcon} from "../../../icons"
import {TailSpin} from 'react-loader-spinner'
import { useModal } from "../../../hooks/useModal";
import { useState } from "react";
import { Modal } from "../../ui/modal";
import { Category, useDeleteCategoryMutation } from "../../../redux/services/category";
import formatDateTime from "../../../helper/date_converter";
import { handleApiError, handleApiSuccess } from "../../../helper/error_handler";
interface CategoryTableProps {
  categories: Category[],
  loading: boolean
  onEdit?: (category: Category) => void;
}
export default function CategoryTable({categories, loading, onEdit}: CategoryTableProps) {
  const {isOpen, closeModal, openModal} = useModal();
  const [selectedCategory, setSelectedCategory] = useState<Category|null>(null)
  const [deleteCategory,{isLoading}] = useDeleteCategoryMutation();


  const handleDelete = async ()=>{
    if(!selectedCategory) return

    try {
      const res = await deleteCategory(selectedCategory.id).unwrap()
      if(res?.data?.message) handleApiSuccess(res.data.message);
      closeModal();
      setSelectedCategory(null);
    } catch (error) {
      handleApiError(error, "Failed to delete category");
    }
  }
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
                Created on
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
          {
            loading && (
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
            )
          }

          {
            !loading && categories.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-6 text-gray-500">
                  No customer Found
                </TableCell>
              </TableRow>
            )
          }

<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {cat.id}
                      </span> 
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {cat.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">

                  {formatDateTime(cat.created_at)}
                </TableCell>
                
              
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <div className="flex items-center">
                    
                  <span
                    className="cursor-pointer"
                    onClick={() => onEdit?.(cat)}
                  >
                    <PencilIcon width={40}/>
                  </span>
                  <span className="cursor-pointer text-red-800"
                  onClick={()=>{
                    setSelectedCategory(cat)
                    openModal()
                  }}
                  >
                    <CloseIcon/>
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
      Delete Customer
    </h3>

    <p className="mt-2 text-sm text-gray-500">
      Are you sure you want to delete{" "}
      <span className="font-medium text-gray-800 dark:text-white">
        {selectedCategory?.name}
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
