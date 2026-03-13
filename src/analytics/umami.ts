declare global {
  interface Window {
    umami?: {
      track: (event?: string | object, data?: object) => void
    }
  }
}

const DEFAULT_UMAMI_SCRIPT = 'https://cloud.umami.is/script.js'

export function isEnabled(): boolean {
  const enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
  const hasWebsiteId = typeof websiteId === 'string' && websiteId.trim() !== ''
  return enabled && hasWebsiteId
}

export function loadScript(): void {
  if (!isEnabled()) return

  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string
  const src = import.meta.env.VITE_UMAMI_SRC ?? DEFAULT_UMAMI_SCRIPT

  const script = document.createElement('script')
  script.src = src
  script.setAttribute('data-website-id', websiteId)
  script.async = true
  script.onload = () => {
    window.umami?.track()
  }
  document.head.appendChild(script)
}

export function track(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  if (!isEnabled()) return
  if (!navigator.onLine) return
  if (typeof window.umami?.track !== 'function') return

  window.umami.track(eventName, eventData)
}
