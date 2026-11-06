// Service worker: la app abre sin conexión y los datos se piden siempre frescos.
const VERSION = "fc-v1";
const SHELL = ["./", "index.html", "styles.css", "app.js", "content/priest.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Red primero para todo (datos y código), caché como respaldo offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          const key = url.pathname.includes("/data/") ? new Request(url.origin + url.pathname) : e.request;
          caches.open(VERSION).then((c) => c.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.notification.data?.url || "";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        c.postMessage({ url: target });
        return c.focus();
      }
      return self.clients.openWindow(`./${target}`);
    }),
  );
});
