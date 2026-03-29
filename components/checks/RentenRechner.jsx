import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";

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
  };
}

function makeRentenT(C) {
  return {
  page:    { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif" },
  header:  { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { display: "flex", alignItems: "center", gap: "10px" },
  logoMk:  { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
  logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
  badge:   { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
  prog:    { height: "2px", background: "#f0f0f0" },
  progFil: (w) => ({ height: "100%", width: `${w}%`, background: C, transition: "width 0.4s ease" }),
  hero:    { padding: "32px 24px 16px" },
  eyebrow: { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" },
  h1:      { fontSize: "22px", fontWeight: "700", color: "#111", lineHeight: 1.25, letterSpacing: "-0.5px" },
  body:    { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
  section: { padding: "0 24px", marginBottom: "20px" },
  divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
  card:    { border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" },
  row:     { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
  rowLast: { padding: "14px 16px" },
  fldLbl:  { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "0", display: "block" },
  fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
  optBtn:  (a,c) => ({ padding: "9px 14px", borderRadius: "6px", border: `1px solid ${a?(c||C):"#e8e8e8"}`, background: a?(c||C):"#fff", fontSize: "13px", fontWeight: a?"600":"400", color: a?"#fff":"#444", transition: "all 0.15s", cursor: "pointer" }),
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
  btnPrim: (d) => ({ width: "100%", padding: "13px 20px", background: d?"#e8e8e8":C, color: d?"#aaa":"#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: d?"default":"pointer" }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? WARN : "#111" }),
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
  resultHero: { padding: "52px 24px 40px", textAlign: "center", background: "#fff" },
  resultEyebrow: { fontSize: "12px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.2px", marginBottom: "10px" },
  resultHeadline: { fontSize: "20px", fontWeight: "700", color: "#111827", letterSpacing: "-0.35px", lineHeight: 1.25, marginBottom: "14px", textAlign: "center" },
  resultNumber: (warn) => ({ fontSize: "52px", fontWeight: "800", color: warn ? WARN : C, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "8px" }),
  resultUnit: { fontSize: "14px", color: "#9CA3AF", marginBottom: "18px" },
  resultSub: { fontSize: "13px", color: "#9CA3AF", lineHeight: 1.55, marginTop: "12px" },
  statusOk: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#15803D" },
  statusWarn: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFF6F5", border: "1px solid #F2D4D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#C0392B" },
  statusInfo: (C2) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", background: `${C2}14`, border: `1px solid ${C2}33`, borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: C2 }),
  cardPrimary: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "20px", overflow: "hidden", background: "#FFFFFF", boxShadow: "0 6px 24px rgba(17,24,39,0.08)" },
  cardContext: { background: "#FAFAF8", border: "1px solid rgba(17,24,39,0.05)", borderRadius: "16px", padding: "18px 20px" },
  warnCard: { background: "#FFF6F5", border: "1px solid #F2D4D0", borderLeft: "3px solid #C0392B", borderRadius: "14px", padding: "18px 20px" },
  sectionLbl: { fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" },
  stackedBarOuter: { width: "100%", maxWidth: "100%", height: "16px", borderRadius: "10px", overflow: "hidden", display: "flex", background: "#F3F4F6", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" },
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
  compareBullet: { fontSize: "12px", color: "#4B5563", lineHeight: 1.5, marginBottom: "6px", paddingLeft: "14px", position: "relative" },
};
}

function SmartHintCard({ children, icon = "💡" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "14px 16px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
        border: "1px solid #FCD34D",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <span style={{ flexShrink: 0, fontSize: "18px", lineHeight: 1.2 }} aria-hidden>{icon}</span>
      <div style={{ fontSize: "13px", fontWeight: "500", color: "#92400E", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

const STORY_H1 = { fontSize: "52px", fontWeight: "800", letterSpacing: "-1.5px", lineHeight: 1.12, color: "#111", margin: "0 0 18px" };
const STORY_BODY = { fontSize: "16px", color: "#4B5563", lineHeight: 1.65, margin: 0, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" };

function StoryHeroBlockRenten({ emoji, title, text }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 24px 12px", maxWidth: "580px", margin: "0 auto" }}>
      <div style={{ fontSize: "64px", lineHeight: 1, marginBottom: "22px" }} aria-hidden>
        {emoji}
      </div>
      <h1 style={STORY_H1}>{title}</h1>
      {text ? <p style={STORY_BODY}>{text}</p> : null}
    </div>
  );
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

/** Monatliche gesetzliche Rente laut Eingabe (`p.gesRente`); 0 = nicht ausgefüllt */
function rentenBridgeAnspruchCopy(rentenanspruchMonat) {
  const r = Number(rentenanspruchMonat);
  if (r > 0) {
    const s = `${Math.round(r).toLocaleString("de-DE")} €`;
    return {
      title: "Basis-Check abgeschlossen.",
      text: `Ihre bereits erworbenen Ansprüche von ${s} sind das Fundament. Wir ziehen jetzt die Inflation und Steuern ab, um die reale Lücke zu schließen.`,
    };
  }
  return {
    title: "Vorsorge-Check bereit.",
    text: "Wir berechnen jetzt Ihren kompletten Bedarf von Null auf, damit Sie im Alter keine Kompromisse bei Ihrem Lebensstandard machen müssen.",
  };
}

function LogoSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;
}

function Header({ phase, total, badge, makler, T }) {
  return (
    <>
      <div style={T.header}>
        <div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={T.logoTxt}>{makler.firma}</span></div>
        <span style={T.badge}>{badge}</span>
      </div>
      <div style={T.prog}><div style={T.progFil((phase/total)*100)}/></div>
    </>
  );
}

function Footer({ onNext, onBack, label="Weiter", disabled=false, T }) {
  return (
    <div style={T.footer}>
      <button style={T.btnPrim(disabled)} onClick={onNext} disabled={disabled}>{label}</button>
      {onBack && <button style={T.btnSec} onClick={onBack}>Zurück</button>}
    </div>
  );
}

function DankeScreen({ name, onBack, makler, C }) {
  return (
    <div style={{ padding:"48px 24px", textAlign:"center" }} className="fade-in">
      <div style={{ width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontSize:"20px",fontWeight:"700",color:"#111",letterSpacing:"-0.4px",marginBottom:"8px" }}>{name?`Vielen Dank, ${name.split(" ")[0]}.`:"Ihre Anfrage wurde gesendet."}</div>
      <div style={{ fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px" }}>Wir prüfen Ihr Ergebnis und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
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
  /** Intro, Alter, Rentenalter, Netto, Zeit-&-Einkommens-Story, Ziel, Vorsorge, Inflation, Bridge → Loader → Ergebnis */
  const TOTAL_SCR = 9;
  const goTo   = (ph) => {
    setAk(k => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setLoading(false);
    }
  };
  const nextScr = () => {
    if (scr < TOTAL_SCR) setScr((s) => s + 1);
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  const R = berechne(p);
  const TOTAL = 3;

  if (danke) return (
    <div style={{ ...T.page, "--accent": C }}>
      <Header phase={TOTAL} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T} />
      <DankeScreen name={name} onBack={() => { setDanke(false); goTo(1); }} makler={MAKLER} C={C} />
    </div>
  );

  if (loading) {
    return (
      <div style={{ ...T.page, "--accent": C }}>
        <Header phase={TOTAL_SCR} total={TOTAL_SCR} badge="Vorsorge-Check" makler={MAKLER} T={T} />
        <CheckLoader type="rente" onComplete={() => { setLoading(false); goTo(2); }} />
      </div>
    );
  }

  // Phase 3: Kontakt
  if (phase === 3) {
    const valid = fd.name.trim() && fd.email.trim() && kontaktConsent;
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T} />
        <div style={T.hero}>
          <div style={T.eyebrow}>Fast geschafft</div>
          <div style={T.h1}>Wo können wir Sie erreichen?</div>
          <div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit Ihrem Ergebnis.</div>
        </div>
        <div style={T.section}>
          <div style={{ ...T.infoBox, marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: WARN, letterSpacing: "-0.5px" }}>{fmt(R.lueckeAdjusted)}</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Monatliche Lücke</div></div>
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{R.deckung}%</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Deckungsgrad</div></div>
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.5px" }}>{R.jahreBis} J.</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>bis Rente</div></div>
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
          <div style={T.footer}><button type="button" style={T.btnSec} onClick={() => goTo(2)}>Zurück</button></div>
        ) : (
          <Footer
            onNext={async () => {
              if (!valid) return;
              const token = new URLSearchParams(window.location.search).get("token");
              if (token) {
                await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slug: "vorsorge-check", kundenName: fd.name, kundenEmail: fd.email, kundenTel: fd.tel || "" }) }).catch(() => {});
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
    const kap20 = lh * 12 * 20;
    const kap24 = lh * 12 * 24;
    const statusPill =
      lh <= 0 ? (
        <div style={T.statusOk}>Ziel weitgehend erreicht</div>
      ) : lh > 300 ? (
        <div style={T.statusWarn}>Erheblicher Handlungsbedarf</div>
      ) : (
        <div style={T.statusInfo(C)}>Moderate Lücke — Nachsteuern lohnt sich</div>
      );

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T} />

        <div style={{ paddingBottom: "120px" }}>
          <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Vorsorgesituation</div>
            <div style={{ ...T.resultNumber(lh > 0), fontSize: "52px", textAlign: "center" }}>{lh > 0 ? fmt(lh) : fmt(0)}</div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>mtl. Lücke heute</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{statusPill}</div>
            <div style={{ ...T.resultSub, marginTop: "4px", maxWidth: "36ch" }}>
              {R.deckung} % Ihrer Zielrente gedeckt · {R.jahreBis} Jahre bis zur Rente · statistisch ca. {R.renteDauer} Jahre Rentenphase
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
            <div style={T.sectionLbl}>Einordnung</div>
            <div style={{ ...T.compareGrid, alignItems: "stretch" }}>
              <SmartHintCard icon="⏱️">
                <strong style={{ fontWeight: "700" }}>Der Zeitfaktor — Kosten des Wartens</strong>
                <span style={{ display: "block", marginTop: "8px" }}>
                  Je länger Sie mit dem Aufbau zusätzlicher Vorsorge warten, desto höher wird die nötige Sparrate. Der Zinseszinseffekt wirkt am stärksten, wenn Sie früh einsteigen.
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                  <div style={{ padding: "10px 10px", background: "#F0FDF4", borderRadius: "10px", textAlign: "center", border: "1px solid #BBF7D0" }}>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#059669" }}>Heute starten</div>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "4px", lineHeight: 1.35 }}>Niedrigere Rate · mehr Laufzeit</div>
                  </div>
                  <div style={{ padding: "10px 10px", background: "#FFF6F5", borderRadius: "10px", textAlign: "center", border: "1px solid #F2D4D0" }}>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#C0392B" }}>5 Jahre warten</div>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "4px", lineHeight: 1.35 }}>Höhere Rate · weniger Zeit</div>
                  </div>
                </div>
              </SmartHintCard>
              <SmartHintCard icon="📊">
                <strong style={{ fontWeight: "700" }}>Kapitalbedarf (Orientierung)</strong>
                <span style={{ display: "block", marginTop: "8px" }}>
                  Grobe Summe ohne Abzinsung: monatliche Lücke heute × 12 × statistische Rentenphase (20 bzw. 24 Jahre).
                </span>
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>Mann (20 J.)</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.4px" }}>{fmt(kap20)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>Frau (24 J.)</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.4px" }}>{fmt(kap24)}</div>
                  </div>
                </div>
              </SmartHintCard>
            </div>
          </div>

          <div style={{ ...T.section, marginBottom: "16px" }}>
            <div style={T.sectionLbl}>Details zur Berechnung</div>
            <div className="renten-acc-item">
              <button type="button" className="renten-acc-btn" onClick={() => setRentenArchiv((x) => (x === "calc" ? null : "calc"))} aria-expanded={rentenArchiv === "calc"}>
                <span>Methodik, Inflation &amp; Steuer</span>
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
          </div>

          <div style={{ ...T.section, marginBottom: "8px" }}>
            <div style={{ ...T.infoBox, fontSize: "11px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
          </div>
        </div>

        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} label="Vorsorge prüfen" T={T} />
      </div>
    );
  }

  // Phase 1: Intro + Daten + Story (Alter/Netto/Rentenalter) + … + Bridge → Loader → Phase 2
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={scr} total={TOTAL_SCR} badge="Vorsorge-Check" makler={MAKLER} T={T} />

      {scr === 1 && (
        <>
          <StoryHeroBlockRenten
            emoji="⏳"
            title="Ihre Freiheit im Alter."
            text="Wie viel ist Ihr Geld in 20 oder 30 Jahren noch wert? Wir berechnen in 2 Minuten Ihre reale Kaufkraft und zeigen Ihnen, wie Sie Ihren Lebensstandard sicher halten."
          />
          <div style={{ height: "100px" }} />
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
          <StoryHeroBlockRenten emoji="📈" title={s2.title} text={s2.text} />
          <div style={{ height: "100px" }} />
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { v: 60, l: "60 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.6)}/Monat · Basisversorgung` },
                { v: 70, l: "70 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.7)}/Monat · Typisches Ziel ★`, star: true },
                { v: 80, l: "80 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.8)}/Monat · Guter Lebensstandard` },
                { v: 90, l: "90 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.9)}/Monat · Voller Lebensstandard` },
              ].map(({ v, l, d }) => (
                <SelectionCard key={v} value={String(v)} label={l} description={d} selected={p.zielProzent === v} accent={C} onClick={() => set("zielProzent", v)} />
              ))}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
          <Footer onNext={nextScr} onBack={backScr} label="Weiter" T={T} />
        </>
      )}

      {scr === 9 && (() => {
        const b3 = rentenBridgeAnspruchCopy(p.gesRente);
        return (
        <>
          <StoryHeroBlockRenten emoji="🎯" title={b3.title} text={b3.text} />
          <div style={{ padding: "8px 24px 0", maxWidth: "420px", margin: "0 auto" }}>
            {[
              "Hochrechnung der Kaufkraft (Inflations-Check).",
              "Abgleich der Ansprüche mit dem Wunsch-Szenario.",
              "Ermittlung des monatlichen Sparpotenzials.",
            ].map((line) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  fontSize: "15px",
                  color: "#374151",
                  lineHeight: 1.55,
                  marginBottom: "14px",
                }}
              >
                <span style={{ fontSize: "18px", lineHeight: 1.2, flexShrink: 0 }} aria-hidden>
                  ✅
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          <div style={{ height: "100px" }} />
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
