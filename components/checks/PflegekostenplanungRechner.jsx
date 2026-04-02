import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CheckConfigLoadingShell } from "@/components/checks/CheckConfigLoadingShell";
import { StandaloneWrapper } from "@/components/checks/StandaloneWrapper";
import { SelectionCard, SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";
(() => {
  const s = document.createElement("style");
  s.textContent = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#ffffff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #ffffff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}.pflege-acc-item{border-radius:12px;background:#F9FAFB;border:1px solid rgba(17,24,39,0.06);margin-bottom:8px;overflow:hidden;}.pflege-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;text-align:left;font-size:13px;font-weight:600;color:#1F2937;background:transparent;cursor:pointer;border:none;font-family:inherit;}.pflege-acc-panel{padding:0 16px 14px;font-size:12px;color:#6B7280;line-height:1.65;border-top:1px solid rgba(17,24,39,0.06);}.pflege-problem-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:720px;margin:0 auto;}@media (max-width:640px){.pflege-problem-grid{grid-template-columns:1fr;}}`;
  document.head.appendChild(s);
})();

const WARN = "#c0392b";
const OK = "#059669";
const BAR_VORSORGE = "#0891b2";
const BAR_LUECKE = "#FEE2E2";
const AMBER_STAT = "#D97706";

/**
 * Typischer monatlicher Eigenanteil stationäre Pflege (Orientierung, ca. Werte je Bundesland).
 * Quelle: Nutzer-Vorgabe Checkkit 2026 — „DURCHSCHNITT (Bund)“ als Fallback.
 */
export const pflegeKostenMapping = {
  "Baden-Württemberg": 2980,
  Bayern: 2760,
  Berlin: 2690,
  Brandenburg: 2450,
  Bremen: 2840,
  Hamburg: 2720,
  Hessen: 2750,
  "Mecklenburg-Vorpommern": 2290,
  Niedersachsen: 2480,
  "Nordrhein-Westfalen": 3020,
  "Rheinland-Pfalz": 2710,
  Saarland: 2890,
  Sachsen: 2180,
  "Sachsen-Anhalt": 2140,
  "Schleswig-Holstein": 2650,
  Thüringen: 2110,
};

const PFLEGE_EIGENANTEIL_BUND_DURCHSCHNITT = 2610;

/** Referenz-Kassenleistung (Modell) — konsistent zu basisKosten in PFLEGE_ORT_MODELL */
const KASSE_STATIONAER = 1775;
const KASSE_AMBULANT = 1100;

/** Referenz-Netto-Eigenanteil altes Modell — nur für Ambulant-Skalierung */
const REF_STATIONAER_NET = 3800 - KASSE_STATIONAER;
const REF_AMBULANT_NET = 2200 - KASSE_AMBULANT;

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

function getEigenanteilStationaerMonat(region) {
  if (!region || region === "__bund__") return PFLEGE_EIGENANTEIL_BUND_DURCHSCHNITT;
  return pflegeKostenMapping[region] ?? PFLEGE_EIGENANTEIL_BUND_DURCHSCHNITT;
}

function eigenanteilEffektivMonat(pflegeOrt, region) {
  const station = getEigenanteilStationaerMonat(region);
  if (pflegeOrt === "stationär") return station;
  return Math.round(station * (REF_AMBULANT_NET / REF_STATIONAER_NET));
}

const BUNDESLAENDER = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

/**
 * Pflegeort → Szenario-Labels & Ambulant-Skalierung (stationär vs. ambulant).
 * Ergebnis-Rest: regionaler Eigenanteil minus nur private Pflege-Vorsorge.
 */
const PFLEGE_ORT_MODELL = {
  stationär: {
    id: "stationär",
    heroName: "Heim",
    kurzLabel: "Stationär",
    basisKosten: 3800,
    basisKasse: KASSE_STATIONAER,
    scenarioRisiko: "Vollstationäre Versorgung — mit relevanten Eigenanteilen nach SGB XI.",
    scenarioDauer: "Dauer und Höhe hängen von Bundesland, Einrichtung und individuellem Budget ab.",
  },
  ambulant: {
    id: "ambulant",
    heroName: "Ambulant",
    kurzLabel: "Ambulant",
    basisKosten: 2200,
    basisKasse: KASSE_AMBULANT,
    scenarioRisiko: "Schwerpunkt ambulant — Zuzahlungen für Sachleistungen und Eigenanteile können anfallen.",
    scenarioDauer: "Oft längere Phase zu Hause; später kann ein Wechsel der Versorgungsform nötig werden.",
  },
};

/**
 * Schritt 2: Nutzer wählt, welches häufige Pflege-Szenario sie/ihn am meisten beschäftigt —
 * Zuordnung zu stationär/ambulant für die Kostenschätzung (wie bisher PFLEGE_ORT_MODELL).
 */
const PFLEGE_SORGE_OPTIONEN = [
  {
    id: "heim_eigenanteil",
    pflegeOrt: "stationär",
    label: "Pflegeheim & hohe Eigenanteile",
    desc: "Die Sorge vor Heimkosten und dem monatlichen Eigenanteil — wenn stationäre Versorgung im Raum steht.",
    emoji: "🏥",
  },
  {
    id: "demenz_langzeit",
    pflegeOrt: "stationär",
    label: "Demenz oder sehr lang andauernder Pflegebedarf",
    desc: "Typisch bei Demenz und ähnlichen Verläufen: wachsender Hilfebedarf über viele Jahre — oft mit Blick auf spätere Heimversorgung.",
    emoji: "🧠",
  },
  {
    id: "ambulant_zuhause",
    pflegeOrt: "ambulant",
    label: "Zu Hause: Pflegedienst, Zuzahlungen, Entlastung",
    desc: "Ambulante Hilfen, Tagespflege, Hilfsmittel — Mehrkosten im gewohnten Umfeld (häufig z. B. nach Schlaganfall in der Reha-Phase).",
    emoji: "🏠",
  },
  {
    id: "angehoerige_belastung",
    pflegeOrt: "ambulant",
    label: "Angehörige stark belastet / Entlastung nötig",
    desc: "Familie pflegt mit — dazu Sachleistungen, Zuzahlungen und organisatorischer Mehraufwand; finanziell oft ambulant modelliert.",
    emoji: "🤝",
  },
];

function makePflegeT(C) {
  return {
    page: { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
    header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(31,41,55,0.06)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoMk: { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
    logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
    badge: { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
    hero: { padding: "32px 24px 16px" },
    eyebrow: { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" },
    h1: { fontSize: "22px", color: "#111", lineHeight: 1.25, ...CHECKKIT_HERO_TITLE_TYPO },
    body: { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
    section: { padding: "0 24px", marginBottom: "20px" },
    divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
    card: { border: "1px solid #e8e8e8", borderRadius: "18px", overflow: "hidden" },
    kpiKontaktLuecke: {
      borderRadius: "16px",
      background: "#FFF7F7",
      border: "1px solid #F2CFCF",
      padding: "12px 14px",
      minWidth: 0,
      flex: "1 1 140px",
    },
    kpiKontaktEu: {
      borderRadius: "14px",
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(17,24,39,0.06)",
      padding: "12px 14px",
      minWidth: 0,
      flex: "1 1 140px",
    },
    row: { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
    rowLast: { padding: "14px 16px" },
    fldLbl: { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px", display: "block" },
    fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
    footer: { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(31,41,55,0.06)", boxShadow: "0 -6px 20px rgba(17,24,39,0.05)", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
    btnPrim: (d) => ({
      width: "100%",
      padding: "13px 20px",
      background: d ? "#e8e8e8" : C,
      color: d ? "#aaa" : "#fff",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: d ? "default" : "pointer",
      transition: "opacity 0.15s",
      letterSpacing: "-0.1px",
      boxShadow: d ? "none" : "0 8px 20px rgba(26,58,92,0.18)",
    }),
    btnSec: { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
    infoBox: {
      padding: "12px 14px",
      background: "#F6F8FE",
      border: "1px solid #DCE6FF",
      borderRadius: "14px",
      fontSize: "12px",
      color: "#315AA8",
      lineHeight: 1.6,
    },
    inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
    resultHero: { padding: "52px 24px 40px", textAlign: "center", background: "#ffffff" },
    resultEyebrow: { fontSize: "12px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.2px", marginBottom: "14px" },
    resultNumber: { fontSize: "52px", fontWeight: "800", color: WARN, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "8px" },
    resultUnit: { fontSize: "14px", color: "#9CA3AF", marginBottom: "18px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 },
    resultSub: { fontSize: "13px", color: "#9CA3AF", lineHeight: 1.55, marginTop: "12px" },
    cardPrimary: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "20px", overflow: "hidden", background: "#FFFFFF", boxShadow: "0 6px 24px rgba(17,24,39,0.08)" },
    /** Wie SmartHintCard (BUKTG / Renten-Check): amber Hinweis-Karte */
    einordnungHintCard: {
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
      padding: "14px 16px",
      borderRadius: "14px",
      background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      border: "1px solid #FCD34D",
    },
    einordnungHintEmoji: { flexShrink: 0, fontSize: "20px", lineHeight: 1.2 },
    einordnungHintText: { fontSize: "13px", fontWeight: "500", color: "#92400E", lineHeight: 1.55 },
    cardContext: { background: "#FAFAF8", border: "1px solid rgba(17,24,39,0.05)", borderRadius: "16px", padding: "18px 20px" },
    warnCard: { background: "#FFF6F5", border: "1px solid #F2D4D0", borderLeft: "3px solid #C0392B", borderRadius: "14px", padding: "18px 20px" },
    sectionLbl: { fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" },
    statusOk: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#15803D" },
    statusWarn: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFF6F5", border: "1px solid #F2D4D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#C0392B" },
    statusMitte: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#B45309" },
    statusInfo: (C2) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", background: `${C2}14`, border: `1px solid ${C2}33`, borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: C2 }),
    stackedBarOuter: { width: "100%", maxWidth: "100%", height: "16px", borderRadius: "999px", overflow: "hidden", display: "flex", background: "rgba(31,41,55,0.08)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" },
    stackedBarSeg: (pct, color, border) => ({
      height: "100%",
      width: `${pct}%`,
      flexShrink: 0,
      background: color,
      minWidth: pct > 0.5 ? "2px" : 0,
      transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      boxShadow: border ? `inset 0 0 0 1px ${border}` : undefined,
    }),
    compareGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px", alignItems: "stretch" },
  };
}

/** Story nach Bundesland: CHECKKIT2026-Maße via CheckKitStoryHero; Text mit regionalem Betrag */
function pflegeStoryKostenFokusCopy(pflegeOrt, region) {
  const reg =
    region === "__bund__"
      ? "bundesweitem Durchschnitt"
      : region && String(region).trim()
        ? String(region).trim()
        : "Ihrer Region";
  const station = getEigenanteilStationaerMonat(region);
  const eff = eigenanteilEffektivMonat(pflegeOrt, region);
  if (pflegeOrt === "stationär") {
    return {
      title: "Schutz für Ihr Lebenswerk.",
      text: `In ${reg} liegt der typische monatliche Eigenanteil im Pflegeheim bei etwa ${fmt(station)}. Als Nächstes erfassen wir Alter und bestehende private Pflege-Vorsorge — daraus leiten wir Ihre Restlücke zum regionalen Eigenanteil ab.`,
    };
  }
  return {
    title: "Unabhängigkeit zu Hause.",
    text: `Für ambulante Versorgung rechnen wir mit einer geschätzten monatlichen Zuzahlungslast von etwa ${fmt(eff)} (aus dem Heim-Eigenanteil in ${reg}, ca. ${fmt(station)}, skaliert). So sehen Sie, wie sehr Eigenheim und Erspartes belastet werden können.`,
  };
}

function Danke({ name, onBack, makler, C, luecke, tagegeld }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }} className="fade-in">
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `1.5px solid ${C}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ fontSize: "20px", fontWeight: "700", color: "#111", marginBottom: "8px" }}>{name ? `Vielen Dank, ${name.split(" ")[0]}.` : "Vielen Dank für Ihre Anfrage."}</div>
      <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, marginBottom: "32px" }}>
        Wir prüfen Ihr Ergebnis und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.
      </div>
      {luecke > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "24px",
        }}>
          <div style={{
            background: "#FFF7F7",
            border: "1px solid #F2CFCF",
            borderRadius: "12px",
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Restbedarf / Mon.</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#C0392B", letterSpacing: "-0.3px" }}>
              {Math.round(Math.abs(luecke)).toLocaleString("de-DE")} €
            </div>
          </div>
          <div style={{
            background: "rgba(31,41,55,0.03)",
            border: "1px solid rgba(31,41,55,0.08)",
            borderRadius: "12px",
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Pflegetagegeld</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>
              {tagegeld} €/Tag
            </div>
          </div>
        </div>
      )}
      <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden", textAlign: "left" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{makler.name}</div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <a href={`tel:${makler.telefon}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>{makler.telefon}</a>
          <a href={`mailto:${makler.email}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>{makler.email}</a>
        </div>
      </div>
      <button type="button" onClick={onBack} style={{ marginTop: "20px", fontSize: "13px", color: "#aaa", cursor: "pointer", background: "none", border: "none" }}>
        Neue Berechnung starten
      </button>
    </div>
  );
}

function KontaktForm({ fd, setFd, onSubmit, onBack, isDemo, makler, T }) {
  const [consent, setConsent] = useState(false);
  const valid = fd.name.trim() && fd.email.trim() && consent;
  if (isDemo) {
    return (
      <>
        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.</div>
          <button type="button" style={{ ...T.btnPrim(false) }} onClick={() => window.parent.postMessage({ type: "openConfig", slug: "pflege-check" }, "*")}>Anpassen & kaufen</button>
        </div>
        <div style={T.footer} data-checkkit-footer>
          <button type="button" style={T.btnSec} onClick={onBack}>Zurück</button>
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{ ...T.section, marginBottom: "0" }}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[
            { k: "name", l: "Ihr Name", t: "text", ph: "Vor- und Nachname", req: true },
            { k: "email", l: "Ihre E-Mail", t: "email", ph: "ihre@email.de", req: true },
            { k: "tel", l: "Ihre Nummer", t: "tel", ph: "Optional", req: false, hint: "Optional — für eine schnellere Rückmeldung" },
          ].map(({ k, l, t, ph, req, hint }, i, arr) => (
            <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
              <label style={T.fldLbl}>
                {l}
                {req ? " *" : ""}
              </label>
              <input type={t} placeholder={ph} value={fd[k]} onChange={(e) => setFd((f) => ({ ...f, [k]: e.target.value }))} style={T.inputEl} />
              {hint && <div style={T.fldHint}>{hint}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "14px", marginBottom: "100px" }}>
          <CheckKontaktBeforeSubmitBlock maklerName={makler.name} consent={consent} onConsentChange={setConsent} />
        </div>
      </div>
      <div style={T.footer} data-checkkit-footer>
        <button type="button" style={T.btnPrim(!valid)} onClick={() => { if (valid) onSubmit(); }} disabled={!valid}>
          {valid ? "Vorsorge prüfen lassen" : "Bitte alle Angaben machen"}
        </button>
        <button type="button" style={T.btnSec} onClick={onBack}>Zurück</button>
      </div>
    </>
  );
}

/**
 * Monatliche Restlücke: regionaler Eigenanteil minus privater Pflege-Vorsorge.
 * Keine weiteren Abzüge (z. B. gesetzliche Leistungen). 100 %-Balken = regionaler Eigenanteil.
 */
function berechne({ pflegeOrt, region, vorsorgeMonat }) {
  const eigenEff = eigenanteilEffektivMonat(pflegeOrt, region);
  const vRaw = Math.max(0, Number(vorsorgeMonat) || 0);
  const vorsorgeEff = Math.min(vRaw, eigenEff);
  const luecke = Math.max(0, eigenEff - vorsorgeEff);
  const pctVorsorge = eigenEff > 0 ? (vorsorgeEff / eigenEff) * 100 : 0;
  const pctLuecke = eigenEff > 0 ? (luecke / eigenEff) * 100 : 0;

  /** Pflegetagegeld €/Tag: monatliche Restlücke ÷ 30, auf volle 5 € aufrunden, höchstens 200 €. */
  const empfTagegeld = Math.min(200, Math.ceil(luecke / 30 / 5) * 5);

  return {
    eigenEff,
    vorsorgeEff,
    luecke,
    pctVorsorge,
    pctLuecke,
    mtlLuecke: luecke,
    empfTagegeld,
    /** Anzeige: voller regionaler Eigenanteil (Orientierung) */
    kosten: eigenEff,
  };
}

const WIZARD_STEPS = 5;
/** scr 1–3: Situation; scr 4–5: Finanzen (Story + Ausgangslage) */
const PFLEGE_HEADER_STEPS = ["Situation", "Finanzen", "Ergebnis", "Kontakt"];

function pflegeHeaderStep(phase, scr) {
  if (phase === 2) return 2;
  if (phase === 3) return 3;
  if (phase === "bridge") return 2;
  if (phase === 1) return (scr ?? 1) <= 3 ? 0 : 1;
  return 3;
}

export default function PflegekostenplanungRechner() {
  const MAKLER = useCheckConfig();
  const { isReady } = MAKLER;
  const C = MAKLER.primaryColor;
  const T = useMemo(() => makePflegeT(C), [C]);
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [fd, setFd] = useState({ name: "", email: "", tel: "" });
  const [p, setP] = useState({
    pflegeOrt: "",
    /** Gewähltes Sorgen-Szenario (Schritt 2), eindeutig trotz gleicher pflegeOrt-Zuordnung */
    pflegeSorge: "",
    region: "",
    alter: 50,
    vorsorgeMonat: 0,
  });
  const [loading, setLoading] = useState(false);
  const [scr, setScr] = useState(1);
  const [pflegeArchiv, setPflegeArchiv] = useState(null);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const slug = "pflege-check";
  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setLoading(false);
    }
    if (ph === 2) {
      const t = new URLSearchParams(window.location.search).get("token") ?? undefined;
      if (t) void trackEvent({ event_type: "check_completed", slug, token: t, firma: MAKLER.firma });
    }
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  const R = berechne({
    pflegeOrt: p.pflegeOrt,
    region: p.region,
    vorsorgeMonat: p.vorsorgeMonat,
  });
  const meta = PFLEGE_ORT_MODELL[p.pflegeOrt] || PFLEGE_ORT_MODELL.ambulant;

  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? undefined;
    if (!token) return;
    void trackEvent({ event_type: "check_started", slug, token, firma: MAKLER.firma });
  }, []);

  if (!isReady) return <CheckConfigLoadingShell />;

  function Header({ currentStep, showProgressBar = true }) {
    return (
      <>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(31,41,55,0.06)",
            padding: "16px 20px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: C,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,58,92,0.2)",
            }}
          >
            <MaklerFirmaAvatarInitials firma={MAKLER.firma} />
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1F2937",
              letterSpacing: "-0.1px",
              textAlign: "center",
            }}
          >
            {MAKLER.firma}
          </span>
        </div>
        {showProgressBar ? (
          <CheckProgressBar steps={PFLEGE_HEADER_STEPS} currentStep={currentStep} accent={C} />
        ) : null}
      </>
    );
  }

  const withStandalone = (el) => (
    <StandaloneWrapper makler={MAKLER} checkLabel="Pflege-Check">{el}</StandaloneWrapper>
  );

  if (danke) {
    return withStandalone(
      <div style={{ ...T.page, "--accent": C }}>
        <Header showProgressBar={false} />
        <Danke
          name={fd.name}
          onBack={() => { setDanke(false); goTo(1); }}
          makler={MAKLER}
          C={C}
          luecke={R.luecke}
          tagegeld={R.empfTagegeld}
        />
      </div>
    );
  }

  if (loading) {
    return withStandalone(
      <div style={{ ...T.page, "--accent": C }}>
        <Header showProgressBar={false} />
        <CheckLoader type="pflege" checkmarkColor={C} onComplete={() => { setLoading(false); goTo("bridge"); }} />
      </div>
    );
  }

  if (phase === "bridge") {
    return withStandalone(
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header showProgressBar={false} />
        <CheckKitStoryHero
          hideFooterSpacer
          emoji="💸"
          title="Ihre Pflegekosten-Analyse ist bereit."
          text="Wir haben Ihren regionalen Eigenanteil und Ihre Vorsorgesituation vollständig berechnet."
        />
        <div style={{ padding: "8px 24px 0", ...CHECKKIT2026.storyContentWrap }}>
          {[
            `Eigenanteil in ${p.region && p.region !== "__bund__" ? p.region : "Ihrer Region"}: ca. ${fmt(R.eigenEff)}/Mon. ermittelt.`,
            R.vorsorgeEff > 0
              ? `Bestehende Vorsorge: ${fmt(R.vorsorgeEff)}/Mon. angerechnet.`
              : "Monatliche Restlücke ohne bestehende Vorsorge berechnet.",
            `Pflegetagegeld-Empfehlung: ${R.empfTagegeld} €/Tag erstellt.`,
          ].map((line) => (
            <div
              key={line}
              style={{
                ...CHECKKIT2026.storyBody,
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: 14,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }} aria-hidden>✅</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
        <div style={{ height: CHECKKIT2026.footerSpacerPx }} aria-hidden />
        <div style={T.footer} data-checkkit-footer>
          <button type="button" style={T.btnPrim(false)} onClick={() => goTo(2)}>
            Ergebnis ansehen
          </button>
          <button type="button" style={T.btnSec} onClick={() => goTo(1)}>
            Neu berechnen
          </button>
        </div>
      </div>
    );
  }

  if (phase === 2) {
    const { kosten, vorsorgeEff, pctVorsorge, pctLuecke, mtlLuecke } = R;
    const pillPflege =
      mtlLuecke <= 0 ? (
        <div style={T.statusOk}>Restkosten im Modell gedeckt</div>
      ) : mtlLuecke > 1500 ? (
        <div style={T.statusWarn}>Sehr hohe monatliche Lücke — Handeln Sie zeitnah</div>
      ) : mtlLuecke >= 500 ? (
        <div style={T.statusMitte}>Mittlere Lücke — Vorsorge lohnt sich</div>
      ) : (
        <div style={T.statusOk}>Geringe Lücke — gezielt nachsteuern</div>
      );
    const heroZahlFarbe =
      mtlLuecke <= 0 || mtlLuecke < 500 ? OK : mtlLuecke <= 1500 ? AMBER_STAT : WARN;

    return withStandalone(
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header currentStep={pflegeHeaderStep(2, scr)} />

        <div style={{ paddingBottom: "120px" }}>
          <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Pflegekosten-Analyse</div>
            <div style={{ ...T.resultNumber, fontSize: "52px", textAlign: "center", color: heroZahlFarbe }}>{fmt(mtlLuecke)}</div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>monatlicher Restbedarf</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{pillPflege}</div>
            <div style={{ ...T.resultSub, marginTop: "4px", maxWidth: "44ch" }}>
              Modell-Szenario <strong style={{ color: "#6B7280" }}>„{meta ? meta.heroName : "—"}“</strong> · Eigenanteil {fmt(kosten)}/Mon. minus privater Vorsorge ({fmt(vorsorgeEff)}); sonst keine Abzüge.
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Aufschlüsselung: private Vorsorge &amp; Restlücke</div>
            <div style={T.cardPrimary}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>100 % = regionaler Eigenanteil (Orientierung)</span>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.3px", flexShrink: 0 }}>{fmt(kosten)}/Mon.</span>
                </div>
                <div style={T.stackedBarOuter} aria-hidden>
                  {pctVorsorge > 0 && <div style={T.stackedBarSeg(pctVorsorge, BAR_VORSORGE)} />}
                  {pctLuecke > 0 && <div style={T.stackedBarSeg(pctLuecke, BAR_LUECKE, "#FECACA")} />}
                </div>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px 16px", fontSize: "11px", color: "#6B7280" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: BAR_VORSORGE, flexShrink: 0 }} />
                    Private Pflege-Vorsorge
                  </span>
                  {pctLuecke > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: BAR_LUECKE, border: "1px solid #FECACA", flexShrink: 0 }} />
                      Lücke
                    </span>
                  )}
                </div>
                <div style={{ marginTop: "14px", fontSize: "12px", color: "#6B7280", lineHeight: 1.55 }}>
                  Abzug nur: private Vorsorge {fmt(vorsorgeEff)} · Rest {fmt(mtlLuecke)} bei Eigenanteil {fmt(kosten)}
                </div>
              </div>
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Empfohlene Produkte</div>
            <div style={{ ...T.cardPrimary, overflow: "visible" }}>
              <div style={{ padding: "13px 16px", background: `color-mix(in srgb, ${C} 4%, white)` }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    width: "100%",
                  }}
                >
                  <div style={{ flex: "1 1 160px", minWidth: 0, fontSize: "13px", fontWeight: "700", color: "#1F2937" }}>
                    Pflegetagegeld
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "10px",
                        fontWeight: "700",
                        color: C,
                        background: `${C}15`,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        whiteSpace: "normal",
                      }}
                    >
                      Empfohlen
                    </span>
                  </div>
                  <div
                    style={{
                      flex: "0 1 auto",
                      minWidth: 0,
                      maxWidth: "100%",
                      textAlign: "right",
                      marginLeft: "auto",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: "800",
                        color: C,
                        letterSpacing: "-0.6px",
                        lineHeight: 1.1,
                        wordBreak: "break-word",
                      }}
                    >
                      {R.empfTagegeld} €
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#6B7280",
                        marginTop: "4px",
                        lineHeight: 1.35,
                        wordBreak: "break-word",
                      }}
                    >
                      empfohlener Tagessatz
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...T.section, marginBottom: "16px" }}>
            <div className="pflege-acc-item">
              <button type="button" className="pflege-acc-btn" onClick={() => setPflegeArchiv((x) => (x === "legal" ? null : "legal"))} aria-expanded={pflegeArchiv === "legal"}>
                <span>Wie berechnen wir das?</span>
                <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{pflegeArchiv === "legal" ? "▲" : "▼"}</span>
              </button>
              {pflegeArchiv === "legal" && (
                <div className="pflege-acc-panel" style={{ paddingTop: "12px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: 1.65 }}>
                    Wir berechnen Ihren monatlichen Eigenanteil auf Basis aktueller Pflegesätze und gesetzlicher Leistungen
                    (SGB XI). Die Werte sind Richtwerte — regionale Unterschiede können abweichen.
                  </p>
                </div>
              )}
            </div>
            <div
              style={{
                marginTop: "12px",
                padding: "12px 14px",
                background: "#F6F8FE",
                border: "1px solid #DCE6FF",
                borderRadius: "14px",
                fontSize: "11px",
                color: "#315AA8",
                lineHeight: 1.6,
              }}
            >
              {CHECK_LEGAL_DISCLAIMER_FOOTER}
            </div>
          </div>
        </div>

        <div style={T.footer} data-checkkit-footer>
          <button type="button" style={T.btnPrim(false)} onClick={() => goTo(3)}>
            Beratung anfordern
          </button>
          <button type="button" style={T.btnSec} onClick={() => goTo(1)}>
            Neue Berechnung starten
          </button>
        </div>
      </div>
    );
  }

  if (phase === 3) {
    return withStandalone(
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header currentStep={pflegeHeaderStep(3, scr)} />
        <div style={T.hero}>
          <div style={T.eyebrow}>Fast geschafft</div>
          <div style={T.h1}>
            {R.luecke > 0
              ? `Restbedarf von ${fmt(R.luecke)}/Mon. absichern.`
              : "Ihre Pflegevorsorge besprechen."}
          </div>
          <div style={T.body}>
            Wir melden uns innerhalb von 24 Stunden mit konkreten Produktempfehlungen.
          </div>
        </div>
        <div style={{ ...T.section, marginBottom: "8px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={T.kpiKontaktLuecke}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: WARN, letterSpacing: "-0.5px" }}>{fmt(R.luecke)}/Mon.</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatlicher Restbedarf</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{meta ? meta.kurzLabel : "—"}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Szenario</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{p.alter} J.</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Alter</div>
            </div>
          </div>
        </div>
        <KontaktForm
          fd={fd}
          setFd={setFd}
          isDemo={isDemo}
          onSubmit={async () => {
            const token = new URLSearchParams(window.location.search).get("token");
            if (token) {
              const res = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token,
                  slug,
                  kundenName: fd.name,
                  kundenEmail: fd.email,
                  kundenTel: fd.tel || "",
                  highlights: [
                    { label: "Restbedarf / Monat", value: `${fmt(R.luecke)}/Mon.` },
                    { label: "Szenario", value: meta ? meta.kurzLabel : "—" },
                    { label: "Alter", value: `${p.alter} J.` },
                    { label: "Empf. Pflegetagegeld", value: `${R.empfTagegeld} €/Tag` },
                  ],
                }),
              }).catch(() => null);
              if (res?.ok) void trackEvent({ event_type: "lead_submitted", slug, token, firma: MAKLER.firma });
            }
            setDanke(true);
          }}
          onBack={() => goTo(2)}
          makler={MAKLER}
          T={T}
        />
      </div>
    );
  }

  return withStandalone(
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header currentStep={pflegeHeaderStep(1, scr)} />

      {scr === 1 && (
        <>
          <CheckKitStoryHero
            emoji="🛡️"
            title="Würde und Vermögen schützen."
            text="Pflege ist keine Frage des Alters, sondern der Selbstbestimmung. Wir berechnen in 2 Minuten, wie hoch Ihr Eigenanteil wirklich ist und wie Sie Ihr Erspartes absichern."
          />
          <div style={T.footer} data-checkkit-footer>
            <button type="button" style={T.btnPrim(false)} onClick={() => setScr(2)}>
              Analyse starten
            </button>
          </div>
        </>
      )}

      {scr === 2 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Schritt 2 von {WIZARD_STEPS}</div>
            <div style={T.h1}>Was macht Ihnen am meisten Kopfschmerzen?</div>
            <div style={T.body}>
              Häufige Pflegefälle und Krankheitsverläufe — wählen Sie, was Sie am ehesten beschäftigt. Wir ordnen das einer Kostenschätzung zu (Pflegeheim vs. ambulant) und passen die weiteren Schritte daran an.
            </div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PFLEGE_SORGE_OPTIONEN.map((opt) => (
                <SelectionCard
                  key={opt.id}
                  value={opt.id}
                  label={opt.label}
                  description={opt.desc}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{opt.emoji}</span>}
                  selected={p.pflegeSorge === opt.id}
                  accent={C}
                  onClick={() =>
                    setP((x) => ({
                      ...x,
                      pflegeSorge: opt.id,
                      pflegeOrt: opt.pflegeOrt,
                    }))
                  }
                />
              ))}
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer} data-checkkit-footer>
            <button type="button" style={T.btnPrim(!p.pflegeSorge)} disabled={!p.pflegeSorge} onClick={() => setScr(3)}>
              Weiter
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}

      {scr === 3 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Schritt 3 von {WIZARD_STEPS}</div>
            <div style={T.h1}>In welcher Region leben Sie?</div>
            <div style={T.body}>Eigenanteile und Heimkosten unterscheiden sich je nach Bundesland — wählen Sie Ihr Bundesland.</div>
          </div>
          <div style={T.section}>
            <label style={T.fldLbl} htmlFor="pflege-region">
              Bundesland
            </label>
            <select
              id="pflege-region"
              value={p.region}
              onChange={(e) => set("region", e.target.value)}
              style={{ ...T.inputEl, width: "100%", cursor: "pointer" }}
            >
              <option value="">Bitte wählen</option>
              {BUNDESLAENDER.map((bl) => (
                <option key={bl} value={bl}>
                  {bl}
                </option>
              ))}
              <option value="__bund__">Durchschnitt (Bund)</option>
            </select>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer} data-checkkit-footer>
            <button type="button" style={T.btnPrim(!p.region)} disabled={!p.region} onClick={() => setScr(4)}>
              Weiter
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}

      {scr === 4 && (() => {
        const s2 = pflegeStoryKostenFokusCopy(p.pflegeOrt, p.region);
        return (
          <>
            <CheckKitStoryHero emoji="🏥" title={s2.title} text={s2.text} />
            <div style={T.footer} data-checkkit-footer>
              <button type="button" style={T.btnPrim(false)} onClick={() => setScr(5)}>
                Weiter
              </button>
              <button type="button" style={T.btnSec} onClick={backScr}>
                Zurück
              </button>
            </div>
          </>
        );
      })()}

      {scr === 5 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Schritt 5 von {WIZARD_STEPS}</div>
            <div style={T.h1}>Ihre finanzielle Ausgangslage</div>
            <div style={T.body}>
              Alter und bestehende private Pflege-Vorsorge — Pflegegrad und Szenario kommen aus Ihrer früheren Auswahl.
            </div>
          </div>
          <div style={T.section}>
            <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={25} max={75} step={1} unit="Jahre" display={`${p.alter} Jahre`} accent={C} onChange={(v) => set("alter", v)} />
            <SliderCard
              label="Bestehende Pflege-Vorsorge (monatliche Leistung)"
              value={p.vorsorgeMonat}
              min={0}
              max={3000}
              step={50}
              unit="€/Mon."
              display={p.vorsorgeMonat === 0 ? "Keine bestehende Vorsorge angenommen" : `${fmt(p.vorsorgeMonat)} pro Monat aus Vorsorge`}
              hint="Was Sie bereits aus Pflegetagegeld, Pflege-Bahr o. Ä. erhalten würden (vereinfacht als monatlicher Betrag)."
              accent={C}
              onChange={(v) => set("vorsorgeMonat", v)}
            />
            {p.alter < 50 && (
              <div style={{ marginTop: "12px", padding: "10px 12px", background: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0", fontSize: "12px", color: "#15803D", lineHeight: 1.5 }}>
                Früh absichern: In jungen Jahren sind Beiträge für Zusatzvorsorge oft besonders günstig.
              </div>
            )}
            {p.alter >= 60 && (
              <div style={{ marginTop: "12px", padding: "10px 12px", background: "#FFFBEB", borderRadius: "8px", border: "1px solid #FCD34D", fontSize: "12px", color: "#92400E", lineHeight: 1.5 }}>
                Ab 60 steigen Beiträge und Gesundheitsanforderungen typischerweise — eine Einordnung lohnt sich.
              </div>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer} data-checkkit-footer>
            <button type="button" style={T.btnPrim(false)} onClick={() => setLoading(true)}>
              Analyse starten
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}
    </div>
  );
}
