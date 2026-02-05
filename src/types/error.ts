/**
 * Standard API Error Response Types
 */

export interface ApiErrorData {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  status?: number;
  data?: ApiErrorData;
  message?: string;
}

export interface SerializedError {
  message?: string;
  code?: string;
  stack?: string;
}

export type RTKQueryError = ApiError | SerializedError;
