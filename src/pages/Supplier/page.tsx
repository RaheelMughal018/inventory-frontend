import ComponentCard from "../../components/common/ComponentCard"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import SupplierTable from "../../components/tables/BasicTables/SuppliersTable"
import { useGetAllSuppliersQuery } from "../../redux/services/supplier"



const SupplierPage = () => {
  const {data, isLoading} = useGetAllSuppliersQuery();



  
  return (
   <>
   <PageMeta 
   title="Supplier"
   description="Supplier page where you can check your list of suppliers"/>

     <PageBreadcrumb pageTitle="Supplier's" />
      <div className="space-y-6">
        <ComponentCard title="Supplier Table">
          <SupplierTable suppliers={data?.suppliers ?? []} loading={isLoading}/>
        </ComponentCard>
      </div>
   </>

  )
}

export default SupplierPage