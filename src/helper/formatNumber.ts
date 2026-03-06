/**
 * Format amount for display (no currency symbol, 2 decimals).
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format integer count.
 */
export function formatCount(count: number): string {
  return new Intl.NumberFormat("en-US").format(count);
}
