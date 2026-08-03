-- Work Values Assessments — full lifecycle: drafts + completed history
--
-- Each row is either a draft (in-progress) or a completed assessment.
-- The latest completed row for a user is their "active" work values profile.
-- Drafts sync to DB (not just localStorage) so they work across devices.
-- All completed assessments are preserved as history.

create table if not exists public.work_values_assessments (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'draft' check (status in ('draft', 'completed')),
  result       jsonb,                                    -- WorkValuesResult, null while drafting
  draft_state  jsonb,                                    -- { rankings, intensityRatings, currentBlock, currentRatingIdx, phase, blocks }
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz                               -- null while drafting
);

alter table public.work_values_assessments enable row level security;

drop policy if exists "Users can view own work values assessments" on public.work_values_assessments;
create policy "Users can view own work values assessments"
  on public.work_values_assessments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own work values assessments" on public.work_values_assessments;
create policy "Users can insert own work values assessments"
  on public.work_values_assessments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own work values assessments" on public.work_values_assessments;
create policy "Users can update own work values assessments"
  on public.work_values_assessments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own work values assessments" on public.work_values_assessments;
create policy "Users can delete own work values assessments"
  on public.work_values_assessments for delete
  using (auth.uid() = user_id);

create index if not exists idx_work_values_user_id
  on public.work_values_assessments(user_id, created_at desc);

-- Auto-update updated_at
create or replace function public.handle_updated_at_work_values()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_work_values_updated_at on public.work_values_assessments;
create trigger trg_work_values_updated_at
  before update on public.work_values_assessments
  for each row execute function public.handle_updated_at_work_values();
