interface ServiceWorkerRegistrationOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
}

export function registerServiceWorker(
  options: ServiceWorkerRegistrationOptions = {}
): void {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    console.warn('Service workers are not supported in this browser')
    return
  }

  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        return Promise.all(registrations.map((registration) => registration.unregister()))
      })
      .then(() => {
        register(options)
      })
      .catch((error) => {
        console.error('Error unregistering service workers:', error)
        register(options)
      })
  } else {
    register(options)
  }
}

function register(options: ServiceWorkerRegistrationOptions): void {
  const registerSW = () => {
    const swPath = '/sw.js'

    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope)

        options.onSuccess?.(registration)

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (!newWorker) {
            return
          }

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              options.onUpdate?.(registration)
            }
          })
        })
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
        options.onError?.(error)
      })

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) {
        return
      }
      refreshing = true
      window.location.reload()
    })
  }

  if (document.readyState === 'complete') {
    registerSW()
  } else {
    window.addEventListener('load', registerSW)
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
    return Promise.resolve(false)
  }

  return navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      if (registrations.length === 0) {
        return Promise.resolve([])
      }
      return Promise.all(registrations.map((registration) => registration.unregister()))
    })
    .then((results) => {
      return Array.isArray(results) ? results.some((result) => result) : false
    })
    .catch(() => {
      return false
    })
}
