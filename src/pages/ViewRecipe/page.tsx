// import { useEffect, useState } from "react";
// import { useNavigate, useParams, useSearchParams } from "react-router";
// import PageMeta from "../../components/common/PageMeta";
// import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import SimpleComponentCard from "../../components/common/SimpleCardComponent";
// import Button from "../../components/ui/button/Button";
// import Input from "../../components/form/input/InputField";
// import Label from "../../components/form/Label";
// import SelectDropdown from "../../components/form/SelectDropdown";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/table";
// import {
//   useGetRecipeByIdQuery,
//   useUpdateRecipeMutation,
//   RecipeItemCreate,
// } from "../../redux/services/recipe";
// import { useGetAllItemsQuery } from "../../redux/services/item";
// import { ItemType } from "../../redux/services/item";
// import { TailSpin } from "react-loader-spinner";
// import { PencilIcon } from "../../icons";
// import { handleApiError, handleQueryError } from "../../helper/error_handler";
// import { toast } from "sonner";

// const ViewRecipePage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const [searchParams] = useSearchParams();
//   const startInEditMode = searchParams.get("mode") === "edit";

//   const { data: recipe, isLoading, error, refetch } = useGetRecipeByIdQuery(
//     id || "",
//     { skip: !id }
//   );
//   const { data: itemsData } = useGetAllItemsQuery({});
//   const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

//   const [isEditing, setIsEditing] = useState(false);
//   const [name, setName] = useState("");
//   const [items, setItems] = useState<
//     { raw_item_id: string; quantity_per_unit: number }[]
//   >([]);

//   const rawItems = (itemsData?.items ?? []).filter(
//     (i) => i.type === ItemType.RAW_MATERIAL
//   );
//   const rawItemOptions = rawItems.map((r) => ({
//     id: r.id,
//     name: `${r.name} (stock: ${r.total_quantity})`,
//   }));

//   useEffect(() => {
//     if (recipe) {
//       setName(recipe.name || "");
//       setItems(
//         recipe.items.map((i) => ({
//           raw_item_id: i.raw_item_id,
//           quantity_per_unit: Number(i.quantity_per_unit),
//         }))
//       );
//     }
//   }, [recipe]);

//   useEffect(() => {
//     if (startInEditMode && recipe) {
//       setIsEditing(true);
//     }
//   }, [startInEditMode, recipe]);

//   const handleBack = () => navigate("/recipes");
//   const handleStartEdit = () => setIsEditing(true);
//   const handleCancelEdit = () => setIsEditing(false);

//   const addRow = () => {
//     setItems((prev) => [...prev, { raw_item_id: "", quantity_per_unit: 0 }]);
//   };

//   const removeRow = (index: number) => {
//     if (items.length <= 1) return;
//     setItems((prev) => prev.filter((_, i) => i !== index));
//   };

//   const updateRow = (
//     index: number,
//     field: "raw_item_id" | "quantity_per_unit",
//     value: string | number
//   ) => {
//     setItems((prev) => {
//       const next = [...prev];
//       next[index] = { ...next[index], [field]: value };
//       return next;
//     });
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!id) return;

//     const validItems = items.filter(
//       (row) => row.raw_item_id && row.quantity_per_unit > 0
//     );
//     if (validItems.length === 0) {
//       handleApiError("Add at least one ingredient with a positive quantity.");
//       return;
//     }

//     try {
//       await updateRecipe({
//         recipeId: id,
//         data: {
//           name: name.trim() || undefined,
//           items: validItems as RecipeItemCreate[],
//         },
//       }).unwrap();
//       toast.success("Recipe updated successfully");
//       setIsEditing(false);
//       refetch();
//     } catch (err: unknown) {
//       const msg = (err as { data?: { detail?: string } })?.data?.detail;
//       toast.error(msg || "Failed to update recipe");
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <TailSpin height={40} width={40} color="#3b82f6" />
//       </div>
//     );
//   }

//   if (error || !recipe) {
//     const errorMessage = handleQueryError(error, "Recipe not found");
//     return (
//       <div className="space-y-6">
//         <PageBreadcrumb pageTitle="Recipe" />
//         <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8 text-center">
//           <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
//             Error Loading Recipe
//           </h2>
//           <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
//           <Button onClick={handleBack} className="mt-4">
//             Back to Recipes
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <PageMeta
//         title={`Recipe: ${recipe.final_product_name}`}
//         description="View recipe details"
//       />
//       <PageBreadcrumb pageTitle={`Recipe: ${recipe.final_product_name}`} />

//       <div className="space-y-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {recipe.final_product_name}
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               {isEditing ? "Edit ingredients and quantities" : recipe.name || "Recipe details"}
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button variant="outline" onClick={handleBack}>
//               Back to Recipes
//             </Button>
//             {!isEditing ? (
//               <Button
//                 type="button"
//                 onClick={handleStartEdit}
//                 startIcon={<PencilIcon className="size-4" />}
//               >
//                 Edit Recipe
//               </Button>
//             ) : (
//               <>
//                 <Button type="button" variant="outline" onClick={handleCancelEdit}>
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   form="recipe-edit-form"
//                   disabled={isUpdating}
//                 >
//                   {isUpdating ? "Saving..." : "Save Changes"}
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>

//         {!isEditing ? (
//           <>
//             <SimpleComponentCard title="Recipe Information">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Final Product
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white font-medium">
//                     {recipe.final_product_name}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Recipe Name
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white">
//                     {recipe.name || "—"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Cost per Unit
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white font-medium">
//                     {recipe.total_cost_per_unit != null
//                       ? `$${Number(recipe.total_cost_per_unit).toFixed(2)}`
//                       : "—"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Ingredients Count
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white">
//                     {recipe.items.length} items
//                   </p>
//                 </div>
//               </div>
//             </SimpleComponentCard>

//             <SimpleComponentCard
//               title="Ingredients (raw items & quantity per 1 unit)"
//               desc="Raw materials and quantities required for one unit of the final product"
//             >
//               <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
//                 <Table>
//                   <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
//                     <TableRow>
//                       <TableCell
//                         isHeader
//                         className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
//                       >
//                         Raw Item
//                       </TableCell>
//                       <TableCell
//                         isHeader
//                         className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
//                       >
//                         Qty/Unit
//                       </TableCell>
//                       <TableCell
//                         isHeader
//                         className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
//                       >
//                         Avg Price
//                       </TableCell>
//                       <TableCell
//                         isHeader
//                         className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
//                       >
//                         Amount/Unit
//                       </TableCell>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {recipe.items.map((item) => (
//                       <TableRow
//                         key={item.id}
//                         className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]"
//                       >
//                         <TableCell className="px-5 py-3 text-gray-800 dark:text-white/90">
//                           {item.raw_item_name}
//                         </TableCell>
//                           <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
//                           {Math.floor(Number(item.quantity_per_unit))}
//                         </TableCell>
//                         <TableCell className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">
//                           {item.avg_price != null
//                             ? `${Number(item.avg_price).toFixed(2)} Rs`
//                             : "—"}
//                         </TableCell>
//                         <TableCell className="px-5 py-3 text-center text-gray-800 dark:text-white/90">
//                           ${Number(item.amount_per_unit).toFixed(2)}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </SimpleComponentCard>
//           </>
//         ) : (
//           <form id="recipe-edit-form" onSubmit={handleSave} className="space-y-6">
//             <SimpleComponentCard title="Recipe Information">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Final Product
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white font-medium">
//                     {recipe.final_product_name}
//                   </p>
//                 </div>
//                 <div>
//                   <Label>Recipe name (optional)</Label>
//                   <Input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="e.g. Noodle Recipe"
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Cost per Unit
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white font-medium">
//                     {recipe.total_cost_per_unit != null
//                       ? `$${Number(recipe.total_cost_per_unit).toFixed(2)}`
//                       : "—"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Ingredients Count
//                   </p>
//                   <p className="mt-1 text-gray-800 dark:text-white">
//                     {items.filter((r) => r.raw_item_id && r.quantity_per_unit > 0).length} items
//                   </p>
//                 </div>
//               </div>
//             </SimpleComponentCard>

//             <SimpleComponentCard
//               title="Ingredients (raw items & quantity per 1 unit)"
//               desc="Raw materials and quantities required for one unit of the final product"
//               extra={
//                 <button
//                   type="button"
//                   onClick={addRow}
//                   className="text-sm text-brand-500 hover:underline"
//                 >
//                   + Add row
//                 </button>
//               }
//             >
//               <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] min-h-[12rem]">
//                 <div className="space-y-2 p-4 max-h-[min(24rem,60vh)] overflow-y-auto">
//                   {items.map((row, index) => (
//                     <div key={index} className="flex gap-2 items-center">
//                       <div className="flex-1 min-w-0">
//                         <SelectDropdown
//                           options={rawItemOptions}
//                           value={row.raw_item_id}
//                           onChange={(value) =>
//                             updateRow(index, "raw_item_id", String(value))
//                           }
//                           placeholder="Select raw item..."
//                           searchable
//                           className="w-full"
//                         />
//                       </div>
//                       <input
//                         type="number"
//                         min={0.01}
//                         step={0.01}
//                         value={row.quantity_per_unit || ""}
//                         onChange={(e) =>
//                           updateRow(
//                             index,
//                             "quantity_per_unit",
//                             parseFloat(e.target.value) || 0
//                           )
//                         }
//                         placeholder="Qty"
//                         className="w-24 h-11 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 bg-transparent"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeRow(index)}
//                         disabled={items.length <= 1}
//                         className="p-2 h-11 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-40"
//                         title="Remove row"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </SimpleComponentCard>
//           </form>
//         )}
//       </div>
//     </>
//   );
// };

// export default ViewRecipePage;
