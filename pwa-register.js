/*
 * ═══════════════════════════════════════════════════════
 *  Selim Academy — pwa-register.js  (نسخة محدّثة ✅)
 *  ضع هذا الملف في: /selim-academy/pwa-register.js
 *  واستدعه من آخر <body> في كل صفحة HTML
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── تسجيل Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/selim-academy/sw.js', {
          scope: '/selim-academy/'
        })
        .then(function (registration) {
          console.log('[PWA] Service Worker registered. Scope:', registration.scope);

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

  // ✅ مدة الإخفاء بعد الرفض: 3 أيام بالميلي ثانية
  var DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000;
  var STORAGE_KEY      = 'pwa-banner-dismissed';

  function wasDismissedRecently() {
    try {
      var ts = localStorage.getItem(STORAGE_KEY);
      if (!ts) return false;
      return (Date.now() - parseInt(ts, 10)) < DISMISS_DURATION;
    } catch (e) {
      return false;
    }
  }

  // ── الدالة المشتركة لتشغيل التثبيت ──
  function triggerInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (result) {
        console.log('[PWA] User choice:', result.outcome);
        deferredPrompt = null;
        hideInstallBanner();
        hideHeroBtn();
      });
    } else {
      // إذا لم يكن الـ prompt متاحًا، اعرض تعليمات يدوية
      alert('لتثبيت التطبيق:\n• كروم: اضغط ⋮ ثم "تثبيت التطبيق"\n• سفاري (iOS): اضغط □↑ ثم "إضافة إلى الشاشة الرئيسية"');
    }
  }

  // ✅ كشف الدالة لزرار الـ Hero في HTML
  window.__pwaInstall = triggerInstall;

  // ── إظهار/إخفاء زرار Hero ──
  function showHeroBtn() {
    var btn = document.getElementById('hero-install-btn');
    if (btn) {
      btn.style.display = 'inline-flex';
    }
  }

  function hideHeroBtn() {
    var btn = document.getElementById('hero-install-btn');
    if (btn) {
      btn.style.display = 'none';
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured');

    // ✅ إظهار زرار Hero دائمًا عند توفر الـ prompt
    showHeroBtn();

    // ✅ التحقق قبل العرض — تجنب الـ popup إذا رُفض مؤخرًا
    if (wasDismissedRecently()) {
      console.log('[PWA] Banner was dismissed recently — skipping popup.');
      return;
    }

    showInstallBanner();
  });

  window.addEventListener('appinstalled', function () {
    console.log('[PWA] App installed successfully!');
    hideInstallBanner();
    hideHeroBtn();
    deferredPrompt = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  });

  // ── CSS لزرار Hero (يُضاف مرة واحدة) ──
  function injectStyles() {
    if (document.getElementById('pwa-styles')) return;
    var style = document.createElement('style');
    style.id = 'pwa-styles';
    style.textContent =
      '@keyframes pwaSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}' +
      '#hero-install-btn{' +
        'display:none;' +
        'align-items:center;' +
        'gap:8px;' +
        'padding:12px 28px;' +
        'background:rgba(255,255,255,0.15);' +
        'color:#fff;' +
        'border:2px solid rgba(255,255,255,0.6);' +
        'border-radius:50px;' +
        'font-size:.95rem;' +
        'font-weight:700;' +
        'cursor:pointer;' +
        'font-family:Cairo,sans-serif;' +
        'transition:all .3s ease;' +
        'backdrop-filter:blur(4px);' +
      '}' +
      '#hero-install-btn:hover{background:rgba(255,255,255,0.28);transform:translateY(-2px);}';
    document.head.appendChild(style);
  }

  // حقن الـ CSS بمجرد أن يكون الـ DOM جاهزاً
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // ── بناء شريط التثبيت (Popup) ──
  function showInstallBanner() {
    if (installBanner) return;

    installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<span style="font-size:1.6rem;">📱</span>' +
        '<div>' +
          '<div style="font-weight:700;font-size:.95rem;">أضف التطبيق للشاشة الرئيسية</div>' +
          '<div style="font-size:.8rem;opacity:.85;margin-top:2px;">تجربة أفضل وأسرع بدون متصفح</div>' +
        '</div>' +
        '<button id="pwa-close-x" style="' +
          'margin-right:auto;background:transparent;border:none;color:#fff;' +
          'font-size:1.1rem;cursor:pointer;line-height:1;padding:4px 8px;opacity:.7;' +
        '">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;">' +
        '<button id="pwa-install-btn" style="' +
          'flex:1;padding:10px;background:#fff;color:#1A56DB;border:none;' +
          'border-radius:8px;font-weight:700;font-size:.9rem;cursor:pointer;' +
          'font-family:Cairo,sans-serif;display:flex;align-items:center;' +
          'justify-content:center;gap:6px;' +
        '">⬇️ تثبيت الآن</button>' +
        '<button id="pwa-dismiss-btn" style="' +
          'padding:10px 16px;background:rgba(255,255,255,.15);color:#fff;' +
          'border:1px solid rgba(255,255,255,.35);border-radius:8px;' +
          'font-size:.88rem;cursor:pointer;font-family:Cairo,sans-serif;' +
        '">لاحقاً</button>' +
      '</div>';

    Object.assign(installBanner.style, {
      position:     'fixed',
      bottom:       '20px',
      right:        '16px',
      left:         '16px',
      background:   'linear-gradient(135deg, #1342B0, #1A56DB)',
      color:        '#fff',
      padding:      '16px 18px',
      borderRadius: '16px',
      boxShadow:    '0 8px 40px rgba(26,86,219,0.45)',
      zIndex:       '9999',
      fontFamily:   'Cairo, sans-serif',
      direction:    'rtl',
      animation:    'pwaSlideUp .4s cubic-bezier(.34,1.56,.64,1)',
    });

    document.body.appendChild(installBanner);

    document.getElementById('pwa-install-btn').addEventListener('click', triggerInstall);

    function dismissBanner() {
      hideInstallBanner();
      try { localStorage.setItem(STORAGE_KEY, Date.now()); } catch(e) {}
    }

    document.getElementById('pwa-dismiss-btn').addEventListener('click', dismissBanner);
    document.getElementById('pwa-close-x').addEventListener('click', dismissBanner);
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
        'background:#fff;color:#1342B0;border:none;padding:6px 16px;' +
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
    // إخفاء زرار التثبيت إذا كان التطبيق مثبتًا بالفعل
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideHeroBtn);
    } else {
      hideHeroBtn();
    }
  }

})();
