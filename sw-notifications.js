// ═══════════════════════════════════════════════════════
//  sw-notifications.js — Service Worker للإشعارات
//  أكاديمية سليم — النسخة المحدثة v2.0
//  يعمل في الخلفية حتى لو الصفحة مغلقة تماماً
// ═══════════════════════════════════════════════════════

const SW_VERSION = 'v2.0';

// ── تثبيت الـ Service Worker ──
self.addEventListener('install', event => {
  console.log('[SW] installed', SW_VERSION);
  self.skipWaiting();
});

// ── تفعيل الـ Service Worker ──
self.addEventListener('activate', event => {
  console.log('[SW] activated', SW_VERSION);
  event.waitUntil(self.clients.claim());
});

// ══════════════════════════════════════════════════════
//  استقبال Web Push من السيرفر (الجزء المهم!)
//  هذا هو اللي يشتغل وهو التطبيق مغلق تماماً
// ══════════════════════════════════════════════════════
self.addEventListener('push', event => {
  console.log('[SW] Push received');

  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    data = {
      title: '🔔 إشعار جديد',
      body: event.data ? event.data.text() : 'لديك إشعار جديد من أكاديمية سليم',
    };
  }

  const title = data.title || '🔔 أكاديمية سليم';
  const options = {
    body: data.body || '',
    tag: data.tag || `notif-${Date.now()}`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    dir: 'rtl',
    lang: 'ar',
    requireInteraction: data.type === 'start' || data.type === 'before15',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      sessionId: data.sessionId || null,
      type: data.type || 'instant',
      zoomUrl: data.zoom || '',
      url: data.url || '/dashboard.html',
    },
    actions: data.type === 'start'
      ? [
          { action: 'join',    title: '▶ ادخل الحصة' },
          { action: 'dismiss', title: '✕ تجاهل' },
        ]
      : data.type === 'before15'
      ? [
          { action: 'open',    title: '👁 عرض' },
          { action: 'dismiss', title: '✕ تجاهل' },
        ]
      : [
          { action: 'open',    title: '👁 فتح' },
          { action: 'dismiss', title: '✕ إغلاق' },
        ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ══════════════════════════════════════════════════════
//  التعامل مع نقر المستخدم على الإشعار
// ══════════════════════════════════════════════════════
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const { action } = event;
  const { zoomUrl, sessionId, type, url } = event.notification.data || {};

  if (action === 'dismiss') return;

  // فتح رابط الزووم عند بدء الحصة
  const urlToOpen = (action === 'join' && zoomUrl)
    ? zoomUrl
    : (url || self.location.origin + '/dashboard.html#sessions');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // إذا الصفحة مفتوحة، ننقل التركيز إليها
      const existing = clients.find(c =>
        c.url.includes(self.location.hostname) || c.url.includes('selimacademy')
      );
      if (existing) {
        existing.focus();
        existing.postMessage({ type: 'NOTIFICATION_CLICKED', sessionId, action, zoomUrl });
        return;
      }
      // وإلا نفتح نافذة جديدة
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ── إغلاق الإشعار ──
self.addEventListener('notificationclose', event => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ══════════════════════════════════════════════════════
//  استقبال رسائل من الصفحة (للجدولة اليدوية)
//  ملاحظة: هذا يعمل فقط لو الصفحة مفتوحة
//  للإشعارات وهو التطبيق مغلق → يعتمد على Push من السيرفر
// ══════════════════════════════════════════════════════
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  if (type === 'SCHEDULE_SESSION_NOTIFICATIONS') {
    scheduleLocalNotifications(payload.sessions, payload.userName);
  }

  if (type === 'CANCEL_ALL_NOTIFICATIONS') {
    cancelAllScheduled();
  }

  if (type === 'SW_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION_RESPONSE', version: SW_VERSION });
  }
});

// ══════════════════════════════════════════════════════
//  جدولة إشعارات محلية (backup - تشتغل لو الصفحة مفتوحة)
// ══════════════════════════════════════════════════════
let _scheduledTimers = [];

function cancelAllScheduled() {
  _scheduledTimers.forEach(t => clearTimeout(t));
  _scheduledTimers = [];
}

function scheduleLocalNotifications(sessions, userName) {
  cancelAllScheduled();
  if (!sessions?.length) return;

  const now = Date.now();

  sessions.forEach(session => {
    const sessionTime = new Date(session.scheduled_at).getTime();
    if (isNaN(sessionTime)) return;

    const subjectName = session.subject_name || session.subject || session.title || 'حصة دراسية';
    const teacherName = session.teacher_name || '';

    // إشعار 1: قبل 15 دقيقة
    const msUntil15 = (sessionTime - 15 * 60 * 1000) - now;
    if (msUntil15 > 0 && msUntil15 < 24 * 60 * 60 * 1000) {
      const t1 = setTimeout(() => {
        self.registration.showNotification(`⏰ حصتك بعد 15 دقيقة!`, {
          body: `${subjectName}${teacherName ? ' — ' + teacherName : ''}\nاستعد الآن`,
          tag: `session-15min-${session.id}`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          dir: 'rtl',
          lang: 'ar',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { sessionId: session.id, type: 'before15', zoomUrl: session.zoom_link || '' },
          actions: [{ action: 'open', title: '👁 عرض' }, { action: 'dismiss', title: '✕ تجاهل' }],
        });
      }, msUntil15);
      _scheduledTimers.push(t1);
    }

    // إشعار 2: عند بدء الحصة
    const msUntilStart = sessionTime - now;
    if (msUntilStart > 0 && msUntilStart < 24 * 60 * 60 * 1000) {
      const t2 = setTimeout(() => {
        self.registration.showNotification(`🎥 الحصة بدأت الآن!`, {
          body: `${subjectName}${teacherName ? ' — ' + teacherName : ''}\nانقر للدخول`,
          tag: `session-start-${session.id}`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          dir: 'rtl',
          lang: 'ar',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          data: { sessionId: session.id, type: 'start', zoomUrl: session.zoom_link || session.meeting_link || '' },
          actions: [{ action: 'join', title: '▶ ادخل الحصة' }, { action: 'dismiss', title: '✕ تجاهل' }],
        });
      }, msUntilStart);
      _scheduledTimers.push(t2);
    }
  });
}
