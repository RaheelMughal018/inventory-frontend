// redux/services/purchaseInvoice.ts
import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetPurchaseInvoicesParams {
  search?: string
  skip?: number
  limit?: number
  status?: 'draft' | 'pending' | 'completed' | 'cancelled'
  start_date?: string
  end_date?: string
  supplier_id?: number
}

export interface PurchaseInvoiceItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total: number
  tax_rate?: number
  discount?: number
}

export interface Payment {
  id: number
  invoice_id: number
  amount: number
  payment_method: string
  payment_date: string
  notes?: string
  created_at: string
}

export interface CreatePurchaseInvoice {
  supplier_id: number
  invoice_date: string  // "2024-01-15"
  due_date?: string
  items: PurchaseInvoiceItem[]
  notes?: string
  discount_amount?: number
  tax_amount?: number
  shipping_charges?: number
  payment_terms?: string
}

export interface UpdatePurchaseInvoice extends CreatePurchaseInvoice {
  id: number
}

/* =========================
   Response Interfaces
========================= */
export interface PurchaseInvoice {
  id: number
  invoice_number: string  // "PUR-2024-001"
  supplier_id: number
  supplier_name: string
  invoice_date: string
  due_date: string
  items: PurchaseInvoiceItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_charges: number
  grand_total: number
  paid_amount: number
  balance_due: number
  status: 'draft' | 'pending' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'partial' | 'paid'
  notes?: string
  payment_terms?: string
  created_by: number
  approved_by?: number
  created_at: string
  updated_at: string
  payments?: Payment[]
}

export interface PurchaseInvoicesResponse {
  total: number
  purchase_invoices: PurchaseInvoice[]
}

export interface DeletePurchaseInvoiceResponse {
  message: string
}

export interface PaymentResponse {
  message: string
  payment: Payment
}

export interface PaymentsResponse {
  payments: Payment[]
}

export interface DeletePaymentResponse {
  message: string
}

export interface SupplierBalance {
  supplier_id: number
  supplier_name: string
  total_purchases: number
  total_paid: number
  balance_due: number
  overdue_amount: number
}

export interface SupplierSummary {
  supplier_id: number
  supplier_name: string
  total_invoices: number
  total_amount: number
  paid_amount: number
  pending_amount: number
  last_purchase_date: string
}

export interface ItemStockSummary {
  item_id: number
  item_name: string
  current_stock: number
  unit: string
  reorder_level: number
  last_purchase_date: string
  last_purchase_price: number
}

export interface ItemStockHistory {
  item_id: number
  item_name: string
  history: Array<{
    date: string
    reference_no: string
    type: 'purchase' | 'sale' | 'adjustment'
    quantity: number
    unit_price?: number
    stock_after: number
  }>
}

export interface StockLedgerEntry {
  id: number
  date: string
  item_id: number
  item_name: string
  reference_type: 'purchase_invoice' | 'sales_invoice' | 'stock_adjustment'
  reference_id: number
  reference_no: string
  quantity_in: number
  quantity_out: number
  balance: number
  unit_cost: number
  total_value: number
}

export interface StockLedgerResponse {
  entries: StockLedgerEntry[]
  total_entries: number
}

export interface PurchaseInvoiceStats {
  total_invoices: number
  total_amount: number
  pending_invoices: number
  paid_invoices: number
  overdue_invoices: number
}

/* =========================
   API Endpoints
========================= */
export const purchaseInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE: Create a new purchase invoice
    createPurchaseInvoice: builder.mutation<PurchaseInvoice, CreatePurchaseInvoice>({
      query: (data) => ({
        url: '/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['purchase_invoice', 'supplier']
    }),

    // READ: Get all purchase invoices with pagination/filtering
    getAllPurchaseInvoices: builder.query<PurchaseInvoicesResponse, GetPurchaseInvoicesParams>({
      query: (params) => ({
        url: '/purchase',
        method: 'GET',
        params,
      }),
      providesTags: ['purchase_invoice']
    }),

    // READ: Get single purchase invoice by ID
    getPurchaseInvoiceById: builder.query<PurchaseInvoice, number>({
      query: (id) => ({
        url: `/purchase/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'purchase_invoice', id }]
    }),

    // UPDATE: Update purchase invoice
    updatePurchaseInvoice: builder.mutation<PurchaseInvoice, UpdatePurchaseInvoice>({
      query: ({ id, ...data }) => ({
        url: `/purchase/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'purchase_invoice', id },
        'purchase_invoice',
        'item'  // Invalidate item cache for stock updates
      ]
    }),

    // DELETE: Delete purchase invoice
    deletePurchaseInvoice: builder.mutation<DeletePurchaseInvoiceResponse, number>({
      query: (id) => ({
        url: `/purchase/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['purchase_invoice', 'supplier', 'item']
    }),

    // PAYMENTS: Add payment to purchase invoice
    addPurchaseInvoicePayment: builder.mutation<PaymentResponse, { 
      invoice_id: number;
      amount: number; 
      payment_method: string; 
      payment_date: string;
      notes?: string;
    }>({
      query: ({ invoice_id, ...data }) => ({
        url: `/purchase/${invoice_id}/payments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { invoice_id }) => [
        { type: 'purchase_invoice', id: invoice_id },
        'purchase_invoice',
        'supplier'
      ]
    }),

    // PAYMENTS: Get all payments for an invoice
    getPurchaseInvoicePayments: builder.query<PaymentsResponse, number>({
      query: (invoice_id) => ({
        url: `/purchase/${invoice_id}/payments`,
        method: 'GET',
      }),
      providesTags: (result, error, invoice_id) => [
        { type: 'purchase_invoice', id: invoice_id }
      ]
    }),

    // PAYMENTS: Delete a payment
    deletePayment: builder.mutation<DeletePaymentResponse, number>({
      query: (payment_id) => ({
        url: `/purchase/payments/${payment_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['purchase_invoice', 'supplier']
    }),

    // SUPPLIER: Get all purchases from a supplier
    getSupplierPurchaseInvoices: builder.query<PurchaseInvoicesResponse, {
      supplier_id: number;
      params?: GetPurchaseInvoicesParams;
    }>({
      query: ({ supplier_id, params }) => ({
        url: `/purchase/suppliers/${supplier_id}/invoices`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { supplier_id }) => [
        { type: 'supplier', id: supplier_id }
      ]
    }),

    // SUPPLIER: Get supplier balance
    getSupplierBalance: builder.query<SupplierBalance, number>({
      query: (supplier_id) => ({
        url: `/purchase/suppliers/${supplier_id}/balance`,
        method: 'GET',
      }),
      providesTags: (result, error, supplier_id) => [
        { type: 'supplier', id: supplier_id }
      ]
    }),

    // SUPPLIER: Get supplier purchase summary
    getSupplierSummary: builder.query<SupplierSummary, number>({
      query: (supplier_id) => ({
        url: `/purchase/suppliers/${supplier_id}/summary`,
        method: 'GET',
      }),
      providesTags: (result, error, supplier_id) => [
        { type: 'supplier', id: supplier_id }
      ]
    }),

    // ITEM: Get item stock summary
    getItemStockSummary: builder.query<ItemStockSummary, number>({
      query: (item_id) => ({
        url: `/purchase/items/${item_id}/stock`,
        method: 'GET',
      }),
      providesTags: (result, error, item_id) => [
        { type: 'item', id: item_id }
      ]
    }),

    // ITEM: Get item stock history
    getItemStockHistory: builder.query<ItemStockHistory, number>({
      query: (item_id) => ({
        url: `/purchase/items/${item_id}/history`,
        method: 'GET',
      }),
      providesTags: (result, error, item_id) => [
        { type: 'item', id: item_id }
      ]
    }),

    // STOCK: Get stock ledger entries
    getStockLedger: builder.query<StockLedgerResponse, {
      start_date?: string;
      end_date?: string;
      item_id?: number;
      skip?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/purchase/stock-ledger',
        method: 'GET',
        params,
      }),
      providesTags: ['item']
    }),

    // STATS: Get purchase invoice statistics (custom endpoint if exists)
    getPurchaseInvoiceStats: builder.query<PurchaseInvoiceStats, void>({
      query: () => ({
        url: '/purchase/stats', // Note: This endpoint wasn't in your list
        method: 'GET',
      }),
      providesTags: ['purchase_invoice']
    }),
  }),
})

/* =========================
   Export Hooks
========================= */
export const {
  useCreatePurchaseInvoiceMutation,
  useGetAllPurchaseInvoicesQuery,
  useGetPurchaseInvoiceByIdQuery,
  useUpdatePurchaseInvoiceMutation,
  useDeletePurchaseInvoiceMutation,
  useAddPurchaseInvoicePaymentMutation,
  useGetPurchaseInvoicePaymentsQuery,
  useDeletePaymentMutation,
  useGetSupplierPurchaseInvoicesQuery,
  useGetSupplierBalanceQuery,
  useGetSupplierSummaryQuery,
  useGetItemStockSummaryQuery,
  useGetItemStockHistoryQuery,
  useGetStockLedgerQuery,
  useGetPurchaseInvoiceStatsQuery,
} = purchaseInvoiceApi