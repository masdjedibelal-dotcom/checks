-- Optional: Telefon des Maklers pro Kauf
alter table public.purchases add column if not exists telefon text;
