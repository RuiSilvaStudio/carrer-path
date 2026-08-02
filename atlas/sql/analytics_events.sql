-- ────────────────────────────────────────────────────────────────
-- Lightweight Analytics Events
-- Privacy-safe funnel tracking for Atlas Path.
-- Run this in the Supabase SQL Editor.
-- ────────────────────────────────────────────────────────────────

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_name  text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- RLS — owner-only access, no service role exposure
alter table public.analytics_events enable row level security;

create policy "Users can view own analytics events"
  on public.analytics_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);

-- Index for funnel queries by event name
create index if not exists idx_analytics_events_event_name
  on public.analytics_events(event_name);

-- Index for per-user timeline queries
create index if not exists idx_analytics_events_user_id
  on public.analytics_events(user_id, created_at);

-- Retention: delete events older than 24 months
-- Disable this if you want indefinite retention for analysis
create or replace function public.purge_old_analytics_events()
returns void as $$
begin
  delete from public.analytics_events
  where created_at < now() - interval '24 months';
end;
$$ language plpgsql;
