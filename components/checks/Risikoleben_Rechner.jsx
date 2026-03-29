import { useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";

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
  `;
  document.head.appendChild(s);
})();

const alpha = (hex,a) => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };
const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n>=10000 ? Math.round(n/1000)+".000 €" : fmt(n);
/** Intro + Familie + Kredit + Bedarfs-Story + 2 Datenschritte + Bridge */
const RL_WIZARD_STEPS = 7;
const STORY_H1_RL = { fontSize: "52px", fontWeight: "800", letterSpacing: "-1.5px", lineHeight: 1.12, color: "#111", margin: "0 0 22px" };
const STORY_BODY_RL = { fontSize: "16px", color: "#4B5563", lineHeight: 1.65, margin: 0, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" };

function StoryHeroRL({ emoji, title, text }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 24px 20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ fontSize: "64px", lineHeight: 1, marginBottom: "24px" }} aria-hidden>
        {emoji}
      </div>
      <h1 style={STORY_H1_RL}>{title}</h1>
      {text ? <p style={STORY_BODY_RL}>{text}</p> : null}
    </div>
  );
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

function risikoBridgeSicherheitCopy(nettoEinkommen, laufzeitJahre) {
  const nettoStr = `${Math.round(Number(nettoEinkommen)).toLocaleString("de-DE")} €`;
  return {
    title: "Ihre Sicherheits-Zahl steht.",
    text: `Um Ihr monatliches Netto von ${nettoStr} über die nächsten ${laufzeitJahre} Jahre abzusichern, haben wir die optimale Versicherungssumme ermittelt.`,
  };
}
const WARN_RL = "#c0392b";
const BAR_LEBENSHALTUNG = "#7c3aed";
const BAR_KREDIT = "#2563eb";
const BAR_LUECKE = "#fca5a5";

function BuktgLogoMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
    </svg>
  );
}

// ─── BERECHNUNG (vereinfacht) ─────────────────────────────────────────────────
function berechne({ monatsBedarf, laufzeit, partnerEinkommen, witwenRente, sonstiges, kredite, vorhanden }) {
  const einnahmen     = partnerEinkommen + witwenRente + sonstiges;
  const luecke        = Math.max(0, monatsBedarf - einnahmen);
  const bedarfKapital = luecke * 12 * laufzeit;
  const gesamt        = bedarfKapital + kredite;
  const netto         = Math.max(0, gesamt - vorhanden);
  return { einnahmen, luecke, bedarfKapital, gesamt, netto };
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
  const goTo = (ph) => {
    setAnimKey((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setHatKredit(null);
      setKontaktConsent(false);
      setLoading(false);
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
  useCheckScrollToTop([phase, animKey, scr, loading]);
  const set     = (k, v) => setP(x => ({ ...x, [k]: v }));
  const R       = berechne(p);
  const progPct = phase === 1 ? (scr / RL_WIZARD_STEPS) * 100 : { 2: 100, 3: 100, 4: 100 }[phase] || 0;

  const cardLift = {
    background:"#fff",
    borderRadius:"10px",
    border:"1px solid #e8e8e8",
    boxShadow:"0 1px 2px rgba(0,0,0,0.04)",
  };

  const T = {
    root:    { minHeight:"100vh", background:"#fff", fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
    header:  { position:"sticky", top:0, zIndex:100, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderBottom:"1px solid #e8e8e8", padding:"0 24px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    logoWrap:{ display:"flex", alignItems:"center", gap:"10px" },
    logoBox: { width:"28px", height:"28px", borderRadius:"6px", background:C, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700" },
    logoTxt: { fontSize:"13px", fontWeight:"600", color:"#111" },
    badge:   { fontSize:"11px", fontWeight:"500", color:"#888", letterSpacing:"0.3px", textTransform:"uppercase" },
    progBar: { height:"2px", background:"#f0f0f0" },
    progFill:{ height:"100%", width:`${progPct}%`, background:C, transition:"width 0.4s ease" },
    hero:    { padding:"32px 24px 16px" },
    eyebrow: { fontSize:"11px", fontWeight:"600", letterSpacing:"1px", textTransform:"uppercase", color:"#999", marginBottom:"6px" },
    h1:      { fontSize:"22px", fontWeight:"700", color:"#111", lineHeight:1.25, letterSpacing:"-0.5px" },
    lead:    { fontSize:"14px", color:"#666", lineHeight:1.65, marginTop:"6px" },
    body:    { paddingBottom:"120px" },
    card:    { margin:"0 16px 10px", ...cardLift, overflow:"hidden" },
    secLbl:  { fontSize:"11px", fontWeight:"600", letterSpacing:"0.5px", textTransform:"uppercase", color:"#999", padding:"16px 24px 8px" },
    fldLbl:  { display:"block", fontSize:"12px", fontWeight:"600", color:"#444", marginBottom:"8px" },
    fldVal:  { fontSize:"21px", fontWeight:"700", color:C, letterSpacing:"-0.4px", marginBottom:"6px" },
    fldHint: { fontSize:"11px", color:"#aaa", marginTop:"4px" },
    fldWrap: { marginBottom:"20px" },
    footer:  { position:"sticky", bottom:0, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:"1px solid #e8e8e8", padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
    btnMain: (d) => ({ width:"100%", padding:"13px 20px", background:d?"#e8e8e8":C, color:d?"#aaa":"#fff", borderRadius:"8px", fontSize:"14px", fontWeight:"600", cursor:d?"default":"pointer" }),
    btnBack: { width:"100%", padding:"10px", color:"#aaa", fontSize:"13px", marginTop:"6px", cursor:"pointer" },
    iLabel:  { display:"block", fontSize:"12px", fontWeight:"600", color:"#444", marginBottom:"6px" },
    input:   { width:"100%", padding:"10px 12px", border:"1px solid #e8e8e8", borderRadius:"6px", fontSize:"14px", color:"#111", background:"#fff", outline:"none" },
    iWrap:   { marginBottom:"14px" },
    resultHero: { padding:"52px 24px 40px", textAlign:"center", background:"#fff" },
    resultEyebrow: { fontSize:"12px", fontWeight:"500", color:"#9CA3AF", letterSpacing:"0.2px", marginBottom:"14px" },
    resultNumber: (warn) => ({ fontSize:"52px", fontWeight:"800", color:warn?"#C0392B":C, letterSpacing:"-2.5px", lineHeight:1, marginBottom:"8px" }),
    resultUnit: { fontSize:"14px", color:"#9CA3AF", marginBottom:"18px" },
    resultSub: { fontSize:"13px", color:"#9CA3AF", lineHeight:1.55, marginTop:"12px" },
    statusOk: { display:"inline-flex", alignItems:"center", gap:"5px", padding:"5px 13px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"999px", fontSize:"12px", fontWeight:"600", color:"#15803D" },
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
    compareGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px" },
    compareCard: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", padding: "16px 18px", background: "#fff", boxShadow: "0 4px 16px rgba(17,24,39,0.06)", minWidth: 0 },
    compareCardTitle: { fontSize: "14px", fontWeight: "700", color: "#1F2937", marginBottom: "10px", letterSpacing: "-0.2px" },
    compareBullet: { fontSize: "12px", color: "#4B5563", lineHeight: 1.5, marginBottom: "6px", paddingLeft: "14px", position: "relative" },
    formCard: { border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" },
    row: { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
    rowLast: { padding: "14px 16px" },
    inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
    fldLblForm: { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "0", display: "block" },
    fldHintForm: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
    infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  };

  const Shell = ({ eyebrow, title, lead, children, footer }) => (
    <div style={T.root}>
      <div style={T.header}><div style={T.logoWrap}><div style={T.logoBox}><BuktgLogoMark /></div><span style={T.logoTxt}>{MAKLER.firma}</span></div><span style={T.badge}>Risikoleben</span></div>
      <div style={T.progBar}><div style={T.progFill} /></div>
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
        <div style={T.header}><div style={T.logoWrap}><div style={T.logoBox}><BuktgLogoMark /></div><span style={T.logoTxt}>{MAKLER.firma}</span></div><span style={T.badge}>Risikoleben</span></div>
        <div style={T.progBar}><div style={T.progFill} /></div>
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
        <div style={T.header}>
          <div style={T.logoWrap}>
            <div style={T.logoBox}>
              <BuktgLogoMark />
            </div>
            <span style={T.logoTxt}>{MAKLER.firma}</span>
          </div>
          <span style={T.badge}>Risikoleben</span>
        </div>
        <div style={T.progBar}>
          <div style={T.progFill} />
        </div>
        <div key={animKey} className="fade-in" style={T.body}>
          {scr === 1 && (
            <StoryHeroRL
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
            return <StoryHeroRL emoji="🏠" title={s2.title} text={s2.text} />;
          })()}

          {scr === 7 && (() => {
            const b3 = risikoBridgeSicherheitCopy(p.monatsBedarf, p.laufzeit);
            return (
              <>
                <StoryHeroRL emoji="🎯" title={b3.title} text={b3.text} />
                <div style={{ padding: "8px 24px 0", maxWidth: "420px", margin: "0 auto" }}>
                  {[
                    "Berechnung des Kapitalbedarfs für Hinterbliebene.",
                    "Berücksichtigung laufender Kreditverbindlichkeiten.",
                    "Ermittlung der günstigsten Absicherungsstrategie.",
                  ].map((line) => (
                    <div
                      key={line}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "15px",
                        color: "#374151",
                        lineHeight: 1.55,
                        marginBottom: "14px",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ flexShrink: 0 }} aria-hidden>
                        ✅
                      </span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
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
                    { id: "single_ohne_kinder", label: "Single ohne Kinder", desc: "Alleinlebend ohne Kinder." },
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

  // ── Phase 2: Ergebnis ────────────────────────────────────────────────────
  if (phase === 2) {
    const { einnahmen, luecke, bedarfKapital, gesamt, netto } = R;
    const gedeckt = netto <= 0;
    const lebenshaltungKapital = Math.min(einnahmen, p.monatsBedarf) * 12 * p.laufzeit;
    const barSum = lebenshaltungKapital + bedarfKapital + p.kredite;
    const pctLh = barSum > 0 ? (lebenshaltungKapital / barSum) * 100 : 0;
    const pctLue = barSum > 0 ? (bedarfKapital / barSum) * 100 : 0;
    const pctKr = barSum > 0 ? (p.kredite / barSum) * 100 : 0;

    const bulletDot = (color) => ({
      position: "absolute",
      left: 0,
      top: "0.5em",
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      background: color,
      opacity: 0.85,
    });

    return (
      <Shell eyebrow={undefined} title={undefined} lead={undefined}
        footer={
          <>
            <button type="button" style={T.btnMain(false)} onClick={() => goTo(3)}>Weiter →</button>
            <button style={T.btnBack} onClick={() => goTo(1)}>Neue Berechnung starten</button>
          </>
        }
      >

        {/* ── Hero (Summe zentriert, ohne Status-Pills) ───────────────────── */}
        <div style={{ ...T.resultHero, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={T.resultEyebrow}>Lebensstandard · Eigenheim</div>
          <div style={{ ...T.resultNumber(!gedeckt), textAlign: "center", width: "100%" }}>
            {gedeckt ? "Gedeckt" : fmtK(netto)}
          </div>
          <div style={{ ...T.resultUnit, textAlign: "center" }}>
            {gedeckt ? "kein wesentlicher Absicherungsbedarf" : "empfohlene Versicherungssumme (netto)"}
          </div>

          <div style={{ ...T.resultSub, textAlign: "center", marginTop: "8px" }}>vereinfachte Berechnung · {p.laufzeit} Jahre · auf Basis Ihrer Angaben</div>
        </div>

        {/* Bedarfs-Balken in Standard-cardPrimary (Violett / Hellrot / Blau) */}
        <div style={T.section}>
          <div style={T.cardPrimary}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "12px", textAlign: "center" }}>
                Aufschlüsselung des Kapitalbedarfs
              </div>
              <div style={{ width: "100%", maxWidth: "340px", margin: "0 auto 4px" }}>
                <div style={{ display: "flex", height: "12px", borderRadius: "999px", overflow: "hidden", background: "#F3F4F6" }}>
                  {barSum > 0 ? (
                    <>
                      <div
                        title="Lebenshaltung (durch laufende Einnahmen abgedeckt, kapitalisiert)"
                        style={{
                          width: `${pctLh}%`,
                          minWidth: pctLh > 0 ? "3px" : 0,
                          background: BAR_LEBENSHALTUNG,
                          transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      />
                      <div
                        title="Versorgungslücke (kapitalisiert)"
                        style={{
                          width: `${pctLue}%`,
                          minWidth: pctLue > 0 ? "3px" : 0,
                          background: BAR_LUECKE,
                          transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      />
                      {p.kredite > 0 && (
                        <div
                          title="Kredit / Restschuld"
                          style={{
                            width: `${pctKr}%`,
                            minWidth: pctKr > 0 ? "3px" : 0,
                            background: BAR_KREDIT,
                            transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div style={{ flex: 1, background: "#E5E7EB" }} />
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 16px", marginTop: "12px", fontSize: "11px", color: "#6B7280" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: BAR_LEBENSHALTUNG, flexShrink: 0 }} />
                    Lebenshaltung
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: BAR_LUECKE, flexShrink: 0 }} />
                    Lücke
                  </span>
                  {p.kredite > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: BAR_KREDIT, flexShrink: 0 }} />
                      Kredit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={T.section}>
          <div style={T.sectionLbl}>Ihre Fokus-Themen</div>
          <div style={T.compareGrid}>
            <div
              style={{
                ...T.compareCard,
                borderTop: `3px solid ${BAR_LEBENSHALTUNG}`,
                ...(p.kredite === 0 ? { gridColumn: "1 / -1", maxWidth: "440px", marginLeft: "auto", marginRight: "auto", width: "100%" } : {}),
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px" }}>Monatliche Versorgung</div>
              <div style={{ fontSize: p.kredite > 0 ? "22px" : "26px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: "14px" }}>
                {fmt(luecke)}{" "}
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#9CA3AF" }}>/ Monat</span>
              </div>
              {[
                "Lebensstandard: Sichert Miete, Einkäufe und Fixkosten für Ihre Liebsten.",
                "Zeit für Trauer: Ermöglicht dem Partner, die Arbeitszeit bei Bedarf zu reduzieren.",
                "Bildung: Garantiert die finanzielle Unterstützung der Kinder bis zum Berufsstart.",
              ].map((line) => (
                <div key={line} style={T.compareBullet}>
                  <span style={bulletDot(BAR_LEBENSHALTUNG)} aria-hidden />
                  {line}
                </div>
              ))}
            </div>
            {p.kredite > 0 && (
              <div style={{ ...T.compareCard, borderTop: `3px solid ${BAR_KREDIT}` }}>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px" }}>Sofortige Schuldentilgung</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: "4px" }}>{fmt(p.kredite)}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "12px" }}>Einmalzahlung</div>
                {[
                  "Haus-Garantie: Der Kredit kann im Ernstfall sofort komplett abgelöst werden.",
                  "Mietfreies Wohnen: Sichert Ihrer Familie das Eigenheim ohne monatliche Ratenlast.",
                  "Banken-Unabhängigkeit: Verhindert den gezwungenen Verkauf der Immobilie.",
                ].map((line) => (
                  <div key={line} style={T.compareBullet}>
                    <span style={bulletDot(BAR_KREDIT)} aria-hidden />
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={T.section}>
          <div style={T.sectionLbl}>Strategie im Vergleich</div>
          <div style={T.compareGrid}>
            <div style={{ ...T.compareCard, borderTop: `3px solid ${C}` }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                <div style={T.compareCardTitle}>Konstante Absicherung</div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: C, background: `${C}18`, padding: "3px 9px", borderRadius: "999px" }}>Empfehlung Familie</span>
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, marginBottom: "12px" }}>
                Die Versicherungssumme bleibt über die gesamte Laufzeit gleich hoch.
              </div>
              {[
                { ok: true, t: "Maximaler Schutz: Volle Summe verfügbar, auch am Ende der Laufzeit (z. B. für Studium)." },
                { ok: true, t: "Planbarkeit: Fester Beitrag und feste Leistung für die gesamte Dauer." },
                { ok: false, t: "Kosten: Höherer Beitrag als bei fallenden Varianten." },
              ].map((row) => (
                <div key={row.t} style={T.compareBullet}>
                  <span style={bulletDot(row.ok ? "#059669" : "#C0392B")} aria-hidden />
                  {row.t}
                </div>
              ))}
            </div>
            <div style={{ ...T.compareCard, borderTop: `3px solid ${BAR_KREDIT}` }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                <div style={T.compareCardTitle}>Fallende Absicherung</div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: BAR_KREDIT, background: `${BAR_KREDIT}18`, padding: "3px 9px", borderRadius: "999px" }}>Empfehlung Kredit</span>
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5, marginBottom: "12px" }}>
                {p.kredite > 0
                  ? "Die Summe sinkt jährlich (analog zur Restschuld Ihres Kredits)."
                  : "Die Summe sinkt jährlich — sinnvoll vor allem in Kombination mit einer Immobilienfinanzierung."}
              </div>
              {[
                { ok: true, t: "Preis-Leistung: Die günstigste Form der Absicherung, da das Risiko für den Versicherer sinkt." },
                { ok: true, t: "Punktgenau: Deckt exakt den sinkenden Bedarf Ihrer Finanzierung ab." },
                { ok: false, t: "Einschränkung: Am Ende der Laufzeit ist kaum noch Kapital für die Lebenshaltung übrig." },
              ].map((row) => (
                <div key={row.t} style={T.compareBullet}>
                  <span style={bulletDot(row.ok ? "#059669" : "#C0392B")} aria-hidden />
                  {row.t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Breakdown Visual ──────────────────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Wie sich der Bedarf zusammensetzt</div>
          <div style={T.cardPrimary}>
            {[
              { l: "Monatsbedarf Familie",    v: fmt(p.monatsBedarf) + "/Mon.", c: "#1F2937", bold: false },
              { l: "Vorhandene Einnahmen",     v: "− " + fmt(einnahmen) + "/Mon.", c: "#059669", bold: false },
              { l: "Monatliche Lücke",         v: fmt(luecke) + "/Mon.", c: luecke > 0 ? WARN_RL : "#059669", bold: true, border: true },
              ...(p.kredite > 0 ? [{ l: "+ Kredite / Darlehen", v: "+ " + fmtK(p.kredite), c: "#1F2937", bold: false }] : []),
              { l: "Gesamtbedarf",             v: fmtK(gesamt), c: C, bold: true, border: true },
              ...(p.vorhanden > 0 ? [{ l: "− Bestehende Absicherung", v: "− " + fmtK(p.vorhanden), c: "#059669", bold: false }] : []),
              ...(p.vorhanden > 0 ? [{ l: "Empfohlene Versicherungssumme", v: fmtK(netto), c: gedeckt ? "#059669" : WARN_RL, bold: true }] : []),
            ].map((row, i, arr) => (
              <div key={i} style={{ padding: row.border ? "16px 20px" : "12px 20px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", background: row.border ? "#FAFAF8" : "#fff" }}>
                <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: row.bold ? "600" : "400" }}>{row.l}</div>
                <div style={{ fontSize: row.bold ? "16px" : "14px", fontWeight: "700", color: row.c, letterSpacing: "-0.3px", marginLeft: "12px", flexShrink: 0 }}>{row.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 1: Was das bedeutet ───────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Was das bedeutet</div>
          <div style={T.cardContext}>
            {[
              { icon: "💶", title: "Laufende Kosten bleiben bestehen", text: "Miete, Kredite und Lebenshaltungskosten fallen unverändert an — unabhängig davon, ob ein Einkommen wegfällt." },
              { icon: "📉", title: "Einkommen fällt weg", text: `Das wegfallende Einkommen hinterlässt eine monatliche Lücke von ${fmt(luecke)} — über ${p.laufzeit} Jahre summiert sich das auf ${fmtK(luecke * 12 * p.laufzeit)}.` },
              ...(p.kredite > 0 ? [{ icon: "🏦", title: "Zusätzliche Belastung durch Kredite", text: `Bestehende Darlehen (${fmtK(p.kredite)}) müssen bedient oder abgelöst werden — das erhöht den Bedarf deutlich.` }] : []),
            ].map(({ icon, title, text }, i, arr) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: i < arr.length - 1 ? "14px" : "0", marginBottom: i < arr.length - 1 ? "14px" : "0", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937", marginBottom: "3px" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Was bereits abgedeckt ist ──────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Was bereits abgedeckt ist</div>
          <div style={T.cardContext}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937", marginBottom: "10px" }}>Gesetzliche Absicherung</div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7, marginBottom: "12px" }}>
              Die gesetzliche <strong>Witwen-/Waisenrente</strong> beträgt ca. 55 % der Rentenanwartschaft. Pro halbwaisem Kind kommen ca. 10 % hinzu. Das eigene Einkommen des Partners wird ab ca. 1.038 €/Mon. anteilig angerechnet.
            </div>
            {p.vorhanden > 0 && (
              <div style={{ padding: "10px 12px", background: "#F0FDF4", borderRadius: "10px", border: "1px solid #BBF7D0", fontSize: "12px", color: "#15803D", lineHeight: 1.5 }}>
                ✓ Bestehende Absicherung von {fmtK(p.vorhanden)} wurde berücksichtigt.
              </div>
            )}
            {einnahmen > 0 && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5 }}>
                Vorhandene Einnahmen: {fmt(einnahmen)}/Mon. (Partnereinkommen + gesetzliche Rente + Sonstiges)
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Das kann sinnvoll sein ────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Das kann sinnvoll sein</div>
          <div style={T.cardPrimary}>
            {[
              { label: "Absicherungshöhe prüfen", desc: `Ein Richtwert ist ${fmtK(netto > 0 ? netto : gesamt)} Versicherungssumme — individuell kann der Bedarf jedoch abweichen. Ein Gespräch schafft Klarheit.`, icon: "🔍" },
              { label: "Laufzeit abstimmen", desc: `${p.laufzeit} Jahre passen zu Ihrer Angabe — überprüfen Sie, ob die Laufzeit bis zur Unabhängigkeit der Kinder oder bis zur Rente ausreicht.`, icon: "📅" },
              { label: "Bestehende Verträge einbeziehen", desc: "Überprüfen Sie, ob bestehende Policen noch zur aktuellen Lebenssituation passen — oft sind Verträge veraltet oder unterdotiert.", icon: "📋" },
            ].map(({ label, desc, icon }, i, arr) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Warn-Kachel (unten) ─────────────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.warnCard}>
            <div style={T.warnCardTitle}>Was oft unterschätzt wird</div>
            <div style={{ fontSize: "13px", color: "#7B2A2A", lineHeight: 1.65, marginTop: "8px" }}>
              Ein Todesfall führt oft dazu, dass der überlebende Partner beruflich kürzertreten muss, um die Kinderbetreuung allein zu stemmen. Wir haben in Ihrer Berechnung bereits einen Puffer für die laufenden Kosten eingeplant, um diesen Druck abzufedern.
            </div>
          </div>
        </div>

        {/* ── Legal ─────────────────────────────────────────────────────────── */}
        <div style={{ ...T.section, paddingBottom: "120px" }}>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Berechnung. Gesamtbedarf = monatliche Lücke × 12 × Laufzeit + Kredite − bestehende Absicherung. Lücke = Familienbedarf − Einnahmen (Partner + Witwen-/Waisenrente + Sonstiges).{" "}
              <span style={{ color: "#b8884a" }}>Grundlage: §46–48 SGB VI. Keine Rechtsberatung.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
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
