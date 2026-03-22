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
  {
    slug: "nachwuchs",
    icon: "baby",
    name: "Baby bekommen — was ändert sich?",
    desc: "Personalisierte Checkliste aller Versicherungsanpassungen nach der Geburt — mit Fristen.",
    tags: ["Familien", "Geburt", "Elternzeit", "Kinderzulage"],
    kategorie: "anlass",
    preis: 59,
    accentColor: "#1a3a5c",
  },
  {
    slug: "wohngebaeude",
    icon: "home",
    name: "Bin ich mit meinem Haus unterversichert?",
    desc: "Neuwertberechnung nach Baupreisindex 2025 — mit Unterversicherungs-Check und Elementarschutz.",
    tags: ["Immobilien", "Hauseigentümer", "Unterversicherung"],
    kategorie: "luecken",
    preis: 59,
    accentColor: "#1a3a5c",
  },
  {
    slug: "selbststaendig",
    icon: "briefcase",
    name: "Was kostet meine Absicherung als Selbstständiger?",
    desc: "PKV, BU, Rürup und Liquiditätsrücklage — die 4 Pflichtposten auf einen Blick.",
    tags: ["Selbstständige", "Freiberufler", "PKV", "Rürup"],
    kategorie: "luecken",
    preis: 69,
    accentColor: "#1a3a5c",
  },
  {
    slug: "steuer",
    icon: "percent",
    name: "Was spare ich durch Rürup, BU und bAV?",
    desc: "Steuerersparnis durch geförderte Vorsorge — auf Basis des persönlichen Grenzsteuersatzes.",
    tags: ["Steuer", "Rürup", "bAV", "Grenzsteuersatz"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "miet-kauf",
    icon: "key",
    name: "Ab wann lohnt sich Kaufen statt Mieten?",
    desc: "Breakeven-Jahr, Immobilienwert und Vermögensvergleich über die Laufzeit.",
    tags: ["Immobilien", "Finanzierung", "Breakeven"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "kinderkosten",
    icon: "heart",
    name: "Was kostet ein Kind bis 25?",
    desc: "Monatliche Kosten nach Lebensphase — von der Geburt bis zum Studium.",
    tags: ["Familien", "Planung", "Kinder"],
    kategorie: "anlass",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "etf",
    icon: "trending-up",
    name: "Was wird aus meinem ETF-Sparplan?",
    desc: "Endvermögen, Zinseszins-Anteil und Abgeltungsteuer nach Ihrer Laufzeit.",
    tags: ["ETF", "Geldanlage", "Zinseszins"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "fire",
    icon: "flame",
    name: "Wann bin ich finanziell frei?",
    desc: "Zielkapital, Sparrate und Jahre bis zur finanziellen Unabhängigkeit nach der 4%-Regel.",
    tags: ["FIRE", "Frührentner", "Finanzielle Freiheit"],
    kategorie: "finanzen",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "rentenzeitpunkt",
    icon: "clock",
    name: "Mit 63, 65 oder 67 in Rente?",
    desc: "Abschläge, Lebensgesamtrente und Break-even-Alter im direkten Vergleich.",
    tags: ["Rente", "Renteneintritt", "Abschläge"],
    kategorie: "luecken",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "pflege",
    icon: "shield",
    name: "Was kostet Pflege wirklich?",
    desc: "Eigenanteile nach Pflegegrad — stationär und ambulant, mit Gesamtkostenprognose.",
    tags: ["Pflege", "Pflegeversicherung", "Eigenanteil"],
    kategorie: "luecken",
    preis: 49,
    accentColor: "#1a3a5c",
  },
  {
    slug: "erbschaft",
    icon: "landmark",
    name: "Wie viel lässt sich steuerfrei vererben?",
    desc: "Freibeträge nach Verwandtschaftsgrad, Steuerbelastung und 10-Jahres-Regelung.",
    tags: ["Erbschaft", "Schenkung", "Freibetrag", "Steuer"],
    kategorie: "anlass",
    preis: 49,
    accentColor: "#1a3a5c",
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
