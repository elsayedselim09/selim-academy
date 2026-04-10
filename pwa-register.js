/*
 * ═══════════════════════════════════════════════════════
 *  Selim Academy — pwa-register.js
 *  ضع هذا الملف في: /selim-academy/pwa-register.js
 *  واستدعه من آخر <body> في كل صفحة HTML
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── تسجيل Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      // المسار صحيح لـ GitHub Pages subfolder
      navigator.serviceWorker
        .register('/selim-academy/sw.js', {
          scope: '/selim-academy/'
        })
        .then(function (registration) {
          console.log('[PWA] Service Worker registered. Scope:', registration.scope);

          // كشف التحديثات: إذا وُجد SW جديد في الانتظار
          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available!');
                showUpdateBanner();
              }
            });
          });
        })
        .catch(function (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // إعادة تحميل الصفحة عند تفعيل SW جديد
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }

  // ── زر "تثبيت التطبيق" (A2HS) ──
  var deferredPrompt = null;
  var installBanner  = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured');
    showInstallBanner();
  });

  window.addEventListener('appinstalled', function () {
    console.log('[PWA] App installed successfully!');
    hideInstallBanner();
    deferredPrompt = null;
  });

  // ── بناء شريط التثبيت ──
  function showInstallBanner() {
    if (installBanner) return; // لا تعرضه مرتين

    installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<span style="font-size:1.4rem;">📱</span>' +
        '<div>' +
          '<div style="font-weight:700;font-size:.92rem;">أضف التطبيق للشاشة الرئيسية</div>' +
          '<div style="font-size:.78rem;opacity:.85;">تجربة أفضل وأسرع بدون متصفح</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;">' +
        '<button id="pwa-install-btn" style="' +
          'flex:1;padding:9px;background:#fff;color:#1A56DB;border:none;' +
          'border-radius:8px;font-weight:700;font-size:.88rem;cursor:pointer;' +
          'font-family:Cairo,sans-serif;' +
        '">⬇️ تثبيت الآن</button>' +
        '<button id="pwa-dismiss-btn" style="' +
          'padding:9px 14px;background:rgba(255,255,255,.2);color:#fff;' +
          'border:1px solid rgba(255,255,255,.4);border-radius:8px;' +
          'font-size:.88rem;cursor:pointer;font-family:Cairo,sans-serif;' +
        '">لاحقاً</button>' +
      '</div>';

    Object.assign(installBanner.style, {
      position:     'fixed',
      bottom:       '20px',
      right:        '16px',
      left:         '16px',
      background:   '#1A56DB',
      color:        '#fff',
      padding:      '16px',
      borderRadius: '14px',
      boxShadow:    '0 8px 32px rgba(0,0,0,0.25)',
      zIndex:       '9999',
      fontFamily:   'Cairo, sans-serif',
      direction:    'rtl',
    });

    document.body.appendChild(installBanner);

    document.getElementById('pwa-install-btn').addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (result) {
          console.log('[PWA] User choice:', result.outcome);
          deferredPrompt = null;
          hideInstallBanner();
        });
      }
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', function () {
      hideInstallBanner();
      // لا تعرضه مجدداً لمدة 3 أيام
      localStorage.setItem('pwa-banner-dismissed', Date.now());
    });
  }

  function hideInstallBanner() {
    if (installBanner) {
      installBanner.remove();
      installBanner = null;
    }
  }

  // ── شريط تحديث النسخة ──
  function showUpdateBanner() {
    var updateBar = document.createElement('div');
    updateBar.innerHTML =
      '🔄 يوجد تحديث جديد للأكاديمية &nbsp;' +
      '<button onclick="window.location.reload()" style="' +
        'background:#fff;color:#1A56DB;border:none;padding:6px 14px;' +
        'border-radius:6px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;' +
      '">تحديث الآن</button>';

    Object.assign(updateBar.style, {
      position:   'fixed',
      top:        '0',
      right:      '0',
      left:       '0',
      background: '#1342B0',
      color:      '#fff',
      padding:    '10px 16px',
      textAlign:  'center',
      zIndex:     '99999',
      fontFamily: 'Cairo, sans-serif',
      fontSize:   '.9rem',
    });

    document.body.prepend(updateBar);
  }

  // ── تسجيل وضع Standalone ──
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    console.log('[PWA] Running in standalone mode ✅');
    document.documentElement.classList.add('pwa-standalone');
  }

})();
