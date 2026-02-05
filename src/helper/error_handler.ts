import { toast } from "sonner";
import { ApiError, SerializedError, RTKQueryError } from "../types/error";

/**
 * Checks if an error is an API error with data property
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as ApiError).data === "object"
  );
}

/**
 * Checks if an error is a serialized error
 */
function isSerializedError(error: unknown): error is SerializedError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as SerializedError).message === "string"
  );
}

/**
 * Extracts error message from various error formats
 * Handles: error.data.message, error.data.detail, error.message, error.data.error
 */
export function extractErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const { data } = error;
    
    // Try different error message properties from backend
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    
    // Handle validation errors
    if (data?.errors && typeof data.errors === "object") {
      const errorMessages = Object.values(data.errors)
        .flat()
        .filter(Boolean)
        .join(", ");
      if (errorMessages) return errorMessages;
    }
  }

  if (isSerializedError(error)) {
    return error.message || "An unknown error occurred";
  }

  // Fallback for other error types
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Handles API errors by extracting the message and showing a toast
 * @param error - The error from RTK Query or any API call
 * @param fallbackMessage - Optional fallback message if extraction fails
 * @returns The extracted error message
 */
export function handleApiError(
  error: unknown,
  fallbackMessage?: string
): string {
  const errorMessage = extractErrorMessage(error);
  const displayMessage = errorMessage || fallbackMessage || "An error occurred";
  
  toast.error(displayMessage);
  
  // Log error in development for debugging
  if (import.meta.env.DEV) {
    console.error("API Error:", error);
  }
  
  return displayMessage;
}

/**
 * Handles API success by showing a success toast
 * @param message - Success message to display
 */
export function handleApiSuccess(message: string): void {
  toast.success(message);
}

/**
 * Handles query errors from RTK Query hooks
 * @param error - Error from useQuery hook
 * @param fallbackMessage - Fallback message if extraction fails
 * @returns The extracted error message or undefined if no error
 */
export function handleQueryError(
  error: unknown,
  fallbackMessage?: string
): string | undefined {
  if (!error) return undefined;
  
  const errorMessage = extractErrorMessage(error);
  return errorMessage || fallbackMessage || "Failed to load data";
}

/**
 * Type guard for checking if a value is an RTK Query error
 */
export function isRTKQueryError(error: unknown): error is RTKQueryError {
  return isApiError(error) || isSerializedError(error);
}
