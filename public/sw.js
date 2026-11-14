const CACHE_PREFIX = 'infantpedia-';
const CACHE_NAME = CACHE_PREFIX + 'v6';
const OFFLINE_PAGE = '/offline.html';

const PRIVATE_ROUTE = /^\/(?:api|auth|admin|login)(?:\/|$)/;
const STATIC_ASSET = /^\/_next\/static\/.*\.(?:js|css|woff2?|ttf|otf|png|svg|webp|avif|jpe?g|gif|ico)$/i;
const ASSET_TYPE = /^(?:text\/css\b|(?:application|text)\/javascript\b|font\/|image\/|application\/(?:font-woff|x-font-))/i;

function isPublicResponse(response) {
  const cacheControl = response.headers.get('Cache-Control') || '';
  const vary = response.headers.get('Vary') || '';
  return response.status === 200 && response.type === 'basic' && !response.redirected
    && !/\b(?:private|no-store|no-cache)\b/i.test(cacheControl)
    && !/(?:^|,)\s*(?:cookie|authorization|\*)\s*(?:,|$)/i.test(vary);
}

async function prepareOfflinePage() {
  const request = new Request(new URL(OFFLINE_PAGE, self.location.origin), {
    cache: 'reload',
    credentials: 'omit',
    redirect: 'error',
  });
  const response = await fetch(request);
  if (!isPublicResponse(response) || !/^text\/html\b/i.test(response.headers.get('Content-Type') || '')) {
    throw new Error('Offline page unavailable');
  }
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
  await self.skipWaiting();
}

self.addEventListener('install', (event) => {
  event.waitUntil(prepareOfflinePage());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function publicAsset(request) {
  const cache = await caches.open(CACHE_NAME).catch(() => null);
  const cached = await cache?.match(request).catch(() => null);
  if (cached) return cached;

  const response = await fetch(request, { credentials: 'omit', redirect: 'error' });
  if (cache && isPublicResponse(response) && ASSET_TYPE.test(response.headers.get('Content-Type') || '')) {
    await cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin
      || PRIVATE_ROUTE.test(url.pathname) || request.headers.has('Authorization')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(async () => {
      const offline = await caches.match(OFFLINE_PAGE, { cacheName: CACHE_NAME });
      return offline || Response.error();
    }));
    return;
  }

  if (STATIC_ASSET.test(url.pathname) && !request.headers.has('Range')) {
    event.respondWith(publicAsset(request));
  }
});
