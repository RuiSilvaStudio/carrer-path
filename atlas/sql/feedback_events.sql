-- ────────────────────────────────────────────────────────────────
-- Feedback Events
-- Centralized, laddered user feedback for Atlas Path.
-- Mirrors the analytics_events pattern: RLS, owner-only, fire-and-forget.
-- Run this in the Supabase SQL Editor.
-- ────────────────────────────────────────────────────────────────

create table if not exists public.feedback_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  surface     text not null,           -- 'insight' | 'pulse' | 'direction' | 'docs' | 'baseline' | 'nps'
  item_id     text,                    -- which insight/doc/stage/milestone (nullable)
  kind        text not null,           -- 'boolean' | 'dropdown' | 'ranking' | 'text' | 'dismiss'
  value       jsonb not null default '{}'::jsonb,
  parent_id   bigint references public.feedback_events(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- RLS — owner-only access, no service role exposure
alter table public.feedback_events enable row level security;

create policy "Users can view own feedback events"
  on public.feedback_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own feedback events"
  on public.feedback_events for insert
  with check (auth.uid() = user_id);

-- Index for per-surface analysis
create index if not exists idx_feedback_events_surface
  on public.feedback_events(surface);

-- Index for per-user timeline
create index if not exists idx_feedback_events_user_id
  on public.feedback_events(user_id, created_at);

-- Index for reassembling laddered responses
create index if not exists idx_feedback_events_parent_id
  on public.feedback_events(parent_id);

-- Retention: delete events older than 24 months (matches analytics policy)
create or replace function public.purge_old_feedback_events()
returns void as $$
begin
  delete from public.feedback_events
  where created_at < now() - interval '24 months';
end;
$$ language plpgsql;

-- ────────────────────────────────────────────────────────────────
-- Insight view: one row per surface with boolean positive-rate,
-- negative-reason distribution, and average ranking.
-- This is a starting point for analysis, not a user-facing surface.
-- ────────────────────────────────────────────────────────────────
create or replace view public.feedback_summary as
select
  surface,
  count(*) filter (where kind = 'boolean')                                   as boolean_responses,
  count(*) filter (where kind = 'boolean' and (value->>'vote')::boolean)     as positive_votes,
  round(
    100.0 * count(*) filter (where kind = 'boolean' and (value->>'vote')::boolean)
    / nullif(count(*) filter (where kind = 'boolean'), 0),
    1
  )                                                                          as positive_pct,
  count(*) filter (where kind = 'dropdown')                                  as dropdown_responses,
  count(*) filter (where kind = 'ranking')                                   as ranking_responses,
  round(avg((value->>'score')::numeric) filter (where kind = 'ranking'), 2)  as avg_ranking,
  count(*) filter (where kind = 'text')                                      as text_responses,
  count(*) filter (where kind = 'dismiss')                                   as dismissals
from public.feedback_events
group by surface;
