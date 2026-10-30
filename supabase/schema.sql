-- Supabase SQL Editor 에서 한 번 실행
create table if not exists public.spend_flow_data (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.spend_flow_data enable row level security;
drop policy if exists "read own spend flow data" on public.spend_flow_data;
drop policy if exists "insert own spend flow data" on public.spend_flow_data;
drop policy if exists "update own spend flow data" on public.spend_flow_data;
create policy "read own spend flow data" on public.spend_flow_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own spend flow data" on public.spend_flow_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own spend flow data" on public.spend_flow_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.spend_flow_data from anon;
grant select,insert,update on public.spend_flow_data to authenticated;
