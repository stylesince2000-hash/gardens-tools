/* GARDENS tools — network-first service worker.
   Always try the network so code updates apply on next launch;
   fall back to cache only when offline. */
const CACHE = "gardens-tools-v2";

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // don't touch cross-origin (Firebase CDN / RTDB) — let the network handle it
  if (url.origin !== self.location.origin) return;
  // version check must always be fresh and uncached
  if (url.pathname.endsWith("version.json")) { e.respondWith(fetch(req)); return; }
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
