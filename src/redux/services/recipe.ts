import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface RecipeItemCreate {
  raw_item_id: string
  quantity_per_unit: number
}

export interface RecipeCreate {
  final_product_id: string
  name?: string
  items: RecipeItemCreate[]
}

export interface RecipeUpdate {
  name?: string
  items?: RecipeItemCreate[]
}

/* =========================
   Response Interfaces
========================= */
export interface RecipeItemResponse {
  id: number
  raw_item_id: string
  raw_item_name: string
  quantity_per_unit: string
  avg_price: string | null
  amount_per_unit: string
  total_quantity: number
}

export interface RecipeResponse {
  id: string
  final_product_id: string
  final_product_name: string
  name: string | null
  items: RecipeItemResponse[]
  total_cost_per_unit: string | null
  created_at: string
  updated_at: string
}

export interface RecipeListResponse {
  total: number
  recipes: RecipeResponse[]
}

export interface GetRecipesParams {
  skip?: number
  limit?: number
  search?: string
}

/* =========================
   API
========================= */
export const recipeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRecipes: builder.query<RecipeListResponse, GetRecipesParams | void>({
      query: (params = {}) => ({
        url: '/recipes',
        method: 'GET',
        params: { skip: 0, limit: 100, ...params },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.recipes.map((r) => ({ type: 'recipe' as const, id: r.id })),
              { type: 'recipe', id: 'LIST' },
            ]
          : [{ type: 'recipe', id: 'LIST' }],
    }),

    getRecipeById: builder.query<RecipeResponse, string>({
      query: (id) => ({ url: `/recipes/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'recipe', id }],
    }),

    getRecipeByProductId: builder.query<RecipeResponse, string>({
      query: (finalProductId) => ({
        url: `/recipes/product/${finalProductId}`,
        method: 'GET',
      }),
      providesTags: (_result, _err, id) => [{ type: 'recipe', id: `product-${id}` }],
    }),

    createRecipe: builder.mutation<RecipeResponse, RecipeCreate>({
      query: (data) => ({ url: '/recipes', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'recipe', id: 'LIST' }],
    }),

    updateRecipe: builder.mutation<RecipeResponse, { recipeId: string; data: RecipeUpdate }>({
      query: ({ recipeId, data }) => ({
        url: `/recipes/${recipeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _err, { recipeId }) => [
        { type: 'recipe', id: recipeId },
        { type: 'recipe', id: 'LIST' },
      ],
    }),

    deleteRecipe: builder.mutation<void, string>({
      query: (recipeId) => ({ url: `/recipes/${recipeId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'recipe', id }, { type: 'recipe', id: 'LIST' }],
    }),
  }),
})

export const {
  useListRecipesQuery,
  useGetRecipeByIdQuery,
  useGetRecipeByProductIdQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = recipeApi
