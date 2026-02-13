// redux/services/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API URL from environment variables with fallback
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://inventory-backend-copy-production.up.railway.app/api/v1'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

/**
 * Base query wrapper that handles authentication errors globally
 * - Automatically redirects to signin on 401 Unauthorized
 * - Clears auth tokens from localStorage
 * - All other errors are passed through to be handled at the component level
 */
const baseQueryWithAuthRedirect = async (args: Parameters<typeof baseQuery>[0], api: Parameters<typeof baseQuery>[1], extraOptions: Parameters<typeof baseQuery>[2]) => {
  const result = await baseQuery(args, api, extraOptions)

  // Global 401 handler - redirect to signin
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
  tagTypes: ['auth', 'supplier', 'customer', 'category', 'item','account', 'purchase_invoice', 'financial-ledger', 'stock-ledger', 'expense_category', 'expense', 'recipe', 'production'],
  endpoints: () => ({}), 
})
