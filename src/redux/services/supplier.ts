import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetSuppliersParams {
  search?: string
  skip?: number
  limit?: number
}

export interface CreateSupplier {
  name: string
  company_name: string
  phone: string
  city: string
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
    company_name?: string | null
    phone: string
    city: string
    user_id: string
    created_at: string
    updated_at: string
    created_by_id: number
  }
  
  export interface SuppliersResponse {
    total: number
    suppliers: Supplier[]
  }

  export interface DeleteSupplierResponse{
    message: string
  }

/* =========================
   API
========================= */

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSupplier: builder.mutation<Supplier, CreateSupplier>({
      query: (data) => ({
        url: '/suppliers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags:['supplier']
    }),

    getAllSuppliers: builder.query<SuppliersResponse, GetSuppliersParams>({
      query: (params) => ({
        url: '/suppliers',
        method: 'GET',
        params,

      }),
      providesTags:['supplier']
    }),

    getSupplierById: builder.query<Supplier, number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'GET',
      }),
      providesTags:['supplier']
    }),

    updateSupplier: builder.mutation<Supplier, UpdateSupplier>({
      query: ({ id, ...data }) => ({
        url: `/suppliers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags:['supplier']

    }),
    deleteSupplier: builder.mutation<DeleteSupplierResponse, string|number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags:['supplier']

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
