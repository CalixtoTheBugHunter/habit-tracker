/**
 * Test utilities for IndexedDB mocking and async request handling.
 */

interface MockRequest {
  result: unknown
  error: Error | null
  onsuccess: ((event: { target: { result: unknown } }) => void) | null
  onerror: ((event: { target: { error: Error } }) => void) | null
  readyState: string
}

/**
 * Triggers a successful IndexedDB request event.
 * 
 * This helper function properly handles the async nature of IndexedDB requests
 * by allowing the promise chain to settle before triggering the success event,
 * and then allowing handlers to process after the event is triggered.
 * 
 * @param request - The mock request object
 * @param result - The result value to set on the request
 */
export async function triggerIDBRequestSuccess<T>(
  request: MockRequest,
  result: T
): Promise<void> {
  await Promise.resolve() // Allow promise chain to settle
  await Promise.resolve() // Allow promise chain to settle again
  request.result = result
  if (request.onsuccess) {
    request.onsuccess({ target: { result } })
  }
  await Promise.resolve() // Allow handlers to process
}

/**
 * Triggers an error IndexedDB request event.
 * 
 * This helper function properly handles the async nature of IndexedDB requests
 * by allowing the promise chain to settle before triggering the error event,
 * and then allowing handlers to process after the event is triggered.
 * 
 * @param request - The mock request object
 * @param error - The error to set on the request
 */
export async function triggerIDBRequestError(
  request: MockRequest,
  error: Error
): Promise<void> {
  await Promise.resolve() // Allow promise chain to settle
  await Promise.resolve() // Allow promise chain to settle again
  request.error = error
  if (request.onerror) {
    request.onerror({ target: { error } })
  }
  await Promise.resolve() // Allow handlers to process
}

