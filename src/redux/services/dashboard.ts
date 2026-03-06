import { baseApi } from './baseApi'

/* =========================
   Query params (match OverviewQueryDto)
========================= */
export interface DashboardOverviewParams {
  /** YYYY-MM-DD. Date for "today" metrics. Omitted = server current date. */
  date?: string
  /** 1–90. Number of days for trends. Default 7. */
  days?: number
}

/* =========================
   Response types (match API)
========================= */
export interface AmountOnly {
  amount: number
}

export interface CountOnly {
  count: number
}

export interface DashboardToday {
  sales: { amount: number; count: number }
  cashCollected: AmountOnly
  repairsCompleted: CountOnly
}

export interface AccountBalance {
  id: number
  name: string
  type: string
  balance: number
}

export interface CashInHand {
  amount: number
  accounts: AccountBalance[]
}

export interface DashboardFinancial {
  cashInHand: CashInHand
  bankBalance: AmountOnly
  receivable: { amount: number; customerCount: number }
  payable: { amount: number; supplierCount: number }
  netPosition: AmountOnly
}

export interface LowStockItem {
  id: number
  name: string
  quantity: number
}

export interface DashboardInventory {
  totalValue: AmountOnly
  lowStock: { count: number; items: LowStockItem[] }
  outOfStock: { count: number; items: LowStockItem[] }
  inProduction: { batchCount: number; unitCount: number }
}

export interface TrendPoint {
  date: string
  amount?: number
  count?: number
}

export interface DashboardTrends {
  sales: TrendPoint[]
  purchases: TrendPoint[]
  repairs: TrendPoint[]
}

export interface DashboardOverview {
  today: DashboardToday
  financial: DashboardFinancial
  inventory: DashboardInventory
  trends: DashboardTrends
}

/* =========================
   API
========================= */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<DashboardOverview, DashboardOverviewParams | void>({
      query: (params = {}) => {
        const { date, days } = params ?? {}
        return {
          url: '/dashboard/overview',
          method: 'GET',
          params: {
            ...(date && { date }),
            ...(days != null && days >= 1 && days <= 90 && { days }),
          },
        }
      },
      transformResponse: (
        raw: { statusCode?: number; message?: string; data?: DashboardOverview }
      ) => {
        const data = (raw as { data?: DashboardOverview }).data
        if (data && typeof data === 'object' && 'today' in data) return data
        throw new Error('Invalid dashboard overview response')
      },
      providesTags: ['dashboard'],
    }),
  }),
})

export const { useGetOverviewQuery } = dashboardApi
