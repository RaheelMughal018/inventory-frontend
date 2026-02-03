import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */

export interface ExpenseCreate {
  date?: string | null // YYYY-MM-DD, optional (server defaults to today)
  name?: string
  amount: number
  account_id: string
  expense_category_id: string
  description?: string | null
  user_id?: number | null
}

export interface ExpenseCreateBulk {
  date?: string | null
  expenses: ExpenseCreate[]
}

export interface GetExpensesParams {
  skip?: number
  limit?: number
  user_id?: number
  expense_category_id?: string
  expense_date?: string // YYYY-MM-DD
  start_date?: string
  end_date?: string
}

/* =========================
   Response Interfaces
========================= */

export interface ExpenseAccountRef {
  id: string
  name: string
}

export interface ExpenseCategoryRef {
  id: string
  name: string
}

export interface ExpenseUserRef {
  id: number
  name: string
}

export interface Expense {
  id: string
  date: string
  amount: string | number
  account_id: string
  expense_category_id: string
  description: string | null
  user_id: number | null
  created_at: string
  account: ExpenseAccountRef
  category: ExpenseCategoryRef
  user: ExpenseUserRef | null
}

export interface ExpenseListResponse {
  total: number
  total_amount: string | number
  expenses: Expense[]
}

export interface ExpenseTotalTodayResponse {
  date: string
  total_amount: string | number
  count: number
}

/* =========================
   API
========================= */

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExpenses: builder.query<ExpenseListResponse, GetExpensesParams>({
      query: (params) => ({
        url: '/expenses',
        method: 'GET',
        params,
      }),
      providesTags: ['expense'],
    }),

    createExpense: builder.mutation<Expense, ExpenseCreate>({
      query: (data) => ({
        url: '/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['expense', 'account'],
    }),

    createExpensesBulk: builder.mutation<Expense[], ExpenseCreateBulk>({
      query: (data) => ({
        url: '/expenses/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['expense', 'account'],
    }),

    getTotalExpenseToday: builder.query<ExpenseTotalTodayResponse, void | { user_id?: number }>({
      query: (params) => ({
        url: '/expenses/total-today',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['expense'],
    }),
  }),
})

export const {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useCreateExpensesBulkMutation,
  useGetTotalExpenseTodayQuery,
} = expenseApi
