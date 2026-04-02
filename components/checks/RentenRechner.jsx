import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CheckConfigLoadingShell } from "@/components/checks/CheckConfigLoadingShell";
import { StandaloneWrapper } from "@/components/checks/StandaloneWrapper";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { fmtK } from "@/lib/utils";
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

/** Grobe Steuer-Orientierung für Strategie-Karte „Steuerfokus“ (keine Steuerberatung) */
const RENTEN_STEUER_ABZUG_SATZ = 0.32;

function berechne({ alter, rentenAlter, netto, zielProzent, gesRente, bav, privat, inflation }) {
  const jahreBis  = Math.max(1, rentenAlter - alter);
  const lebenserw = 87;
  const renteDauer = Math.max(1, lebenserw - rentenAlter);
  const zielHeute  = Math.round(netto * (zielProzent / 100));

  // Gesetzliche Rente: wenn 0 angegeben → ~45 % des Nettos schätzen
  const gesRenteEff = gesRente > 0 ? gesRente : Math.round(netto * 0.45);
  const vorhanden   = gesRenteEff + bav + privat;
  const luecke      = Math.max(0, zielHeute - vorhanden);
  // Inflationsoption: einfacher +20%-Aufschlag
  const lueckeAdjusted = inflation ? Math.round(luecke * 1.2) : luecke;
  const deckung    = zielHeute > 0 ? Math.min(100, Math.round((vorhanden / zielHeute) * 100)) : 100;

  const schichten = [
    { label: "Gesetzliche Rente",    sub: "Schicht 1 · GRV",   farbe: S1, betrag: gesRenteEff, anteil: zielHeute > 0 ? Math.min(100, Math.round((gesRenteEff / zielHeute) * 100)) : 0 },
    { label: "Betrieblich / Riester", sub: "Schicht 2 · bAV",  farbe: S2, betrag: bav,        anteil: zielHeute > 0 ? Math.min(100, Math.round((bav / zielHeute) * 100)) : 0 },
    { label: "Private Vorsorge",      sub: "Schicht 3 · privat", farbe: S3, betrag: privat,   anteil: zielHeute > 0 ? Math.min(100, Math.round((privat / zielHeute) * 100)) : 0 },
  ];

  /** Horizontale Balken-Segmente: S1–S3 als Anteil der Zielrente, Rest bis 100 % = Lücke (#FEE2E2) */
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let pGap = 0;
  if (zielHeute > 0) {
    p1 = (gesRenteEff / zielHeute) * 100;
    p2 = (bav / zielHeute) * 100;
    p3 = (privat / zielHeute) * 100;
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

  /** Brutto-Rate (Orientierung) wie Wartekosten-Heute; Netto nach Steuerförderung */
  const rateSteuerBrutto = kapOrientWarte > 0 ? rateA : luecke > 0 ? Math.max(50, Math.round(luecke * 0.35)) : 0;
  const stVorteil = Math.round(rateSteuerBrutto * 12 * RENTEN_STEUER_ABZUG_SATZ);
  const nettoA = Math.round(rateSteuerBrutto * (1 - RENTEN_STEUER_ABZUG_SATZ));

  /** Kapitalziel (Orientierung): Lücke × 12 × 20 J. — wie Kapitalbedarf-Karte */
  const kapitalBedarf = Math.round(Math.max(0, luecke) * 12 * 20);
  /** Grobe Jahre, die ein dem „privat“-Einkommen zugeordneter Depot-Richtwert die Lücke decken würde */
  let depotLeer = 0;
  if (luecke > 0) {
    const depotSchaetz = privat * 12 * 20;
    depotLeer = Math.round(depotSchaetz / (luecke * 12));
    depotLeer = Math.max(0, Math.min(99, depotLeer));
  }

  /** Hybrid (50/50): gleiche Gesamtsparrate wie Kapitalaufbau — aufgeteilt Rente vs. Fonds */
  const rateC = rateA;

  return {
    jahreBis,
    renteDauer,
    zielHeute,
    vorhanden,
    luecke,
    /** Monatliche Lücke in heutiger Kaufkraft (ohne Inflations-Aufschlag) — entspricht dem Gap-Balken */
    lueckeHeute: luecke,
    lueckeAdjusted,
    deckung,
    schichten,
    gesRenteEff,
    barStack: { p1, p2, p3, pGap },
    rateA,
    rateA5,
    mehrKosten,
    stVorteil,
    nettoA,
    kapitalBedarf,
    depotLeer,
    rateC,
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
  hero:    { padding: "32px 24px 16px" },
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
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(31,41,55,0.06)", boxShadow: "0 -6px 20px rgba(17,24,39,0.05)", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
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
    /** Nur für Ergebnis-Strategie „Steuerfokus“ (Selbst vs. sonst); kein eigener Wizard-Schritt */
    beruf:       "angestellt",
  });
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));

  const [scr, setScr] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rentenArchiv, setRentenArchiv] = useState(null);
  /** Strategie-Karten: Details-Accordion — nur Hybrid standardmäßig aufgeklappt */
  const [stratAccOpen, setStratAccOpen] = useState({ hybrid: true, steuer: false, etf: false });
  const toggleStratAcc = (k) => setStratAccOpen((s) => ({ ...s, [k]: !s[k] }));
  /** Intro, Alter, Rentenalter, Netto, Zeit-&-Einkommens-Story, Ziel, Vorsorge, Inflation → Loader → Bridge → Ergebnis */
  const TOTAL_SCR = 8;
  const slug = "vorsorge-check";
  const goTo   = (ph) => {
    setAk(k => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setLoading(false);
      setStratAccOpen({ hybrid: true, steuer: false, etf: false });
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
    <StandaloneWrapper makler={MAKLER} checkLabel="Vorsorge-Check">{el}</StandaloneWrapper>
  );

  const R = berechne(p);

  if (danke) return withStandalone(
    <div style={{ ...T.page, "--accent": C }}>
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
      <div style={{ ...T.page, "--accent": C }}>
        <Header makler={MAKLER} C={C} showProgressBar={false} />
        <CheckLoader type="rente" checkmarkColor={C} onComplete={() => { setLoading(false); goTo("bridge"); }} />
      </div>
    );
  }

  if (phase === "bridge")
    return withStandalone(
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
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
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
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
            <div style={T.kpiKontaktLuecke}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: WARN, letterSpacing: "-0.5px" }}>{fmt(R.lueckeAdjusted)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatliche Lücke</div>
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
                const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slug, kundenName: fd.name, kundenEmail: fd.email, kundenTel: fd.tel || "", highlights: [{ label: "Monatliche Lücke", value: fmt(R.lueckeAdjusted) }, { label: "Deckungsgrad", value: `${R.deckung}%` }, { label: "Bis Rente", value: `${R.jahreBis} J.` }] }) }).catch(() => null);
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

    return withStandalone(
      <div style={{ ...T.page, "--accent": C, background: "#ffffff" }} key={ak} className="fade-in">
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
            <div style={{ ...T.resultNumber(lh > 0), fontSize: "52px", textAlign: "center" }}>{lh > 0 ? fmt(lh) : fmt(0)}</div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>mtl. Lücke heute</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{statusPill}</div>
          </div>

          <div style={T.section}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={T.kpiKontaktLuecke}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: WARN, letterSpacing: "-0.5px" }}>{fmt(R.lueckeAdjusted)}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatliche Lücke</div>
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
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.3px", flexShrink: 0 }}>{fmt(R.zielHeute)}/Mon.</span>
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
            <div style={{ ...T.compareGrid, alignItems: "stretch" }}>
              <div style={T.compareCard} id="hybrid">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                  <div style={T.compareCardTitle}>Hybrid — Rente &amp; Fonds</div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: C,
                      background: `color-mix(in srgb, ${C} 12%, white)`,
                      border: `1px solid ${C}35`,
                      borderRadius: "999px",
                      padding: "3px 8px",
                    }}
                  >
                    Empfohlen
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.45, margin: 0 }}>
                  Rente + Fonds kombiniert — Förderung und Rendite ausgewogen.
                </p>
                <div style={{ marginTop: "10px", borderRadius: "12px", border: "1px solid rgba(17,24,39,0.08)", overflow: "hidden", background: "#FAFAFA" }}>
                  <button
                    type="button"
                    aria-expanded={stratAccOpen.hybrid}
                    onClick={() => toggleStratAcc("hybrid")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      background: "#F3F4F6",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span>Pro, Contra &amp; Einordnung</span>
                    <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{stratAccOpen.hybrid ? "▲" : "▼"}</span>
                  </button>
                  {stratAccOpen.hybrid ? (
                    <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(17,24,39,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ padding: "10px", background: "#F0FDF4", borderRadius: "8px", fontSize: "11px", color: "#166534", lineHeight: 1.45 }}>
                          <strong>Pro</strong>
                          <div style={{ marginTop: "4px" }}>Diversifikation über garantierte und renditeorientierte Bausteine; oft gute Mischung für lange Laufzeiten</div>
                        </div>
                        <div style={{ padding: "10px", background: "#FFF7F7", borderRadius: "8px", fontSize: "11px", color: "#991B1B", lineHeight: 1.45 }}>
                          <strong>Contra</strong>
                          <div style={{ marginTop: "4px" }}>Zwei Welten zu betreuen; weder volle Steuerlogik noch reine ETF-Einfachheit</div>
                        </div>
                      </div>
                      {R.lueckeHeute > 0 && R.rateC > 0 ? (
                        <div
                          style={{
                            padding: "8px 10px",
                            background: `color-mix(in srgb, ${C} 6%, white)`,
                            borderRadius: "10px",
                            border: `1px solid ${C}30`,
                            fontSize: "12px",
                            color: C,
                            fontWeight: "600",
                          }}
                        >
                          {fmt(R.rateC / 2)}/Mon. Rente
                          &nbsp;+&nbsp;{fmt(R.rateC / 2)}/Mon. Fonds
                        </div>
                      ) : null}
                      <div style={{ paddingTop: "10px", borderTop: "1px solid rgba(17,24,39,0.06)" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#6B7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: "4px",
                          }}
                        >
                          Für wen
                        </div>
                        <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.5 }}>
                          Die meisten Vorsorge-Suchenden mit mittlerem Risiko — wenn weder „nur Rente“ noch „nur Depot“ zum Bauchgefühl passt.
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={T.compareCard} id="steuer">
                <div style={T.compareCardTitle}>Steuerfokus (Rürup / bAV)</div>
                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.45, margin: 0 }}>
                  Steuerlich gefördert — Nettorate oft geringer als die Sparrate.
                </p>
                <div style={{ marginTop: "10px", borderRadius: "12px", border: "1px solid rgba(17,24,39,0.08)", overflow: "hidden", background: "#FAFAFA" }}>
                  <button
                    type="button"
                    aria-expanded={stratAccOpen.steuer}
                    onClick={() => toggleStratAcc("steuer")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      background: "#F3F4F6",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span>Pro, Contra &amp; Einordnung</span>
                    <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{stratAccOpen.steuer ? "▲" : "▼"}</span>
                  </button>
                  {stratAccOpen.steuer ? (
                    <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(17,24,39,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ padding: "10px", background: "#F0FDF4", borderRadius: "8px", fontSize: "11px", color: "#166534", lineHeight: 1.45 }}>
                          <strong>Pro</strong>
                          <div style={{ marginTop: "4px" }}>Abzugsfähige Beiträge, oft attraktiv bei hohem Grenzsteuersatz</div>
                        </div>
                        <div style={{ padding: "10px", background: "#FFF7F7", borderRadius: "8px", fontSize: "11px", color: "#991B1B", lineHeight: 1.45 }}>
                          <strong>Contra</strong>
                          <div style={{ marginTop: "4px" }}>Auszahlung später in der Regel steuerpflichtig; Kapital oft langfristig gebunden</div>
                        </div>
                      </div>
                      {R.lueckeHeute > 0 && R.nettoA > 0 ? (
                        p.beruf === "selbst" ? (
                          <div
                            style={{
                              padding: "8px 10px",
                              background: "#F6FCF7",
                              borderRadius: "10px",
                              border: "1px solid #CBE9D4",
                              fontSize: "12px",
                              color: "#237446",
                              fontWeight: "600",
                            }}
                          >
                            Steuerersparnis ca. {fmt(R.stVorteil)}/Jahr → Nettorate nur {fmt(R.nettoA)}/Mon.
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px 10px",
                              background: "#F6FCF7",
                              borderRadius: "10px",
                              border: "1px solid #CBE9D4",
                              fontSize: "12px",
                              color: "#237446",
                              fontWeight: "600",
                            }}
                          >
                            Mit Steuerförderung: ca. {fmt(R.nettoA)}/Mon. netto
                          </div>
                        )
                      ) : null}
                      <div style={{ paddingTop: "10px", borderTop: "1px solid rgba(17,24,39,0.06)" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#6B7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: "4px",
                          }}
                        >
                          Für wen
                        </div>
                        <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.5 }}>
                          Selbstständige, Freiberufler und Gutverdiener — wenn die monatliche Beitragszahlung zur Liquidität passt.
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={T.compareCard} id="etf">
                <div style={T.compareCardTitle}>ETF &amp; Fonds (Aktienquote)</div>
                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.45, margin: 0 }}>
                  Breit gestreut, flexibel — mit Kursschwankungen unterwegs.
                </p>
                <div style={{ marginTop: "10px", borderRadius: "12px", border: "1px solid rgba(17,24,39,0.08)", overflow: "hidden", background: "#FAFAFA" }}>
                  <button
                    type="button"
                    aria-expanded={stratAccOpen.etf}
                    onClick={() => toggleStratAcc("etf")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      background: "#F3F4F6",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span>Pro, Contra &amp; Einordnung</span>
                    <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{stratAccOpen.etf ? "▲" : "▼"}</span>
                  </button>
                  {stratAccOpen.etf ? (
                    <div style={{ padding: "12px 14px 14px", borderTop: "1px solid rgba(17,24,39,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ padding: "10px", background: "#F0FDF4", borderRadius: "8px", fontSize: "11px", color: "#166534", lineHeight: 1.45 }}>
                          <strong>Pro</strong>
                          <div style={{ marginTop: "4px" }}>Oft geringe Kosten, weltweite Streuung, flexibel verfügbar je nach Vertrag</div>
                        </div>
                        <div style={{ padding: "10px", background: "#FFF7F7", borderRadius: "8px", fontSize: "11px", color: "#991B1B", lineHeight: 1.45 }}>
                          <strong>Contra</strong>
                          <div style={{ marginTop: "4px" }}>Kursschwankungen; Rendite unsicher — nicht als alleinige Absicherung der Lücke gedacht</div>
                        </div>
                      </div>
                      {R.lueckeHeute > 0 ? (
                        <div
                          style={{
                            padding: "8px 10px",
                            background: "#F6F8FE",
                            borderRadius: "10px",
                            border: "1px solid #DCE6FF",
                            fontSize: "12px",
                            color: "#315AA8",
                          }}
                        >
                          Kapitalziel: <strong>{fmtK(R.kapitalBedarf)}</strong>
                          &nbsp;· Depot reicht ca.{" "}
                          <strong>{R.depotLeer} Jahre</strong>
                        </div>
                      ) : null}
                      <div style={{ paddingTop: "10px", borderTop: "1px solid rgba(17,24,39,0.06)" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#6B7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: "4px",
                          }}
                        >
                          Für wen
                        </div>
                        <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.5 }}>
                          Anleger mit langem Horizont und Risikotoleranz — gut kombinierbar mit Absicherung und steuerlich geförderten Produkten.
                        </div>
                      </div>
                    </div>
                  ) : null}
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
                      ? "Sie haben einen vereinfachten Aufschlag von +20 % auf die monatliche Lücke gewählt — als grobe Annäherung an höhere Kaufkraftanforderungen im Alter."
                      : "Ohne Inflation gerechnet — die reale Kaufkraft Ihrer Rente kann im Alter geringer ausfallen als in heutigen Euro dargestellt."}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Steuer:</strong> Die Darstellung in Netto-Euro ersetzt keine steuerliche Beratung. Gesetzliche und private Renten können unterschiedlich zu versteuern sein.
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Formel:</strong> Zielrente = Netto × {p.zielProzent} %. Gesetzliche Rente ohne eigene Angabe: Schätzwert ca. 45 % des Nettos. Monatliche Lücke heute = Zielrente − Summe aus gesetzlicher Rente (bzw. Schätzung), bAV/Riester und privater Vorsorge.
                    {p.inflation && R.lueckeAdjusted !== R.lueckeHeute && (
                      <> Für Planungszwecke zusätzlich angezeigt: Lücke mit Inflationsfaktor ca. {fmt(R.lueckeAdjusted)} / Monat.</>
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
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header makler={MAKLER} C={C} currentStep={rentenHeaderStep(1, scr)} />

      {scr === 1 && (
        <>
          <CheckKitStoryHero
            emoji="⏳"
            title="Ihre Freiheit im Alter."
            text="Wie viel ist Ihr Geld in 20 oder 30 Jahren noch wert? Wir berechnen in 2 Minuten Ihre reale Kaufkraft und zeigen Ihnen, wie Sie Ihren Lebensstandard sicher halten."
          />
          <Footer onNext={nextScr} label="Analyse starten" T={T} />
        </>
      )}

      {scr === 2 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
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
          <div style={{ ...T.hero, textAlign: "center" }}>
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
          <div style={{ ...T.hero, textAlign: "center" }}>
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
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Vorsorge-Check · 6 / {TOTAL_SCR}</div>
            <div style={T.h1}>Wie viel Rente möchten Sie später haben?</div>
            <div style={T.body}>Als Anteil Ihres heutigen Nettoeinkommens. Der übliche Anspruch liegt bei 70 %.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                {fmt(R.zielHeute)}/Mon.
              </div>
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 7 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
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
                  {fmt(R.vorhanden)}/Mon. von {fmt(R.zielHeute)}/Mon. Zielrente
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
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Vorsorge-Check · 8 / {TOTAL_SCR}</div>
            <div style={T.h1}>Möchten Sie die Inflation berücksichtigen?</div>
            <div style={T.body}>Mit Inflation wirkt Ihre Lücke höher — dafür näher an der künftigen Kaufkraft.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { v: false, l: "Nein — einfach und direkt", d: "Die Lücke wird in heutigen Euro berechnet (Standard)", emoji: "🎯" },
                { v: true, l: "Ja — realistischer", d: "Die Lücke wird um ca. 20 % Inflationsaufschlag erhöht", emoji: "📈" },
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
