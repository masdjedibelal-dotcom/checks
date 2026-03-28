// Makler trägt hier einmal seine Daten ein — gilt für alle Checks (Defaults)

export const MAKLER = {
  name: "Ihre Agentur",
  firma: "Ihre Agentur",
  email: "kontakt@ihre-agentur.de",
  telefon: "089 123 456 78",
  primaryColor: "#1a3a5c",
} as const;

export type MaklerConfig = typeof MAKLER;
