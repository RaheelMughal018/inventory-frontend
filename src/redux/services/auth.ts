import { baseApi } from './baseApi'



export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerAdmin: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['auth'],
    }),

    loginAdmin: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['auth'],
    }),

    logoutAdmin: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'GET',
      }),
      invalidatesTags: ['auth'],
    }),
    
  }),
})

export const {
  useRegisterAdminMutation,
  useLoginAdminMutation,
  useLogoutAdminMutation,
} = authApi