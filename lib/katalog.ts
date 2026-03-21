export type TemplateKategorie =
  | "alle-kunden"
  | "luecken"
  | "finanzen"
  | "anlass";

export type Template = {
  slug: string;
  icon: string;
  name: string;
  desc: string;
  tags: string[];
  kategorie: TemplateKategorie;
  preis: number;
  accentColor: string;
};

export const KATALOG: Template[] = [
  {
    slug: "bedarfscheck",
    icon: "🎯",
    name: "Bedarfscheck — Welche Versicherungen brauche ich?",
    desc: "Kunde gibt Profil und Bestand ein — bekommt 3 fertige Pakete mit Begründung.",
    tags: ["Neukunden", "Vor dem Erstgespräch"],
    kategorie: "alle-kunden",
    preis: 79,
    accentColor: "#c9a96e",
  },
  {
    slug: "jahrescheck",
    icon: "📋",
    name: "Jahrescheck — Was hat sich verändert?",
    desc: "Bestandskunde wählt Lebensereignisse — Ergebnis zeigt konkreten Handlungsbedarf.",
    tags: ["Bestandskunden", "Jährlich versenden"],
    kategorie: "alle-kunden",
    preis: 79,
    accentColor: "#166534",
  },
  {
    slug: "bu-ktg",
    icon: "💼",
    name: "Was passiert wenn ich ausfalle?",
    desc: "Realer Einkommensverlauf bei Krankheit und BU — Monat für Monat.",
    tags: ["Einkommensschutz", "5 Szenarien"],
    kategorie: "luecken",
    preis: 59,
    accentColor: "#7c3aed",
  },
  {
    slug: "rente",
    icon: "🌱",
    name: "Wie groß ist meine Rentenlücke?",
    desc: "3-Schichten-Visualisierung + 3 Strategien mit konkreter Sparrate.",
    tags: ["Altersvorsorge", "Sparrate berechnen"],
    kategorie: "luecken",
    preis: 59,
    accentColor: "#059669",
  },
  {
    slug: "risikoleben",
    icon: "❤️",
    name: "Ist meine Familie wirklich abgesichert?",
    desc: "Witwen-/Waisenrente eingerechnet — zeigt die echte Versorgungslücke.",
    tags: ["Familien mit Kindern"],
    kategorie: "luecken",
    preis: 59,
    accentColor: "#be185d",
  },
  {
    slug: "zinseszins",
    icon: "📈",
    name: "Was kostet 10 Jahre warten?",
    desc: "Zeigt den konkreten Unterschied zwischen früh und spät starten.",
    tags: ["Junge Kunden", "ETF-Sparplan"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#059669",
  },
  {
    slug: "gkv-pkv",
    icon: "🏥",
    name: "GKV oder PKV — was lohnt sich?",
    desc: "Beiträge, Leistungen, klare Empfehlung mit Familienbonus und Berufsstatus.",
    tags: ["Gehaltssprung", "PKV-Wechsel"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#dc2626",
  },
  {
    slug: "anschluss",
    icon: "🏠",
    name: "Was kostet meine Anschlussfinanzierung?",
    desc: "Alte vs. neue Rate nach Zinsbindungsende — mit Bausparer-Einrechnung.",
    tags: ["Eigenheimbesitzer", "Zinsbindung läuft aus"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#b45309",
  },
  {
    slug: "bu-check",
    icon: "💼",
    name: "Reicht meine BU-Rente noch?",
    desc: "Nach Gehaltssprung, Jobwechsel oder Familienzuwachs — mit Nachversicherungs-Empfehlung.",
    tags: ["Nach Gehaltssprung", "Jobwechsel"],
    kategorie: "anlass",
    preis: 49,
    accentColor: "#7c3aed",
  },
  {
    slug: "elternzeit",
    icon: "👶",
    name: "Was bleibt in der Elternzeit übrig?",
    desc: "Elterngeld für beide Partner, Haushaltslücke, Versicherungs-Checkliste.",
    tags: ["Baby bekommen", "Elternzeit"],
    kategorie: "anlass",
    preis: 49,
    accentColor: "#be185d",
  },
  {
    slug: "riester",
    icon: "🌱",
    name: "Hole ich alle Riester-Zulagen raus?",
    desc: "Prüft ob Grundzulage, Kinderzulage und Bonus korrekt beantragt sind.",
    tags: ["Nach Geburt", "Riester"],
    kategorie: "anlass",
    preis: 49,
    accentColor: "#b45309",
  },
];

/** Kurz-Label für Karten-Badges (Kategorie) */
export const KATEGORIE_LABEL: Record<TemplateKategorie, string> = {
  "alle-kunden": "Für alle Kunden",
  luecken: "Lücken aufdecken",
  finanzen: "Finanzentscheidungen",
  anlass: "Anlassbezogen",
};

export const FILTER_TABS: {
  id: "alle" | TemplateKategorie;
  label: string;
}[] = [
  { id: "alle", label: "Alle" },
  { id: "alle-kunden", label: "Für alle Kunden" },
  { id: "luecken", label: "Lücken aufdecken" },
  { id: "finanzen", label: "Finanzentscheidungen" },
  { id: "anlass", label: "Anlassbezogen" },
];
