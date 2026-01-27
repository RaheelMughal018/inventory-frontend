import { baseApi } from './baseApi'

export enum AccountType {
   CASH = "CASH",
    BANK = "BANK",
    JAZZCASH = "JAZZCASH",
    EASYPAISA = "EASYPAISA"

}
/* =========================
   Request Interfaces
========================= */
export interface GetAccountsParams {
  search?: string
  skip?: number
  limit?: number
}

export interface CreateAccount {
  name: string
  type: AccountType
}

export interface UpdateAccount extends CreateAccount {
  id: string
}

/* =========================
   Response Interfaces
========================= */

export interface Account {
    id: string
    name: string
    type: AccountType
    created_at: string
  }
  
  export interface AccountsResponse {
    total: number
    accounts: Account[]
  }

  export interface DeleteAccountResponse{
    message: string
  }

/* =========================
   API
========================= */

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAccount: builder.mutation<Account, CreateAccount>({
      query: (data) => ({
        url: '/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags:['account']
    }),

    getAllAccounts: builder.query<AccountsResponse, GetAccountsParams>({
      query: (params) => ({
        url: '/accounts',
        method: 'GET',
        params,

      }),
      providesTags:['account']
    }),

    getAccountById: builder.query<Account, number>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'GET',
      }),
      providesTags:['account']
    }),

    updateAccount: builder.mutation<Account, UpdateAccount>({
      query: ({ id, ...data }) => ({
        url: `/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags:['account']

    }),
    deleteAccount: builder.mutation<DeleteAccountResponse, string|number>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags:['account']

    }),
  }),
})

export const {
  useCreateAccountMutation,
  useGetAllAccountsQuery,
  useGetAccountByIdQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi
