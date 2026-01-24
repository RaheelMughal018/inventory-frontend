import ComponentCard from "../../components/common/ComponentCard"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import CustomerTable from "../../components/tables/BasicTables/CustomersTable"
import { useGetAllCustomersQuery } from "../../redux/services/customer"



const CustomerPage = () => {
  const {data, isLoading} = useGetAllCustomersQuery();



  
  return (
   <>
   <PageMeta 
   title="Customer"
   description="Customer page where you can check your list of customers"/>

     <PageBreadcrumb pageTitle="Customer's" />
      <div className="space-y-6">
        <ComponentCard title="Customer Table">
          <CustomerTable customers={data?.customers ?? []} loading={isLoading}/>
        </ComponentCard>
      </div>
   </>

  )
}

export default CustomerPage