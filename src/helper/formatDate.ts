/**
 * Format API date (YYYY-MM-DD) to short label for charts (e.g. "Mar 4").
 */
export function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
