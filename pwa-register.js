/*
 * ═══════════════════════════════════════════════════════
 *  Selim Academy — pwa-register.js  (نسخة محدّثة ✅)
 *  ضع هذا الملف في: /pwa-register.js
 *  واستدعه من آخر <body> في كل صفحة HTML
 * ═══════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── تسجيل Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/'
        })
        .then(function (registration) {
          console.log('[PWA] Service Worker registered. Scope:', registration.scope);

          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            newWorker.addEventListener('statechange', function () {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available — auto-applying...');
                _waitingWorker = newWorker;
                // SW يعمل skipWaiting تلقائياً — لا نحتاج بانر
                newWorker.postMessage({ type: 'SKIP_WAITING' });
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

  var INSTALLED_KEY = 'pwa-installed';

  function isAppInstalled() {
    // 1. مفتوح من أيقونة التطبيق (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) return true;
    // 2. تم التثبيت في جلسة سابقة وحفظناه
    try { return localStorage.getItem(INSTALLED_KEY) === '1'; } catch(e) {}
    return false;
  }

  function showAllInstallBtns() {
    showHeroBtn();
    // الزرار العائم يظهر فقط في الصفحة الرئيسية
    var path = window.location.pathname;
    var isHome = path === '/' || path === '/index.html' || path === '';
    if (isHome) showInstallBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (!isAppInstalled()) showAllInstallBtns();
    });
  } else {
    if (!isAppInstalled()) showAllInstallBtns();
  }

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
    // ✅ حفظ حالة التثبيت
    try { localStorage.setItem(INSTALLED_KEY, '1'); } catch(e) {}
  });

  // ── CSS لزرار Hero والزرار العائم ──
  function injectStyles() {
    if (document.getElementById('pwa-styles')) return;
    var style = document.createElement('style');
    style.id = 'pwa-styles';
    style.textContent =
      '@keyframes pwaSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes pwaPulse{0%,100%{box-shadow:0 8px 32px rgba(26,86,219,.45)}50%{box-shadow:0 8px 48px rgba(26,86,219,.75)}}' +

      /* زرار Hero في الـ header */
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
      '#hero-install-btn:hover{background:rgba(255,255,255,0.28);transform:translateY(-2px);}' +

      /* الزرار العائم فوق الواتساب */
      '#pwa-float-btn{' +
        'position:fixed;' +
        'bottom:110px;' +          /* فوق زرار الواتساب */
        'left:32px;' +
        'z-index:9999;' +
        'display:none;' +
        'align-items:center;' +
        'gap:10px;' +
        'background:linear-gradient(135deg,#1342B0,#1A56DB);' +
        'color:#fff;' +
        'padding:12px 20px 12px 16px;' +
        'border-radius:50px;' +
        'box-shadow:0 8px 32px rgba(26,86,219,.45);' +
        'text-decoration:none;' +
        'font-family:Cairo,sans-serif;' +
        'font-size:.92rem;' +
        'font-weight:700;' +
        'cursor:pointer;' +
        'border:none;' +
        'animation:pwaPulse 2.5s infinite;' +
        'transition:all .3s;' +
      '}' +
      '#pwa-float-btn:hover{transform:translateY(-4px) scale(1.04);}' +
      '#pwa-float-btn .pwa-float-icon{font-size:1.3rem;flex-shrink:0;}' +
      '#pwa-float-btn .pwa-float-label{font-size:.7rem;opacity:.85;display:block;font-weight:400;}' +

      /* موبايل */
      '@media(max-width:640px){' +
        '#pwa-float-btn{bottom:90px;left:16px;padding:10px 16px 10px 12px;font-size:.85rem;}' +
        '#pwa-float-btn .pwa-float-label{display:none;}' +
      '}';
    document.head.appendChild(style);
  }

  // حقن الـ CSS بمجرد أن يكون الـ DOM جاهزاً
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // ── الزرار العائم فوق الواتساب ──
  function showInstallBanner() {
    if (document.getElementById('pwa-float-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'pwa-float-btn';
    btn.innerHTML =
      '<span class="pwa-float-icon">⬇️</span>' +
      '<div class="wa-text" style="line-height:1.2;">' +
        '<span class="pwa-float-label">نزّل التطبيق مجاناً</span>' +
        'تثبيت التطبيق' +
      '</div>';

    document.body.appendChild(btn);

    // إظهار بتأخير بسيط
    setTimeout(function() { btn.style.display = 'flex'; }, 300);

    btn.addEventListener('click', triggerInstall);
    installBanner = btn;
  }

  function hideInstallBanner() {
    if (installBanner) {
      installBanner.remove();
      installBanner = null;
    }
  }

  // ── شريط تحديث النسخة ──
  var _waitingWorker = null;

  function applyUpdate() {
    if (_waitingWorker) {
      _waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  }

  function showUpdateBanner() {
    var updateBar = document.createElement('div');
    updateBar.id = 'pwa-update-bar';
    updateBar.innerHTML =
      '🔄 يوجد تحديث جديد للأكاديمية &nbsp;' +
      '<button id="pwa-update-btn" style="' +
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
    document.getElementById('pwa-update-btn').addEventListener('click', function() {
      document.getElementById('pwa-update-bar').innerHTML = '⏳ جاري التحديث...';
      applyUpdate();
    });
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
