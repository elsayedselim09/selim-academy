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

  // ── إشعارات الحصص ──
  if (event.data?.type === 'SCHEDULE_SESSION_NOTIFICATIONS') {
    const { sessions, userName } = event.data.payload || {};
    scheduleSessionNotifications(sessions, userName);
  }
  if (event.data?.type === 'CANCEL_ALL_NOTIFICATIONS') {
    cancelAllScheduled();
  }
});

// ══════════════════════════════════════
//  نظام إشعارات الحصص — Session Alerts
// ══════════════════════════════════════

let _scheduledTimers = [];

function cancelAllScheduled() {
  _scheduledTimers.forEach(t => clearTimeout(t));
  _scheduledTimers = [];
  console.log('[SW-Notif] All scheduled notifications cancelled');
}

function scheduleSessionNotifications(sessions, userName) {
  cancelAllScheduled();
  if (!sessions?.length) return;

  const now   = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;

  sessions.forEach(session => {
    const sessionTime = new Date(session.scheduled_at).getTime();
    if (isNaN(sessionTime) || sessionTime > in24h) return;

    const subject = session.subject || 'حصة دراسية';
    const teacher = session.teacher_name ? ` — ${session.teacher_name}` : '';
    const zoom    = session.zoom_link || '';

    // ── إشعار 1: قبل 15 دقيقة ──
    const ms15 = sessionTime - 15 * 60 * 1000 - now;
    if (ms15 > 0) {
      const t1 = setTimeout(() => {
        fireNotification({
          title : '⏰ حصتك بعد 15 دقيقة!',
          body  : `${subject}${teacher}\nاستعد الآن`,
          tag   : `sess-15-${session.id}`,
          type  : 'before15',
          zoom,
          sessionId: session.id,
        });
      }, ms15);
      _scheduledTimers.push(t1);
      console.log(`[SW-Notif] 15min notif scheduled for "${subject}" in ${Math.round(ms15/60000)}min`);
    }

    // ── إشعار 2: عند بدء الحصة ──
    const msStart = sessionTime - now;
    if (msStart > 0) {
      const t2 = setTimeout(() => {
        fireNotification({
          title : '🎥 الحصة بدأت الآن!',
          body  : `${subject}${teacher}\nانقر للدخول`,
          tag   : `sess-start-${session.id}`,
          type  : 'start',
          zoom,
          sessionId: session.id,
        });
      }, msStart);
      _scheduledTimers.push(t2);
      console.log(`[SW-Notif] Start notif scheduled for "${subject}" in ${Math.round(msStart/60000)}min`);
    }
  });
}

function fireNotification({ title, body, tag, type, zoom, sessionId }) {
  const actions = type === 'start' && zoom
    ? [{ action: 'join',    title: '▶ ادخل الحصة' },
       { action: 'dismiss', title: '✕ تجاهل' }]
    : [{ action: 'open',    title: '👁 عرض' },
       { action: 'dismiss', title: '✕ تجاهل' }];

  self.registration.showNotification(title, {
    body,
    tag,
    icon            : '/selim-academy/icon-192x192.png',
    badge           : '/selim-academy/icon-192x192.png',
    dir             : 'rtl',
    lang            : 'ar',
    requireInteraction: true,
    vibrate         : [200, 100, 200, 100, 200],
    actions,
    data            : { type, zoom, sessionId },
  }).catch(err => console.error('[SW-Notif] showNotification error:', err));
}

// ══════════════════════════════════════
//  نقر المستخدم على الإشعار
// ══════════════════════════════════════
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const { action } = event;
  const { zoom, sessionId } = event.notification.data || {};

  if (action === 'dismiss') return;

  const target = (action === 'join' && zoom)
    ? zoom
    : `${self.location.origin}/selim-academy/dashboard.html#sessions`;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // لو الصفحة مفتوحة → ننقل التركيز إليها ونبلغها
        const existing = clients.find(c => c.url.includes('selim-academy'));
        if (existing) {
          existing.focus();
          existing.postMessage({ type: 'NOTIFICATION_CLICKED', sessionId, action, zoom });
          return;
        }
        // وإلا نفتح نافذة جديدة
        return self.clients.openWindow(target);
      })
  );
});

self.addEventListener('notificationclose', event => {
  console.log('[SW-Notif] Notification closed:', event.notification.tag);
});
