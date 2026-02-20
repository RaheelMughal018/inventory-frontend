import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TailSpin } from "react-loader-spinner";
import { Expense } from "../../../redux/services/expense";

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  totalAmount?: string | number;
}

export default function ExpenseTable({
  expenses,
  loading,
  totalAmount,
}: ExpenseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
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
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Description
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Account
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Created by
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Notes
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>
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

            {!loading && expenses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  No expenses found
                </TableCell>
              </TableRow>
            )}

            {expenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {exp.id}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {typeof exp.expense_date === "string"
                    ? exp.expense_date.slice(0, 10)
                    : exp.expense_date}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 max-w-xs truncate">
                  {exp.description ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 font-medium">
                 {Number(exp.amount).toFixed(2)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {exp.category?.name ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {exp.account?.name ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {exp.admin?.name ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-xs truncate">
                  {exp.notes ?? "—"}
                </TableCell>
              </TableRow>
            ))}

            {!loading && expenses.length > 0 && totalAmount != null && (
              <TableRow className="border-t-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] font-semibold">
                <TableCell
                  className="px-5 py-3 text-start"
                  colSpan={3}
                >
                  <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                    Total
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                  {Number(totalAmount).toFixed(2)}
                </TableCell>
                <TableCell colSpan={4} className="px-4 py-3">
                  {" "}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
