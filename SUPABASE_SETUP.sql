-- Run this in your Supabase dashboard → SQL Editor → New query → Run.
-- Creates the table + row-level security so each logged-in user only sees their own saved documents.

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
