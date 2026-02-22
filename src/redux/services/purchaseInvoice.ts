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
export interface PurchaseInvoiceItemDto {
  item_id: number
  quantity: number
  unit_price: number
}

export interface CreatePurchaseInvoice {
  supplier_id: number
  invoice_date?: string
  due_date?: string
  items: PurchaseInvoiceItemDto[]
  tax?: number
  discount?: number
  payment_status: PaymentStatus
  account_id?: number
  paid_amount?: number
  notes?: string
}

export interface UpdatePurchaseInvoice {
  id: number
  invoice_date?: string
  due_date?: string
  items?: PurchaseInvoiceItemDto[]
  tax?: number
  discount?: number
  notes?: string
}

export interface GetPurchaseInvoicesParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  supplier_id?: number
  payment_status?: PaymentStatus
  from_date?: string
  to_date?: string
}

/* =========================
   Response Interfaces
========================= */
export interface PurchaseInvoiceItem {
  id: number
  item_id: number
  item_name?: string
  quantity: string | number
  unit_price: string | number
  total_price: string | number
  created_at: string
}

export interface PurchaseInvoice {
  id: number
  invoice_number: string
  supplier_id: number
  supplier_name?: string
  admin_id: number
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
  items?: PurchaseInvoiceItem[]
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

export interface PurchaseInvoicesResponse {
  data: PurchaseInvoice[]
  meta?: PaginationMeta
}

export interface PurchaseInvoiceSummary {
  total_invoices: number
  total_amount: string
  paid_count: number
  unpaid_count: number
  partial_count: number
  outstanding_amount: string
  paid_amount: string
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */
export const purchaseInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPurchaseInvoice: builder.mutation<{ data: PurchaseInvoice }, CreatePurchaseInvoice>({
      query: (data) => ({
        url: '/purchase-invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['purchase_invoice', 'supplier', 'item']
    }),

    getAllPurchaseInvoices: builder.query<PurchaseInvoicesResponse, GetPurchaseInvoicesParams>({
      query: ({ page = 1, limit = 30, search, sortBy, sortOrder, supplier_id, payment_status, from_date, to_date }) => ({
        url: '/purchase-invoices',
        method: 'GET',
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
          ...(supplier_id && { supplier_id }),
          ...(payment_status && { payment_status }),
          ...(from_date && { from_date }),
          ...(to_date && { to_date }),
        },
      }),
      transformResponse: (response: { data: PurchaseInvoice[] | { data: PurchaseInvoice[]; meta: PaginationMeta } }) => {
        // Handle wrapped response
        if (Array.isArray(response.data)) {
          return { data: response.data, meta: undefined };
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          return { data: response.data.data, meta: response.data.meta };
        }
        return { data: [], meta: undefined };
      },
      providesTags: ['purchase_invoice']
    }),

    getPurchaseInvoiceSummary: builder.query<PurchaseInvoiceSummary, void>({
      query: () => ({
        url: '/purchase-invoices/summary',
        method: 'GET',
      }),
      providesTags: ['purchase_invoice']
    }),

    getPurchaseInvoiceById: builder.query<{ data: PurchaseInvoice }, number>({
      query: (id) => ({
        url: `/purchase-invoices/${id}`,
        method: 'GET',
      }),
      providesTags: ['purchase_invoice']
    }),

    updatePurchaseInvoice: builder.mutation<{ data: PurchaseInvoice }, UpdatePurchaseInvoice>({
      query: ({ id, ...data }) => ({
        url: `/purchase-invoices/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['purchase_invoice', 'supplier', 'item']
    }),

    deletePurchaseInvoice: builder.mutation<{ data: DeleteResponse }, number>({
      query: (id) => ({
        url: `/purchase-invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['purchase_invoice', 'supplier', 'item']
    }),
  }),
})

export const {
  useCreatePurchaseInvoiceMutation,
  useGetAllPurchaseInvoicesQuery,
  useGetPurchaseInvoiceSummaryQuery,
  useGetPurchaseInvoiceByIdQuery,
  useUpdatePurchaseInvoiceMutation,
  useDeletePurchaseInvoiceMutation,
} = purchaseInvoiceApi
