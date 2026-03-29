import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";

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

function Footer({ onNext, onBack, label="Weiter →", disabled=false, T }) {
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
      <div style={{ fontSize:"20px",fontWeight:"700",color:"#111",letterSpacing:"-0.4px",marginBottom:"8px" }}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
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
  const TOTAL_SCR = 6;
  const goTo   = (ph) => { setAk(k => k + 1); setPhase(ph); };
  const nextScr = () => { if (scr < TOTAL_SCR) { setScr(s => s + 1); } else { goTo(2); } };
  const backScr = () => { if (scr > 1) { setScr(s => s - 1); } };
  useCheckScrollToTop([phase, ak, danke, scr]);

  const R = berechne(p);
  const TOTAL = 3;

  if (danke) return (
    <div style={{ ...T.page, "--accent": C }}>
      <Header phase={TOTAL} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T} />
      <DankeScreen name={name} onBack={() => { setDanke(false); setPhase(1); }} makler={MAKLER} C={C} />
    </div>
  );

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
            label={valid ? "Vorsorge gemeinsam planen" : "Bitte alle Angaben machen"}
            disabled={!valid}
            T={T}
          />
        )}
      </div>
    );
  }

  // Phase 2: Ergebnis
  if (phase === 2) {
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T} />

        {/* ── Hero: Headline, Lücke, Badge, Subline (zentriert) ─────────────── */}
        <div style={{ ...T.resultHero, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...T.resultEyebrow, width: "100%", textAlign: "center" }}>Ihre Vorsorgesituation</div>
            <div style={{ ...T.resultHeadline, width: "100%" }}>
              {R.lueckeAdjusted > 0 ? "Monatliche Rentenlücke" : "Ihre Vorsorge wirkt rund"}
            </div>
            <div style={{ ...T.resultNumber(R.lueckeAdjusted > 0), width: "100%", textAlign: "center" }}>
              {R.lueckeAdjusted > 0 ? fmt(R.lueckeAdjusted) : "Gedeckt"}
            </div>
            <div style={{ ...T.resultUnit, width: "100%", textAlign: "center" }}>
              {R.lueckeAdjusted > 0 ? "monatliche Lücke" : "Ihr Ziel ist mit den Angaben weitgehend erreichbar"}
            </div>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "4px" }}>
              {R.lueckeAdjusted > 0
                ? <div style={T.statusWarn}>Versorgungslücke erkannt</div>
                : <div style={T.statusOk}>Gut versorgt</div>
              }
            </div>
            <div style={{ ...T.resultSub, width: "100%", textAlign: "center" }}>
              {R.deckung}% gedeckt · {R.jahreBis} Jahre Ansparzeit · ca. {R.renteDauer} Jahre Rentenphase
              {!p.inflation && R.lueckeAdjusted > 0 && " · ohne Inflation gerechnet"}
            </div>
          </div>
        </div>

        {/* ── Gestapelter Progress-Balken (S1·S2·S3 + Rest = Lücke #FEE2E2) ─ */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Zielrente im Überblick</div>
          <div style={T.cardPrimary}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>100 % = Ihre Zielrente</span>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: GAP_BAR, border: "1px solid #FECACA", flexShrink: 0 }} />Lücke (Rest bis 100 %)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Kapitalwert: Mann 20J / Frau 24J (Formel aus Spezifikation) ──── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Gesamtkapitalbedarf (Orientierung)</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5, marginBottom: "12px" }}>
            Grobe Näherung ohne Abzinsung auf Basis der angezeigten Monatslücke: × 12 Monate × statistische Rentenphase (20 bzw. 24 Jahre).
          </div>
          <div style={T.compareGrid}>
            <div style={{ ...T.compareCard, borderTop: `3px solid ${S1}` }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px" }}>Mann (20 J)</div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.5px", marginBottom: "6px" }}>
                {fmt(R.lueckeAdjusted * 12 * 20)}
              </div>
            </div>
            <div style={{ ...T.compareCard, borderTop: `3px solid ${S2}` }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px" }}>Frau (24 J)</div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.5px", marginBottom: "6px" }}>
                {fmt(R.lueckeAdjusted * 12 * 24)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Lösungs-Vergleich: ETF vs. Rentenversicherung ─────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Lösungs-Vergleich</div>
          <div style={T.compareGrid}>
            {[
              {
                title: "ETF / Kapitalanlage",
                accent: S1,
                badge: "Flexibilität",
                bullets: [
                  "Ihr Kapital bleibt in der Regel flexibel anlegbar, umschichtbar und teilweise jederzeit verfügbar.",
                  "Vermögen ist oft vererbbar — Sie behalten die Kontrolle über den Nachlass.",
                  "Keine lebenslange Zahlungsgarantie: Bei langem Leben kann das Kapital nicht ausreichen.",
                ],
              },
              {
                title: "Rentenversicherung",
                accent: S3,
                badge: "Lebenslange Garantie",
                bullets: [
                  "Viele Tarife bieten eine vertraglich fixierte, lebenslange Rente — unabhängig davon, wie alt Sie werden.",
                  "Hohe Planungssicherheit für Ihre Fixkosten im Alter.",
                  "Geringere Flexibilität während der Ansparphase; typisch weniger Restkapital für Erben.",
                ],
              },
            ].map(({ title, accent, badge, bullets }) => (
              <div key={title} style={{ ...T.compareCard, borderTop: `3px solid ${accent}` }}>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
                  <div style={T.compareCardTitle}>{title}</div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: accent, background: `${accent}18`, padding: "3px 9px", borderRadius: "999px" }}>{badge}</span>
                </div>
                {bullets.slice(0, 3).map((line, j) => (
                  <div key={j} style={T.compareBullet}>
                    <span style={{ position: "absolute", left: 0, top: "0.5em", width: "5px", height: "5px", borderRadius: "50%", background: accent, opacity: 0.85 }} aria-hidden />
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Zeitfaktor: Preis des Wartens ─────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Zeitfaktor</div>
          <div style={T.warnCard}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#C0392B", marginBottom: "8px" }}>Der Preis des Wartens</div>
            <div style={{ fontSize: "13px", color: "#7B2A2A", lineHeight: 1.65, marginBottom: "12px" }}>
              Je länger Sie mit dem Aufbau zusätzlicher Vorsorge warten, desto höher wird die nötige Sparrate — der Zinseszinseffekt wirkt am stärksten, wenn Sie früh einsteigen.
            </div>
            <div style={{ ...T.compareGrid, gap: "8px" }}>
              <div style={{ padding: "10px 12px", background: "#F0FDF4", borderRadius: "10px", textAlign: "center", border: "1px solid #BBF7D0" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>Heute starten</div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "3px", lineHeight: 1.4 }}>Niedrigere Monatsrate<br />Maximaler Zinseszins</div>
              </div>
              <div style={{ padding: "10px 12px", background: "#FFF6F5", borderRadius: "10px", textAlign: "center", border: "1px solid #F2D4D0" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#C0392B" }}>5 Jahre warten</div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "3px", lineHeight: 1.4 }}>Deutlich höhere Rate<br />Weniger verbleibende Laufzeit</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Was das konkret bedeutet (Lücke) ─────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Was das konkret bedeutet</div>
          {R.lueckeAdjusted > 0 ? (
            <div style={T.warnCard}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#C0392B", marginBottom: "6px" }}>Lebensstandard ohne Nachbesserung</div>
              <div style={{ fontSize: "13px", color: "#7B2A2A", lineHeight: 1.65 }}>
                Ohne zusätzliche Vorsorge fehlen Ihnen im Rentenalter monatlich rund <strong style={{ color: "#C0392B" }}>{fmt(R.lueckeAdjusted)}</strong> zum gewählten Ziel — das entspricht grob einem Deckungsgrad von {R.deckung} % Ihres angestrebten Ruhestandsnettos.
              </div>
            </div>
          ) : (
            <div style={T.cardContext}>
              <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.65 }}>
                Mit Ihren Angaben ist die Zielrente voraussichtlich erreichbar. Trotzdem lohnt sich ein Abgleich mit Rentenbescheid und Verträgen — insbesondere bei Lebens- oder Berufsänderungen.
              </div>
            </div>
          )}
        </div>

        {/* ── Section 4: Das kann sinnvoll sein ────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Das kann sinnvoll sein</div>
          <div style={T.cardContext}>
            {[
              { label: "Bestehende Vorsorge prüfen", desc: "Rentenbescheid, alte Verträge und bAV-Ansprüche im Überblick — oft schlummert mehr als gedacht." },
              { label: "Kombinationen vergleichen", desc: "Gesetzliche Rente + bAV + private Vorsorge: der optimale Mix hängt von Beruf, Alter und Ziel ab." },
              { label: "Früh einsteigen lohnt sich", desc: "Jedes Jahr früher spart monatlichen Aufwand. Eine kleine Rate heute ist wertvoller als eine große Rate in 10 Jahren." },
            ].map(({ label, desc }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 2 ? "12px" : "0" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: `${C}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C }} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hinweis + Legal ───────────────────────────────────────────────── */}
        <div style={{ ...T.section, marginBottom: "120px" }}>
          {!p.inflation && (
            <div style={{ ...T.infoBox, marginBottom: "10px" }}>Ohne Inflation gerechnet — reale Kaufkraft kann im Alter geringer sein.</div>
          )}
          <div style={{ ...T.infoBox, marginBottom: "10px" }}>
            Tipp: Ihren Rentenbescheid finden Sie auf <strong>rentenauskunft.de</strong> oder im Online-Konto der Deutschen Rentenversicherung.
          </div>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Einordnung. Zielrente = Netto × {p.zielProzent} %. Gesetzliche Rente ohne Angabe: ca. 45 % des Nettos (Schätzwert). Lücke = Ziel − vorhandene Vorsorge.
              {p.inflation ? " Inflationsaufschlag: +20 % (vereinfacht)." : ""}
              {" "}<span style={{ color: "#b8884a" }}>Grundlage: §64 SGB VI.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} label="Vorsorge gemeinsam planen" T={T} />
      </div>
    );
  }

  // Phase 1: 6 Screens
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={scr} total={TOTAL_SCR} badge="Vorsorge-Check" makler={MAKLER} T={T} />

      {/* Screen 1: Alter */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check · 1 / 6</div>
          <div style={T.h1}>Wie alt sind Sie aktuell?</div>
          <div style={T.body}>Davon hängt ab, wie lange Sie noch für Ihre Rente ansparen können.</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={20} max={60} step={1} unit="Jahre"
            display={`noch ${R.jahreBis} Jahre bis zur Rente`} accent={C} onChange={v => set("alter", v)} />
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} label="Weiter →" T={T} />
      </>}

      {/* Screen 2: Renten-Alter */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check · 2 / 6</div>
          <div style={T.h1}>Wann möchten Sie in Rente gehen?</div>
          <div style={T.body}>Gesetzliches Rentenalter ist 67 — Frührentner-Abzüge sind möglich.</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Gewünschtes Rentenalter" value={p.rentenAlter} min={60} max={70} step={1} unit="Jahre"
            display={p.rentenAlter < 67 ? `${67 - p.rentenAlter} Jahre vor gesetzlicher Rente` : p.rentenAlter === 67 ? "Gesetzliches Rentenalter" : `${p.rentenAlter - 67} Jahre nach gesetzlicher Rente`}
            accent={C} onChange={v => set("rentenAlter", v)} />
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} label="Weiter →" T={T} />
      </>}

      {/* Screen 3: Netto-Einkommen */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check · 3 / 6</div>
          <div style={T.h1}>Wie viel verdienen Sie aktuell netto im Monat?</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Monatliches Nettoeinkommen" value={p.netto} min={1000} max={8000} step={100} unit="€/Mon"
            accent={C} onChange={v => set("netto", v)} />
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} label="Weiter →" T={T} />
      </>}

      {/* Screen 4: Zielrente */}
      {scr === 4 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check · 4 / 6</div>
          <div style={T.h1}>Wie viel Rente möchten Sie später haben?</div>
          <div style={T.body}>Als Anteil Ihres heutigen Nettoeinkommens. Standard: 70 %.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { v: 60, l: "60 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.6)}/Monat · Basisversorgung` },
              { v: 70, l: "70 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.7)}/Monat · Typisches Ziel ★`, star: true },
              { v: 80, l: "80 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.8)}/Monat · Guter Lebensstandard` },
              { v: 90, l: "90 % Ihres Einkommens", d: `= ca. ${fmt(p.netto * 0.9)}/Monat · Voller Lebensstandard` },
            ].map(({ v, l, d }) => (
              <SelectionCard key={v} value={String(v)} label={l} description={d}
                selected={p.zielProzent === v} accent={C} onClick={() => set("zielProzent", v)} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} label="Weiter →" T={T} />
      </>}

      {/* Screen 5: Bestehende Vorsorge */}
      {scr === 5 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check · 5 / 6</div>
          <div style={T.h1}>Was haben Sie bereits für Ihre Rente?</div>
          <div style={T.body}>Alle Felder sind optional — 0 wenn nicht vorhanden. Den genauen Betrag finden Sie im Rentenbescheid.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <SliderCard label="Gesetzliche Rente (laut Bescheid)" value={p.gesRente} min={0} max={3000} step={50} unit="€/Mon"
              display={p.gesRente === 0 ? "Unbekannt — wird geschätzt (ca. 45 % des Nettos)" : ""}
              accent={C} onChange={v => set("gesRente", v)} hint="0 wenn unbekannt — wir schätzen automatisch" />
            <SliderCard label="bAV / Riester" value={p.bav} min={0} max={1500} step={50} unit="€/Mon"
              display={p.bav === 0 ? "Nicht vorhanden" : ""}
              accent={C} onChange={v => set("bav", v)} hint="0 wenn kein Vertrag vorhanden" />
            <SliderCard label="Private Vorsorge" value={p.privat} min={0} max={2000} step={50} unit="€/Mon"
              display={p.privat === 0 ? "Nicht vorhanden" : ""}
              accent={C} onChange={v => set("privat", v)} hint="Private Rentenversicherung, Fondssparplan etc." />
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} label="Weiter →" T={T} />
      </>}

      {/* Screen 6: Inflation */}
      {scr === 6 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check · 6 / 6</div>
          <div style={T.h1}>Möchten Sie Inflation berücksichtigen?</div>
          <div style={T.body}>Mit Inflation erscheint die Lücke größer — dafür realistischer für die künftige Kaufkraft.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { v: false, l: "Nein — einfach & direkt",  d: "Lücke wird in heutigen Euro berechnet (Standard)", emoji: "🎯" },
              { v: true,  l: "Ja — realistischer",       d: "Lücke wird um ca. 20 % Inflationsaufschlag erhöht", emoji: "📈" },
            ].map(({ v, l, d, emoji }) => (
              <SelectionCard key={String(v)} value={String(v)} label={l} description={d}
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                selected={p.inflation === v} accent={C} onClick={() => set("inflation", v)} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} label="Ihr Ergebnis anzeigen" T={T} />
      </>}
    </div>
  );
}
