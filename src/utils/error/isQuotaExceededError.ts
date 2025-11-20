/**
 * Checks if an error is a quota exceeded error from IndexedDB or DOM storage.
 * 
 * This function handles various quota exceeded error formats:
 * - DOMException with name 'QuotaExceededError'
 * - DOMException with name 'NS_ERROR_DOM_QUOTA_REACHED'
 * - DOMException or error-like objects with code 22 (which is the quota exceeded error code)
 * 
 * @param error - The error to check
 * @returns true if the error is a quota exceeded error, false otherwise
 */
export function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error as { code?: number }).code === 22
    )
  }
  // Also check for error-like objects with code 22 (for edge cases)
  const errorLike = error as { code?: number; name?: string }
  return errorLike?.code === 22
}
