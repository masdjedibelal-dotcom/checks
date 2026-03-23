CREATE TABLE public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  token text NOT NULL,
  slug text NOT NULL,
  kunden_name text,
  kunden_email text,
  kunden_tel text,
  makler_email text
);

CREATE INDEX leads_token_idx ON public.leads (token);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.leads
  USING (true)
  WITH CHECK (true);
