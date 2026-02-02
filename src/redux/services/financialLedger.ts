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
    user_id: string
    ref_type:string
    ref_id:string
    debit:number
    credit:number
    created_at: string
  }
  
  export interface FinancialLedgerResponse {
    count: number
    data: FinancialLedger[]
    totals: object
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
