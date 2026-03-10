import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface RecipeIngredient {
  item_id: number
  quantity: number
}

export interface CreateRecipe {
  name: string
  description?: string
  final_product_id: number
  ingredients: RecipeIngredient[]
  extra_expenses?: number
}

export interface UpdateRecipe {
  name?: string
  description?: string
  ingredients?: RecipeIngredient[]
  extra_expenses?: number
}

export interface AddIngredient {
  item_id: number
  quantity: number
}

export interface UpdateIngredient {
  quantity: number
}

/* =========================
   Response Interfaces
========================= */
export interface RecipeIngredientResponse {
  id: number
  recipe_id: number
  item_id: number
  quantity: string | number
  created_at: string
  updated_at: string
  item: {
    id: number
    name: string
    avg_price: string | number
    quantity: string | number
  }
}

export interface Recipe {
  id: number
  name: string
  description: string | null
  final_product_id: number
  created_at: string
  updated_at: string
  extra_expenses?: number
  final_product: {
    id: number
    name: string
    item_type: string
    quantity: string | number
    avg_price: string | number
  }
  ingredients: RecipeIngredientResponse[]
}

export interface CostBreakdown {
  item_id: number
  item_name: string
  quantity: number
  avg_price: number
  line_cost: number
}

export interface RecipeCost {
  cost_per_unit: number
  breakdown: CostBreakdown[]
}

/* =========================
   API
========================= */
export const recipeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all recipes
    getAllRecipes: builder.query<{ data: Recipe[] }, void>({
      query: () => ({
        url: '/recipes',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((r) => ({ type: 'recipe' as const, id: r.id })),
              { type: 'recipe', id: 'LIST' },
            ]
          : [{ type: 'recipe', id: 'LIST' }],
    }),

    // Get recipe by ID
    getRecipeById: builder.query<{ data: Recipe }, number>({
      query: (id) => ({ url: `/recipes/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'recipe', id }],
    }),

    // Get recipe cost per unit
    getRecipeCost: builder.query<{ data: RecipeCost }, number>({
      query: (id) => ({ url: `/recipes/${id}/cost`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'recipe', id: `cost-${id}` }],
    }),

    // Create recipe
    createRecipe: builder.mutation<{ data: Recipe }, CreateRecipe>({
      query: (data) => ({ url: '/recipes', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'recipe', id: 'LIST' }, 'item'],
    }),

    // Update recipe
    updateRecipe: builder.mutation<{ data: Recipe }, { id: number; data: UpdateRecipe }>({
      query: ({ id, data }) => ({
        url: `/recipes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'recipe', id },
        { type: 'recipe', id: 'LIST' },
      ],
    }),

    // Delete recipe
    deleteRecipe: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/recipes/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'recipe', id }, { type: 'recipe', id: 'LIST' }],
    }),

    // Add ingredient to recipe
    addIngredient: builder.mutation<{ data: Recipe }, { id: number; data: AddIngredient }>({
      query: ({ id, data }) => ({
        url: `/recipes/${id}/ingredients`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'recipe', id },
        { type: 'recipe', id: 'LIST' },
        { type: 'recipe', id: `cost-${id}` },
      ],
    }),

    // Update ingredient in recipe
    updateIngredient: builder.mutation<
      { data: Recipe },
      { id: number; itemId: number; data: UpdateIngredient }
    >({
      query: ({ id, itemId, data }) => ({
        url: `/recipes/${id}/ingredients/${itemId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'recipe', id },
        { type: 'recipe', id: 'LIST' },
        { type: 'recipe', id: `cost-${id}` },
      ],
    }),

    // Remove ingredient from recipe
    removeIngredient: builder.mutation<{ data: Recipe }, { id: number; itemId: number }>({
      query: ({ id, itemId }) => ({
        url: `/recipes/${id}/ingredients/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'recipe', id },
        { type: 'recipe', id: 'LIST' },
        { type: 'recipe', id: `cost-${id}` },
      ],
    }),
  }),
})

export const {
  useGetAllRecipesQuery,
  useGetRecipeByIdQuery,
  useGetRecipeCostQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useAddIngredientMutation,
  useUpdateIngredientMutation,
  useRemoveIngredientMutation,
} = recipeApi
