import { baseApi } from "./baseApi";

/* =========================
   Request Interfaces
========================= */

export type AllocationMethod = "FIFO" | "LIFO" | "PROPORTIONAL";

export interface CreateDirectPayment {
  supplier_id: number;
  amount: number;
  account_id: string;
  allocation_method?: AllocationMethod;
  notes?: string;
}

export interface SimulatePaymentParams {
  supplier_id: number;
  amount: number;
  allocation_method?: AllocationMethod;
}

/* =========================
   Response Interfaces
========================= */

export interface AllocationItem {
  invoice_id: string;
  invoice_date: string;
  invoice_total: number;
  previous_paid: number;
  allocation_amount: number;
  remaining_balance: number;
  status: "PAID" | "PARTIAL";
}

export interface DirectPaymentResponse {
  message: string;
  payment_id: string;
  supplier_id: number;
  total_allocated: number;
  remaining_amount: number;
  allocations: AllocationItem[];
}

export interface SupplierOutstandingBalance {
  supplier_id: number;
  supplier_name: string;
  total_debit: number;
  total_credit: number;
  outstanding_balance: number;
  unpaid_invoices: {
    invoice_id: string;
    created_at: string;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
    status: "UNPAID" | "PARTIAL";
  }[];
}

export interface PaymentSimulation {
  message: string;
  payment_amount: number;
  allocation_method: AllocationMethod;
  invoices_affected: number;
  allocations: AllocationItem[];
}

/* =========================
   API
========================= */

export const directPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---- CREATE PAYMENT ---- */
    createDirectPayment: builder.mutation<
      DirectPaymentResponse,
      CreateDirectPayment
    >({
      query: (data) => {

        const id = localStorage.getItem("id")
        return{
        url: "/payment-supplier",
        method: "POST",
        body: data,
        params:{
          performed_by_id: id
        }
      }
    }, 
      invalidatesTags: ["supplier", "purchase_invoice"],
    }),

    /* ---- SUPPLIER OUTSTANDING ---- */
    getSupplierOutstanding: builder.query<
      SupplierOutstandingBalance,
      number
    >({
      query: (supplierId) => ({
        url: `/payment-supplier/suppliers/${supplierId}/outstanding`,
        method: "GET",
      }),
      providesTags: ["supplier"],
    }),

    /* ---- SIMULATE PAYMENT ---- */
    simulatePayment: builder.query<PaymentSimulation, SimulatePaymentParams>({
      query: ({ supplier_id, amount, allocation_method = "FIFO" }) => ({
        url: `/oayment-supplier/suppliers/${supplier_id}/simulate`,
        method: "GET",
        params: { amount, allocation_method },
      }),
    }),
  }),
});

export const {
  useCreateDirectPaymentMutation,
  useGetSupplierOutstandingQuery,
  useLazySimulatePaymentQuery,
} = directPaymentApi;
