/** Erste Buchstaben der ersten zwei Wörter, z. B. „Mustermann Versicherungen“ → „MV“. */
export function maklerFirmaInitials(firma: string): string {
  const t = String(firma ?? "").trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter((w) => w.length > 0).slice(0, 2);
  const abbr = parts.map((w) => w[0]).join("").toUpperCase();
  return abbr || "?";
}
