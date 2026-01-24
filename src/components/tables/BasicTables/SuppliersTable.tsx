import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {Supplier} from "../../../redux/services/supplier"
import {EyeIcon, CloseIcon, EyeCloseIcon, PencilIcon} from "../../../icons"
import {TailSpin} from 'react-loader-spinner'
interface SupplierTableProps {
  suppliers: Supplier[],
  loading: boolean
}
export default function SupplierTable({suppliers, loading}: SupplierTableProps) {
  return (
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
                Due
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Paid
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Total
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
            !loading && suppliers.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-6 text-gray-500">
                  No Supplier Found
                </TableCell>
              </TableRow>
            )
          }

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
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {supplier.current_balance}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {supplier.total_paid}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {supplier.total_transactions}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <div className="flex items-center">
                    
                  <span className="cursor-pointer">
                    <PencilIcon width={40}/>
                  </span>
                  <span className="cursor-pointer text-red-800">
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
  );
}
