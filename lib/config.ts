// Makler trägt hier einmal seine Daten ein — gilt für alle Checks (Defaults)

export const MAKLER = {
  name: "Max Mustermann",
  firma: "Mustermann Versicherungen",
  email: "kontakt@mustermann-versicherungen.de",
  telefon: "089 123 456 78",
  primaryColor: "#1a3a5c",
} as const;

export type MaklerConfig = typeof MAKLER;
