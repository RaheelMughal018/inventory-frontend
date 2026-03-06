import { baseApi } from './baseApi'

/* =========================
   Enums
========================= */
export type PaymentStatusRepair = 'PAID' | 'UNPAID' | 'PARTIAL'

/** Backend: PENDING → IN_PROGRESS → COMPLETED → DELIVERED */
export type RepairStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED'

/* =========================
   Request Interfaces
========================= */
export interface CreateRepairInvoiceItemDto {
  item_id?: number
  description: string
  quantity: number
  unit_price: number
  inventory_count?: boolean
}

export interface CreateRepairInvoiceDto {
  customer_id: number
  is_foc?: boolean
  production_item_id?: number
  serial_number?: string
  item_id?: number
  item_type?: string
  item_description?: string
  received_date: string
  items: CreateRepairInvoiceItemDto[]
  payment_status?: PaymentStatusRepair
  account_id?: number
  received_amount?: number
  notes?: string
  technician_notes?: string
}

export interface UpdateRepairStatusDto {
  repair_status: RepairStatus
}

/** Matches backend findAll: customer_id, is_foc, repair_status, page, limit */
export interface GetRepairInvoicesParams {
  page?: number
  limit?: number
  customer_id?: number
  is_foc?: boolean
  repair_status?: RepairStatus
}

/* =========================
   Response Interfaces
========================= */
export interface RepairInvoiceItemResponse {
  id: number
  item_id?: number
  item_name?: string
  description: string
  quantity: number
  unit_price: string | number
  total_price: string | number
  cost_price?: string | number
  inventory_count?: boolean
}

export interface RepairInvoice {
  id: number
  invoice_number: string
  customer_id: number
  customer_name?: string
  item_type?: string
  production_item_id?: number
  serial_number?: string
  item_id?: number
  item_description?: string
  is_foc: boolean
  repair_status: RepairStatus
  received_date: string
  repair_date?: string
  delivery_date?: string
  parts_cost?: string | number
  service_charges?: string | number
  total_amount: string | number
  received_amount: string | number
  payment_status: PaymentStatusRepair
  notes?: string
  technician_notes?: string
  items: RepairInvoiceItemResponse[]
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface RepairInvoicesResponse {
  data: RepairInvoice[]
  meta?: PaginationMeta
}

/* =========================
   API
========================= */
export const repairInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => {
    return (
      {
        createRepairInvoice: builder.mutation<
        { data: RepairInvoice },
        CreateRepairInvoiceDto
        >({
          query: (body) => ({
          url: '/repair-invoices',
          method: 'POST',
          body,
        }),
        transformResponse: (raw: { data?: RepairInvoice } | RepairInvoice) => {
          const data = (raw as { data?: RepairInvoice }).data ?? (raw as RepairInvoice)
          return { data }
        },
        invalidatesTags: ['repair_invoice', 'customer', 'item'],
      }),
  
      getAllRepairInvoices: builder.query<
        RepairInvoicesResponse,
        GetRepairInvoicesParams
      >({
        query: ({
          page = 1,
          limit = 30,
          customer_id,
          is_foc,
          repair_status,
        }) => ({
          url: '/repair-invoices',
          method: 'GET',
          params: {
            page,
            limit,
            ...(customer_id != null && { customer_id }),
            ...(is_foc !== undefined && { is_foc }),
            ...(repair_status && { repair_status }),
          },
        }),
        transformResponse: (
          response:
            | { data: RepairInvoice[]; total?: number; page?: number; limit?: number }
            | { data: { data: RepairInvoice[]; meta: PaginationMeta } }
        ) => {
          const raw = response as {
            data?: RepairInvoice[] | { data: RepairInvoice[]; meta: PaginationMeta }
            total?: number
            page?: number
            limit?: number
          }
          if (Array.isArray(raw.data)) {
            const total = raw.total ?? raw.data.length
            const page = raw.page ?? 1
            const limit = raw.limit ?? raw.data.length
            return {
              data: raw.data,
              meta: {
                page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit) || 1,
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
              },
            }
          }
          if (raw.data?.data && Array.isArray(raw.data.data)) {
            return { data: raw.data.data, meta: raw.data.meta }
          }
          return { data: [], meta: undefined }
        },
        providesTags: ['repair_invoice'],
      }),
  
      getRepairInvoiceById: builder.query<{ data: RepairInvoice }, number>({
        query: (id) => ({
          url: `/repair-invoices/${id}`,
          method: 'GET',
        }),
        transformResponse: (raw: { data?: RepairInvoice }) => {
          const data = raw?.data ?? (raw as unknown as RepairInvoice)
          return { data }
        },
        providesTags: (_result, _err, id) => [{ type: 'repair_invoice', id }],
      }),
  
      updateRepairInvoiceStatus: builder.mutation<
        { data: RepairInvoice },
        { id: number; body: UpdateRepairStatusDto }
      >({
        query: ({ id, body }) => ({
          url: `/repair-invoices/${id}/status`,
          method: 'PATCH',
          body,
        }),
        transformResponse: (raw: { data?: RepairInvoice } | RepairInvoice) => {
          const data = (raw as { data?: RepairInvoice }).data ?? (raw as RepairInvoice)
          return { data }
        },
        invalidatesTags: (_result, _err, { id }) => [
          'repair_invoice',
          { type: 'repair_invoice', id },
        ],
      }),
    }
    );
  },
})

export const {
  useCreateRepairInvoiceMutation,
  useGetAllRepairInvoicesQuery,
  useGetRepairInvoiceByIdQuery,
  useUpdateRepairInvoiceStatusMutation,
} = repairInvoiceApi
