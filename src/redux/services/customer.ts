import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetCustomersParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCustomer {
  name: string
  company_name?: string
  phone?: string
  address?: string
  opening_balance?: number
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
  company_name?: string
  phone?: string
  address?: string
  opening_balance: number
  current_balance: number
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CustomersResponse {
  data: Customer[]
  meta?: PaginationMeta
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCustomer: builder.mutation<{ data: Customer }, CreateCustomer>({
      query: (data) => ({
        url: '/customers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['customer']
    }),

    getAllCustomers: builder.query<CustomersResponse, GetCustomersParams>({
      query: ({ page = 1, limit = 10, search, sortBy, sortOrder }) => ({
        url: '/customers',
        method: 'GET',
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),
      transformResponse: (response: { data: Customer[] | { data: Customer[]; meta: PaginationMeta } }) => {
        // Handle wrapped response: { statusCode, message, data }
        // Backend returns: { statusCode, message, data: Customer[] | { data: Customer[], meta: {} } }
        
        if (Array.isArray(response.data)) {
          // If data is directly an array
          return {
            data: response.data,
            meta: undefined
          };
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // If data is wrapped in { data, meta }
          return {
            data: response.data.data,
            meta: response.data.meta
          };
        }
        
        // Fallback
        return {
          data: [],
          meta: undefined
        };
      },
      providesTags: ['customer']
    }),

    getCustomerById: builder.query<{ data: Customer }, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'GET',
      }),
      providesTags: ['customer']
    }),

    updateCustomer: builder.mutation<{ data: Customer }, UpdateCustomer>({
      query: ({ id, ...data }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['customer']
    }),

    deleteCustomer: builder.mutation<{ data: DeleteResponse }, string | number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['customer']
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
