import { baseApi } from './baseApi'

/* =========================
   Request Interfaces
========================= */
export interface ProductionFeasibilityRequest {
  final_product_id: string
  quantity: number
}

export interface ProductionDraftCreate {
  final_product_id: string
  quantity: number
  serial_numbers: string[]
}

/* =========================
   Response Interfaces
========================= */
export interface RawItemRequirement {
  raw_item_id: string
  raw_item_name: string
  quantity_required: number | string
  quantity_per_unit: number | string
  avg_price: number | null
  available_quantity: number
  sufficient: boolean
}

export interface ProductionPreviewResponse {
  final_product_id: string
  final_product_name: string
  quantity: number
  raw_requirements: RawItemRequirement[]
  total_estimated_cost: number
}

export interface InsufficientItem {
  raw_item_id: string
  raw_item_name: string
  required_quantity: number
  available_quantity: number
  shortfall: number
}

export interface ProductionFeasibilityResponse {
  feasible: boolean
  requested_quantity: number
  max_producible_quantity: number
  insufficient_items: InsufficientItem[]
  message: string
}

export type ProductionStageEnum = 'DRAFT' | 'IN_PROCESS' | 'DONE'

export interface ProductionBatchResponse {
  id: string
  final_product_id: string
  final_product_name: string
  quantity_produced: number
  stage: ProductionStageEnum
  serial_numbers: string[]
  created_at: string
  updated_at: string | null
}

export interface ProductionBatchListResponse {
  total: number
  batches: ProductionBatchResponse[]
}

export interface ListBatchesParams {
  skip?: number
  limit?: number
  final_product_id?: string
  stage?: ProductionStageEnum
}

export interface RecipeItem {
  id: number
  raw_item_id: string
  raw_item_name: string
  quantity_per_unit: string | number
  avg_price: string | number
  total_quantity: number
}

export interface ProductionBatchDetailResponse {
  id: string
  final_product_id: string
  final_product_name: string
  quantity_produced: number
  stage: ProductionStageEnum
  serial_numbers: string[]
  recipe_items: RecipeItem[]
  total_estimated_cost: string | number
  cost_per_unit: string | number
  created_at: string
  updated_at: string
}

export interface UpdateBatchRecipeItem {
  raw_item_id: string
  quantity_per_unit: number
}

export interface UpdateProductionBatch {
  quantity?: number
  serial_numbers?: string[]
  recipe_items?: UpdateBatchRecipeItem[]
}

/* =========================
   API
========================= */
export const productionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    productionPreview: builder.query<
      ProductionPreviewResponse,
      { final_product_id: string; quantity: number }
    >({
      query: ({ final_product_id, quantity }) => ({
        url: '/production/preview',
        method: 'GET',
        params: { final_product_id, quantity },
      }),
    }),

    productionFeasibility: builder.mutation<
      ProductionFeasibilityResponse,
      ProductionFeasibilityRequest
    >({
      query: (body) => ({ url: '/production/feasibility', method: 'POST', body }),
    }),

    createProductionDraft: builder.mutation<ProductionBatchResponse, ProductionDraftCreate>({
      query: (body) => ({ url: '/production/draft', method: 'POST', body }),
      invalidatesTags: [{ type: 'production', id: 'LIST' }],
    }),

    executeProductionDraft: builder.mutation<ProductionBatchResponse, string>({
      query: (batchId) => ({
        url: `/production/batches/${batchId}/execute`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, batchId) => [
        { type: 'production', id: batchId },
        { type: 'production', id: 'LIST' },
        'item',
      ],
    }),

    completeProductionBatch: builder.mutation<ProductionBatchResponse, string>({
      query: (batchId) => ({
        url: `/production/batches/${batchId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, batchId) => [
        { type: 'production', id: batchId },
        { type: 'production', id: 'LIST' },
        'item',
      ],
    }),

    listProductionBatches: builder.query<ProductionBatchListResponse, ListBatchesParams | void>({
      query: (params = {}) => ({
        url: '/production/batches',
        method: 'GET',
        params: { skip: 0, limit: 100, ...params },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.batches.map((b) => ({ type: 'production' as const, id: b.id })),
              { type: 'production', id: 'LIST' },
            ]
          : [{ type: 'production', id: 'LIST' }],
    }),

    getProductionBatch: builder.query<ProductionBatchResponse, string>({
      query: (batchId) => ({ url: `/production/batches/${batchId}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'production', id }],
    }),

    getProductionBatchDetail: builder.query<ProductionBatchDetailResponse, string>({
      query: (batchId) => ({ url: `/production/batches/${batchId}/detail`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'production', id }],
    }),

    updateProductionBatch: builder.mutation<
      ProductionBatchDetailResponse,
      { batchId: string; data: UpdateProductionBatch }
    >({
      query: ({ batchId, data }) => ({
        url: `/production/batches/${batchId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _err, { batchId }) => [
        { type: 'production', id: batchId },
        { type: 'production', id: 'LIST' },
      ],
    }),

    deleteProductionBatch: builder.mutation<void, string>({
      query: (batchId) => ({
        url: `/production/batches/${batchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, batchId) => [
        { type: 'production', id: batchId },
        { type: 'production', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useProductionPreviewQuery,
  useProductionFeasibilityMutation,
  useCreateProductionDraftMutation,
  useExecuteProductionDraftMutation,
  useCompleteProductionBatchMutation,
  useListProductionBatchesQuery,
  useGetProductionBatchQuery,
  useGetProductionBatchDetailQuery,
  useUpdateProductionBatchMutation,
  useDeleteProductionBatchMutation,
} = productionApi
