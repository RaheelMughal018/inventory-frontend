import { baseApi } from './baseApi'

/* =========================
   Enums
========================= */
export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
}

/* =========================
   Request Interfaces
========================= */
export interface SaleInvoiceItemDto {
  item_id: number
  serial_number?: string
  quantity?: number
}

export interface CreateSaleInvoice {
  customer_id: number
  invoice_date?: string
  due_date?: string
  items: SaleInvoiceItemDto[]
  tax?: number
  discount?: number
  payment_status: PaymentStatus
  account_id?: number
  received_amount?: number
  notes?: string
}

export interface GetSaleInvoicesParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  customer_id?: number
  payment_status?: PaymentStatus
  from_date?: string
  to_date?: string
}

/* =========================
   Response Interfaces
========================= */
export interface SaleInvoiceItem {
  id: number
  item_id: number
  item_name?: string
  serial_number?: string
  quantity: string | number
  unit_price: string | number
  total_price: string | number
  created_at: string
}

export interface SaleInvoice {
  id: number
  invoice_number: string
  customer_id: number
  customer_name?: string
  admin_id?: number
  admin_name?: string
  invoice_date: string
  due_date?: string
  subtotal: string | number
  tax: string | number
  discount: string | number
  total_amount: string | number
  paid_amount: string | number
  payment_status: PaymentStatus
  notes?: string
  created_at: string
  updated_at: string
  items?: SaleInvoiceItem[]
  outstanding_amount?: string | number
}

export interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SaleInvoicesResponse {
  data: SaleInvoice[]
  meta?: PaginationMeta
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */
export const saleInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSaleInvoice: builder.mutation<{ data: SaleInvoice }, CreateSaleInvoice>({
      query: (data) => ({
        url: '/sale-invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['sale_invoice', 'customer', 'item']
    }),

    getAllSaleInvoices: builder.query<SaleInvoicesResponse, GetSaleInvoicesParams>({
      query: ({ page = 1, limit = 30, search, sortBy, sortOrder, customer_id, payment_status, from_date, to_date }) => ({
        url: '/sale-invoices',
        method: 'GET',
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
          ...(customer_id && { customer_id }),
          ...(payment_status && { payment_status }),
          ...(from_date && { from_date }),
          ...(to_date && { to_date }),
        },
      }),
      transformResponse: (response: { data: SaleInvoice[] | { data: SaleInvoice[]; meta: PaginationMeta } }) => {
        if (Array.isArray(response.data)) {
          return { data: response.data, meta: undefined };
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
          return { data: response.data.data, meta: response.data.meta };
        }
        return { data: [], meta: undefined };
      },
      providesTags: ['sale_invoice']
    }),

    getSaleInvoiceById: builder.query<{ data: SaleInvoice }, number>({
      query: (id) => ({
        url: `/sale-invoices/${id}`,
        method: 'GET',
      }),
      providesTags: ['sale_invoice']
    }),
  }),
})

export const {
  useCreateSaleInvoiceMutation,
  useGetAllSaleInvoicesQuery,
  useGetSaleInvoiceByIdQuery,
} = saleInvoiceApi
