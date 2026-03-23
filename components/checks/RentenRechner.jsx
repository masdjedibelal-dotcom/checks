import { useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { SliderCard, SelectionCard, SectionHeader } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";

(() => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #ffffff; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
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
    { label: "Schicht 3", sub: "Privat + Fonds",            farbe: S3, betrag: schicht3, anteil: ziel>0?Math.min(100,Math.round((schicht3/ziel)*100)):0 },
  ];
  const kapitalBedarf = kapBedarf;
  return { jahreBis, renteDauer, ziel, vorhanden, luecke, deckung, rateA, nettoA, stVorteil, rateB, rateC, kapBedarf, kapitalBedarf, depotLeer, schichten, lebenserw };
}

const T = {
  page:    { minHeight: "100vh", background: "#fff", fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
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
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName] = useState("");
  const [showStrat, setShowStrat] = useState(null);
  const [fd, setFd] = useState({ name:"", email:"", tel:"" });
  const [kontaktConsent, setKontaktConsent] = useState(false);
  const [p, setP] = useState({ alter:35, rentenAlter:67, netto:2800, zielProzent:80, gesRente:1200, schicht1:0, schicht2:0, schicht3:0, beruf:"angestellt" });
  const set = (k,v) => setP(x=>({...x,[k]:v}));
  const goTo = (ph) => { setAk(k=>k+1); setPhase(ph); window.scrollTo({top:0}); };
  const R = berechne(p);
  const TOTAL = 3;

  if (danke) return <div style={{...T.page,"--accent":C}}><Header phase={TOTAL} total={TOTAL} badge="Renten-Rechner"/><DankeScreen name={name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>;

  // Phase 3: Kontakt
  if (phase === 3) {
    const valid = fd.name.trim() && fd.email.trim() && kontaktConsent;
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL} badge="Renten-Rechner"/>
        <div style={T.hero}><div style={T.eyebrow}>Beratungsgespräch</div><div style={T.h1}>Rentenplan besprechen</div><div style={T.body}>Wir erstellen einen konkreten Sparplan mit echten Tarifen.</div></div>
        <div style={T.section}>
          <div style={{ ...T.infoBox, marginBottom:"16px" }}>
            <div style={{ display:"flex",gap:"24px" }}>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:WARN,letterSpacing:"-0.5px" }}>{fmt(R.luecke)}</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Monatliche Lücke</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:C,letterSpacing:"-0.5px" }}>{R.deckung}%</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Deckungsgrad</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px" }}>{R.jahreBis} J.</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>bis Rente</div></div>
            </div>
          </div>
          {isDemo ? (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
                Das ist eine Live-Vorschau — so sieht Ihr Kunde das Tool.
              </div>
              <button
                type="button"
                style={{ ...T.btnPrim(false) }}
                onClick={() =>
                  window.parent.postMessage(
                    { type: "openConfig", slug: "vorsorge-check" },
                    "*",
                  )
                }
              >
                Anpassen & kaufen
              </button>
            </div>
          ) : (
          <>
          <CheckKontaktLeadLine />
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
                <label style={T.fldLbl}>{l}{req?" *":""}</label>
                <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"14px" }}>
            <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
          </div>
          </>
          )}
        </div>
        {isDemo ? (
          <div style={T.footer}><button type="button" style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></div>
        ) : (
        <Footer onNext={()=>{if(valid){setName(fd.name);setDanke(true);}}} onBack={()=>goTo(2)} label="Gespräch anfragen" disabled={!valid}/>
        )}
      </div>
    );
  }

  // Phase 3: Ergebnis
  if (phase === 3) {
    const strategien = [
      { id:"rente", label:"Nur Rente", sub:"Rürup / private Rentenversicherung", rate:R.rateA, hinweis:p.beruf==="selbst"?`Steuerersparnis ca. ${fmt(R.stVorteil)}/Jahr — Nettorate ${fmt(R.nettoA)}/Monat`:`Mit Steuerförderung ca. ${fmt(R.nettoA)}/Monat Netto`, pro:["Lebenslange Zahlung","Kein Kapitalmarktrisiko"], con:["Keine Flexibilität","Kein Kapital für Erben"] },
      { id:"etf",   label:"Flexible Anlagestrategie", sub:"Vermögensaufbau + Entnahmeplan 3,5%", rate:R.rateB, hinweis:`Kapitalziel: ${fmtK(R.kapitalBedarf)} — Fondsanlage reicht ca. ${R.depotLeer} Jahre`, pro:["Höchste Rendite (Ø 6%)","Kapital vererbbar","Flexibel"], con:[`Fondskapital aufgebraucht nach ${R.depotLeer} Jahren`,"Kapitalmarktrisiko"] },
      { id:"hybrid",label:"Hybrid (empfohlen)", sub:"50% Rente + 50% Fondsanlage", rate:R.rateC, hinweis:`${fmt(R.rateC/2)}/Mon. Rente + ${fmt(R.rateC/2)}/Mon. Fondsanlage`, pro:["Fixkosten lebenslang gesichert","Flexibilität durch Fondsanteil","Risiko halbiert"], con:["Zwei Verträge zu pflegen"], highlight:true },
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
        <Footer onNext={()=>goTo(4)} onBack={()=>goTo(2)} label="Strategie besprechen"/>
      </div>
    );
  }

  // ── Phase 1+2: Eingabe (zusammengelegt) ────────────────────────────────────
  // Phase 3: Ergebnis
  if (phase === 2) {
    const lueckeSchwelle = 100; // < 100 €/Mon = gut aufgestellt
    const gutAufgestellt = R.luecke < lueckeSchwelle;

    // Wartekosten: was kostet es, 5 Jahre zu warten?
    const jahreBis5 = Math.max(1, R.jahreBis - 5);
    const ansparA5  = ((Math.pow(1.03,jahreBis5)-1)/0.03)*Math.pow(1.03,jahreBis5);
    const renteFak5 = (1-Math.pow(1.03,-R.renteDauer))/0.03;
    const rateA5    = R.luecke > 0 ? (R.luecke*12*renteFak5)/ansparA5 : 0;
    const mehrKosten = Math.max(0, Math.round(rateA5 - R.rateA));

    const strategien = [
      {
        id:"steuer", label:"Steuerfokus", sub:"Rürup / private Rentenversicherung",
        rate:R.rateA, nettoRate:R.nettoA,
        einordnung:"Ideal für Steuersparer — der Staat beteiligt sich an Ihrem Aufbau.",
        pro:["Lebenslange Rentenzahlung","Steuerersparnis sofort spürbar"],
        con:"Keine Flexibilität — Kapital nicht abrufbar",
        fuerWen:"Selbstständige, Gutverdiener und alle mit hohem Grenzsteuersatz.",
        highlight:false,
      },
      {
        id:"hybrid", label:"Ausgewogene Lösung", sub:"50% Rentenvertrag + 50% Fondsanlage",
        rate:R.rateC, nettoRate:R.rateC,
        einordnung:"Die meistempfohlene Kombination — sicher und flexibel zugleich.",
        pro:["Existenzkosten lebenslang gesichert","Flexibler Puffer durch Fondsanteil"],
        con:"Zwei Verträge zu verwalten",
        fuerWen:"Die meisten Arbeitnehmer und Familien — ausgewogenes Risiko.",
        highlight:true,
      },
      {
        id:"etf", label:"Flexibilitätsfokus", sub:"Fondsbasierte Anlage + Entnahmeplan (3,5%)",
        rate:R.rateB, nettoRate:R.rateB,
        einordnung:"Maximale Rendite und Kontrolle — für Disziplinierte.",
        pro:["Hohe Ø-Rendite über Fonds (Ø 6%)","Kapital vererbbar und flexibel verfügbar"],
        con:`Fondsanlage reicht ca. ${R.depotLeer} Jahre — kein lebenslanger Schutz`,
        fuerWen:"Für Anleger mit Freude an flexiblen Lösungen und ausreichend Puffer.",
        highlight:false,
      },
    ];

    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL} badge="Renten-Rechner"/>

        {/* Block 1: Rentenlücke */}
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Rentenanalyse</div>
          <div style={T.h1}>{gutAufgestellt ? "Sie sind gut aufgestellt" : `${fmt(R.luecke)}/Monat fehlen ab ${p.rentenAlter}`}</div>
          <div style={T.body}>{R.deckung}% gedeckt · {R.jahreBis} Jahre Ansparzeit · Zielrente {fmt(R.ziel)}/Monat</div>
        </div>

        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"4px"}}>
            {[
              {l:"Rentenlücke", v:gutAufgestellt?"Keine":fmt(R.luecke)+"/Mon.", warn:!gutAufgestellt},
              {l:"Deckungsgrad", v:R.deckung+"%", warn:R.deckung<70},
              {l:"Bis zur Rente", v:R.jahreBis+" Jahre", warn:false},
            ].map(({l,v,warn},i)=>(
              <div key={i} style={{border:`1px solid ${warn?"#c0392b33":"#e8e8e8"}`,borderRadius:"10px",padding:"12px 10px",background:warn?"#fff5f5":"#fff",textAlign:"center"}}>
                <div style={{fontSize:"15px",fontWeight:"700",color:warn?WARN:C,letterSpacing:"-0.3px"}}>{v}</div>
                <div style={{fontSize:"10px",color:"#aaa",marginTop:"2px",fontWeight:"500"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 2: Schichten-Balken */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Ihre heutige Vorsorge</div>
          <div style={T.card}>
            <div style={{padding:"14px 16px 8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                <span style={{fontSize:"12px",color:"#aaa"}}>Zielrente</span>
                <span style={{fontSize:"13px",fontWeight:"700",color:"#111"}}>{fmt(R.ziel)}/Monat</span>
              </div>
              <div style={{height:"8px",background:"#f0f0f0",borderRadius:"4px",overflow:"hidden",display:"flex",marginBottom:"12px"}}>
                {R.schichten.map((s,i)=><div key={i} style={{width:`${s.anteil}%`,background:s.farbe,transition:"width 0.6s ease",minWidth:s.betrag>0?"2px":"0"}}/>)}
                {R.luecke>0&&<div style={{flex:1,background:"#fee2e2",minWidth:"2px"}}/>}
              </div>
              {[...R.schichten,...(R.luecke>0?[{label:"Lücke",sub:"Nicht gedeckt",farbe:WARN,betrag:R.luecke,anteil:100-R.deckung}]:[])].map((s,i,arr)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:s.farbe,flexShrink:0}}/>
                    <div><div style={{fontSize:"12px",fontWeight:"500",color:"#333"}}>{s.label}</div><div style={{fontSize:"11px",color:"#aaa"}}>{s.sub}</div></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"13px",fontWeight:"600",color:s.farbe}}>{fmt(s.betrag)}/Mon.</div>
                    <div style={{fontSize:"11px",color:"#aaa"}}>{s.anteil}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block 3: Strategien oder positives Ergebnis */}
        {gutAufgestellt ? (
          <div style={T.section}>
            <div style={{border:"1px solid #d1fae5",borderRadius:"10px",padding:"14px 16px",background:"#f0fdf4"}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:"#059669",marginBottom:"4px"}}>Gut aufgestellt</div>
              <div style={{fontSize:"12px",color:"#065f46",lineHeight:1.6}}>Ihre Vorsorge deckt die Zielrente weitgehend ab. Beim Jahresgespräch prüfen wir ob Rendite, Inflation und Laufzeiten optimal abgestimmt sind.</div>
            </div>
          </div>
        ) : (
          <div style={T.section}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>So können Sie die Lücke schließen</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {strategien.map(st=>(
                <div key={st.id} style={{border:`1.5px solid ${st.highlight?C:"#e8e8e8"}`,borderRadius:"12px",overflow:"hidden",boxShadow:st.highlight?`0 4px 16px ${C}20`:"none"}}>
                  {st.highlight&&<div style={{background:C,padding:"5px 14px",fontSize:"11px",fontWeight:"700",color:"#fff",letterSpacing:"0.5px"}}>Empfohlene Strategie</div>}
                  <div style={{padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                      <div>
                        <div style={{fontSize:"14px",fontWeight:"700",color:"#111"}}>{st.label}</div>
                        <div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{st.sub}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginLeft:"12px"}}>
                        <div style={{fontSize:"22px",fontWeight:"700",color:st.highlight?C:"#111",letterSpacing:"-0.5px"}}>{fmt(st.rate)}</div>
                        <div style={{fontSize:"11px",color:"#aaa"}}>/Monat</div>
                      </div>
                    </div>
                    <div style={{fontSize:"12px",color:"#555",padding:"8px 10px",background:"#f7f7f7",borderRadius:"7px",marginBottom:"10px",lineHeight:1.55}}>{st.einordnung}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"8px"}}>
                      {st.pro.map((v,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"6px"}}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginTop:"1px",flexShrink:0}}><circle cx="6" cy="6" r="5" fill="#d1fae5"/><path d="M3.5 6l1.8 1.8L8.5 4" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span style={{fontSize:"11px",color:"#444",lineHeight:1.4}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",alignItems:"flex-start",gap:"6px",marginBottom:"8px"}}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginTop:"1px",flexShrink:0}}><circle cx="6" cy="6" r="5" fill="#fee2e2"/><path d="M4 4l4 4M8 4l-4 4" stroke="#c0392b" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      <span style={{fontSize:"11px",color:"#666",lineHeight:1.4}}>{st.con}</span>
                    </div>
                    <div style={{fontSize:"11px",color:"#888",padding:"6px 10px",background:"#f0f4f8",borderRadius:"6px"}}><strong>Für wen: </strong>{st.fuerWen}</div>
                    {st.id==="steuer"&&p.beruf==="selbst"&&<div style={{marginTop:"8px",fontSize:"11px",color:"#059669",fontWeight:"500"}}>Steuerersparnis ca. {fmt(R.stVorteil)}/Jahr → Nettorate {fmt(R.nettoA)}/Mon.</div>}
                    {st.id==="etf"&&<div style={{marginTop:"8px",fontSize:"11px",color:"#888"}}>Kapitalziel: {fmtK(R.kapitalBedarf)} — aufgebaut über fondsbasierte Anlage</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block 4: Wartekosten */}
        {!gutAufgestellt && mehrKosten > 10 && (
          <div style={T.section}>
            <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"}}>
              <div style={{padding:"10px 16px",background:"#fffbf0",borderBottom:"1px solid #f0f0f0"}}>
                <div style={{fontSize:"11px",fontWeight:"700",color:"#92400e",letterSpacing:"0.5px",textTransform:"uppercase"}}>Was 5 Jahre Warten kosten</div>
              </div>
              <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                <div style={{textAlign:"center",padding:"10px",background:"#f0fdf4",borderRadius:"8px"}}>
                  <div style={{fontSize:"18px",fontWeight:"700",color:"#059669",letterSpacing:"-0.3px"}}>{fmt(R.rateA)}</div>
                  <div style={{fontSize:"11px",color:"#888",marginTop:"2px"}}>Heute starten</div>
                </div>
                <div style={{textAlign:"center",padding:"10px",background:"#fff5f5",borderRadius:"8px"}}>
                  <div style={{fontSize:"18px",fontWeight:"700",color:WARN,letterSpacing:"-0.3px"}}>{fmt(rateA5)}</div>
                  <div style={{fontSize:"11px",color:"#888",marginTop:"2px"}}>In 5 Jahren starten</div>
                </div>
              </div>
              <div style={{padding:"0 16px 14px",fontSize:"12px",color:"#666"}}>
                Warten kostet ca. <strong style={{color:WARN}}>{fmt(mehrKosten)}/Monat mehr</strong> — bei gleicher Zielrente.
              </div>
            </div>
          </div>
        )}

        <div style={{...T.section,marginBottom:"120px"}}>
          <div style={T.infoBox}>Näherungswerte auf Basis von Ø-Renditen. Für einen verbindlichen Sparplan empfehlen wir ein persönliches Gespräch.</div>
          <div style={{ ...T.infoBox, marginTop:"10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Strategie besprechen</button>
          <button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button>
        </div>
      </div>
    );
  }

  // Phase 1: Basisdaten + Vorsorge (zusammengelegt)
  return (
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <Header phase={1} total={TOTAL} badge="Renten-Rechner"/>
      <div style={T.hero}>
        <div style={T.eyebrow}>Schritt 1 von 2 · Ihre Situation</div>
        <div style={T.h1}>Wie sieht Ihre Rente aus?</div>
        <div style={T.body}>Rentenlücke berechnen und drei Strategien zum Schließen erhalten.</div>
      </div>

      {/* Basisdaten */}
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderCard label="Aktuelles Nettoeinkommen" value={p.netto} min={1000} max={8000} step={100} unit="€/Mon" accent={C} onChange={v=>set("netto",v)}/></div>
          <div style={T.row}><SliderCard label="Aktuelles Alter" value={p.alter} min={20} max={60} step={1} unit="Jahre" display={`noch ${R.jahreBis} Jahre bis zur Rente`} accent={C} onChange={v=>set("alter",v)}/></div>
          <div style={T.row}><SliderCard label="Gewünschtes Rentenalter" value={p.rentenAlter} min={60} max={70} step={1} unit="Jahre" display={`Rentenphase ca. ${R.renteDauer} Jahre`} accent={C} onChange={v=>set("rentenAlter",v)}/></div>
          <div style={T.row}><SliderCard label="Gewünschtes Rentenniveau" value={p.zielProzent} min={50} max={100} step={5} unit="%" display={`= ${fmt(R.ziel)}/Monat Zielrente`} accent={C} onChange={v=>set("zielProzent",v)}/></div>
          <div style={T.rowLast}>
            <label style={T.fldLbl}>Berufsstatus</label>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
              {[
                { v:"angestellt", l:"Angestellt", d:"Arbeitgeberzuschuss zur Sozialversicherung" },
                { v:"selbst", l:"Selbstständig", d:"Volle Beiträge, keine Lohnfortzahlung" },
                { v:"beamter", l:"Beamter", d:"Beihilfe und besondere Tarife" },
              ].map(({v,l,d})=>(
                <SelectionCard key={v} value={v} label={l} description={d} selected={p.beruf===v} accent={C} onClick={()=>set("beruf",v)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vorhandene Vorsorge — optional/einklappbar */}
      <div style={T.section}>
        <SectionHeader label="Vorhandene Vorsorge" />
        <div style={{fontSize:"12px",color:"#aaa",marginBottom:"10px"}}>Optional — bei 0 wird die volle Lücke berechnet</div>
        <div style={T.card}>
          <div style={{padding:"8px 16px 4px",background:"#f8f8f8",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",gap:"6px"}}>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:S1}}/><span style={{fontSize:"11px",fontWeight:"600",color:S1,letterSpacing:"0.5px",textTransform:"uppercase"}}>Schicht 1 — Gesetzlich + Rürup</span>
          </div>
          <div style={T.row}><SliderCard label="Gesetzliche Rente" value={p.gesRente} min={0} max={3000} step={50} unit="€/Mon" hint="Aus dem jährlichen Rentenbescheid" accent={C} onChange={v=>set("gesRente",v)}/></div>
          <div style={{padding:"8px 16px 4px",background:"#f8f8f8",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",gap:"6px"}}>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:S2}}/><span style={{fontSize:"11px",fontWeight:"600",color:S2,letterSpacing:"0.5px",textTransform:"uppercase"}}>Schicht 2 — bAV + Riester</span>
          </div>
          <div style={T.row}><SliderCard label="bAV + Riester" value={p.schicht2} min={0} max={1500} step={25} unit="€/Mon" accent={C} onChange={v=>set("schicht2",v)}/></div>
          <div style={{padding:"8px 16px 4px",background:"#f8f8f8",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",gap:"6px"}}>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:S3}}/><span style={{fontSize:"11px",fontWeight:"600",color:S3,letterSpacing:"0.5px",textTransform:"uppercase"}}>Schicht 3 — Privat + Fonds</span>
          </div>
          <div style={T.rowLast}><SliderCard label="Private Rente + Fondsanlage" value={p.schicht3} min={0} max={3000} step={50} unit="€/Mon" accent={C} onChange={v=>set("schicht3",v)}/></div>
        </div>
      </div>

      <div style={{height:"120px"}}/>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Rentenlücke berechnen</button>
      </div>
    </div>
  );
}
