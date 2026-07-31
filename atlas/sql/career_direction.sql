-- Atlas Career Direction V1
-- Isolated from public.assessments. This table stores only the user's
-- career-direction profile, editable work preferences, direction hypotheses,
-- evidence-cycle notes, and reassessment choices.

create table if not exists public.career_direction_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_direction_profiles enable row level security;

drop policy if exists "Users can view own career direction profile" on public.career_direction_profiles;
create policy "Users can view own career direction profile"
  on public.career_direction_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own career direction profile" on public.career_direction_profiles;
create policy "Users can insert own career direction profile"
  on public.career_direction_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own career direction profile" on public.career_direction_profiles;
create policy "Users can update own career direction profile"
  on public.career_direction_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own career direction profile" on public.career_direction_profiles;
create policy "Users can delete own career direction profile"
  on public.career_direction_profiles for delete
  using (auth.uid() = user_id);

create or replace function public.handle_updated_at_career_direction_profiles()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_career_direction_profiles_updated_at on public.career_direction_profiles;
create trigger trg_career_direction_profiles_updated_at
  before update on public.career_direction_profiles
  for each row execute function public.handle_updated_at_career_direction_profiles();
