-- ────────────────────────────────────────────────────────────────
-- Contact Outreach Log
-- Tracks individual outreach events per contact: date, channel,
-- message sent, and reply status (waiting / replied).
-- Run this in the Supabase SQL Editor.
-- ────────────────────────────────────────────────────────────────

create table if not exists public.contact_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  contact_id  bigint not null references public.cockpit_data(id) on delete cascade,
  sent_date   date not null default current_date,
  channel     text not null default 'LinkedIn',
  message     text not null default '',
  status      text not null default 'waiting',  -- 'waiting' | 'replied'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS — same pattern as cockpit_data (owner-only access)
alter table public.contact_log enable row level security;

create policy "Users can view own contact logs"
  on public.contact_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own contact logs"
  on public.contact_log for insert
  with check (auth.uid() = user_id);

create policy "Users can update own contact logs"
  on public.contact_log for update
  using (auth.uid() = user_id);

create policy "Users can delete own contact logs"
  on public.contact_log for delete
  using (auth.uid() = user_id);

-- Index for fast per-contact lookups
create index if not exists idx_contact_log_contact_id
  on public.contact_log(contact_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at_contact_log()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_contact_log_updated_at
  before update on public.contact_log
  for each row execute function public.handle_updated_at_contact_log();
