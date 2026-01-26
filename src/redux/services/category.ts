import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */

export interface CreateCategory {
  name: string
}

export interface UpdateCategory extends CreateCategory {
  id: string
}

export interface GetCategoriesParams {
  skip?: number
  limit?: number
  search?: string
}

/* =========================
   Response Interfaces
========================= */

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface CategoriesResponse {
  total: number
  categories: Category[]
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<Category, CreateCategory>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['category']
    }),

    getAllCategories: builder.query<CategoriesResponse, GetCategoriesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
        if (params?.search) queryParams.append('search', params.search)
        
        const queryString = queryParams.toString()
        return {
          url: `/categories${queryString ? '?' + queryString : ''}`,
          method: 'GET',
        }
      },
      providesTags: ['category']
    }),

    getCategoryById: builder.query<Category, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags: ['category']
    }),

    updateCategory: builder.mutation<Category, UpdateCategory>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['category']
    }),

    deleteCategory: builder.mutation<DeleteResponse, string>({
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
