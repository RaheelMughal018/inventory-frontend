import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export enum ItemType {
  RAW = "RAW",
  FINAL = "FINAL" 
}

export enum UnitType {
  PCS = "PCS",
  SET = "SET"
}

export interface GetItemsParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category_id?: number
  item_type?: ItemType
  stock_status?: 'in_stock' | 'out_of_stock'
}

export interface CreateItem {
  name: string
  item_type: ItemType
  unit_type: UnitType
  category_id: number
}

export interface UpdateItem {
  id: number
  name?: string
  category_id?: number
}

/* =========================
   Response Interfaces
========================= */

export interface Item {
  id: number
  name: string
  item_type: ItemType
  unit_type: UnitType
  category_id: number
  quantity: string | number
  avg_price: string | number
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: string
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ItemsResponse {
  data: Item[]
  meta?: PaginationMeta
}

export interface DeleteResponse {
  message: string
}

/* =========================
   API
========================= */

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createItem: builder.mutation<{ data: Item }, CreateItem>({
      query: (data) => ({
        url: '/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['item']
    }),

    getAllItems: builder.query<ItemsResponse, GetItemsParams>({
      query: ({ page = 1, limit = 30, search, sortBy, sortOrder, category_id, item_type, stock_status }) => ({
        url: '/items',
        method: 'GET',
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
          ...(category_id && { category_id }),
          ...(item_type && { item_type }),
          ...(stock_status && { stock_status }),
        },
      }),
      transformResponse: (response: { data: Item[] | { data: Item[]; meta: PaginationMeta } }) => {
        // Handle wrapped response
        if (Array.isArray(response.data)) {
          return { data: response.data, meta: undefined };
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          return { data: response.data.data, meta: response.data.meta };
        }
        return { data: [], meta: undefined };
      },
      providesTags: ['item']
    }),

    getItemById: builder.query<{ data: Item }, number>({
      query: (id) => ({
        url: `/items/${id}`,
        method: 'GET',
      }),
      providesTags: ['item']
    }),

    updateItem: builder.mutation<{ data: Item }, UpdateItem>({
      query: ({ id, ...data }) => ({
        url: `/items/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['item']
    }),

    deleteItem: builder.mutation<{ data: DeleteResponse }, number>({
      query: (id) => ({
        url: `/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['item']
    }),
  }),
})

export const {
  useCreateItemMutation,
  useGetAllItemsQuery,
  useGetItemByIdQuery,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemApi
