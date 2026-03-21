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
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
    html, body { height:100%; background:#f0f2f5; font-family:'Outfit',system-ui,sans-serif; }
    button, input, select { font-family:inherit; cursor:pointer; border:none; background:none; }
    input, select { cursor:text; }
    ::-webkit-scrollbar { display:none; }
    * { scrollbar-width:none; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
    @keyframes countUp { from{opacity:0;transform:scale(0.85);} to{opacity:1;transform:scale(1);} }
    .anim-fadeup { animation:fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-count  { animation:countUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    button:active { transform:scale(0.97); transition:transform 0.1s; }
    input:focus, select:focus { outline:none; border-color:var(--accent) !important; }
    input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; background:#e5e7eb; cursor:pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:var(--c); border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
    a { text-decoration:none; }
  `;
  document.head.appendChild(s);
})();

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MAKLER = {
  name:         "Max Mustermann",
  firma:        "Mustermann Versicherungen",
  email:        "kontakt@mustermann-versicherungen.de",
  telefon:      "089 123 456 78",
  primaryColor: "#1a3a5c",
};
const C = MAKLER.primaryColor;
const alpha = (hex, a) => {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};
const fmt = (n) => Math.round(n).toLocaleString("de-DE") + " €";
const fmtK = (n) => n >= 1000 ? (n/1000).toFixed(0) + ".000 €" : fmt(n);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── RECHNER DEFINITIONEN ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. BU-RENTENLÜCKE ────────────────────────────────────────────────────────
const RECHNER_BU = {
  id:          "bu",
  icon:        "💼",
  titel:       "BU-Rentenlücken-Rechner",
  heroTitle:   "Wie groß ist Ihre BU-Lücke?",
  heroLead:    "Die gesetzliche Erwerbsminderungsrente reicht selten aus. Berechnen Sie jetzt Ihre monatliche Absicherungslücke.",
  felder: [
    { id:"brutto",    label:"Monatliches Bruttogehalt",  typ:"slider", min:1500,  max:12000, step:100,  einheit:"€/Monat",  default:4000 },
    { id:"alter",     label:"Aktuelles Alter",           typ:"slider", min:20,    max:60,    step:1,    einheit:"Jahre",    default:35 },
    { id:"bu_rente",  label:"Vorhandene BU-Rente",       typ:"slider", min:0,     max:4000,  step:100,  einheit:"€/Monat",  default:0,
      hinweis:"0 € = noch keine BU-Versicherung vorhanden" },
  ],
  berechne: (w) => {
    const netto       = w.brutto * 0.67;                         // ca. 67% Netto-Quote
    const emRente     = w.brutto * 0.38;                         // gesetzl. EM-Rente ca. 38% des Bruttos
    const zielRente   = netto * 0.80;                            // Ziel: 80% des Nettos absichern
    const luecke      = Math.max(0, zielRente - w.bu_rente - emRente);
    const versorgung  = w.bu_rente + emRente;
    const deckungsgrad= Math.round((versorgung / zielRente) * 100);
    return {
      hauptwert:    luecke,
      hauptLabel:   "Monatliche Absicherungslücke",
      felder: [
        { label:"Ihr Nettoeinkommen (ca.)",         wert: fmt(netto),     sub:"Basis für die Berechnung" },
        { label:"Gesetzl. Erwerbsminderungsrente",  wert: fmt(emRente),   sub:"Volle EM-Rente (ca. 38% des Bruttos)" },
        { label:"Vorhandene BU-Rente",              wert: fmt(w.bu_rente),sub:"Bestehender Vertrag" },
        { label:"Ziel-Absicherung (80% Netto)",     wert: fmt(zielRente), sub:"Empfohlene Mindestabsicherung" },
        { label:"Deckungsgrad",                     wert: deckungsgrad + "%", sub:"Wie viel ist bereits abgesichert", highlight: deckungsgrad < 60 },
      ],
      ampel:  luecke === 0 ? "gruen" : luecke < 1000 ? "gelb" : "rot",
      fazit:  luecke === 0
        ? "Ihre BU-Absicherung ist vollständig. Regelmäßig prüfen ob die Rente noch zum Einkommen passt."
        : `Monatlich fehlen ${fmt(luecke)} im Fall einer Berufsunfähigkeit. ${w.bu_rente === 0 ? "Sie haben noch keine BU-Versicherung abgeschlossen." : "Ihre bestehende BU-Rente sollte erhöht werden."}`,
      empfehlung: luecke > 0 ? `BU-Rente von mindestens ${fmt(luecke)} absichern` : null,
    };
  },
};

// ── 2. PFLEGEKOSTEN-LÜCKE ─────────────────────────────────────────────────────
const RECHNER_PFLEGE = {
  id:          "pflege",
  icon:        "🤝",
  titel:       "Pflegekosten-Lücken-Rechner",
  heroTitle:   "Was zahlen Sie im Pflegefall selbst?",
  heroLead:    "Die gesetzliche Pflegeversicherung deckt nur einen Teil der Kosten. Berechnen Sie Ihren monatlichen Eigenanteil.",
  felder: [
    { id:"pflegegrad",  label:"Pflegegrad",                  typ:"select",
      optionen:[{v:"2",l:"Pflegegrad 2"},{v:"3",l:"Pflegegrad 3"},{v:"4",l:"Pflegegrad 4"},{v:"5",l:"Pflegegrad 5"}],
      default:"3" },
    { id:"versorgung",  label:"Pflegeform",                  typ:"select",
      optionen:[{v:"heim",l:"Vollstationäre Pflege (Heim)"},{v:"ambulant",l:"Ambulante Pflege zu Hause"}],
      default:"heim" },
    { id:"vorhandene_pflege", label:"Vorhandene private Pflegezusatz", typ:"slider", min:0, max:3000, step:50, einheit:"€/Monat", default:0,
      hinweis:"0 € = keine private Pflegeversicherung" },
  ],
  berechne: (w) => {
    // Heimkosten und gesetzliche Leistungen nach aktuellem Stand (2024/2025)
    const heimkosten = { "2":3200, "3":3600, "4":3900, "5":4100 };
    const ambulantkosten = { "2":1200, "3":1600, "4":2000, "5":2400 };
    const gesetzLeistungHeim = { "2":770, "3":1262, "4":1775, "5":2005 };
    const gesetzLeistungAmbulant = { "2":724, "3":1363, "4":1693, "5":2095 };

    const gesamtkosten = w.versorgung === "heim" ? heimkosten[w.pflegegrad] : ambulantkosten[w.pflegegrad];
    const gesetzLeistung = w.versorgung === "heim" ? gesetzLeistungHeim[w.pflegegrad] : gesetzLeistungAmbulant[w.pflegegrad];
    const eigenanteil = Math.max(0, gesamtkosten - gesetzLeistung - w.vorhandene_pflege);
    const deckung = Math.round(((gesetzLeistung + w.vorhandene_pflege) / gesamtkosten) * 100);

    return {
      hauptwert:  eigenanteil,
      hauptLabel: "Monatlicher Eigenanteil",
      felder: [
        { label:"Gesamtpflegekosten",             wert: fmt(gesamtkosten),    sub:`${w.versorgung === "heim" ? "Vollstationär" : "Ambulant"}, Pflegegrad ${w.pflegegrad}` },
        { label:"Gesetzliche Pflegeleistung",     wert: fmt(gesetzLeistung),  sub:"Leistung der sozialen Pflegeversicherung" },
        { label:"Private Pflegezusatz",           wert: fmt(w.vorhandene_pflege), sub:"Bestehender Vertrag" },
        { label:"Eigenanteil pro Monat",          wert: fmt(eigenanteil),     sub:"Was Sie selbst tragen müssen", highlight: eigenanteil > 1000 },
        { label:"Hochrechnung auf 3 Jahre",       wert: fmtK(eigenanteil*36), sub:"Typische Pflegedauer Ø 3 Jahre" },
        { label:"Deckungsgrad",                   wert: deckung + "%",        sub:"Wie viel ist bereits gedeckt", highlight: deckung < 70 },
      ],
      ampel:  eigenanteil === 0 ? "gruen" : eigenanteil < 800 ? "gelb" : "rot",
      fazit:  eigenanteil === 0
        ? "Ihre Pflegeabsicherung ist vollständig. Regelmäßig prüfen ob die Leistung noch ausreicht."
        : `Monatlich ${fmt(eigenanteil)} Eigenanteil — über 3 Jahre wären das ${fmtK(eigenanteil*36)}. ${w.vorhandene_pflege === 0 ? "Sie haben noch keine private Pflegezusatzversicherung." : "Ihre bestehende Pflegezusatz sollte erhöht werden."}`,
      empfehlung: eigenanteil > 0 ? `Pflegezusatz von mindestens ${fmt(eigenanteil)}/Monat absichern` : null,
    };
  },
};

// ── 3. RENTENLÜCKE ────────────────────────────────────────────────────────────
const RECHNER_RENTE = {
  id:          "rente",
  icon:        "🌱",
  titel:       "Rentenlücken-Rechner",
  heroTitle:   "Wie groß ist Ihre Rentenlücke?",
  heroLead:    "Die gesetzliche Rente ersetzt nur einen Teil Ihres Einkommens. Berechnen Sie wie viel Sie zusätzlich ansparen müssen.",
  felder: [
    { id:"netto",       label:"Aktuelles Nettoeinkommen",    typ:"slider", min:1000, max:8000, step:100, einheit:"€/Monat",  default:2800 },
    { id:"alter",       label:"Aktuelles Alter",             typ:"slider", min:20,   max:60,   step:1,   einheit:"Jahre",    default:35 },
    { id:"rentenalter", label:"Gewünschtes Rentenalter",     typ:"slider", min:60,   max:70,   step:1,   einheit:"Jahre",    default:67 },
    { id:"vorhandene",  label:"Bestehende Zusatzvorsorge",   typ:"slider", min:0,    max:2000, step:50,  einheit:"€/Monat Rente", default:0,
      hinweis:"Riester, Rürup, bAV, private Rente zusammen" },
  ],
  berechne: (w) => {
    const jahreBisRente   = Math.max(1, w.rentenalter - w.alter);
    const gesetzlRente    = w.netto * 0.48;                       // ca. 48% des Nettos (Näherung)
    const zielRente       = w.netto * 0.80;                       // Ziel: 80% des letzten Nettos
    const luecke          = Math.max(0, zielRente - gesetzlRente - w.vorhandene);
    // Notwendige Sparrate (Annuität, 4% Realrendite, 20 Jahre Rente)
    const zinsFaktor      = 0.04;
    const ansparFaktor    = ((Math.pow(1+zinsFaktor, jahreBisRente)-1)/zinsFaktor) * Math.pow(1+zinsFaktor, jahreBisRente);
    const rentenFaktor    = (1 - Math.pow(1+zinsFaktor,-20)) / zinsFaktor;
    const benoetigKapital = luecke * 12 * rentenFaktor;
    const monatlicheRate  = luecke > 0 ? benoetigKapital / (ansparFaktor) : 0;
    const deckungsgrad    = Math.round(((gesetzlRente + w.vorhandene) / zielRente) * 100);

    return {
      hauptwert:  luecke,
      hauptLabel: "Monatliche Rentenlücke",
      felder: [
        { label:"Prognostizierte gesetzl. Rente",  wert: fmt(gesetzlRente),     sub:"Ca. 48% des aktuellen Nettos (vereinfacht)" },
        { label:"Bestehende Zusatzvorsorge",        wert: fmt(w.vorhandene),     sub:"Riester, Rürup, bAV, private Rente" },
        { label:"Zielrente (80% des Nettos)",       wert: fmt(zielRente),        sub:"Empfohlene Mindestversorgung im Alter" },
        { label:"Rentenlücke pro Monat",            wert: fmt(luecke),           sub:"Was zusätzlich fehlt", highlight: luecke > 500 },
        { label:"Notwendige Sparrate",              wert: fmt(monatlicheRate) + "/Monat", sub:`Bei ${jahreBisRente} Jahren Ansparzeit und 4% Rendite` },
        { label:"Deckungsgrad",                     wert: deckungsgrad + "%",    sub:"Wie viel der Zielrente ist gedeckt", highlight: deckungsgrad < 70 },
      ],
      ampel:  luecke === 0 ? "gruen" : luecke < 500 ? "gelb" : "rot",
      fazit:  luecke === 0
        ? "Ihre Altersvorsorge ist gut aufgestellt. Regelmäßig prüfen und an Einkommensänderungen anpassen."
        : `Monatlich fehlen ${fmt(luecke)} im Ruhestand. Um diese Lücke zu schließen, sollten Sie ${fmt(monatlicheRate)} pro Monat zusätzlich ansparen.`,
      empfehlung: luecke > 0 ? `Sparrate von ${fmt(monatlicheRate)}/Monat aufbauen` : null,
    };
  },
};

// ── 4. KRANKENTAGEGELD-LÜCKE ──────────────────────────────────────────────────
const RECHNER_KTG = {
  id:          "ktg",
  icon:        "🏥",
  titel:       "Krankentagegeld-Lücken-Rechner",
  heroTitle:   "Was fehlt bei langer Krankheit?",
  heroLead:    "Nach 6 Wochen Lohnfortzahlung springt die Krankenkasse ein — aber das Krankengeld liegt deutlich unter Ihrem Nettoeinkommen.",
  felder: [
    { id:"brutto",      label:"Monatliches Bruttogehalt",    typ:"slider", min:1500, max:12000, step:100, einheit:"€/Monat",    default:4000 },
    { id:"beruf",       label:"Berufsstatus",                typ:"select",
      optionen:[{v:"angestellt",l:"Angestellt"},{v:"selbststaendig",l:"Selbstständig"}],
      default:"angestellt" },
    { id:"vorhandenes_ktg", label:"Vorhandenes Krankentagegeld", typ:"slider", min:0, max:150, step:5, einheit:"€/Tag", default:0,
      hinweis:"0 = keine private Absicherung" },
  ],
  berechne: (w) => {
    const netto            = w.brutto * 0.67;
    const nettoTag         = netto / 30;
    // Gesetzliches Krankengeld: 70% des Bruttos, max. 90% des Nettos, ab Tag 43
    const kgBrutto         = w.brutto * 0.70 / 30;
    const kgNetto          = Math.min(kgBrutto, netto * 0.90 / 30);
    const gesetzlKG        = w.beruf === "selbststaendig" ? 0 : kgNetto;
    const vorhandeneTag    = w.vorhandenes_ktg;
    const lueckeTag        = Math.max(0, nettoTag - gesetzlKG - vorhandeneTag);
    const lueckeMonat      = lueckeTag * 30;
    const luecke6Monate    = lueckeMonat * 6;
    const deckung          = Math.round(((gesetzlKG + vorhandeneTag) / nettoTag) * 100);

    return {
      hauptwert:  lueckeMonat,
      hauptLabel: "Monatliche Einkommenslücke (ab Tag 43)",
      felder: [
        { label:"Ihr Nettoeinkommen",               wert: fmt(netto),           sub:"Basis für die Berechnung" },
        { label:"Gesetzliches Krankengeld",         wert: w.beruf === "selbststaendig" ? "0 € (nicht vorhanden)" : fmt(gesetzlKG*30), sub:w.beruf === "selbststaendig" ? "Selbstständige erhalten kein Krankengeld" : "Ab dem 43. Krankheitstag" },
        { label:"Vorhandenes Krankentagegeld",      wert: fmt(vorhandeneTag*30),sub:"Bestehende private Absicherung / Monat" },
        { label:"Lücke pro Monat",                  wert: fmt(lueckeMonat),     sub:"Einkommensausfall ab Tag 43", highlight: lueckeMonat > 300 },
        { label:"Hochrechnung auf 6 Monate",        wert: fmt(luecke6Monate),   sub:"Bei längerer Krankheit" },
        { label:"Deckungsgrad",                     wert: deckung + "%",        sub:"Wie viel des Nettoeinkommens ist gedeckt", highlight: deckung < 80 },
      ],
      ampel:  lueckeMonat === 0 ? "gruen" : lueckeMonat < 400 ? "gelb" : "rot",
      fazit:  lueckeMonat === 0
        ? "Ihre Krankentagegeld-Absicherung ist vollständig. Regelmäßig an Gehaltsänderungen anpassen."
        : `Monatlich ${fmt(lueckeMonat)} Einkommenslücke ab dem 43. Krankheitstag. ${w.beruf === "selbststaendig" ? "Als Selbstständiger ohne gesetzliches Krankengeld ist die Absicherung besonders wichtig." : "Ein privates Krankentagegeld schließt diese Lücke."}`,
      empfehlung: lueckeMonat > 0 ? `Krankentagegeld von ${Math.round(lueckeTag)} €/Tag (${fmt(lueckeMonat)}/Monat) absichern` : null,
    };
  },
};

// ── 5. RISIKOLEBEN-ABSICHERUNGSLÜCKE ─────────────────────────────────────────
const RECHNER_RISIKOLEBEN = {
  id:          "risikoleben",
  icon:        "❤️",
  titel:       "Risikoleben-Absicherungs-Rechner",
  heroTitle:   "Ist Ihre Familie wirklich abgesichert?",
  heroLead:    "Berechnen Sie wie viel Ihre Familie im Ernstfall wirklich braucht — und ob Ihre bestehende Absicherung ausreicht.",
  felder: [
    { id:"monatsbedarf", label:"Monatlicher Finanzbedarf der Familie", typ:"slider", min:500, max:6000, step:100, einheit:"€/Monat", default:2500,
      hinweis:"Miete/Kredit + Lebenshaltung + Kinderkosten" },
    { id:"absicher_jahre", label:"Absicherungszeitraum",              typ:"slider", min:5,   max:30,   step:1,   einheit:"Jahre",    default:20 },
    { id:"kredite",       label:"Bestehende Schulden / Kredite",      typ:"slider", min:0,   max:500000,step:5000,einheit:"€ gesamt", default:0 },
    { id:"vorhandene_vs", label:"Vorhandene Versicherungssumme",      typ:"slider", min:0,   max:800000,step:10000,einheit:"€",       default:0,
      hinweis:"Aktuelle Risikolebensversicherung" },
  ],
  berechne: (w) => {
    const finanzbedarf    = w.monatsbedarf * 12 * w.absicher_jahre;
    const gesamtbedarf    = finanzbedarf + w.kredite;
    const luecke          = Math.max(0, gesamtbedarf - w.vorhandene_vs);
    const deckungsgrad    = w.vorhandene_vs > 0 ? Math.min(100, Math.round((w.vorhandene_vs / gesamtbedarf) * 100)) : 0;

    return {
      hauptwert:  luecke,
      hauptLabel: "Fehlende Absicherungssumme",
      felder: [
        { label:"Finanzbedarf der Familie",         wert: fmtK(finanzbedarf),   sub:`${w.monatsbedarf} €/Monat × ${w.absicher_jahre} Jahre` },
        { label:"Bestehende Kredite",               wert: fmtK(w.kredite),      sub:"Müssen im Todesfall abgelöst werden" },
        { label:"Gesamtbedarf",                     wert: fmtK(gesamtbedarf),   sub:"Finanzbedarf + Schulden", highlight: true },
        { label:"Vorhandene Versicherungssumme",    wert: fmtK(w.vorhandene_vs),sub:"Bestehende Risikolebensversicherung" },
        { label:"Fehlende Absicherung",             wert: fmtK(luecke),         sub:"Diese Summe fehlt aktuell", highlight: luecke > 50000 },
        { label:"Deckungsgrad",                     wert: deckungsgrad + "%",   sub:"Wie viel ist bereits abgesichert", highlight: deckungsgrad < 60 },
      ],
      ampel:  luecke === 0 ? "gruen" : luecke < 100000 ? "gelb" : "rot",
      fazit:  luecke === 0
        ? "Ihre Familie ist vollständig abgesichert. Versicherungssumme bei Änderungen (Kind, Kredit) anpassen."
        : `Ihre Familie ist um ${fmtK(luecke)} unterversichert. ${w.vorhandene_vs === 0 ? "Sie haben noch keine Risikolebensversicherung abgeschlossen." : "Die bestehende Versicherungssumme sollte erhöht werden."}`,
      empfehlung: luecke > 0 ? `Versicherungssumme von ${fmtK(luecke)} absichern` : null,
    };
  },
};

// ─── AKTIVER RECHNER ──────────────────────────────────────────────────────────
// ↓ Hier tauschen um einen anderen Rechner zu laden ↓
const AKTIVER_RECHNER = RECHNER_BU;

export {
  RECHNER_BU,
  RECHNER_PFLEGE,
  RECHNER_RENTE,
  RECHNER_KTG,
  RECHNER_RISIKOLEBEN,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HAUPT-KOMPONENTE ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function Lueckenrechner() {
  const rechner = AKTIVER_RECHNER;

  // Initialwerte aus Felddefinitionen
  const initWerte = Object.fromEntries(rechner.felder.map(f => [f.id, f.default]));
  const [werte, setWerte]   = useState(initWerte);
  const [phase, setPhase]   = useState(1);  // 1=rechner | 2=ergebnis | 3=kontakt | 4=danke
  const [animKey, setAnimKey] = useState(0);
  const [formData, setFormData] = useState({ name:"", email:"", telefon:"" });

  const setWert = (id, val) => setWerte(w => ({...w, [id]: val}));
  const goTo = (p) => { setAnimKey(k=>k+1); setPhase(p); window.scrollTo({top:0}); };

  const ergebnis = rechner.berechne(werte);
  const ampelFarben = { rot:"#dc2626", gelb:"#d97706", gruen:"#059669" };
  const ampelBg     = { rot:"#fff9f9", gelb:"#fffbeb", gruen:"#f0fdf4" };
  const ampelBorder = { rot:"#fecaca", gelb:"#fde68a", gruen:"#bbf7d0" };

  const progPct = { 1:30, 2:75, 3:92, 4:100 }[phase] || 0;

  // ── Design Tokens ──
  const T = {
    root:      { minHeight:"100vh", background:"#f0f2f5", fontFamily:"'Outfit',system-ui,sans-serif" },
    header:    { position:"sticky", top:0, zIndex:100, background:"rgba(240,242,245,0.92)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(0,0,0,0.06)" },
    logoWrap:  { display:"flex", alignItems:"center", gap:"8px" },
    logoBox:   { width:"28px", height:"28px", borderRadius:"8px", background:C, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"800" },
    logoTxt:   { fontSize:"13px", fontWeight:"700", color:C },
    badge:     { fontSize:"11px", fontWeight:"600", padding:"3px 10px", borderRadius:"20px", background:alpha(C,0.1), color:C },
    progBar:   { height:"3px", background:"#e5e7eb" },
    progFill:  { height:"100%", width:`${progPct}%`, background:C, transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)" },
    hero:      { padding:"24px 20px 12px" },
    eyebrow:   { fontSize:"11px", fontWeight:"700", letterSpacing:"1.2px", textTransform:"uppercase", color:alpha(C,0.5), marginBottom:"8px" },
    h1:        { fontSize:"25px", fontWeight:"800", color:"#0f1923", lineHeight:1.22, letterSpacing:"-0.5px" },
    lead:      { fontSize:"15px", color:"#6b7280", lineHeight:1.62, marginTop:"8px" },
    body:      { paddingBottom:"110px" },
    card:      { margin:"0 16px 10px", background:"#fff", borderRadius:"18px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.05)", overflow:"hidden" },
    cardPad:   { padding:"20px" },
    secLabel:  { fontSize:"11px", fontWeight:"700", letterSpacing:"1px", textTransform:"uppercase", color:"#9ca3af", padding:"16px 20px 8px" },
    // Felder
    feldLabel: { display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"8px" },
    feldWert:  { fontSize:"22px", fontWeight:"800", color:C, letterSpacing:"-0.5px", marginBottom:"6px" },
    feldHinweis:{ fontSize:"11px", color:"#9ca3af", marginTop:"4px" },
    slider:    { width:"100%", marginTop:"4px" },
    selectEl:  { width:"100%", padding:"12px 14px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", color:"#111827", background:"#fafafa", marginTop:"4px" },
    feldWrap:  { marginBottom:"22px" },
    // Ergebnis
    hauptBox:  (ampel) => ({ padding:"20px", background:ampelBg[ampel], borderRadius:"16px", border:`1.5px solid ${ampelBorder[ampel]}`, textAlign:"center", marginBottom:"4px" }),
    hauptNum:  (ampel) => ({ fontSize:"40px", fontWeight:"800", color:ampelFarben[ampel], letterSpacing:"-1px", lineHeight:1 }),
    hauptLbl:  { fontSize:"13px", color:"#6b7280", marginTop:"6px", fontWeight:"500" },
    detailRow: () => ({ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"11px 0", borderBottom:"1px solid #f3f4f6" }),
    detailLbl: { fontSize:"13px", color:"#6b7280", flex:1, lineHeight:1.4 },
    detailSub: { fontSize:"11px", color:"#9ca3af", marginTop:"2px" },
    detailWert:(highlight) => ({ fontSize:"14px", fontWeight:"700", color:highlight?"#dc2626":C, textAlign:"right", flexShrink:0, marginLeft:"12px" }),
    fazitBox:  { padding:"14px 16px", background:alpha(C,0.06), borderRadius:"14px", border:`1.5px solid ${alpha(C,0.14)}`, marginTop:"4px" },
    empfBox:   { padding:"14px 16px", background:"#fff", borderRadius:"14px", border:"1.5px solid #e5e7eb", marginTop:"10px", display:"flex", alignItems:"center", gap:"12px" },
    // Footer
    footer:    { position:"sticky", bottom:0, background:"rgba(240,242,245,0.94)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", padding:"12px 20px 28px", borderTop:"1px solid rgba(0,0,0,0.05)" },
    btnMain:   (dis) => ({ width:"100%", padding:"15px", background:dis?"#d1d5db":C, color:"#fff", borderRadius:"14px", fontSize:"15px", fontWeight:"600", cursor:dis?"default":"pointer", transition:"background 0.2s" }),
    btnBack:   { width:"100%", padding:"10px", color:"#9ca3af", fontSize:"14px", marginTop:"4px" },
    // Kontakt
    inputWrap: { marginBottom:"14px" },
    iLabel:    { display:"block", fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px", textTransform:"uppercase", color:"#9ca3af", marginBottom:"6px" },
    input:     { width:"100%", padding:"13px 14px", border:"1.5px solid #e5e7eb", borderRadius:"10px", fontSize:"15px", color:"#111827", background:"#fafafa" },
  };

  // ── Shell ──
  const Shell = ({ eyebrow, title, lead, children, footer }) => (
    <div style={{ ...T.root, "--c": C }}>
      <div style={T.header}>
        <div style={T.logoWrap}>
          <div style={T.logoBox}>{rechner.icon}</div>
          <span style={T.logoTxt}>{MAKLER.firma}</span>
        </div>
        <span style={T.badge}>{rechner.id.toUpperCase()}-Rechner</span>
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

  // ═══ PHASE 1 — Eingabe ═══════════════════════════════════════════════════
  if (phase === 1) return (
    <Shell
      eyebrow={`${rechner.titel} · Ihre Daten`}
      title={rechner.heroTitle}
      lead={rechner.heroLead}
      footer={
        <button style={T.btnMain(false)} onClick={() => goTo(2)}>
          Lücke berechnen →
        </button>
      }
    >
      <div style={{ padding:"0 16px" }}>
        <div style={T.card}>
          <div style={T.cardPad}>
            {rechner.felder.map(feld => (
              <div key={feld.id} style={T.feldWrap}>
                <label style={T.feldLabel}>{feld.label}</label>

                {feld.typ === "slider" && (
                  <>
                    <div style={T.feldWert}>
                      {feld.einheit === "€/Monat" || feld.einheit === "€/Tag" || feld.einheit === "€ gesamt" || feld.einheit === "€"
                        ? (werte[feld.id] === 0 ? "Keine" : fmt(werte[feld.id]))
                        : `${werte[feld.id]} ${feld.einheit}`}
                    </div>
                    <input
                      type="range"
                      min={feld.min} max={feld.max} step={feld.step}
                      value={werte[feld.id]}
                      onChange={e => setWert(feld.id, parseFloat(e.target.value))}
                      style={{ ...T.slider, "--c": C }}
                    />
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", color:"#d1d5db", marginTop:"2px" }}>
                      <span>{feld.min}{feld.einheit?.includes("€") ? " €" : feld.einheit?.includes("Jahr") ? " J." : ""}</span>
                      <span>{feld.max}{feld.einheit?.includes("€") ? " €" : feld.einheit?.includes("Jahr") ? " J." : "+"}</span>
                    </div>
                  </>
                )}

                {feld.typ === "select" && (
                  <select
                    value={werte[feld.id]}
                    onChange={e => setWert(feld.id, e.target.value)}
                    style={T.selectEl}
                  >
                    {feld.optionen.map(o => (
                      <option key={o.v} value={o.v}>{o.l}</option>
                    ))}
                  </select>
                )}

                {feld.hinweis && <div style={T.feldHinweis}>ℹ️ {feld.hinweis}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );

  // ═══ PHASE 2 — Ergebnis ══════════════════════════════════════════════════
  if (phase === 2) return (
    <Shell
      eyebrow="Ihre persönliche Lückenanalyse"
      title={ergebnis.ampel === "gruen" ? "Sehr gut abgesichert ✓" : ergebnis.ampel === "gelb" ? "Kleine Lücke entdeckt" : "Handlungsbedarf"}
      lead={null}
      footer={
        <>
          <button style={T.btnMain(false)} onClick={() => goTo(3)}>
            {ergebnis.hauptwert > 0 ? "Lücke schließen — Gespräch anfragen" : "Bestätigung anfragen"}
          </button>
          <button style={T.btnBack} onClick={() => goTo(1)}>← Werte anpassen</button>
        </>
      }
    >
      {/* Hauptwert */}
      <div style={{ padding:"0 16px 10px" }}>
        <div style={T.hauptBox(ergebnis.ampel)} className="anim-count" key={`result-${animKey}`}>
          <div style={T.hauptNum(ergebnis.ampel)}>
            {ergebnis.hauptwert === 0 ? "0 €" : fmt(ergebnis.hauptwert)}
          </div>
          <div style={T.hauptLbl}>{ergebnis.hauptLabel}</div>
          <div style={{ marginTop:"10px", display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"12px", fontWeight:"700", padding:"4px 12px", borderRadius:"20px", background:"rgba(255,255,255,0.6)", color:ampelFarben[ergebnis.ampel] }}>
            {ergebnis.ampel === "gruen" ? "✓ Gut abgesichert" : ergebnis.ampel === "gelb" ? "⚠ Kleine Lücke" : "⚠ Dringender Handlungsbedarf"}
          </div>
        </div>
      </div>

      {/* Detail-Tabelle */}
      <div style={T.secLabel}>Ihre Berechnung im Detail</div>
      <div style={{ padding:"0 16px" }}>
        <div style={T.card}>
          <div style={{ padding:"4px 20px" }}>
            {ergebnis.felder.map((f, i) => (
              <div key={i} style={{ ...T.detailRow(), borderBottom: i === ergebnis.felder.length-1 ? "none" : "1px solid #f3f4f6" }}>
                <div>
                  <div style={T.detailLbl}>{f.label}</div>
                  {f.sub && <div style={T.detailSub}>{f.sub}</div>}
                </div>
                <div style={T.detailWert(f.highlight)}>{f.wert}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fazit */}
      <div style={{ padding:"0 16px" }}>
        <div style={T.fazitBox}>
          <div style={{ fontSize:"12px", fontWeight:"700", color:C, marginBottom:"4px" }}>Unser Fazit</div>
          <div style={{ fontSize:"13px", color:"#4b5563", lineHeight:1.6 }}>{ergebnis.fazit}</div>
        </div>

        {ergebnis.empfehlung && (
          <div style={T.empfBox}>
            <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:alpha(C,0.1), color:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>→</div>
            <div>
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#374151" }}>Empfehlung</div>
              <div style={{ fontSize:"13px", color:"#6b7280", marginTop:"2px" }}>{ergebnis.empfehlung}</div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );

  // ═══ PHASE 3 — Kontakt ═══════════════════════════════════════════════════
  if (phase === 3) {
    const valid = formData.name.trim() && formData.email.trim();
    return (
      <Shell
        eyebrow="Gespräch vereinbaren"
        title="Lücke gemeinsam schließen"
        lead="Wir bereiten das Gespräch mit Ihrer Berechnung vor und melden uns innerhalb von 24 Stunden."
        footer={
          <>
            <button style={T.btnMain(!valid)} disabled={!valid} onClick={() => goTo(4)}>
              Gespräch anfragen
            </button>
            <button style={T.btnBack} onClick={() => goTo(2)}>← Zurück</button>
          </>
        }
      >
        <div style={{ padding:"0 16px" }}>
          {/* Ergebnis-Zusammenfassung */}
          <div style={{ background:alpha(C,0.06), border:`1.5px solid ${alpha(C,0.14)}`, borderRadius:"14px", padding:"14px 16px", marginBottom:"12px", display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ fontSize:"28px", fontWeight:"800", color:C, letterSpacing:"-0.5px", flexShrink:0 }}>
              {ergebnis.hauptwert === 0 ? "✓" : fmt(ergebnis.hauptwert)}
            </div>
            <div>
              <div style={{ fontSize:"12px", fontWeight:"700", color:C }}>{rechner.titel}</div>
              <div style={{ fontSize:"13px", color:"#6b7280", marginTop:"1px" }}>{ergebnis.hauptLabel}</div>
            </div>
          </div>

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
              <p style={{ fontSize:"11px", color:"#d1d5db", marginTop:"4px" }}>Vertraulich. Wir senden Ihnen die Berechnung vorab zu.</p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ═══ PHASE 4 — Danke ══════════════════════════════════════════════════════
  if (phase === 4) return (
    <Shell>
      <div style={{ padding:"48px 20px 0", textAlign:"center" }} className="anim-fadeup">
        <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:alpha(C,0.1), color:C, fontSize:"28px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>✓</div>
        <h1 style={{ fontSize:"26px", fontWeight:"800", color:"#0f1923", letterSpacing:"-0.5px", marginBottom:"8px" }}>
          Danke, {formData.name.split(" ")[0] || ""}!
        </h1>
        <p style={{ fontSize:"15px", color:"#6b7280", lineHeight:1.65 }}>
          Wir haben Ihre Berechnung erhalten<br />und melden uns innerhalb von 24 Stunden.
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
