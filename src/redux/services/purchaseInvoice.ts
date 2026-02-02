// redux/services/purchaseInvoice.ts
import { baseApi } from "./baseApi";

/* =========================
   Enums (aligned with backend)
========================= */

export enum InvoiceStatusEnum {
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
}

export enum PaymentTypeEnum {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  UN_PAID = "UN_PAID",
}

export enum PaymentAccountTypeEnum {
  CASH = "CASH",
  BANK = "BANK",
  JAZZCASH = "JAZZCASH",
  EASYPAISA = "EASYPAISA",
}

/* =========================
   Request Interfaces
========================= */

export interface PurchaseItemCreate {
  item_id: string;
  quantity: number;
  unit_price: number;
}

export interface PurchaseInvoiceCreate {
  supplier_id: number| string;
  items: PurchaseItemCreate[];
  payment_amount?: number; // default 0.00 on backend
  payment_account_id?: string | null;
}
export interface PurchaseInvoiceUpdate {
  id: string
  supplier_id: number| string;
  items: PurchaseItemCreate[];
  payment_amount?: number; 
  payment_account_id?: string | null;
}

export interface PaymentCreate {
  amount: number;
  account_id: string;
}

export interface PurchaseInvoiceFilters {
  skip?: number;
  limit?: number;
  supplier_id?: number;
  payment_status?: InvoiceStatusEnum;
  search?: string;
  start_date?:string;
  end_date?:string;
}

export interface StockLedgerFilters {
  skip?: number;
  limit?: number;
  item_id?: string;
  ref_type?: string;
}

/* =========================
   Response Interfaces
========================= */

export interface SupplierResponse {
  id: number;
  user_id: string;
  name: string;
  email?: string | null;
}

export interface PurchaseItemResponse {
  id: number;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  account_id: string;
  account_name?: string | null;
  account_type?: PaymentAccountTypeEnum | null;
  payment_type: PaymentTypeEnum;
  created_at: string;
}

export interface PurchaseInvoiceResponse {
  id: string;
  supplier_id: number;
  supplier: SupplierResponse;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  payment_status: InvoiceStatusEnum;
  created_at: string;
  items: PurchaseItemResponse[];
  payments: PaymentResponse[];
}

export interface PurchaseInvoiceSummary {
  id: string;
  supplier_id: number;
  supplier_name: string;
  supplier_user_id: string;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  payment_status: InvoiceStatusEnum;
  created_at: string;
  item_count: number;
  payment_count: number;
}

export interface PurchaseInvoiceListResponse {
  invoices: PurchaseInvoiceSummary[];
  total: number;
  skip: number;
  limit: number;
}

export interface StockLedgerEntry {
  id: string;
  item_id: string;
  item_name?: string | null;
  ref_type: string;
  ref_id: string;
  qty_in: number;
  qty_out: number;
  unit_price?: number | null;
  created_at: string;
}

export interface StockLedgerListResponse {
  entries: StockLedgerEntry[];
  total: number;
  skip: number;
  limit: number;
}

export interface ItemStockSummary {
  item_id: string;
  item_name: string;
  current_quantity: number;
  avg_price: number;
  total_value: number;
  total_qty_in: number;
  total_qty_out: number;
  unit_type: string;
}

export interface SupplierBalance {
  supplier_id: number;
  supplier_name?: string | null;
  supplier_user_id?: string | null;
  total_debit: number;
  total_credit: number;
  balance: number;
}

export interface SupplierPurchaseSummary {
  supplier_id: number;
  supplier_name: string;
  supplier_user_id: string;
  total_purchases: number;
  total_paid: number;
  outstanding_balance: number;
  total_invoices: number;
  unpaid_invoices: number;
  partial_invoices: number;
  paid_invoices: number;
}

export interface SupplierSummaryResponse {
  suppliers_summaries: SupplierPurchaseSummary[]
}

export interface SuccessResponse {
  message: string;
  data?: Record<string, unknown> | null;
}

/* =========================
   API Endpoints (aligned with backend)
========================= */

export const purchaseInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE purchase invoice
    createPurchaseInvoice: builder.mutation<
      PurchaseInvoiceResponse,
      PurchaseInvoiceCreate
    >({
      query: (data) => {

        const id = localStorage.getItem("id")
        return{
        url: "/purchase/",
        method: "POST",
        body: data,
        params:{
          performed_by_id: id
        }
      }
    },
      invalidatesTags: ["purchase_invoice", "supplier", "item"],
    }),

    // LIST purchase invoices
    getAllPurchaseInvoices: builder.query<
      PurchaseInvoiceListResponse,
      PurchaseInvoiceFilters
    >({
      query: (params) => ({
        url: "/purchase/",
        method: "GET",
        params,
      }),
      providesTags: ["purchase_invoice"],
    }),

    // update invoice
    updatePurchaseInvoices: builder.mutation<
      PurchaseInvoiceResponse,
      PurchaseInvoiceUpdate
    >({
      query: ({id, ...data}) => ({
        url: `/purchase/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["purchase_invoice", "supplier", "item"],
    }),
    // update invoice
    deletePurchaseInvoices: builder.mutation<
      SuccessResponse,
      string
    >({
      query: (id) => {
        const author_id= localStorage.getItem("id")
        return{

          url: `/purchase/${id}`,
          method: "DELETE",
          params:{
            performed_by_id: author_id
          } 
        }
      },
      invalidatesTags: ["purchase_invoice", "supplier", "item"],
    }),

    // GET purchase invoice details
    getPurchaseInvoiceById: builder.query<PurchaseInvoiceResponse, string>({
      query: (invoice_id) => ({
        url: `/purchase/invoices/${invoice_id}`,
        method: "GET",
      }),
      providesTags: ["purchase_invoice"],
    }),

    // PAYMENTS: add payment to invoice
    addPurchaseInvoicePayment: builder.mutation<
      PaymentResponse,
      { invoice_id: string; data: PaymentCreate }
    >({
      query: ({ invoice_id, data }) => ({
        url: `/purchase/invoices/${invoice_id}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["purchase_invoice", "supplier"],
    }),

    // PAYMENTS: get all payments for an invoice
    getPurchaseInvoicePayments: builder.query<PaymentResponse[], string>({
      query: (invoice_id) => ({
        url: `/purchase/invoices/${invoice_id}/payments`,
        method: "GET",
      }),
      providesTags: ["purchase_invoice"],
    }),

    // PAYMENTS: delete a payment
    deletePayment: builder.mutation<SuccessResponse, string>({
      query: (payment_id) => ({
        url: `/purchase/payments/${payment_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase_invoice", "supplier"],
    }),

    // SUPPLIER: invoices for supplier
    getSupplierPurchaseInvoices: builder.query<
      PurchaseInvoiceListResponse,
      { supplier_id: number; params?: PurchaseInvoiceFilters }
    >({
      query: ({ supplier_id, params }) => ({
        url: `/purchase/suppliers/${supplier_id}/invoices`,
        method: "GET",
        params,
      }),
      providesTags: ["purchase_invoice", "supplier"],
    }),

    // SUPPLIER: balance
    getSupplierBalance: builder.query<SupplierBalance, number>({
      query: (supplier_id) => ({
        url: `/purchase/suppliers/${supplier_id}/balance`,
        method: "GET",
      }),
      providesTags: ["supplier"],
    }),

    // SUPPLIER: summary
    getSuppliersSummary: builder.query<SupplierSummaryResponse, void>({
      query: () => ({
        url: `/purchase/suppliers/summary`,
        method: "GET",
      }),
      providesTags: ["supplier"],
    }),

    // ITEM: stock summary
    getItemStockSummary: builder.query<ItemStockSummary, string>({
      query: (item_id) => ({
        url: `/purchase/items/${item_id}/stock`,
        method: "GET",
      }),
      providesTags: ["item"],
    }),

    // ITEM: stock history
    getItemStockHistory: builder.query<
      StockLedgerEntry[],
      { item_id: string; limit?: number }
    >({
      query: ({ item_id, limit }) => ({
        url: `/purchase/items/${item_id}/history`,
        method: "GET",
        params: limit ? { limit } : undefined,
      }),
      providesTags: ["item"],
    }),

    // STOCK LEDGER: list entries
    getStockLedger: builder.query<StockLedgerListResponse, StockLedgerFilters>({
      query: (params) => ({
        url: "/purchase/stock-ledger",
        method: "GET",
        params,
      }),
      providesTags: ["item"],
    }),
  }),
});

export const {
  useCreatePurchaseInvoiceMutation,
  useGetAllPurchaseInvoicesQuery,
  useGetPurchaseInvoiceByIdQuery,
  useAddPurchaseInvoicePaymentMutation,
  useGetPurchaseInvoicePaymentsQuery,
  useDeletePaymentMutation,
  useGetSupplierPurchaseInvoicesQuery,
  useGetSupplierBalanceQuery,
  useGetSuppliersSummaryQuery,
  useGetItemStockSummaryQuery,
  useGetItemStockHistoryQuery,
  useGetStockLedgerQuery,
  useDeletePurchaseInvoicesMutation,
  useUpdatePurchaseInvoicesMutation
} = purchaseInvoiceApi;

