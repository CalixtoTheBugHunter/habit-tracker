/**
 * Test utilities for navigator online/offline state mocking and event handling.
 */

/**
 * Sets the navigator.onLine property to a specific value.
 * 
 * This helper function allows tests to simulate online/offline states
 * by directly modifying the navigator.onLine property.
 * 
 * @param value - The online status to set (true for online, false for offline)
 */
export function setNavigatorOnline(value: boolean): void {
  Object.defineProperty(globalThis.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value,
  })
}

/**
 * Triggers a network event (online or offline) on the window object.
 * 
 * This helper function dispatches a network event that components
 * listening to 'online' or 'offline' events will receive.
 * 
 * @param eventType - The type of network event to trigger ('online' or 'offline')
 */
export function triggerNetworkEvent(eventType: 'online' | 'offline'): void {
  const event = new Event(eventType)
  window.dispatchEvent(event)
}

