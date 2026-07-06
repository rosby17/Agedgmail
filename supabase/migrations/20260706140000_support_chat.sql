-- ============================================================
-- Chat support temps réel : tickets (conversations) + messages.
-- Le client ouvre une conversation depuis le site, l'admin répond depuis le
-- dashboard, les nouveaux messages arrivent en direct via Supabase Realtime.
-- ============================================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  subject text,
  status text not null default 'open',          -- 'open' | 'resolved'
  last_message_at timestamptz not null default now(),
  last_sender text,                             -- 'user' | 'admin'
  admin_unread boolean not null default true,   -- l'admin a du non-lu
  user_unread boolean not null default false,   -- le client a du non-lu
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  user_id uuid not null,        -- propriétaire du ticket (dénormalisé pour la RLS)
  sender text not null,         -- 'user' | 'admin'
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id, last_message_at desc);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

-- Accès : le propriétaire du ticket, ou l'admin (email fixe).
drop policy if exists tickets_select on public.support_tickets;
create policy tickets_select on public.support_tickets
  for select using (auth.uid() = user_id or (auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');

drop policy if exists tickets_insert on public.support_tickets;
create policy tickets_insert on public.support_tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists tickets_update on public.support_tickets;
create policy tickets_update on public.support_tickets
  for update using (auth.uid() = user_id or (auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');

drop policy if exists messages_select on public.support_messages;
create policy messages_select on public.support_messages
  for select using (auth.uid() = user_id or (auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');

drop policy if exists messages_insert on public.support_messages;
create policy messages_insert on public.support_messages
  for insert with check (auth.uid() = user_id or (auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com');

-- Realtime : diffusion des insertions de messages et des maj de tickets.
do $$ begin
  alter publication supabase_realtime add table public.support_messages;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.support_tickets;
exception when duplicate_object then null; end $$;
