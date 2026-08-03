-- ────────────────────────────────────────────────────────────────
-- Atlas Path — Self-hosted Supabase initialization
-- Run order: 00_init (this file) → 01_analytics → 02_career_direction
--            → 03_cockpit_data → 04_contact_log → 05_job_listings
--            → 06_feedback_events
-- ────────────────────────────────────────────────────────────────

-- Create the cockpit_data table (not in repo SQL files, derived from
-- CockpitContact type + useCockpit.ts usage).
create table if not exists public.cockpit_data (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  contact_name text not null default '',
  company      text not null default '',
  relationship text not null default '',
  tier         text not null default 'C' check (tier in ('A', 'B', 'C')),
  status       text not null default 'Not contacted',
  goals        text not null default '',
  message      text not null default '',
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.cockpit_data enable row level security;

create policy "Users can view own cockpit data"
  on public.cockpit_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own cockpit data"
  on public.cockpit_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cockpit data"
  on public.cockpit_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cockpit data"
  on public.cockpit_data for delete
  using (auth.uid() = user_id);

create index if not exists idx_cockpit_data_user_id
  on public.cockpit_data(user_id, created_at desc);

-- Auto-update updated_at
create or replace function public.handle_updated_at_cockpit_data()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cockpit_data_updated_at on public.cockpit_data;
create trigger trg_cockpit_data_updated_at
  before update on public.cockpit_data
  for each row execute function public.handle_updated_at_cockpit_data();
