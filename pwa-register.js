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

  // ── كشف نوع الجهاز والمتصفح ──
  function isIOS() {
    // آيفون/آيباد (بما فيها آيباد iOS 13+ اللي بتتنكر كـ Mac)
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isInAppBrowser() {
    var ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|Twitter/i.test(ua);
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
    } else if (isIOS()) {
      showIOSInstallModal();
    } else {
      // إذا لم يكن الـ prompt متاحًا (مش iOS)، اعرض تعليمات يدوية
      alert('لتثبيت التطبيق:\nاضغط على قائمة المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
    }
  }

  // ── Modal تعليمات التثبيت على iOS ──
  function showIOSInstallModal() {
    if (document.getElementById('pwa-ios-modal')) return;

    var inApp = isInAppBrowser();

    var overlay = document.createElement('div');
    overlay.id = 'pwa-ios-modal';
    overlay.className = 'pwa-ios-overlay';

    var warningHtml = '';
    if (inApp) {
      warningHtml =
        '<div class="pwa-ios-warning">' +
          '⚠️ إنت بتفتح الموقع من داخل تطبيق (فيسبوك/إنستجرام أو مشابه)، وده بيمنع التثبيت.<br>' +
          'اضغط على أيقونة (⋮ أو •••) في أعلى الشاشة، واختر <strong>"فتح في المتصفح"</strong> أو <strong>"Open in Safari"</strong>، وبعدين كرر الخطوات دي.' +
        '</div>';
    }

    overlay.innerHTML =
      '<div class="pwa-ios-sheet">' +
        '<button class="pwa-ios-close" aria-label="إغلاق">✕</button>' +
        '<div class="pwa-ios-header">' +
          '<div class="pwa-ios-icon">📲</div>' +
          '<h3>تثبيت تطبيق أكاديمية سليم</h3>' +
          '<p>سفاري لا يسمح بالتثبيت التلقائي — اتبع الخطوات البسيطة دي:</p>' +
        '</div>' +
        warningHtml +
        '<div class="pwa-ios-steps">' +
          '<div class="pwa-ios-step">' +
            '<div class="pwa-ios-step-num">1</div>' +
            '<div class="pwa-ios-step-text">اضغط على أيقونة <strong>المشاركة</strong> ' +
              '<span class="pwa-ios-share-icon">' +
                '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1A56DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><rect x="4" y="14" width="16" height="7" rx="2"/></svg>' +
              '</span> في شريط سفاري السفلي (أو العلوي في الآيباد)' +
            '</div>' +
          '</div>' +
          '<div class="pwa-ios-step">' +
            '<div class="pwa-ios-step-num">2</div>' +
            '<div class="pwa-ios-step-text">مرّر لتحت ودوّر على خيار <strong>"إضافة إلى الشاشة الرئيسية"</strong> ' +
              '<span class="pwa-ios-add-icon">' +
                '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1A56DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>' +
              '</span> (Add to Home Screen)' +
            '</div>' +
          '</div>' +
          '<div class="pwa-ios-step">' +
            '<div class="pwa-ios-step-num">3</div>' +
            '<div class="pwa-ios-step-text">اضغط <strong>"إضافة"</strong> في أعلى الشاشة، وهتلاقي أيقونة التطبيق ظهرت على شاشتك الرئيسية 🎉</div>' +
          '</div>' +
        '</div>' +
        '<button class="pwa-ios-ok-btn">تمام، فهمت</button>' +
      '</div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('pwa-ios-visible'); });

    function closeModal() {
      overlay.classList.remove('pwa-ios-visible');
      setTimeout(function () { overlay.remove(); }, 250);
    }

    overlay.querySelector('.pwa-ios-close').addEventListener('click', closeModal);
    overlay.querySelector('.pwa-ios-ok-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
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
      '}' +

      /* ── Modal تعليمات iOS ── */
      '.pwa-ios-overlay{' +
        'position:fixed;inset:0;z-index:100000;' +
        'background:rgba(10,14,30,0);' +
        'display:flex;align-items:flex-end;justify-content:center;' +
        'opacity:0;visibility:hidden;' +
        'transition:background .25s ease,opacity .25s ease,visibility .25s;' +
        'font-family:Cairo,sans-serif;direction:rtl;' +
      '}' +
      '.pwa-ios-overlay.pwa-ios-visible{' +
        'background:rgba(10,14,30,.55);opacity:1;visibility:visible;' +
      '}' +
      '.pwa-ios-sheet{' +
        'background:#fff;width:100%;max-width:440px;' +
        'border-radius:20px 20px 0 0;' +
        'padding:22px 20px 26px;position:relative;' +
        'transform:translateY(24px);' +
        'transition:transform .28s ease;' +
        'box-shadow:0 -8px 40px rgba(0,0,0,.25);' +
        'max-height:88vh;overflow-y:auto;' +
      '}' +
      '@media(min-width:520px){' +
        '.pwa-ios-overlay{align-items:center;}' +
        '.pwa-ios-sheet{border-radius:20px;}' +
      '}' +
      '.pwa-ios-overlay.pwa-ios-visible .pwa-ios-sheet{transform:translateY(0);}' +
      '.pwa-ios-close{' +
        'position:absolute;top:14px;left:14px;' +
        'width:30px;height:30px;border-radius:50%;border:none;' +
        'background:#F1F4F9;color:#334155;font-size:1rem;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;' +
      '}' +
      '.pwa-ios-header{text-align:center;margin-bottom:14px;}' +
      '.pwa-ios-icon{font-size:2.4rem;margin-bottom:6px;}' +
      '.pwa-ios-header h3{margin:0 0 6px;color:#0F1B3D;font-size:1.15rem;font-weight:800;}' +
      '.pwa-ios-header p{margin:0;color:#5B6478;font-size:.88rem;line-height:1.5;}' +
      '.pwa-ios-warning{' +
        'background:#FFF6E5;border:1px solid #FFD98A;color:#8A5A00;' +
        'border-radius:12px;padding:10px 12px;font-size:.82rem;line-height:1.6;' +
        'margin-bottom:14px;' +
      '}' +
      '.pwa-ios-steps{display:flex;flex-direction:column;gap:12px;margin-bottom:18px;}' +
      '.pwa-ios-step{display:flex;align-items:flex-start;gap:10px;background:#F7F9FC;border-radius:12px;padding:10px 12px;}' +
      '.pwa-ios-step-num{' +
        'flex-shrink:0;width:24px;height:24px;border-radius:50%;' +
        'background:#1A56DB;color:#fff;font-size:.8rem;font-weight:800;' +
        'display:flex;align-items:center;justify-content:center;' +
      '}' +
      '.pwa-ios-step-text{font-size:.88rem;color:#1E293B;line-height:1.6;}' +
      '.pwa-ios-share-icon,.pwa-ios-add-icon{' +
        'display:inline-flex;vertical-align:middle;margin:0 3px;' +
        'background:#E8EFFD;border-radius:6px;padding:2px 4px;' +
      '}' +
      '.pwa-ios-ok-btn{' +
        'width:100%;padding:13px;border:none;border-radius:12px;' +
        'background:linear-gradient(135deg,#1342B0,#1A56DB);color:#fff;' +
        'font-family:Cairo,sans-serif;font-weight:800;font-size:.95rem;cursor:pointer;' +
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
