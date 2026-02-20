// import React, { useEffect } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { Modal } from "../ui/modal";
// import Label from "../form/Label";
// import Input from "../form/input/InputField";
// import SelectDropdown from "../form/SelectDropdown";
// import { useGetSupplierOutstandingQuery } from "../../redux/services/supplierPayment";
// import { handleApiError } from "../../helper/error_handler";

// export interface DirectPaymentFormData {
//   account_id: string;
//   amount: number;
// }

// interface DirectPaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   // onSubmit: (data: DirectPaymentFormData) => void | Promise<void>;
//   // accounts: { id: string; name: string }[];
//   supplierId: number;
// }

// const DirectPaymentModal: React.FC<DirectPaymentModalProps> = ({
//   isOpen,
//   onClose,
//   // onSubmit,
//   // accounts,
//   supplierId,
// }) => {
//   const { data: outstandingData } = useGetSupplierOutstandingQuery(supplierId, {
//     skip: !supplierId,
//   });

//   const maxDebit = outstandingData?.total_debit ?? 0;

//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<DirectPaymentFormData>({
//     defaultValues: {
//       account_id: "",
//       amount: 0,
//     },
//   });

//   useEffect(() => {
//     if (!isOpen) return;

//     reset({
//       account_id: "",
//       amount: outstandingData?.outstanding_balance ?? 0,
//     });
//   }, [isOpen, supplierId, outstandingData?.outstanding_balance, reset]);

//   const onFormSubmit = async (data: DirectPaymentFormData) => {
//     try {
//       // await onSubmit(data);
//     } catch (error: unknown) {
//       handleApiError(error, "Failed to submit payment");
//       throw error;
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
//       <div className="p-6 sm:p-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
//             Payment
//           </h3>
//           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//             Record payment for this supplier
//           </p>
//         </div>

//         <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
//           {/* Account */}
//           <div>
//             <Label>
//               Payment Account <span className="text-red-500">*</span>
//             </Label>
//             <Controller
//               name="account_id"
//               control={control}
//               rules={{
//                 required: "Please select an account",
//               }}
//               render={({ field }) => (
//                 <SelectDropdown
//                   // options={accounts}
//                   value={field.value}
//                   onChange={(value) => field.onChange(String(value))}
//                   placeholder="Select payment account..."
//                   searchable
//                   error={errors.account_id?.message}
//                 />
//               )}
//             />
//           </div>

//           {/* Total Amount */}
//           <div>
//             <Label>Total Amount</Label>
//             <Input value={outstandingData?.total_debit ?? 0} disabled />
//           </div>
//           <div>
//             <Label>Credit Amount</Label>
//             <Input value={outstandingData?.total_credit ?? 0} disabled />
//           </div>
//           <div>
//             <Label>Outstanding Balance</Label>
//             <Input value={outstandingData?.outstanding_balance ?? 0} disabled />
//           </div>

//           {/* Pay Amount */}
//           <div>
//             <Label>
//               Pay Amount <span className="text-red-500">*</span>
//             </Label>
//             <Controller
//               name="amount"
//               control={control}
//               rules={{
//                 required: "Payment amount is required",
//                 min: {
//                   value: 0.01,
//                   message: "Payment amount must be greater than 0",
//                 },
//                 max: {
//                   value: maxDebit,
//                   message: "Payment amount cannot exceed debit amount",
//                 },
//               }}
//               render={({ field }) => (
//                 <Input
//                   type="number"
//                   min={0.01}
//                   step={0.01}
//                   max={maxDebit}
//                   placeholder="0.00"
//                   value={field.value === 0 ? "" : field.value}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     field.onChange(val === "" ? 0 : Number(val));
//                   }}
//                   error={!!errors.amount}
//                 />
//               )}
//             />
//             {errors.amount && (
//               <p className="mt-1 text-xs text-red-500 dark:text-red-400">
//                 {errors.amount.message}
//               </p>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-base-500 shadow-theme-xs hover:bg-base-600"
//             >
//               Cancel
//             </button>
//             <button type="submit" onClick={() => handleSubmit(onFormSubmit)} disabled={isSubmitting}  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
//               {isSubmitting ? "Saving..." : "Save Payment"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </Modal>
//   );
// };

// export default DirectPaymentModal;
