-- FlowLeads: Käufe / Lizenz-Tokens
-- Im Supabase SQL Editor ausführen.
--
-- Wichtig: Keine Policy mit USING (true) für alle Rollen — das würde Anon-Zugriff erlauben.
-- Service Role umgeht RLS; ohne Policies hat der öffentliche Anon-Key keinen Tabellenzugriff.

create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  email text not null,
  name text not null,
  firma text,
  slug text not null,
  token text not null unique,
  domain text not null,
  accent_color text default '#1a3a5c',
  stripe_session_id text unique,
  status text not null default 'active'
);

create index if not exists purchases_token_idx on public.purchases (token);

alter table public.purchases enable row level security;

-- Keine weiteren Policies: Zugriff nur über Service Role (Server/Webhook), nicht über Anon.
