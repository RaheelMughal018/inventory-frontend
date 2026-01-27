import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export enum ItemType{
  RAW_MATERIAL = "RAW_MATERIAL",
  FINAL_PRODUCT = "FINAL_PRODUCT" 
}
export enum ItemUnit{
  PCS = "PCS",
  SET = "SET" 
}
export interface GetItemsParams {
  search?: string
  skip?: number
  limit?: number
  category_id?: string
  item_type?: ItemType
}
export interface CreateItem {
  name: string
  type: ItemType
  unit_type: ItemUnit
  category_id: string

}

export interface Updateitem extends CreateItem {
  id: string
}

/* =========================
   Response Interfaces
========================= */

export interface ItemCategory {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Item {
    id: string
    name: string
    type: ItemType
    unit_type: ItemUnit
    category_id: string
    category: ItemCategory
    avg_price: number
    total_quantity: number
    created_at: string
    updated_at: string
  }
  
export interface ItemsResponse {
  total: number
  items: Item[]
}

  export interface DeleteResponse {
    message: string
  }

/* =========================
   API
========================= */

export const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createItem: builder.mutation<Item, CreateItem>({
      query: (data) => ({
        url: '/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags:['item']
    }),

    getAllItems: builder.query<ItemsResponse, GetItemsParams>({
      query: (params) => ({
        url: '/items',
        method: 'GET',
        params,
      }),
      providesTags:['item']
    }),

    getItemById: builder.query<Item, string>({
      query: (id) => ({
        url: `/items/${id}`,
        method: 'GET',
      }),
      providesTags:['item']
    }),

    updateItem: builder.mutation<Item, Updateitem>({
      query: ({ id, ...data }) => ({
        url: `/items/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags:['item']
    }),

    deleteItem: builder.mutation<DeleteResponse, string>({
      query: (id) => ({
        url: `/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags:['item']
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
