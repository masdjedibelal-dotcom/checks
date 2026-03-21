"use client";
import { useState } from "react";

// ─── GLOBAL SETUP ─────────────────────────────────────────────────────────────
(() => {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body { height: 100%; background: #f0f2f5; font-family: 'Outfit', system-ui, sans-serif; }
    button, input { font-family: inherit; cursor: pointer; border: none; background: none; }
    input { cursor: text; }
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .anim-fadeup { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    button:active { transform: scale(0.97); transition: transform 0.1s; }
    input:focus { outline: none; }
    a { text-decoration: none; }
  `;
  document.head.appendChild(s);
})();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAKLER CONFIG ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const MAKLER = {
  name:         "Max Mustermann",
  firma:        "Mustermann Versicherungen",
  email:        "kontakt@mustermann-versicherungen.de",
  telefon:      "089 123 456 78",
  primaryColor: "#1a3a5c",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PRODUKT CONFIG ────────────────────────────────────────────────────────────
// Hier wird gesteuert welcher Check geladen wird.
// Tausche AKTIVER_CHECK gegen einen der definierten CHECK_* aus.
// ═══════════════════════════════════════════════════════════════════════════════

const CHECK_BU = {
  id:           "bu",
  produktName:  "Berufsunfähigkeitsversicherung",
  produktKurz:  "BU",
  icon:         "💼",
  heroTitle:    (name) => `Passt Ihre BU noch zu Ihrem Leben, ${name}?`,
  heroLead:     "Gehalt, Job, Familie — wenn sich etwas ändert, kann Ihre BU-Rente plötzlich zu niedrig sein. Dieser Check zeigt in 2 Minuten ob Handlungsbedarf besteht.",
  anlaesse: [
    { id: "gehalt",        icon: "📈", label: "Gehalt gestiegen",        sub: "Beförderung, Bonus oder neue Stelle?" },
    { id: "job_wechsel",   icon: "💼", label: "Jobwechsel",              sub: "Neuer Arbeitgeber oder neue Branche?" },
    { id: "selbststaendig",icon: "🚀", label: "Selbstständig gemacht",   sub: "Freiberuflich, Firma gegründet?" },
    { id: "kind",          icon: "👶", label: "Kind bekommen",           sub: "Neues Familienmitglied, mehr Verantwortung?" },
    { id: "heirat",        icon: "💍", label: "Geheiratet",              sub: "Gemeinsame Finanzplanung verändert?" },
    { id: "immobilie",     icon: "🏠", label: "Immobilie gekauft",       sub: "Kreditrate die weiter bezahlt werden muss?" },
    { id: "krankheit",     icon: "🏥", label: "Erkrankung oder OP",      sub: "Gesundheitliche Veränderung?" },
    { id: "befoerderung",  icon: "⭐", label: "Beförderung / neue Rolle",sub: "Mehr Verantwortung, anderer Beruf?" },
  ],
  empfehlungen: {
    gehalt:        { text: "Ihr Einkommen ist gestiegen — Ihre BU-Rente sollte mindestens 70–80% des Nettoeinkommens absichern. Prüfen Sie ob die aktuelle Rente noch ausreicht.", aktion: "BU-Rente erhöhen", prio: "hoch" },
    job_wechsel:   { text: "Ein Jobwechsel kann die Berufsgruppe verändern — manche Tarife stufen Sie dadurch günstiger oder teurer ein. Außerdem: Nachversicherungsgarantie prüfen.", aktion: "Berufsgruppe und Tarif prüfen", prio: "hoch" },
    selbststaendig:{ text: "Als Selbstständiger haben Sie keinen Schutz durch die gesetzliche Rentenversicherung. Die BU-Rente muss Ihren kompletten Lebensunterhalt sichern.", aktion: "BU-Rente und Karenzzeit anpassen", prio: "hoch" },
    kind:          { text: "Mit Kind steigt die finanzielle Verantwortung. Reicht Ihre BU-Rente auch für Kinderbetreuung, wenn Sie ausfallen?", aktion: "BU-Rente auf Familienbedarf anpassen", prio: "hoch" },
    heirat:        { text: "Gemeinsame Finanzen bedeuten mehr gegenseitige Abhängigkeit. Ist Ihre BU-Rente auf die neue Haushaltssituation ausgerichtet?", aktion: "Gemeinsame Absicherung prüfen", prio: "mittel" },
    immobilie:     { text: "Die Kreditrate läuft auch wenn Sie berufsunfähig werden. Deckt Ihre BU-Rente Kreditrate und Lebenshaltungskosten zusammen?", aktion: "BU-Rente mit Kreditlast abgleichen", prio: "hoch" },
    krankheit:     { text: "Eine Erkrankung kann einen Leistungsfall auslösen oder die Versicherbarkeit zukünftiger Erhöhungen einschränken. Jetzt prüfen lassen.", aktion: "Leistungsfall und Optionen prüfen", prio: "hoch" },
    befoerderung:  { text: "Eine neue Berufsbezeichnung oder veränderte Tätigkeit kann die Einstufung im Tarif verbessern — oder erfordert eine Anpassung.", aktion: "Berufsgruppeneinstufung prüfen", prio: "mittel" },
  },
  gespraechsFazit: (anlaesse) =>
    `${anlaesse.length} Anlass${anlaesse.length > 1 ? "e" : ""} für eine BU-Anpassung — wir prüfen gemeinsam ob Ihre aktuelle Rente noch passt und ob eine Erhöhung ohne neue Gesundheitsfragen möglich ist.`,
};

const CHECK_WOHNGEBAEUDE = {
  id:           "wohngebaeude",
  produktName:  "Wohngebäudeversicherung",
  produktKurz:  "Wohngebäude",
  icon:         "🏠",
  heroTitle:    (name) => `Ist Ihr Haus noch richtig versichert, ${name}?`,
  heroLead:     "Baukosten steigen jedes Jahr — viele Gebäude sind deshalb heute unterversichert ohne dass der Eigentümer es merkt. Dieser Check zeigt ob Ihre Versicherungssumme noch stimmt.",
  anlaesse: [
    { id: "umbau",         icon: "🔨", label: "Umbau oder Anbau",        sub: "Anbau, Dachausbau, Wintergarten, Garage?" },
    { id: "sanierung",     icon: "🪟", label: "Sanierung",               sub: "Neue Fenster, Heizung, Dach, Fassade?" },
    { id: "wert_gestiegen",icon: "📈", label: "Wert gestiegen",          sub: "Grundstückswert oder Immobilienmarkt stark gestiegen?" },
    { id: "elementar",     icon: "🌊", label: "Starkregen / Überflutung", sub: "Schäden in der Region oder Klimaanpassung?" },
    { id: "kauf",          icon: "🔑", label: "Immobilie neu gekauft",   sub: "Frisch eingedeckt oder Altvertrag übernommen?" },
    { id: "photovoltaik",  icon: "☀️", label: "Photovoltaik installiert", sub: "PV-Anlage auf dem Dach?" },
    { id: "vermietung",    icon: "📋", label: "Teilvermietung",          sub: "Wohnung oder Einliegerwohnung vermietet?" },
    { id: "leerstand",     icon: "🚪", label: "Leerstand",               sub: "Haus zeitweise unbewohnt?" },
  ],
  empfehlungen: {
    umbau:         { text: "Jeder Umbau erhöht den Gebäudewert — Ihre Versicherungssumme ist dadurch automatisch zu niedrig. Melden Sie die Veränderung, sonst droht Unterversicherung im Schadensfall.", aktion: "Versicherungssumme anpassen", prio: "hoch" },
    sanierung:     { text: "Hochwertige Sanierungen erhöhen den Wiederherstellungswert deutlich. Dach, Fassade und Heizung müssen in der Summe abgebildet sein.", aktion: "Wert neu kalkulieren", prio: "hoch" },
    wert_gestiegen:{ text: "Steigende Marktpreise spiegeln sich nicht automatisch in der Versicherungssumme wider. Prüfen Sie ob der gleitende Neuwertfaktor ausreicht.", aktion: "Gleitenden Neuwertfaktor prüfen", prio: "mittel" },
    elementar:     { text: "Elementarschäden durch Starkregen oder Überschwemmung sind nicht automatisch versichert. Dieser Baustein fehlt in vielen Altverträgen.", aktion: "Elementarschutz ergänzen", prio: "hoch" },
    kauf:          { text: "Altverträge vom Vorbesitzer haben oft veraltete Deckungssummen und fehlende Bausteine. Ein Neuabschluss ist oft günstiger und besser.", aktion: "Vertrag komplett prüfen", prio: "hoch" },
    photovoltaik:  { text: "PV-Anlagen sind nicht automatisch mitversichert. Viele Tarife erfordern eine explizite Erweiterung für Ertragsausfall und Schäden.", aktion: "PV-Einschluss prüfen", prio: "hoch" },
    vermietung:    { text: "Bei Vermietung verändert sich das Risikoprofil — manche Tarife schließen Mietschäden aus oder erfordern einen gesonderten Baustein.", aktion: "Vermieter-Klausel prüfen", prio: "mittel" },
    leerstand:     { text: "Viele Policen erlöschen bei Leerstand über 60 Tage. Informieren Sie Ihren Versicherer aktiv.", aktion: "Leerstandsklausel klären", prio: "hoch" },
  },
  gespraechsFazit: (anlaesse) =>
    `${anlaesse.length} mögliche Unterversicherungsrisiko${anlaesse.length > 1 ? "s" : ""} identifiziert — wir prüfen Ihre aktuelle Deckungssumme und fehlende Bausteine.`,
};

const CHECK_RIESTER = {
  id:           "riester",
  produktName:  "Riester-Rente",
  produktKurz:  "Riester",
  icon:         "🌱",
  heroTitle:    (name) => `Bekommen Sie alle Riester-Zulagen, ${name}?`,
  heroLead:     "Riester-Zulagen werden nicht automatisch gewährt — fehlende Meldungen kosten bares Geld. Dieser Check zeigt ob Sie alles ausschöpfen.",
  anlaesse: [
    { id: "kind_neu",      icon: "👶", label: "Neues Kind",              sub: "Kinderzulage (185 € / 300 €) beantragen?" },
    { id: "kind_18",       icon: "🎓", label: "Kind wird 18 / 25",       sub: "Kinderzulage endet — Vertrag anpassen?" },
    { id: "heirat",        icon: "💍", label: "Geheiratet",              sub: "Ehepartner mitfördern lassen?" },
    { id: "gehalt",        icon: "📈", label: "Gehalt verändert",        sub: "Mindestbeitrag stimmt noch?" },
    { id: "minijob",       icon: "🔄", label: "Minijob / Teilzeit",      sub: "Förderberechtigung geändert?" },
    { id: "beamter",       icon: "⚖️", label: "Verbeamtet",              sub: "Besonderer Zugang zu Riester-Förderung?" },
    { id: "rentennah",     icon: "🏖️", label: "Näher an der Rente",      sub: "Auszahlungszeitpunkt optimieren?" },
    { id: "beitrag_falsch",icon: "⚠️", label: "Beitrag zu niedrig",      sub: "Mindestbeitrag für volle Zulage nicht erreicht?" },
  ],
  empfehlungen: {
    kind_neu:      { text: "Die Kinderzulage (185 € für vor 2008 Geborene / 300 € für ab 2008 Geborene) muss aktiv beantragt werden. Sie läuft nicht automatisch.", aktion: "Kinderzulage beantragen", prio: "hoch" },
    kind_18:       { text: "Mit 18 (bzw. 25 bei Ausbildung) entfällt die Kinderzulage. Der Mindestbeitrag ändert sich — sonst erhalten Sie die Grundzulage nicht vollständig.", aktion: "Beitrag anpassen", prio: "hoch" },
    heirat:        { text: "Auch nicht berufstätige Ehepartner können von Riester-Förderung profitieren — über einen eigenen Vertrag mit Mindesteigenbeitrag von 60 € jährlich.", aktion: "Partnervertrag prüfen", prio: "mittel" },
    gehalt:        { text: "Der Mindestbeitrag für die volle Zulage beträgt 4% des Vorjahres-Bruttoeinkommens minus Zulagen. Bei Gehaltsänderung muss dieser neu berechnet werden.", aktion: "Mindestbeitrag neu berechnen", prio: "hoch" },
    minijob:       { text: "Im Minijob entfällt die Rentenversicherungspflicht — damit auch die Riester-Berechtigung, außer Sie zahlen freiwillig in die RV ein.", aktion: "Förderberechtigung klären", prio: "hoch" },
    beamter:       { text: "Beamte sind besonders gefördert, da Pensionen durch Riester ergänzbar sind. Günstige Tarife ohne Abschlusskosten prüfen.", aktion: "Beamtentarif prüfen", prio: "mittel" },
    rentennah:     { text: "Ab 62 Jahren ist eine Auszahlung möglich. Steuerliche Behandlung und Rentenzahlungsbeginn optimieren — Einmalauszahlung vs. Rente abwägen.", aktion: "Auszahlungsstrategie planen", prio: "mittel" },
    beitrag_falsch:{ text: "Wer weniger als 4% des Vorjahresbruttos einzahlt, erhält die staatliche Zulage nur anteilig. Das ist eine der häufigsten Riester-Fallen.", aktion: "Beitrag auf Mindestbeitrag erhöhen", prio: "hoch" },
  },
  gespraechsFazit: (anlaesse) =>
    `${anlaesse.length} Punkt${anlaesse.length > 1 ? "e" : ""} zur Riester-Optimierung — wir prüfen ob Sie alle Zulagen erhalten und der Beitrag stimmt.`,
};

const CHECK_HAFTPFLICHT = {
  id:           "haftpflicht",
  produktName:  "Privathaftpflichtversicherung",
  produktKurz:  "Haftpflicht",
  icon:         "🛡️",
  heroTitle:    (name) => `Ist Ihre Haftpflicht noch vollständig, ${name}?`,
  heroLead:     "Wer mitversichert ist, welche Schäden gedeckt sind und wie hoch die Summe ist — das verändert sich mit dem Leben. Schnell-Check in 2 Minuten.",
  anlaesse: [
    { id: "heirat",        icon: "💍", label: "Geheiratet / Partner",    sub: "Partner noch nicht mitversichert?" },
    { id: "kind",          icon: "👶", label: "Kind bekommen",           sub: "Kind in der Police aufgenommen?" },
    { id: "haustier",      icon: "🐕", label: "Hund oder Pferd",         sub: "Tierhalterhaftpflicht separat nötig?" },
    { id: "umzug",         icon: "🏠", label: "Umgezogen",               sub: "Neue Wohnsituation gemeldet?" },
    { id: "ehrenamt",      icon: "🤝", label: "Ehrenamt aufgenommen",    sub: "Ehrenamtliche Tätigkeit absichern?" },
    { id: "drohne",        icon: "🚁", label: "Drohne oder E-Scooter",   sub: "Neue Risiken durch neue Fahrzeuge?" },
    { id: "schaden",       icon: "⚠️", label: "Schaden erlebt",          sub: "War der Schutz ausreichend?" },
    { id: "summe",         icon: "📋", label: "Summe noch aktuell?",     sub: "Mindestens 10 Mio. € absichern?" },
  ],
  empfehlungen: {
    heirat:    { text: "Ehepartner und Lebenspartner müssen explizit in die Police aufgenommen werden. In Altverträgen fehlt das oft.", aktion: "Partner eintragen lassen", prio: "hoch" },
    kind:      { text: "Kinder bis zum Ende der Ausbildung sind meist mitversichert — aber nur wenn die Familienhaftpflicht abgeschlossen wurde. Einzeltarife schließen Kinder aus.", aktion: "Kindermitversicherung prüfen", prio: "hoch" },
    haustier:  { text: "Hunde und Pferde sind in der Privathaftpflicht meist ausgeschlossen. Dafür braucht es eine eigene Tierhalterhaftpflicht.", aktion: "Tierhalterhaftpflicht abschließen", prio: "hoch" },
    umzug:     { text: "Neue Adresse melden — in manchen Tarifen verändert sich der Beitrag regional. Außerdem: Mietsachschäden in der neuen Wohnung versichert?", aktion: "Adresse melden, Mietsachschäden prüfen", prio: "mittel" },
    ehrenamt:  { text: "Ehrenamtliche Tätigkeiten können zusätzliche Haftpflichtrisiken erzeugen. Manche Tarife haben Bausteine dafür — andere nicht.", aktion: "Ehrenamtsbaustein prüfen", prio: "mittel" },
    drohne:    { text: "Drohnen und E-Scooter sind über die Privathaftpflicht in der Regel nicht versichert — sie benötigen eigene Policen.", aktion: "Separate Police prüfen", prio: "hoch" },
    schaden:   { text: "Wenn ein Schaden nicht vollständig erstattet wurde, lohnt ein Tarif-Vergleich. Deckungslücken jetzt schließen — bevor der nächste Schaden kommt.", aktion: "Tarif und Deckung vergleichen", prio: "hoch" },
    summe:     { text: "Versicherungssummen unter 10 Mio. € sind bei größeren Personenschäden schnell aufgebraucht. Mindeststandard heute: 10–50 Mio. €.", aktion: "Deckungssumme erhöhen", prio: "hoch" },
  },
  gespraechsFazit: (anlaesse) =>
    `${anlaesse.length} Punkt${anlaesse.length > 1 ? "e" : ""} zur Haftpflicht-Aktualisierung — wir prüfen wer mitversichert ist und ob Deckungssumme und Bausteine noch stimmen.`,
};

const CHECK_KFZ = {
  id:           "kfz",
  produktName:  "Kfz-Versicherung",
  produktKurz:  "Kfz",
  icon:         "🚗",
  heroTitle:    (name) => `Sparen Sie noch bei Ihrer Kfz-Versicherung, ${name}?`,
  heroLead:     "Die Kfz-Wechselsaison läuft. Jetzt ist der beste Zeitpunkt um zu prüfen ob Sie zu viel zahlen oder Schutz fehlt.",
  anlaesse: [
    { id: "neues_auto",    icon: "🚗", label: "Neues Fahrzeug",          sub: "Auto gewechselt oder neu angeschafft?" },
    { id: "umzug",         icon: "📍", label: "Umgezogen",               sub: "Neue Regionalklasse — Beitrag kann sinken?" },
    { id: "sf_klasse",     icon: "⭐", label: "SF-Klasse übertragen",    sub: "Klasse von Eltern oder Partner übernehmen?" },
    { id: "wenig_km",      icon: "📉", label: "Weniger Kilometer",       sub: "Homeoffice, weniger Pendeln?" },
    { id: "garage",        icon: "🏠", label: "Garage vorhanden",        sub: "Abstellort geändert? Rabatt möglich?" },
    { id: "e_auto",        icon: "⚡", label: "E-Auto oder Hybrid",      sub: "Spezialschutz für Akku und Wallbox?" },
    { id: "schaden",       icon: "⚠️", label: "Schaden gehabt",          sub: "Hochstufung — Wechsel kann helfen?" },
    { id: "wechselsaison", icon: "📅", label: "Wechselsaison November",  sub: "Kündigung bis 30.11. möglich?" },
  ],
  empfehlungen: {
    neues_auto:    { text: "Bei einem Fahrzeugwechsel muss die Police auf das neue Fahrzeug umgestellt werden. Typklasse und Deckung neu prüfen.", aktion: "Police umstellen", prio: "hoch" },
    umzug:         { text: "Regionalklassen unterscheiden sich stark — ein Umzug kann den Beitrag senken oder erhöhen. Neue Adresse sofort melden.", aktion: "Adresse melden, Beitrag prüfen", prio: "hoch" },
    sf_klasse:     { text: "Unter bestimmten Bedingungen können Sie die SF-Klasse von Eltern oder dem Partner übernehmen — das spart sofort.", aktion: "SF-Übernahme prüfen", prio: "mittel" },
    wenig_km:      { text: "Wer weniger fährt, zahlt weniger. Jährliche Kilometerleistung nach unten anpassen — aber realistisch bleiben.", aktion: "Kilometerleistung anpassen", prio: "mittel" },
    garage:        { text: "Überdachter Stellplatz oder Garage kann den Beitrag reduzieren. Abstellort beim Versicherer aktualisieren.", aktion: "Abstellort aktualisieren", prio: "mittel" },
    e_auto:        { text: "E-Autos brauchen Spezialschutz für Akku, Ladekabel und Wallbox. Viele Standardtarife decken das nicht ausreichend.", aktion: "E-Auto-Schutz prüfen", prio: "hoch" },
    schaden:       { text: "Nach einem Schaden wird die SF-Klasse zurückgestuft. Ein Wechsel zu einem anderen Anbieter kann die Hochstufung mildern.", aktion: "Tarifwechsel nach Schaden prüfen", prio: "mittel" },
    wechselsaison: { text: "Kündigung der Kfz-Versicherung muss bis 30. November beim aktuellen Versicherer eingehen. Jetzt Vergleich machen.", aktion: "Kündigung vorbereiten", prio: "hoch" },
  },
  gespraechsFazit: (anlaesse) =>
    `${anlaesse.length} Ansatzpunkt${anlaesse.length > 1 ? "e" : ""} für Ihre Kfz-Optimierung — wir prüfen Beitrag, Deckung und ob ein Wechsel sich lohnt.`,
};

export {
  CHECK_BU,
  CHECK_WOHNGEBAEUDE,
  CHECK_RIESTER,
  CHECK_HAFTPFLICHT,
  CHECK_KFZ,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FARB-HELPER ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const C = MAKLER.primaryColor;
const alpha = (hex, a) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HAUPT-KOMPONENTE ─────────────────────────────────────────────════════════
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProduktCheck({ checkConfig = CHECK_BU }) {
  const [phase, setPhase]         = useState(1);   // 1=intro | 2=anlässe | 3=ergebnis | 4=kontakt | 5=danke
  const [animKey, setAnimKey]     = useState(0);
  const [gewaehlteIds, setGewaehlteIds] = useState([]);
  const [formData, setFormData]   = useState({ name: "", email: "", telefon: "" });

  const check = checkConfig;
  const goTo  = (p) => { setAnimKey(k=>k+1); setPhase(p); window.scrollTo({top:0}); };
  const toggle = (id) => setGewaehlteIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  // Empfehlungen berechnen
  const empfehlungen = gewaehlteIds
    .map(id => ({ id, ...check.empfehlungen[id] }))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.prio === b.prio) return 0;
      if (a.prio === "hoch") return -1;
      if (b.prio === "hoch") return 1;
      return 0;
    });

  const dringend = empfehlungen.filter(e => e.prio === "hoch").length;
  const kundenName = formData.name.split(" ")[0] || "Sie";

  // Fortschritt
  const progPct = { 1:10, 2:45, 3:80, 4:94, 5:100 }[phase] || 0;

  // ── Design Tokens ──
  const T = {
    root:      { minHeight:"100vh", background:"#f0f2f5", fontFamily:"'Outfit',system-ui,sans-serif" },
    header:    { position:"sticky", top:0, zIndex:100, background:"rgba(240,242,245,0.9)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(0,0,0,0.06)" },
    logoWrap:  { display:"flex", alignItems:"center", gap:"8px" },
    logoIcon:  { width:"28px", height:"28px", borderRadius:"8px", background:C, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" },
    logoText:  { fontSize:"13px", fontWeight:"700", color:C },
    prodBadge: { fontSize:"11px", fontWeight:"600", letterSpacing:"0.3px", padding:"3px 10px", borderRadius:"20px", background:alpha(C,0.1), color:C },
    progBar:   { height:"3px", background:"#e5e7eb" },
    progFill:  { height:"100%", width:`${progPct}%`, background:C, transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)", borderRadius:"0 2px 2px 0" },
    hero:      { padding:"28px 20px 16px" },
    eyebrow:   { fontSize:"11px", fontWeight:"700", letterSpacing:"1.2px", textTransform:"uppercase", color:alpha(C,0.55), marginBottom:"8px" },
    h1:        { fontSize:"26px", fontWeight:"800", color:"#0f1923", lineHeight:1.22, letterSpacing:"-0.5px" },
    lead:      { fontSize:"15px", color:"#6b7280", lineHeight:1.62, marginTop:"8px" },
    body:      { paddingBottom:"110px" },
    secLabel:  { fontSize:"11px", fontWeight:"700", letterSpacing:"1px", textTransform:"uppercase", color:"#9ca3af", padding:"16px 20px 8px" },
    card:      { margin:"0 16px 10px", background:"#fff", borderRadius:"18px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.05)", overflow:"hidden" },
    eventGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", padding:"0 16px" },
    eCard:     (a) => ({ padding:"16px 14px", borderRadius:"16px", border:`2px solid ${a?C:"#e5e7eb"}`, background:a?alpha(C,0.05):"#fff", cursor:"pointer", transition:"all 0.18s", display:"flex", flexDirection:"column", gap:"5px" }),
    eIcon:     { fontSize:"24px" },
    eLabel:    (a) => ({ fontSize:"13px", fontWeight:a?"600":"500", color:a?C:"#374151", lineHeight:1.3 }),
    eSub:      { fontSize:"11px", color:"#9ca3af", lineHeight:1.4 },
    rCard:     (h) => ({ padding:"14px 16px", borderRadius:"14px", background:h?"#fff9f9":"#fafafa", border:`1.5px solid ${h?"#fecaca":"#e5e7eb"}`, marginBottom:"8px" }),
    rProd:     { fontSize:"14px", fontWeight:"700", color:"#111827" },
    rText:     { fontSize:"13px", color:"#4b5563", lineHeight:1.55, marginTop:"4px" },
    rAktion:   { display:"inline-flex", alignItems:"center", gap:"5px", marginTop:"8px", fontSize:"12px", fontWeight:"600", color:C },
    badge:     (h) => ({ display:"inline-flex", fontSize:"10px", fontWeight:"700", letterSpacing:"0.4px", textTransform:"uppercase", padding:"2px 7px", borderRadius:"20px", background:h?"#fee2e2":"#fef9c3", color:h?"#dc2626":"#92400e", marginLeft:"6px", verticalAlign:"middle" }),
    inputWrap: { marginBottom:"14px" },
    iLabel:    { display:"block", fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px", textTransform:"uppercase", color:"#9ca3af", marginBottom:"6px" },
    input:     { width:"100%", padding:"13px 14px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"15px", color:"#111827", background:"#fafafa" },
    footer:    { position:"sticky", bottom:0, background:"rgba(240,242,245,0.94)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", padding:"12px 20px 28px", borderTop:"1px solid rgba(0,0,0,0.05)" },
    btnMain:   (dis) => ({ width:"100%", padding:"15px", background:dis?"#d1d5db":C, color:"#fff", borderRadius:"14px", fontSize:"15px", fontWeight:"600", letterSpacing:"-0.1px", cursor:dis?"default":"pointer", transition:"background 0.2s" }),
    btnBack:   { width:"100%", padding:"10px", color:"#9ca3af", fontSize:"14px", marginTop:"4px" },
  };

  // ── Shell ──
  const Shell = ({ eyebrow, title, lead, children, footer }) => (
    <div style={T.root}>
      <div style={T.header}>
        <div style={T.logoWrap}>
          <div style={T.logoIcon}>{check.icon}</div>
          <span style={T.logoText}>{MAKLER.firma}</span>
        </div>
        <span style={T.prodBadge}>{check.produktKurz}-Check</span>
      </div>
      <div style={T.progBar}><div style={T.progFill} /></div>
      <div key={animKey} className="anim-fadeup" style={T.body}>
        <div style={T.hero}>
          {eyebrow && <div style={T.eyebrow}>{eyebrow}</div>}
          {title   && <h1 style={T.h1}>{title}</h1>}
          {lead    && <p style={T.lead}>{lead}</p>}
        </div>
        {children}
      </div>
      {footer && <div style={T.footer}>{footer}</div>}
    </div>
  );

  // ═══ PHASE 1 — Intro ═════════════════════════════════════════════════════
  if (phase === 1) return (
    <Shell
      eyebrow={`${check.produktName} · Persönlicher Check`}
      title={check.heroTitle(kundenName)}
      lead={check.heroLead}
      footer={
        <button style={T.btnMain(false)} onClick={() => goTo(2)}>
          Check starten →
        </button>
      }
    >
      {/* Produkt-Info Card */}
      <div style={{ padding:"0 16px" }}>
        <div style={T.card}>
          <div style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px", textTransform:"uppercase", color:"#9ca3af", marginBottom:"10px" }}>Wie es funktioniert</div>
            {[
              ["1", "Relevante Anlässe antippen", "Was hat sich in Ihrem Leben verändert?"],
              ["2", "Sofortiges Ergebnis", "Wir zeigen was sich an Ihrer Police ändern sollte."],
              ["3", "Ins Gespräch mitnehmen", "Ein kurzer Termin — kein Verkaufsgespräch."],
            ].map(([n, t, sub]) => (
              <div key={n} style={{ display:"flex", gap:"14px", marginBottom:"14px", alignItems:"flex-start" }}>
                <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:alpha(C,0.1), color:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", flexShrink:0, marginTop:"1px" }}>{n}</div>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"600", color:"#111827" }}>{t}</div>
                  <div style={{ fontSize:"13px", color:"#9ca3af", marginTop:"2px" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Makler */}
        <div style={{ ...T.card, marginTop:"0" }}>
          <div style={{ padding:"16px 18px", display:"flex", alignItems:"center", gap:"14px" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:alpha(C,0.1), color:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:"700", flexShrink:0 }}>
              {MAKLER.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize:"14px", fontWeight:"600", color:"#111827" }}>{MAKLER.name}</div>
              <div style={{ fontSize:"12px", color:"#9ca3af" }}>{MAKLER.firma}</div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );

  // ═══ PHASE 2 — Anlässe ═══════════════════════════════════════════════════
  if (phase === 2) return (
    <Shell
      eyebrow={`${check.produktName} · Schritt 1 von 2`}
      title="Was hat sich bei Ihnen verändert?"
      lead={`Alles antippen was zutrifft — wir zeigen dann was das für Ihre ${check.produktKurz} bedeutet.`}
      footer={
        <>
          <button style={T.btnMain(gewaehlteIds.length === 0)} onClick={() => gewaehlteIds.length > 0 && goTo(3)}>
            Ergebnis anzeigen {gewaehlteIds.length > 0 ? `· ${gewaehlteIds.length} ausgewählt` : ""}
          </button>
          <button style={T.btnBack} onClick={() => goTo(1)}>← Zurück</button>
        </>
      }
    >
      <div style={T.eventGrid}>
        {check.anlaesse.map((e) => {
          const aktiv = gewaehlteIds.includes(e.id);
          return (
            <div key={e.id} style={T.eCard(aktiv)} onClick={() => toggle(e.id)}>
              <div style={T.eIcon}>{e.icon}</div>
              <div style={T.eLabel(aktiv)}>{e.label}</div>
              <div style={T.eSub}>{e.sub}</div>
              {aktiv && (
                <div style={{ display:"flex", alignItems:"center", gap:"4px", marginTop:"4px" }}>
                  <div style={{ width:"14px", height:"14px", borderRadius:"50%", background:C, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize:"11px", color:C, fontWeight:"600" }}>Ausgewählt</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );

  // ═══ PHASE 3 — Ergebnis ══════════════════════════════════════════════════
  if (phase === 3) return (
    <Shell
      eyebrow={`Ihre ${check.produktKurz} im Check`}
      title={dringend > 0 ? `${dringend} dringende${dringend > 1 ? " Punkte" : "r Punkt"} gefunden` : "Alles geprüft — Details besprechen"}
      lead={`${empfehlungen.length} Hinweis${empfehlungen.length !== 1 ? "e" : ""} zu Ihrer ${check.produktName}`}
      footer={
        <>
          <button style={T.btnMain(false)} onClick={() => goTo(4)}>
            In das Gespräch mitnehmen →
          </button>
          <button style={T.btnBack} onClick={() => goTo(2)}>← Anpassen</button>
        </>
      }
    >
      {/* Empfehlungen */}
      <div style={{ padding:"0 16px" }}>
        {empfehlungen.map((item, i) => (
          <div key={i} style={T.rCard(item.prio === "hoch")}>
            <div>
              <span style={T.rProd}>{item.aktion}</span>
              <span style={T.badge(item.prio === "hoch")}>{item.prio === "hoch" ? "Dringend" : "Prüfen"}</span>
            </div>
            <p style={T.rText}>{item.text}</p>
            <div style={T.rAktion}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Im Gespräch besprechen
            </div>
          </div>
        ))}
      </div>

      {/* Fazit-Box */}
      <div style={{ margin:"8px 16px 0", padding:"16px 18px", background:alpha(C,0.06), borderRadius:"16px", border:`1.5px solid ${alpha(C,0.14)}` }}>
        <div style={{ fontSize:"13px", fontWeight:"700", color:C, marginBottom:"4px" }}>Das nehmen wir ins Gespräch</div>
        <div style={{ fontSize:"13px", color:"#4b5563", lineHeight:1.6 }}>
          {check.gespraechsFazit(gewaehlteIds)}
        </div>
      </div>
    </Shell>
  );

  // ═══ PHASE 4 — Kontakt ═══════════════════════════════════════════════════
  if (phase === 4) {
    const valid = formData.name.trim() && formData.email.trim();
    return (
      <Shell
        eyebrow="Fast geschafft"
        title="Termin vereinbaren"
        lead="Wir melden uns innerhalb von 24 Stunden bei Ihnen."
        footer={
          <>
            <button style={T.btnMain(!valid)} disabled={!valid} onClick={() => goTo(5)}>
              Gespräch anfragen
            </button>
            <button style={T.btnBack} onClick={() => goTo(3)}>← Zurück</button>
          </>
        }
      >
        <div style={{ padding:"0 16px" }}>
          <div style={T.card}>
            <div style={{ padding:"20px" }}>
              {[
                { k:"name",    l:"Ihr Name",  t:"text",  ph:"Max Mustermann",  req:true },
                { k:"email",   l:"E-Mail",    t:"email", ph:"max@beispiel.de", req:true },
                { k:"telefon", l:"Telefon",   t:"tel",   ph:"089 123 456 78",  req:false },
              ].map(({k,l,t,ph,req}) => (
                <div key={k} style={T.inputWrap}>
                  <label style={T.iLabel}>{l}{req?" *":""}</label>
                  <input type={t} placeholder={ph} value={formData[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} style={T.input} />
                </div>
              ))}
              <p style={{ fontSize:"11px", color:"#d1d5db", marginTop:"4px" }}>Ihre Daten werden vertraulich behandelt.</p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ═══ PHASE 5 — Danke ══════════════════════════════════════════════════════
  if (phase === 5) return (
    <Shell>
      <div style={{ padding:"48px 20px 0", textAlign:"center" }} className="anim-fadeup">
        <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:alpha(C,0.1), color:C, fontSize:"28px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>✓</div>
        <h1 style={{ fontSize:"26px", fontWeight:"800", color:"#0f1923", letterSpacing:"-0.5px", marginBottom:"8px" }}>
          Danke, {formData.name.split(" ")[0] || ""}!
        </h1>
        <p style={{ fontSize:"15px", color:"#6b7280", lineHeight:1.65 }}>
          Ihre Anfrage ist eingegangen.<br />Wir melden uns innerhalb von 24 Stunden.
        </p>
      </div>
      <div style={{ padding:"24px 16px 0" }}>
        <div style={{ background:"#fff", borderRadius:"18px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.05)", overflow:"hidden" }}>
          <div style={{ padding:"16px 18px", borderBottom:"1px solid #f3f4f6" }}>
            <div style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px", textTransform:"uppercase", color:"#9ca3af", marginBottom:"5px" }}>Ihr Berater</div>
            <div style={{ fontSize:"15px", fontWeight:"600", color:"#111827" }}>{MAKLER.name}</div>
            <div style={{ fontSize:"13px", color:"#9ca3af" }}>{MAKLER.firma}</div>
          </div>
          <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:"10px" }}>
            <a href={`tel:${MAKLER.telefon}`} style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"14px", color:C, fontWeight:"500" }}>
              <span style={{ width:"34px", height:"34px", borderRadius:"9px", background:alpha(C,0.08), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>📞</span>
              {MAKLER.telefon}
            </a>
            <a href={`mailto:${MAKLER.email}`} style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"14px", color:C, fontWeight:"500" }}>
              <span style={{ width:"34px", height:"34px", borderRadius:"9px", background:alpha(C,0.08), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>✉️</span>
              {MAKLER.email}
            </a>
          </div>
        </div>
      </div>
    </Shell>
  );

  return null;
}
