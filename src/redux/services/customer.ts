import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */

export interface CreateCustomer {
  name: string
  company_name: string
  phone: string
  city: string
}

export interface UpdateCustomer extends CreateCustomer {
  id: number
}

/* =========================
   Response Interfaces
========================= */

export interface Customer {
    id: number
    name: string
    company_name: string | null
    phone: string
    city: string
    user_id: string
    created_at: string
    updated_at: string
    created_by_id: number
    total_transactions: string
    total_paid: string
    current_balance: string
  }
  
  export interface CustomersResponse {
    total: number
    customers: Customer[]
  }

/* =========================
   API
========================= */

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCustomer: builder.mutation<Customer, CreateCustomer>({
      query: (data) => ({
        url: '/customers',
        method: 'POST',
        body: data,
      }),
    }),

    getAllCustomers: builder.query<CustomersResponse, void>({
      query: () => ({
        url: '/customers',
        method: 'GET',
      }),
    }),

    getCustomerById: builder.query<Customer, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'GET',
      }),
    }),

    updateCustomer: builder.mutation<Customer, UpdateCustomer>({
      query: ({ id, ...data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
})

export const {
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} = customerApi
