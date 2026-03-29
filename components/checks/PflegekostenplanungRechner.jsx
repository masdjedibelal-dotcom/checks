import { useMemo, useState, useEffect } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard, SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";

(() => {
  const s = document.createElement("style");
  s.textContent = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#ffffff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #ffffff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;
  document.head.appendChild(s);
})();

const WARN = "#c0392b";
const OK = "#059669";
const BAR_RENTE = "#7c3aed";
const BAR_LUECKE = "#FEE2E2";

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => (n >= 10000 ? Math.round(n / 1000).toLocaleString("de-DE") + ".000 €" : fmt(n));

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

/** Ø-Dauer (Jahre) + Kostenbasis + Erklärtexte je Szenario */
const SZENARIEN = {
  intensiv: {
    id: "intensiv",
    heroName: "Plötzliche Vollpflege",
    heroTag: "(Der Akutfall)",
    kurzLabel: "Plötzliche Vollpflege",
    jahre: 3,
    basisKosten: 3800,
    basisKasse: 1200,
    unterBalken: [
      { kind: "ok", text: "Sofort-Check: Der hohe Eigenanteil im Heim (EEE) schlägt ab dem ersten Monat voll zu Buche." },
      { kind: "ok", text: "Entlastung: Professionelle Pflege rund um die Uhr, um Angehörige physisch und psychisch zu schützen." },
      { kind: "risk", text: "Risiko: Ohne Zusatzschutz wird das Ersparte oder die Immobilie zur Liquiditätsreserve." },
    ],
  },
  lang: {
    id: "lang",
    heroName: "Lange Begleitung",
    heroTag: "(Der Demenzfall)",
    kurzLabel: "Lange Begleitung",
    jahre: 8,
    basisKosten: 2800,
    basisKasse: 1000,
    unterBalken: [
      { kind: "ok", text: "Vermögensschutz: Verhindert, dass die lebenslange Ersparnis durch die immense Dauer der Pflege aufgezehrt wird." },
      { kind: "ok", text: "Flexibilität: Finanziert zusätzliche Betreuungskräfte, um den Umzug ins Heim so lange wie möglich hinauszuzögern." },
      { kind: "risk", text: "Risiko: Die „Sandwich-Falle“ – Kinder müssen oft finanziell oder zeitlich massiv einspringen." },
    ],
  },
  zuhause: {
    id: "zuhause",
    heroName: "Würde zu Hause",
    heroTag: "(Der ambulante Fokus)",
    kurzLabel: "Würde zu Hause",
    jahre: 5,
    basisKosten: 2400,
    basisKasse: 900,
    unterBalken: [
      { kind: "ok", text: "Wohnraum-Anpassung: Deckt Kosten für Treppenlifte, Badumbau und smarte Assistenzsysteme." },
      { kind: "ok", text: "Pflegedienst-Plus: Finanziert mehr Einsätze des Pflegedienstes, als die gesetzliche Kasse vorsieht." },
      { kind: "risk", text: "Risiko: Wenn die ambulanten Kosten die Rente übersteigen, droht trotz des Wunsches der Umzug ins Heim." },
    ],
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
    warnCard: { background: "#FFF6F5", border: "1px solid #F2D4D0", borderLeft: "3px solid #C0392B", borderRadius: "14px", padding: "18px 20px" },
    warnCardTitle: { fontSize: "13px", fontWeight: "700", color: "#C0392B", marginBottom: "6px" },
    warnCardText: { fontSize: "13px", color: "#7B2A2A", lineHeight: 1.65 },
    sectionLbl: { fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" },
    compareGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px" },
    compareCard: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", padding: "16px 18px", background: "#fff", boxShadow: "0 4px 16px rgba(17,24,39,0.06)", minWidth: 0 },
    compareCardTitle: { fontSize: "14px", fontWeight: "700", color: "#1F2937", marginBottom: "10px", letterSpacing: "-0.2px" },
    compareBullet: { fontSize: "12px", color: "#4B5563", lineHeight: 1.5, marginBottom: "8px", paddingLeft: "14px", position: "relative" },
    focusCard: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", padding: "20px 18px", background: "#fff", boxShadow: "0 4px 16px rgba(17,24,39,0.06)", flex: "1 1 calc(50% - 6px)", minWidth: "min(100%, 260px)" },
    focusCardKpi: { fontSize: "40px", fontWeight: "800", color: WARN, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "10px" },
    scenarioBulletRow: { fontSize: "12px", color: "#4B5563", lineHeight: 1.55, marginBottom: "10px", paddingLeft: "2px", display: "flex", gap: "8px", alignItems: "flex-start" },
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

function berechne({ szenario, bedarf, renteMonat }) {
  const meta = SZENARIEN[szenario] || SZENARIEN.lang;
  const MULT = bedarf === "gering" ? 0.8 : bedarf === "hoch" ? 1.3 : 1.0;
  const kosten = Math.round(meta.basisKosten * MULT);
  const kasse = Math.round(meta.basisKasse * MULT);
  const nachKasse = Math.max(0, kosten - kasse);
  const renteEff = Math.min(Math.max(0, renteMonat), nachKasse);
  const luecke = Math.max(0, nachKasse - renteEff);
  const monate = meta.jahre * 12;
  const gesamtLuecke = luecke * monate;
  const pctKasse = kosten > 0 ? (kasse / kosten) * 100 : 0;
  const pctRente = kosten > 0 ? (renteEff / kosten) * 100 : 0;
  const pctLuecke = kosten > 0 ? (luecke / kosten) * 100 : 0;
  return { kosten, kasse, nachKasse, renteEff, luecke, gesamtLuecke, jahre: meta.jahre, monate, pctKasse, pctRente, pctLuecke };
}

function bulletDot(color) {
  return {
    position: "absolute",
    left: 0,
    top: "0.5em",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: color,
    opacity: 0.85,
  };
}

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
    szenario: "",
    bedarf: "mittel",
    alter: 50,
    renteMonat: 0,
    absicherung: "nein",
  });
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [scr, setScr] = useState(1);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 1) setScr(1);
  };
  const nextScr = () => {
    if (scr < 4) setScr((s) => s + 1);
    else setLoading(true);
  };
  const backScr = () => {
    if (scr > 1) setScr((s) => s - 1);
  };
  const R = berechne(p);
  const meta = SZENARIEN[p.szenario] || null;

  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  useEffect(() => {
    if (!loading) return;
    const delays = [0, 480, 980, 1600];
    const timers = delays.map((d, i) => setTimeout(() => setLoadStep(i + 1), d));
    const done = setTimeout(() => {
      setLoading(false);
      setLoadStep(0);
      goTo(2);
    }, 2300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const progPct = phase === 1 ? scr * 22 : { 2: 88, 3: 100 }[phase] || 100;

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
    const STEPS = [
      { label: "Szenario und Kostenbasis eingepreist" },
      { label: "Pflegekassen-Anteil ermittelt" },
      { label: "Monatliche Lücke und Gesamtdauer berechnet" },
      { label: "Handlungsempfehlung erstellt" },
    ];
    return (
      <div style={{ ...T.page, "--accent": C }}>
        <Header />
        <div style={{ padding: "64px 24px 32px", textAlign: "center" }} className="fade-in">
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#111", lineHeight: 1.3, marginBottom: "40px" }}>
            Wir berechnen Ihre Deckungslücke
            <br />
            für das gewählte Szenario…
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "320px", margin: "0 auto" }}>
            {STEPS.map(({ label }, i) => {
              const done = loadStep > i;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: done ? C : "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.35s ease",
                    }}
                  >
                    {done ? (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                        <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ddd" }} />
                    )}
                  </div>
                  <div style={{ fontSize: "14px", color: done ? "#111" : "#bbb", fontWeight: done ? "600" : "400", textAlign: "left", transition: "color 0.3s ease" }}>
                    {done ? "✓ " : "… "}
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 2) {
    const { kosten, kasse, luecke, gesamtLuecke, jahre, pctKasse, pctRente, pctLuecke } = R;
    const szenarioTitel = meta ? `${meta.heroName} ${meta.heroTag}` : "Ihr Szenario";
    const unterBalken = meta?.unterBalken ?? [];

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />

        <div style={{ ...T.resultHero, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={T.resultEyebrow}>Realitätscheck</div>
          <div style={{ ...T.resultNumber, textAlign: "center" }}>{fmtK(gesamtLuecke)}</div>
          <div style={T.resultUnit}>
            Zusätzlicher Kapitalbedarf für <strong style={{ color: "#374151" }}>{meta ? meta.heroName : "Ihr Szenario"}</strong>
            {meta?.heroTag ? <> {meta.heroTag}</> : null} über ca. <strong style={{ color: "#374151" }}>{jahre} Jahre</strong> (Ø-Dauer).
          </div>
          <div style={T.resultSub}>Vereinfachte Ø-Werte · auf Basis Ihrer Angaben</div>
        </div>

        <div style={T.section}>
          <div style={T.sectionLbl}>Monatliche Deckung (Übersicht)</div>
          <div style={{ maxWidth: "360px", margin: "0 auto" }}>
            <div style={{ display: "flex", height: "14px", borderRadius: "999px", overflow: "hidden", background: "#F3F4F6" }}>
              {pctKasse > 0 && (
                <div style={{ width: `${pctKasse}%`, minWidth: pctKasse > 0 ? "4px" : 0, background: OK, transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)" }} title="Pflegekasse" />
              )}
              {pctRente > 0 && (
                <div style={{ width: `${pctRente}%`, minWidth: pctRente > 0 ? "4px" : 0, background: BAR_RENTE, transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)" }} title="Rente" />
              )}
              {pctLuecke > 0 && (
                <div
                  style={{
                    width: `${pctLuecke}%`,
                    minWidth: pctLuecke > 0 ? "4px" : 0,
                    background: BAR_LUECKE,
                    boxShadow: "inset 0 0 0 1px #FECACA",
                    transition: "width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  title="Deckungslücke"
                />
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 18px", marginTop: "14px", fontSize: "11px", color: "#6B7280" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: OK, flexShrink: 0 }} />
                Gesetzliche Kasse
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: BAR_RENTE, flexShrink: 0 }} />
                Ihre Rente (Eigenbeitrag)
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: BAR_LUECKE, border: "1px solid #FECACA", flexShrink: 0 }} />
                Monatliche Deckungslücke
              </span>
            </div>
            <div style={{ marginTop: "16px", fontSize: "12px", color: "#6B7280", textAlign: "center", lineHeight: 1.55 }}>
              Ø Gesamtkosten {fmt(kosten)}/Mon. · Kasse {fmt(kasse)} · Ihre Rente {fmt(p.renteMonat)} · Lücke {fmt(luecke)}
            </div>
            {unterBalken.length > 0 && (
              <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #f0f0f0", textAlign: "left" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px" }}>
                  Finanzieller Impact · {meta?.heroName}
                </div>
                {unterBalken.map((b, i) => (
                  <div key={i} style={T.scenarioBulletRow}>
                    <span style={{ flexShrink: 0, fontSize: "13px", lineHeight: 1.4 }} aria-hidden>{b.kind === "ok" ? "✅" : "❌"}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={T.section}>
          <div style={T.sectionLbl}>Ihre Kennzahlen</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <div style={T.focusCard}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", marginBottom: "6px", letterSpacing: "0.02em" }}>Monatliche Lücke</div>
              <div style={{ ...T.focusCardKpi }}>{fmt(luecke)}</div>
              <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.55 }}>
                So viel fehlt Ihnen jeden Monat, um die Ø-Kosten im Szenario <strong>{szenarioTitel}</strong> zu decken.
              </div>
            </div>
            <div style={T.focusCard}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", marginBottom: "6px", letterSpacing: "0.02em" }}>Gesamtkosten-Lücke (Ø-Dauer)</div>
              <div style={{ ...T.focusCardKpi }}>{fmtK(gesamtLuecke)}</div>
              <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.55 }}>
                Monatliche Lücke × <strong>{jahre * 12} Monate</strong> — entspricht der Ø-Dauer dieses Szenarios (typisch {meta?.id === "intensiv" ? "2–3" : meta?.id === "lang" ? "6–10" : "4–6"} Jahre).
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "24px" }}>
          <div style={T.warnCard}>
            <div style={T.warnCardTitle}>Die „Sandwich-Falle“</div>
            <div style={T.warnCardText}>
              Wenn Ihre Rente nicht reicht, prüft das Sozialamt das Einkommen Ihrer Kinder (ab 100.000 € Brutto). Die emotionale Belastung der Familie ist jedoch oft noch schwerwiegender.
            </div>
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "16px" }}>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Modellrechnung mit Szenario-Dauer (Akut ca. 3 J., lange Begleitung ca. 8 J., ambulant oft 4–6 J., hier Ø 5 J.), Ø-Kostenbasis und Bedarfsfaktor. Monatliche Lücke = Ø-Gesamtkosten minus Kassenleistung minus von Ihnen angenommene Rente. Gesamtlücke = monatliche Lücke × Monate der Szenario-Dauer.{" "}
              <span style={{ color: "#b8884a" }}>Keine Rechtsberatung. Orientierung u. a. §43 SGB XI.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        <div style={{ ...T.section, marginBottom: "120px" }}>
          <div style={T.sectionLbl}>Strategie im Vergleich</div>
          <div style={T.compareGrid}>
            <div style={{ ...T.compareCard, borderTop: `3px solid ${C}` }}>
              <div style={T.compareCardTitle}>Pflegetagegeld</div>
              {[
                "Flexibel einsetzbar — sinnvoll in allen drei Szenarien (Akutfall, lange Begleitung, zu Hause).",
                "Laufende Liquidität für Zuzahlungen, ambulante Leistungen oder familiäre Entlastung.",
                "Vertragsgestaltung individuell — oft kombinierbar mit bestehender Absicherung.",
              ].map((line) => (
                <div key={line} style={T.compareBullet}>
                  <span style={bulletDot(C)} aria-hidden />
                  {line}
                </div>
              ))}
            </div>
            <div style={{ ...T.compareCard, borderTop: "3px solid #0369a1" }}>
              <div style={T.compareCardTitle}>Pflege-Bahr</div>
              {[
                "Staatlich geförderte Basisabsicherung (Pflegepflichtversicherung) mit steuerlicher Förderung.",
                "Fokus auf definierte Pflegebedarfe — weniger flexibel als reines Tagegeld.",
                "Sinnvoll als Ergänzung; genaue Leistungen vom Tarif und Anbieter abhängig.",
              ].map((line) => (
                <div key={line} style={T.compareBullet}>
                  <span style={bulletDot("#0369a1")} aria-hidden />
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={T.footer}>
          <button type="button" style={T.btnPrim(false)} onClick={() => goTo(3)}>Pflegevorsorge gemeinsam prüfen</button>
          <button type="button" style={T.btnSec} onClick={() => goTo(1)}>Neue Berechnung starten</button>
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
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", padding: "12px 14px", background: "#fafafa", marginBottom: "16px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: WARN, letterSpacing: "-0.3px" }}>{fmtK(R.gesamtLuecke)}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Gesamtlücke</div>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: WARN, letterSpacing: "-0.3px" }}>{fmt(R.luecke)}/Mon.</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Monatliche Lücke</div>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" }}>{meta ? meta.kurzLabel : "—"}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Szenario · ca. {R.jahre} J.</div>
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

  const BEDARF_OPTS = [
    { id: "gering", label: "Gering", desc: "Unterstützung bei einzelnen Alltagstätigkeiten nötig" },
    { id: "mittel", label: "Mittel", desc: "Regelmäßige Hilfe bei Körperpflege & Haushalt erforderlich" },
    { id: "hoch", label: "Hoch", desc: "Umfangreiche bis Rund-um-die-Uhr-Betreuung notwendig" },
  ];

  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header />

      {scr === 1 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Pflege-Check · 1 / 4</div>
            <div style={T.h1}>Welches Pflegeszenario bereitet Ihnen am meisten Sorge?</div>
            <div style={T.body}>Wir ordnen typische Kosten und eine geschätzte Dauer zu — als Orientierung für Ihre Vorsorge.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SelectionCard
                value="intensiv"
                label="Plötzliche Vollpflege"
                description="(Der Akutfall). Fokus: Maximale Entlastung im Heim nach Sturz oder Schlaganfall. Charakter: Sofortiger Bedarf an 24h-Betreuung (meist Pflegegrad 4 oder 5). Dauer: Ø 2–3 Jahre stationäre Pflege."
                selected={p.szenario === "intensiv"}
                accent={C}
                onClick={() => set("szenario", "intensiv")}
              />
              <SelectionCard
                value="lang"
                label="Lange Begleitung"
                description="(Der Demenzfall). Fokus: Langfristiger Kapitalerhalt über viele Jahre hinweg. Charakter: Schleichender Beginn (PG 2), der sich über ein Jahrzehnt steigern kann. Dauer: Ø 6–10 Jahre (Mix aus ambulanter und später stationärer Pflege)."
                selected={p.szenario === "lang"}
                accent={C}
                onClick={() => set("szenario", "lang")}
              />
              <SelectionCard
                value="zuhause"
                label="Würde zu Hause"
                description="(Der ambulante Fokus). Fokus: Selbstbestimmtes Leben in der eigenen Immobilie bis zum Schluss. Charakter: Fokus auf Pflegesachleistungen, Umbaumaßnahmen und Assistenz. Dauer: Individuell, oft 4–6 Jahre."
                selected={p.szenario === "zuhause"}
                accent={C}
                onClick={() => set("szenario", "zuhause")}
              />
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(!p.szenario)} disabled={!p.szenario} onClick={nextScr}>Weiter</button>
          </div>
        </>
      )}

      {scr === 2 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Pflege-Check · 2 / 4</div>
            <div style={T.h1}>Wie schätzen Sie Ihren möglichen Pflegebedarf ein?</div>
            <div style={T.body}>Die Einstufung skaliert die Ø-Kosten Ihres gewählten Szenarios.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {BEDARF_OPTS.map(({ id, label, desc }) => (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => set("bedarf", id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") set("bedarf", id); }}
                  style={{
                    padding: "18px",
                    border: `1.5px solid ${p.bedarf === id ? C : "rgba(17,24,39,0.06)"}`,
                    borderRadius: "18px",
                    background: p.bedarf === id ? `color-mix(in srgb, ${C} 8%, white)` : "rgba(255,255,255,0.96)",
                    cursor: "pointer",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
                    boxShadow: p.bedarf === id ? "0 10px 28px rgba(26,58,92,0.12)" : "0 2px 10px rgba(17,24,39,0.04)",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "600", color: p.bedarf === id ? C : "#1F2937", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(!p.bedarf)} disabled={!p.bedarf} onClick={nextScr}>Weiter</button>
            <button type="button" style={T.btnSec} onClick={backScr}>Zurück</button>
          </div>
        </>
      )}

      {scr === 3 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Pflege-Check · 3 / 4</div>
            <div style={T.h1}>Alter und Rente</div>
            <div style={T.body}>Ihr Alter beeinflusst Vorsorgebeiträge; die Rente zeigt, wie viel Sie monatlich selbst aufbringen können.</div>
          </div>
          <div style={T.section}>
            <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={25} max={75} step={1} unit="Jahre" display={`${p.alter} Jahre`} accent={C} onChange={(v) => set("alter", v)} />
            <SliderCard
              label="Rente für Pflege (monatlich)"
              value={p.renteMonat}
              min={0}
              max={4000}
              step={50}
              unit="€/Mon."
              display={p.renteMonat === 0 ? "Kein angenommener Renten-Eigenanteil" : `${fmt(p.renteMonat)} aus Rente / Einkünften`}
              hint="Was Sie realistisch aus Rente oder laufenden Einkünften für Pflegekosten einsetzen könnten (Netto)."
              accent={C}
              onChange={(v) => set("renteMonat", v)}
            />
            {p.alter < 50 && (
              <div style={{ marginTop: "12px", padding: "10px 12px", background: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0", fontSize: "12px", color: "#15803D", lineHeight: 1.5 }}>
                Guter Zeitpunkt: Vor 50 zahlen Sie für eine Absicherung oft deutlich weniger als mit 60+.
              </div>
            )}
            {p.alter >= 60 && (
              <div style={{ marginTop: "12px", padding: "10px 12px", background: "#FFFBEB", borderRadius: "8px", border: "1px solid #FCD34D", fontSize: "12px", color: "#92400E", lineHeight: 1.5 }}>
                Ab 60 steigen Beiträge und Gesundheitsanforderungen — jetzt ist ein guter Moment zu handeln.
              </div>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={nextScr}>Weiter</button>
            <button type="button" style={T.btnSec} onClick={backScr}>Zurück</button>
          </div>
        </>
      )}

      {scr === 4 && (
        <>
          <div style={T.hero}>
            <div style={T.eyebrow}>Pflege-Check · 4 / 4</div>
            <div style={T.h1}>Haben Sie bereits eine Pflegeabsicherung?</div>
            <div style={T.body}>Das hilft uns, Ihr Ergebnis passend einzuordnen.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SelectionCard value="nein" label="Nein" description="Sie sind bisher nicht privat gegen Pflegekosten abgesichert." selected={p.absicherung === "nein"} accent={C} onClick={() => set("absicherung", "nein")} />
              <SelectionCard value="ja" label="Ja" description="Sie haben bereits einen Pflegezusatztarif oder eine Pflegerente." selected={p.absicherung === "ja"} accent={C} onClick={() => set("absicherung", "ja")} />
              <SelectionCard value="unsicher" label="Unsicher" description="Sie sind nicht sicher, ob und in welchem Umfang Sie abgesichert sind." selected={p.absicherung === "unsicher"} accent={C} onClick={() => set("absicherung", "unsicher")} />
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={nextScr}>Lücke berechnen</button>
            <button type="button" style={T.btnSec} onClick={backScr}>Zurück</button>
          </div>
        </>
      )}
    </div>
  );
}
