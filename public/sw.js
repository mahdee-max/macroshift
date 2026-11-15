importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js"
);

workbox.setConfig({ debug: false });

const { precacheAndRoute } = workbox.precaching;
const { registerRoute, NavigationRoute, setCatchHandler } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } =
  workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// Skip waiting and claim clients immediately
self.skipWaiting();
workbox.core.clientsClaim();

// Precache app shell
precacheAndRoute([
  { url: "/", revision: "1" },
  { url: "/fallback-offline.html", revision: "1" },
]);

// CacheFirst for static assets (images, fonts, CSS, JS)
registerRoute(
  ({ request }) =>
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// NetworkFirst for API calls
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// StaleWhileRevalidate for USDA API calls
registerRoute(
  ({ url }) => url.hostname === "api.nal.usda.gov",
  new StaleWhileRevalidate({
    cacheName: "usda-api-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// NetworkFirst for navigation requests
const navigationHandler = new NetworkFirst({
  cacheName: "navigation-cache",
  networkTimeoutSeconds: 5,
  plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
});

const navigationRoute = new NavigationRoute(navigationHandler);
registerRoute(navigationRoute);

// Offline fallback for navigation failures
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return caches.match("/fallback-offline.html");
  }
  return Response.error();
});
