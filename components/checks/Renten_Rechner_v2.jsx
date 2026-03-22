"use client";

import { useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";

(() => {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #ffffff; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
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

const MAKLER = { name: "Max Mustermann", firma: "Mustermann Versicherungen", email: "kontakt@mustermann-versicherungen.de", telefon: "089 123 456 78", primaryColor: "#1a3a5c" };
const C = MAKLER.primaryColor;
const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n >= 1000 ? (Math.round(n / 1000) * 1000).toLocaleString("de-DE") + " €" : fmt(n);

const S1 = "#0369a1", S2 = "#7c3aed", S3 = "#059669", WARN = "#c0392b";

function berechne(p) {
  const { alter, rentenAlter, netto, zielProzent, gesRente, schicht1, schicht2, schicht3, beruf } = p;
  const jahreBis    = Math.max(1, rentenAlter - alter);
  const lebenserw   = 87;
  const renteDauer  = Math.max(1, lebenserw - rentenAlter);
  const ziel        = netto * (zielProzent / 100);
  const vorhanden   = gesRente + schicht1 + schicht2 + schicht3;
  const luecke      = Math.max(0, ziel - vorhanden);
  const deckung     = Math.min(100, Math.round((vorhanden / ziel) * 100));
  const r3 = 0.03, r6 = 0.06, entnahme = 0.035;
  const ansparA = ((Math.pow(1+r3,jahreBis)-1)/r3) * Math.pow(1+r3,jahreBis);
  const renteFak = (1 - Math.pow(1+r3,-renteDauer)) / r3;
  const rateA = luecke > 0 ? (luecke * 12 * renteFak) / ansparA : 0;
  const stVorteil = beruf === "selbst" ? Math.round(rateA*12*0.42*0.94) : Math.round(rateA*12*0.30*0.94);
  const nettoA = Math.max(0, rateA - stVorteil/12);
  const ansparB = ((Math.pow(1+r6,jahreBis)-1)/r6) * Math.pow(1+r6,jahreBis);
  const kapBedarf = luecke * 12 / entnahme;
  const rateB = luecke > 0 ? kapBedarf / ansparB : 0;
  const depotLeer = luecke > 0 ? Math.round(Math.log(kapBedarf * entnahme / (luecke*12)) / Math.log(1 + 0.04 - entnahme) * (-1)) : 99;
  const rateC = (rateA + rateB) / 2;
  const schichten = [
    { label: "Schicht 1", sub: "Gesetzl. Rente + Rürup", farbe: S1, betrag: gesRente + schicht1, anteil: ziel>0?Math.min(100,Math.round(((gesRente+schicht1)/ziel)*100)):0 },
    { label: "Schicht 2", sub: "bAV + Riester",           farbe: S2, betrag: schicht2, anteil: ziel>0?Math.min(100,Math.round((schicht2/ziel)*100)):0 },
    { label: "Schicht 3", sub: "Privat + ETF",            farbe: S3, betrag: schicht3, anteil: ziel>0?Math.min(100,Math.round((schicht3/ziel)*100)):0 },
  ];
  return { jahreBis, renteDauer, ziel, vorhanden, luecke, deckung, rateA, nettoA, stVorteil, rateB, rateC, kapBedarf, depotLeer, schichten, lebenserw };
}

const T = {
  page:    { minHeight: "100vh", background: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" },
  header:  { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { display: "flex", alignItems: "center", gap: "10px" },
  logoMk:  { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
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
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px 28px" },
  btnPrim: (d) => ({ width: "100%", padding: "13px 20px", background: d?"#e8e8e8":C, color: d?"#aaa":"#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: d?"default":"pointer" }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? WARN : "#111" }),
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
};

function LogoSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;
}

function Header({ phase, total, badge }) {
  return (
    <>
      <div style={T.header}>
        <div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{ fontSize:"13px",fontWeight:"600",color:"#111",letterSpacing:"-0.1px" }}>{MAKLER.firma}</span></div>
        <span style={T.badge}>{badge}</span>
      </div>
      <div style={T.prog}><div style={T.progFil((phase/total)*100)}/></div>
    </>
  );
}

function SliderField({ label, value, min, max, step, onChange, display, hint, unit="" }) {
  const [inputVal, setInputVal] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const handleSlider = (v) => { onChange(v); if(!focused) setInputVal(String(v)); };
  const handleBlur = () => {
    setFocused(false);
    const raw = parseFloat(inputVal.replace(/[^\d.-]/g,""));
    if(!isNaN(raw)) { const c=Math.min(max,Math.max(min,Math.round(raw/step)*step)); onChange(c); setInputVal(String(c)); }
    else setInputVal(String(value));
  };
  return (
    <div style={{ marginBottom: "22px" }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"8px" }}>
        <label style={{ ...T.fldLbl }}>{label}</label>
        <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <input type="text" inputMode="numeric" value={focused?inputVal:String(value)} placeholder={focused?"":String(value)}
            onFocus={()=>{setFocused(true);setInputVal(String(value));}} onBlur={handleBlur}
            onChange={e=>setInputVal(e.target.value)}
            style={{ width:"90px",padding:"5px 8px",border:`1px solid ${focused?C:"#e8e8e8"}`,borderRadius:"5px",fontSize:"14px",fontWeight:"600",color:focused?"#111":C,textAlign:"right",outline:"none",background:focused?"#fff":`${C}08`,fontFamily:"'DM Sans',system-ui,sans-serif" }}/>
          {unit && <span style={{ fontSize:"12px",color:"#999",flexShrink:0 }}>{unit}</span>}
        </div>
      </div>
      {!focused && display && <div style={{ fontSize:"12px",color:"#888",marginBottom:"8px" }}>{display}</div>}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>handleSlider(+e.target.value)} style={{ width:"100%","--accent":C }}/>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#ccc",marginTop:"4px" }}><span>{min}{unit?" "+unit:""}</span><span>{max}{unit?" "+unit:""}</span></div>
      {hint && <div style={T.fldHint}>{hint}</div>}
    </div>
  );
}

function Footer({ onNext, onBack, label="Weiter", disabled=false }) {
  return (
    <div style={T.footer}>
      <button style={T.btnPrim(disabled)} onClick={onNext} disabled={disabled}>{label}</button>
      {onBack && <button style={T.btnSec} onClick={onBack}>Zurück</button>}
    </div>
  );
}

function DankeScreen({ name, onBack }) {
  return (
    <div style={{ padding:"48px 24px", textAlign:"center" }} className="fade-in">
      <div style={{ width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontSize:"20px",fontWeight:"700",color:"#111",letterSpacing:"-0.4px",marginBottom:"8px" }}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{ fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px" }}>Wir melden uns innerhalb von 24 Stunden mit Ihrem persönlichen Rentenplan.</div>
      <div style={{ border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left" }}>
        <div style={{ padding:"14px 16px",borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px" }}>Ihr Berater</div>
          <div style={{ fontSize:"14px",fontWeight:"600",color:"#111" }}>{MAKLER.name}</div>
          <div style={{ fontSize:"12px",color:"#888",marginTop:"1px" }}>{MAKLER.firma}</div>
        </div>
        <div style={{ padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px" }}>
          <a href={`tel:${MAKLER.telefon}`} style={{ fontSize:"13px",color:C,fontWeight:"500" }}>{MAKLER.telefon}</a>
          <a href={`mailto:${MAKLER.email}`} style={{ fontSize:"13px",color:C,fontWeight:"500" }}>{MAKLER.email}</a>
        </div>
      </div>
      <button onClick={onBack} style={{ marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer" }}>Neue Berechnung starten</button>
    </div>
  );
}

export default function RentenRechner() {
  const demoCtx = useMakler();
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName] = useState("");
  const [showStrat, setShowStrat] = useState(null);
  const [fd, setFd] = useState({ name:"", email:"", tel:"" });
  const [p, setP] = useState({ alter:35, rentenAlter:67, netto:2800, zielProzent:80, gesRente:1200, schicht1:0, schicht2:0, schicht3:0, beruf:"angestellt" });
  const set = (k,v) => setP(x=>({...x,[k]:v}));
  const goTo = (ph) => { setAk(k=>k+1); setPhase(ph); window.scrollTo({top:0}); };
  const R = berechne(p);
  const TOTAL = 4;

  if (danke) return <div style={{...T.page,"--accent":C}}><Header phase={TOTAL} total={TOTAL} badge="Renten-Rechner"/><DankeScreen name={name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>;

  // Phase 4: Kontakt
  if (phase === 4) {
    const valid = fd.name.trim() && fd.email.trim();
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={4} total={TOTAL} badge="Renten-Rechner"/>
        <div style={T.hero}><div style={T.eyebrow}>Beratungsgespräch</div><div style={T.h1}>Rentenplan besprechen</div><div style={T.body}>Wir erstellen einen konkreten Sparplan mit echten Tarifen.</div></div>
        <div style={T.section}>
          <div style={{ ...T.infoBox, marginBottom:"16px" }}>
            <div style={{ display:"flex",gap:"24px" }}>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:WARN,letterSpacing:"-0.5px" }}>{fmt(R.luecke)}</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Monatliche Lücke</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:C,letterSpacing:"-0.5px" }}>{R.deckung}%</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Deckungsgrad</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px" }}>{R.jahreBis} J.</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>bis Rente</div></div>
            </div>
          </div>
          {demoCtx.isDemoMode ? (
            <DemoCTA slug={demoCtx.slug} />
          ) : (
          <>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
                <label style={T.fldLbl}>{l}{req?" *":""}</label>
                <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
              </div>
            ))}
          </div>
          <div style={{ fontSize:"11px",color:"#ccc",marginTop:"10px" }}>Vertraulich behandelt.</div>
          </>
          )}
        </div>
        {!demoCtx.isDemoMode && (
        <Footer onNext={()=>{if(valid){setName(fd.name);setDanke(true);}}} onBack={()=>goTo(3)} label="Gespräch anfragen" disabled={!valid}/>
        )}
        {demoCtx.isDemoMode && (
        <div style={{ padding:"0 24px 28px" }}><button type="button" style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
        )}
      </div>
    );
  }

  // Phase 3: Ergebnis
  if (phase === 3) {
    const strategien = [
      { id:"rente", label:"Nur Rente", sub:"Rürup / private Rentenversicherung", rate:R.rateA, hinweis:p.beruf==="selbst"?`Steuerersparnis ca. ${fmt(R.stVorteil)}/Jahr — Nettorate ${fmt(R.nettoA)}/Monat`:`Mit Steuerförderung ca. ${fmt(R.nettoA)}/Monat Netto`, pro:["Lebenslange Zahlung","Kein Kapitalmarktrisiko"], con:["Keine Flexibilität","Kein Kapital für Erben"] },
      { id:"etf",   label:"Nur ETF-Depot", sub:"Vermögensaufbau + Entnahmeplan 3,5%", rate:R.rateB, hinweis:`Kapitalziel: ${fmtK(R.kapitalBedarf)} — Depot reicht ca. ${R.depotLeer} Jahre`, pro:["Höchste Rendite (Ø 6%)","Kapital vererbbar","Flexibel"], con:[`Depot leer nach ${R.depotLeer} Jahren`,"Kapitalmarktrisiko"] },
      { id:"hybrid",label:"Hybrid (empfohlen)", sub:"50% Rente + 50% ETF", rate:R.rateC, hinweis:`${fmt(R.rateC/2)}/Mon. Rente + ${fmt(R.rateC/2)}/Mon. ETF`, pro:["Fixkosten lebenslang gesichert","Flexibilität durch ETF-Anteil","Risiko halbiert"], con:["Zwei Verträge zu pflegen"], highlight:true },
    ];
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL} badge="Renten-Rechner"/>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Rentenanalyse</div>
          <div style={T.h1}>{R.luecke>0?`${fmt(R.luecke)}/Monat fehlen ab ${p.rentenAlter}`:"Gut versorgt"}</div>
          <div style={T.body}>{R.deckung}% gedeckt · {R.jahreBis} Jahre Ansparzeit · Rentenphase ca. {R.renteDauer} Jahre</div>
        </div>

        {/* Schichten-Balken */}
        <div style={T.section}>
          <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px" }}>Vorsorge-Schichten</div>
          <div style={T.card}>
            <div style={{ padding:"14px 16px 8px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"8px" }}>
                <span style={{ fontSize:"12px",color:"#aaa" }}>Zielrente</span>
                <span style={{ fontSize:"13px",fontWeight:"700",color:"#111" }}>{fmt(R.ziel)}/Monat</span>
              </div>
              <div style={{ height:"6px",background:"#f0f0f0",borderRadius:"3px",overflow:"hidden",display:"flex",marginBottom:"12px" }}>
                {R.schichten.map((s,i)=><div key={i} style={{ width:`${s.anteil}%`,background:s.farbe,transition:"width 0.6s ease",minWidth:s.betrag>0?"2px":"0" }}/>)}
                {R.luecke>0&&<div style={{ flex:1,background:"#fee2e2",minWidth:"2px" }}/>}
              </div>
              {[...R.schichten,...(R.luecke>0?[{label:"Lücke",sub:"Nicht gedeckt",farbe:WARN,betrag:R.luecke,anteil:100-R.deckung}]:[])].map((s,i,arr)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                    <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:s.farbe,flexShrink:0 }}/>
                    <div><div style={{ fontSize:"12px",fontWeight:"500",color:"#333" }}>{s.label}</div><div style={{ fontSize:"11px",color:"#aaa" }}>{s.sub}</div></div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"13px",fontWeight:"600",color:s.farbe }}>{fmt(s.betrag)}/Mon.</div>
                    <div style={{ fontSize:"11px",color:"#aaa" }}>{s.anteil}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={T.divider}/>

        {/* Strategien */}
        {R.luecke > 0 && (
          <div style={T.section}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px" }}>3 Strategien zum Lückenschluss</div>
            <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
              {strategien.map(st=>(
                <div key={st.id} style={{ border:`1px solid ${st.highlight?C:"#e8e8e8"}`,borderRadius:"10px",overflow:"hidden" }}>
                  {st.highlight&&<div style={{ background:C,padding:"5px 14px",fontSize:"11px",fontWeight:"600",color:"#fff",letterSpacing:"0.3px" }}>Empfohlen</div>}
                  <div style={{ padding:"14px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px" }}>
                      <div><div style={{ fontSize:"14px",fontWeight:"600",color:"#111" }}>{st.label}</div><div style={{ fontSize:"11px",color:"#aaa",marginTop:"1px" }}>{st.sub}</div></div>
                      <div style={{ textAlign:"right",flexShrink:0,marginLeft:"12px" }}><div style={{ fontSize:"20px",fontWeight:"700",color:C,letterSpacing:"-0.5px" }}>{fmt(st.rate)}</div><div style={{ fontSize:"11px",color:"#aaa" }}>/ Monat</div></div>
                    </div>
                    <div style={{ fontSize:"12px",color:"#666",padding:"8px 10px",background:"#f9f9f9",borderRadius:"6px",marginBottom:"8px" }}>{st.hinweis}</div>
                    <button onClick={()=>setShowStrat(showStrat===st.id?null:st.id)} style={{ fontSize:"12px",color:"#aaa",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px" }}>
                      Details {showStrat===st.id?"ausblenden":"anzeigen"} <span style={{ fontSize:"10px" }}>{showStrat===st.id?"▲":"▼"}</span>
                    </button>
                    {showStrat===st.id&&(
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"10px" }}>
                        <div style={{ padding:"10px",background:"#f0fdf4",borderRadius:"6px" }}>
                          <div style={{ fontSize:"11px",fontWeight:"600",color:"#059669",marginBottom:"5px" }}>Vorteile</div>
                          {st.pro.map((v,i)=><div key={i} style={{ fontSize:"11px",color:"#444",marginBottom:"2px" }}>— {v}</div>)}
                        </div>
                        <div style={{ padding:"10px",background:"#fff9f9",borderRadius:"6px" }}>
                          <div style={{ fontSize:"11px",fontWeight:"600",color:WARN,marginBottom:"5px" }}>Nachteile</div>
                          {st.con.map((v,i)=><div key={i} style={{ fontSize:"11px",color:"#444",marginBottom:"2px" }}>— {v}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ ...T.section, marginBottom:"120px" }}>
          <div style={T.infoBox}>Näherungswerte auf Basis von Ø-Renditen. Für einen verbindlichen Sparplan empfehlen wir ein persönliches Gespräch.</div>
        </div>
        {demoCtx.isDemoMode ? (
          <>
            <DemoCTA slug={demoCtx.slug} />
            <div style={{ padding:"0 24px 28px" }}><button type="button" style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></div>
          </>
        ) : (
        <Footer onNext={()=>goTo(4)} onBack={()=>goTo(2)} label="Strategie besprechen"/>
        )}
      </div>
    );
  }

  // Phase 2: Vorhandene Vorsorge
  if (phase === 2) {
    const SchichtHeader = ({farbe, label}) => (
      <div style={{ display:"flex",alignItems:"center",gap:"8px",padding:"8px 4px 6px" }}>
        <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:farbe,flexShrink:0 }}/>
        <span style={{ fontSize:"11px",fontWeight:"600",color:farbe,letterSpacing:"0.5px",textTransform:"uppercase" }}>{label}</span>
      </div>
    );
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL} badge="Renten-Rechner"/>
        <div style={T.hero}><div style={T.eyebrow}>Schritt 2 von 3 · Vorhandene Vorsorge</div><div style={T.h1}>Was haben Sie bereits?</div><div style={T.body}>Prognostizierte monatliche Rentenleistungen aus Ihren Verträgen.</div></div>
        <div style={T.section}>
          <SchichtHeader farbe={S1} label="Schicht 1 — Basisversorgung"/>
          <div style={T.card}>
            <div style={T.row}><SliderField label="Gesetzliche Rente" value={p.gesRente} min={0} max={3000} step={50} unit="€/Mon" hint="Aus dem jährlichen Rentenbescheid der DRV" onChange={v=>set("gesRente",v)}/></div>
            <div style={T.rowLast}><SliderField label="Rürup-Rente / Direktzusage" value={p.schicht1} min={0} max={2000} step={50} unit="€/Mon" onChange={v=>set("schicht1",v)}/></div>
          </div>
          <SchichtHeader farbe={S2} label="Schicht 2 — Zusatzversorgung"/>
          <div style={T.card}>
            <div style={T.rowLast}><SliderField label="bAV + Riester" value={p.schicht2} min={0} max={1500} step={25} unit="€/Mon" hint="Aus Jahresbescheinigungen Ihrer Verträge" onChange={v=>set("schicht2",v)}/></div>
          </div>
          <SchichtHeader farbe={S3} label="Schicht 3 — Privatvorsorge"/>
          <div style={T.card}>
            <div style={T.rowLast}><SliderField label="Private Rente + ETF-Entnahme" value={p.schicht3} min={0} max={3000} step={50} unit="€/Mon" onChange={v=>set("schicht3",v)}/></div>
          </div>
        </div>
        <Footer onNext={()=>goTo(3)} onBack={()=>goTo(1)} label="Rentenlücke berechnen"/>
      </div>
    );
  }

  // Phase 1: Basisdaten
  return (
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <Header phase={1} total={TOTAL} badge="Renten-Rechner"/>
      <div style={T.hero}><div style={T.eyebrow}>Schritt 1 von 3 · Ihre Situation</div><div style={T.h1}>Wie sieht Ihre Rente aus?</div><div style={T.body}>Wir berechnen Ihre Rentenlücke und zeigen drei Strategien zum Lückenschluss.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Aktuelles Nettoeinkommen" value={p.netto} min={1000} max={8000} step={100} unit="€/Mon" onChange={v=>set("netto",v)}/></div>
          <div style={T.row}><SliderField label="Aktuelles Alter" value={p.alter} min={20} max={60} step={1} unit="Jahre" display={`noch ${R.jahreBis} Jahre bis zur Rente`} onChange={v=>set("alter",v)}/></div>
          <div style={T.row}><SliderField label="Gewünschtes Rentenalter" value={p.rentenAlter} min={60} max={70} step={1} unit="Jahre" display={`Rentenphase ca. ${R.renteDauer} Jahre (Ø Lebenserwartung ${R.lebenserw})`} onChange={v=>set("rentenAlter",v)}/></div>
          <div style={T.row}><SliderField label="Gewünschtes Rentenniveau" value={p.zielProzent} min={50} max={100} step={5} unit="%" display={`= ${fmt(R.ziel)}/Monat Zielrente`} onChange={v=>set("zielProzent",v)}/></div>
          <div style={T.rowLast}>
            <label style={T.fldLbl}>Berufsstatus</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginTop:"8px" }}>
              {[["angestellt","Angestellt"],["selbst","Selbstständig"],["beamter","Beamter"]].map(([v,l])=>(
                <button key={v} style={T.optBtn(p.beruf===v)} onClick={()=>set("beruf",v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer onNext={()=>goTo(2)} label="Vorhandene Vorsorge eingeben"/>
    </div>
  );
}
