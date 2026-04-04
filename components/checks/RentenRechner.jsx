import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CheckConfigLoadingShell } from "@/components/checks/CheckConfigLoadingShell";
import { CheckHeaderPhoneButton } from "@/components/checks/CheckHeaderPhoneButton";
import { StandaloneWrapper } from "@/components/checks/StandaloneWrapper";
import { useMakler } from "@/components/ui/MaklerContext";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";

(() => {
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #ffffff; font-family: var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    button, input, select { font-family: inherit; border: none; background: none; cursor: pointer; }
    input, select { cursor: text; }
    ::-webkit-scrollbar { display: none; } * { scrollbar-width: none; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .fade-in { animation: fadeIn 0.28s ease both; }
    .renten-acc-item { border-radius: 12px; background: #F9FAFB; border: 1px solid rgba(17,24,39,0.06); margin-bottom: 8px; overflow: hidden; }
    .renten-acc-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #1F2937; background: transparent; cursor: pointer; border: none; font-family: inherit; }
    .renten-acc-panel { padding: 0 16px 14px; font-size: 12px; color: #6B7280; line-height: 1.65; border-top: 1px solid rgba(17,24,39,0.06); }
    button:active { opacity: 0.75; }
    input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; border-radius: 1px; background: #e5e5e5; cursor: pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; box-shadow: 0 0 0 1px var(--accent); }
    a { text-decoration: none; }
  `;
  document.head.appendChild(s);
})();

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

const S1 = "#0369a1", S2 = "#7c3aed", S3 = "#059669", WARN = "#c0392b";
/** Hellrot: Rest der Zielrente bis 100 % = Lücke */
const GAP_BAR = "#FEE2E2";

/** Grauer Info-Block unter Strategie-Karten */
const STRATEGIE_INFO_BLOCK = {
  marginTop: "12px",
  padding: "10px 12px",
  borderRadius: "10px",
  background: "rgba(0,0,0,0.04)",
  fontSize: "12px",
  color: "#6B7280",
  lineHeight: 1.6,
};

function berechne({ alter, rentenAlter, netto, zielProzent, gesRente, bav, privat, inflation }) {
  const jahreBis  = Math.max(1, rentenAlter - alter);
  const lebenserw = 87;
  const renteDauer = Math.max(1, lebenserw - rentenAlter);
  /** Zielrente aus %-Anteil des heutigen Nettos — ohne Inflationsaufschlag */
  const zielBasis = Math.round(netto * (zielProzent / 100));
  /** Planungs-Zielrente netto: bei gewählter Inflation +20 % auf die Zielbasis (vereinfacht) */
  const zielRentenNetto = inflation ? Math.round(zielBasis * 1.2) : zielBasis;

  // Gesetzliche Rente: wenn 0 angegeben → ~45 % des Nettos schätzen
  const gesRenteEff = gesRente > 0 ? gesRente : Math.round(netto * 0.45);
  const vorhanden   = gesRenteEff + bav + privat;
  const luecke      = Math.max(0, zielRentenNetto - vorhanden);
  const deckung    = zielRentenNetto > 0 ? Math.min(100, Math.round((vorhanden / zielRentenNetto) * 100)) : 100;

  const schichten = [
    { label: "Gesetzliche Rente",    sub: "Schicht 1 · GRV",   farbe: S1, betrag: gesRenteEff, anteil: zielRentenNetto > 0 ? Math.min(100, Math.round((gesRenteEff / zielRentenNetto) * 100)) : 0 },
    { label: "Betrieblich / Riester", sub: "Schicht 2 · bAV",  farbe: S2, betrag: bav,        anteil: zielRentenNetto > 0 ? Math.min(100, Math.round((bav / zielRentenNetto) * 100)) : 0 },
    { label: "Private Vorsorge",      sub: "Schicht 3 · privat", farbe: S3, betrag: privat,   anteil: zielRentenNetto > 0 ? Math.min(100, Math.round((privat / zielRentenNetto) * 100)) : 0 },
  ];

  /** Horizontale Balken-Segmente: S1–S3 als Anteil der Zielrente, Rest bis 100 % = Lücke (#FEE2E2) */
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let pGap = 0;
  if (zielRentenNetto > 0) {
    p1 = (gesRenteEff / zielRentenNetto) * 100;
    p2 = (bav / zielRentenNetto) * 100;
    p3 = (privat / zielRentenNetto) * 100;
    const sum = p1 + p2 + p3;
    if (sum > 100) {
      const k = 100 / sum;
      p1 *= k;
      p2 *= k;
      p3 *= k;
      pGap = 0;
    } else {
      pGap = 100 - sum;
    }
  }

  /** Wartekosten: gleicher Kapital-Orientierungswert, kürzerer Ansparhorizont nach 5 J. Warten → höhere Rate */
  const kapOrientWarte = Math.max(0, luecke) * 12 * 20;
  const monHeute = Math.max(12, jahreBis * 12);
  const monNach5J = Math.max(12, Math.max(1, jahreBis - 5) * 12);
  const rateA = kapOrientWarte > 0 ? Math.round(kapOrientWarte / monHeute) : 0;
  const rateA5 = kapOrientWarte > 0 ? Math.round(kapOrientWarte / monNach5J) : 0;
  const mehrKosten = Math.max(0, rateA5 - rateA);

  /** Kapitalziel (Orientierung): Lücke × 12 × 20 / 24 J. */
  const kapitalBedarf = Math.round(Math.max(0, luecke) * 12 * 20);
  const kapitalbedarfFrau = Math.round(Math.max(0, luecke) * 12 * 24);

  const sparrateMonatlich = rateA;
  const sparrateHeute = rateA;
  const sparrateIn5Jahren = rateA5;
  const wartekosten = mehrKosten;
  const monatlLuecke = luecke;

  let strategieEmpfohlen = "fonds";
  if (alter < 45) strategieEmpfohlen = "fonds";
  else if (alter >= 55) strategieEmpfohlen = "rente";
  else if (luecke > 500) strategieEmpfohlen = "kombination";
  else strategieEmpfohlen = "fonds";

  return {
    jahreBis,
    renteDauer,
    zielBasis,
    zielRentenNetto,
    vorhanden,
    luecke,
    /** Monatliche Lücke = Zielrente netto (ggf. mit Inflation) − vorhandene Leistungen — entspricht Hero & Gap-Balken */
    lueckeHeute: luecke,
    deckung,
    schichten,
    gesRenteEff,
    barStack: { p1, p2, p3, pGap },
    alter,
    monatlLuecke,
    strategieEmpfohlen,
    sparrateMonatlich,
    kapitalbedarfMann: kapitalBedarf,
    kapitalbedarfFrau,
    sparrateHeute,
    sparrateIn5Jahren,
    wartekosten,
    rateA,
    rateA5,
    mehrKosten,
    kapitalBedarf,
  };
}

function makeRentenT(C) {
  return {
  page:    { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
  header:  { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(31,41,55,0.06)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { display: "flex", alignItems: "center", gap: "10px" },
  logoMk:  { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
  logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
  badge:   { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
  hero:    { padding: "32px 24px 16px", textAlign: "center" },
  eyebrow: { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" },
  h1:      { fontSize: "22px", color: "#111", lineHeight: 1.25, ...CHECKKIT_HERO_TITLE_TYPO },
  body:    { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
  section: { padding: "0 24px", marginBottom: "20px" },
  divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
  card:    { border: "1px solid #e8e8e8", borderRadius: "18px", overflow: "hidden" },
  kpiKontaktLuecke: {
    borderRadius: "16px",
    background: "#FFF7F7",
    border: "1px solid #F2CFCF",
    padding: "12px 14px",
    minWidth: 0,
    flex: "1 1 120px",
  },
  kpiKontaktEu: {
    borderRadius: "14px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(17,24,39,0.06)",
    padding: "12px 14px",
    minWidth: 0,
    flex: "1 1 120px",
  },
  row:     { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
  rowLast: { padding: "14px 16px" },
  fldLbl:  { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "0", display: "block" },
  fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
  optBtn:  (a,c) => ({ padding: "9px 14px", borderRadius: "6px", border: `1px solid ${a?(c||C):"#e8e8e8"}`, background: a?(c||C):"#fff", fontSize: "13px", fontWeight: a?"600":"400", color: a?"#fff":"#444", transition: "all 0.15s", cursor: "pointer" }),
  footer:  { position: "sticky", bottom: 0, background: "#ffffff", borderTop: "1px solid rgba(31,41,55,0.06)", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
  btnPrim: (d) => ({
    width: "100%",
    padding: "13px 20px",
    background: d ? "#e8e8e8" : C,
    color: d ? "#aaa" : "#fff",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: d ? "default" : "pointer",
    boxShadow: d ? "none" : "0 8px 20px rgba(26,58,92,0.18)",
  }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? WARN : "#111" }),
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
  resultHero: { padding: "52px 24px 40px", textAlign: "center", background: "#fff" },
  resultEyebrow: { fontSize: "12px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.2px", marginBottom: "10px" },
  resultHeadline: { fontSize: "20px", color: "#111827", lineHeight: 1.25, marginBottom: "14px", textAlign: "center", ...CHECKKIT_HERO_TITLE_TYPO },
  resultNumber: (warn) => ({ fontSize: "52px", fontWeight: "800", color: warn ? WARN : C, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "8px" }),
  resultUnit: { fontSize: "14px", color: "#9CA3AF", marginBottom: "18px" },
  resultSub: { fontSize: "13px", color: "#9CA3AF", lineHeight: 1.55, marginTop: "12px" },
  statusOk: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#15803D" },
  statusWarn: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFF6F5", border: "1px solid #F2D4D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#C0392B" },
  statusInfo: (C2) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", background: `${C2}14`, border: `1px solid ${C2}33`, borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: C2 }),
  cardPrimary: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "20px", overflow: "hidden", background: "#FFFFFF", boxShadow: "0 6px 24px rgba(17,24,39,0.08)" },
  sectionLbl: { fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" },
  stackedBarOuter: { width: "100%", maxWidth: "100%", height: "16px", borderRadius: "999px", overflow: "hidden", display: "flex", background: "rgba(31,41,55,0.08)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" },
  stackedBarSeg: (pct, color) => ({
    height: "100%",
    width: `${pct}%`,
    flexShrink: 0,
    background: color,
    minWidth: pct > 0.5 ? "2px" : 0,
    transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
  }),
  compareGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px" },
  compareCard: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", padding: "16px 18px", background: "#fff", boxShadow: "0 4px 16px rgba(17,24,39,0.06)", minWidth: 0 },
  compareCardTitle: { fontSize: "14px", fontWeight: "700", color: "#1F2937", marginBottom: "10px", letterSpacing: "-0.2px" },
};
}

/** Nur Alter, Netto, Wunsch-Rentenalter — keine Berufs-/Familiendaten */
function rentenStoryZeitEinkommenCopy(alter, nettoEinkommen, wunschRentenalter) {
  const nettoStr = `${Math.round(Number(nettoEinkommen)).toLocaleString("de-DE")} €`;
  const ra = Math.round(Number(wunschRentenalter));
  if (alter < 40) {
    return {
      title: "Der Faktor Zeit.",
      text: `Mit ${alter} Jahren haben Sie den größten Hebel: Den Zinseszins. Wir berechnen jetzt, wie viel von Ihrem heutigen Netto (${nettoStr}) im Jahr ${ra} als Kaufkraft übrig bleiben muss.`,
    };
  }
  return {
    title: "Präzision im Endspurt.",
    text: `Bis zu Ihrem Wunsch-Rentenalter (${ra}) sind es noch wichtige Jahre. Wir kalkulieren jetzt, wie wir Ihr heutiges Netto von ${nettoStr} inflationsgeschützt in die Rente übertragen.`,
  };
}

/** scr 1–4 → „Über Sie“, scr 5–8 → „Ziele“ */
const RENTEN_HEADER_STEPS = ["Über Sie", "Ziele", "Ergebnis", "Kontakt"];

function rentenHeaderStep(phase, scr) {
  if (phase === 2) return 2;
  if (phase === 3) return 3;
  if (phase === "bridge") return 2;
  if (phase === 1) return (scr ?? 1) <= 4 ? 0 : 1;
  return 3;
}

function Header({ makler, C, currentStep = 0, showProgressBar = true }) {
  const { embedInIframe } = useMakler();
  if (embedInIframe) return null;
  return (
    <>
      <div
        className="check-header check-sticky-header"
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
          <MaklerFirmaAvatarInitials firma={makler.firma} />
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
          {makler.firma}
        </span>
        <CheckHeaderPhoneButton telefon={makler.telefon} primaryColor={C} />
      </div>
      {showProgressBar ? (
        <CheckProgressBar steps={RENTEN_HEADER_STEPS} currentStep={currentStep} accent={C} />
      ) : null}
    </>
  );
}

function Footer({ onNext, onBack, label="Weiter", disabled=false, T }) {
  return (
    <div style={T.footer} data-checkkit-footer>
      <button style={T.btnPrim(disabled)} onClick={onNext} disabled={disabled}>{label}</button>
      {onBack && <button style={T.btnSec} onClick={onBack}>Zurück</button>}
    </div>
  );
}

function DankeScreen({ name, onBack, makler, C, luecke, deckung }) {
  return (
    <div style={{ padding:"48px 24px", textAlign:"center" }} className="fade-in">
      <div style={{ width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontSize:"20px",fontWeight:"700",color:"#111",letterSpacing:"-0.4px",marginBottom:"8px" }}>{name?`Vielen Dank, ${name.split(" ")[0]}.`:"Ihre Anfrage wurde gesendet."}</div>
      <div style={{ fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px" }}>Wir prüfen Ihr Ergebnis und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
      {luecke > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#FFF7F7",
              border: "1px solid #F2CFCF",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Monatliche Lücke</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#C0392B", letterSpacing: "-0.3px" }}>
              {Math.round(Math.abs(luecke)).toLocaleString("de-DE")} €
            </div>
          </div>
          <div
            style={{
              background: "rgba(31,41,55,0.03)",
              border: "1px solid rgba(31,41,55,0.08)",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Deckungsgrad</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>
              {deckung} %
            </div>
          </div>
        </div>
      )}
      <div style={{ border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left" }}>
        <div style={{ padding:"14px 16px",borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px" }}>Ihr Ansprechpartner</div>
          <div style={{ fontSize:"14px",fontWeight:"600",color:"#111" }}>{makler.name}</div>
          <div style={{ fontSize:"12px",color:"#888",marginTop:"1px" }}>{makler.firma}</div>
        </div>
        <div style={{ padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px" }}>
          <a href={`tel:${makler.telefon}`} style={{ fontSize:"13px",color:C,fontWeight:"500" }}>{makler.telefon}</a>
          <a href={`mailto:${makler.email}`} style={{ fontSize:"13px",color:C,fontWeight:"500" }}>{makler.email}</a>
        </div>
      </div>
      <button onClick={onBack} style={{ marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer" }}>Neue Berechnung starten</button>
    </div>
  );
}

export default function RentenRechner() {
  const MAKLER = useCheckConfig();
  const { isReady } = MAKLER;
  const C = MAKLER.primaryColor;
  const T = useMemo(() => makeRentenT(C), [C]);
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk]       = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName]   = useState("");
  const [fd, setFd]       = useState({ name: "", email: "", tel: "" });
  const [kontaktConsent, setKontaktConsent] = useState(false);

  const [p, setP] = useState({
    alter:       35,
    rentenAlter: 67,
    netto:       2800,
    zielProzent: 70,
    gesRente:    0,
    bav:         0,
    privat:      0,
    inflation:   false,
  });
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));

  const [scr, setScr] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rentenArchiv, setRentenArchiv] = useState(null);
  /** Intro, Alter, Rentenalter, Netto, Zeit-&-Einkommens-Story, Ziel, Vorsorge, Inflation → Loader → Bridge → Ergebnis */
  const TOTAL_SCR = 8;
  const slug = "vorsorge-check";
  const goTo   = (ph) => {
    setAk(k => k + 1);
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
  const nextScr = () => {
    if (scr < TOTAL_SCR) setScr((s) => s + 1);
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? undefined;
    if (!token) return;
    void trackEvent({ event_type: "check_started", slug, token, firma: MAKLER.firma });
  }, []);

  if (!isReady) return <CheckConfigLoadingShell />;

  const withStandalone = (el) => (
    <StandaloneWrapper makler={MAKLER}>{el}</StandaloneWrapper>
  );

  const R = berechne(p);

  if (danke) return withStandalone(
    <div className="check-root" style={{ ...T.page, "--accent": C }}>
      <Header makler={MAKLER} C={C} currentStep={RENTEN_HEADER_STEPS.length} showProgressBar={false} />
      <DankeScreen
        name={name}
        onBack={() => { setDanke(false); goTo(1); }}
        makler={MAKLER}
        C={C}
        luecke={R.lueckeHeute}
        deckung={R.deckung}
      />
    </div>
  );

  if (loading) {
    return withStandalone(
      <div className="check-root" style={{ ...T.page, "--accent": C }}>
        <Header makler={MAKLER} C={C} showProgressBar={false} />
        <CheckLoader type="rente" checkmarkColor={C} onComplete={() => { setLoading(false); goTo("bridge"); }} />
      </div>
    );
  }

  if (phase === "bridge")
    return withStandalone(
      <div className="check-root fade-in" style={{ ...T.page, "--accent": C }} key={ak}>
        <Header makler={MAKLER} C={C} showProgressBar={false} />
        <CheckKitStoryHero
          hideFooterSpacer
          emoji="🎯"
          title="Ihre Analyse ist bereit."
          text="Wir haben Ihre Vorsorgesituation vollständig berechnet."
        />
        <div style={{ padding: "8px 24px 0", ...CHECKKIT2026.storyContentWrap }}>
          {[
            `Monatliche Lücke: ${fmt(R.lueckeHeute > 0 ? R.lueckeHeute : 0)} ermittelt.`,
            `Deckungsgrad: ${R.deckung} % Ihrer Zielrente analysiert.`,
            `Strategieempfehlung für ${R.jahreBis} Jahre Ansparphase erstellt.`,
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

  // Phase 3: Kontakt
  if (phase === 3) {
    const valid = fd.name.trim() && fd.email.trim() && kontaktConsent;
    return withStandalone(
      <div className="check-root fade-in" style={{ ...T.page, "--accent": C }} key={ak}>
        <Header makler={MAKLER} C={C} currentStep={rentenHeaderStep(3, scr)} />
        <div style={T.hero}>
          <div style={T.eyebrow}>Fast geschafft</div>
          <div style={T.h1}>
            {R.lueckeHeute > 0
              ? `Lücke von ${fmt(R.lueckeHeute)} gemeinsam schließen.`
              : "Ihre Vorsorge gemeinsam optimieren."}
          </div>
          <div style={T.body}>
            Wir melden uns innerhalb von 24 Stunden mit konkreten Vorsorge-Empfehlungen.
          </div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{fmt(R.zielRentenNetto)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Zielrente Netto</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{R.deckung}%</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Deckungsgrad</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{R.jahreBis} J.</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>bis Rente</div>
            </div>
          </div>
          {isDemo ? (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.</div>
              <button type="button" style={{ ...T.btnPrim(false) }} onClick={() => window.parent.postMessage({ type: "openConfig", slug: "vorsorge-check" }, "*")}>Anpassen & kaufen</button>
            </div>
          ) : (
            <>
              <CheckKontaktLeadLine />
              <div style={T.card}>
                {[
                  { k: "name", l: "Ihr Name", t: "text", ph: "Vor- und Nachname", req: true },
                  { k: "email", l: "Ihre E-Mail", t: "email", ph: "ihre@email.de", req: true },
                  { k: "tel", l: "Ihre Nummer", t: "tel", ph: "Optional", req: false, hint: "Optional — für eine schnellere Rückmeldung" },
                ].map(({ k, l, t, ph, req, hint }, i, arr) => (
                  <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
                    <label style={T.fldLbl}>{l}{req ? " *" : ""}</label>
                    <input type={t} placeholder={ph} value={fd[k]} onChange={e => setFd(f => ({ ...f, [k]: e.target.value }))} style={{ ...T.inputEl, marginTop: "6px" }} />
                    {hint && <div style={T.fldHint}>{hint}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "14px" }}>
                <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
              </div>
            </>
          )}
        </div>
        {isDemo ? (
          <div style={T.footer} data-checkkit-footer><button type="button" style={T.btnSec} onClick={() => goTo(2)}>Zurück</button></div>
        ) : (
          <Footer
            onNext={async () => {
              if (!valid) return;
              const token = new URLSearchParams(window.location.search).get("token");
              if (token) {
                const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slug, kundenName: fd.name, kundenEmail: fd.email, kundenTel: fd.tel || "", highlights: [{ label: "Zielrente Netto", value: fmt(R.zielRentenNetto) }, { label: "Monatliche Lücke", value: fmt(R.lueckeHeute) }, { label: "Deckungsgrad", value: `${R.deckung}%` }, { label: "Bis Rente", value: `${R.jahreBis} J.` }] }) }).catch(() => null);
                if (res?.ok) void trackEvent({ event_type: "lead_submitted", slug, token, firma: MAKLER.firma });
              }
              setName(fd.name);
              setDanke(true);
            }}
            onBack={() => goTo(2)}
            label={valid ? "Vorsorge gemeinsam planen" : "Bitte füllen Sie alle Pflichtfelder aus"}
            disabled={!valid}
            T={T}
          />
        )}
      </div>
    );
  }

  // Phase 2: Ergebnis (BUKTG-Schema)
  if (phase === 2) {
    const lh = R.lueckeHeute;
    const statusPill =
      lh <= 0 ? (
        <div style={T.statusOk}>Ziel weitgehend erreicht</div>
      ) : lh > 300 ? (
        <div style={T.statusWarn}>Erheblicher Handlungsbedarf</div>
      ) : (
        <div style={T.statusInfo(C)}>Moderate Lücke — Nachsteuern lohnt sich</div>
      );

    const gutAufgestellt = lh <= 0 || R.deckung >= 90;

    const stratEmpfohlenBadge = {
      fontSize: "10px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: C,
      background: `color-mix(in srgb, ${C} 12%, white)`,
      border: `1px solid ${C}35`,
      borderRadius: "999px",
      padding: "3px 8px",
      flexShrink: 0,
    };
    const sparrateRenteVersicherung = Math.round(R.sparrateMonatlich * 1.15);

    return withStandalone(
      <div className="check-root fade-in" style={{ ...T.page, "--accent": C, background: "#ffffff" }} key={ak}>
        <Header makler={MAKLER} C={C} currentStep={rentenHeaderStep(2, scr)} />

        <div style={{ paddingBottom: "120px" }}>
          <div
            style={{
              ...T.resultHero,
              paddingTop: "36px",
              paddingBottom: "28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#ffffff",
            }}
          >
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Vorsorgesituation</div>
            <div className="check-result-hero-value" style={{ ...T.resultNumber(lh > 0), fontSize: "52px", textAlign: "center" }}>{lh > 0 ? fmt(lh) : fmt(0)}</div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>
              {p.inflation ? "mtl. Rentenlücke (Zielrente inkl. Inflationsaufschlag)" : "mtl. Lücke heute"}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{statusPill}</div>
          </div>

          <div style={T.section}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={T.kpiKontaktEu}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{fmt(R.zielRentenNetto)}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Zielrente Netto</div>
              </div>
              <div style={T.kpiKontaktEu}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{R.deckung}%</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Deckungsgrad</div>
              </div>
              <div style={T.kpiKontaktEu}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{R.jahreBis} J.</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>bis Rente</div>
              </div>
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Ihre Zielrente im Überblick</div>
            <div style={T.cardPrimary}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>100 % = Ihre Zielrente ({p.zielProzent} % Ihres heutigen Nettos)</span>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.3px", flexShrink: 0 }}>{fmt(R.zielRentenNetto)}/Mon.</span>
                </div>
                <div style={T.stackedBarOuter} aria-hidden>
                  {R.barStack.p1 > 0 && <div style={T.stackedBarSeg(R.barStack.p1, S1)} />}
                  {R.barStack.p2 > 0 && <div style={T.stackedBarSeg(R.barStack.p2, S2)} />}
                  {R.barStack.p3 > 0 && <div style={T.stackedBarSeg(R.barStack.p3, S3)} />}
                  {R.barStack.pGap > 0 && <div style={T.stackedBarSeg(R.barStack.pGap, GAP_BAR)} />}
                </div>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px 16px", fontSize: "11px", color: "#6B7280" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: S1, flexShrink: 0 }} />Gesetzliche Rente</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: S2, flexShrink: 0 }} />bAV / Riester</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: S3, flexShrink: 0 }} />Privat</span>
                  {R.barStack.pGap > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: GAP_BAR, border: "1px solid #FECACA", flexShrink: 0 }} />Lücke</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Strategien</div>
            <div style={{ ...T.compareGrid, alignItems: "stretch", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={T.compareCard} id="fonds">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", minWidth: 0 }}>
                          <span style={{ fontSize: "22px", lineHeight: 1 }} aria-hidden>📈</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <div style={{ ...T.compareCardTitle, marginBottom: 0 }}>Flexibel &amp; renditestark</div>
                              {R.strategieEmpfohlen === "fonds" ? <span style={stratEmpfohlenBadge}>Empfohlen</span> : null}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", marginTop: "6px" }}>Für alle mit langfristigem Horizont</div>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55, margin: 0 }}>
                        Kapitalaufbau über ETFs oder Investmentfonds — flexibel, renditestark, keine Bindung an einen Versicherer.
                      </p>
                      <div style={{ marginTop: "12px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                        Orientierungs-Sparrate: {fmt(R.sparrateMonatlich)}/Mon.
                      </div>
                      {R.lueckeHeute > 0 ? (
                        <div style={STRATEGIE_INFO_BLOCK}>
                          <span style={{ fontWeight: "600", color: "#4B5563" }}>💡 Benötigtes Kapital</span>
                          <div style={{ marginTop: "6px" }}>
                            Mann (20 J.): {fmt(R.kapitalbedarfMann)}
                            <br />
                            Frau (24 J.): {fmt(R.kapitalbedarfFrau)}
                          </div>
                        </div>
                      ) : null}
              </div>

              <div style={T.compareCard} id="rentenversicherung">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", minWidth: 0 }}>
                          <span style={{ fontSize: "22px", lineHeight: 1 }} aria-hidden>🛡️</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <div style={{ ...T.compareCardTitle, marginBottom: 0 }}>Sicher &amp; planbar</div>
                              {R.strategieEmpfohlen === "rente" ? <span style={stratEmpfohlenBadge}>Empfohlen</span> : null}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", marginTop: "6px" }}>Für alle die Planbarkeit über Rendite stellen</div>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55, margin: 0 }}>
                        Garantierte lebenslange Rente ab Renteneintritt — unabhängig davon wie alt Sie werden.
                      </p>
                      <div style={{ marginTop: "12px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                        Orientierungs-Sparrate: {fmt(sparrateRenteVersicherung)}/Mon.
                      </div>
                      {R.wartekosten > 0 && R.lueckeHeute > 0 ? (
                        <div style={STRATEGIE_INFO_BLOCK}>
                          <span style={{ fontWeight: "600", color: "#4B5563" }}>💡 Was 5 Jahre Warten kosten</span>
                          <div style={{ marginTop: "6px" }}>
                            Heute: {fmt(R.sparrateHeute)}/Mon.
                            <br />
                            In 5 Jahren: {fmt(R.sparrateIn5Jahren)}/Mon.
                            <br />
                            → {fmt(R.wartekosten)} mehr pro Monat
                          </div>
                        </div>
                      ) : null}
              </div>

              <div style={T.compareCard} id="kombination">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", minWidth: 0 }}>
                          <span style={{ fontSize: "22px", lineHeight: 1 }} aria-hidden>⚖️</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <div style={{ ...T.compareCardTitle, marginBottom: 0 }}>Sicherheit + Rendite</div>
                              {R.strategieEmpfohlen === "kombination" ? <span style={stratEmpfohlenBadge}>Empfohlen</span> : null}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", marginTop: "6px" }}>Für alle die beides wollen</div>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55, margin: 0 }}>
                        50&nbsp;% in Rentenversicherung für Sicherheit, 50&nbsp;% in Fonds für Rendite — die häufigste Empfehlung in der Beratung.
                      </p>
                      <div style={{ marginTop: "12px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                        Orientierungs-Sparrate: {fmt(R.sparrateMonatlich)}/Mon.
                      </div>
              </div>
            </div>
          </div>

          <div style={{ ...T.section, marginBottom: "16px" }}>
            <div style={T.sectionLbl}>Hinweise &amp; Details</div>

            <div className="renten-acc-item">
              <button
                type="button"
                className="renten-acc-btn"
                onClick={() => setRentenArchiv((x) => (x === "kapital" ? null : "kapital"))}
                aria-expanded={rentenArchiv === "kapital"}
              >
                <span>Kapitalbedarf (Orientierung)</span>
                <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{rentenArchiv === "kapital" ? "▲" : "▼"}</span>
              </button>
              {rentenArchiv === "kapital" && (
                <div className="renten-acc-panel" style={{ paddingTop: "12px" }}>
                  <p style={{ marginBottom: "10px", fontSize: "12px" }}>
                    Grobe Summe ohne Abzinsung: monatliche Lücke heute × 12 × statistische Rentenphase (20 bzw. 24 Jahre).
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    <div style={{ background: "rgba(31,41,55,0.04)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>Mann (20 J.)</div>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.4px" }}>{fmt(R.lueckeHeute * 12 * 20)}</div>
                    </div>
                    <div style={{ background: "rgba(31,41,55,0.04)", borderRadius: "10px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>Frau (24 J.)</div>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.4px" }}>{fmt(R.lueckeHeute * 12 * 24)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!gutAufgestellt && R.mehrKosten > 10 && (
              <div className="renten-acc-item">
                <button
                  type="button"
                  className="renten-acc-btn"
                  onClick={() => setRentenArchiv((x) => (x === "warten" ? null : "warten"))}
                  aria-expanded={rentenArchiv === "warten"}
                >
                  <span>Was 5 Jahre Warten kosten</span>
                  <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{rentenArchiv === "warten" ? "▲" : "▼"}</span>
                </button>
                {rentenArchiv === "warten" && (
                  <div className="renten-acc-panel" style={{ paddingTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                      <div style={{ background: "rgba(31,41,55,0.04)", borderRadius: "10px", padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#166534", letterSpacing: "-0.3px" }}>{fmt(R.rateA)}</div>
                        <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "3px" }}>Heute starten</div>
                      </div>
                      <div style={{ background: "rgba(31,41,55,0.04)", borderRadius: "10px", padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#B45309", letterSpacing: "-0.3px" }}>{fmt(R.rateA5)}</div>
                        <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "3px" }}>In 5 Jahren</div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px" }}>
                      Warten kostet <strong style={{ color: "#78350F" }}>{fmt(R.mehrKosten)}/Monat mehr</strong> — bei gleicher Zielrente.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="renten-acc-item">
              <button
                type="button"
                className="renten-acc-btn"
                onClick={() => setRentenArchiv((x) => (x === "calc" ? null : "calc"))}
                aria-expanded={rentenArchiv === "calc"}
              >
                <span>Wie berechnen wir das?</span>
                <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{rentenArchiv === "calc" ? "▲" : "▼"}</span>
              </button>
              {rentenArchiv === "calc" && (
                <div className="renten-acc-panel" style={{ paddingTop: "12px" }}>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Inflation:</strong>{" "}
                    {p.inflation
                      ? "Sie haben einen vereinfachten Aufschlag von +20 % auf die Zielrente gewählt — die monatliche Lücke ergibt sich aus dieser Planungs-Zielrente minus den angegebenen Leistungen."
                      : "Ohne Inflation gerechnet — Zielrente = Netto × gewählter Prozentsatz; die reale Kaufkraft kann im Alter geringer ausfallen als in heutigen Euro dargestellt."}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Steuer:</strong> Die Darstellung in Netto-Euro ersetzt keine steuerliche Beratung. Gesetzliche und private Renten können unterschiedlich zu versteuern sein.
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Formel:</strong> Zielbasis = Netto × {p.zielProzent} %. Bei Inflation: Zielrente netto = Zielbasis × 1,2 (gerundet). Gesetzliche Rente ohne eigene Angabe: Schätzwert ca. 45 % des Nettos. Monatliche Lücke = Zielrente netto − Summe aus gesetzlicher Rente (bzw. Schätzung), bAV/Riester und privater Vorsorge.
                    {p.inflation && R.zielRentenNetto !== R.zielBasis && (
                      <> Zielbasis {fmt(R.zielBasis)}/Mon. → mit Inflationsaufschlag Planungs-Zielrente {fmt(R.zielRentenNetto)}/Mon.</>
                    )}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Rentenbescheid:</strong> Unter{" "}
                    <a href="https://www.rentenauskunft.de" target="_blank" rel="noopener noreferrer" style={{ color: C, fontWeight: "600" }}>
                      rentenauskunft.de
                    </a>{" "}
                    oder im Online-Konto der Deutschen Rentenversicherung.
                  </p>
                  <p style={{ marginTop: "10px", marginBottom: 0, color: "#b8884a" }}>Grundlage u. a. § 64 SGB VI — keine Rechtsberatung.</p>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                fontSize: "11px",
                color: "#868686",
                lineHeight: 1.6,
                background: "#F7F6F3",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
              }}
            >
              {CHECK_LEGAL_DISCLAIMER_FOOTER}
            </div>
          </div>
        </div>

        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} label="Vorsorge prüfen lassen" T={T} />
      </div>
    );
  }

  // Phase 1: Intro + Daten + Story (Alter/Netto/Rentenalter) + … + Inflation → Loader → Bridge → Phase 2
  return withStandalone(
    <div className="check-root fade-in" style={{ ...T.page, "--accent": C }} key={ak}>
      <Header makler={MAKLER} C={C} currentStep={rentenHeaderStep(1, scr)} />

      {scr === 1 && (
        <>
          <CheckKitStoryHero emoji="⏳" title="Ihre Freiheit im Alter.">
            <p style={{ ...CHECKKIT2026.storyBody, whiteSpace: "pre-line" }}>
              {`Gut vorbereitet in den Ruhestand.\n\nBerechnen Sie jetzt Ihre persönliche Rentenlücke und sehen Sie, was Sie für Ihre Zukunft tun können.`}
            </p>
          </CheckKitStoryHero>
          <Footer onNext={nextScr} label="Analyse starten" T={T} />
        </>
      )}

      {scr === 2 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Vorsorge-Check · 2 / {TOTAL_SCR}</div>
            <div style={T.h1}>Wie alt sind Sie aktuell?</div>
            <div style={T.body}>Davon hängt ab, wie lange Sie noch für Ihre Rente ansparen können.</div>
          </div>
          <div style={T.section}>
            <SliderCard
              label="Ihr aktuelles Alter"
              value={p.alter}
              min={20}
              max={60}
              step={1}
              unit="Jahre"
              display={`noch ${R.jahreBis} Jahre bis zur Rente`}
              accent={C}
              onChange={(v) => set("alter", v)}
            />
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 3 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Vorsorge-Check · 3 / {TOTAL_SCR}</div>
            <div style={T.h1}>Wann möchten Sie in Rente gehen?</div>
            <div style={T.body}>Das gesetzliche Rentenalter ist 67 — bei früherem Rentenbeginn sind Abschläge möglich.</div>
          </div>
          <div style={T.section}>
            <SliderCard
              label="Gewünschtes Rentenalter"
              value={p.rentenAlter}
              min={60}
              max={70}
              step={1}
              unit="Jahre"
              display={
                p.rentenAlter < 67
                  ? `${67 - p.rentenAlter} Jahre vor gesetzlicher Rente`
                  : p.rentenAlter === 67
                    ? "Gesetzliches Rentenalter"
                    : `${p.rentenAlter - 67} Jahre nach gesetzlicher Rente`
              }
              accent={C}
              onChange={(v) => set("rentenAlter", v)}
            />
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 4 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Vorsorge-Check · 4 / {TOTAL_SCR}</div>
            <div style={T.h1}>Wie viel verdienen Sie aktuell netto im Monat?</div>
          </div>
          <div style={T.section}>
            <SliderCard label="Monatliches Nettoeinkommen" value={p.netto} min={1000} max={8000} step={100} unit="€/Mon" accent={C} onChange={(v) => set("netto", v)} />
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 5 && (() => {
        const s2 = rentenStoryZeitEinkommenCopy(p.alter, p.netto, p.rentenAlter);
        return (
        <>
          <CheckKitStoryHero emoji="📈" title={s2.title} text={s2.text} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
        );
      })()}

      {scr === 6 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Vorsorge-Check · 6 / {TOTAL_SCR}</div>
            <div style={T.h1}>Wie viel Rente möchten Sie später haben?</div>
            <div style={T.body}>Als Anteil Ihres heutigen Nettoeinkommens. Der übliche Anspruch liegt bei 70 %.</div>
          </div>
          <div style={T.section}>
            <div className="check-selection-grid check-options-grid" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { v: 60, l: "60 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.6)}/Monat · Basisversorgung` },
                { v: 70, l: "70 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.7)}/Monat · Typisches Ziel ★`, star: true },
                { v: 80, l: "80 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.8)}/Monat · Guter Lebensstandard` },
                { v: 90, l: "90 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.9)}/Monat · Voller Lebensstandard` },
              ].map(({ v, l, d }) => (
                <SelectionCard key={v} value={String(v)} label={l} description={d} selected={p.zielProzent === v} accent={C} onClick={() => set("zielProzent", v)} />
              ))}
            </div>
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                background: "rgba(31,41,55,0.04)",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Ihre Zielrente</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>
                {fmt(R.zielBasis)}/Mon.
              </div>
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 7 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Vorsorge-Check · 7 / {TOTAL_SCR}</div>
            <div style={T.h1}>Was haben Sie bereits für Ihre Rente angespart?</div>
            <div style={T.body}>Alle Felder sind optional — 0 €, wenn nichts vorhanden ist. Den genauen Betrag der gesetzlichen Rente entnehmen Sie Ihrem Rentenbescheid.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SliderCard
                label="Gesetzliche Rente (laut Bescheid)"
                value={p.gesRente}
                min={0}
                max={3000}
                step={50}
                unit="€/Mon"
                display={p.gesRente === 0 ? "Unbekannt — wird geschätzt (ca. 45 % Ihres Nettos)" : ""}
                accent={C}
                onChange={(v) => set("gesRente", v)}
                hint="0 €, wenn unbekannt — wir schätzen automatisch"
              />
              <SliderCard
                label="bAV / Riester"
                value={p.bav}
                min={0}
                max={1500}
                step={50}
                unit="€/Mon"
                display={p.bav === 0 ? "Nicht vorhanden" : ""}
                accent={C}
                onChange={(v) => set("bav", v)}
                hint="0 €, wenn kein Vertrag vorhanden ist"
              />
              <SliderCard
                label="Private Vorsorge"
                value={p.privat}
                min={0}
                max={2000}
                step={50}
                unit="€/Mon"
                display={p.privat === 0 ? "Nicht vorhanden" : ""}
                accent={C}
                onChange={(v) => set("privat", v)}
                hint="Private Rentenversicherung, Fondssparplan u. Ä."
              />
            </div>
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                background: R.deckung >= 90
                  ? "rgba(21,128,61,0.06)"
                  : R.deckung >= 60
                    ? `color-mix(in srgb, ${C} 6%, white)`
                    : "rgba(192,57,43,0.06)",
                border: `1px solid ${R.deckung >= 90 ? "#BBF7D0" : R.deckung >= 60 ? `${C}30` : "#F2D4D0"}`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "2px" }}>Aktuell gedeckt</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.4 }}>
                  {fmt(R.vorhanden)}/Mon. von {fmt(R.zielRentenNetto)}/Mon. Zielrente
                </div>
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: R.deckung >= 90 ? "#15803D" : R.deckung >= 60 ? C : "#C0392B",
                  letterSpacing: "-0.5px",
                  flexShrink: 0,
                }}
              >
                {R.deckung} %
              </div>
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 8 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Vorsorge-Check · 8 / {TOTAL_SCR}</div>
            <div style={T.h1}>Möchten Sie die Inflation berücksichtigen?</div>
            <div style={T.body}>Mit Inflation steigt die Zielrente um ca. 20 % — die Lücke wird daraus berechnet (näher an höherer Kaufkraftanforderung).</div>
          </div>
          <div style={T.section}>
            <div className="check-selection-grid check-options-grid" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { v: false, l: "Nein — einfach und direkt", d: "Zielrente und Lücke in heutigen Euro ohne Aufschlag (Standard)", emoji: "🎯" },
                { v: true, l: "Ja — realistischer", d: "Die Zielrente wird um ca. 20 % erhöht; die Lücke folgt daraus", emoji: "📈" },
              ].map(({ v, l, d, emoji }) => (
                <SelectionCard
                  key={String(v)}
                  value={String(v)}
                  label={l}
                  description={d}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                  selected={p.inflation === v}
                  accent={C}
                  onClick={() => set("inflation", v)}
                />
              ))}
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={() => setLoading(true)} onBack={backScr} label="Analyse starten" T={T} />
        </>
      )}
    </div>
  );
}
