import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetCustomerStatementParams {
  customer_id: number
  from_date?: string
  to_date?: string
}

/* =========================
   Response Interfaces
========================= */
export interface CustomerStatementInvoice {
  id: number
  invoice_number: string
  invoice_date: string
  due_date?: string
  total_amount: string | number
  received_amount: string | number
  outstanding_amount: string | number
  payment_status: 'PAID' | 'PARTIAL' | 'UNPAID'
  notes?: string
}

export interface CustomerStatementRepairInvoice {
  id: number
  invoice_number: string
  received_date: string
  total_amount: string | number
  received_amount: string | number
  outstanding_amount: string | number
  payment_status: 'PAID' | 'PARTIAL' | 'UNPAID'
  is_foc: boolean
  notes?: string
}

export interface CustomerStatementReceipt {
  id: number
  receipt_number: string
  receipt_date: string
  amount: string | number
  invoice_number?: string
  repair_invoice_number?: string
  invoice_id?: number
  repair_invoice_id?: number
  account_name: string
  notes?: string
}

export interface CustomerStatementSummary {
  total_sales: string | number
  total_receipts: string | number
  outstanding_balance: string | number
  invoice_count: number
  receipt_count: number
  unpaid_invoice_count: number
  partial_invoice_count: number
  total_repairs: string | number
  repair_invoice_count: number
}

export interface CustomerStatement {
  customer_id: number
  customer_name: string
  company_name?: string
  phone?: string
  address?: string
  opening_balance: string | number
  current_balance: string | number
  summary: CustomerStatementSummary
  invoices: CustomerStatementInvoice[]
  repair_invoices: CustomerStatementRepairInvoice[]
  receipts: CustomerStatementReceipt[]
}

/* =========================
   API
========================= */

export const customerStatementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerStatement: builder.query<
      { data: CustomerStatement },
      GetCustomerStatementParams
    >({
      query: ({ customer_id, from_date, to_date }) => ({
        url: `/customers/${customer_id}/statement`,
        method: 'GET',
        params: {
          from_date,
          to_date,
        },
      }),
      transformResponse: (
        raw: { statusCode?: number; message?: string; data: CustomerStatement }
      ) => {
        const data = (raw as { data?: CustomerStatement }).data
        return { data: data! }
      },
      providesTags: ['customer', 'sale_invoice', 'receipt', 'repair_invoice'],
    }),
  }),
})

export const { useGetCustomerStatementQuery } = customerStatementApi
