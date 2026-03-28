import { useMemo, useState } from "react";
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

const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n >= 1000 ? (Math.round(n / 1000) * 1000).toLocaleString("de-DE") + " €" : fmt(n);

const S1 = "#0369a1", S2 = "#7c3aed", S3 = "#059669", WARN = "#c0392b";

function berechne(p) {
  const { alter, rentenAlter, netto, zielProzent, gesRente, schicht1, schicht2, schicht3, beruf, inflationsschutz = true } = p;
  const jahreBis    = Math.max(1, rentenAlter - alter);
  const lebenserw   = 87;
  const renteDauer  = Math.max(1, lebenserw - rentenAlter);
  const zielHeute   = netto * (zielProzent / 100);
  const INFLATION   = 0.02;
  const ziel        = inflationsschutz ? Math.round(zielHeute * Math.pow(1 + INFLATION, jahreBis)) : zielHeute;
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
  return { jahreBis, renteDauer, ziel, zielHeute, vorhanden, luecke, deckung, rateA, nettoA, stVorteil, rateB, rateC, kapBedarf, kapitalBedarf, depotLeer, schichten, lebenserw };
}

function makeRentenT(C) {
  return {
  page:    { minHeight: "100vh", background: "#fff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif" },
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
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
  btnPrim: (d) => ({ width: "100%", padding: "13px 20px", background: d?"#e8e8e8":C, color: d?"#aaa":"#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: d?"default":"pointer" }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? WARN : "#111" }),
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
};
}

function LogoSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;
}

function Header({ phase, total, badge, makler, T }) {
  return (
    <>
      <div style={T.header}>
        <div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{ fontSize:"13px",fontWeight:"600",color:"#111",letterSpacing:"-0.1px" }}>{makler.firma}</span></div>
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
      <div style={{ fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px" }}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
      <div style={{ border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left" }}>
        <div style={{ padding:"14px 16px",borderBottom:"1px solid #f0f0f0" }}>
          <div style={{ fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px" }}>Dein Berater</div>
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
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName] = useState("");
  const [showStrat, setShowStrat] = useState(null);
  const [fd, setFd] = useState({ name:"", email:"", tel:"" });
  const [kontaktConsent, setKontaktConsent] = useState(false);
  const [p, setP] = useState({ alter:35, rentenAlter:67, netto:2800, zielProzent:80, gesRente:1200, schicht1:0, schicht2:0, schicht3:0, beruf:"angestellt", inflationsschutz:true, lebensziel:"" });
  const set = (k,v) => setP(x=>({...x,[k]:v}));
  const [scr, setScr] = useState(1);
  const nextScr = () => scr < 5 ? setScr(s => s + 1) : goTo(2);
  const backScr = () => scr > 1 && setScr(s => s - 1);
  const setVorsorgeTyp = (typ) => {
    const gesRenteBasis = Math.round(p.netto * 0.46);
    if(typ==="gesetz")  setP(x=>({...x,gesRente:gesRenteBasis,schicht2:0,schicht3:0}));
    if(typ==="bav")     setP(x=>({...x,gesRente:gesRenteBasis,schicht2:200,schicht3:0}));
    if(typ==="privat")  setP(x=>({...x,gesRente:gesRenteBasis,schicht2:0,schicht3:200}));
    if(typ==="kombi")   setP(x=>({...x,gesRente:gesRenteBasis,schicht2:200,schicht3:200}));
    setP(x=>({...x,_vorsorgeTyp:typ}));
  };
  const goTo = (ph) => { setAk(k=>k+1); setPhase(ph); window.scrollTo({top:0}); };
  const R = berechne(p);
  const TOTAL = 4;

  if (danke) return <div style={{...T.page,"--accent":C}}><Header phase={TOTAL} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T}/><DankeScreen name={name} onBack={()=>{setDanke(false);setPhase(1);}} makler={MAKLER} C={C}/></div>;

  // Phase 4: Kontakt
  if (phase === 4) {
    const valid = fd.name.trim() && fd.email.trim() && kontaktConsent;
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={4} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T}/>
        <div style={T.hero}><div style={T.eyebrow}>Fast geschafft</div><div style={T.h1}>Wo können wir dich erreichen?</div><div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis.</div></div>
        <div style={T.section}>
          <div style={{ ...T.infoBox, marginBottom:"16px" }}>
            <div style={{ display:"flex",gap:"24px" }}>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:WARN,letterSpacing:"-0.5px" }}>{fmt(R.luecke)}</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Monatliche Lücke</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:C,letterSpacing:"-0.5px" }}>{R.deckung}%</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>Deckungsgrad</div></div>
              <div><div style={{ fontSize:"18px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px" }}>{R.jahreBis} J.</div><div style={{ fontSize:"11px",color:"#999",marginTop:"2px" }}>bis Rente</div></div>
            </div>
            {p.inflationsschutz && R.luecke > 0 && (
              <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"10px", lineHeight:1.55 }}>
                Inflationsbereinigt für {R.jahreBis} Jahre (+2%/Jahr). Heutige Kaufkraft:{" "}
                {fmt(Math.round(R.ziel / Math.pow(1.02, R.jahreBis)))}/Mon.
              </div>
            )}
            {p.lebensziel && (
              <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"6px", lineHeight:1.55 }}>
                Dein Ziel: {p.lebensziel === "standard" ? "🏡 Lebensstandard halten" : p.lebensziel === "reisen" ? "✈️ Aktiv reisen & genießen" : p.lebensziel === "ruhig" ? "🤝 Ruhiges, sicheres Leben" : "❓ Noch nicht festgelegt"}
              </div>
            )}
          </div>
          {isDemo ? (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
                Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.
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
            {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"tel",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
                <label style={T.fldLbl}>{l}{req?" *":""}</label>
                <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
                {hint && <div style={T.fldHint}>{hint}</div>}
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
        <Footer onNext={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"vorsorge-check",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setName(fd.name);setDanke(true);}} onBack={()=>goTo(3)} label={valid?"Rentenplan gemeinsam erstellen":"Bitte alle Angaben machen"} disabled={!valid} T={T}/>
        )}
      </div>
    );
  }

  // Phase 2: Lebensziel (NEU)
  if (phase === 2) {
    const ZIELE = [
      { id: "standard", emoji: "🏡", label: "Ich möchte meinen heutigen Lebensstandard halten" },
      { id: "reisen",   emoji: "✈️", label: "Ich möchte aktiv reisen und die Zeit genießen" },
      { id: "ruhig",    emoji: "🤝", label: "Mir reicht ein ruhiges, sicheres Leben ohne großen Aufwand" },
      { id: "weiss",    emoji: "❓", label: "Ich weiß es noch nicht genau" },
    ];
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T}/>
        <div style={T.hero}>
          <div style={T.eyebrow}>Dein Ziel</div>
          <div style={T.h1}>Wie möchtest du später leben?</div>
          <div style={T.body}>Das beeinflusst, wie viel Einkommen im Alter angestrebt wird.</div>
        </div>
        <div style={T.section}>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {ZIELE.map(z => {
              const sel = p.lebensziel === z.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => set("lebensziel", z.id)}
                  style={{
                    display:"flex", alignItems:"flex-start", gap:"14px",
                    padding:"14px 16px",
                    border:`1.5px solid ${sel ? C : "#e8e8e8"}`,
                    borderRadius:"10px",
                    background: sel ? `${C}06` : "#fff",
                    cursor:"pointer", textAlign:"left",
                    transition:"all 0.15s",
                  }}
                >
                  <span style={{fontSize:"24px",lineHeight:1,flexShrink:0,marginTop:"1px"}}>{z.emoji}</span>
                  <span style={{fontSize:"14px",fontWeight: sel ? "600":"400",color: sel ? "#111":"#444",lineHeight:1.4}}>{z.label}</span>
                  <div style={{
                    width:"18px",height:"18px",borderRadius:"50%",flexShrink:0,marginLeft:"auto",marginTop:"2px",
                    border:`1.5px solid ${sel ? C : "#e0e0e0"}`,
                    background: sel ? C : "#fff",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    {sel && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{height:"120px"}}/>
        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} label="Weiter zu meiner Vorsorge" disabled={!p.lebensziel} T={T}/>
      </div>
    );
  }

  // Phase 3: Ergebnis
  if (phase === 3) {
    const strategien = [
      { id:"rente", label:"Nur Rente", sub:"Rürup / private Rentenversicherung", rate:R.rateA, hinweis:p.beruf==="selbst"?`Steuerersparnis ca. ${fmt(R.stVorteil)}/Jahr — Nettorate ${fmt(R.nettoA)}/Monat`:`Mit Steuerförderung ca. ${fmt(R.nettoA)}/Monat Netto`, pro:["Lebenslange Zahlung","Kein Kapitalmarktrisiko"], con:["Keine Flexibilität","Kein Kapital für Erben"] },
      { id:"etf",   label:"Flexible Anlagestrategie", sub:"Vermögensaufbau + Entnahmeplan 3,5%", rate:R.rateB, hinweis:`Kapitalziel: ${fmtK(R.kapitalBedarf)} — Fondsanlage reicht ca. ${R.depotLeer} Jahre`, pro:["Höchste Rendite (Ø 6%)","Kapital vererbbar","Flexibel"], con:[`Fondskapital aufgebraucht nach ${R.depotLeer} Jahren`,"Kapitalmarktrisiko"] },
      { id:"hybrid",label:"Hybrid (ausgewogen)", sub:"50% Rente + 50% Fondsanlage", rate:R.rateC, hinweis:`${fmt(R.rateC/2)}/Mon. Rente + ${fmt(R.rateC/2)}/Mon. Fondsanlage`, pro:["Fixkosten lebenslang gesichert","Flexibilität durch Fondsanteil","Risiko halbiert"], con:["Zwei Verträge zu pflegen"], highlight:true },
    ];
    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL} badge="Renten-Rechner" makler={MAKLER} T={T}/>
        <div style={T.hero}>
          <div style={T.eyebrow}>Auf Basis Ihrer Angaben</div>
          <div style={T.h1}>{R.luecke>0?`Es ergibt sich eine mögliche monatliche Versorgungslücke von: ${fmt(R.luecke)}`:"Ihre Vorsorgesituation ist auf Basis Ihrer Angaben weitgehend gedeckt"}</div>
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
                  {st.highlight&&<div style={{ background:C,padding:"5px 14px",fontSize:"11px",fontWeight:"600",color:"#fff",letterSpacing:"0.3px" }}>Ausgewogen</div>}
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
        <Footer onNext={()=>goTo(4)} onBack={()=>goTo(2)} label="Strategie besprechen" T={T}/>
      </div>
    );
  }

  // ── Phase 1+2: Eingabe (zusammengelegt) ────────────────────────────────────
  // Phase 3: Ergebnis (ehemals Phase 2)
  if (phase === 3) {
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
        id:"steuer", label:"Sicherheitsfokus — planbare Einnahmen", sub:"Gesetzl. Rente + Rürup — ideal für Selbstständige und Gutverdiener",
        rate:R.rateA, nettoRate:R.nettoA,
        einordnung:"Lebenslange, planbare Einnahmen — der Staat beteiligt sich an deinem Aufbau.",
        pro:["Lebenslange Rentenzahlung","Steuerersparnis sofort spürbar"],
        con:"Keine Flexibilität — Kapital nicht abrufbar",
        fuerWen:"Selbstständige, Gutverdiener und alle mit hohem Grenzsteuersatz.",
        highlight:false,
      },
      {
        id:"hybrid", label:"Ausgewogen — stabil und Rendite", sub:"50% Rente + 50% Fonds — die meisten Arbeitnehmer und Familien",
        rate:R.rateC, nettoRate:R.rateC,
        einordnung:"Stabile Kombination aus Sicherheit und Flexibilität.",
        pro:["Existenzkosten lebenslang gesichert","Flexibler Puffer durch Fondsanteil"],
        con:"Zwei Verträge zu verwalten",
        fuerWen:"Die meisten Arbeitnehmer und Familien — ausgewogenes Risiko.",
        highlight:true,
      },
      {
        id:"etf", label:"Flexibel — maximale Freiheit und Rendite", sub:"Fondsanlage + Entnahmeplan — für alle die Kontrolle wollen",
        rate:R.rateB, nettoRate:R.rateB,
        einordnung:"Maximale Rendite und Kontrolle — für disziplinierte Anleger.",
        pro:["Hohe Ø-Rendite über Fonds (Ø 6%)","Kapital vererbbar und flexibel verfügbar"],
        con:`Fondsanlage reicht ca. ${R.depotLeer} Jahre — kein lebenslanger Schutz`,
        fuerWen:"Für alle die Kontrolle wollen — mit ausreichend Puffer.",
        highlight:false,
      },
    ];

    return (
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL} badge="Vorsorge-Check" makler={MAKLER} T={T}/>

        {/* Block 1: Rentenlücke */}
        <div style={T.hero}>
          <div style={T.eyebrow}>Deine Rentenanalyse</div>
          <div style={T.h1}>So kann Ihre Vorsorgesituation eingeordnet werden</div>
          <div style={T.body}>{gutAufgestellt ? "Gut versorgt — keine Lücke ✓" : `Dir fehlen später monatlich ca. ${fmt(R.luecke)}.`} · {R.deckung}% gedeckt · {R.jahreBis} Jahre Ansparzeit</div>
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
          {p.inflationsschutz && R.luecke > 0 && (
            <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"4px", lineHeight:1.55 }}>
              Inflationsbereinigt für {R.jahreBis} Jahre (+2%/Jahr). Heutige Kaufkraft:{" "}
              {fmt(Math.round(R.ziel / Math.pow(1.02, R.jahreBis)))}/Mon.{p.lebensziel ? ` · Ziel: ${p.lebensziel === "standard" ? "🏡 Lebensstandard halten" : p.lebensziel === "reisen" ? "✈️ Reisen & genießen" : p.lebensziel === "ruhig" ? "🤝 Ruhiges Leben" : "❓ Offen"}` : ""}
            </div>
          )}
        </div>

        {/* Block 2: Schichten-Balken */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Deine heutige Vorsorge</div>
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
              <div style={{fontSize:"13px",fontWeight:"600",color:"#059669",marginBottom:"4px"}}>Gut versorgt — keine Lücke ✓</div>
              <div style={{fontSize:"12px",color:"#065f46",lineHeight:1.6}}>Deine Vorsorge deckt die Zielrente weitgehend ab. Beim Jahresgespräch prüfen wir ob Rendite, Inflation und Laufzeiten optimal abgestimmt sind.</div>
            </div>
          </div>
        ) : (
          <div style={T.section}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px"}}>So kannst du die Lücke schließen</div>
            <div style={{fontSize:"14px",fontWeight:"600",color:"#111",marginBottom:"12px"}}>Drei Wege — wähle was zu dir passt</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {strategien.map(st=>(
                <div key={st.id} style={{border:`1.5px solid ${st.highlight?C:"#e8e8e8"}`,borderRadius:"12px",overflow:"hidden",boxShadow:st.highlight?`0 4px 16px ${C}20`:"none"}}>
                  {st.highlight&&<div style={{background:C,padding:"5px 14px",fontSize:"11px",fontWeight:"700",color:"#fff",letterSpacing:"0.5px"}}>Ausgewogene Strategie</div>}
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
                    <div style={{fontSize:"11px",color:"#888",padding:"6px 10px",background:"#f0f4f8",borderRadius:"6px"}}><strong>Passt zu: </strong>{st.fuerWen}</div>
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
                <div style={{fontSize:"11px",fontWeight:"700",color:"#92400e",letterSpacing:"0.5px",textTransform:"uppercase"}}>Was 5 Jahre Warten wirklich kosten</div>
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
          <CheckBerechnungshinweis>
            <>
              <strong>Rentenlücke</strong> = Zielrente minus gesetzliche Rente minus bestehende Vorsorge. Zielrente wird bei aktivem Inflationsschutz mit 2%/Jahr auf den Rentenbeginn hochgerechnet.
              Lebenserwartung: 87 Jahre (Basis DAV 2004R). Sparrate Strategie A: Rentenversicherung (3% Zins), Strategie B: Depot/ETF (6% Zins, 3,5% Entnahmerate).{" "}
              <span style={{ color: "#b8884a" }}>Grundlage: §64 SGB VI.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop:"10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={()=>goTo(4)}>Rentenplan gemeinsam erstellen</button>
          <button style={T.btnSec} onClick={()=>goTo(2)}>Neue Berechnung starten</button>
        </div>
      </div>
    );
  }

  // Phase 1: 1 Frage pro Screen (5 Screens)
  return (
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <Header phase={scr} total={5} badge="Vorsorge-Check" makler={MAKLER} T={T}/>

      {scr===1&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorsorge-Check</div>
          <div style={T.h1}>Reicht Ihre Rente später aus?</div>
          <div style={T.body}>Wir berechnen Ihre mögliche Versorgungslücke und zeigen Ihnen drei Wege sie zu schließen.</div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={nextScr}>Check starten</button></div>
      </>}

      {scr===2&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihr Einkommen</div>
          <div style={T.h1}>Was verdienen Sie aktuell netto pro Monat?</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Monatliches Nettoeinkommen" value={p.netto} min={1000} max={8000} step={100} unit="€/Mon" accent={C} onChange={v=>{set("netto",v);set("gesRente",Math.round(v*0.46));}}/>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button><button style={T.btnSec} onClick={backScr}>Zurück</button></div>
      </>}

      {scr===3&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihr Alter</div>
          <div style={T.h1}>Wie alt sind Sie aktuell?</div>
          <div style={T.body}>Noch {R.jahreBis} Jahre bis zur gesetzlichen Rente mit {p.rentenAlter}.</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={20} max={60} step={1} unit="Jahre" display={`noch ${R.jahreBis} Jahre bis zur Rente`} accent={C} onChange={v=>set("alter",v)}/>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button><button style={T.btnSec} onClick={backScr}>Zurück</button></div>
      </>}

      {scr===4&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Vorhandene Vorsorge</div>
          <div style={T.h1}>Was haben Sie bereits für Ihre Rente aufgebaut?</div>
        </div>
        <div style={T.section}>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {id:"gesetz", l:"Nur gesetzlich",         d:"Bisher nur die gesetzliche Rentenversicherung"},
              {id:"bav",    l:"Betriebliche Vorsorge",  d:"Zusätzlich bAV oder Riester vom Arbeitgeber"},
              {id:"privat", l:"Private Vorsorge",       d:"Eigene private Rentenversicherung oder Fonds"},
              {id:"kombi",  l:"Kombination",            d:"Mehrere Bausteine kombiniert"},
            ].map(({id,l,d})=>(
              <SelectionCard key={id} value={id} label={l} description={d}
                selected={p._vorsorgeTyp===id} accent={C} onClick={()=>setVorsorgeTyp(id)}/>
            ))}
          </div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button><button style={T.btnSec} onClick={backScr}>Zurück</button></div>
      </>}

      {scr===5&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihr Ziel</div>
          <div style={T.h1}>Wie viel Einkommen möchten Sie im Alter haben?</div>
        </div>
        <div style={T.section}>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {v:50, l:"50 % meines Einkommens", d:`= ca. ${fmt(p.netto*0.5)}/Monat — Basisversorgung`},
              {v:70, l:"70 % meines Einkommens", d:`= ca. ${fmt(p.netto*0.7)}/Monat — Typisches Ziel`},
              {v:85, l:"80 %+ meines Einkommens",d:`= ca. ${fmt(p.netto*0.85)}/Monat — Voller Lebensstandard`},
            ].map(({v,l,d})=>(
              <SelectionCard key={v} value={String(v)} label={l} description={d}
                selected={p.zielProzent===v} accent={C} onClick={()=>set("zielProzent",v)}/>
            ))}
          </div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={nextScr}>Mein Ergebnis ansehen</button><button style={T.btnSec} onClick={backScr}>Zurück</button></div>
      </>}

    </div>
  );
}
