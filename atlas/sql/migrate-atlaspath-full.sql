-- ═══════════════════════════════════════════════════════════════
-- Atlas Path — Full schema for atlaspath database
-- Run via: psql -h 192.168.1.229 -U atlaspath_dev -d atlaspath -f this_file.sql
-- 
-- Note: RLS policies + auth.users FK constraints are omitted here.
-- They are managed by the Supabase project that wraps this database.
-- ═══════════════════════════════════════════════════════════════

-- ── 00. cockpit_data ─────────────────────────────────────────────
create table if not exists public.cockpit_data (
  id           bigint generated always as identity primary key,
  user_id      uuid not null,
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
create index if not exists idx_cockpit_data_user_id
  on public.cockpit_data(user_id, created_at desc);

create or replace function public.handle_updated_at_cockpit_data()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_cockpit_data_updated_at on public.cockpit_data;
create trigger trg_cockpit_data_updated_at
  before update on public.cockpit_data for each row execute function public.handle_updated_at_cockpit_data();

-- ── 01. assessments ──────────────────────────────────────────────
create table if not exists public.assessments (
  id          bigint generated always as identity primary key,
  user_id     uuid not null,
  type        text not null check (type in ('baseline', 'pulse')),
  timestamp   timestamptz not null default now(),
  week        integer,
  phase       text,
  responses   jsonb not null default '{}'::jsonb,
  scores      jsonb not null default '{}'::jsonb,
  contexts    text[],
  emotions    text[],
  note        text
);
create index if not exists idx_assessments_user_id
  on public.assessments(user_id, timestamp);

-- ── 02. demo_data ────────────────────────────────────────────────
create table if not exists public.demo_data (
  id          bigint generated always as identity primary key,
  pulse       integer not null,
  date        text not null,
  hour        integer not null,
  day         integer not null,
  openness    numeric not null default 0,
  conscientiousness numeric not null default 0,
  extraversion numeric not null default 0,
  agreeableness numeric not null default 0,
  emotional_stability numeric not null default 0,
  facets      jsonb,
  emotions    jsonb,
  diamonds    jsonb,
  contexts    text[],
  raw_contexts text[]
);

-- ── 03. career_direction_profiles ─────────────────────────────────
create table if not exists public.career_direction_profiles (
  user_id    uuid primary key,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.handle_updated_at_career_direction_profiles()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_career_direction_profiles_updated_at on public.career_direction_profiles;
create trigger trg_career_direction_profiles_updated_at
  before update on public.career_direction_profiles for each row execute function public.handle_updated_at_career_direction_profiles();

-- ── 04. contact_log ──────────────────────────────────────────────
create table if not exists public.contact_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null,
  contact_id  bigint not null references public.cockpit_data(id) on delete cascade,
  sent_date   date not null default current_date,
  channel     text not null default 'LinkedIn',
  message     text not null default '',
  status      text not null default 'waiting',  -- 'waiting' | 'replied'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_contact_log_contact_id on public.contact_log(contact_id);
create or replace function public.handle_updated_at_contact_log()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger trg_contact_log_updated_at
  before update on public.contact_log for each row execute function public.handle_updated_at_contact_log();

-- ── 05. job_listings ─────────────────────────────────────────────
create table if not exists public.job_listings (
  id            bigint generated always as identity primary key,
  user_id       uuid not null,
  title         text not null,
  company       text not null default '',
  location      text not null default '',
  url           text not null default '',
  source        text not null default '',
  description   text not null default '',
  posted_at     date,
  scraped_at    timestamptz not null default now(),
  match_score   numeric(4,3),
  match_reasons text not null default '',
  status        text not null default 'New',  -- 'New' | 'Reviewing' | 'Promoted' | 'Dismissed'
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_job_listings_user_score on public.job_listings(user_id, match_score desc nulls last);
create index if not exists idx_job_listings_user_status on public.job_listings(user_id, status);
create unique index if not exists idx_job_listings_user_url on public.job_listings(user_id, url) where url <> '';
create or replace function public.handle_updated_at_job_listings()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger trg_job_listings_updated_at
  before update on public.job_listings for each row execute function public.handle_updated_at_job_listings();

-- ── 06. feedback_events ──────────────────────────────────────────
create table if not exists public.feedback_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null,
  surface     text not null,
  item_id     text,
  kind        text not null,
  value       jsonb not null default '{}'::jsonb,
  parent_id   bigint references public.feedback_events(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists idx_feedback_events_surface on public.feedback_events(surface);
create index if not exists idx_feedback_events_user_id on public.feedback_events(user_id, created_at);
create index if not exists idx_feedback_events_parent_id on public.feedback_events(parent_id);

create or replace function public.purge_old_feedback_events()
returns void as $$ begin delete from public.feedback_events where created_at < now() - interval '24 months'; end; $$ language plpgsql;

create or replace view public.feedback_summary as
select
  surface,
  count(*) filter (where kind = 'boolean') as boolean_responses,
  count(*) filter (where kind = 'boolean' and (value->>'vote')::boolean) as positive_votes,
  round(100.0 * count(*) filter (where kind = 'boolean' and (value->>'vote')::boolean) / nullif(count(*) filter (where kind = 'boolean'), 0), 1) as positive_pct,
  count(*) filter (where kind = 'dropdown') as dropdown_responses,
  count(*) filter (where kind = 'ranking') as ranking_responses,
  round(avg((value->>'score')::numeric) filter (where kind = 'ranking'), 2) as avg_ranking,
  count(*) filter (where kind = 'text') as text_responses,
  count(*) filter (where kind = 'dismiss') as dismissals
from public.feedback_events group by surface;

-- ── 07. analytics_events ─────────────────────────────────────────
create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null,
  event_name  text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_analytics_events_event_name on public.analytics_events(event_name);
create index if not exists idx_analytics_events_user_id on public.analytics_events(user_id, created_at);

create or replace function public.purge_old_analytics_events()
returns void as $$ begin delete from public.analytics_events where created_at < now() - interval '24 months'; end; $$ language plpgsql;

-- ── 08. work_values_assessments ───────────────────────────────────
create table if not exists public.work_values_assessments (
  id           bigint generated always as identity primary key,
  user_id      uuid not null,
  status       text not null default 'draft' check (status in ('draft', 'completed')),
  result       jsonb,
  draft_state  jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_work_values_user_id
  on public.work_values_assessments(user_id, created_at desc);
create or replace function public.handle_updated_at_work_values()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_work_values_updated_at on public.work_values_assessments;
create trigger trg_work_values_updated_at
  before update on public.work_values_assessments for each row execute function public.handle_updated_at_work_values();
