-- Optionale Paketauswahl aus dem Versicherungs-Check (Bedarfscheck), JSON-Array z. B. ["basis","komfort"]
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS gewaehlte_pakete text;
