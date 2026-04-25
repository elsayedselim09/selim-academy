/*
 * ═══════════════════════════════════════════════════════
 *  Selim Academy — Service Worker  (sw.js)
 *  الإصدار: 2.0
 *  المسار الصحيح: /selim-academy/sw.js
 * ═══════════════════════════════════════════════════════
 */

// ── اسم الـ Cache — غيّر الرقم عند أي تحديث للموقع ──
const CACHE_NAME    = 'selim-academy-v5';
const OFFLINE_PAGE  = '/selim-academy/offline.html';

// ── الملفات التي تُحفظ فوراً عند تثبيت الـ SW ──
const PRECACHE_URLS = [
  '/selim-academy/',
  '/selim-academy/index.html',
  '/selim-academy/dashboard.html',
  '/selim-academy/login.html',
  '/selim-academy/manifest.json',
  '/selim-academy/offline.html',
  '/selim-academy/icon-192x192.png',
  '/selim-academy/icon-512x512.png',
  // أضف أي ملفات CSS أو JS خارجية محلية هنا
];

// ── النطاقات المسموح بـ Cache لها من الخارج ──
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
];

// ══════════════════════════════════════
//  INSTALL — تثبيت وتحميل مسبق
// ══════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Selim Academy SW...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      // addAll يفشل كلياً لو ملف واحد فشل، فنستخدم add فردياً
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err =>
            console.warn(`[SW] Failed to cache: ${url}`, err)
          )
        )
      );
    }).then(() => {
      console.log('[SW] Install complete');
      // تفعيل فوري بدون انتظار إغلاق التبويبات القديمة
      return self.skipWaiting();
    })
  );
});

// ══════════════════════════════════════
//  ACTIVATE — حذف الـ Caches القديمة
// ══════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => {
      console.log('[SW] Now controlling all clients');
      // السيطرة الفورية على كل التبويبات المفتوحة
      return self.clients.claim();
    })
  );
});

// ══════════════════════════════════════
//  FETCH — استراتيجية الطلبات
// ══════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل طلبات غير HTTP/HTTPS (مثلاً chrome-extension://)
  if (!request.url.startsWith('http')) return;

  // استثناء هام: لا تعترض الروابط الخارجية عند الانتقال
  if (request.mode === 'navigate' && url.origin !== location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // تجاهل طلبات POST وغير GET (لا نكاش الـ API calls)
  if (request.method !== 'GET') return;

  // ── استراتيجية 1: Network First للصفحات HTML ──
  // نحاول الشبكة أولاً للحصول على أحدث نسخة، ونرجع للـ Cache عند الفشل
  if (request.destination === 'document' ||
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // ── استراتيجية 2: Cache First للـ Fonts ──
  // الخطوط ثابتة ونادراً ما تتغير
  if (CACHEABLE_ORIGINS.some(origin => request.url.startsWith(origin))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // ── استراتيجية 3: Stale While Revalidate للـ CSS, JS, Images ──
  // نرجع الـ Cache فوراً ونحدّث في الخلفية
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── استراتيجية 4: Network Only لباقي الطلبات ──
  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_PAGE)));
});

// ══════════════════════════════════════
//  استراتيجيات الـ Cache
// ══════════════════════════════════════

// 1. Network First — للصفحات
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    // صفحة offline احتياطية
    return caches.match(OFFLINE_PAGE);
  }
}

// 2. Cache First — للخطوط والموارد الثابتة
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache & Network failed for:', request.url);
    return new Response('', { status: 408 });
  }
}

// 3. Stale While Revalidate — للـ Assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || await fetchPromise || caches.match(OFFLINE_PAGE);
}

// ══════════════════════════════════════
//  رسائل من الصفحة الرئيسية
// ══════════════════════════════════════
self.addEventListener('message', (event) => {
  if (event.data?.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data?.action === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }
});
