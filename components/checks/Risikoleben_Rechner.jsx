import { useEffect, useState } from "react";
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
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";

(() => {
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
    html, body { height:100%; background:#fff; font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased; }
    button, input { font-family:inherit; cursor:pointer; border:none; background:none; }
    input { cursor:text; }
    ::-webkit-scrollbar { display:none; } * { scrollbar-width:none; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:none;} }
    .fade-in { animation:fadeIn 0.28s ease both; }
    button:active { opacity:0.75; }
    input:focus { outline:none; }
    input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:2px; border-radius:1px; background:#e5e5e5; cursor:pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:var(--accent, #1a3a5c); border:2px solid #fff; box-shadow:0 0 0 1px var(--accent, #1a3a5c); }
    a { text-decoration:none; }
    .rl-acc-item{border-radius:12px;background:#F9FAFB;border:1px solid rgba(17,24,39,0.06);margin-bottom:8px;overflow:hidden;}
    .rl-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;text-align:left;font-size:13px;font-weight:600;color:#1F2937;background:transparent;cursor:pointer;border:none;font-family:inherit;}
    .rl-acc-panel{padding:0 16px 14px;font-size:12px;color:#6B7280;line-height:1.65;border-top:1px solid rgba(17,24,39,0.06);}
  `;
  document.head.appendChild(s);
})();

const alpha = (hex,a) => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };
const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n>=10000 ? Math.round(n/1000)+".000 €" : fmt(n);
/** Intro + Familie + Kredit + Bedarfs-Story + 2 Datenschritte (ohne Bridge im Wizard) */
const RL_WIZARD_STEPS = 6;
/** scr 1–3: Familie/Intro; scr 4–6: Bedarf & Einnahmen */
const RL_HEADER_STEPS = ["Familie", "Bedarf", "Ergebnis", "Kontakt"];

function rlHeaderStep(phase, scr) {
  if (phase === 2) return 2;
  if (phase === 3) return 3;
  if (phase === 1) return (scr ?? 1) <= 3 ? 0 : 1;
  return 3;
}
/** Priorität: Restschuld → Kinder → Paar (ohne Kinder) — keine Bestattung/ErbSt */
function risikoStoryBedarfCopy(restschuld, familienModus) {
  const rs = Number(restschuld) || 0;
  const kinder =
    familienModus === "paar_mit_kinder" ||
    familienModus === "alleinerziehend" ||
    familienModus === "single_mit_kinder";
  const familiePaar = familienModus === "paar_ohne_kinder" || familienModus === "paar_mit_kinder";
  if (rs > 0) {
    const rsStr = `${Math.round(rs).toLocaleString("de-DE")} €`;
    return {
      title: "Das Heim absichern.",
      text: `Mit einer Restschuld von ${rsStr} ist die Tilgung das wichtigste Ziel. Wir sorgen dafür, dass Ihre Familie im Ernstfall schuldenfrei im gemeinsamen Zuhause wohnen bleiben kann.`,
    };
  }
  if (kinder) {
    return {
      title: "Zukunft der Kinder sichern.",
      text: "Von der Ausbildung bis zum Studium – wir kalkulieren das notwendige Kapital, damit Ihre Kinder trotz des Wegfalls Ihres Einkommens alle Chancen im Leben behalten.",
    };
  }
  if (familiePaar) {
    return {
      title: "Gemeinsamer Lebensstandard.",
      text: "Miete und Fixkosten laufen weiter. Wir berechnen jetzt, wie viel Kapital Ihr Partner benötigt, um den gewohnten Lebensstil ohne finanzielle Sorgen fortzuführen.",
    };
  }
  return {
    title: "Absicherung für Ihre Hinterbliebenen.",
    text: "Laufende Kosten gehen weiter. Wir berechnen jetzt, wie viel Kapital im Ernstfall vorgehalten werden sollte, damit Ihre Liebsten finanziell abgesichert sind.",
  };
}

const WARN_RL = "#c0392b";
const BAR_KREDIT = "#2563eb";

function RisikoHintCard({ children, icon = "💡", accent = "#2563eb" }) {
  return (
    <div
      style={{
        border: "1px solid rgba(17,24,39,0.08)",
        borderRadius: "16px",
        padding: "16px 18px",
        background: "#fff",
        boxShadow: "0 4px 16px rgba(17,24,39,0.06)",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "11px",
          background: `${accent}14`,
          border: `1px solid ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: "13px",
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function rlHatKinder(familienModus) {
  return (
    familienModus === "paar_mit_kinder" ||
    familienModus === "alleinerziehend" ||
    familienModus === "single_mit_kinder"
  );
}

// ─── BERECHNUNG: Witwen-/Waisenrente aus Familienmodus + Kinderanzahl, Versorgungsdauer vereinfacht ──
function berechne(p) {
  const hatKinder = rlHatKinder(p.familienModus);
  /**
   * GRV-Näherung: fachlich wäre GRV_ANTEIL = eigenes Netto × 0,45 — hier bewusst monatsBedarf × 0,45,
   * damit keine zusätzliche Wizard-Frage nötig ist. Familienbedarf ≠ Versicherten-Netto; der Makler kann im Gespräch korrigieren.
   */
  const nettoMonatlich = Math.max(0, p.monatsBedarf);
  const GRV_ANTEIL = nettoMonatlich * 0.45;
  const witwenrente = hatKinder ? GRV_ANTEIL * 0.55 : 0;
  const kinderZahl = hatKinder ? Math.min(Math.max(1, p.kinderAnzahl || 1), 3) : 0;
  const waisenrente = hatKinder ? kinderZahl * (GRV_ANTEIL * 0.1) : 0;
  const staatlicheLeistungen = witwenrente + waisenrente;
  const einnahmen = p.partnerEinkommen + witwenrente + waisenrente + p.sonstiges;
  const monatlLuecke = Math.max(
    0,
    p.monatsBedarf - p.partnerEinkommen - staatlicheLeistungen - p.sonstiges
  );
  /** Laufender monatlicher Familienbedarf ohne Kredit (Kredit geht in VS einmalig ein) */
  const familienbedarf = Math.max(0, p.monatsBedarf);
  const versorgungsjahre = hatKinder ? 20 : 10;
  const kapitalEinkommen = monatlLuecke * 12 * versorgungsjahre;
  const restschuld = p.kredite;
  const bestehendVS = p.vorhanden;
  const rohEmpfehlung = kapitalEinkommen + restschuld - bestehendVS;
  let empfohleneVS = Math.max(0, Math.round(rohEmpfehlung / 10000) * 10000);
  if (rohEmpfehlung > 0 && empfohleneVS === 0) empfohleneVS = 10000;
  const gesamt = kapitalEinkommen + restschuld;
  const netto = empfohleneVS;
  const gesamtBedarf = gesamt;
  const kapBedarf = kapitalEinkommen;
  const luecke = monatlLuecke;
  const bedarfKapital = kapitalEinkommen;
  const deckung = gesamt > 0 ? Math.min(100, Math.round((bestehendVS / gesamt) * 100)) : 100;
  /** Faustformel Ø ~2‰ VS/Jahr, vereinfacht gesamtBedarf×0,002/12, auf 5 € gerundet */
  const empfPraemie =
    luecke > 0 ? Math.max(10, Math.round((gesamtBedarf * 0.002 / 12) / 5) * 5) : 0;
  return {
    einnahmen,
    familienbedarf,
    luecke,
    bedarfKapital,
    gesamt,
    netto,
    gesamtBedarf,
    kapBedarf,
    deckung,
    empfPraemie,
    versorgungsjahre,
    kapitalEinkommen,
    staatlicheLeistungen,
    witwenrente,
    waisenrente,
    empfohleneVS,
    hatKinder,
    kinderZahl,
  };
}

export default function RisikolebenRechner() {
  const MAKLER = useCheckConfig();
  const { isReady } = MAKLER;
  const C = MAKLER.primaryColor;
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [p, setP] = useState({
    familienModus: "",
    monatsBedarf: 2500,
    kinderAnzahl: 1,
    partnerEinkommen: 1200,
    sonstiges: 0,
    kredite: 0,
    vorhanden: 0,
  });
  const [hatKredit, setHatKredit] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", telefon: "" });
  const [kontaktConsent, setKontaktConsent] = useState(false);
  const [scr, setScr] = useState(1);
  const [rlErgebnisAcc, setRlErgebnisAcc] = useState(null);
  const slug = "risikoleben";
  const goTo = (ph) => {
    setAnimKey((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setHatKredit(null);
      setKontaktConsent(false);
      setLoading(false);
      setRlErgebnisAcc(null);
      setP((x) => ({ ...x, familienModus: "" }));
    }
    if (ph === 2) {
      const t = new URLSearchParams(window.location.search).get("token") ?? undefined;
      if (t) void trackEvent({ event_type: "check_completed", slug, token: t, firma: MAKLER.firma });
    }
  };
  const nextScr = () => {
    if (scr === 2 && !p.familienModus) return;
    if (scr === 3 && hatKredit == null) return;
    if (scr < 6) setScr((s) => s + 1);
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  useCheckScrollToTop([phase, animKey, scr, loading, rlErgebnisAcc]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? undefined;
    if (!token) return;
    void trackEvent({ event_type: "check_started", slug, token, firma: MAKLER.firma });
  }, []);

  if (!isReady) return <CheckConfigLoadingShell />;

  const set     = (k, v) => setP(x => ({ ...x, [k]: v }));
  const R = berechne(p);

  function Header({ currentStep = 0, showProgressBar = true }) {
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
          <CheckHeaderPhoneButton telefon={MAKLER.telefon} primaryColor={C} />
        </div>
        {showProgressBar ? (
          <CheckProgressBar steps={RL_HEADER_STEPS} currentStep={currentStep} accent={C} />
        ) : null}
      </>
    );
  }

  const cardLift = {
    background: "#fff",
    borderRadius: "18px",
    border: "1px solid #e8e8e8",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  const T = {
    root: { minHeight: "100vh", background: "#fff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
    hero: { padding: "32px 24px 16px", textAlign: "center" },
    eyebrow: { fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", color: "#999", marginBottom: "6px" },
    h1: { fontSize: "22px", color: "#111", lineHeight: 1.25, ...CHECKKIT_HERO_TITLE_TYPO },
    lead: { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
    body: { paddingBottom: "120px" },
    card: { margin: "0 16px 10px", ...cardLift, overflow: "hidden" },
    secLbl: { fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", color: "#999", padding: "16px 24px 8px" },
    fldLbl: { display: "block", fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "8px" },
    fldVal: { fontSize: "21px", fontWeight: "700", color: C, letterSpacing: "-0.4px", marginBottom: "6px" },
    fldHint: { fontSize: "11px", color: "#aaa", marginTop: "4px" },
    fldWrap: { marginBottom: "20px" },
    footer: { position: "sticky", bottom: 0, background: "#ffffff", borderTop: "1px solid rgba(31,41,55,0.06)", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
    btnMain: (d) => ({
      width: "100%",
      padding: "13px 20px",
      background: d ? "#e8e8e8" : C,
      color: d ? "#aaa" : "#fff",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: d ? "default" : "pointer",
      letterSpacing: "-0.1px",
      boxShadow: d ? "none" : "0 8px 20px rgba(26,58,92,0.18)",
    }),
    btnBack: { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
    iLabel:  { display:"block", fontSize:"12px", fontWeight:"600", color:"#444", marginBottom:"6px" },
    input:   { width:"100%", padding:"10px 12px", border:"1px solid #e8e8e8", borderRadius:"6px", fontSize:"14px", color:"#111", background:"#fff", outline:"none" },
    iWrap:   { marginBottom:"14px" },
    resultHero: { padding:"52px 24px 40px", textAlign:"center", background:"#fff" },
    resultEyebrow: { fontSize:"12px", fontWeight:"500", color:"#9CA3AF", letterSpacing:"0.2px", marginBottom:"14px" },
    resultNumber: (warn) => ({ fontSize:"52px", fontWeight:"800", color:warn?"#C0392B":C, letterSpacing:"-2.5px", lineHeight:1, marginBottom:"8px" }),
    resultUnit: { fontSize:"14px", color:"#9CA3AF", marginBottom:"18px" },
    resultSub: { fontSize:"13px", color:"#9CA3AF", lineHeight:1.55, marginTop:"12px" },
    statusOk: { display:"inline-flex", alignItems:"center", gap:"5px", padding:"5px 13px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"999px", fontSize:"12px", fontWeight:"600", color:"#15803D" },
    statusMitte: { display:"inline-flex", alignItems:"center", gap:"5px", padding:"5px 13px", background:"#FFFBEB", border:"1px solid #FCD34D", borderRadius:"999px", fontSize:"12px", fontWeight:"600", color:"#B45309" },
    statusWarn: { display:"inline-flex", alignItems:"center", gap:"5px", padding:"5px 13px", background:"#FFF6F5", border:"1px solid #F2D4D0", borderRadius:"999px", fontSize:"12px", fontWeight:"600", color:"#C0392B" },
    cardPrimary: { border:"1px solid rgba(17,24,39,0.08)", borderRadius:"20px", overflow:"hidden", background:"#FFFFFF", boxShadow:"0 6px 24px rgba(17,24,39,0.08)" },
    cardContext: { background:"#FAFAF8", border:"1px solid rgba(17,24,39,0.05)", borderRadius:"16px", padding:"18px 20px" },
    warnCard: { background:"#FFF6F5", border:"1px solid #F2D4D0", borderLeft:"3px solid #C0392B", borderRadius:"14px", padding:"18px 20px" },
    warnCardTitle: { fontSize:"13px", fontWeight:"700", color:"#C0392B", marginBottom:"6px" },
    warnCardText: { fontSize:"13px", color:"#7B2A2A", lineHeight:1.65 },
    sectionLbl: { fontSize:"13px", fontWeight:"600", color:"#6B7280", marginBottom:"12px", padding:0 },
    dataCard: { margin:"0 16px 10px", background:"#FAFAF8", border:"1px solid rgba(17,24,39,0.05)", borderRadius:"16px" },
    dataRow: { padding:"12px 18px", borderBottom:"1px solid rgba(17,24,39,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" },
    dataRowLast: { padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" },
    dataLabel: { fontSize:"13px", color:"#6B7280" },
    dataValue: { fontSize:"14px", fontWeight:"600", color:"#1F2937", letterSpacing:"-0.2px" },
    section: { padding: "0 24px", marginBottom: "20px" },
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
    divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
    compareGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px" },
    compareCard: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", padding: "16px 18px", background: "#fff", boxShadow: "0 4px 16px rgba(17,24,39,0.06)", minWidth: 0 },
    compareCardTitle: { fontSize: "14px", fontWeight: "700", color: "#1F2937", marginBottom: "10px", letterSpacing: "-0.2px" },
    compareBullet: { fontSize: "12px", color: "#4B5563", lineHeight: 1.5, marginBottom: "6px", paddingLeft: "14px", position: "relative" },
    formCard: { border: "1px solid #e8e8e8", borderRadius: "18px", overflow: "hidden" },
    row: { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
    rowLast: { padding: "14px 16px" },
    inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
    fldLblForm: { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "0", display: "block" },
    fldHintForm: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
    infoBox: {
      padding: "12px 14px",
      background: "#F6F8FE",
      border: "1px solid #DCE6FF",
      borderRadius: "14px",
      fontSize: "12px",
      color: "#315AA8",
      lineHeight: 1.6,
    },
  };

  const Shell = ({ eyebrow, title, lead, children, footer, headerStep = 0, hideHeaderProgress = false }) => (
    <div className="check-root" style={T.root}>
      <Header currentStep={headerStep} showProgressBar={!hideHeaderProgress} />
      <div key={animKey} className="fade-in" style={T.body}>
        <div style={T.hero}>{eyebrow&&<div style={T.eyebrow}>{eyebrow}</div>}{title&&<h1 style={T.h1}>{title}</h1>}{lead&&<p style={T.lead}>{lead}</p>}</div>
        {children}
      </div>
      {footer&&<div style={T.footer} data-checkkit-footer>{footer}</div>}
    </div>
  );

  const withStandalone = (el) => (
    <StandaloneWrapper makler={MAKLER}>{el}</StandaloneWrapper>
  );

  if (loading) {
    return withStandalone(
      <div className="check-root" style={T.root}>
        <Header showProgressBar={false} />
        <CheckLoader type="risikoleben" checkmarkColor={C} onComplete={() => { setLoading(false); goTo("bridge"); }} />
      </div>
    );
  }

  if (phase === "bridge")
    return withStandalone(
      <div className="check-root" style={T.root}>
        <Header showProgressBar={false} />
        <div key={animKey} className="fade-in" style={T.body}>
          <CheckKitStoryHero
            hideFooterSpacer
            emoji="🎯"
            title="Ihre Sicherheits-Zahl steht."
            text="Wir haben Ihren Absicherungsbedarf vollständig berechnet."
          />
          <div style={{ padding: "0 24px 8px", ...CHECKKIT2026.storyContentWrap }}>
            {[
              `Kapitalbedarf: ${fmtK(R.gesamt)} über ${R.versorgungsjahre} Jahre ermittelt.`,
              R.luecke > 0
                ? `Monatliche Lücke: ${fmt(R.luecke)}/Mon. berücksichtigt.`
                : "Laufende Einnahmen vollständig berücksichtigt.",
              p.kredite > 0
                ? `Restschuld von ${fmtK(p.kredite)} eingerechnet.`
                : "Optimale Absicherungsstrategie berechnet.",
            ].map((line) => (
              <div
                key={line}
                style={{
                  ...CHECKKIT2026.storyBody,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  marginBottom: 16,
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
        </div>
        <div style={T.footer} data-checkkit-footer>
          <button type="button" style={T.btnMain(false)} onClick={() => goTo(2)}>
            Ergebnis ansehen
          </button>
          <button type="button" style={T.btnBack} onClick={() => goTo(1)}>
            Neu berechnen
          </button>
        </div>
      </div>
    );

  // ── Phase 1: Story + Eingabe (6 Schritte) → Loader → Bridge ───────────────
  if (phase === 1) {
    const dataTitle =
      scr === 2 ? "Wie ist Ihre familiäre Situation?" :
      scr === 3 ? "Kredite und Restschuld" :
      scr === 5 ? "Bedarf der Familie" :
      scr === 6 ? "Welche Einnahmen bestehen bereits?" : "";
    const dataLead =
      scr === 2 ? "Darauf stützen wir den nächsten Schritt — Ihre Absicherung soll zur Lebensrealität passen." :
      scr === 3 ? "Bitte geben Sie an, ob Darlehen bestehen. Die Restschuld tragen Sie nur ein, wenn Sie „Ja“ wählen." :
      scr === 5 ? "Monatlicher Bedarf der Familie — die Versorgungsdauer leiten wir aus Ihrer Situation ab." :
      scr === 6 ? "Alle Felder sind optional — 0, wenn nicht vorhanden." : "";

    const wizFooter = (() => {
      if (scr === 1) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" style={T.btnMain(false)} onClick={nextScr}>
              Analyse starten
            </button>
          </div>
        );
      }
      if (scr === 2) {
        const block = !p.familienModus;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" style={T.btnMain(block)} disabled={block} onClick={nextScr}>
              Weiter →
            </button>
            <button type="button" style={T.btnBack} onClick={backScr}>
              Zurück
            </button>
          </div>
        );
      }
      if (scr === 3) {
        const kreditBlock = hatKredit == null;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" style={T.btnMain(kreditBlock)} disabled={kreditBlock} onClick={nextScr}>
              Weiter →
            </button>
            <button type="button" style={T.btnBack} onClick={backScr}>
              Zurück
            </button>
          </div>
        );
      }
      if (scr >= 4 && scr <= 5) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" style={T.btnMain(false)} onClick={nextScr}>
              Weiter →
            </button>
            <button type="button" style={T.btnBack} onClick={backScr}>
              Zurück
            </button>
          </div>
        );
      }
      if (scr === 6) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" style={T.btnMain(false)} onClick={() => setLoading(true)}>
              Analyse starten
            </button>
            <button type="button" style={T.btnBack} onClick={backScr}>
              Zurück
            </button>
          </div>
        );
      }
      return null;
    })();

    return withStandalone(
      <div className="check-root" style={T.root}>
        <Header currentStep={rlHeaderStep(1, scr)} />
        <div key={animKey} className="fade-in" style={T.body}>
          {scr === 1 && (
            <CheckKitStoryHero
              emoji="❤️"
              title="Verantwortung, die bleibt."
              text="Niemand spricht gerne darüber, aber jeder möchte seine Liebsten in Sicherheit wissen. Wir berechnen in 2 Minuten, wie viel Kapital Ihre Familie wirklich braucht, um finanziell unabhängig zu bleiben."
            />
          )}

          {((scr >= 2 && scr <= 3) || (scr >= 5 && scr <= 6)) && (
            <div style={T.hero}>
              <div style={T.eyebrow}>
                Risikoleben-Check · Schritt {scr} von {RL_WIZARD_STEPS}
              </div>
              <h1 style={T.h1}>{dataTitle}</h1>
              <p style={T.lead}>{dataLead}</p>
            </div>
          )}

          {scr === 4 && (() => {
            const s2 = risikoStoryBedarfCopy(p.kredite, p.familienModus);
            return <CheckKitStoryHero emoji="🏠" title={s2.title} text={s2.text} />;
          })()}

          {((scr >= 2 && scr <= 3) || scr === 5 || scr === 6) && (
            <div style={{ padding: "0 24px 8px" }}>
              {scr === 2 && (
                <div className="check-selection-grid check-options-grid" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { id: "paar_ohne_kinder", label: "Paar ohne Kinder", desc: "Partnerschaft, keine minderjährigen Kinder im Haushalt." },
                    { id: "paar_mit_kinder", label: "Paar mit Kindern", desc: "Partnerschaft mit Kindern — Bildung und Versorgung im Fokus." },
                    { id: "alleinerziehend", label: "Alleinerziehend", desc: "Sie tragen die Hauptverantwortung für die Kinder." },
                    { id: "single_mit_kinder", label: "Single mit Kindern", desc: "Allein mit Kindern im Haushalt." },
                  ].map(({ id, label, desc }) => (
                    <SelectionCard
                      key={id}
                      value={id}
                      label={label}
                      description={desc}
                      selected={p.familienModus === id}
                      accent={C}
                      onClick={() => set("familienModus", id)}
                    />
                  ))}
                </div>
              )}

              {scr === 3 && (
                <>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "10px" }}>
                    Haben Sie laufende Kredite oder Immobilien-Darlehen?
                  </div>
                  <div
                    className="check-selection-grid check-options-grid"
                    style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: hatKredit === true ? "8px" : "12px" }}
                  >
                    <SelectionCard
                      value="ja"
                      label="Ja"
                      description="Ich habe laufende Kredite oder ein Immobilien-Darlehen."
                      icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>🏦</span>}
                      selected={hatKredit === true}
                      accent={C}
                      onClick={() => setHatKredit(true)}
                    />
                    <SelectionCard
                      value="nein"
                      label="Nein"
                      description="Derzeit keine Darlehen — die Berechnung setzt die Restschuld auf 0 €."
                      icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>—</span>}
                      selected={hatKredit === false}
                      accent={C}
                      onClick={() => {
                        setHatKredit(false);
                        set("kredite", 0);
                      }}
                    />
                  </div>
                  {hatKredit === true && (
                    <SliderCard
                      label="Restschuld (gesamt)"
                      value={p.kredite}
                      min={0}
                      max={800000}
                      step={5000}
                      unit="€"
                      display={p.kredite === 0 ? "0 €" : `${Math.round(p.kredite).toLocaleString("de-DE")} €`}
                      accent={C}
                      onChange={(v) => set("kredite", v)}
                    />
                  )}
                </>
              )}

              {scr === 5 && (
                <>
                  <SliderCard
                    label="Monatlicher Bedarf der Familie"
                    value={p.monatsBedarf}
                    min={500}
                    max={8000}
                    step={100}
                    unit="€/Mon."
                    display={`${p.monatsBedarf.toLocaleString("de-DE")} €/Monat`}
                    accent={C}
                    onChange={(v) => set("monatsBedarf", v)}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px", marginBottom: "8px" }}>
                    {[
                      { icon: "🏠", label: "Miete / Kredit", desc: "Warmmiete oder Kreditrate inkl. Nebenkosten" },
                      { icon: "🛒", label: "Lebenshaltung", desc: "Lebensmittel, Mobilität, Freizeit, Versicherungen" },
                      { icon: "👶", label: "Kinder", desc: "Betreuung, Schule, Sport, Kleidung" },
                    ].map(({ icon, label, desc }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          padding: "10px 12px",
                          background: "#FAFAF8",
                          borderRadius: "10px",
                          border: "1px solid rgba(17,24,39,0.05)",
                        }}
                      >
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#1F2937" }}>{label}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {rlHatKinder(p.familienModus) ? (
                    <SliderCard
                      label="Anzahl Kinder (für Waisenrente-Schätzung, max. 3)"
                      value={p.kinderAnzahl}
                      min={1}
                      max={3}
                      step={1}
                      unit=""
                      display={`${p.kinderAnzahl} ${p.kinderAnzahl === 1 ? "Kind" : "Kinder"}`}
                      accent={C}
                      onChange={(v) => set("kinderAnzahl", v)}
                    />
                  ) : null}
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 14px",
                      background: "#F0F9FF",
                      borderRadius: "10px",
                      border: "1px solid #BAE6FD",
                      fontSize: "12px",
                      color: "#0369A1",
                      lineHeight: 1.55,
                    }}
                  >
                    {rlHatKinder(p.familienModus)
                      ? "Mit Kindern: Wir rechnen mit großer Witwenrente und Waisenrente (Schätzung) sowie 20 Jahren Versorgungsdauer."
                      : "Ohne Kinder: Kleine Witwenrente (24 Monate) fließt nicht als langfristige Absicherung ein — 10 Jahre Orientierung für die Kapitalisierung."}
                  </div>
                </>
              )}

              {scr === 6 && (
                <>
                  <SliderCard
                    label="Partnereinkommen (monatlich netto)"
                    value={p.partnerEinkommen}
                    min={0}
                    max={6000}
                    step={100}
                    unit="€/Mon."
                    display={p.partnerEinkommen === 0 ? "Kein Einkommen" : undefined}
                    hint="Nettoeinkommen nach Steuern und Abgaben"
                    accent={C}
                    onChange={(v) => set("partnerEinkommen", v)}
                  />
                  <div style={{ ...T.infoBox, marginBottom: "14px" }}>
                    <strong style={{ color: "#315AA8" }}>Witwen- und Waisenrente</strong>
                    <span style={{ display: "block", marginTop: "6px" }}>
                      Diese Beträge schätzen wir automatisch aus Ihrem Familienmodus und dem monatlichen Familienbedarf. Dafür nutzen
                      wir eine vereinfachte Rentengröße (ca. 45 % dieses Betrags): präziser wäre Ihr eigenes Nettoeinkommen — das
                      fragen wir hier nicht extra ab. Weicht Ihr Einkommen stark vom Bedarf ab, ist das ein erster Orientierungswert;
                      Ihr Makler kann die Schätzung im Beratungsgespräch anpassen.
                    </span>
                  </div>
                  <SliderCard
                    label="Sonstige Einnahmen (monatlich)"
                    value={p.sonstiges}
                    min={0}
                    max={2000}
                    step={50}
                    unit="€/Mon."
                    display={p.sonstiges === 0 ? "Keine weiteren Einnahmen" : undefined}
                    hint="Mieteinnahmen, Kapitalerträge etc."
                    accent={C}
                    onChange={(v) => set("sonstiges", v)}
                  />
                  <SliderCard
                    label="Bestehende Risikolebensversicherung"
                    value={p.vorhanden}
                    min={0}
                    max={1000000}
                    step={10000}
                    unit="€"
                    display={p.vorhanden === 0 ? "Nicht vorhanden" : `${Math.round(p.vorhanden).toLocaleString("de-DE")} €`}
                    hint="Versicherungssumme bestehender Policen — 0, wenn keine vorhanden"
                    accent={C}
                    onChange={(v) => set("vorhanden", v)}
                  />
                </>
              )}
            </div>
          )}
        </div>
        <div style={T.footer} data-checkkit-footer>{wizFooter}</div>
      </div>
    );
  }

  // ── Phase 2: Ergebnis (Hero + KPI + Einnahmen + Accordion) ──
  if (phase === 2) {
    const {
      einnahmen,
      familienbedarf,
      luecke,
      netto,
      versorgungsjahre,
      kapitalEinkommen,
      staatlicheLeistungen,
      witwenrente,
      waisenrente,
      empfohleneVS,
    } = R;
    const gedeckt = netto <= 0;

    const pillRl = gedeckt ? (
      <div style={T.statusOk}>Modell: keine zusätzliche Summe nötig</div>
    ) : netto >= 350000 ? (
      <div style={T.statusWarn}>Sehr hoher Kapitalbedarf</div>
    ) : netto >= 120000 ? (
      <div style={T.statusMitte}>Erheblicher Bedarf — Beratung sinnvoll</div>
    ) : (
      <div style={T.statusOk}>Orientierungswert auf Basis Ihrer Angaben</div>
    );

    const breakdownRows = [
      { l: "Monatsbedarf Familie", v: fmt(p.monatsBedarf) + "/Mon.", c: "#1F2937", bold: false },
      { l: "Partnereinkommen (netto)", v: "− " + fmt(p.partnerEinkommen) + "/Mon.", c: "#059669", bold: false },
      {
        l: "Staatliche Leistungen (geschätzt)",
        v: "− " + fmt(staatlicheLeistungen) + "/Mon.",
        c: "#059669",
        bold: false,
      },
      ...(p.sonstiges > 0
        ? [{ l: "Sonstige Einnahmen", v: "− " + fmt(p.sonstiges) + "/Mon.", c: "#059669", bold: false }]
        : []),
      {
        l: "Summe laufende Einnahmen",
        v: "− " + fmt(einnahmen) + "/Mon.",
        c: "#047857",
        bold: false,
        border: false,
      },
      {
        l: "Einkommenslücke / Monat",
        v: fmt(luecke) + "/Mon.",
        c: luecke > 0 ? WARN_RL : "#059669",
        bold: true,
        border: true,
      },
      { l: "Versorgungsdauer", v: `${versorgungsjahre} Jahre`, c: "#374151", bold: false },
      { l: "Kapitalbedarf Einkommen", v: fmtK(kapitalEinkommen), c: "#1F2937", bold: false },
      { l: "Kredite & Restschuld", v: p.kredite > 0 ? "+ " + fmtK(p.kredite) : "0 €", c: "#1F2937", bold: false },
      ...(p.vorhanden > 0
        ? [{ l: "Bereits abgesichert", v: "− " + fmtK(p.vorhanden), c: "#059669", bold: false }]
        : []),
      {
        l: "Empfohlene Versicherungssumme",
        v: fmtK(empfohleneVS),
        c: gedeckt ? "#059669" : C,
        bold: true,
        border: true,
      },
    ];

    return withStandalone(
      <Shell
        headerStep={rlHeaderStep(2, scr)}
        eyebrow={undefined}
        title={undefined}
        lead={undefined}
        footer={
          <>
            <button type="button" style={T.btnMain(false)} onClick={() => goTo(3)}>Weiter →</button>
            <button style={T.btnBack} onClick={() => goTo(1)}>Neue Berechnung starten</button>
          </>
        }
      >

        <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={T.resultEyebrow}>Ihre Risikoleben-Analyse</div>
          <div
            className="check-result-hero-value"
            style={{ ...T.resultNumber(!gedeckt), textAlign: "center", width: "100%" }}
          >
            {gedeckt ? "Gedeckt" : fmtK(netto)}
          </div>
          <div style={{ ...T.resultUnit, textAlign: "center" }}>
            {gedeckt ? "kein wesentlicher Absicherungsbedarf im Modell" : "empfohlene Versicherungssumme (netto)"}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", marginTop: "6px" }}>{pillRl}</div>
          <div style={{ ...T.resultSub, textAlign: "center", marginTop: "4px", maxWidth: "36ch" }}>
            {versorgungsjahre} Jahre Versorgungsdauer · vereinfachte Berechnung
          </div>
        </div>

        <div style={T.section}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{fmt(familienbedarf)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatl. Ziel</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{fmt(einnahmen)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Einnahmen</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: luecke > 0 ? WARN_RL : "#059669", letterSpacing: "-0.5px" }}>{fmt(luecke)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatl. Lücke</div>
            </div>
          </div>
          <div
            style={{
              marginTop: "12px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#F9FAFB",
              border: "1px solid rgba(17,24,39,0.06)",
              fontSize: "12px",
              color: "#6B7280",
              lineHeight: 1.55,
            }}
          >
            <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "8px" }}>
              Berücksichtigte Einnahmen (monatlich)
            </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <span>Partnereinkommen (netto)</span>
                <span style={{ fontWeight: "600", color: "#1F2937", flexShrink: 0 }}>{fmt(p.partnerEinkommen)}/Mon.</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <span>Witwenrente (geschätzt)</span>
                <span style={{ fontWeight: "600", color: "#1F2937", flexShrink: 0 }}>{fmt(witwenrente)}/Mon.</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <span>Waisenrente (geschätzt)</span>
                <span style={{ fontWeight: "600", color: "#1F2937", flexShrink: 0 }}>{fmt(waisenrente)}/Mon.</span>
              </div>
              {p.sonstiges > 0 ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <span>Sonstige Einnahmen</span>
                  <span style={{ fontWeight: "600", color: "#1F2937", flexShrink: 0 }}>{fmt(p.sonstiges)}/Mon.</span>
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "4px",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(17,24,39,0.06)",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                <span>Summe</span>
                <span style={{ flexShrink: 0 }}>{fmt(einnahmen)}/Mon.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "16px" }}>
          <div style={T.sectionLbl}>Details zur Berechnung</div>
          <div className="rl-acc-item">
            <button
              type="button"
              className="rl-acc-btn"
              onClick={() => setRlErgebnisAcc((x) => (x === "details" ? null : "details"))}
              aria-expanded={rlErgebnisAcc === "details"}
            >
              <span>Bedarfsrechnung &amp; Details</span>
              <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{rlErgebnisAcc === "details" ? "▲" : "▼"}</span>
            </button>
            {rlErgebnisAcc === "details" && (
              <div className="rl-acc-panel" style={{ paddingTop: "12px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <RisikoHintCard icon="📊" accent={C}>
                    <strong style={{ fontWeight: 700 }}>Monatliche Versorgungslücke</strong>
                    <span style={{ display: "block", marginTop: "8px" }}>
                      {fmt(luecke)} pro Monat — über {versorgungsjahre} Jahre entspricht das rund {fmtK(kapitalEinkommen)} Kapitalbedarf fürs Einkommen (ohne Kredit).
                    </span>
                  </RisikoHintCard>
                  <RisikoHintCard icon={p.kredite > 0 ? "🏦" : "🛡️"} accent={p.kredite > 0 ? BAR_KREDIT : C}>
                    <strong style={{ fontWeight: 700 }}>{p.kredite > 0 ? "Restschuld & Strategie" : "Konstant vs. fallend"}</strong>
                    <span style={{ display: "block", marginTop: "8px" }}>
                      {p.kredite > 0
                        ? `Einmalig ${fmtK(p.kredite)} tilgen — häufig sinnvoll: fallende Summe parallel zur Restschuld; für Lebensstandard zusätzlich konstante Absicherung prüfen.`
                        : "Konstante Summe schützt den Lebensstandard über die Laufzeit. Fallende Summe ist günstiger, wenn der Schwerpunkt auf der Kredittilgung liegt."}
                    </span>
                  </RisikoHintCard>
                </div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>Rechenweg</div>
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(17,24,39,0.08)", marginBottom: "16px" }}>
                  {breakdownRows.map((row, i, arr) => (
                    <div
                      key={i}
                      style={{
                        padding: row.border ? "14px 16px" : "10px 16px",
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: row.border ? "#FAFAF8" : "#fff",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: row.bold ? "600" : "400" }}>{row.l}</div>
                      <div style={{ fontSize: row.bold ? "15px" : "13px", fontWeight: "700", color: row.c, letterSpacing: "-0.3px", marginLeft: "12px", flexShrink: 0 }}>{row.v}</div>
                    </div>
                  ))}
                </div>
                <p style={{ marginBottom: "10px", fontSize: "12px", color: "#6B7280", lineHeight: 1.65 }}>
                  Miete, Kredit und Lebenshaltung laufen weiter. Ohne Ihr Einkommen bleibt eine Lücke von {fmt(luecke)} monatlich — kapitalisiert über {versorgungsjahre} Jahre: {fmtK(kapitalEinkommen)}.
                  {p.kredite > 0 && <> Zusätzlich einmalig {fmtK(p.kredite)} für Darlehen.</>}
                </p>
                <p style={{ marginBottom: "10px", fontSize: "12px", color: "#6B7280", lineHeight: 1.65 }}>
                  <strong style={{ color: "#374151" }}>Staatliche Leistungen im Modell:</strong> Witwenrente {fmt(witwenrente)}/Mon., Waisenrente {fmt(waisenrente)}/Mon. — Summe {fmt(staatlicheLeistungen)}/Mon. Die zugrunde liegende GRV-Schätzung
                  verwendet den monatlichen Familienbedarf × 0,45 statt Ihres persönlichen Nettoeinkommens (bewusste Vereinfachung ohne
                  zusätzliche Eingabe).
                </p>
                {p.vorhanden > 0 && (
                  <p style={{ marginBottom: "10px", fontSize: "12px", color: "#15803D", lineHeight: 1.55 }}>
                    Bestehende Absicherung {fmtK(p.vorhanden)} ist in der Summe berücksichtigt.
                  </p>
                )}
                <p style={{ marginBottom: "10px", fontSize: "12px", color: "#6B7280", lineHeight: 1.55 }}>
                  <strong style={{ color: "#374151" }}>Einnahmen im Modell:</strong> Partnereinkommen {fmt(p.partnerEinkommen)}/Mon., staatliche Leistungen {fmt(staatlicheLeistungen)}/Mon.
                  {p.sonstiges > 0 ? <>, sonstige Einnahmen {fmt(p.sonstiges)}/Mon.</> : null} — Summe {fmt(einnahmen)}/Mon.
                </p>
                <p style={{ marginBottom: "10px", fontSize: "12px", color: "#6B7280", lineHeight: 1.65 }}>
                  <strong style={{ color: "#374151" }}>Nächste Schritte:</strong> Empfohlene Versicherungssumme (auf 10.000 € gerundet) {fmtK(empfohleneVS)} — Versorgungsdauer {versorgungsjahre} Jahre im Modell; bestehende Policen mit der Situation abgleichen.
                </p>
                <div style={{ ...T.warnCard, marginBottom: "14px", padding: "14px 16px" }}>
                  <div style={T.warnCardTitle}>Was oft unterschätzt wird</div>
                  <div style={{ fontSize: "12px", color: "#7B2A2A", lineHeight: 1.6, marginTop: "6px" }}>
                    Der überlebende Partner muss oft beruflich kürzertreten — die Modellrechnung geht von laufenden Familienkosten aus.
                  </div>
                </div>
                <CheckBerechnungshinweis>
                  <>
                    Wir berechnen Ihre Einkommenslücke aus dem Unterschied zwischen dem, was Ihre Familie monatlich braucht, und
                    dem, was durch staatliche Leistungen (Witwen- und Waisenrente) sowie Partnergehalt bereits gedeckt ist.
                    Mit Kindern: große Witwenrente (55 % einer grob geschätzten GRV-Rente) plus 10 % Waisenrente pro Kind
                    (max. drei) — dauerhaft. Ohne Kinder: kleine Witwenrente läuft nach 24 Monaten aus — daher nicht als
                    langfristige Absicherung einkalkuliert. Dazu kommen bestehende Kredite, die abgesichert werden sollten.
                    <span style={{ display: "block", marginTop: "10px" }}>
                      Für die Rentenschätzung nutzen wir den Familienbedarf (× 0,45) statt eines separaten Feldes „Ihr Netto“ —
                      das ist bewusst einfach gehalten und gut genug für die erste Orientierung, wenn Bedarf und Einkommen nicht weit
                      auseinanderliegen. Weicht Ihr Einkommen stark ab, kann Ihr Makler die Annahmen im Gespräch präzisieren.
                    </span>
                    Alle Werte sind Richtwerte — sprechen Sie mit Ihrem Makler für ein konkretes Angebot.
                  </>
                </CheckBerechnungshinweis>
                <div
                  style={{
                    marginTop: "14px",
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
            )}
          </div>
        </div>

      </Shell>
    );
  }

  if (phase === 3) {
    const valid = formData.name.trim() && formData.email.trim() && kontaktConsent;
    return withStandalone(
      <Shell
        headerStep={rlHeaderStep(3, scr)}
        eyebrow="Fast geschafft"
        title={R.netto > 0 ? `Summe von ${fmtK(R.netto)} absichern.` : "Ihre Absicherung besprechen."}
        lead="Wir melden uns innerhalb von 24 Stunden mit konkreten Tarifen für Ihre Situation."
        footer={
          isDemo ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                style={T.btnMain(false)}
                onClick={() =>
                  window.parent.postMessage(
                    { type: "openConfig", slug: "risikoleben" },
                    "*",
                  )
                }
              >
                Anpassen & kaufen
              </button>
              <button type="button" style={T.btnBack} onClick={() => goTo(2)}>Zurück</button>
            </div>
          ) : (
            <>
              <button
                style={T.btnMain(!valid)}
                disabled={!valid}
                onClick={async () => {
                  if (!valid) return;
                  const token = new URLSearchParams(window.location.search).get("token");
                  if (token) {
                    const { luecke, netto, gesamt, empfPraemie, versorgungsjahre } = R;
                    const summe = netto > 0 ? netto : gesamt;
                    const highlights = [
                      { label: "Empfohlene Vers.-Summe", value: fmtK(summe) },
                      { label: "Versorgungsdauer", value: `${versorgungsjahre} Jahre` },
                      { label: "Monatliche Lücke", value: `${fmt(luecke)}/Mon.` },
                    ];
                    if (p.vorhanden > 0) highlights.push({ label: "Bestehende Absicherung", value: fmtK(p.vorhanden) });
                    if (empfPraemie > 0) highlights.push({ label: "Schätz-Prämie", value: `ca. ${fmt(empfPraemie)}/Mon.` });
                    const res = await fetch("/api/lead", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        token,
                        slug,
                        kundenName: formData.name,
                        kundenEmail: formData.email,
                        kundenTel: formData.telefon || "",
                        highlights,
                      }),
                    }).catch(() => null);
                    if (res?.ok) void trackEvent({ event_type: "lead_submitted", slug, token, firma: MAKLER.firma });
                  }
                  goTo(4);
                }}
              >
                {valid ? "Weiter →" : "Bitte füllen Sie alle Pflichtfelder aus"}
              </button>
              <button style={T.btnBack} onClick={() => goTo(2)}>Zurück</button>
            </>
          )
        }
      >
        <div style={{ ...T.section, paddingBottom: "8px" }}>
          {!isDemo && (
            <div style={{ ...T.infoBox, marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: C, marginBottom: "8px" }}>Ihre Berechnung</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Absicherungsbedarf</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: WARN_RL, letterSpacing: "-0.5px" }}>{fmtK(R.netto > 0 ? R.netto : R.gesamt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Versorgungsdauer</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{R.versorgungsjahre} Jahre</div>
                </div>
              </div>
            </div>
          )}
          {isDemo ? (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px", lineHeight: 1.5 }}>
                Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.
              </div>
            </div>
          ) : (
            <>
              <CheckKontaktLeadLine />
              <div style={T.formCard}>
                {[
                  { k: "name", l: "Ihr Name", t: "text", ph: "Vor- und Nachname", req: true },
                  { k: "email", l: "Ihre E-Mail", t: "email", ph: "ihre@email.de", req: true },
                  { k: "telefon", l: "Ihre Nummer", t: "tel", ph: "Optional", req: false, hint: "Optional — für eine schnellere Rückmeldung" },
                ].map(({ k, l, t, ph, req, hint }, i, arr) => (
                  <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
                    <label style={T.fldLblForm}>
                      {l}
                      {req ? " *" : ""}
                    </label>
                    <input
                      type={t}
                      placeholder={ph}
                      value={formData[k]}
                      onChange={(e) => setFormData((f) => ({ ...f, [k]: e.target.value }))}
                      style={{ ...T.inputEl, marginTop: "6px" }}
                    />
                    {hint && <div style={T.fldHintForm}>{hint}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "14px", marginBottom: "100px" }}>
                <CheckKontaktBeforeSubmitBlock
                  maklerName={MAKLER.name}
                  consent={kontaktConsent}
                  onConsentChange={setKontaktConsent}
                />
              </div>
            </>
          )}
        </div>
      </Shell>
    );
  }

  return withStandalone(
    <Shell headerStep={RL_HEADER_STEPS.length}>
      <div style={{ padding: "48px 24px 0", textAlign: "center" }} className="fade-in">
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: `1.5px solid ${C}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111", letterSpacing: "-0.4px", margin: "0 0 8px", lineHeight: 1.25 }}>
          {formData.name ? `Vielen Dank, ${formData.name.split(" ")[0]}.` : "Vielen Dank für Ihre Anfrage."}
        </h1>
        <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, marginBottom: "32px" }}>
          Wir kontaktieren Sie innerhalb von 24 Stunden mit konkreten nächsten Schritten.
        </div>
      </div>
      <div style={{ padding: "0 24px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{
            background: "#FFF7F7",
            border: "1px solid #F2CFCF",
            borderRadius: "12px",
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Versicherungssumme</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: WARN_RL, letterSpacing: "-0.3px" }}>
              {fmtK(R.netto > 0 ? R.netto : R.gesamt)}
            </div>
          </div>
          <div style={{
            background: "rgba(31,41,55,0.03)",
            border: "1px solid rgba(31,41,55,0.08)",
            borderRadius: "12px",
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Versorgungsdauer</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>
              {R.versorgungsjahre} Jahre
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 24px 0" }}>
        <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden", textAlign: "left" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", color: "#999", marginBottom: "5px" }}>Ihr Berater</div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#111" }}>{MAKLER.name}</div>
            <div style={{ fontSize: "13px", color: "#888" }}>{MAKLER.firma}</div>
          </div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <a href={`tel:${MAKLER.telefon}`} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: C, fontWeight: "500" }}>
              <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: alpha(C, 0.08), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📞</span>
              {MAKLER.telefon}
            </a>
            <a href={`mailto:${MAKLER.email}`} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: C, fontWeight: "500" }}>
              <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: alpha(C, 0.08), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✉️</span>
              {MAKLER.email}
            </a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px", paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))" }}>
        <button type="button" onClick={() => goTo(1)} style={{ fontSize: "13px", color: "#aaa", cursor: "pointer", background: "none", border: "none" }}>
          Neuen Check starten
        </button>
      </div>
    </Shell>
  );
}
