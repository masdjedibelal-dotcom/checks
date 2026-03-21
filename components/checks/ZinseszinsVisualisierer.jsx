import { useState, useEffect } from "react";

(() => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } html, body { height: 100%; background: #fff; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; } button, input { font-family: inherit; border: none; background: none; cursor: pointer; } input { cursor: text; } ::-webkit-scrollbar { display: none; } * { scrollbar-width: none; } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } } .fade-in { animation: fadeIn 0.28s ease both; } button:active { opacity: 0.75; } input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; border-radius: 1px; background: #e5e5e5; cursor: pointer; } input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; box-shadow: 0 0 0 1px var(--accent); } a { text-decoration: none; }`;
  document.head.appendChild(s);
})();

const MAKLER = { name: "Max Mustermann", firma: "Mustermann Versicherungen", email: "kontakt@mustermann-versicherungen.de", telefon: "089 123 456 78", primaryColor: "#1a3a5c" };
const C = MAKLER.primaryColor;
const LATE = "#c0392b";
const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n >= 100000 ? (n/1000).toFixed(0) + ".000 €" : fmt(n);

function calcSeries(rate, rendite, jahre) {
  const series = []; let depot = 0;
  for (let j = 1; j <= jahre; j++) { depot = (depot + rate * 12) * (1 + rendite); series.push(depot); }
  return series;
}

const T = {
  page:    { minHeight: "100vh", background: "#fff", fontFamily: "'DM Sans', system-ui, sans-serif" },
  header:  { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { display: "flex", alignItems: "center", gap: "10px" },
  logoMk:  { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
  badge:   { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
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
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
};

function LogoSVG() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>; }

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

export default function ZinseszinsVisualisierer() {
  const [danke, setDanke] = useState(false);
  const [fd, setFd] = useState({ name:"",email:"",tel:"" });
  const [p, setP] = useState({ rate:200, rendite:6, frueHalter:25, spaetStart:35, ziel:67 });
  const set = (k,v) => setP(x=>({...x,[k]:v}));

  const jahreFrue = p.ziel - p.frueHalter;
  const jahreSpaet = p.ziel - p.spaetStart;
  const warteJahre = p.spaetStart - p.frueHalter;
  const r = p.rendite / 100;

  const seriesFrue  = calcSeries(p.rate, r, jahreFrue);
  const seriesSpaet = calcSeries(p.rate, r, jahreSpaet);

  const endFrue  = seriesFrue[seriesFrue.length - 1] || 0;
  const endSpaet = seriesSpaet[seriesSpaet.length - 1] || 0;
  const diff     = Math.max(0, endFrue - endSpaet);
  const eingabeFrue  = p.rate * 12 * jahreFrue;
  const eingabeSpaet = p.rate * 12 * jahreSpaet;
  const zinsFrue  = Math.max(0, endFrue - eingabeFrue);
  const zinsSpaet = Math.max(0, endSpaet - eingabeSpaet);

  // Build chart data (every 5th year for both)
  const maxJ = Math.max(jahreFrue, jahreSpaet);
  const chartYears = Array.from({length: Math.ceil(maxJ/5)}, (_,i)=>(i+1)*5).filter(y=>y<=maxJ);

  const getBarHeight = (val, maxVal, maxH=120) => Math.round((val/maxVal) * maxH);
  const chartMax = endFrue * 1.05;

  if (danke) {
    const nm = fd.name.split(" ")[0] || "";
    return (
      <div style={{...T.page,"--accent":C}}>
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{ fontSize:"13px",fontWeight:"600",color:"#111",letterSpacing:"-0.1px" }}>{MAKLER.firma}</span></div><span style={T.badge}>Zinseszins</span></div>
        <div style={{ padding:"48px 24px",textAlign:"center" }} className="fade-in">
          <div style={{ width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize:"20px",fontWeight:"700",color:"#111",letterSpacing:"-0.4px",marginBottom:"8px" }}>{nm?`Danke, ${nm}.`:"Anfrage gesendet."}</div>
          <div style={{ fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px" }}>Wir melden uns innerhalb von 24 Stunden.</div>
          <div style={{ border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left" }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid #f0f0f0" }}>
              <div style={{ fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px" }}>Ihr Berater</div>
              <div style={{ fontSize:"14px",fontWeight:"600",color:"#111" }}>{MAKLER.name}</div>
            </div>
            <div style={{ padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px" }}>
              <a href={`tel:${MAKLER.telefon}`} style={{ fontSize:"13px",color:C,fontWeight:"500" }}>{MAKLER.telefon}</a>
              <a href={`mailto:${MAKLER.email}`} style={{ fontSize:"13px",color:C,fontWeight:"500" }}>{MAKLER.email}</a>
            </div>
          </div>
          <button onClick={()=>setDanke(false)} style={{ marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer" }}>Neue Berechnung starten</button>
        </div>
      </div>
    );
  }

  const valid = fd.name.trim() && fd.email.trim();

  return (
    <div style={{...T.page,"--accent":C}} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{ fontSize:"13px",fontWeight:"600",color:"#111",letterSpacing:"-0.1px" }}>{MAKLER.firma}</span></div><span style={T.badge}>Zinseszins</span></div>

      <div style={T.hero}>
        <div style={T.eyebrow}>Zinseszins-Visualisierer</div>
        <div style={T.h1}>Was kostet {warteJahre} Jahre warten?</div>
        <div style={T.body}>Früh starten vs. {warteJahre} Jahre warten — der Unterschied bei Rentenalter {p.ziel}.</div>
      </div>

      {/* Eingaben */}
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Monatliche Sparrate" value={p.rate} min={50} max={1000} step={25} unit="€/Mon" onChange={v=>set("rate",v)}/></div>
          <div style={T.row}><SliderField label="Erwartete Rendite" value={p.rendite} min={2} max={10} step={0.5} unit="% p.a." hint="Historisch: Weltaktienindex Ø 7–8% nominal" onChange={v=>set("rendite",v)}/></div>
          <div style={T.row}><SliderField label="Frühstart-Alter" value={p.frueHalter} min={18} max={35} step={1} unit="Jahre" onChange={v=>set("frueHalter",v)}/></div>
          <div style={T.row}><SliderField label="Spätstarter-Alter" value={p.spaetStart} min={p.frueHalter+1} max={50} step={1} unit="Jahre" onChange={v=>set("spaetStart",v)}/></div>
          <div style={T.rowLast}><SliderField label="Zielzeitpunkt (Rente)" value={p.ziel} min={55} max={70} step={1} unit="Jahre" onChange={v=>set("ziel",v)}/></div>
        </div>
      </div>

      <div style={T.divider}/>

      {/* Ergebnis-Karten */}
      <div style={T.section}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px" }}>
          <div style={{ border:`1px solid ${C}`,borderRadius:"10px",padding:"14px" }}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px" }}>Frühstart mit {p.frueHalter}</div>
            <div style={{ fontSize:"24px",fontWeight:"700",color:C,letterSpacing:"-0.8px",lineHeight:1 }}>{fmtK(endFrue)}</div>
            <div style={{ fontSize:"11px",color:"#aaa",marginTop:"4px" }}>nach {jahreFrue} Jahren</div>
            <div style={{ marginTop:"10px",display:"flex",flexDirection:"column",gap:"3px" }}>
              <div style={{ fontSize:"11px",color:"#888" }}>Eingezahlt: {fmtK(eingabeFrue)}</div>
              <div style={{ fontSize:"11px",color:C,fontWeight:"500" }}>Zinseszins: +{fmtK(zinsFrue)}</div>
            </div>
          </div>
          <div style={{ border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px" }}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:LATE,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px" }}>Spätstarter mit {p.spaetStart}</div>
            <div style={{ fontSize:"24px",fontWeight:"700",color:LATE,letterSpacing:"-0.8px",lineHeight:1 }}>{fmtK(endSpaet)}</div>
            <div style={{ fontSize:"11px",color:"#aaa",marginTop:"4px" }}>nach {jahreSpaet} Jahren</div>
            <div style={{ marginTop:"10px",display:"flex",flexDirection:"column",gap:"3px" }}>
              <div style={{ fontSize:"11px",color:"#888" }}>Eingezahlt: {fmtK(eingabeSpaet)}</div>
              <div style={{ fontSize:"11px",color:LATE,fontWeight:"500" }}>Zinseszins: +{fmtK(zinsSpaet)}</div>
            </div>
          </div>
        </div>
        <div style={{ border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px",textAlign:"center" }}>
          <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px" }}>{warteJahre} Jahre warten kostet</div>
          <div style={{ fontSize:"32px",fontWeight:"700",color:LATE,letterSpacing:"-1px" }}>– {fmtK(diff)}</div>
          <div style={{ fontSize:"12px",color:"#aaa",marginTop:"4px" }}>Trotz identischer Sparrate von {fmt(p.rate)}/Monat</div>
        </div>
      </div>

      <div style={T.divider}/>

      {/* Chart */}
      <div style={T.section}>
        <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px" }}>Wachstum im Zeitverlauf</div>
        <div style={{ display:"flex",alignItems:"flex-end",gap:"6px",height:"140px",paddingBottom:"20px",position:"relative" }}>
          {chartYears.map(yr=>{
            const idxFrue  = yr - 1;
            const idxSpaet = yr - warteJahre - 1;
            const valFrue  = (idxFrue >= 0 && idxFrue < seriesFrue.length)  ? seriesFrue[idxFrue]  : 0;
            const valSpaet = (idxSpaet >= 0 && idxSpaet < seriesSpaet.length) ? seriesSpaet[idxSpaet] : 0;
            const hF = getBarHeight(valFrue,  chartMax, 120);
            const hS = getBarHeight(valSpaet, chartMax, 120);
            return (
              <div key={yr} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",position:"relative" }}>
                <div style={{ display:"flex",alignItems:"flex-end",gap:"2px",height:"120px" }}>
                  <div style={{ width:"12px",height:`${hF}px`,background:C,borderRadius:"2px 2px 0 0",transition:"height 0.4s ease" }}/>
                  <div style={{ width:"12px",height:`${hS}px`,background:hS>0?LATE:"#f0f0f0",borderRadius:"2px 2px 0 0",transition:"height 0.4s ease" }}/>
                </div>
                <div style={{ fontSize:"9px",color:"#bbb",position:"absolute",bottom:"0" }}>J{yr}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex",gap:"16px",marginTop:"4px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"5px" }}><div style={{ width:"10px",height:"10px",background:C,borderRadius:"2px" }}/><span style={{ fontSize:"11px",color:"#888" }}>Frühstart</span></div>
          <div style={{ display:"flex",alignItems:"center",gap:"5px" }}><div style={{ width:"10px",height:"10px",background:LATE,borderRadius:"2px" }}/><span style={{ fontSize:"11px",color:"#888" }}>Spätstarter</span></div>
        </div>
      </div>

      <div style={T.divider}/>

      {/* Kontakt */}
      <div style={T.section}>
        <div style={{ fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px" }}>Gespräch anfragen</div>
        <div style={T.card}>
          {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
            <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
              <label style={T.fldLbl}>{l}{req?" *":""}</label>
              <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
            </div>
          ))}
        </div>
        <div style={{ fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px" }}>Vertraulich behandelt.</div>
      </div>

      <div style={T.footer}>
        <button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Gespräch anfragen</button>
      </div>
    </div>
  );
}
