-- Kennzahlen / Tendenzen aus dem Check-Ergebnis (JSON-Array von { "label", "value" })
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS highlights text;
