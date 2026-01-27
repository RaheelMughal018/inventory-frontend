import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetCustomersParams {
  search?: string
  skip?: number
  limit?: number
}

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

  export interface DeleteResponse {
    message: string
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
      invalidatesTags:['customer']
    }),

    getAllCustomers: builder.query<CustomersResponse, GetCustomersParams>({
      query: (params) => ({
        url: '/customers',
        method: 'GET',
        params,
      }),
      providesTags:['customer']
    }),

    getCustomerById: builder.query<Customer, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'GET',
      }),
      providesTags:['customer']
    }),

    updateCustomer: builder.mutation<Customer, UpdateCustomer>({
      query: ({ id, ...data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags:['customer']
    }),

    deleteCustomer: builder.mutation<DeleteResponse, string|number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags:['customer']
    }),
  }),
})

export const {
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi
