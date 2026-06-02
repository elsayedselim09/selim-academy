// ═══════════════════════════════════════════════════════
//  push-init.js — تهيئة Web Push للمستخدم
//  أكاديمية سليم — ضعه في كل صفحة بعد تسجيل الدخول
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = 'https://hjhoudwknwnxfndrgpfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaG91ZHdrbndueGZuZHJncGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODQ5MTksImV4cCI6MjA5MDM2MDkxOX0.QBRbZ0EewBc2FDX1D5v_bdwm_j0hGZ7s6jEgrCyJl2s'; // ← استبدل هذا بمفتاحك

// مفتاح VAPID العام (نفس اللي في Edge Function)
const VAPID_PUBLIC_KEY = 'BCldNnBdd3O0e7T6cRj0ZRoaZS_GDY8GPK3PlPsJ1vT6yXtsCa89jKhcf9DWrQ_bZr7TozmwWTdNES1TJFjW14k';

/**
 * تحويل VAPID Public Key من Base64 إلى Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

/**
 * الدالة الرئيسية — استدعها بعد تسجيل دخول المستخدم
 * @param {string} userId - معرف المستخدم من Supabase Auth
 * @param {string} authToken - توكن المستخدم (session.access_token)
 */
async function initPushNotifications(userId, authToken) {
  // التحقق من دعم المتصفح
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] هذا المتصفح لا يدعم الإشعارات');
    return false;
  }

  try {
    // 1. تسجيل الـ Service Worker
    const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
      scope: '/',
    });
    console.log('[Push] Service Worker registered');

    // 2. طلب إذن الإشعارات من المستخدم
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] المستخدم رفض الإشعارات');
      return false;
    }

    // 3. الاشتراك في Web Push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const subJSON = subscription.toJSON();

    // 4. حفظ الـ subscription في Supabase
    const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authToken}`,
        'Prefer':        'resolution=merge-duplicates', // تحديث لو موجود
      },
      body: JSON.stringify({
        user_id:     userId,
        endpoint:    subJSON.endpoint,
        p256dh:      subJSON.keys.p256dh,
        auth_key:    subJSON.keys.auth,
        device_info: deviceInfo,
        updated_at:  new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log('[Push] ✅ Subscription saved to Supabase');
      return true;
    } else {
      console.error('[Push] Failed to save subscription:', await response.text());
      return false;
    }

  } catch (error) {
    console.error('[Push] Error initializing:', error);
    return false;
  }
}

/**
 * جدولة الإشعارات المحلية (backup للإشعارات السيرفر)
 * استدعها بعد جلب الحصص من Supabase
 * @param {Array} sessions - قائمة الحصص
 * @param {string} userName - اسم المستخدم
 */
async function scheduleLocalBackupNotifications(sessions, userName = '') {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'SCHEDULE_SESSION_NOTIFICATIONS',
    payload: { sessions, userName },
  });
}

/**
 * إلغاء الإشعارات المجدولة محلياً
 */
async function cancelLocalNotifications() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: 'CANCEL_ALL_NOTIFICATIONS' });
}

// ══════════════════════════════════════════════════════
//  مثال الاستخدام — ضع هذا الكود في dashboard.js
// ══════════════════════════════════════════════════════

/*
// بعد تسجيل الدخول مباشرة:
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await initPushNotifications(session.user.id, session.access_token);
  
  // جلب حصص المستخدم وجدولة الإشعارات المحلية كـ backup
  const { data: sessions } = await supabase
    .from('teacher_sessions')
    .select('*')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at');
  
  if (sessions) {
    await scheduleLocalBackupNotifications(sessions, session.user.user_metadata?.full_name);
  }
}

// الاستماع للإشعارات من الـ Service Worker
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === 'NOTIFICATION_CLICKED') {
    const { sessionId, action, zoomUrl } = event.data;
    if (action === 'join' && zoomUrl) {
      window.open(zoomUrl, '_blank');
    }
  }
});
*/

// تصدير الدوال
window.PushNotifications = {
  init: initPushNotifications,
  scheduleLocal: scheduleLocalBackupNotifications,
  cancelLocal: cancelLocalNotifications,
};
