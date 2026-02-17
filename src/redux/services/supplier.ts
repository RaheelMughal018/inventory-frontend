import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetSuppliersParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateSupplier {
  name: string
  company_name?: string
  phone?: string
  address?: string
  opening_balance?: number
}

export interface UpdateSupplier extends CreateSupplier {
  id: number
}

/* =========================
   Response Interfaces
========================= */

export interface Supplier {
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

export interface SuppliersResponse {
  data: Supplier[]
  meta?: PaginationMeta
}

export interface DeleteSupplierResponse {
  message: string
}

/* =========================
   API
========================= */

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSupplier: builder.mutation<{ data: Supplier }, CreateSupplier>({
      query: (data) => ({
        url: '/suppliers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['supplier']
    }),

    getAllSuppliers: builder.query<SuppliersResponse, GetSuppliersParams>({
      query: ({ page = 1, limit = 10, search, sortBy, sortOrder }) => ({
        url: '/suppliers',
        method: 'GET',
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),
      transformResponse: (response: { data: Supplier[] | { data: Supplier[]; meta: PaginationMeta } }) => {
        // Handle wrapped response: { statusCode, message, data }
        // Backend returns: { statusCode, message, data: Supplier[] | { data: Supplier[], meta: {} } }
        
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
      providesTags: ['supplier']
    }),

    getSupplierById: builder.query<{ data: Supplier }, number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'GET',
      }),
      providesTags: ['supplier']
    }),

    updateSupplier: builder.mutation<{ data: Supplier }, UpdateSupplier>({
      query: ({ id, ...data }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['supplier']
    }),

    deleteSupplier: builder.mutation<{ data: DeleteSupplierResponse }, string | number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['supplier']
    }),
  }),
})

export const {
  useCreateSupplierMutation,
  useGetAllSuppliersQuery,
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi
