const CACHE_NAME = "hotel-menu-v1"

self.addEventListener("install", event => {
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(key => caches.delete(key)))
  ))
})

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    return
  }
  event.respondWith(fetch(event.request))
})