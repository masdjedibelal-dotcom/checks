-- Im Supabase SQL Editor ausführen (oder als Migration).
-- Hinweis: Service Role umgeht RLS — keine öffentliche Policy nötig.

create table if not exists public.token_usage (
  id         uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  token      text not null,
  path       text,
  ip_hash    text
);

create index if not exists token_usage_token_idx on public.token_usage(token);
create index if not exists token_usage_created_idx on public.token_usage(created_at);

alter table public.token_usage enable row level security;

-- purchases: Domain optional (Token-only-Lizenz)
alter table public.purchases
  alter column domain drop not null;
