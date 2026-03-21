"use client";

import { useState } from "react";

(() => {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } html, body { height: 100%; background: #ffffff; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; } button, input, select { font-family: inherit; border: none; background: none; cursor: pointer; } input, select { cursor: text; } ::-webkit-scrollbar { display: none; } * { scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } } .fade-in { animation: fadeIn 0.28s ease both; } button:active { opacity: 0.75; } input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; border-radius: 1px; background: #e5e5e5; cursor: pointer; } input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; box-shadow: 0 0 0 1px var(--accent); } a { text-decoration: none; }`;
  document.head.appendChild(s);
})();

const MAKLER = { name: "Max Mustermann", firma: "Mustermann Versicherungen", email: "kontakt@mustermann-versicherungen.de", telefon: "089 123 456 78", primaryColor: "#1a3a5c" };
const C = MAKLER.primaryColor;
const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n >= 10000 ? Math.round(n/1000) + ".000 €" : fmt(n);
const WARN = "#c0392b";

function berechne(p) {
  const { monatsBedarf, jahre, kredite, witwerRente, waisenRenten, partnerEinkommen, vorhandeneVS } = p;
  const gesWitwe   = witwerRente;
  const gesWaisen  = waisenRenten;
  const gesGesetzl = gesWitwe + gesWaisen;
  const eigenBedarf = Math.max(0, monatsBedarf - gesGesetzl - partnerEinkommen);
  const kapBedarf  = eigenBedarf * 12 * jahre;
  const gesamtBedarf = kapBedarf + kredite;
  const luecke     = Math.max(0, gesamtBedarf - vorhandeneVS);
  const deckung    = vorhandeneVS > 0 ? Math.min(100, Math.round((vorhandeneVS / gesamtBedarf) * 100)) : 0;
  return { gesGesetzl, eigenBedarf, kapBedarf, gesamtBedarf, luecke, deckung };
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
  fldLbl:  { fontSize: "12px", fontWeight: "600", color: "#444", display: "block" },
  fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px 28px" },
  btnPrim: (d) => ({ width: "100%", padding: "13px 20px", background: d?"#e8e8e8":C, color: d?"#aaa":"#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: d?"default":"pointer" }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? WARN : "#111" }),
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
  optBtn:  (a) => ({ padding: "9px 14px", borderRadius: "6px", border: `1px solid ${a?C:"#e8e8e8"}`, background: a?C:"#fff", fontSize: "13px", fontWeight: a?"600":"400", color: a?"#fff":"#444", transition: "all 0.15s", cursor: "pointer" }),
};

function LogoSVG() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>; }

function Header({ phase, total, badge }) {
  return (<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{ fontSize:"13px",fontWeight:"600",color:"#111",letterSpacing:"-0.1px" }}>{MAKLER.firma}</span></div><span style={T.badge}>{badge}</span></div><div style={T.prog}><div style={T.progFil((phase/total)*100)}/></div></>);
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
    <div style={{ marginBottom:"22px" }}>
      <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"8px" }}>
        <label style={T.fldLbl}>{label}</label>
        <div style={{ display:"flex",alignItems:"center",gap:"4px" }}>
          <input type="text" inputMode="numeric" value={focused?inputVal:String(value)} placeholder={focused?"":String(value)}
            onFocus={()=>{setFocused(true);setInputVal(String(value));}} onBlur={handleBlur} onChange={e=>setInputVal(e.target.value)}
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

function DankeScreen({ name, onBack }) {
  return (
    <div style={{ padding:"48px 24px",textAlign:"center" }} className="fade-in">
      <div style={{ width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontSize:"20px",fontWeight:"700",color:"#111",letterSpacing:"-0.4px",marginBottom:"8px" }}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{ fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px" }}>Wir melden uns innerhalb von 24 Stunden.</div>
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

export default function RisikoLebenRechner() {
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName] = useState("");
  const [fd, setFd] = useState({ name:"",email:"",tel:"" });
  const [p, setP] = useState({ monatsBedarf:2500, jahre:20, kredite:0, witwerRente:600, waisenRenten:200, partnerEinkommen:0, vorhandeneVS:0 });
  const set = (k,v) => setP(x=>({...x,[k]:v}));
  const goTo = (ph) => { setAk(k=>k+1); setPhase(ph); window.scrollTo({top:0}); };
  const R = berechne(p);
  const TOTAL = 3;

  if (danke) return <div style={{...T.page,"--accent":C}}><Header phase={TOTAL} total={TOTAL} badge="Risikoleben"/><DankeScreen name={name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>;

  if (phase === 3) {
    const valid = fd.name.trim() && fd.email.trim();
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL} badge="Risikoleben"/>
        <div style={T.hero}><div style={T.eyebrow}>Beratungsgespräch</div><div style={T.h1}>Absicherung einrichten</div><div style={T.body}>Wir erstellen ein konkretes Angebot für Ihre Situation.</div></div>
        <div style={T.section}>
          <div style={{ ...T.infoBox,marginBottom:"16px" }}>
            <div style={{ display:"flex",gap:"24px" }}>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:WARN,letterSpacing:"-0.5px" }}>{fmtK(R.luecke)}</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Fehlende Summe</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px" }}>{fmtK(R.gesamtBedarf)}</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Gesamtbedarf</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:R.deckung>70?C:WARN,letterSpacing:"-0.5px" }}>{R.deckung}%</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Deckungsgrad</div></div>
            </div>
          </div>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
                <label style={T.fldLbl}>{l}{req?" *":""}</label>
                <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
              </div>
            ))}
          </div>
          <div style={{ fontSize:"11px",color:"#ccc",marginTop:"10px" }}>Vertraulich behandelt.</div>
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(!valid)} onClick={()=>{if(valid){setName(fd.name);setDanke(true);}}} disabled={!valid}>Gespräch anfragen</button>
          <button style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button>
        </div>
      </div>
    );
  }

  if (phase === 2) {
    const items = [
      { l:"Monatlicher Finanzbedarf",    v:fmt(p.monatsBedarf)+"/Mon.", sub:`${p.jahre} Jahre = ${fmtK(p.monatsBedarf*12*p.jahre)}` },
      { l:"Gesetzliche Witwen-/Waisenrente", v:fmt(R.gesGesetzl)+"/Mon.", sub:"Witwen 55% + Waisen je 10% der Rentenanwartschaft", ok:true },
      { l:"Partnereinkommen",            v:p.partnerEinkommen>0?fmt(p.partnerEinkommen)+"/Mon.":"Nicht vorhanden", ok:p.partnerEinkommen>0 },
      { l:"Verbleibender Eigenbedarf",   v:fmt(R.eigenBedarf)+"/Mon.", hl:R.eigenBedarf > 0 },
      { l:"Kapitalbedarf gesamt",        v:fmtK(R.kapBedarf), hl:true },
      { l:"Bestehende Kredite",          v:fmtK(p.kredite), sub:"Müssen im Todesfall abgelöst werden" },
      { l:"Gesamtbedarf",               v:fmtK(R.gesamtBedarf), hl:true },
      { l:"Vorhandene Versicherungssumme", v:fmtK(p.vorhandeneVS), ok:p.vorhandeneVS>0 },
      { l:"Fehlende Absicherung",        v:fmtK(R.luecke), hl:R.luecke>0 },
    ];
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL} badge="Risikoleben"/>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Analyse</div>
          <div style={T.h1}>{R.luecke>0?`${fmtK(R.luecke)} fehlen`:"Familie vollständig abgesichert"}</div>
          <div style={T.body}>Deckungsgrad: {R.deckung}% · Absicherungszeitraum: {p.jahre} Jahre</div>
        </div>
        <div style={T.section}>
          <div style={T.card}>
            {items.map(({l,v,sub,hl,ok},i,arr)=>(
              <div key={i} style={{ ...T.detRow, borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none", padding:"10px 16px" }}>
                <div><span style={T.detLbl}>{l}</span>{sub&&<div style={{ fontSize:"11px",color:"#aaa",marginTop:"2px" }}>{sub}</div>}</div>
                <span style={{ fontSize:"13px",fontWeight:"600",color:hl?WARN:ok?C:"#111",flexShrink:0,marginLeft:"12px" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...T.section, marginBottom:"120px" }}>
          <div style={T.infoBox}>Witwen-/Waisenrente basiert auf der Rentenanwartschaft des Verstorbenen. Für eine präzise Berechnung empfehlen wir ein persönliches Gespräch.</div>
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Absicherung einrichten — Gespräch anfragen</button>
          <button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <Header phase={1} total={TOTAL} badge="Risikoleben"/>
      <div style={T.hero}><div style={T.eyebrow}>Schritt 1 von 2 · Familienbedarf</div><div style={T.h1}>Ist Ihre Familie wirklich abgesichert?</div><div style={T.body}>Gesetzliche Witwen-/Waisenrente eingerechnet — die echte Versorgungslücke Ihrer Familie.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Monatlicher Finanzbedarf" value={p.monatsBedarf} min={500} max={6000} step={100} unit="€/Mon" hint="Miete/Kredit + Lebenshaltung + Kinderkosten" onChange={v=>set("monatsBedarf",v)}/></div>
          <div style={T.row}><SliderField label="Absicherungszeitraum" value={p.jahre} min={5} max={30} step={1} unit="Jahre" hint="Bis jüngstes Kind 25 ist oder bis Rentenalter" onChange={v=>set("jahre",v)}/></div>
          <div style={T.rowLast}><SliderField label="Bestehende Kredite / Schulden" value={p.kredite} min={0} max={600000} step={5000} unit="€" hint="Müssen im Todesfall vollständig abgelöst werden" onChange={v=>set("kredite",v)}/></div>
        </div>
      </div>
      <div style={T.divider}/>
      <div style={T.section}>
        <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px" }}>Gesetzliche Leistungen (werden abgezogen)</div>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Witwen-/Witwerrente (geschätzt)" value={p.witwerRente} min={0} max={2000} step={50} unit="€/Mon" hint="Ca. 55% der gesetzlichen Rentenanwartschaft des Verstorbenen" onChange={v=>set("witwerRente",v)}/></div>
          <div style={T.row}><SliderField label="Waisenrenten gesamt" value={p.waisenRenten} min={0} max={1000} step={50} unit="€/Mon" hint="Je 10% (Halbwaise) bzw. 20% (Vollwaise) der Rentenanwartschaft" onChange={v=>set("waisenRenten",v)}/></div>
          <div style={T.rowLast}><SliderField label="Eigenes Einkommen des Partners" value={p.partnerEinkommen} min={0} max={4000} step={100} unit="€/Mon" hint="Nettoeinkommen des überlebenden Partners" onChange={v=>set("partnerEinkommen",v)}/></div>
        </div>
      </div>
      <div style={T.divider}/>
      <div style={T.section}>
        <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px" }}>Bestehende Absicherung</div>
        <div style={T.card}>
          <div style={T.rowLast}><SliderField label="Vorhandene Versicherungssumme" value={p.vorhandeneVS} min={0} max={1000000} step={10000} unit="€" hint="Aktuelle Risikolebensversicherung" onChange={v=>set("vorhandeneVS",v)}/></div>
        </div>
      </div>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Lücke berechnen</button>
      </div>
    </div>
  );
}
