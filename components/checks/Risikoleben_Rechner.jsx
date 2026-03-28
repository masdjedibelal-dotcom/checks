import { useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";

(() => {
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
    html, body { height:100%; background:#fff; font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased; }
    button, input { font-family:inherit; cursor:pointer; border:none; background:none; }
    input { cursor:text; }
    ::-webkit-scrollbar { display:none; } * { scrollbar-width:none; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:none;} }
    .anim-fadeup { animation:fadeUp 0.28s ease both; }
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
const WARN_RL = "#c0392b";

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
  const [animKey, setAnimKey] = useState(0);
  const [p, setP] = useState({ monatsBedarf: 2500, laufzeit: 20, partnerEinkommen: 1200, witwenRente: 700, sonstiges: 0, kredite: 0, vorhanden: 0 });
  const [formData, setFormData] = useState({ name: "", email: "", telefon: "" });
  const [scr, setScr] = useState(1);
  const goTo    = (ph) => { setAnimKey(k => k + 1); setPhase(ph); };
  const nextScr = () => { if (scr < 4) { setScr(s => s + 1); } else { goTo(2); } };
  const backScr = () => { if (scr > 1) { setScr(s => s - 1); } };
  useCheckScrollToTop([phase, animKey, scr]);
  const set     = (k, v) => setP(x => ({ ...x, [k]: v }));
  const R       = berechne(p);
  const progPct = phase === 1 ? scr * 22 : { 2: 88, 3: 100, 4: 100 }[phase] || 0;

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
    opt3:    { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"6px", marginTop:"8px" },
    optBtn:  (a) => ({ padding:"9px 8px", borderRadius:"6px", border:`1px solid ${a?C:"#e8e8e8"}`, background:a?C:"#fff", fontSize:"13px", fontWeight:a?"600":"400", color:a?"#fff":"#444", transition:"all 0.15s", textAlign:"center", cursor:"pointer" }),
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
    sectionLbl: { fontSize:"13px", fontWeight:"600", color:"#6B7280", marginBottom:"12px", padding:"0 16px" },
    recCard: { margin:"0 16px 16px", border:"1px solid rgba(17,24,39,0.08)", borderRadius:"18px", overflow:"hidden", background:"#fff", boxShadow:"0 4px 16px rgba(17,24,39,0.06)" },
    recRow: { padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"1px solid rgba(17,24,39,0.04)" },
    recRowLast: { padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
    recLabel: { fontSize:"14px", fontWeight:"600", color:"#1F2937" },
    recSub: { fontSize:"12px", color:"#9CA3AF", marginTop:"3px", lineHeight:1.4 },
    recValue: { fontSize:"18px", fontWeight:"700", color:C, letterSpacing:"-0.5px", textAlign:"right", flexShrink:0, marginLeft:"12px" },
    recValueSub: { fontSize:"11px", color:"#9CA3AF", textAlign:"right", marginTop:"2px" },
    progBarTrack: { height:"10px", background:"#F3F4F6", borderRadius:"999px", overflow:"hidden", marginTop:"10px" },
    progBarFill: (pct, color) => ({ height:"100%", width:`${pct}%`, background:color, borderRadius:"999px", transition:"width 0.7s cubic-bezier(0.34,1.56,0.64,1)" }),
    dataCard: { margin:"0 16px 10px", background:"#FAFAF8", border:"1px solid rgba(17,24,39,0.05)", borderRadius:"16px" },
    dataRow: { padding:"12px 18px", borderBottom:"1px solid rgba(17,24,39,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" },
    dataRowLast: { padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" },
    dataLabel: { fontSize:"13px", color:"#6B7280" },
    dataValue: { fontSize:"14px", fontWeight:"600", color:"#1F2937", letterSpacing:"-0.2px" },
  };

  const Shell = ({ eyebrow, title, lead, children, footer }) => (
    <div style={T.root}>
      <div style={T.header}><div style={T.logoWrap}><div style={T.logoBox}>❤️</div><span style={T.logoTxt}>{MAKLER.firma}</span></div><span style={T.badge}>Risikoleben</span></div>
      <div style={T.progBar}><div style={T.progFill} /></div>
      <div key={animKey} className="anim-fadeup" style={T.body}>
        <div style={T.hero}>{eyebrow&&<div style={T.eyebrow}>{eyebrow}</div>}{title&&<h1 style={T.h1}>{title}</h1>}{lead&&<p style={T.lead}>{lead}</p>}</div>
        {children}
      </div>
      {footer&&<div style={T.footer}>{footer}</div>}
    </div>
  );

  // ── Phase 1: Eingabe (4 Screens, kein Intro) ─────────────────────────────
  if (phase === 1) {
    const SliderBlock = ({ label, value, display, min, max, step, hint, onChange, unit = "€/Mon." }) => (
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>{label}</div>
        <div style={{ fontSize: "28px", fontWeight: "800", color: C, letterSpacing: "-1px", lineHeight: 1, marginBottom: "10px" }}>
          {display || (value === 0 ? "Nicht vorhanden" : `${Math.round(Math.abs(value)).toLocaleString("de-DE")} ${unit}`)}
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ width: "100%" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
          <span>{min.toLocaleString("de-DE")} {unit}</span><span>{max.toLocaleString("de-DE")} {unit}</span>
        </div>
        {hint && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", lineHeight: 1.5 }}>{hint}</div>}
      </div>
    );

    return (
      <Shell
        eyebrow={`Risikoleben-Check · ${scr} / 4`}
        title={
          scr === 1 ? "Wie viel braucht Ihre Familie monatlich?" :
          scr === 2 ? "Wie lange soll Ihre Familie abgesichert sein?" :
          scr === 3 ? "Welche Einnahmen bestehen bereits?" :
          "Welche finanziellen Verpflichtungen bestehen?"
        }
        lead={
          scr === 1 ? "Miete/Kredit, Lebenshaltung, Kinder — alles zusammen." :
          scr === 2 ? "Z. B. bis die Kinder selbstständig sind oder bis zur Rente." :
          scr === 3 ? "Alle Felder sind optional — 0 wenn nicht vorhanden." :
          "Kredite, die im Ernstfall sofort abgelöst werden müssten."
        }
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button style={T.btnMain(false)} onClick={nextScr}>{scr < 4 ? "Weiter" : "Ergebnis anzeigen"}</button>
            {scr > 1 && <button style={T.btnBack} onClick={backScr}>Zurück</button>}
          </div>
        }
      >
        <div style={{ padding: "0 16px" }}>

          {/* Screen 1: Monatsbedarf */}
          {scr === 1 && (
            <div style={{ ...T.card, marginTop: "8px" }}><div style={{ padding: "20px" }}>
              <SliderBlock
                label="Monatlicher Bedarf der Familie"
                value={p.monatsBedarf} min={500} max={8000} step={100}
                display={`${p.monatsBedarf.toLocaleString("de-DE")} €/Monat`}
                unit="" onChange={v => set("monatsBedarf", v)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                {[
                  { icon: "🏠", label: "Miete / Kredit", desc: "Warmmiete oder Kreditrate inkl. Nebenkosten" },
                  { icon: "🛒", label: "Lebenshaltung", desc: "Lebensmittel, Mobilität, Freizeit, Versicherungen" },
                  { icon: "👶", label: "Kinder", desc: "Betreuung, Schule, Sport, Kleidung" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", background: "#FAFAF8", borderRadius: "10px", border: "1px solid rgba(17,24,39,0.05)" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#1F2937" }}>{label}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div></div>
          )}

          {/* Screen 2: Laufzeit */}
          {scr === 2 && (
            <div style={{ ...T.card, marginTop: "8px" }}><div style={{ padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>Absicherungszeitraum</div>
              <div style={{ fontSize: "44px", fontWeight: "800", color: C, letterSpacing: "-2px", lineHeight: 1, marginBottom: "14px" }}>
                {p.laufzeit} <span style={{ fontSize: "18px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0" }}>Jahre</span>
              </div>
              <input type="range" min={5} max={30} step={1} value={p.laufzeit} onChange={e => set("laufzeit", +e.target.value)} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
                <span>5 Jahre</span><span>30 Jahre</span>
              </div>
              <div style={{ marginTop: "14px", padding: "12px 14px", background: "#F0F9FF", borderRadius: "10px", border: "1px solid #BAE6FD", fontSize: "12px", color: "#0369A1", lineHeight: 1.55 }}>
                💡 Empfehlung: Absicherung bis das jüngste Kind selbstständig ist oder bis zur Rente — mindestens 15–20 Jahre.
              </div>
            </div></div>
          )}

          {/* Screen 3: Einnahmen (3 Slider) */}
          {scr === 3 && (
            <div style={{ ...T.card, marginTop: "8px" }}><div style={{ padding: "20px" }}>
              <SliderBlock
                label="Partnereinkommen (monatlich netto)"
                value={p.partnerEinkommen} min={0} max={6000} step={100}
                display={p.partnerEinkommen === 0 ? "Kein Einkommen" : undefined}
                unit="€/Mon." onChange={v => set("partnerEinkommen", v)}
                hint="Nettoeinkommen nach Steuern und Abgaben"
              />
              <SliderBlock
                label="Witwen-/Waisenrente (gesetzlich, ca.)"
                value={p.witwenRente} min={0} max={2000} step={50}
                display={p.witwenRente === 0 ? "Nicht vorhanden / unbekannt" : undefined}
                unit="€/Mon." onChange={v => set("witwenRente", v)}
                hint="Ca. 55 % der gesetzlichen Rentenanwartschaft — 0 wenn unbekannt"
              />
              <SliderBlock
                label="Sonstige Einnahmen (monatlich)"
                value={p.sonstiges} min={0} max={2000} step={50}
                display={p.sonstiges === 0 ? "Keine weiteren Einnahmen" : undefined}
                unit="€/Mon." onChange={v => set("sonstiges", v)}
                hint="Mieteinnahmen, Kapitalerträge etc."
              />
            </div></div>
          )}

          {/* Screen 4: Verpflichtungen (2 Slider) */}
          {scr === 4 && (
            <div style={{ ...T.card, marginTop: "8px" }}><div style={{ padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>Kredite / Darlehen (Restschuld)</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: p.kredite > 0 ? WARN_RL : "#111", letterSpacing: "-1px", lineHeight: 1, marginBottom: "10px" }}>
                {p.kredite === 0 ? "Keine" : `${Math.round(p.kredite).toLocaleString("de-DE")} €`}
              </div>
              <input type="range" min={0} max={800000} step={5000} value={p.kredite} onChange={e => set("kredite", +e.target.value)} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#d1d5db", marginTop: "4px", marginBottom: "20px" }}>
                <span>0 €</span><span>800.000 €</span>
              </div>

              <div style={{ fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>Bestehende Risikolebensversicherung</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: p.vorhanden > 0 ? "#059669" : "#111", letterSpacing: "-1px", lineHeight: 1, marginBottom: "10px" }}>
                {p.vorhanden === 0 ? "Nicht vorhanden" : `${Math.round(p.vorhanden).toLocaleString("de-DE")} €`}
              </div>
              <input type="range" min={0} max={1000000} step={10000} value={p.vorhanden} onChange={e => set("vorhanden", +e.target.value)} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
                <span>0 €</span><span>1.000.000 €</span>
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", lineHeight: 1.5 }}>Versicherungssumme bestehender Policen — 0 wenn keine vorhanden</div>
            </div></div>
          )}

        </div>
      </Shell>
    );
  }

  // ── Phase 2: Ergebnis ────────────────────────────────────────────────────
  if (phase === 2) {
    const { einnahmen, luecke, gesamt, netto } = R;
    const gedeckt = netto <= 0;

    return (
      <Shell eyebrow={undefined} title={undefined} lead={undefined}
        footer={
          <>
            <button style={T.btnMain(false)} onClick={() => goTo(3)}>Familie gemeinsam absichern</button>
            <button style={T.btnBack} onClick={() => goTo(1)}>Neue Berechnung starten</button>
          </>
        }
      >

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Absicherung Ihrer Familie</div>
          <div style={T.resultNumber(!gedeckt)}>
            {gedeckt ? "Gedeckt" : fmtK(netto)}
          </div>
          <div style={T.resultUnit}>
            {gedeckt ? "kein wesentlicher Absicherungsbedarf" : "empfohlener Absicherungsbedarf"}
          </div>
          {gedeckt
            ? <div style={T.statusOk}>Gut abgesichert</div>
            : <div style={T.statusWarn}>Absicherungslücke erkannt</div>
          }
          <div style={T.resultSub}>vereinfachte Berechnung · {p.laufzeit} Jahre · auf Basis Ihrer Angaben</div>
        </div>

        {/* ── Breakdown Visual ──────────────────────────────────────────────── */}
        <div style={T.sectionLbl}>Wie sich der Bedarf zusammensetzt</div>
        <div style={{ margin: "0 16px 16px" }}>
          <div style={T.cardPrimary}>
            {[
              { l: "Monatsbedarf Familie",    v: fmt(p.monatsBedarf) + "/Mon.", c: "#1F2937", bold: false },
              { l: "Vorhandene Einnahmen",     v: "− " + fmt(einnahmen) + "/Mon.", c: "#059669", bold: false },
              { l: "Monatliche Lücke",         v: fmt(luecke) + "/Mon.", c: luecke > 0 ? WARN_RL : "#059669", bold: true, border: true },
              { l: "+ Kredite / Darlehen",     v: "+ " + fmtK(p.kredite), c: "#1F2937", bold: false },
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
        <div style={T.sectionLbl}>Was das bedeutet</div>
        <div style={{ margin: "0 16px 16px" }}>
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

        {/* ── Section 2: Was oft unterschätzt wird (EMOTIONAL) ─────────────── */}
        <div style={T.sectionLbl}>Was oft unterschätzt wird</div>
        <div style={{ margin: "0 16px 16px" }}>
          <div style={T.warnCard}>
            <div style={T.warnCardTitle}>Versteckte Belastungen im Ernstfall</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              {[
                { icon: "👶", text: "Betreuungskosten steigen — Kita, Tagesmutter oder Nachmittagsbetreuung werden plötzlich allein getragen." },
                { icon: "⏰", text: "Der verbleibende Partner arbeitet oft weniger — um die Kinder zu betreuen, was das Einkommen weiter reduziert." },
                { icon: "🏥", text: "Trauer, Stress und administrative Belastung kosten Energie und können Arbeitskapazität verringern." },
              ].map(({ icon, text }, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                  <div style={{ fontSize: "12px", color: "#7B2A2A", lineHeight: 1.6 }}>{text}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#9CA3AF", fontStyle: "italic" }}>
              Diese Faktoren sind in der Berechnung nicht enthalten — der tatsächliche Bedarf liegt häufig höher.
            </div>
          </div>
        </div>

        {/* ── Section 3: Was bereits abgedeckt ist ──────────────────────────── */}
        <div style={T.sectionLbl}>Was bereits abgedeckt ist</div>
        <div style={{ margin: "0 16px 16px" }}>
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
        <div style={T.sectionLbl}>Das kann sinnvoll sein</div>
        <div style={{ margin: "0 16px 16px" }}>
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

        {/* ── Legal ─────────────────────────────────────────────────────────── */}
        <div style={{ padding: "0 16px 120px" }}>
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

  if (phase===3) {
    const valid = formData.name.trim()&&formData.email.trim();
    return (
      <Shell eyebrow="Fast geschafft" title="Wo können wir dich erreichen?" lead="Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis."
        footer={isDemo ? (
          <>
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
            <button type="button" style={T.btnBack} onClick={()=>goTo(2)}>← Zurück</button>
          </>
        ) : (
          <><button style={T.btnMain(!valid)} disabled={!valid} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"risikoleben",kundenName:formData.name,kundenEmail:formData.email,kundenTel:formData.telefon||""})}).catch(()=>{});}goTo(4);}}>{valid?"Familie absichern":"Bitte alle Angaben machen"}</button><button style={T.btnBack} onClick={()=>goTo(2)}>Zurück</button></>
        )}>
        <div style={{padding:"0 16px"}}>
          {isDemo && (
            <div style={{ fontSize: "13px", color: "#999", textAlign: "center", marginBottom: "14px", lineHeight: 1.5 }}>
              Live-Vorschau für Sie als Makler — Ihr Kunde durchläuft dieselben Schritte; „Anpassen & kaufen“ öffnet den Konfigurator.
            </div>
          )}
          <div style={{background:alpha(C,0.06),border:`1.5px solid ${alpha(C,0.14)}`,borderRadius:"10px",padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",fontWeight:"700",color:C,marginBottom:"4px"}}>Ihre Berechnung</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div><div style={{fontSize:"11px",color:"#9ca3af"}}>Absicherungsbedarf</div><div style={{fontSize:"16px",fontWeight:"800",color:"#dc2626"}}>{fmtK(R.netto > 0 ? R.netto : R.gesamt)}</div></div>
              <div><div style={{fontSize:"11px",color:"#9ca3af"}}>Laufzeit</div><div style={{fontSize:"16px",fontWeight:"800",color:C}}>{p.laufzeit} Jahre</div></div>
            </div>
          </div>
          <div style={T.card}><div style={{padding:"20px"}}>
            {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"telefon",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint})=>(
              <div key={k} style={T.iWrap}><label style={T.iLabel}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={formData[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} style={T.input}/>{hint&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"4px"}}>{hint}</div>}</div>
            ))}
            <p style={{fontSize:"11px",color:"#aaa",marginTop:"4px"}}>Vertraulich behandelt.</p>
          </div></div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{padding:"48px 20px 0",textAlign:"center"}} className="anim-fadeup">
        <div style={{width:"72px",height:"72px",borderRadius:"50%",background:alpha(C,0.1),color:C,fontSize:"28px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>✓</div>
        <h1 style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px",marginBottom:"8px"}}>{formData.name?`Danke, ${formData.name.split(" ")[0]}.`:"Anfrage gesendet."}</h1>
        <p style={{fontSize:"14px",color:"#666",lineHeight:1.65}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</p>
      </div>
      <div style={{padding:"24px 16px 0"}}>
        <div style={{...cardLift,overflow:"hidden"}}>
          <div style={{padding:"16px 18px",borderBottom:"1px solid #f0f0f0"}}>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",color:"#999",marginBottom:"5px"}}>Dein Berater</div>
            <div style={{fontSize:"15px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div>
            <div style={{fontSize:"13px",color:"#888"}}>{MAKLER.firma}</div>
          </div>
          <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:"10px"}}>
            <a href={`tel:${MAKLER.telefon}`} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",color:C,fontWeight:"500"}}><span style={{width:"34px",height:"34px",borderRadius:"9px",background:alpha(C,0.08),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>📞</span>{MAKLER.telefon}</a>
            <a href={`mailto:${MAKLER.email}`} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",color:C,fontWeight:"500"}}><span style={{width:"34px",height:"34px",borderRadius:"9px",background:alpha(C,0.08),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>✉️</span>{MAKLER.email}</a>
          </div>
        </div>
      </div>
      <div style={{textAlign:"center",marginTop:"20px"}}>
        <button onClick={()=>goTo(1)} style={{fontSize:"13px",color:"#aaa",cursor:"pointer",background:"none",border:"none"}}>Neuen Check starten</button>
      </div>
    </Shell>
  );
}
