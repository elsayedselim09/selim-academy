/**
 * booking.js — Selim Academy Booking Component
 * استخدام: renderBooking('container-id')
 * يتطلب: Supabase JS v2 محمّل مسبقاً في الصفحة
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // CONFIG
  // ══════════════════════════════════════════════════════════
  var SUPABASE_URL = 'https://hjhoudwknwnxfndrgpfe.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaG91ZHdrbndueGZuZHJncGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODQ5MTksImV4cCI6MjA5MDM2MDkxOX0.QBRbZ0EewBc2FDX1D5v_bdwm_j0hGZ7s6jEgrCyJl2s';
  var WA_NUMBER   = '201012142749';

  // ══════════════════════════════════════════════════════════
  // STATE (per instance — stored on container element)
  // ══════════════════════════════════════════════════════════
  function getState(cid) {
    return window['__bk_' + cid] || (window['__bk_' + cid] = {
      dayCount: 1,
      currentCurriculum: 'sa',
      currentTrack: 'gen',
      courses: [],
      sb: null
    });
  }

  // ══════════════════════════════════════════════════════════
  // SUPABASE CLIENT (singleton per page)
  // ══════════════════════════════════════════════════════════
  function getSb() {
    if (!window._bk_sb) {
      // Supabase JS v2: window.supabase is the module, .createClient is the factory
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        window._bk_sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      } else if (window._sb && typeof window._sb.from === 'function') {
        // Already-initialised singleton passed from parent page
        window._bk_sb = window._sb;
      } else {
        console.error('booking.js: Supabase JS v2 not found. Make sure supabase-js is loaded before booking.js.');
        return null;
      }
    }
    return window._bk_sb;
  }

  // ══════════════════════════════════════════════════════════
  // DATA
  // ══════════════════════════════════════════════════════════
  var subjectsData = {
    prim1:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    prim2:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    prim3:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    prim4:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    prim5:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    prim6:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    mid1:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    mid2:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    mid3:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    high1:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','فيزياء','كيمياء','أحياء','التاريخ','الجغرافيا']},
    high2:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','فيزياء','كيمياء','أحياء','التاريخ','الجغرافيا']},
    high3:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','فيزياء','كيمياء','أحياء','التاريخ','الجغرافيا']},
    // UAE
    ae_p1:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم']},
    ae_p2:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم']},
    ae_p3:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم']},
    ae_p4:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم']},
    ae_p5:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم']},
    ae_p6:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم']},
    ae_m7:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    ae_m8:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    ae_m9:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية']},
    ae_h10_gen:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','فيزياء','كيمياء']},
    ae_h10_adv:{sem:false,subjects:['الرياضيات المتقدمة','فيزياء متقدمة','كيمياء متقدمة']},
    ae_h11_gen:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','فيزياء','كيمياء']},
    ae_h11_adv:{sem:false,subjects:['الرياضيات المتقدمة','فيزياء متقدمة','كيمياء متقدمة']},
    ae_h12_gen:{sem:false,subjects:['اللغة العربية','الرياضيات','اللغة الإنجليزية','فيزياء','كيمياء']},
    ae_h12_adv:{sem:false,subjects:['الرياضيات المتقدمة','فيزياء متقدمة','كيمياء متقدمة']}
  };

  var gradesByStage = {
    primary:[
      {val:'prim1',label:'الصف الأول الابتدائي'},{val:'prim2',label:'الصف الثاني الابتدائي'},
      {val:'prim3',label:'الصف الثالث الابتدائي'},{val:'prim4',label:'الصف الرابع الابتدائي'},
      {val:'prim5',label:'الصف الخامس الابتدائي'},{val:'prim6',label:'الصف السادس الابتدائي'}
    ],
    middle:[
      {val:'mid1',label:'الصف الأول المتوسط'},{val:'mid2',label:'الصف الثاني المتوسط'},
      {val:'mid3',label:'الصف الثالث المتوسط'}
    ],
    high:[
      {val:'high1',label:'الصف الأول الثانوي'},{val:'high2',label:'الصف الثاني الثانوي'},
      {val:'high3',label:'الصف الثالث الثانوي'}
    ]
  };

  var gradesByStage_ae = {
    primary:[
      {val:'ae_p1',label:'الصف الأول'},{val:'ae_p2',label:'الصف الثاني'},
      {val:'ae_p3',label:'الصف الثالث'},{val:'ae_p4',label:'الصف الرابع'},
      {val:'ae_p5',label:'الصف الخامس'},{val:'ae_p6',label:'الصف السادس'}
    ],
    middle:[
      {val:'ae_m7',label:'Grade 7'},{val:'ae_m8',label:'Grade 8'},{val:'ae_m9',label:'Grade 9'}
    ],
    high:[
      {val:'ae_h10',label:'Grade 10'},{val:'ae_h11',label:'Grade 11'},{val:'ae_h12',label:'Grade 12'}
    ]
  };

  var DAYS    = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
  var TIMES   = ['6:00 ص','7:00 ص','8:00 ص','9:00 ص','10:00 ص','11:00 ص','12:00 م','1:00 م','2:00 م','3:00 م','4:00 م','5:00 م','6:00 م','7:00 م','8:00 م','9:00 م','10:00 م','11:00 م','12:00 ص'];
  var CURRICULUMS = [
    {val:'sa',flag:'🇸🇦',name:'السعودية',sub:'المنهج السعودي'},
    {val:'ae',flag:'🇦🇪',name:'الإمارات',sub:'المنهج الإماراتي'},
    {val:'qa',flag:'🇶🇦',name:'قطر',sub:'المنهج القطري'},
    {val:'om',flag:'🇴🇲',name:'عُمان',sub:'المنهج العُماني'},
    {val:'kw',flag:'🇰🇼',name:'الكويت',sub:'المنهج الكويتي'},
    {val:'eg',flag:'🇪🇬',name:'مصر',sub:'المنهج المصري'},
    {val:'other',flag:'🌐',name:'دولة أخرى',sub:'منهج آخر'}
  ];

  // ══════════════════════════════════════════════════════════
  // CSS (injected once)
  // ══════════════════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('_bk_styles')) return;
    var css = `
      .bk-wrap{background:var(--gray-light,#F9FAFB);border:1px solid var(--gray-mid,#E5E7EB);border-radius:20px;padding:40px;max-width:860px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.07);font-family:'Cairo',sans-serif;direction:rtl}
      .bk-step-label{font-size:.8rem;color:#1A56DB;font-weight:700;margin-bottom:14px}
      .bk-curr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}
      .bk-curr-card{background:#fff;border:2px solid #E5E7EB;border-radius:14px;padding:14px 10px;text-align:center;cursor:pointer;transition:all .25s}
      .bk-curr-card:hover{border-color:#3B82F6;transform:translateY(-3px);box-shadow:0 4px 16px rgba(26,86,219,.15)}
      .bk-curr-card.active{border-color:#1A56DB;background:#EBF5FF;box-shadow:0 0 0 3px rgba(26,86,219,.15)}
      .bk-curr-flag{font-size:1.8rem;margin-bottom:7px;line-height:1}
      .bk-curr-name{font-size:.88rem;font-weight:700;color:#111928;margin-bottom:2px}
      .bk-curr-sub{font-size:.68rem;color:#6B7280}
      .bk-curr-card.active .bk-curr-name{color:#1A56DB}
      .bk-divider{height:1px;background:#E5E7EB;margin:24px 0}
      .bk-stage-btns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
      .bk-stage-btn{padding:9px 20px;border-radius:50px;border:2px solid #E5E7EB;background:#fff;color:#111928;font-family:'Cairo',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s}
      .bk-stage-btn:hover{border-color:#1A56DB;color:#1A56DB}
      .bk-stage-btn.active{background:#1A56DB;color:#fff;border-color:#1A56DB;box-shadow:0 4px 16px rgba(26,86,219,.25)}
      .bk-track-btns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
      .bk-track-btn{padding:9px 20px;border-radius:50px;border:2px solid #E5E7EB;background:#fff;color:#111928;font-family:'Cairo',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s}
      .bk-track-btn.active{background:#E65100;color:#fff;border-color:#E65100}
      .bk-top-row{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:16px}
      .bk-sel-group{display:flex;flex-direction:column;gap:7px}
      .bk-sel-group label{font-size:.78rem;color:#1A56DB;font-weight:700}
      .bk-sel-group select,.bk-sel-group input{background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:11px 14px;color:#111928;font-family:'Cairo',sans-serif;font-size:.9rem;cursor:pointer;outline:none;transition:border-color .2s;direction:rtl;width:100%}
      .bk-sel-group select:focus,.bk-sel-group input:focus{border-color:#1A56DB}
      .bk-day-row{display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:end;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;margin-bottom:12px;position:relative;transition:border-color .2s}
      .bk-day-row:hover{border-color:#3B82F6}
      .bk-row-num{position:absolute;top:-10px;right:16px;background:#1A56DB;color:#fff;font-size:.68rem;font-weight:700;padding:2px 10px;border-radius:50px;font-family:'Cairo',sans-serif}
      .bk-rm-btn{width:36px;height:36px;border-radius:50%;background:#FEE2E2;color:#DC2626;border:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;align-self:flex-end}
      .bk-rm-btn:hover{background:#DC2626;color:#fff}
      .bk-add-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:50px;background:#EBF5FF;color:#1A56DB;border:1.5px dashed rgba(26,86,219,.4);font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;margin-bottom:22px}
      .bk-add-btn:hover{background:#1A56DB;color:#fff;border-color:#1A56DB}
      .bk-form-wrap{display:none;margin-top:24px;border-top:1px solid #E5E7EB;padding-top:24px}
      .bk-form-wrap.show{display:block}
      .bk-summary{background:#EBF5FF;border:1px solid rgba(26,86,219,.2);border-radius:12px;padding:18px 22px;margin-bottom:20px;display:none}
      .bk-summary.show{display:block}
      .bk-summary h5{font-size:.82rem;color:#1A56DB;font-weight:700;margin-bottom:10px}
      .bk-summary-item{font-size:.88rem;color:#111928;margin-bottom:4px}
      .bk-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
      .bk-fg{display:flex;flex-direction:column;gap:7px;margin-bottom:16px}
      .bk-fg label{font-size:.78rem;color:#1A56DB;font-weight:700}
      .bk-fg input,.bk-fg select{background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:10px;padding:11px 14px;color:#111928;font-family:'Cairo',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;direction:rtl;width:100%}
      .bk-fg input:focus,.bk-fg select:focus{border-color:#1A56DB}
      .bk-courses-dropdown select{width:100%}
      .bk-submit-btn{width:100%;padding:14px;background:#1A56DB;color:#fff;border:none;border-radius:10px;font-family:'Cairo',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:8px}
      .bk-submit-btn:hover:not(:disabled){background:#1342B0;transform:translateY(-1px);box-shadow:0 6px 20px rgba(26,86,219,.3)}
      .bk-submit-btn:disabled{opacity:.7;cursor:not-allowed;transform:none}
      .bk-continue-btn{width:100%;padding:13px;background:#1A56DB;color:#fff;border:none;border-radius:10px;font-family:'Cairo',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:all .25s;margin-bottom:4px}
      .bk-continue-btn:hover{background:#1342B0}
      .bk-success{display:none;text-align:center;padding:24px;background:#ECFDF5;border:1px solid #6EE7B7;border-radius:12px;margin-top:14px;color:#065F46;font-size:1rem;font-weight:700}
      .bk-success.show{display:block}
      .bk-err{display:none;text-align:center;padding:14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;margin-top:10px;color:#EF4444;font-size:.9rem;font-weight:600}
      .bk-err.show{display:block}
      .bk-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:bk-spin .7s linear infinite;display:none}
      .bk-submit-btn.loading .bk-spinner{display:inline-block}
      .bk-submit-btn.loading .bk-btn-text{display:none}
      @keyframes bk-spin{to{transform:rotate(360deg)}}
      .bk-logged-in-note{background:#EBF5FF;border:1px solid rgba(26,86,219,.2);border-radius:10px;padding:12px 16px;font-size:.85rem;color:#1A56DB;font-weight:600;margin-bottom:16px;display:none}
      .bk-logged-in-note.show{display:block}
      @media(max-width:700px){
        .bk-wrap{padding:24px 18px}
        .bk-top-row{grid-template-columns:1fr}
        .bk-form-row{grid-template-columns:1fr}
        .bk-day-row{grid-template-columns:1fr 1fr auto}
      }
    `;
    var s = document.createElement('style');
    s.id = '_bk_styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ══════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════
  function toAr(n) {
    return String(n).replace(/[0-9]/g, function(d){ return '٠١٢٣٤٥٦٧٨٩'[d]; });
  }

  function q(cid, sel) {
    return document.querySelector('#' + cid + ' ' + sel);
  }

  function qa(cid, sel) {
    return document.querySelectorAll('#' + cid + ' ' + sel);
  }

  function daysOptions() {
    return '<option value="">اختار اليوم</option>' + DAYS.map(function(d){ return '<option>' + d + '</option>'; }).join('');
  }

  function timesOptions() {
    return '<option value="">اختار الوقت</option>' + TIMES.map(function(t){ return '<option>' + t + '</option>'; }).join('');
  }

  function coursesOptions(courses) {
    if (!courses || !courses.length) return '<option value="">لا توجد كورسات</option>';
    return '<option value="">اختار الكورس (اختياري)</option>' + courses.map(function(c){
      return '<option value="' + c.id + '">' + (c.icon || '📚') + ' ' + c.name + '</option>';
    }).join('');
  }

  // ══════════════════════════════════════════════════════════
  // HTML TEMPLATE
  // ══════════════════════════════════════════════════════════
  function buildHTML(cid, courses) {
    var currCards = CURRICULUMS.map(function(c) {
      return '<div class="bk-curr-card" data-val="' + c.val + '" onclick="window.__bk_fn.selectCurriculum(\'' + cid + '\',this,\'' + c.val + '\')">' +
        '<div class="bk-curr-flag">' + c.flag + '</div>' +
        '<div class="bk-curr-name">' + c.name + '</div>' +
        '<div class="bk-curr-sub">' + c.sub + '</div>' +
        '</div>';
    }).join('');

    var gradeOpts = '<option value="">اختار الصف</option>' + gradesByStage.primary.map(function(g){
      return '<option value="' + g.val + '">' + g.label + '</option>';
    }).join('');

    return '<div class="bk-wrap">' +

      // STEP 1: Curriculum
      '<p class="bk-step-label">🌍 الخطوة 1 — اختار منهجك الدراسي</p>' +
      '<div class="bk-curr-grid">' + currCards + '</div>' +
      '<input type="hidden" id="' + cid + '-curriculum" value="">' +
      '<div class="bk-divider"></div>' +

      // STEP 2: Grade + Subject
      '<p class="bk-step-label">📚 الخطوة 2 — اختار الصف والمادة</p>' +
      '<div class="bk-stage-btns">' +
        '<button type="button" class="bk-stage-btn active" onclick="window.__bk_fn.selectStage(\'' + cid + '\',\'primary\',this)">🎒 الابتدائية</button>' +
        '<button type="button" class="bk-stage-btn" onclick="window.__bk_fn.selectStage(\'' + cid + '\',\'middle\',this)">📚 المتوسطة</button>' +
        '<button type="button" class="bk-stage-btn" onclick="window.__bk_fn.selectStage(\'' + cid + '\',\'high\',this)">🎓 الثانوية</button>' +
      '</div>' +
      '<div class="bk-top-row">' +
        '<div class="bk-sel-group"><label>الصف الدراسي</label><select id="' + cid + '-grade" onchange="window.__bk_fn.updateSubjects(\'' + cid + '\')">' + gradeOpts + '</select></div>' +
        '<div class="bk-sel-group" id="' + cid + '-sem-group" style="display:none"><label>الفصل الدراسي</label><select id="' + cid + '-semester" onchange="window.__bk_fn.updateSubjects(\'' + cid + '\')"><option value="">اختار الفصل</option><option value="1">الفصل الأول</option><option value="2">الفصل الثاني</option><option value="3">الفصل الثالث</option></select></div>' +
      '</div>' +
      '<div id="' + cid + '-track-group" style="display:none;margin-bottom:14px"><p class="bk-step-label" style="color:#E65100">المسار الدراسي</p><div class="bk-track-btns"><button type="button" class="bk-track-btn" onclick="window.__bk_fn.selectTrack(\'' + cid + '\',\'gen\',this)">📘 المسار العام</button><button type="button" class="bk-track-btn" onclick="window.__bk_fn.selectTrack(\'' + cid + '\',\'adv\',this)">🚀 المسار المتقدم</button></div></div>' +
      '<div class="bk-sel-group" style="margin-bottom:22px"><label>المادة</label><select id="' + cid + '-subject"><option value="">اختار الصف أولاً</option></select></div>' +

      // STEP 3: Days
      '<p class="bk-step-label">📅 الخطوة 3 — اختار الأيام والأوقات</p>' +
      '<div id="' + cid + '-days">' +
        '<div class="bk-day-row" id="' + cid + '-dayRow1">' +
          '<div class="bk-row-num">اليوم ١</div>' +
          '<div class="bk-sel-group"><label>اليوم</label><select>' + daysOptions() + '</select></div>' +
          '<div class="bk-sel-group"><label>الوقت</label><select>' + timesOptions() + '</select></div>' +
          '<div></div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="bk-add-btn" onclick="window.__bk_fn.addDay(\'' + cid + '\')"><span style="font-size:1.2rem;font-weight:900">+</span> إضافة يوم آخر</button>' +

      // Session type
      '<div class="bk-sel-group" style="margin-bottom:22px"><label>نوع الحصة</label><select id="' + cid + '-type"><option value="">اختار النوع</option><option>حصة فردية</option><option>مجموعة صغيرة</option><option>مراجعة امتحانات</option></select></div>' +

      // Continue button
      '<button type="button" class="bk-continue-btn" onclick="window.__bk_fn.showForm(\'' + cid + '\')">متابعة التسجيل ←</button>' +

      // Form
      '<div class="bk-form-wrap" id="' + cid + '-form">' +
        '<div class="bk-summary" id="' + cid + '-summary"><h5>📋 ملخص الحجز</h5><div id="' + cid + '-summary-content"></div></div>' +
        '<h4 style="margin-bottom:18px;font-size:1.05rem;font-weight:900;color:#1A56DB">أكمل بيانات التسجيل</h4>' +
        // Logged-in note
        '<div class="bk-logged-in-note" id="' + cid + '-loggedin-note">✅ أنت مسجل دخول — سيتم ربط طلبك بحسابك تلقائياً</div>' +
        '<div class="bk-form-row">' +
          '<div class="bk-fg"><label>اسم الطالب</label><input type="text" id="' + cid + '-fname" placeholder="الاسم بالكامل"></div>' +
          '<div class="bk-fg"><label>رقم الهاتف / ولي الأمر</label><input type="tel" id="' + cid + '-fphone" placeholder="05xxxxxxxx"></div>' +
        '</div>' +
        '<div class="bk-fg"><label>اسم المدرسة</label><input type="text" id="' + cid + '-fschool" placeholder="اسم المدرسة"></div>' +
        '<div class="bk-fg bk-courses-dropdown"><label>الكورس المطلوب (اختياري)</label><select id="' + cid + '-fcourse">' + coursesOptions(courses) + '</select></div>' +
        '<button type="button" class="bk-submit-btn" id="' + cid + '-submit-btn" onclick="window.__bk_fn.submit(\'' + cid + '\')">' +
          '<span class="bk-btn-text">✅ تأكيد الحجز</span>' +
          '<span class="bk-spinner"></span>' +
        '</button>' +
        '<div class="bk-success" id="' + cid + '-success">🎉 تم استلام طلبك وتسجيله! سيتواصل معك م. السيد سليم قريباً.</div>' +
        '<div class="bk-err" id="' + cid + '-err"></div>' +
      '</div>' +

    '</div>'; // end bk-wrap
  }

  // ══════════════════════════════════════════════════════════
  // FUNCTIONS (global namespace for inline handlers)
  // ══════════════════════════════════════════════════════════
  window.__bk_fn = {

    selectCurriculum: function(cid, el, val) {
      qa(cid, '.bk-curr-card').forEach(function(c){ c.classList.remove('active'); });
      el.classList.add('active');
      document.getElementById(cid + '-curriculum').value = val;
      var st = getState(cid);
      st.currentCurriculum = val;
      // reset grade/subject
      var grades = (val === 'ae') ? gradesByStage_ae : gradesByStage;
      var gradeEl = document.getElementById(cid + '-grade');
      var activeStageBtn = q(cid, '.bk-stage-btn.active');
      var stage = 'primary';
      if (activeStageBtn) {
        var txt = activeStageBtn.textContent;
        stage = txt.includes('ابتدائي') ? 'primary' : txt.includes('متوسط') ? 'middle' : 'high';
      }
      gradeEl.innerHTML = '<option value="">اختار الصف</option>' + (grades[stage] || grades['primary']).map(function(g){ return '<option value="' + g.val + '">' + g.label + '</option>'; }).join('');
      document.getElementById(cid + '-subject').innerHTML = '<option value="">اختار الصف أولاً</option>';
      document.getElementById(cid + '-sem-group').style.display = 'none';
      var tg = document.getElementById(cid + '-track-group');
      if (tg) tg.style.display = 'none';
    },

    selectStage: function(cid, stage, btn) {
      qa(cid, '.bk-stage-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var st = getState(cid);
      var grades = (st.currentCurriculum === 'ae') ? gradesByStage_ae : gradesByStage;
      var gradeEl = document.getElementById(cid + '-grade');
      gradeEl.innerHTML = '<option value="">اختار الصف</option>' + (grades[stage] || []).map(function(g){ return '<option value="' + g.val + '">' + g.label + '</option>'; }).join('');
      document.getElementById(cid + '-subject').innerHTML = '<option value="">اختار الصف أولاً</option>';
      document.getElementById(cid + '-sem-group').style.display = 'none';
      var tg = document.getElementById(cid + '-track-group');
      if (tg) tg.style.display = 'none';
    },

    selectTrack: function(cid, track, btn) {
      qa(cid, '.bk-track-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var st = getState(cid);
      st.currentTrack = track;
      window.__bk_fn.updateSubjects(cid);
    },

    updateSubjects: function(cid) {
      var st = getState(cid);
      var gradeVal = document.getElementById(cid + '-grade').value;
      var semVal   = document.getElementById(cid + '-semester').value;
      var subEl    = document.getElementById(cid + '-subject');
      var semGrp   = document.getElementById(cid + '-sem-group');
      var trkGrp   = document.getElementById(cid + '-track-group');
      if (!gradeVal) { subEl.innerHTML = '<option value="">اختار الصف أولاً</option>'; semGrp.style.display = 'none'; return; }
      var isAEHigh = st.currentCurriculum === 'ae' && (gradeVal === 'ae_h10' || gradeVal === 'ae_h11' || gradeVal === 'ae_h12');
      if (trkGrp) trkGrp.style.display = isAEHigh ? 'block' : 'none';
      var key = isAEHigh ? gradeVal + '_' + st.currentTrack : gradeVal;
      var data = subjectsData[key];
      if (!data) { subEl.innerHTML = '<option value="">اختار المادة</option>'; return; }
      if (data.sem) {
        semGrp.style.display = 'flex';
        if (!semVal) { subEl.innerHTML = '<option value="">اختار الفصل أولاً</option>'; return; }
        var subs = data.subjects[semVal] || [];
        subEl.innerHTML = '<option value="">اختار المادة</option>' + subs.map(function(s){ return '<option>' + s + '</option>'; }).join('');
      } else {
        semGrp.style.display = 'none';
        subEl.innerHTML = '<option value="">اختار المادة</option>' + data.subjects.map(function(s){ return '<option>' + s + '</option>'; }).join('');
      }
    },

    addDay: function(cid) {
      var st = getState(cid);
      st.dayCount++;
      var n = st.dayCount;
      var container = document.getElementById(cid + '-days');
      var row = document.createElement('div');
      row.className = 'bk-day-row';
      row.id = cid + '-dayRow' + n;
      row.style.animation = 'none';
      row.innerHTML =
        '<div class="bk-row-num">اليوم ' + toAr(n) + '</div>' +
        '<div class="bk-sel-group"><label>اليوم</label><select>' + daysOptions() + '</select></div>' +
        '<div class="bk-sel-group"><label>الوقت</label><select>' + timesOptions() + '</select></div>' +
        '<button class="bk-rm-btn" onclick="window.__bk_fn.removeDay(\'' + cid + '\',' + n + ')" title="حذف">✕</button>';
      container.appendChild(row);
    },

    removeDay: function(cid, id) {
      var row = document.getElementById(cid + '-dayRow' + id);
      if (!row) return;
      row.style.transition = 'all .25s';
      row.style.opacity = '0';
      row.style.transform = 'translateY(-8px)';
      setTimeout(function() {
        row.remove();
        var rows = document.querySelectorAll('#' + cid + '-days .bk-day-row');
        rows.forEach(function(r, i) {
          var num = r.querySelector('.bk-row-num');
          if (num) num.textContent = 'اليوم ' + toAr(i + 1);
        });
      }, 250);
    },

    showForm: function(cid) {
      var curriculum = document.getElementById(cid + '-curriculum').value;
      var grade      = document.getElementById(cid + '-grade').value;
      var subject    = document.getElementById(cid + '-subject').value;
      if (!curriculum) { alert('من فضلك اختار المنهج الدراسي أولاً.'); return; }
      if (!grade || !subject || subject === 'اختار الصف أولاً' || subject === 'اختار الفصل أولاً') { alert('من فضلك اختار الصف والمادة.'); return; }
      var rows = document.querySelectorAll('#' + cid + '-days .bk-day-row');
      var ok = true;
      rows.forEach(function(r) {
        var sels = r.querySelectorAll('select');
        if (!sels[0].value || !sels[1].value) ok = false;
      });
      if (!ok) { alert('من فضلك اختار اليوم والوقت لكل الأيام المضافة.'); return; }
      var summary = '<div class="bk-summary-item">🌍 المنهج: <strong>' + curriculum.toUpperCase() + '</strong></div>' +
                    '<div class="bk-summary-item">📚 الصف: <strong>' + grade + '</strong> — ' + subject + '</div>';
      rows.forEach(function(r, i) {
        var sels = r.querySelectorAll('select');
        summary += '<div class="bk-summary-item">📅 اليوم ' + toAr(i + 1) + ': <strong>' + sels[0].value + '</strong> — ' + sels[1].value + '</div>';
      });
      document.getElementById(cid + '-summary-content').innerHTML = summary;
      document.getElementById(cid + '-summary').classList.add('show');
      var formEl = document.getElementById(cid + '-form');
      formEl.classList.add('show');
      formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Show logged-in note if session exists
      var sb = getSb();
      if (sb) {
        sb.auth.getSession().then(function(res) {
          if (res.data && res.data.session) {
            document.getElementById(cid + '-loggedin-note').classList.add('show');
          }
        });
      }
    },

    submit: async function(cid) {

      // ══════════════════════════════════════════════
      // 1. HELPERS
      // ══════════════════════════════════════════════
      var errEl     = document.getElementById(cid + '-err');
      var successEl = document.getElementById(cid + '-success');
      var btn       = document.getElementById(cid + '-submit-btn');

      function showErr(msg) {
        errEl.textContent = msg;
        errEl.classList.add('show');
        successEl.classList.remove('show');
        btn.classList.remove('loading');
        btn.disabled = false;
      }

      function setLoading(on) {
        btn.classList.toggle('loading', on);
        btn.disabled = on;
      }

      // ══════════════════════════════════════════════
      // 2. COLLECT FORM VALUES
      // ══════════════════════════════════════════════
      var name     = document.getElementById(cid + '-fname').value.trim();
      var phone    = document.getElementById(cid + '-fphone').value.trim();
      var school   = document.getElementById(cid + '-fschool').value.trim();
      var grade    = document.getElementById(cid + '-grade').value;
      var subject  = document.getElementById(cid + '-subject').value;
      var type     = document.getElementById(cid + '-type').value;
      var curric   = document.getElementById(cid + '-curriculum').value;
      var courseEl = document.getElementById(cid + '-fcourse');
      var courseId = (courseEl && courseEl.value) ? courseEl.value : null;

      var rows = document.querySelectorAll('#' + cid + '-days .bk-day-row');
      var daysArr = [];
      rows.forEach(function(r) {
        var sels = r.querySelectorAll('select');
        if (sels[0] && sels[1]) daysArr.push(sels[0].value + ' — ' + sels[1].value);
      });
      var daysText = daysArr.map(function(d, i) { return '\n   • اليوم ' + (i + 1) + ': ' + d; }).join('');

      // ══════════════════════════════════════════════
      // 3. VALIDATION
      // ══════════════════════════════════════════════
      errEl.classList.remove('show');
      successEl.classList.remove('show');

      // Name: at least 3 Arabic/Latin chars
      if (!name || name.length < 3) {
        showErr('⚠️ من فضلك أدخل الاسم كاملاً (٣ أحرف على الأقل).');
        document.getElementById(cid + '-fname').focus();
        return;
      }

      // Phone: strip spaces/dashes then validate
      // Accepted formats: 05xxxxxxxx (SA/Gulf), +966xxxxxxxxx, 01xxxxxxxxx (EG), +20xxxxxxxxxx
      var phoneClean = phone.replace(/[\s\-().]/g, '');
      var phoneValid = /^(\+?\d{9,15})$/.test(phoneClean) &&
                       (/^(05\d{8}|\+9665\d{8}|9665\d{8})$/.test(phoneClean) ||  // SA/Gulf 05xx
                        /^(01\d{9}|\+201\d{9}|201\d{9})$/.test(phoneClean) ||    // Egypt 01x
                        /^\+?\d{9,15}$/.test(phoneClean));                        // any intl
      if (!phoneClean) {
        showErr('⚠️ من فضلك أدخل رقم الهاتف.');
        document.getElementById(cid + '-fphone').focus();
        return;
      }
      if (!/^\+?\d{9,15}$/.test(phoneClean)) {
        showErr('⚠️ رقم الهاتف غير صحيح — تأكد من إدخال أرقام فقط مع كود الدولة إذا لزم (مثال: 05xxxxxxxx أو +966xxxxxxxxx).');
        document.getElementById(cid + '-fphone').focus();
        return;
      }

      if (!school || school.length < 2) {
        showErr('⚠️ من فضلك أدخل اسم المدرسة.');
        document.getElementById(cid + '-fschool').focus();
        return;
      }

      if (!curric) {
        showErr('⚠️ من فضلك اختار المنهج الدراسي.');
        return;
      }
      if (!grade || !subject || subject.startsWith('اختار')) {
        showErr('⚠️ من فضلك اختار الصف والمادة.');
        return;
      }
      if (!type) {
        showErr('⚠️ من فضلك اختار نوع الحصة.');
        return;
      }
      // Ensure all day rows have day + time selected
      var daysOk = daysArr.every(function(d) { return !d.includes('اختار'); });
      if (!daysOk || daysArr.length === 0) {
        showErr('⚠️ من فضلك اختار اليوم والوقت لجميع الأيام.');
        return;
      }

      // ══════════════════════════════════════════════
      // 4. START LOADING
      // ══════════════════════════════════════════════
      setLoading(true);

      // ══════════════════════════════════════════════
      // 5. SUPABASE INSERT — يجب أن ينجح أولاً
      // ══════════════════════════════════════════════
      var sb = getSb();

      if (!sb) {
        // Supabase غير متاح: نكمل بواتساب فقط مع تحذير
        console.warn('booking.js: Supabase unavailable — skipping DB insert, opening WhatsApp only.');
      } else {
        try {
          // الحصول على المستخدم المسجّل (إن وُجد)
          var userId = null;
          var sessionRes = await sb.auth.getSession();
          if (sessionRes.data && sessionRes.data.session) {
            userId = sessionRes.data.session.user.id;
          }

          // بناء الـ record — insert يتوقع array في v2
          var record = {
            status : 'pending',
            note   : [
              'الاسم: '    + name,
              'الهاتف: '   + phoneClean,
              'المدرسة: '  + school,
              'المنهج: '   + curric,
              'الصف: '     + grade,
              'المادة: '   + subject,
              'النوع: '    + type,
              'الأيام: '   + daysArr.join(' / ')
            ].join(' | ')
          };
          if (userId)   record.user_id   = userId;
          if (courseId) record.course_id = courseId;

          // ✅ insert كـ array — هذا هو الشكل الصحيح في Supabase JS v2
          var insertRes = await sb.from('subscription_requests').insert([record]);

          // v2 يُعيد { data, error, status, statusText }
          var dbErr = insertRes.error;

          if (dbErr) {
            // ❌ فشل الحفظ — أوقف التنفيذ وأظهر الخطأ للمستخدم
            console.error('Supabase insert error:', dbErr);
            var userMsg = '❌ حدث خطأ أثناء حفظ طلبك. ';
            if (dbErr.code === '23505') {
              userMsg += 'يبدو أن هناك طلباً مشابهاً مسبقاً.';
            } else if (dbErr.code === '42501' || dbErr.message.includes('permission')) {
              userMsg += 'خطأ في الصلاحيات — تواصل معنا مباشرة عبر واتساب.';
            } else if (dbErr.message) {
              userMsg += '(' + dbErr.message + ')';
            }
            showErr(userMsg);
            return; // ⛔ لا تفتح واتساب إذا فشل الحفظ
          }

          // ✅ insert نجح
          console.info('booking.js: Request saved to Supabase successfully.');

        } catch (networkErr) {
          // خطأ في الشبكة أو exception غير متوقع
          console.error('booking.js: Unexpected error during insert:', networkErr);
          showErr('❌ تعذّر الاتصال بالخادم. تحقق من الإنترنت وأعد المحاولة.');
          return; // ⛔ لا تكمل
        }
      }

      // ══════════════════════════════════════════════
      // 6. SUCCESS → فتح واتساب (فقط بعد نجاح الحفظ)
      // ══════════════════════════════════════════════
      setLoading(false);
      successEl.classList.add('show');
      errEl.classList.remove('show');

      var waMsg =
        '📚 *حجز جديد — أكاديمية سليم*\n' +
        '━━━━━━━━━━━━━━━\n' +
        '👤 *اسم الطالب:* ' + name + '\n' +
        '📞 *رقم الهاتف:* ' + phoneClean + '\n' +
        '🏫 *المدرسة:* '    + school + '\n' +
        '━━━━━━━━━━━━━━━\n' +
        '🌍 *المنهج:* '     + curric + '\n' +
        '📖 *الصف:* '       + grade + '\n' +
        '📝 *المادة:* '     + subject + '\n' +
        '🎯 *نوع الحصة:* '  + type + '\n' +
        '📅 *الأيام والأوقات:*' + daysText + '\n' +
        '━━━━━━━━━━━━━━━\n' +
        '✅ أرجو تأكيد الحجز، شكراً!';

      // فتح واتساب بعد 900ms لإتاحة رؤية رسالة النجاح
      setTimeout(function() {
        window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waMsg), '_blank');
      }, 900);

      // ══════════════════════════════════════════════
      // 7. RESET FORM FIELDS
      // ══════════════════════════════════════════════
      document.getElementById(cid + '-fname').value   = '';
      document.getElementById(cid + '-fphone').value  = '';
      document.getElementById(cid + '-fschool').value = '';
      if (courseEl) courseEl.value = '';
      btn.disabled = true; // منع إعادة الإرسال بعد النجاح
    }
  };

  // ══════════════════════════════════════════════════════════
  // FETCH COURSES
  // ══════════════════════════════════════════════════════════
  async function fetchCourses() {
    var sb = getSb();
    if (!sb) return [];
    try {
      var { data, error } = await sb.from('courses').select('id,name,icon').order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch (e) { return []; }
  }

  // ══════════════════════════════════════════════════════════
  // MAIN EXPORT
  // ══════════════════════════════════════════════════════════
  window.renderBooking = async function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) { console.error('renderBooking: container #' + containerId + ' not found'); return; }

    injectStyles();

    // loader
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#6B7280;font-family:Cairo,sans-serif">⏳ جاري التحميل...</div>';

    var courses = await fetchCourses();
    getState(containerId).courses = courses;

    container.innerHTML = buildHTML(containerId, courses);
  };

})();
