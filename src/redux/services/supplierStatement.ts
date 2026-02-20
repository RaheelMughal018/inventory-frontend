import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetSupplierStatementParams {
  supplier_id: number
  from_date?: string
  to_date?: string
}

/* =========================
   Response Interfaces
========================= */
export interface SupplierStatementInvoice {
  id: number
  invoice_number: string
  invoice_date: string
  due_date?: string
  total_amount: string | number
  paid_amount: string | number
  outstanding_amount: string | number
  payment_status: 'PAID' | 'PARTIAL' | 'UNPAID'
  notes?: string
}

export interface SupplierStatementPayment {
  id: number
  payment_number: string
  payment_date: string
  amount: string | number
  invoice_number?: string
  invoice_id?: number
  account_name: string
  notes?: string
}

export interface SupplierStatementSummary {
  total_purchases: string | number
  total_payments: string | number
  outstanding_balance: string | number
  invoice_count: number
  payment_count: number
  unpaid_invoice_count: number
  partial_invoice_count: number
}

export interface SupplierStatement {
  supplier_id: number
  supplier_name: string
  company_name?: string
  phone?: string
  address?: string
  opening_balance: string | number
  current_balance: string | number
  summary: SupplierStatementSummary
  invoices: SupplierStatementInvoice[]
  payments: SupplierStatementPayment[]
}

/* =========================
   API
========================= */

export const supplierStatementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupplierStatement: builder.query<{ data: SupplierStatement }, GetSupplierStatementParams>({
      query: ({ supplier_id, from_date, to_date }) => ({
        url: `/suppliers/${supplier_id}/statement`,
        method: 'GET',
        params: {
          from_date,
          to_date,
        },
      }),
      providesTags: ['supplier', 'purchase_invoice']
    }),
  }),
})

export const {
  useGetSupplierStatementQuery,
} = supplierStatementApi
