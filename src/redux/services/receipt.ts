import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface CreateReceipt {
  customer_id: number
  account_id: number
  amount: number
  receipt_date?: string
  notes?: string
}

export interface GetReceiptsParams {
  page?: number
  limit?: number
  search?: string
  customer_id?: number
  account_id?: number
  from_date?: string
  to_date?: string
}

/* =========================
   Response Interfaces
========================= */
export interface Receipt {
  id: number
  receipt_number?: string
  customer_id: number
  customer_name?: string
  account_id: number
  account_name?: string
  amount: string | number
  receipt_date: string
  notes?: string
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

export interface ReceiptsResponse {
  data: Receipt[]
  meta?: PaginationMeta
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */
export const receiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReceipt: builder.mutation<{ data: Receipt }, CreateReceipt>({
      query: (data) => ({
        url: '/receipts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['receipt', 'customer', 'account', 'financial-ledger']
    }),

    getAllReceipts: builder.query<ReceiptsResponse, GetReceiptsParams | void>({
      query: (params = {}) => ({
        url: '/receipts',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 30,
          ...(params?.search && { search: params.search }),
          ...(params?.customer_id && { customer_id: params.customer_id }),
          ...(params?.account_id && { account_id: params.account_id }),
          ...(params?.from_date && { from_date: params.from_date }),
          ...(params?.to_date && { to_date: params.to_date }),
        },
      }),
      transformResponse: (response: { data: Receipt[] | { data: Receipt[]; meta: PaginationMeta } }) => {
        if (Array.isArray(response.data)) {
          return { data: response.data, meta: undefined };
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
          return { data: response.data.data, meta: response.data.meta };
        }
        return { data: [], meta: undefined };
      },
      providesTags: ['receipt']
    }),

    getReceiptById: builder.query<{ data: Receipt }, number>({
      query: (id) => ({
        url: `/receipts/${id}`,
        method: 'GET',
      }),
      providesTags: ['receipt']
    }),

    deleteReceipt: builder.mutation<{ data: DeleteResponse }, number>({
      query: (id) => ({
        url: `/receipts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['receipt', 'customer', 'account', 'financial-ledger']
    }),
  }),
})

export const {
  useCreateReceiptMutation,
  useGetAllReceiptsQuery,
  useGetReceiptByIdQuery,
  useDeleteReceiptMutation,
} = receiptApi
