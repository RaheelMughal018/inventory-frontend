import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */

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
    id: string
    name: string
    created_at: string
    updated_at: string
  }
  
  export interface CategorysResponse {
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

    getAllCategorys: builder.query<CategorysResponse, void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
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
  useGetAllCategorysQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi
