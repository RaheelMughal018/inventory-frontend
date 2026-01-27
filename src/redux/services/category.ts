import { baseApi } from './baseApi'
import { ItemType } from './item'

/* =========================
   Request Interfaces
========================= */
export interface GetCategoriesParams {
  search?: string
  skip?: number
  limit?: number
  item_type?: ItemType
}

export interface CreateCategory {
  name: string
}

export interface UpdateCategory extends CreateCategory {
  id: string 
}

/* =========================
   Response Interfaces
========================= */

export interface Category {
    id: string
    name: string
    created_at: string
    updated_at: string
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
      invalidatesTags:['category']
    }),

    getAllCategories: builder.query<CategoriesResponse, GetCategoriesParams>({
      query: (params) => ({
        url: '/categories',
        method: 'GET',
        params,
      }),
      providesTags:['category']
    }),

    getCategoryById: builder.query<Category, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags:['category']
    }),

    updateCategory: builder.mutation<Category, UpdateCategory>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags:['category']
    }),

    deleteCategory: builder.mutation<DeleteResponse, string|number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags:['category']
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
