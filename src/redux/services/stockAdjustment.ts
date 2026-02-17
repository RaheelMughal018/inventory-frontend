import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface AdjustStockRequest {
  item_id: number
  quantity: number
  unit_price: number
  reason: string
  notes?: string
}

export interface GetStockHistoryParams {
  item_id: number
  page?: number
  limit?: number
}

/* =========================
   Response Interfaces
========================= */
export interface StockAdjustment {
  id: number
  item_id: number
  admin_id: number
  admin_name?: string
  quantity: string | number
  avg_price: string | number
  reason: string
  notes?: string
  adjustment_date: string
  created_at: string
}

export interface StockAdjustmentResponse {
  data: StockAdjustment[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface AdjustStockResponse {
  data: {
    id: number
    name: string
    quantity: string | number
    avg_price: string | number
    message: string
  }
}

/* =========================
   API
========================= */

export const stockAdjustmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adjustStock: builder.mutation<AdjustStockResponse, AdjustStockRequest>({
      query: ({ item_id, ...data }) => ({
        url: `/items/${item_id}/adjust-stock`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['item', 'stock_adjustment']
    }),

    getStockHistory: builder.query<StockAdjustmentResponse, GetStockHistoryParams>({
      query: ({ item_id, ...params }) => ({
        url: `/items/${item_id}/stock-history`,
        method: 'GET',
        params,
      }),
      providesTags: ['stock_adjustment']
    }),
  }),
})

export const {
  useAdjustStockMutation,
  useGetStockHistoryQuery,
} = stockAdjustmentApi
