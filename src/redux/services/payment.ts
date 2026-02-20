import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface CreatePayment {
  supplier_id: number
  account_id: number
  amount: number
  payment_date?: string
  notes?: string
}

export interface PaymentFilterParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  supplier_id?: number
  account_id?: number
  direct_only?: boolean
  from_date?: string
  to_date?: string
}

/* =========================
   Response Interfaces
========================= */
export interface Payment {
  id: number
  payment_number: string
  supplier_id: number
  supplier_name?: string
  account_id: number
  account_name?: string
  admin_id: number
  admin_name?: string
  amount: string
  payment_date: string
  purchase_invoice_id?: number
  invoice_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PaymentMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaymentsResponse {
  data: Payment[]
  meta: PaymentMeta
}

/* =========================
   API
========================= */
export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentsResponse, PaymentFilterParams | void>({
      query: (params = {}) => ({
        url: '/payments',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
          sortBy: params?.sortBy ?? 'created_at',
          sortOrder: params?.sortOrder ?? 'desc',
          supplier_id: params?.supplier_id,
          account_id: params?.account_id,
          direct_only: params?.direct_only,
          from_date: params?.from_date,
          to_date: params?.to_date,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: 'payment' as const, id: p.id })),
              { type: 'payment', id: 'LIST' },
            ]
          : [{ type: 'payment', id: 'LIST' }],
    }),

    getPaymentById: builder.query<Payment, number>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'GET',
      }),
      transformResponse: (raw: Payment | { data: Payment }) =>
        (raw as { data?: Payment })?.data ?? (raw as Payment),
      providesTags: (_result, _err, id) => [{ type: 'payment', id }],
    }),

    createPayment: builder.mutation<Payment, CreatePayment>({
      query: (data) => ({
        url: '/payments',
        method: 'POST',
        body: data,
      }),
      transformResponse: (raw: Payment | { data: Payment }) =>
        (raw as { data?: Payment })?.data ?? (raw as Payment),
      invalidatesTags: [
        { type: 'payment', id: 'LIST' },
        'supplier',
        'account',
        'purchase_invoice',
      ],
    }),

    deletePayment: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'payment', id },
        { type: 'payment', id: 'LIST' },
        'supplier',
        'account',
      ],
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useDeletePaymentMutation,
} = paymentApi
