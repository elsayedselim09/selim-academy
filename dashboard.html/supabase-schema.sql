-- Execute in Supabase SQL Editor once.
-- This schema is optimized for a single-page dashboard with RLS.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  teacher_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  status text not null check (status in ('now', 'soon', 'coming', 'done')),
  meeting_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null,
  sessions_per_month int not null default 12,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null check (status in ('active', 'expired', 'paused')),
  created_at timestamptz not null default now()
);

create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_sessions_student_id_start_time on public.sessions(student_id, start_time);
create index if not exists idx_notifications_student_id_created_at on public.notifications(student_id, created_at desc);
create index if not exists idx_subscriptions_student_id_end_date on public.subscriptions(student_id, end_date desc);

alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.sessions enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.courses enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (id = auth.uid());

drop policy if exists profiles_upsert_own on public.profiles;
create policy profiles_upsert_own on public.profiles
for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists enrollments_select_own on public.enrollments;
create policy enrollments_select_own on public.enrollments
for select using (student_id = auth.uid());

drop policy if exists sessions_select_own on public.sessions;
create policy sessions_select_own on public.sessions
for select using (student_id = auth.uid());

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
for select using (student_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
for update using (student_id = auth.uid());

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
for select using (student_id = auth.uid());

drop policy if exists courses_select_for_enrolled on public.courses;
create policy courses_select_for_enrolled on public.courses
for select using (
  exists (
    select 1
    from public.enrollments e
    where e.course_id = courses.id
      and e.student_id = auth.uid()
  )
);

create or replace function public.bootstrap_my_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  c_math uuid;
  c_physics uuid;
  c_chem uuid;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  insert into public.profiles (id, full_name, phone, email)
  values (v_user, 'طالب أكاديمية سليم', '0500000000', null)
  on conflict (id) do update
  set updated_at = now();

  insert into public.courses (title, teacher_name)
  values
    ('رياضيات الثانوي', 'م. السيد سليم'),
    ('فيزياء الثانوي', 'م. السيد سليم'),
    ('كيمياء الثانوي', 'م. السيد سليم')
  on conflict do nothing;

  select id into c_math from public.courses where title = 'رياضيات الثانوي' limit 1;
  select id into c_physics from public.courses where title = 'فيزياء الثانوي' limit 1;
  select id into c_chem from public.courses where title = 'كيمياء الثانوي' limit 1;

  insert into public.enrollments (student_id, course_id, progress_percent)
  values
    (v_user, c_math, 72),
    (v_user, c_physics, 45),
    (v_user, c_chem, 30)
  on conflict (student_id, course_id) do update
  set progress_percent = excluded.progress_percent,
      updated_at = now();

  insert into public.sessions (student_id, title, start_time, status, meeting_url)
  values
    (v_user, 'رياضيات - المشتقات', now() + interval '1 hour', 'soon', 'https://zoom.us'),
    (v_user, 'فيزياء - الموجات الضوئية', now() + interval '1 day', 'coming', 'https://zoom.us'),
    (v_user, 'كيمياء - الجدول الدوري', now() + interval '2 days', 'coming', null)
  on conflict do nothing;

  insert into public.notifications (student_id, title, body, is_read)
  values
    (v_user, 'حصة خلال ساعة', 'لديك حصة رياضيات بعد ساعة.', false),
    (v_user, 'درس جديد', 'تم نشر درس جديد في الفيزياء.', false),
    (v_user, 'ممتاز', 'تقدمت بنسبة جيدة هذا الأسبوع.', true)
  on conflict do nothing;

  insert into public.subscriptions (student_id, plan_name, sessions_per_month, start_date, end_date, status)
  values
    (v_user, 'اشتراك فردي', 12, now() - interval '3 day', now() + interval '27 day', 'active')
  on conflict do nothing;
end;
$$;

revoke all on function public.bootstrap_my_demo_data() from public;
grant execute on function public.bootstrap_my_demo_data() to authenticated;
