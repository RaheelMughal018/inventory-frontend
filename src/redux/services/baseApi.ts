// redux/services/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/v1',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithAuthRedirect = async (args: Parameters<typeof baseQuery>[0], api: Parameters<typeof baseQuery>[1], extraOptions: Parameters<typeof baseQuery>[2]) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id')
    window.location.href = '/signin'
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthRedirect,
  tagTypes: ['auth', 'supplier', 'customer', 'category', 'item','account', 'purchase_invoice', 'financial-ledger', 'stock-ledger', 'expense_category', 'expense'],
  endpoints: () => ({}), 
})
