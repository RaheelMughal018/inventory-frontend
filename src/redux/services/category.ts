import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetCategoriesParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCategory {
  name: string
}

export interface UpdateCategory extends CreateCategory {
  id: number 
}

/* =========================
   Response Interfaces
========================= */

export interface Category {
  id: number
  name: string
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

export interface CategoriesResponse {
  data: Category[]
  meta?: PaginationMeta
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<{ data: Category }, CreateCategory>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['category']
    }),

    getAllCategories: builder.query<CategoriesResponse, GetCategoriesParams>({
      query: ({ page = 1, limit = 10, search, sortBy, sortOrder }) => ({
        url: '/categories',
        method: 'GET',
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),
      transformResponse: (response: { data: Category[] | { data: Category[]; meta: PaginationMeta } }) => {
        // Handle wrapped response
        if (Array.isArray(response.data)) {
          return { data: response.data, meta: undefined };
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          return { data: response.data.data, meta: response.data.meta };
        }
        return { data: [], meta: undefined };
      },
      providesTags: ['category']
    }),

    getCategoryById: builder.query<{ data: Category }, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags: ['category']
    }),

    updateCategory: builder.mutation<{ data: Category }, UpdateCategory>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['category']
    }),

    deleteCategory: builder.mutation<{ data: DeleteResponse }, string | number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['category']
    }),
  }),
})

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi
