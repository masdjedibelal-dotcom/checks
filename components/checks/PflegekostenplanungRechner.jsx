import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard, SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { fmtK } from "@/lib/utils";

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

function LogoSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
    </svg>
  );
}

/**
 * Pflegeort → Ø Monatskosten, Kassenabzug (stationär vs. ambulant).
 * Netto-Lücke = Kosten − Kasse − Einkünfte − bestehende Vorsorge.
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

function makePflegeT(C) {
  return {
    page: { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
    header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(31,41,55,0.06)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoMk: { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
    logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
    badge: { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
    prog: { height: "2px", background: "rgba(31,41,55,0.08)" },
    progFil: (w) => ({ height: "100%", width: `${w}%`, background: C, transition: "width 0.4s ease" }),
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
      text: `In ${reg} liegt der typische monatliche Eigenanteil im Pflegeheim bei etwa ${fmt(station)}. Wir prüfen jetzt Ihre Lücke — also was nach abzugsfähiger Rente oder gesetzlicher Basis und bestehender Vorsorge für Sie übrig bleibt.`,
    };
  }
  return {
    title: "Unabhängigkeit zu Hause.",
    text: `Für ambulante Versorgung rechnen wir mit einer geschätzten monatlichen Zuzahlungslast von etwa ${fmt(eff)} (aus dem Heim-Eigenanteil in ${reg}, ca. ${fmt(station)}, skaliert). So sehen Sie, wie sehr Eigenheim und Erspartes belastet werden können.`,
  };
}

function pflegeBridgeSicherheitCopy(pflegegrad, region, pflegeOrt, renteOderBasisMonat) {
  const eff = eigenanteilEffektivMonat(pflegeOrt, region);
  const basisStr = `${Math.round(Number(renteOderBasisMonat)).toLocaleString("de-DE")} €`;
  const regLabel =
    !region || region === "" || region === "__bund__"
      ? `den bundesweiten Durchschnitt (${fmt(PFLEGE_EIGENANTEIL_BUND_DURCHSCHNITT)} Heim-Eigenanteil)`
      : region;
  return {
    title: "Ihre Sicherheits-Analyse.",
    text: `Für ${regLabel} rechnen wir mit etwa ${fmt(eff)} monatlicher Eigenbelastung (${pflegeOrt === "stationär" ? "stationär" : "ambulant"}). So bestätigen wir die Relevanz Ihrer Angaben mit einem konkreten Betrag. ${Number(renteOderBasisMonat) > 0 ? `In der Auswertung ziehen wir ${basisStr} als gesetzliche Basis bzw. Rentenleistung ab.` : "Ohne diesen Abzug startet die Lücke vom vollen regionalen Eigenanteil (minus privater Pflege-Vorsorge)."} Einordnung mit Pflegegrad ${pflegegrad}.`,
  };
}

function Danke({ name, onBack, makler, C }) {
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
        <div style={T.footer}>
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
      <div style={T.footer}>
        <button type="button" style={T.btnPrim(!valid)} onClick={() => { if (valid) onSubmit(); }} disabled={!valid}>
          {valid ? "Vorsorge prüfen lassen" : "Bitte alle Angaben machen"}
        </button>
        <button type="button" style={T.btnSec} onClick={onBack}>Zurück</button>
      </div>
    </>
  );
}

/**
 * Monatliche Netto-Lücke: regionaler Eigenanteil minus (optional) gesetzliche Basis/Rente,
 * danach Abzug privater Pflege-Vorsorge. 100 %-Balken = regionaler Eigenanteil (effektiv).
 */
function berechne({ pflegeOrt, region, renteOderBasisMonat, vorsorgeMonat }) {
  const eigenEff = eigenanteilEffektivMonat(pflegeOrt, region);
  const basisRaw = Math.max(0, Number(renteOderBasisMonat) || 0);
  /** Zuerst: Differenz Eigenanteil − optionale gesetzliche Basis / Rente */
  const basisAbgezogen = Math.min(basisRaw, eigenEff);
  const nachBasis = Math.max(0, eigenEff - basisAbgezogen);
  const vorsorgeEff = Math.min(Math.max(0, vorsorgeMonat), nachBasis);
  const luecke = Math.max(0, nachBasis - vorsorgeEff);
  const pctBasisRente = eigenEff > 0 ? (basisAbgezogen / eigenEff) * 100 : 0;
  const pctVorsorge = eigenEff > 0 ? (vorsorgeEff / eigenEff) * 100 : 0;
  const pctLuecke = eigenEff > 0 ? (luecke / eigenEff) * 100 : 0;

  /** Monatlicher Eigenanteil (Orientierung) für Produkt-Empfehlungen — wie stationär/ambulant gewählt */
  const eigenMonatl = eigenEff;
  /** Pflegetagegeld: Eigenanteil / 30 Tage, auf 5 € gerundet */
  const empfTagegeld = Math.max(10, Math.ceil(eigenMonatl / 30 / 5) * 5);
  /** Pflegerente: Eigenanteil, auf 50 € gerundet */
  const empfRente = Math.max(50, Math.round(eigenMonatl / 50) * 50);

  /** Ø Pflegedauer (Jahre, Orientierung) für Kumulation Eigenanteil */
  const dauer = 3;
  const gesamtEigen = Math.round(eigenMonatl * 12 * dauer);

  return {
    eigenEff,
    basisAbgezogen,
    nachBasis,
    vorsorgeEff,
    luecke,
    pctBasisRente,
    pctVorsorge,
    pctLuecke,
    mtlLuecke: luecke,
    eigenMonatl,
    empfTagegeld,
    empfRente,
    dauer,
    gesamtEigen,
    /** Kompatibilität Ergebnis-UI */
    kosten: eigenEff,
    kasse: basisAbgezogen,
    nachKasse: nachBasis,
    einkEff: basisAbgezogen,
    pctKasse: pctBasisRente,
    pctEink: 0,
  };
}

const WIZARD_STEPS = 6;

export default function PflegekostenplanungRechner() {
  const MAKLER = useCheckConfig();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => makePflegeT(C), [C]);
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [fd, setFd] = useState({ name: "", email: "", tel: "" });
  const [p, setP] = useState({
    pflegeOrt: "",
    region: "",
    pflegegrad: 3,
    alter: 50,
    einkommenMonat: 1500,
    vorsorgeMonat: 0,
  });
  const [loading, setLoading] = useState(false);
  const [scr, setScr] = useState(1);
  const [pflegeArchiv, setPflegeArchiv] = useState(null);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setLoading(false);
    }
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  const R = berechne({
    pflegeOrt: p.pflegeOrt,
    region: p.region,
    renteOderBasisMonat: p.einkommenMonat,
    vorsorgeMonat: p.vorsorgeMonat,
  });
  const meta = PFLEGE_ORT_MODELL[p.pflegeOrt] || PFLEGE_ORT_MODELL.ambulant;

  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  const progPct = phase === 1 ? Math.round((scr / WIZARD_STEPS) * 88) : { 2: 88, 3: 100 }[phase] || 100;

  const Header = () => (
    <>
      <div style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMk}>
            <LogoSVG />
          </div>
          <span style={T.logoTxt}>{MAKLER.firma}</span>
        </div>
        <span style={T.badge}>Pflege-Check</span>
      </div>
      <div style={T.prog}>
        <div style={T.progFil(progPct)} />
      </div>
    </>
  );

  if (danke) {
    return (
      <div style={{ ...T.page, "--accent": C }}>
        <Header />
        <Danke name={fd.name} onBack={() => { setDanke(false); goTo(1); }} makler={MAKLER} C={C} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...T.page, "--accent": C }}>
        <Header />
        <CheckLoader type="pflege" checkmarkColor={C} onComplete={() => { setLoading(false); goTo(2); }} />
      </div>
    );
  }

  if (phase === 2) {
    const { kosten, kasse, vorsorgeEff, pctKasse, pctVorsorge, pctLuecke, mtlLuecke } = R;
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

    const eigen = kosten;
    const alterHinweis =
      p.alter < 55
        ? "Je länger der Zeitraum bis zu möglicher Pflegebedürftigkeit, desto günstiger können Vorsorgebeiträge ausfallen — früh einsteigen schafft Spielraum."
        : p.alter < 65
          ? "Mit zunehmendem Alter steigt das statistische Pflegerisiko — Lücken jetzt schließen mindert spätere Vermögensbelastung."
          : "Kurz vor oder in der Rente ist Pflege oft kurzfristiger relevant — bestehende Verträge sollten zur aktuellen Belastung geprüft werden.";
    const einordnungBullets = [
      eigen >= 2000
        ? `${fmt(eigen)}/Monat entspricht in der Größenordnung einem vollen Monatsnetto — das müssen Sie aus Einkommen oder Vermögen selbst tragen.`
        : `${fmt(eigen)}/Monat wirkt zunächst überschaubar — über Ø ${R.dauer} Jahre summiert sich das auf rund ${fmtK(R.gesamtEigen)}.`,
      "Die gesetzliche Pflegeversicherung deckt nur einen Teil — den Rest tragen Sie oder Ihre Familie selbst.",
      alterHinweis,
    ];

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />

        <div style={{ paddingBottom: "120px" }}>
          <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Pflegekosten-Analyse</div>
            <div style={{ ...T.resultNumber, fontSize: "52px", textAlign: "center", color: heroZahlFarbe }}>{fmt(mtlLuecke)}</div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>mtl. ungedeckt</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{pillPflege}</div>
            <div style={{ ...T.resultSub, marginTop: "4px", maxWidth: "38ch" }}>
              Modell-Szenario <strong style={{ color: "#6B7280" }}>„{meta ? meta.heroName : "—"}“</strong> · regionaler Eigenanteil (Orientierung) {fmt(kosten)}/Mon.
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Aufschlüsselung: Basis/Rente, private Vorsorge, Restlücke</div>
            <div style={T.cardPrimary}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>100 % = regionaler Eigenanteil (Orientierung)</span>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.3px", flexShrink: 0 }}>{fmt(kosten)}/Mon.</span>
                </div>
                <div style={T.stackedBarOuter} aria-hidden>
                  {pctKasse > 0 && <div style={T.stackedBarSeg(pctKasse, OK)} />}
                  {pctVorsorge > 0 && <div style={T.stackedBarSeg(pctVorsorge, BAR_VORSORGE)} />}
                  {pctLuecke > 0 && <div style={T.stackedBarSeg(pctLuecke, BAR_LUECKE, "#FECACA")} />}
                </div>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px 16px", fontSize: "11px", color: "#6B7280" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: OK, flexShrink: 0 }} />
                    Gesetzliche Basis / Rente (angenommen)
                  </span>
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
                  Abzug Basis/Rente {fmt(kasse)} · Vorsorge {fmt(vorsorgeEff)} · ungedeckt {fmt(mtlLuecke)}
                </div>
              </div>
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Einordnung</div>
            <div style={T.cardPrimary}>
              <div style={{ padding: "18px 20px" }}>
                {einordnungBullets.map((text, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginBottom: i < arr.length - 1 ? "8px" : "0",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "rgba(17,24,39,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                        <path d="M2 4h4M4 2v4" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Empfohlene Produkte</div>
            <div style={{ ...T.cardPrimary, overflow: "hidden" }}>
              {[
                {
                  n: "Pflegetagegeld",
                  empfehlung: `${R.empfTagegeld} €/Tag empfohlen`,
                  empfSub: `= ${fmt(R.empfTagegeld * 30)}/Mon. · deckt Ihren Eigenanteil (Orientierung)`,
                  t: "Zahlt pro Pflegetag — unabhängig von den tatsächlichen Kosten.",
                  highlight: true,
                },
                {
                  n: "Pflegerente",
                  empfehlung: `${fmt(R.empfRente)}/Mon. empfohlen`,
                  empfSub: `ab Pflegegrad ${p.pflegegrad}`,
                  t: "Monatliche Rente direkt an Sie.",
                  highlight: false,
                },
                {
                  n: "Pflegekostenversicherung",
                  empfehlung: `${fmt(kosten)}/Mon. absichern`,
                  empfSub: "Erstattet tatsächliche Heimkosten",
                  t: "Besonders bei hohen stationären Kosten sinnvoll.",
                  highlight: false,
                },
              ].map(({ n, empfehlung, empfSub, t, highlight }, i, arr) => (
                <div
                  key={n}
                  style={{
                    padding: "13px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                    background: highlight ? `color-mix(in srgb, ${C} 4%, white)` : "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#1F2937" }}>
                      {n}
                      {highlight ? (
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
                          }}
                        >
                          Empfohlen
                        </span>
                      ) : null}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: highlight ? C : "#1F2937",
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {empfehlung}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{empfSub}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55 }}>{t}</div>
                </div>
              ))}
            </div>
          </div>

          {p.pflegeOrt === "stationär" ? (
            <div style={T.section}>
              <div
                style={{
                  padding: "15px 16px",
                  borderRadius: "14px",
                  background: "#FDF8F0",
                  border: "1px solid #EDD9BB",
                  color: "#94622D",
                  fontSize: "13px",
                  lineHeight: 1.7,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#94622D",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  §43c SGB XI — Leistungszuschlag
                </div>
                Ab dem <strong>13. Monat</strong> im Heim sinkt Ihr Eigenanteil schrittweise: Monate 13–24: −25&nbsp;% · Monate 25–36: −50&nbsp;% · ab
                Monat 37: −75&nbsp;% des einrichtungseinheitlichen Eigenanteils (EEE).
              </div>
            </div>
          ) : null}

          <div style={{ ...T.section, marginBottom: "16px" }}>
            <div style={T.sectionLbl}>SGB XI, Modellannahmen &amp; Rechtliches</div>
            <div className="pflege-acc-item">
              <button type="button" className="pflege-acc-btn" onClick={() => setPflegeArchiv((x) => (x === "legal" ? null : "legal"))} aria-expanded={pflegeArchiv === "legal"}>
                <span>Details &amp; rechtliche Hinweise</span>
                <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{pflegeArchiv === "legal" ? "▲" : "▼"}</span>
              </button>
              {pflegeArchiv === "legal" && (
                <div className="pflege-acc-panel" style={{ paddingTop: "12px" }}>
                  <p style={{ marginBottom: "10px" }}>
                    Diese Berechnung nutzt ein Bundesland-Mapping typischer monatlicher Eigenanteile (stationäre Pflege, Orientierungswerte). Ambulant wird daraus proportional geschätzt. Tatsächliche Kosten variieren je nach Einrichtung, Vertrag und individuellem Budget.
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Formel:</strong> Restlücke = max(0, regionaler Eigenanteil − optional angesetzte gesetzliche Basis bzw. Rentenleistung − bestehende private Pflege-Vorsorge). Ohne Angabe zur Basis/Rente entspricht die Ausgangslage dem vollen regionalen Eigenanteil (abzüglich Vorsorge).
                  </p>
                  <p style={{ margin: 0, color: "#b8884a" }}>Keine Rechtsberatung. Orientierung u. a. § 43 SGB XI.</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ ...T.section, marginBottom: "8px" }}>
            <div style={{ ...T.infoBox, fontSize: "11px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
          </div>
        </div>

        <div style={T.footer}>
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
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />
        <div style={T.hero}>
          <div style={T.eyebrow}>Fast geschafft</div>
          <div style={T.h1}>Wo können wir Sie erreichen?</div>
          <div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
        </div>
        <div style={{ ...T.section, marginBottom: "8px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={T.kpiKontaktLuecke}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: WARN, letterSpacing: "-0.5px" }}>{fmt(R.luecke)}/Mon.</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatliche Netto-Lücke</div>
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
              await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, slug: "pflege-check", kundenName: fd.name, kundenEmail: fd.email, kundenTel: fd.tel || "" }),
              }).catch(() => {});
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

  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header />

      {scr === 1 && (
        <>
          <CheckKitStoryHero
            emoji="🛡️"
            title="Würde und Vermögen schützen."
            text="Pflege ist keine Frage des Alters, sondern der Selbstbestimmung. Wir berechnen in 2 Minuten, wie hoch Ihr Eigenanteil wirklich ist und wie Sie Ihr Erspartes absichern."
          />
          <div style={T.footer}>
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
            <div style={T.h1}>Wo sehen Sie den Schwerpunkt?</div>
            <div style={T.body}>Stationäre Pflege oder ambulante Versorgung — wir passen die Kostenschätzung daran an.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SelectionCard
                value="stationär"
                label="Stationär"
                description="Pflegeheim oder vollstationäre Einrichtung — typisch höhere Eigenanteile."
                selected={p.pflegeOrt === "stationär"}
                accent={C}
                onClick={() => set("pflegeOrt", "stationär")}
              />
              <SelectionCard
                value="ambulant"
                label="Ambulant"
                description="Hilfen und Sachleistungen zu Hause — weiterhin mit Zuzahlungen und Eigenanteilen."
                selected={p.pflegeOrt === "ambulant"}
                accent={C}
                onClick={() => set("pflegeOrt", "ambulant")}
              />
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(!p.pflegeOrt)} disabled={!p.pflegeOrt} onClick={() => setScr(3)}>
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
          <div style={T.footer}>
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
            <div style={T.footer}>
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
              Alter, Pflegegrad, optional gesetzliche Basis bzw. Rentenleistung und bestehende private Pflege-Vorsorge — damit ermitteln wir Ihre Restlücke zum regionalen Eigenanteil.
            </div>
          </div>
          <div style={T.section}>
            <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={25} max={75} step={1} unit="Jahre" display={`${p.alter} Jahre`} accent={C} onChange={(v) => set("alter", v)} />
            <SliderCard
              label="Pflegegrad (Annahme für die Einordnung)"
              value={p.pflegegrad}
              min={1}
              max={5}
              step={1}
              unit="Stufe"
              display={`Pflegegrad ${p.pflegegrad}`}
              hint="Orientierung nach dem bekannten Stufensystem — die Berechnung der Lücke nutzt Ihre gewählte Versorgungsform (stationär/ambulant)."
              accent={C}
              onChange={(v) => set("pflegegrad", v)}
            />
            <SliderCard
              label="Gesetzliche Basis oder Rentenleistung (optional, monatlich)"
              value={p.einkommenMonat}
              min={0}
              max={5000}
              step={50}
              unit="€/Mon."
              display={p.einkommenMonat === 0 ? "Keine angesetzt — voller Eigenanteil als Ausgang" : `${fmt(p.einkommenMonat)} pro Monat abziehen`}
              hint="Was Sie z. B. aus Rente, Erwerbsminderungsrente oder anderen gesetzlich einbezogenen Leistungen monatlich gegen den Eigenanteil anrechnen lassen (vereinfacht als ein Betrag)."
              accent={C}
              onChange={(v) => set("einkommenMonat", v)}
            />
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
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={() => setScr(6)}>
              Weiter
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}

      {scr === 6 && (() => {
        const b3 = pflegeBridgeSicherheitCopy(p.pflegegrad, p.region, p.pflegeOrt, p.einkommenMonat);
        return (
          <>
            <CheckKitStoryHero hideFooterSpacer emoji="💸" title={b3.title} text={b3.text} />
            <div style={{ padding: "8px 24px 0", ...CHECKKIT2026.storyContentWrap }}>
              {[
                "Abgleich der gesetzlichen Leistungen (Pflegekasse).",
                "Ermittlung Ihres realen monatlichen Eigenanteils.",
                "Strategie zum Schutz Ihres Privatvermögens (und Erbes).",
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
                  <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }} aria-hidden>
                    ✅
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div style={{ height: CHECKKIT2026.footerSpacerPx }} />
            <div style={T.footer}>
              <button type="button" style={T.btnPrim(false)} onClick={() => setLoading(true)}>
                Ergebnis jetzt anzeigen
              </button>
              <button type="button" style={T.btnSec} onClick={backScr}>
                Zurück
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}
