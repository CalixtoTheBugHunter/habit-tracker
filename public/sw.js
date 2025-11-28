const CACHE_NAME = 'habit-tracker-v1'
const RUNTIME_CACHE = 'habit-tracker-runtime-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((error) => {
        console.warn('Failed to cache some resources:', error)
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== location.origin) {
    return
  }

  if (request.method !== 'GET') {
    return
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => {
            return cache.match(request).then((cachedResponse) => {
              return cachedResponse || cache.match('/index.html')
            })
          })
      })
    )
    return
  }

  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            if (!response.ok) {
              return response
            }

            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch(() => {
            if (request.destination === 'image') {
              return new Response('', { status: 404 })
            }
            return new Response('Offline', { status: 503 })
          })
      })
    )
    return
  }

  event.respondWith(fetch(request))
})

