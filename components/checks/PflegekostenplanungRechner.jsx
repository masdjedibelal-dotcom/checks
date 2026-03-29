import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard, SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";

(() => {
  const s = document.createElement("style");
  s.textContent = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#ffffff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #ffffff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}.pflege-acc-item{border-radius:12px;background:#F9FAFB;border:1px solid rgba(17,24,39,0.06);margin-bottom:8px;overflow:hidden;}.pflege-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;text-align:left;font-size:13px;font-weight:600;color:#1F2937;background:transparent;cursor:pointer;border:none;font-family:inherit;}.pflege-acc-panel{padding:0 16px 14px;font-size:12px;color:#6B7280;line-height:1.65;border-top:1px solid rgba(17,24,39,0.06);}.pflege-problem-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:720px;margin:0 auto;}@media (max-width:640px){.pflege-problem-grid{grid-template-columns:1fr;}}`;
  document.head.appendChild(s);
})();

const WARN = "#c0392b";
const OK = "#059669";
const BAR_VORSORGE = "#0891b2";
const BAR_EINK = "#7c3aed";
const BAR_LUECKE = "#FEE2E2";
/** BUKTG-Violett: Akzente, Primär-CTAs, Checks in diesem Flow */
const PFLEGE_ACCENT = "#7c3aed";
const AMBER_STAT = "#D97706";

/** Orientierungswerte gesetzliche Pflegekasse (Monatsäquivalent, vereinfacht) */
const KASSE_STATIONAER = 1775;
const KASSE_AMBULANT = 1100;

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

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
 * Szenario → Ø Monatskosten, Kassenabzug (stationär / Mix / ambulant).
 * Netto-Lücke = Kosten − Kasse − Einkünfte − bestehende Vorsorge.
 */
const SZENARIEN = {
  intensiv: {
    id: "intensiv",
    heroName: "Akut",
    kurzLabel: "Akut",
    basisKosten: 3800,
    basisKasse: KASSE_STATIONAER,
    scenarioRisiko: "Kurzfristig hohe Belastung — oft mit relevantem Eigenanteil in der vollstationären Versorgung.",
    scenarioDauer: "Typischerweise intensiver Beginn; Dauer und Verlauf sind individuell sehr unterschiedlich.",
  },
  lang: {
    id: "lang",
    heroName: "Begleitung",
    kurzLabel: "Begleitung",
    basisKosten: 3200,
    basisKasse: Math.round((KASSE_STATIONAER + KASSE_AMBULANT) / 2),
    scenarioRisiko: "Längerfristiger Pflegebedarf — Wechsel zwischen ambulant und (teil-)stationär möglich.",
    scenarioDauer: "Häufig über mehrere Jahre; die Kostenentwicklung hängt vom Pflegegrad und der Setting-Wahl ab.",
  },
  zuhause: {
    id: "zuhause",
    heroName: "Zuhause",
    kurzLabel: "Zuhause",
    basisKosten: 2200,
    basisKasse: KASSE_AMBULANT,
    scenarioRisiko: "Schwerpunkt ambulant — dennoch können Umbau, Entlastung und Sachleistungen zusätzlich anfallen.",
    scenarioDauer: "Oft längere Phase in gewohnter Umgebung; später kann ein Wechsel der Setting-Art nötig werden.",
  },
};

function makePflegeT(C) {
  return {
    page: { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif" },
    header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoMk: { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
    logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
    badge: { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
    prog: { height: "2px", background: "#f0f0f0" },
    progFil: (w) => ({ height: "100%", width: `${w}%`, background: C, transition: "width 0.4s ease" }),
    hero: { padding: "32px 24px 16px" },
    eyebrow: { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" },
    h1: { fontSize: "22px", fontWeight: "700", color: "#111", lineHeight: 1.25, letterSpacing: "-0.5px" },
    body: { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
    section: { padding: "0 24px", marginBottom: "20px" },
    card: { border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" },
    row: { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
    rowLast: { padding: "14px 16px" },
    fldLbl: { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px", display: "block" },
    fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
    footer: { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
    btnPrim: (d) => ({ width: "100%", padding: "13px 20px", background: d ? "#e8e8e8" : C, color: d ? "#aaa" : "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: d ? "default" : "pointer", transition: "opacity 0.15s", letterSpacing: "-0.1px" }),
    btnSec: { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
    infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
    inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
    resultHero: { padding: "52px 24px 40px", textAlign: "center", background: "#ffffff" },
    resultEyebrow: { fontSize: "12px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.2px", marginBottom: "14px" },
    resultNumber: { fontSize: "52px", fontWeight: "800", color: WARN, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "8px" },
    resultUnit: { fontSize: "14px", color: "#9CA3AF", marginBottom: "18px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 },
    resultSub: { fontSize: "13px", color: "#9CA3AF", lineHeight: 1.55, marginTop: "12px" },
    cardPrimary: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "20px", overflow: "hidden", background: "#FFFFFF", boxShadow: "0 6px 24px rgba(17,24,39,0.08)" },
    cardContext: { background: "#FAFAF8", border: "1px solid rgba(17,24,39,0.05)", borderRadius: "16px", padding: "18px 20px" },
    sectionLbl: { fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" },
    statusOk: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#15803D" },
    statusWarn: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFF6F5", border: "1px solid #F2D4D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#C0392B" },
    statusMitte: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#B45309" },
    statusInfo: (C2) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", background: `${C2}14`, border: `1px solid ${C2}33`, borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: C2 }),
    stackedBarOuter: { width: "100%", maxWidth: "100%", height: "16px", borderRadius: "10px", overflow: "hidden", display: "flex", background: "#F3F4F6", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" },
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

function SmartHintCardPflege({ children, icon = "💡" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "16px 18px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
        border: "1px solid rgba(124, 58, 237, 0.22)",
        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.08)",
        minWidth: 0,
        fontSize: "13px",
        color: "#5B21B6",
        lineHeight: 1.55,
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }} aria-hidden>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

const STORY_H1 = { fontSize: "52px", fontWeight: "800", letterSpacing: "-1.5px", lineHeight: 1.12, color: "#111", margin: "0 0 18px" };
const STORY_BODY = { fontSize: "16px", color: "#4B5563", lineHeight: 1.65, margin: 0, maxWidth: "42ch", marginLeft: "auto", marginRight: "auto" };

function StoryHeroBlock({ emoji, title, text }) {
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

function berechne({ szenario, einkommenMonat, vorsorgeMonat }) {
  const meta = SZENARIEN[szenario] || SZENARIEN.lang;
  const kosten = meta.basisKosten;
  const kasse = meta.basisKasse;
  const nachKasse = Math.max(0, kosten - kasse);
  const vorsorgeEff = Math.min(Math.max(0, vorsorgeMonat), nachKasse);
  const nachKasseVorsorge = Math.max(0, nachKasse - vorsorgeEff);
  const einkEff = Math.min(Math.max(0, einkommenMonat), nachKasseVorsorge);
  const luecke = Math.max(0, nachKasseVorsorge - einkEff);
  const pctKasse = kosten > 0 ? (kasse / kosten) * 100 : 0;
  const pctVorsorge = kosten > 0 ? (vorsorgeEff / kosten) * 100 : 0;
  const pctEink = kosten > 0 ? (einkEff / kosten) * 100 : 0;
  const pctLuecke = kosten > 0 ? (luecke / kosten) * 100 : 0;
  return {
    kosten,
    kasse,
    nachKasse,
    vorsorgeEff,
    einkEff,
    luecke,
    pctKasse,
    pctVorsorge,
    pctEink,
    pctLuecke,
    mtlLuecke: luecke,
  };
}

const WIZARD_STEPS = 6;

export default function PflegekostenplanungRechner() {
  const MAKLER = useCheckConfig();
  const T = useMemo(() => makePflegeT(PFLEGE_ACCENT), []);
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [fd, setFd] = useState({ name: "", email: "", tel: "" });
  const [p, setP] = useState({
    szenario: "",
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
  const R = berechne(p);
  const meta = SZENARIEN[p.szenario] || null;

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
      <div style={{ ...T.page, "--accent": PFLEGE_ACCENT }}>
        <Header />
        <Danke name={fd.name} onBack={() => { setDanke(false); goTo(1); }} makler={MAKLER} C={PFLEGE_ACCENT} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...T.page, "--accent": PFLEGE_ACCENT }}>
        <Header />
        <CheckLoader type="pflege" checkmarkColor={PFLEGE_ACCENT} onComplete={() => { setLoading(false); goTo(2); }} />
      </div>
    );
  }

  if (phase === 2) {
    const { kosten, kasse, vorsorgeEff, einkEff, pctKasse, pctVorsorge, pctEink, pctLuecke, mtlLuecke } = R;
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
    const monPro10k = mtlLuecke > 0 ? Math.max(1, Math.floor(10000 / mtlLuecke)) : null;

    return (
      <div style={{ ...T.page, "--accent": PFLEGE_ACCENT }} key={ak} className="fade-in">
        <Header />

        <div style={{ paddingBottom: "120px" }}>
          <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Pflegekosten-Analyse</div>
            <div style={{ ...T.resultNumber, fontSize: "52px", textAlign: "center", color: heroZahlFarbe }}>{fmt(mtlLuecke)}</div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>mtl. ungedeckt</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>{pillPflege}</div>
            <div style={{ ...T.resultSub, marginTop: "4px", maxWidth: "38ch" }}>
              Modell-Szenario <strong style={{ color: "#6B7280" }}>„{meta ? meta.heroName : "—"}“</strong> · Ø-Gesamtkosten {fmt(kosten)}/Mon.
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Deckung aus Kasse, Vorsorge und Einkünften</div>
            <div style={T.cardPrimary}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>100 % = modellierte Gesamtkosten</span>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.3px", flexShrink: 0 }}>{fmt(kosten)}/Mon.</span>
                </div>
                <div style={T.stackedBarOuter} aria-hidden>
                  {pctKasse > 0 && <div style={T.stackedBarSeg(pctKasse, OK)} />}
                  {pctVorsorge > 0 && <div style={T.stackedBarSeg(pctVorsorge, BAR_VORSORGE)} />}
                  {pctEink > 0 && <div style={T.stackedBarSeg(pctEink, BAR_EINK)} />}
                  {pctLuecke > 0 && <div style={T.stackedBarSeg(pctLuecke, BAR_LUECKE, "#FECACA")} />}
                </div>
                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "10px 16px", fontSize: "11px", color: "#6B7280" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: OK, flexShrink: 0 }} />
                    Kasse
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: BAR_VORSORGE, flexShrink: 0 }} />
                    Vorsorge
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: BAR_EINK, flexShrink: 0 }} />
                    Einkünfte
                  </span>
                  {pctLuecke > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: BAR_LUECKE, border: "1px solid #FECACA", flexShrink: 0 }} />
                      Lücke
                    </span>
                  )}
                </div>
                <div style={{ marginTop: "14px", fontSize: "12px", color: "#6B7280", lineHeight: 1.55 }}>
                  Kasse {fmt(kasse)} · Vorsorge {fmt(vorsorgeEff)} · Einkünfte {fmt(einkEff)} · ungedeckt {fmt(mtlLuecke)}
                </div>
              </div>
            </div>
          </div>

          <div style={T.section}>
            <div style={T.sectionLbl}>Einordnung</div>
            <div style={T.compareGrid}>
              <SmartHintCardPflege icon="🎯">
                <strong style={{ fontWeight: "700" }}>Szenario: {meta ? meta.heroName : "—"}</strong>
                <span style={{ display: "block", marginTop: "8px" }}>{meta ? meta.scenarioRisiko : ""}</span>
                <span style={{ display: "block", marginTop: "8px", opacity: 0.92 }}>{meta ? meta.scenarioDauer : ""}</span>
              </SmartHintCardPflege>
              <SmartHintCardPflege icon="🏦">
                <strong style={{ fontWeight: "700" }}>Vermögensschutz</strong>
                <span style={{ display: "block", marginTop: "8px" }}>
                  {mtlLuecke <= 0
                    ? "In diesem Modell trifft die Summe aus Kasse, Vorsorge und Einkünfte die Restkosten — ein zusätzliches Polster wäre für die Lücke hier nicht nötig."
                    : `Bei ${fmt(mtlLuecke)} monatlicher Lücke reicht ein Kapital von 10.000 € ohne weitere Einkünfte grob ${monPro10k} Monate — danach entsteht wieder die volle Lücke.`}
                </span>
                <span style={{ display: "block", marginTop: "10px", fontSize: "12px", opacity: 0.9 }}>
                  In der Beratung vergleichen wir für Sie typischerweise Pflegetagegeld und Pflege-Bahr anhand Ihrer Zahlen.
                </span>
              </SmartHintCardPflege>
            </div>
          </div>

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
                    Diese Berechnung stützt sich auf durchschnittliche Eigenanteile (EEE) und Verpflegungskosten nach SGB XI (Stand 2025/26). Tatsächliche Kosten variieren je nach Einrichtung, Bundesland und individuellem Vertrag.
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Modell:</strong> Akut 3.800 €/Mon., Begleitung 3.200 € (Mix stationär/ambulant), Zuhause 2.200 €. Kassenabzug orientierend ca. 1.775 € (stationär), 1.100 € (ambulant), Begleitung als Mittelwert.
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Formel:</strong> Monatliche Netto-Lücke = Gesamtkosten − Leistung der Pflegekasse − Ihre bestehende Pflege-Vorsorge (bis zur Restlücke) − von Ihnen angenommene monatliche Netto-Einkünfte (bis zur Restlücke).
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
      <div style={{ ...T.page, "--accent": PFLEGE_ACCENT }} key={ak} className="fade-in">
        <Header />
        <div style={T.hero}>
          <div style={T.eyebrow}>Fast geschafft</div>
          <div style={T.h1}>Wo können wir Sie erreichen?</div>
          <div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
        </div>
        <div style={{ ...T.section, marginBottom: "8px" }}>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", padding: "12px 14px", background: "#fafafa", marginBottom: "16px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: WARN, letterSpacing: "-0.3px" }}>{fmt(R.luecke)}/Mon.</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Monatliche Netto-Lücke</div>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" }}>{meta ? meta.kurzLabel : "—"}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Szenario</div>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" }}>{p.alter} J.</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Alter</div>
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
    <div style={{ ...T.page, "--accent": PFLEGE_ACCENT }} key={ak} className="fade-in">
      <Header />

      {scr === 1 && (
        <>
          <StoryHeroBlock
            emoji="🛡️"
            title="Ihre Pflegevorsorge im Blick."
            text="Pflege ist keine Frage des Alters, sondern der Würde. Wir berechnen in 2 Minuten Ihren Eigenanteil und wie Sie Ihre Familie entlasten."
          />
          <div style={{ height: "100px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={() => setScr(2)}>
              Jetzt Analyse starten
            </button>
          </div>
        </>
      )}

      {scr === 2 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Schritt 2 von {WIZARD_STEPS}</div>
            <div style={T.h1}>Welches Pflegeszenario bereitet Ihnen am meisten Sorge?</div>
            <div style={T.body}>Wählen Sie die Biografie, die Ihrer Sorge am nächsten kommt — wir setzen dafür typische Monatskosten und Kassenanteile an.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SelectionCard
                value="intensiv"
                label="Akut"
                description="Kurzfristig hoher Pflegebedarf — z. B. nach Unfall, Schlaganfall oder schwerer Erkrankung; oft stationär mit hohem Eigenanteil (EEE)."
                selected={p.szenario === "intensiv"}
                accent={PFLEGE_ACCENT}
                onClick={() => set("szenario", "intensiv")}
              />
              <SelectionCard
                value="lang"
                label="Begleitung"
                description="Längere Pflege über Jahre — Demenz, zunehmender Hilfebedarf oder dauerhafter Pflegefall; Mix aus ambulant und später stationär."
                selected={p.szenario === "lang"}
                accent={PFLEGE_ACCENT}
                onClick={() => set("szenario", "lang")}
              />
              <SelectionCard
                value="zuhause"
                label="Zuhause"
                description="Weitgehend zu Hause — Pflegesachleistungen, Umbau, Assistenz; auch wenn Sie noch arbeiten oder die Versorgung im eigenen Umfeld planen."
                selected={p.szenario === "zuhause"}
                accent={PFLEGE_ACCENT}
                onClick={() => set("szenario", "zuhause")}
              />
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(!p.szenario)} disabled={!p.szenario} onClick={() => setScr(3)}>
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
          <StoryHeroBlock
            emoji="❤️"
            title="Das Wichtigste zuerst: Ihre Sicherheit."
            text="Ein Pflegefall verändert alles – emotional und organisatorisch. Die finanzielle Seite ist nur ein Teil, aber sie entscheidet über die Qualität der Versorgung."
          />
          <div style={{ height: "100px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={() => setScr(4)}>
              Weiter zur Kalkulation
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}

      {scr === 4 && (
        <>
          <div style={{ ...T.hero, textAlign: "center" }}>
            <div style={T.eyebrow}>Schritt 4 von {WIZARD_STEPS}</div>
            <div style={T.h1}>Ihre finanzielle Ausgangslage</div>
            <div style={T.body}>
              Geben Sie Alter, monatliche Einkünfte im Pflegefall und bestehende Pflege-Vorsorge an. So ermitteln wir Ihre Netto-Lücke nach Kasse, Vorsorge und Einkünften.
            </div>
          </div>
          <div style={T.section}>
            <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={25} max={75} step={1} unit="Jahre" display={`${p.alter} Jahre`} accent={PFLEGE_ACCENT} onChange={(v) => set("alter", v)} />
            <SliderCard
              label="Monatliche Einkünfte im Pflegefall (netto)"
              value={p.einkommenMonat}
              min={0}
              max={5000}
              step={50}
              unit="€/Mon."
              display={p.einkommenMonat === 0 ? "0 € — keine angenommen" : `${fmt(p.einkommenMonat)} pro Monat`}
              hint="Z. B. Rente, Erwerbsminderungsrente, private BU oder andere Netto-Einkünfte, die Sie einsetzen könnten."
              accent={PFLEGE_ACCENT}
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
              accent={PFLEGE_ACCENT}
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
            <button type="button" style={T.btnPrim(false)} onClick={() => setScr(5)}>
              Weiter
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}

      {scr === 5 && (
        <>
          <StoryHeroBlock emoji="🏥" title="Gut zu wissen…" text={null} />
          <div style={{ ...T.section, marginTop: "8px" }}>
            <div className="pflege-problem-grid">
              {[
                {
                  stat: "50 %",
                  desc: "So viel der Kosten trägt die Kasse im Schnitt nicht.",
                },
                {
                  stat: "2.600 €",
                  desc: "Der Ø-Eigenanteil im ersten Jahr (Vollstationär).",
                },
                {
                  stat: "Jeder 5.",
                  desc: "Pflegefall ist statistisch jünger als 65 Jahre.",
                },
              ].map(({ stat, desc }) => (
                <div
                  key={stat}
                  style={{
                    textAlign: "center",
                    padding: "20px 14px",
                    borderRadius: "16px",
                    border: "1px solid rgba(17,24,39,0.08)",
                    background: "#fff",
                    boxShadow: "0 4px 16px rgba(17,24,39,0.06)",
                  }}
                >
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "#111", letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: "10px" }}>{stat}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: "100px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={() => setScr(6)}>
              Auswertung erstellen
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
      )}

      {scr === 6 && (
        <>
          <StoryHeroBlock emoji="✨" title="Fast geschafft! Ihre Analyse ist bereit." text={null} />
          <div style={{ padding: "8px 24px 0", maxWidth: "400px", margin: "0 auto" }}>
            {[
              "Exakte Berechnung Ihrer monatlichen Lücke.",
              "Vergleich der Strategien (Tagegeld vs. Bahr).",
              "Ihr persönlicher Plan zum Vermögensschutz.",
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
      )}
    </div>
  );
}
