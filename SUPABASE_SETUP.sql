-- =========================================================================
-- ZALEMBA SUPABASE COMPLETE SETUP SCRIPT
-- Paste and run this in your Supabase Dashboard:
-- 1. Go to your Supabase project (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this entire script, and click "Run" (or Ctrl+Enter)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. SAVED DOCUMENTS TABLE & ROW-LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
create table if not exists public.saved_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.saved_documents enable row level security;

revoke all on table public.saved_documents from anon, authenticated;
grant select, insert, update, delete on table public.saved_documents to authenticated;

drop policy if exists "users can select their own documents" on public.saved_documents;
create policy "users can select their own documents"
on public.saved_documents for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "users can insert their own documents" on public.saved_documents;
create policy "users can insert their own documents"
on public.saved_documents for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "users can update their own documents" on public.saved_documents;
create policy "users can update their own documents"
on public.saved_documents for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "users can delete their own documents" on public.saved_documents;
create policy "users can delete their own documents"
on public.saved_documents for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- -------------------------------------------------------------------------
-- 2. PUBLIC PROFILES TABLE
-- This makes all users visible in the Supabase "Table Editor" (public schema)
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  last_sign_in_at timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Allow authenticated users to view their own profile
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

-- -------------------------------------------------------------------------
-- 3. AUTOMATIC SYNC TRIGGER: AUTH.USERS -> PUBLIC.PROFILES
-- Automatically copies new signups and logins into public.profiles
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, last_sign_in_at, created_at)
  values (new.id, new.email, new.last_sign_in_at, coalesce(new.created_at, now()))
  on conflict (id) do update set 
    email = excluded.email,
    last_sign_in_at = excluded.last_sign_in_at;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger on user login
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of last_sign_in_at on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any existing registered users into public.profiles immediately
insert into public.profiles (id, email, last_sign_in_at, created_at)
select id, email, last_sign_in_at, created_at from auth.users
on conflict (id) do update set 
  email = excluded.email,
  last_sign_in_at = excluded.last_sign_in_at;

-- -------------------------------------------------------------------------
-- 4. USERS OVERVIEW (DETAILED ADMIN VIEW)
-- Shows email, signup date, last login date, and total documents created
-- -------------------------------------------------------------------------
create or replace view public.users_overview as
select 
  u.id as user_id,
  u.email,
  u.created_at as registered_at,
  u.last_sign_in_at as last_login_at,
  count(d.id) as total_saved_documents
from auth.users u
left join public.saved_documents d on d.user_id = u.id
group by u.id, u.email, u.created_at, u.last_sign_in_at
order by u.created_at desc;

-- -------------------------------------------------------------------------
-- 5. QUICK QUERIES TO TEST IN SQL EDITOR:
-- To see all users:
--   SELECT * FROM public.profiles ORDER BY created_at DESC;
-- To see all users with their document counts:
--   SELECT * FROM public.users_overview;
-- Direct query into auth.users (runs only in SQL editor with admin rights):
--   SELECT id, email, created_at, last_sign_in_at FROM auth.users ORDER BY created_at DESC;
-- =========================================================================
