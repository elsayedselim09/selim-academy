# Dynamic Dashboard with Supabase

This folder now contains a fully dynamic dashboard that reads/writes data from Supabase.

## Files

- `dashboard.html`: Main app page
- `styles.css`: UI styling
- `app.js`: Dynamic logic, auth, profile updates, and data loading
- `supabase-schema.sql`: Tables, indexes, RLS policies, and demo data function
- `supabase-config.example.js`: Example client config

## Setup

1. In Supabase SQL Editor, run `supabase-schema.sql`.
2. Copy `supabase-config.example.js` into a new file named `supabase-config.js`.
3. Fill your project URL and anon key inside `supabase-config.js`.
4. Open `dashboard.html` in browser.
5. Sign up/sign in.
6. Click `تهيئة بيانات تجريبية` once to seed your account data.

## Notes

- Data is protected with RLS and scoped to the logged-in user (`auth.uid()`).
- You can adapt table names or fields in both `supabase-schema.sql` and `app.js` as needed.
