import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface CreateExpenseCategory {
  name: string
  description?: string
}

export interface UpdateExpenseCategory {
  name?: string
  description?: string
}

/* =========================
   Response Interfaces
========================= */
export interface ExpenseCategory {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  _count?: { expenses: number }
}

/* =========================
   API
========================= */
export const expenseCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExpenseCategories: builder.query<ExpenseCategory[], void>({
      query: () => ({
        url: '/expense-categories',
        method: 'GET',
      }),
      transformResponse: (raw: ExpenseCategory[] | { data: ExpenseCategory[] }) =>
        Array.isArray(raw) ? raw : (raw?.data ?? []),
      providesTags: ['expense_category'],
    }),

    getExpenseCategoryById: builder.query<ExpenseCategory, number>({
      query: (id) => ({
        url: `/expense-categories/${id}`,
        method: 'GET',
      }),
      transformResponse: (raw: ExpenseCategory | { data: ExpenseCategory }) =>
        (raw as { data?: ExpenseCategory })?.data ?? (raw as ExpenseCategory),
      providesTags: (_result, _err, id) => [{ type: 'expense_category', id }],
    }),

    createExpenseCategory: builder.mutation<ExpenseCategory, CreateExpenseCategory>({
      query: (data) => ({
        url: '/expense-categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['expense_category'],
    }),

    updateExpenseCategory: builder.mutation<
      ExpenseCategory,
      { id: number; data: UpdateExpenseCategory }
    >({
      query: ({ id, data }) => ({
        url: `/expense-categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'expense_category', id }, 'expense_category'],
    }),

    deleteExpenseCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/expense-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, id) => [{ type: 'expense_category', id }, 'expense_category'],
    }),
  }),
})

export const {
  useGetAllExpenseCategoriesQuery,
  useGetExpenseCategoryByIdQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoryApi
