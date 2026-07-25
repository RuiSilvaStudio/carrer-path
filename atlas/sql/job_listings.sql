-- ────────────────────────────────────────────────────────────────
-- Job Listings
-- Stores scraped/added job postings matched against the career KB:
-- identity, source, description, match score, and review status
-- (New / Reviewing / Promoted / Dismissed).
-- Run this in the Supabase SQL Editor.
-- ────────────────────────────────────────────────────────────────

create table if not exists public.job_listings (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  company       text not null default '',
  location      text not null default '',
  url           text not null default '',
  source        text not null default '',           -- e.g. 'Google scrape', 'Manual', 'Adzuna'
  description   text not null default '',
  posted_at     date,                               -- posting date if known
  scraped_at    timestamptz not null default now(), -- when we captured it
  match_score   numeric(4,3),                       -- 0.000–1.000 cosine/keyword score
  match_reasons text not null default '',           -- why it matched (human-readable)
  status        text not null default 'New',        -- 'New' | 'Reviewing' | 'Promoted' | 'Dismissed'
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS — same pattern as cockpit_data (owner-only access)
alter table public.job_listings enable row level security;

create policy "Users can view own job listings"
  on public.job_listings for select
  using (auth.uid() = user_id);

create policy "Users can insert own job listings"
  on public.job_listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own job listings"
  on public.job_listings for update
  using (auth.uid() = user_id);

create policy "Users can delete own job listings"
  on public.job_listings for delete
  using (auth.uid() = user_id);

-- Indexes for fast sorted/filtered reads
create index if not exists idx_job_listings_user_score
  on public.job_listings(user_id, match_score desc nulls last);

create index if not exists idx_job_listings_user_status
  on public.job_listings(user_id, status);

-- Dedupe helper: same URL per user should never double-insert
create unique index if not exists idx_job_listings_user_url
  on public.job_listings(user_id, url)
  where url <> '';

-- Auto-update updated_at
create or replace function public.handle_updated_at_job_listings()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_job_listings_updated_at
  before update on public.job_listings
  for each row execute function public.handle_updated_at_job_listings();
