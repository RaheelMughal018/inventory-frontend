// redux/services/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api/v1'
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://inventory-backend-copy-production.up.railway.app/api/v1'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Important: Include cookies in requests
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
 * - Automatically attempts to refresh the token on 401 Unauthorized
 * - Redirects to signin if refresh fails
 * - All other errors are passed through to be handled at the component level
 */
const baseQueryWithAuthRedirect = async (
  args: Parameters<typeof baseQuery>[0],
  api: Parameters<typeof baseQuery>[1],
  extraOptions: Parameters<typeof baseQuery>[2]
) => {
  let result = await baseQuery(args, api, extraOptions)

  // If we get a 401 error, try to refresh the token
  if (result.error?.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      // Handle wrapped response: { statusCode, message, data: { accessToken } }
      const responseData = refreshResult.data as { data?: { accessToken: string }; accessToken?: string }
      const accessToken = responseData.data?.accessToken || responseData.accessToken
      
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        // Retry the original query with the new token
        result = await baseQuery(args, api, extraOptions)
      } else {
        // Refresh failed, clear auth and redirect to signin
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        localStorage.removeItem('id')
        window.location.href = '/signin'
      }
    } else {
      // Refresh failed, clear auth and redirect to signin
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('id')
      window.location.href = '/signin'
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthRedirect,
  tagTypes: ['auth', 'supplier', 'customer', 'category', 'item','account', 'purchase_invoice', 'financial-ledger', 'stock-ledger', 'expense_category', 'expense', 'recipe', 'production', 'stock_adjustment'],
  endpoints: () => ({}), 
})
