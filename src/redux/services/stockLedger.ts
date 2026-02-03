import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface GetStockLedgerParams {
  search?: string
  skip?: number
  limit?: number
  item_id?: string
  ref_type?: string
  start_date?: string
  end_date?: string
}

/* =========================
   Response Interfaces
========================= */

export interface StockLedgerItem {
  id: string
  name: string
}

export interface StockLedgerEntry {
  id: string
  item_id: string
  ref_type: string
  ref_id: string
  qty_in: number
  qty_out: number
  unit_price: string | number
  created_at: string
  item: StockLedgerItem
}

export interface StockLedgerTotals {
  total_qty_in?: number
  total_qty_out?: number
}

export interface StockLedgerResponse {
  count: number
  data: StockLedgerEntry[]
  total_dic: StockLedgerTotals
}

/* =========================
   API
========================= */

export const stockLedgerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllStockLedger: builder.query<StockLedgerResponse, GetStockLedgerParams>({
      query: (params) => ({
        url: '/stock-ledger',
        method: 'GET',
        params,
      }),
      providesTags: ['stock-ledger'],
    }),
  }),
})

export const {
  useGetAllStockLedgerQuery,
} = stockLedgerApi
