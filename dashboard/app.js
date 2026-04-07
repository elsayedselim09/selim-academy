const authCard = document.getElementById("auth-card");
const dashboard = document.getElementById("dashboard");
const authMsg = document.getElementById("auth-msg");
const profileMsg = document.getElementById("profile-msg");

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  authMsg.textContent = "انسخ supabase-config.example.js إلى supabase-config.js وأضف بيانات مشروعك.";
  authMsg.className = "status err";
  throw new Error("Supabase config missing");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function setMsg(el, message, isError = false) {
  el.textContent = message;
  el.className = `status ${isError ? "err" : "ok"}`;
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString("ar-EG");
  } catch {
    return value || "-";
  }
}

function renderCourses(courses) {
  const root = document.getElementById("courses-list");
  if (!courses.length) {
    root.innerHTML = "<p class='muted'>لا توجد كورسات حتى الآن.</p>";
    return;
  }
  root.innerHTML = courses.map((row) => {
    const title = row.courses?.title || "كورس";
    const teacher = row.courses?.teacher_name || "-";
    const progress = row.progress_percent ?? 0;
    return `
      <div class="item">
        <div class="row"><strong>${title}</strong><span class="tag">${progress}%</span></div>
        <div class="muted">${teacher}</div>
      </div>
    `;
  }).join("");
}

function renderSessions(sessions) {
  const root = document.getElementById("sessions-list");
  if (!sessions.length) {
    root.innerHTML = "<p class='muted'>لا توجد حصص قادمة.</p>";
    return;
  }
  root.innerHTML = sessions.map((row) => `
    <div class="item">
      <div class="row"><strong>${row.title}</strong><span class="tag">${row.status}</span></div>
      <div class="muted">${formatDate(row.start_time)}</div>
      ${row.meeting_url ? `<a href="${row.meeting_url}" target="_blank" rel="noopener">دخول الحصة</a>` : ""}
    </div>
  `).join("");
}

function renderNotifications(rows) {
  const root = document.getElementById("notifications-list");
  if (!rows.length) {
    root.innerHTML = "<p class='muted'>لا توجد إشعارات.</p>";
    return;
  }
  root.innerHTML = rows.map((row) => `
    <div class="item">
      <div class="row"><strong>${row.title}</strong>${!row.is_read ? "<span class='tag'>جديد</span>" : ""}</div>
      <div>${row.body || ""}</div>
      <div class="muted">${formatDate(row.created_at)}</div>
    </div>
  `).join("");
}

function renderSubscription(row) {
  const root = document.getElementById("subscription-box");
  if (!row) {
    root.innerHTML = "<p class='muted'>لا يوجد اشتراك.</p>";
    return;
  }
  root.innerHTML = `
    <div class="item">
      <div class="row"><strong>${row.plan_name}</strong><span class="tag">${row.status}</span></div>
      <div class="muted">بداية: ${formatDate(row.start_date)}</div>
      <div class="muted">نهاية: ${formatDate(row.end_date)}</div>
      <div class="muted">جلسات شهرية: ${row.sessions_per_month ?? "-"}</div>
    </div>
  `;
}

async function loadDashboard() {
  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp?.user;
  if (!user) return;

  const [profileRes, enrollRes, sessionsRes, notifRes, subRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("enrollments")
      .select("id,progress_percent,courses(title,teacher_name)")
      .eq("student_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("sessions")
      .select("id,title,start_time,status,meeting_url")
      .eq("student_id", user.id)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(8),
    supabase
      .from("notifications")
      .select("id,title,body,is_read,created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("student_id", user.id)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const profile = profileRes.data;
  const enrollments = enrollRes.data || [];
  const sessions = sessionsRes.data || [];
  const notifications = notifRes.data || [];
  const subscription = subRes.data || null;

  document.getElementById("welcome").textContent = `أهلا ${profile?.full_name || user.email || ""}`;
  document.getElementById("full-name").value = profile?.full_name || "";
  document.getElementById("phone").value = profile?.phone || "";

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, x) => sum + (x.progress_percent || 0), 0) / enrollments.length)
    : 0;
  const unread = notifications.filter((x) => !x.is_read).length;

  document.getElementById("stat-courses").textContent = String(enrollments.length);
  document.getElementById("stat-sessions").textContent = String(sessions.length);
  document.getElementById("stat-progress").textContent = `${avgProgress}%`;
  document.getElementById("stat-notifs").textContent = String(unread);

  renderCourses(enrollments);
  renderSessions(sessions);
  renderNotifications(notifications);
  renderSubscription(subscription);
}

async function switchToDashboardIfLoggedIn() {
  const { data: sessionRes } = await supabase.auth.getSession();
  if (!sessionRes?.session) {
    authCard.classList.remove("hidden");
    dashboard.classList.add("hidden");
    return;
  }
  authCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  await loadDashboard();
}

document.getElementById("auth-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setMsg(authMsg, error.message, true);
    return;
  }
  setMsg(authMsg, "تم تسجيل الدخول بنجاح");
  await switchToDashboardIfLoggedIn();
});

document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    setMsg(authMsg, error.message, true);
    return;
  }
  setMsg(authMsg, "تم إنشاء الحساب. فعّل البريد إن كان مطلوبا ثم سجل الدخول.");
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  await switchToDashboardIfLoggedIn();
});

document.getElementById("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp?.user;
  if (!user) {
    setMsg(profileMsg, "يجب تسجيل الدخول أولا", true);
    return;
  }

  const payload = {
    id: user.id,
    full_name: document.getElementById("full-name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: user.email
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    setMsg(profileMsg, error.message, true);
    return;
  }
  setMsg(profileMsg, "تم حفظ البيانات.");
  await loadDashboard();
});

document.getElementById("seed-btn").addEventListener("click", async () => {
  const { error } = await supabase.rpc("bootstrap_my_demo_data");
  if (error) {
    setMsg(profileMsg, `فشل تهيئة البيانات: ${error.message}`, true);
    return;
  }
  setMsg(profileMsg, "تمت تهيئة بيانات تجريبية لحسابك.");
  await loadDashboard();
});

supabase.auth.onAuthStateChange(async () => {
  await switchToDashboardIfLoggedIn();
});

switchToDashboardIfLoggedIn();
