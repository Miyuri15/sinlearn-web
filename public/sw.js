const CACHE_VERSION = "sinlearn-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL_ASSETS = [
  "/auth/sign-in",
  "/offline",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/app-icon.svg",
  "/icons/Icon.png",
  "/icons/upload.svg",
  "/icons/document.svg",
  "/icons/syllabus.png",
  "/locales/en/common.json",
  "/locales/en/chat.json",
  "/locales/en/questions.json",
  "/locales/en/syllabus.json",
  "/locales/si/common.json",
  "/locales/si/chat.json",
  "/locales/si/questions.json",
  "/locales/si/syllabus.json",
  "/images/AuthPage.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) =>
        Promise.all(
          APP_SHELL_ASSETS.map((asset) =>
            cache.add(asset).catch((error) => {
              console.warn("Failed to cache app shell asset:", asset, error);
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/locales/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirstNavigation(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(APP_SHELL_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match("/offline");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, fresh.clone());
  return fresh;
}
