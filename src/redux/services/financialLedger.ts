import { User } from './auth'
import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetFinancialLedgerParams {
  search?: string
  skip?: number
  limit?: number
  user_id?:number
  start_date?: string
  end_date?: string
}

/* =========================
   Response Interfaces
========================= */

export interface FinancialLedger {
  id: number
  user_id: number
  account_id?: string | number
  account_name?: string
  ref_type: string
  ref_id: string
  debit: string | number
  credit: string | number
  created_at: string
  user: User
}

  export interface FinancialLedgerTotals {
    total_debit?: number
    total_credit?: number
  }

  export interface FinancialLedgerResponse {
    count: number
    data: FinancialLedger[]
    total_dic: FinancialLedgerTotals
  }


/* =========================
   API
========================= */

export const financialLedgerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   

    getAllFinancialLedger: builder.query<FinancialLedgerResponse, GetFinancialLedgerParams>({
      query: (params) => ({
        url: '/financial-ledger',
        method: 'GET',
        params,

      }),
      providesTags:['financial-ledger']
    }),

   
  }),
})

export const {
  useGetAllFinancialLedgerQuery,
} = financialLedgerApi
