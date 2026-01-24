import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export interface CreateAdminRequest {
    name: string
    email: string
    password: string 
}

export interface LoginRequest{
    email: string
    password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    user_id: string
    email: string
    name: string
    role: string
  }
}


// export interface User {
//     user_id: string
//     name: string
//     email: string
// }


export const auth = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000/api/v1/auth',
    }),
    tagTypes: ['auth'],
    endpoints: (builder)=>({
        registerAdmin: builder.mutation<CreateAdminRequest>({
            query: (data)=>({
                url: 'register',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['auth']
        }),
         loginAdmin: builder.mutation<LoginResponse,LoginRequest>({
            query: (data)=>({
                url: 'login',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['auth']
        }),
         logoutAdmin: builder.mutation<{message: string}, void>({
            query: ()=>({
                url: 'logout',
                method: 'GET',
            }),
        })
    })
})

export const {useRegisterAdminMutation, useLoginAdminMutation, useLogoutAdminMutation} = auth;