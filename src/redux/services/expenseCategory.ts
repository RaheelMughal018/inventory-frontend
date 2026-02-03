import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetExpenseCategoriesParams {
  search?: string
  skip?: number
  limit?: number
}

export interface CreateExpenseCategory {
  name: string
}

export interface UpdateExpenseCategory {
  id: string
  name?: string
}

/* =========================
   Response Interfaces
========================= */

export interface ExpenseCategory {
  id: string
  name: string
  created_at: string
}

export interface ExpenseCategoryListResponse {
  total: number
  categories: ExpenseCategory[]
}

export interface ExpenseCategoryDeleteResponse {
  message: string
}

/* =========================
   API
========================= */

export const expenseCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExpenseCategories: builder.query<
      ExpenseCategoryListResponse,
      GetExpenseCategoriesParams
    >({
      query: (params) => ({
        url: '/expense-categories',
        method: 'GET',
        params,
      }),
      providesTags: ['expense_category'],
    }),

    createExpenseCategory: builder.mutation<
      ExpenseCategory,
      CreateExpenseCategory
    >({
      query: (data) => ({
        url: '/expense-categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['expense_category'],
    }),

    updateExpenseCategory: builder.mutation<
      ExpenseCategory,
      UpdateExpenseCategory
    >({
      query: ({ id, ...data }) => ({
        url: `/expense-categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['expense_category'],
    }),

    deleteExpenseCategory: builder.mutation<
      ExpenseCategoryDeleteResponse,
      string
    >({
      query: (id) => ({
        url: `/expense-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['expense_category'],
    }),
  }),
})

export const {
  useGetAllExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoryApi
