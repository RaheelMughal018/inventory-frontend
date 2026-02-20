import { baseApi } from './baseApi'

/* =========================
   Enums
========================= */
export enum ProductionStatus {
  DRAFT = 'DRAFT',
  IN_PROCESS = 'IN_PROCESS',
  DONE = 'DONE',
}

/* =========================
   Request Interfaces
========================= */
export interface CreateProduction {
  recipe_id: number
  quantity: number
  batch_number: string
  notes?: string
}

export interface UpdateProduction {
  notes?: string
}

export interface ProductionIngredient {
  item_id: number
  quantity: number
}

export interface UpdateProductionIngredients {
  ingredients: ProductionIngredient[]
}

export interface CompleteProduction {
  serialNumbers: string[]
}

/* =========================
   Response Interfaces
========================= */
export interface ProductionIngredientResponse {
  id: number
  production_id: number
  item_id: number
  quantity: string | number
  is_from_recipe: boolean
  created_at: string
  updated_at: string
  item: {
    id: number
    name: string
    quantity: string | number
    avg_price: string | number
  }
}

export interface ProductionItem {
  id: number
  production_id: number
  item_id: number
  serial_number: string
  cost_price: string | number
  created_at: string
}

export interface Production {
  id: number
  batch_number: string
  recipe_id: number
  admin_id: number
  quantity: number
  status: ProductionStatus
  total_cost: string | number
  cost_per_unit: string | number
  start_date: string | null
  completion_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  recipe: {
    id: number
    name: string
    final_product_id: number
    final_product: {
      id: number
      name: string
      quantity: string | number
      avg_price: string | number
      item_type: string
    }
  }
  admin: {
    id: number
    name: string
  }
  production_ingredients: ProductionIngredientResponse[]
  production_items: ProductionItem[]
}

export interface FeasibilityIngredient {
  item_id: number
  item_name: string
  required: number
  available: number
  sufficient: boolean
  avg_price: number
  line_cost: number
}

export interface Feasibility {
  canProduce: boolean
  ingredients: FeasibilityIngredient[]
  total_estimated_cost: number
}

/* =========================
   API
========================= */
export const productionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create production (DRAFT)
    createProduction: builder.mutation<{ data: Production }, CreateProduction>({
      query: (data) => ({ url: '/productions', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'production', id: 'LIST' }],
    }),

    // Get all productions (with optional status filter)
    getAllProductions: builder.query<{ data: Production[] }, ProductionStatus | void>({
      query: (status) => ({
        url: '/productions',
        method: 'GET',
        params: status ? { status } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: 'production' as const, id: p.id })),
              { type: 'production', id: 'LIST' },
            ]
          : [{ type: 'production', id: 'LIST' }],
    }),

    // Get production by ID
    getProductionById: builder.query<{ data: Production }, number>({
      query: (id) => ({ url: `/productions/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'production', id }],
    }),

    // Get production feasibility
    getProductionFeasibility: builder.query<{ data: Feasibility }, number>({
      query: (id) => ({ url: `/productions/${id}/feasibility`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'production', id: `feasibility-${id}` }],
    }),

    // Update production (notes only, DRAFT only)
    updateProduction: builder.mutation<{ data: Production }, { id: number; data: UpdateProduction }>({
      query: ({ id, data }) => ({
        url: `/productions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'production', id },
        { type: 'production', id: 'LIST' },
      ],
    }),

    // Update production ingredients
    updateProductionIngredients: builder.mutation<
      { data: Production },
      { id: number; data: UpdateProductionIngredients }
    >({
      query: ({ id, data }) => ({
        url: `/productions/${id}/ingredients`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'production', id },
        { type: 'production', id: 'LIST' },
        { type: 'production', id: `feasibility-${id}` },
      ],
    }),

    // Start production (DRAFT → IN_PROCESS)
    startProduction: builder.mutation<{ data: Production }, number>({
      query: (id) => ({
        url: `/productions/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'production', id },
        { type: 'production', id: 'LIST' },
        'item', // Invalidate items because stock is deducted
      ],
    }),

    // Complete production (IN_PROCESS → DONE)
    completeProduction: builder.mutation<{ data: Production }, { id: number; data: CompleteProduction }>({
      query: ({ id, data }) => ({
        url: `/productions/${id}/complete`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'production', id },
        { type: 'production', id: 'LIST' },
        'item', // Invalidate items because final products are added
      ],
    }),

    // Delete production (DRAFT only)
    deleteProduction: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/productions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'production', id }, { type: 'production', id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateProductionMutation,
  useGetAllProductionsQuery,
  useGetProductionByIdQuery,
  useGetProductionFeasibilityQuery,
  useUpdateProductionMutation,
  useUpdateProductionIngredientsMutation,
  useStartProductionMutation,
  useCompleteProductionMutation,
  useDeleteProductionMutation,
} = productionApi
