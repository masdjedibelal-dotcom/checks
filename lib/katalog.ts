export type TemplateKategorie = "alle-kunden" | "luecken" | "finanzen";

export type TemplateBadge = "freemium" | "launch";

export type Template = {
  slug: string;
  icon: string;
  name: string;
  desc: string;
  tags: string[];
  kategorie: TemplateKategorie;
  /** Aktionspreis (Checkout) */
  preis: number;
  /** Listenpreis (durchgestrichen in UI); bei Freemium weglassen */
  preisOriginal?: number;
  /** Preis-Badge in UI */
  badge?: TemplateBadge;
  accentColor: string;
};

export const KATALOG: Template[] = [
  {
    slug: "bedarfscheck",
    icon: "🎯",
    name: "Absicherungspakete",
    desc: "Profil + Bestand → 3 personalisierte Pakete mit Begründung.",
    tags: ["Neukunden", "Vor dem Erstgespräch"],
    kategorie: "alle-kunden",
    preis: 39,
    preisOriginal: 59,
    badge: "launch",
    accentColor: "#c9a96e",
  },
  {
    slug: "lebenssituations-check",
    icon: "📋",
    name: "Jahresgespräch",
    desc: "Lebensereignisse auswählen → konkreter Handlungsbedarf mit Bestandsabgleich.",
    tags: ["Bestandskunden", "Lebensereignisse"],
    kategorie: "alle-kunden",
    preis: 1,
    badge: "freemium",
    accentColor: "#166534",
  },
  {
    slug: "einkommens-check",
    icon: "💼",
    name: "Einkommensabsicherung",
    desc: "BU + KTG Zeitstrahl, Lückenberechnung, Empfehlung und EU als Alternative.",
    tags: ["Einkommensschutz", "BU & Krankentagegeld"],
    kategorie: "luecken",
    preis: 59,
    preisOriginal: 99,
    badge: "launch",
    accentColor: "#7c3aed",
  },
  {
    slug: "gkv-pkv",
    icon: "🏥",
    name: "KV-Navigator",
    desc: "JAEG-Prüfung, Beitragsvergleich, Familienlogik, konkrete Einordnung.",
    tags: ["Gehaltssprung", "PKV-Wechsel"],
    kategorie: "luecken",
    preis: 59,
    preisOriginal: 99,
    badge: "launch",
    accentColor: "#dc2626",
  },
  {
    slug: "vorsorge-check",
    icon: "🌱",
    name: "Rentenlücke",
    desc: "Rentenlücke, Schichten, Rentenzeitpunkt, Riester-Förderung, 3 Strategien.",
    tags: ["Altersvorsorge", "Sparrate"],
    kategorie: "luecken",
    preis: 59,
    preisOriginal: 99,
    badge: "launch",
    accentColor: "#059669",
  },
  {
    slug: "risikoleben",
    icon: "❤️",
    name: "Familienabsicherung",
    desc: "Versorgungslücke mit gesetzl. Witwen-/Waisenrente, empfohlene Summe.",
    tags: ["Familien mit Kindern"],
    kategorie: "luecken",
    preis: 49,
    preisOriginal: 79,
    badge: "launch",
    accentColor: "#be185d",
  },
  {
    slug: "pflege-check",
    icon: "🛡️",
    name: "Pflegekosten",
    desc: "Eigenanteil nach Pflegegrad, Einordnung, Produktübersicht.",
    tags: ["Pflege", "Eigenanteil"],
    kategorie: "luecken",
    preis: 49,
    preisOriginal: 79,
    badge: "launch",
    accentColor: "#0369a1",
  },
  {
    slug: "immobilien-check",
    icon: "🏛️",
    name: "Immobilienabsicherung",
    desc: "Weg, Risiko-Scanner & Vorsorge: Bank & Existenz, Objektschutz, Zukunft & Recht — Immobilienabsicherung.",
    tags: ["Immobilien", "Eigentümer", "Bau"],
    kategorie: "finanzen",
    preis: 49,
    preisOriginal: 79,
    badge: "launch",
    accentColor: "#b45309",
  },
];

/** Kurz-Label für Karten-Badges (Kategorie) */
export const KATEGORIE_LABEL: Record<TemplateKategorie, string> = {
  "alle-kunden": "Für alle Kunden",
  luecken: "Lücken aufdecken",
  finanzen: "Finanzentscheidungen",
};

export const FILTER_TABS: {
  id: "alle" | TemplateKategorie;
  label: string;
}[] = [
  { id: "alle", label: "Alle" },
  { id: "alle-kunden", label: "Für alle Kunden" },
  { id: "luecken", label: "Lücken aufdecken" },
  { id: "finanzen", label: "Finanzentscheidungen" },
];
