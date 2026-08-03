-- Assessments table (baseline + pulses)
-- Recreated from TypeScript types + insert code (not in repo SQL files)
create table if not exists public.assessments (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
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

alter table public.assessments enable row level security;

create policy "Users can view own assessments"
  on public.assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own assessments"
  on public.assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own assessments"
  on public.assessments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own assessments"
  on public.assessments for delete
  using (auth.uid() = user_id);

create index if not exists idx_assessments_user_id
  on public.assessments(user_id, timestamp);

-- Demo data table (public demo pulses for the dashboard)
create table if not exists public.demo_data (
  id          bigint generated always as identity primary key,
  pulse       integer not null,
  date        text not null,
  hour        integer not null,
  day         integer not null,
  openness   numeric not null default 0,
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

alter table public.demo_data enable row level security;

create policy "Anyone can view demo data"
  on public.demo_data for select
  using (true);
