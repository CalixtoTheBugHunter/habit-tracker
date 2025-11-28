import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { registerServiceWorker, unregisterServiceWorker } from './registerServiceWorker'

describe('registerServiceWorker', () => {
  let originalServiceWorker: ServiceWorkerContainer | undefined
  let originalReadyState: string
  let mockRegister: ReturnType<typeof vi.fn>
  let mockGetRegistrations: ReturnType<typeof vi.fn>
  let mockUnregister: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalServiceWorker = globalThis.navigator.serviceWorker
    originalReadyState = document.readyState

    mockRegister = vi.fn()
    mockGetRegistrations = vi.fn()
    mockUnregister = vi.fn()

    const mockRegistration = {
      scope: '/',
      installing: null,
      waiting: null,
      active: null,
      addEventListener: vi.fn(),
      unregister: mockUnregister,
    }

    mockRegister.mockResolvedValue(mockRegistration)
    mockGetRegistrations.mockResolvedValue([mockRegistration])

    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        register: mockRegister,
        getRegistrations: mockGetRegistrations,
        controller: null,
        addEventListener: vi.fn(),
      },
    })

    Object.defineProperty(document, 'readyState', {
      writable: true,
      configurable: true,
      value: 'complete',
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: originalServiceWorker,
    })
    Object.defineProperty(document, 'readyState', {
      writable: true,
      configurable: true,
      value: originalReadyState,
    })
    vi.restoreAllMocks()
  })

  it('should not register when service workers are not supported', () => {
    delete (globalThis.navigator as { serviceWorker?: unknown }).serviceWorker

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    registerServiceWorker()

    expect(consoleSpy).toHaveBeenCalledWith(
      'Service workers are not supported in this browser'
    )
    expect(mockRegister).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should register service worker when supported', async () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: false },
    })

    registerServiceWorker()

    await vi.waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('/sw.js')
    })

    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: originalEnv },
    })
  })

  it('should unregister existing service workers in dev mode', async () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: true },
    })

    registerServiceWorker()

    await vi.waitFor(() => {
      expect(mockGetRegistrations).toHaveBeenCalled()
    })

    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: originalEnv },
    })
  })

  it('should call onSuccess when registration succeeds', async () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: false },
    })

    const onSuccess = vi.fn()
    const onError = vi.fn()

    registerServiceWorker({
      onSuccess,
      onError,
    })

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })

    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: originalEnv },
    })
  })

  it('should call onError when registration fails', async () => {
    const error = new Error('Registration failed')
    mockRegister.mockRejectedValue(error)

    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: false },
    })

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    registerServiceWorker({
      onSuccess,
      onError,
    })

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error)
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Service Worker registration failed:',
      error
    )

    consoleErrorSpy.mockRestore()

    Object.defineProperty(import.meta, 'env', {
      writable: true,
      value: { ...import.meta.env, DEV: originalEnv },
    })
  })
})

describe('unregisterServiceWorker', () => {
  let originalServiceWorker: ServiceWorkerContainer | undefined
  let mockGetRegistrations: ReturnType<typeof vi.fn>
  let mockUnregister: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalServiceWorker = globalThis.navigator.serviceWorker

    mockUnregister = vi.fn().mockResolvedValue(true)
    mockGetRegistrations = vi.fn().mockResolvedValue([
      { unregister: mockUnregister },
      { unregister: mockUnregister },
    ])

    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: {
        getRegistrations: mockGetRegistrations,
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: originalServiceWorker,
    })
    vi.restoreAllMocks()
  })

  it('should unregister all service worker registrations', async () => {
    const result = await unregisterServiceWorker()

    expect(mockGetRegistrations).toHaveBeenCalled()
    expect(mockUnregister).toHaveBeenCalledTimes(2)
    expect(result).toBe(true)
  })

  it('should return false when service workers are not supported', async () => {
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      writable: true,
      configurable: true,
      value: undefined,
    })

    const result = await unregisterServiceWorker()

    expect(result).toBe(false)
  })

  it('should return false when no registrations exist', async () => {
    mockGetRegistrations.mockResolvedValue([])

    const result = await unregisterServiceWorker()

    expect(result).toBe(false)
  })
})
