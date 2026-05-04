// ═══════════════════════════════════════════════════════
//  sw-notifications.js — Service Worker للإشعارات
//  أكاديمية سليم
//  يعمل في الخلفية حتى لو الصفحة مغلقة (على المتصفحات التي تدعمه)
// ═══════════════════════════════════════════════════════

const SW_VERSION = 'v1.0';

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
//  استقبال رسائل من الصفحة الرئيسية
// ══════════════════════════════════════════════════════
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  if (type === 'SCHEDULE_SESSION_NOTIFICATIONS') {
    // استقبال جلسات وجدولة إشعاراتها
    scheduleNotifications(payload.sessions, payload.userName);
  }

  if (type === 'CANCEL_ALL_NOTIFICATIONS') {
    cancelAllScheduled();
  }
});

// ══════════════════════════════════════════════════════
//  جدولة الإشعارات
// ══════════════════════════════════════════════════════
let _scheduledTimers = [];

function cancelAllScheduled() {
  _scheduledTimers.forEach(t => clearTimeout(t));
  _scheduledTimers = [];
}

function scheduleNotifications(sessions, userName) {
  cancelAllScheduled(); // إلغاء القديمة

  if (!sessions || !sessions.length) return;

  const now = Date.now();

  sessions.forEach(session => {
    const sessionTime = new Date(session.scheduled_at).getTime();
    if (isNaN(sessionTime)) return;

    const subjectName = session.subject || session.subject_name || 'حصة دراسية';
    const teacherName = session.teacher_name || '';

    // ── إشعار 1: قبل 15 دقيقة ──
    const before15 = sessionTime - 15 * 60 * 1000;
    const msUntil15 = before15 - now;

    if (msUntil15 > 0 && msUntil15 < 24 * 60 * 60 * 1000) { // خلال 24 ساعة فقط
      const t1 = setTimeout(() => {
        showSessionNotification({
          title: `⏰ حصتك بعد 15 دقيقة!`,
          body: `${subjectName}${teacherName ? ' — ' + teacherName : ''}\nاستعد الآن وادخل على رابط الحصة`,
          tag: `session-15min-${session.id}`,
          data: { sessionId: session.id, type: 'before15' }
        });
      }, msUntil15);
      _scheduledTimers.push(t1);
      console.log(`[SW] Scheduled 15min notif for "${subjectName}" in ${Math.round(msUntil15/60000)} min`);
    }

    // ── إشعار 2: عند بدء الحصة ──
    const msUntilStart = sessionTime - now;

    if (msUntilStart > 0 && msUntilStart < 24 * 60 * 60 * 1000) {
      const t2 = setTimeout(() => {
        showSessionNotification({
          title: `🎥 الحصة بدأت الآن!`,
          body: `${subjectName}${teacherName ? ' — ' + teacherName : ''}\nانقر للدخول على الحصة`,
          tag: `session-start-${session.id}`,
          data: { sessionId: session.id, type: 'start', zoomUrl: session.zoom_link || session.meeting_link || '' }
        });
      }, msUntilStart);
      _scheduledTimers.push(t2);
      console.log(`[SW] Scheduled start notif for "${subjectName}" in ${Math.round(msUntilStart/60000)} min`);
    }
  });
}

// ══════════════════════════════════════════════════════
//  إظهار الإشعار
// ══════════════════════════════════════════════════════
function showSessionNotification({ title, body, tag, data }) {
  const options = {
    body,
    tag,                         // يمنع تكرار نفس الإشعار
    icon: '/selim-academy/icon-192x192.png',
    badge: '/selim-academy/icon-192x192.png',
    dir: 'rtl',
    lang: 'ar',
    requireInteraction: true,    // لا يختفي تلقائياً حتى يضغط عليه
    vibrate: [200, 100, 200, 100, 200], // اهتزاز للجوال
    data,
    actions: data.type === 'start'
      ? [{ action: 'join', title: '▶ ادخل الحصة' }, { action: 'dismiss', title: '✕ تجاهل' }]
      : [{ action: 'open', title: '👁 عرض' }, { action: 'dismiss', title: '✕ تجاهل' }],
  };

  self.registration.showNotification(title, options)
    .catch(err => console.error('[SW] Notification error:', err));
}

// ══════════════════════════════════════════════════════
//  التعامل مع نقر المستخدم على الإشعار
// ══════════════════════════════════════════════════════
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const { action } = event;
  const { zoomUrl, sessionId, type } = event.notification.data || {};

  if (action === 'dismiss') return;

  // فتح رابط الزووم مباشرة عند بدء الحصة
  const urlToOpen = (action === 'join' && zoomUrl)
    ? zoomUrl
    : self.location.origin + '/selim-academy/dashboard.html#sessions';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // إذا الصفحة مفتوحة، ننقل التركيز إليها
      const existing = clients.find(c => c.url.includes('selim-academy'));
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
