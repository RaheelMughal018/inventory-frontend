import { baseApi } from './baseApi'

export enum AccountType {
  BANK = "BANK",
  JAZZCASH = "JAZZCASH",
  EASYPAISA = "EASYPAISA",
  IN_HAND = "IN_HAND"
}

/* =========================
   Request Interfaces
========================= */
export interface GetAccountsParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  account_type?: AccountType
}

export interface CreateAccount {
  name: string
  account_type: AccountType
  account_number?: string
  bank_name?: string
  opening_balance?: number
}

export interface UpdateAccount {
  id: number
  name?: string
  account_number?: string
  bank_name?: string
}

/* =========================
   Response Interfaces
========================= */
export interface Account {
  id: number
  name: string
  account_type: string
  account_number: string | null
  bank_name: string | null
  opening_balance: string | number
  current_balance: string | number
  created_at: string
  updated_at: string
}

export interface AccountsResponse {
  data: Account[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAccount: builder.mutation<{ data: Account }, CreateAccount>({
      query: (data) => ({
        url: '/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['account']
    }),

    getAllAccounts: builder.query<AccountsResponse, GetAccountsParams>({
      query: (params) => ({
        url: '/accounts',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: Account[] | { data: Account[]; meta: AccountsResponse['meta'] } }) => {
        if (Array.isArray(response.data)) {
          return { data: response.data, meta: { currentPage: 1, totalPages: 1, totalItems: response.data.length, itemsPerPage: response.data.length } };
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
          return { data: response.data.data, meta: response.data.meta };
        }
        return { data: [], meta: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 30 } };
      },
      providesTags: ['account']
    }),

    getAccountById: builder.query<{ data: Account }, number>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'GET',
      }),
      providesTags: ['account']
    }),

    updateAccount: builder.mutation<{ data: Account }, UpdateAccount>({
      query: ({ id, ...data }) => ({
        url: `/accounts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['account']
    }),

    deleteAccount: builder.mutation<DeleteResponse, string | number>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['account']
    }),

    clearOpeningBalance: builder.mutation<
      { data: Account },
      { accountId: number; amount: number }
    >({
      query: ({ accountId, amount }) => ({
        url: `/accounts/${accountId}/clear-opening-balance`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['account']
    }),
  }),
})

export const {
  useCreateAccountMutation,
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useClearOpeningBalanceMutation,
} = accountApi
