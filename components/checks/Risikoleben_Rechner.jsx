import { useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";

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
/** Intro + Familie + Kredit + Bedarfs-Story + 2 Datenschritte + Bridge */
const RL_WIZARD_STEPS = 7;
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

function risikoBridgeSicherheitCopy(nettoEinkommen, laufzeitJahre) {
  const nettoStr = `${Math.round(Number(nettoEinkommen)).toLocaleString("de-DE")} €`;
  return {
    title: "Ihre Sicherheits-Zahl steht.",
    text: `Um Ihr monatliches Netto von ${nettoStr} über die nächsten ${laufzeitJahre} Jahre abzusichern, haben wir die optimale Versicherungssumme ermittelt.`,
  };
}
const WARN_RL = "#c0392b";
const BAR_KREDIT = "#2563eb";

function RisikoHintCard({ children, icon = "💡", accent = "#2563eb" }) {
  const a = accent;
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "16px 18px",
        borderRadius: "16px",
        background: `linear-gradient(135deg, ${a}0a 0%, ${a}14 100%)`,
        border: `1px solid ${a}33`,
        boxShadow: `0 4px 14px ${a}14`,
        minWidth: 0,
        fontSize: "13px",
        color: "#374151",
        lineHeight: 1.55,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }} aria-hidden>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

// ─── BERECHNUNG (vereinfacht) ─────────────────────────────────────────────────
function berechne({ monatsBedarf, laufzeit, partnerEinkommen, witwenRente, sonstiges, kredite, vorhanden }) {
  const einnahmen = partnerEinkommen + witwenRente + sonstiges;
  const luecke = Math.max(0, monatsBedarf - einnahmen);
  const bedarfKapital = luecke * 12 * laufzeit;
  const gesamt = bedarfKapital + kredite;
  const netto = Math.max(0, gesamt - vorhanden);
  const gesamtBedarf = gesamt;
  const kapBedarf = bedarfKapital;
  const deckung = gesamt > 0 ? Math.min(100, Math.round((vorhanden / gesamt) * 100)) : 100;
  /** Faustformel Ø ~2‰ VS/Jahr, vereinfacht gesamtBedarf×0,002/12, auf 5 € gerundet */
  const empfPraemie =
    luecke > 0 ? Math.max(10, Math.round((gesamtBedarf * 0.002 / 12) / 5) * 5) : 0;
  return {
    einnahmen,
    luecke,
    bedarfKapital,
    gesamt,
    netto,
    gesamtBedarf,
    kapBedarf,
    deckung,
    empfPraemie,
  };
}

export default function RisikolebenRechner() {
  const MAKLER = useCheckConfig();
  const C = MAKLER.primaryColor;
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [p, setP] = useState({
    familienModus: "",
    monatsBedarf: 2500,
    laufzeit: 20,
    partnerEinkommen: 1200,
    witwenRente: 700,
    sonstiges: 0,
    kredite: 0,
    vorhanden: 0,
  });
  const [hatKredit, setHatKredit] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", telefon: "" });
  const [kontaktConsent, setKontaktConsent] = useState(false);
  const [scr, setScr] = useState(1);
  const [rlErgebnisAcc, setRlErgebnisAcc] = useState(null);
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
  };
  const nextScr = () => {
    if (scr === 2 && !p.familienModus) return;
    if (scr === 3 && hatKredit == null) return;
    if (scr < 7) setScr((s) => s + 1);
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  useCheckScrollToTop([phase, animKey, scr, loading, rlErgebnisAcc]);
  const set     = (k, v) => setP(x => ({ ...x, [k]: v }));
  const R       = berechne(p);
  const progPct = phase === 1 ? (scr / RL_WIZARD_STEPS) * 100 : { 2: 100, 3: 100, 4: 100 }[phase] || 0;

  function Header({ phase: ph, total }) {
    const pct = total > 0 ? (ph / total) * 100 : 0;
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
        <div style={{ height: "6px", background: "rgba(31,41,55,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: C,
              borderRadius: "999px",
              transition: "width 0.35s ease",
            }}
          />
        </div>
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
    hero: { padding: "32px 24px 16px" },
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
    footer: { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(31,41,55,0.06)", boxShadow: "0 -6px 20px rgba(17,24,39,0.05)", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
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

  const Shell = ({ eyebrow, title, lead, children, footer }) => (
    <div style={T.root}>
      <Header phase={progPct} total={100} />
      <div key={animKey} className="fade-in" style={T.body}>
        <div style={T.hero}>{eyebrow&&<div style={T.eyebrow}>{eyebrow}</div>}{title&&<h1 style={T.h1}>{title}</h1>}{lead&&<p style={T.lead}>{lead}</p>}</div>
        {children}
      </div>
      {footer&&<div style={T.footer}>{footer}</div>}
    </div>
  );

  if (loading) {
    return (
      <div style={T.root}>
        <Header phase={progPct} total={100} />
        <CheckLoader type="risikoleben" checkmarkColor={C} onComplete={() => { setLoading(false); goTo(2); }} />
      </div>
    );
  }

  // ── Phase 1: Story + Eingabe (7 Schritte) + Bridge ───────────────────────
  if (phase === 1) {
    const dataTitle =
      scr === 2 ? "Wie ist Ihre familiäre Situation?" :
      scr === 3 ? "Kredite und Restschuld" :
      scr === 5 ? "Bedarf und Absicherungsdauer" :
      scr === 6 ? "Welche Einnahmen bestehen bereits?" : "";
    const dataLead =
      scr === 2 ? "Darauf stützen wir den nächsten Schritt — Ihre Absicherung soll zur Lebensrealität passen." :
      scr === 3 ? "Bitte geben Sie an, ob Darlehen bestehen. Die Restschuld tragen Sie nur ein, wenn Sie „Ja“ wählen." :
      scr === 5 ? "Monatlicher Bedarf der Familie und Zeitraum der Absicherung." :
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
      if (scr >= 4 && scr <= 6) {
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
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button type="button" style={T.btnMain(false)} onClick={() => setLoading(true)}>
            Ergebnis jetzt anzeigen
          </button>
          <button type="button" style={T.btnBack} onClick={backScr}>
            Zurück
          </button>
        </div>
      );
    })();

    return (
      <div style={T.root}>
        <Header phase={progPct} total={100} />
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

          {scr === 7 && (() => {
            const b3 = risikoBridgeSicherheitCopy(p.monatsBedarf, p.laufzeit);
            return (
              <>
                <CheckKitStoryHero hideFooterSpacer emoji="🎯" title={b3.title} text={b3.text} />
                <div style={{ padding: "0 24px 8px", ...CHECKKIT2026.storyContentWrap }}>
                  {[
                    "Berechnung des Kapitalbedarfs für Hinterbliebene.",
                    "Berücksichtigung laufender Kreditverbindlichkeiten.",
                    "Ermittlung der günstigsten Absicherungsstrategie.",
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
              </>
            );
          })()}

          {((scr >= 2 && scr <= 3) || scr === 5 || scr === 6) && (
            <div style={{ padding: "0 24px 8px" }}>
              {scr === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: hatKredit === true ? "8px" : "12px" }}>
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
                  <SliderCard
                    label="Absicherungszeitraum"
                    value={p.laufzeit}
                    min={5}
                    max={30}
                    step={1}
                    unit="Jahre"
                    display={`${p.laufzeit} Jahre`}
                    accent={C}
                    onChange={(v) => set("laufzeit", v)}
                  />
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
                    Empfehlung: Absicherung bis das jüngste Kind selbstständig ist oder bis zur Rente — mindestens 15–20 Jahre.
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
                  <SliderCard
                    label="Witwen-/Waisenrente (gesetzlich, ca.)"
                    value={p.witwenRente}
                    min={0}
                    max={2000}
                    step={50}
                    unit="€/Mon."
                    display={p.witwenRente === 0 ? "Nicht vorhanden / unbekannt" : undefined}
                    hint="Ca. 55 % der gesetzlichen Rentenanwartschaft — 0, wenn unbekannt"
                    accent={C}
                    onChange={(v) => set("witwenRente", v)}
                  />
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
        <div style={T.footer}>{wizFooter}</div>
      </div>
    );
  }

  // ── Phase 2: Ergebnis (kompakt wie Renten/Pflege: Hero + Balken + Einordnung + Accordion) ──
  if (phase === 2) {
    const { einnahmen, luecke, bedarfKapital, gesamt, netto, gesamtBedarf, kapBedarf, empfPraemie } = R;
    const gedeckt = netto <= 0;
    const hatLuecke = netto > 0 || luecke > 0;

    let segKap = 0;
    let segKr = 0;
    let segFe = 0;
    if (gesamtBedarf > 0) {
      if (p.vorhanden > 0 && netto > 0) {
        const den = kapBedarf + p.kredite + netto;
        if (den > 0) {
          segKap = Math.round((kapBedarf / den) * 100);
          segKr = Math.round((p.kredite / den) * 100);
          segFe = Math.max(0, 100 - segKap - segKr);
        }
      } else {
        segKap = Math.round((kapBedarf / gesamtBedarf) * 100);
        segKr = Math.round((p.kredite / gesamtBedarf) * 100);
        segFe = 0;
      }
    }

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
      { l: "Vorhandene Einnahmen", v: "− " + fmt(einnahmen) + "/Mon.", c: "#059669", bold: false },
      { l: "Monatliche Lücke", v: fmt(luecke) + "/Mon.", c: luecke > 0 ? WARN_RL : "#059669", bold: true, border: true },
      ...(p.kredite > 0 ? [{ l: "+ Kredite / Darlehen", v: "+ " + fmtK(p.kredite), c: "#1F2937", bold: false }] : []),
      { l: "Gesamtbedarf", v: fmtK(gesamt), c: C, bold: true, border: true },
      ...(p.vorhanden > 0 ? [{ l: "− Bestehende Absicherung", v: "− " + fmtK(p.vorhanden), c: "#059669", bold: false }] : []),
      ...(p.vorhanden > 0 ? [{ l: "Empfohlene Versicherungssumme", v: fmtK(netto), c: gedeckt ? "#059669" : WARN_RL, bold: true }] : []),
    ];

    return (
      <Shell eyebrow={undefined} title={undefined} lead={undefined}
        footer={
          <>
            <button type="button" style={T.btnMain(false)} onClick={() => goTo(3)}>Weiter →</button>
            <button style={T.btnBack} onClick={() => goTo(1)}>Neue Berechnung starten</button>
          </>
        }
      >

        <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={T.resultEyebrow}>Ihre Risikoleben-Analyse</div>
          <div style={{ ...T.resultNumber(!gedeckt), textAlign: "center", width: "100%" }}>
            {gedeckt ? "Gedeckt" : fmtK(netto)}
          </div>
          <div style={{ ...T.resultUnit, textAlign: "center" }}>
            {gedeckt ? "kein wesentlicher Absicherungsbedarf im Modell" : "empfohlene Versicherungssumme (netto)"}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", marginTop: "6px" }}>{pillRl}</div>
          <div style={{ ...T.resultSub, textAlign: "center", marginTop: "4px", maxWidth: "36ch" }}>
            {p.laufzeit} Jahre Laufzeit · vereinfachte Berechnung
          </div>
        </div>

        <div style={T.section}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={T.kpiKontaktLuecke}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: gedeckt ? "#059669" : WARN_RL, letterSpacing: "-0.5px" }}>
                {gedeckt ? "—" : fmtK(netto)}
              </div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Empfohlen (netto)</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{fmtK(p.vorhanden)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Vorhanden</div>
            </div>
            <div style={T.kpiKontaktEu}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: luecke > 0 ? WARN_RL : "#059669", letterSpacing: "-0.5px" }}>{fmt(luecke)}</div>
              <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatliche Lücke</div>
            </div>
          </div>
        </div>

        {hatLuecke ? (
          <div style={{ ...T.section, marginTop: "-8px" }}>
            <div
              style={{
                border: "1px solid rgba(192,57,43,0.27)",
                borderLeft: "3px solid #c0392b",
                borderRadius: "18px",
                padding: "14px 16px",
                background: "rgba(192,57,43,0.025)",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#c0392b",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Empfohlene Absicherung
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "36px", fontWeight: "700", color: C, letterSpacing: "-0.8px", lineHeight: 1 }}>{fmtK(gesamtBedarf)}</div>
                  <div style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}>
                    Versicherungssumme · {p.laufzeit} Jahre Laufzeit
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>
                    {empfPraemie > 0 ? <>ab ca. {fmt(empfPraemie)}/Mon.</> : <>Prämie n. a.</>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>Schätzwert — abhängig von Alter &amp; Gesundheit</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {hatLuecke ? (
          <div style={T.section}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#9CA3AF",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Zusammensetzung des Bedarfs
            </div>
            <div
              style={{
                height: "8px",
                background: "rgba(31,41,55,0.08)",
                borderRadius: "999px",
                overflow: "hidden",
                display: "flex",
                marginBottom: "10px",
              }}
            >
              {segKap > 0 && (
                <div
                  style={{
                    width: `${segKap}%`,
                    background: C,
                    minWidth: segKap > 0 ? "2px" : 0,
                    transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              )}
              {p.kredite > 0 && segKr > 0 && (
                <div
                  style={{
                    width: `${segKr}%`,
                    background: "#f59e0b",
                    minWidth: segKr > 0 ? "2px" : 0,
                    transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              )}
              {netto > 0 && segFe > 0 && (
                <div
                  style={{
                    width: `${segFe}%`,
                    background: "#c0392b",
                    minWidth: segFe > 0 ? "2px" : 0,
                    transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              )}
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { farbe: C, label: "Lebenshaltung (Lücke kapitalisiert)", wert: fmtK(kapBedarf) },
                ...(p.kredite > 0 ? [{ farbe: "#f59e0b", label: "Kredite", wert: fmtK(p.kredite) }] : []),
                ...(netto > 0 ? [{ farbe: "#c0392b", label: "Fehlende Absicherung", wert: fmtK(netto) }] : []),
              ].map(({ farbe, label, wert }, i) => (
                <div key={label + i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: farbe, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#1F2937" }}>{wert}</div>
                    <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={T.section}>
          <div style={T.sectionLbl}>Einordnung</div>
          <div style={{ ...T.compareGrid, alignItems: "stretch" }}>
            <RisikoHintCard icon="📊" accent={C}>
              <strong style={{ fontWeight: 700 }}>Monatliche Versorgungslücke</strong>
              <span style={{ display: "block", marginTop: "8px" }}>
                {fmt(luecke)} pro Monat — über {p.laufzeit} Jahre entspricht das rund {fmtK(bedarfKapital)} Kapitalbedarf (ohne Kredit).
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
              <span>Aufschlüsselung, Hinweise &amp; Methodik</span>
              <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{rlErgebnisAcc === "details" ? "▲" : "▼"}</span>
            </button>
            {rlErgebnisAcc === "details" && (
              <div className="rl-acc-panel" style={{ paddingTop: "12px" }}>
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
                  Miete, Kredit und Lebenshaltung laufen weiter. Ohne Ihr Einkommen bleibt eine Lücke von {fmt(luecke)} monatlich — kapitalisiert über {p.laufzeit} Jahre: {fmtK(luecke * 12 * p.laufzeit)}.
                  {p.kredite > 0 && <> Zusätzlich einmalig {fmtK(p.kredite)} für Darlehen.</>}
                </p>
                <p style={{ marginBottom: "10px", fontSize: "12px", color: "#6B7280", lineHeight: 1.65 }}>
                  <strong style={{ color: "#374151" }}>Gesetzliche Witwen-/Waisenrente</strong> (orientierend ca. 55 % der Anwartschaft; Kinderzuschläge möglich; Anrechnung Partnereinkommen ab ca. 1.038 €/Mon.).
                </p>
                {p.vorhanden > 0 && (
                  <p style={{ marginBottom: "10px", fontSize: "12px", color: "#15803D", lineHeight: 1.55 }}>
                    Bestehende Absicherung {fmtK(p.vorhanden)} ist in der Summe berücksichtigt.
                  </p>
                )}
                {einnahmen > 0 && (
                  <p style={{ marginBottom: "10px", fontSize: "12px", color: "#9CA3AF", lineHeight: 1.55 }}>
                    Angenommene Einnahmen: {fmt(einnahmen)}/Mon.
                  </p>
                )}
                <p style={{ marginBottom: "10px", fontSize: "12px", color: "#6B7280", lineHeight: 1.65 }}>
                  <strong style={{ color: "#374151" }}>Nächste Schritte:</strong> Richtwert Versicherungssumme {fmtK(netto > 0 ? netto : gesamt)} — Laufzeit {p.laufzeit} Jahre prüfen; bestehende Policen mit der Situation abgleichen.
                </p>
                <div style={{ ...T.warnCard, marginBottom: "14px", padding: "14px 16px" }}>
                  <div style={T.warnCardTitle}>Was oft unterschätzt wird</div>
                  <div style={{ fontSize: "12px", color: "#7B2A2A", lineHeight: 1.6, marginTop: "6px" }}>
                    Der überlebende Partner muss oft beruflich kürzertreten — die Modellrechnung geht von laufenden Familienkosten aus.
                  </div>
                </div>
                <CheckBerechnungshinweis>
                  <>
                    Gesamtbedarf = monatliche Lücke × 12 × Laufzeit + Kredite − bestehende Absicherung. Lücke = Familienbedarf − Einnahmen (Partner + Witwen-/Waisenrente + Sonstiges).{" "}
                    <span style={{ color: "#b8884a" }}>Grundlage: §46–48 SGB VI. Keine Rechtsberatung.</span>
                  </>
                </CheckBerechnungshinweis>
              </div>
            )}
          </div>
        </div>

        <div style={{ ...T.section, paddingBottom: "120px" }}>
          <div style={{ ...T.infoBox, fontSize: "11px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

      </Shell>
    );
  }

  if (phase === 3) {
    const valid = formData.name.trim() && formData.email.trim() && kontaktConsent;
    return (
      <Shell
        eyebrow="Fast geschafft"
        title="Wo können wir Sie erreichen?"
        lead="Wir melden uns innerhalb von 24 Stunden mit Ihrem Ergebnis und den nächsten Schritten."
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
                    await fetch("/api/lead", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        token,
                        slug: "risikoleben",
                        kundenName: formData.name,
                        kundenEmail: formData.email,
                        kundenTel: formData.telefon || "",
                      }),
                    }).catch(() => {});
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
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Laufzeit</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{p.laufzeit} Jahre</div>
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

  return (
    <Shell>
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
