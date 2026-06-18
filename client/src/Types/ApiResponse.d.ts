/**
 * Mirrors the ApiResponse<T> envelope returned by every API endpoint.
 *
 * Every response — success or error — has this exact shape, so the
 * client can always safely deserialize into ApiResponse<T>.
 */
export interface ApiResponse<T> {
  /** true for 2xx responses, false for all errors */
  success: boolean
  /** Human-readable summary of the outcome */
  message: string
  /** Response payload; null on error responses */
  data: T | null
  /** Validation errors keyed by property name, each with one or more error codes */
  errors: Record<string, string[]>
}
