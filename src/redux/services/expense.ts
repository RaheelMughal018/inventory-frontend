import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface CreateExpense {
  category_id: number
  account_id: number
  amount: number
  description: string
  expense_date?: string
  notes?: string
  receipt_image?: string
}

export interface UpdateExpense {
  category_id?: number
  account_id?: number
  amount?: number
  description?: string
  expense_date?: string
  notes?: string
  receipt_image?: string
}

/** Single item for bulk create by day (date comes from parent) */
export interface ExpenseItemDto {
  category_id: number
  account_id: number
  amount: number
  description: string
  notes?: string
}

export interface BulkExpensesByDay {
  date: string
  expenses: ExpenseItemDto[]
}

export interface GetExpensesParams {
  from?: string
  to?: string
  search?: string
}

/* =========================
   Response Interfaces
========================= */
export interface ExpenseCategoryRef {
  id: number
  name: string
}

export interface ExpenseAccountRef {
  id: number
  name: string
  account_type?: string
}

export interface ExpenseAdminRef {
  id: number
  name: string
}

export interface Expense {
  id: number
  category_id: number
  account_id: number
  admin_id: number
  amount: string | number
  description: string
  expense_date: string
  notes: string | null
  receipt_image: string | null
  created_at: string
  updated_at: string
  category: ExpenseCategoryRef
  account: ExpenseAccountRef
  admin: ExpenseAdminRef
}

/* =========================
   API
========================= */
export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExpenses: builder.query<Expense[], GetExpensesParams | void>({
      query: (params) => ({
        url: '/expenses',
        method: 'GET',
        params: params ?? undefined,
      }),
      transformResponse: (raw: Expense[] | { data: Expense[] }) =>
        Array.isArray(raw) ? raw : (raw?.data ?? []),
      providesTags: ['expense'],
    }),

    getExpenseById: builder.query<Expense, number>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'GET',
      }),
      transformResponse: (raw: Expense | { data: Expense }) =>
        (raw as { data?: Expense })?.data ?? (raw as Expense),
      providesTags: (_result, _err, id) => [{ type: 'expense', id }],
    }),

    createExpense: builder.mutation<Expense, CreateExpense>({
      query: (data) => ({
        url: '/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['expense', 'account'],
    }),

    createBulkByDay: builder.mutation<Expense[], BulkExpensesByDay>({
      query: (data) => ({
        url: '/expenses/bulk-by-day',
        method: 'POST',
        body: data,
      }),
      transformResponse: (raw: Expense[] | { data: Expense[] }) =>
        Array.isArray(raw) ? raw : (raw?.data ?? []),
      invalidatesTags: ['expense', 'account'],
    }),

    updateExpense: builder.mutation<Expense, { id: number; data: UpdateExpense }>({
      query: ({ id, data }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'expense', id }, 'expense'],
    }),

    deleteExpense: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, id) => [{ type: 'expense', id }, 'expense', 'account'],
    }),
  }),
})

export const {
  useGetAllExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useCreateBulkByDayMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi
