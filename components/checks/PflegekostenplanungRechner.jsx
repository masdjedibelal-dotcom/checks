import { useMemo, useState, useEffect } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
const WARN="#c0392b",OK="#059669";
const fmt =(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK=(n)=>n>=10000?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
function makePflegeT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?C:"#e8e8e8"}`,background:a?C:"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"}),
resultHero:{padding:"52px 24px 40px",textAlign:"center",background:"#fff"},
resultEyebrow:{fontSize:"12px",fontWeight:"500",color:"#9CA3AF",letterSpacing:"0.2px",marginBottom:"14px"},
resultNumber:{fontSize:"52px",fontWeight:"800",color:WARN,letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"},
resultUnit:{fontSize:"14px",color:"#9CA3AF",marginBottom:"18px"},
resultSub:{fontSize:"13px",color:"#9CA3AF",lineHeight:1.55,marginTop:"12px"},
statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
statusInfo:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#0369A1"},
cardPrimary:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"20px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 6px 24px rgba(17,24,39,0.08)"},
cardContext:{background:"#FAFAF8",border:"1px solid rgba(17,24,39,0.05)",borderRadius:"16px",padding:"18px 20px"},
warnCard:{background:"#FFF6F5",border:"1px solid #F2D4D0",borderLeft:"3px solid #C0392B",borderRadius:"14px",padding:"18px 20px"},
warnCardTitle:{fontSize:"13px",fontWeight:"700",color:"#C0392B",marginBottom:"6px"},
sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"},
dataRow:{padding:"14px 20px",borderBottom:"1px solid rgba(17,24,39,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"},
dataRowLast:{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"},
};}
function Danke({name,onBack,makler,C}){return(<div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{makler.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${makler.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{makler.telefon}</a><a href={`mailto:${makler.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{makler.email}</a></div></div><button onClick={onBack} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div>);}
function KontaktForm({fd,setFd,onSubmit,onBack,isDemo,makler,T}){
  const[consent,setConsent]=useState(false);
  const valid=fd.name.trim()&&fd.email.trim()&&consent;
  if(isDemo){
    return(
      <>
        <div style={{textAlign:"center",padding:"24px 0 8px"}}>
          <div style={{fontSize:"13px",color:"#999",marginBottom:"16px"}}>Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.</div>
          <button type="button" style={{...T.btnPrim(false)}} onClick={()=>window.parent.postMessage({type:"openConfig",slug:"pflege-check"},"*")}>Anpassen & kaufen</button>
        </div>
        <div style={T.footer}><button type="button" style={T.btnSec} onClick={onBack}>Zurück</button></div>
      </>
    );
  }
  return(
    <>
      <div style={{...T.section,marginBottom:"0"}}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"tel",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
            <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
              <label style={T.fldLbl}>{l}{req?" *":""}</label>
              <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
              {hint&&<div style={T.fldHint}>{hint}</div>}
            </div>
          ))}
        </div>
        <div style={{marginTop:"14px",marginBottom:"100px"}}>
          <CheckKontaktBeforeSubmitBlock maklerName={makler.name} consent={consent} onConsentChange={setConsent} />
        </div>
      </div>
      <div style={T.footer}>
        <button type="button" style={T.btnPrim(!valid)} onClick={()=>{if(valid)onSubmit();}} disabled={!valid}>{valid?"Vorsorge prüfen lassen":"Bitte alle Angaben machen"}</button>
        <button type="button" style={T.btnSec} onClick={onBack}>Zurück</button>
      </div>
    </>
  );
}
// ─── BERECHNUNG (vereinfacht, Ø-Werte) ───────────────────────────────────────
function berechne({ art, bedarf }) {
  // Basiswerte nach Pflegesetting
  const BASIS_KOSTEN = art === "ambulant" ? 2000 : 3500;
  const BASIS_KASSE  = art === "ambulant" ?  800 : 1200;

  // Bedarf-Multiplikator: gering → 80 %, mittel → 100 %, hoch → 130 %
  const MULT = bedarf === "gering" ? 0.8 : bedarf === "hoch" ? 1.3 : 1.0;

  const kosten      = Math.round(BASIS_KOSTEN * MULT);
  const kasse       = Math.round(BASIS_KASSE  * MULT);
  const eigenanteil = kosten - kasse;

  // Gesamtkosten: 48 Monate (4 Jahre Ø-Pflegedauer)
  const gesamt = eigenanteil * 48;

  return { kosten, kasse, eigenanteil, gesamt };
}
export default function PflegekostenplanungRechner(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makePflegeT(C),[C]);
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk]       = useState(0);
  const [danke, setDanke] = useState(false);
  const [fd, setFd]       = useState({ name: "", email: "", tel: "" });
  const [p, setP]         = useState({ art: "heim", bedarf: "mittel", alter: 50, absicherung: "nein" });
  const [loading, setLoading]   = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [scr, setScr] = useState(1);
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const goTo    = (ph) => { setAk(k => k + 1); setPhase(ph); };
  const nextScr = () => { if (scr < 4) { setScr(s => s + 1); } else { setLoading(true); } };
  const backScr = () => { if (scr > 1) { setScr(s => s - 1); } };
  const R = berechne(p);
  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  useEffect(()=>{
    if(!loading)return;
    const delays=[0,480,980,1600];
    const timers=delays.map((d,i)=>setTimeout(()=>setLoadStep(i+1),d));
    const done=setTimeout(()=>{setLoading(false);setLoadStep(0);goTo(2);},2300);
    return()=>{timers.forEach(clearTimeout);clearTimeout(done);};
  },[loading]); // eslint-disable-line react-hooks/exhaustive-deps
  const progPct = phase === 1 ? scr * 22 : { 2: 88, 3: 100 }[phase] || 100;
  const Header = () => (
    <>
      <div style={T.header}>
        <div style={T.logo}><div style={T.logoMk}><LogoSVG /></div><span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{MAKLER.firma}</span></div>
        <span style={T.badge}>Pflege-Check</span>
      </div>
      <div style={T.prog}><div style={T.progFil(progPct)} /></div>
    </>
  );
  if(danke)return(<div style={{...T.page,"--accent":C}}><Header/><Danke name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}} makler={MAKLER} C={C}/></div>);

  // ── Loader ──────────────────────────────────────────────────────────────────
  if(loading){
    const STEPS=[
      {label:"Pflegekassenleistung berechnet"},
      {label:"Eigenanteil ermittelt"},
      {label:"Gesamtkosten (48 Monate) berechnet"},
      {label:"Handlungsempfehlung erstellt"},
    ];
    return(
      <div style={{...T.page,"--accent":C}}>
        <Header/>
        <div style={{padding:"64px 24px 32px",textAlign:"center"}} className="fade-in">
          <div style={{fontSize:"20px",fontWeight:"700",color:"#111",lineHeight:1.3,marginBottom:"40px"}}>
            Wir berechnen deinen<br/>Eigenanteil…
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"14px",maxWidth:"300px",margin:"0 auto"}}>
            {STEPS.map(({label},i)=>{
              const done=loadStep>i;
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"24px",height:"24px",borderRadius:"50%",background:done?C:"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.35s ease"}}>
                    {done
                      ? <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#ddd"}}/>
                    }
                  </div>
                  <div style={{fontSize:"14px",color:done?"#111":"#bbb",fontWeight:done?"600":"400",textAlign:"left",transition:"color 0.3s ease"}}>
                    {done?"✓ ":"… "}{label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 2: Ergebnis ────────────────────────────────────────────────────
  if (phase === 2) {
    const { eigenanteil, kosten, kasse, gesamt } = R;
    const artLabel = p.art === "ambulant" ? "ambulant (zuhause)" : "im Pflegeheim";

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header />

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Ihre Pflegekosten-Einschätzung</div>
          <div style={T.resultNumber}>{fmt(eigenanteil)}</div>
          <div style={T.resultUnit}>monatlicher Eigenanteil · {artLabel}</div>
          <div style={T.statusWarn}>Eigenanteil nicht durch Pflegekasse gedeckt</div>
          <div style={T.resultSub}>Durchschnittswerte · können abweichen · auf Basis Ihrer Angaben</div>
        </div>

        {/* ── Breakdown Visual ──────────────────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Kosten-Breakdown</div>
          <div style={T.cardPrimary}>
            <div style={T.dataRow}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>Gesamtkosten (Ø)</span>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937", letterSpacing: "-0.3px" }}>{fmt(kosten)}/Mon.</span>
            </div>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(17,24,39,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: OK }}>Pflegekasse übernimmt</span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: OK, letterSpacing: "-0.3px" }}>− {fmt(kasse)}</span>
            </div>
            <div style={{ padding: "16px 20px", background: "#FFF6F5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#1F2937" }}>Ihr Eigenanteil</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: WARN, letterSpacing: "-0.8px" }}>{fmt(eigenanteil)}/Mon.</span>
            </div>
          </div>
        </div>

        {/* ── Section 1: Das bedeutet für Sie ──────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Das bedeutet für Sie</div>
          <div style={T.cardContext}>
            {[
              {
                icon: "⚠️",
                title: "Kosten werden nicht vollständig gedeckt",
                text: `Die gesetzliche Pflegeversicherung übernimmt nur einen Teil der Kosten — ca. ${fmt(kasse)}/Monat. Die restlichen ${fmt(eigenanteil)}/Monat bleiben als Eigenanteil bei Ihnen.`,
              },
              {
                icon: "📅",
                title: "Eigenanteil fällt langfristig an",
                text: "Die Pflegebedürftigkeit dauert im Durchschnitt 4 Jahre oder länger. Der monatliche Eigenanteil ist keine einmalige Ausgabe, sondern ein dauerhafter Kostenfaktor.",
              },
            ].map(({ icon, title, text }, i, arr) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: i < arr.length - 1 ? "14px" : "0", marginBottom: i < arr.length - 1 ? "14px" : "0", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none" }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937", marginBottom: "3px" }}>{title}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Gesamtkosten (KEY MOMENT) ─────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Gesamtkosten über 48 Monate</div>
          <div style={T.warnCard}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#C0392B", marginBottom: "10px" }}>
              Hochrechnung: 48 Monate Ø-Pflegedauer
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span style={{ fontSize: "16px", color: "#7B2A2A" }}>{fmt(eigenanteil)} ×</span>
              <span style={{ fontSize: "16px", color: "#7B2A2A" }}>48 Monate =</span>
              <span style={{ fontSize: "36px", fontWeight: "800", color: "#C0392B", letterSpacing: "-1.5px", lineHeight: 1 }}>{fmtK(gesamt)}</span>
            </div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.6 }}>
              Diese Summe müsste aus Eigenkapital, Rente oder anderen Quellen aufgebracht werden — ohne Absicherung.
            </div>
          </div>
        </div>

        {/* ── Section 3: Wer trägt diese Kosten? ───────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Wer trägt diese Kosten?</div>
          <div style={T.cardContext}>
            <div style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.7, marginBottom: "12px" }}>
              Im Pflegefall entstehen die Kosten zunächst für den Betroffenen selbst. Die eigenen Ersparnisse und Einkünfte werden in der Regel zuerst eingesetzt.
            </div>
            {[
              { icon: "💰", label: "Eigenes Vermögen", desc: "Erspartes, Immobilienvermögen oder laufende Renteneinnahmen werden herangezogen." },
              { icon: "👨‍👩‍👧", label: "Ggf. familiäre Unterstützung", desc: "In bestimmten Situationen können Angehörige in die Pflicht genommen werden. Dies hängt von gesetzlichen Regelungen und individuellen Umständen ab." },
            ].map(({ icon, label, desc }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 1 ? "12px" : "0" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#9CA3AF", fontStyle: "italic", lineHeight: 1.5 }}>
              Die konkreten Regelungen zur Kostentragung sind individuell — eine persönliche Beratung klärt Ihre genaue Situation.
            </div>
          </div>
        </div>

        {/* ── Section 4: Warum frühe Absicherung wichtig ist ───────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Warum frühe Absicherung wichtig ist</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "Beiträge steigen", desc: "Mit jedem Lebensjahr erhöht sich der monatliche Beitrag für Pflegevorsorge spürbar.", color: "#f97316" },
              { label: "Gesundheitsprüfung", desc: "Mit höherem Alter und Vorerkrankungen wird der Abschluss schwieriger.", color: "#ef4444" },
              { label: "Früher Einstieg", desc: "Wer vor 50 absichert, zahlt oft halb so viel wie mit 60+.", color: "#059669" },
              { label: "Leistungsumfang", desc: "Gute Tarife gibt es vor allem in jüngeren Jahren — mit vollem Leistungsumfang.", color: "#0369a1" },
            ].map(({ label, desc, color }, i) => (
              <div key={i} style={{ padding: "14px", border: "1px solid rgba(17,24,39,0.08)", borderRadius: "14px", background: "#FAFAF8" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color, marginBottom: "4px", letterSpacing: "0.2px" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.45 }}>{desc}</div>
              </div>
            ))}
          </div>
          {p.alter >= 50 && (
            <div style={{ marginTop: "10px", padding: "12px 14px", background: "#FFFBEB", borderRadius: "10px", border: "1px solid #FCD34D", fontSize: "12px", color: "#92400E", lineHeight: 1.6 }}>
              <strong>Hinweis für Ihr Alter:</strong>{" "}
              {p.alter < 60
                ? "Im Alter 50–60 ist Pflegevorsorge noch gut abschließbar — danach steigen Beiträge und Anforderungen deutlich."
                : "Ab 60 wird Pflegevorsorge teurer und Gesundheitsprüfungen umfangreicher — jetzt ist der richtige Moment zu handeln."}
            </div>
          )}
        </div>

        {/* ── Section 5: Das kann sinnvoll sein ────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Das kann sinnvoll sein</div>
          <div style={T.cardPrimary}>
            {[
              { label: "Pflegezusatz prüfen", desc: "Pflegetagegeld oder Pflegerente schließen die Lücke, die die gesetzliche Kasse lässt — flexibel und planbar.", icon: "🔍" },
              { label: p.absicherung === "ja" ? "Bestehende Absicherung vergleichen" : "Bestehende Absicherung erfassen", desc: p.absicherung === "ja" ? "Prüfen Sie, ob Ihre bestehende Absicherung den heutigen Eigenanteil von " + fmt(eigenanteil) + "/Mon. noch vollständig deckt." : "Ohne Absicherung trägt das volle Kostenrisiko das eigene Vermögen — eine frühzeitige Lösung reduziert den späteren Aufwand.", icon: p.absicherung === "ja" ? "⚖️" : "📋" },
            ].map(({ label, desc, icon }, i, arr) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none", display: "flex", alignItems: "flex-start", gap: "12px" }}>
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
        <div style={{ ...T.section, marginBottom: "120px" }}>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Einordnung mit Durchschnittswerten. Eigenanteil = Ø-Pflegekosten minus Pflegekassenleistung (§43 SGB XI). Gesamtkosten: Eigenanteil × 48 Monate (Ø-Pflegedauer). Alle Werte können je nach Region, Pflegegrad und Einrichtung erheblich abweichen.
              <span style={{ color: "#b8884a" }}> Keine Rechtsberatung. Grundlage: §43 SGB XI.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={() => goTo(3)}>Pflegevorsorge gemeinsam prüfen</button>
          <button style={T.btnSec} onClick={() => goTo(1)}>Neue Berechnung starten</button>
        </div>
      </div>
    );
  }

  // ── Phase 3: Kontakt ─────────────────────────────────────────────────────
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
              <div style={{ fontSize: "16px", fontWeight: "700", color: WARN, letterSpacing: "-0.3px" }}>{fmt(R.eigenanteil)}/Mon.</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Eigenanteil</div>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" }}>{p.art === "ambulant" ? "Zuhause" : "Pflegeheim"}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Pflegesetting</div>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" }}>{fmtK(R.gesamt)}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Gesamt Ø 48 Mon.</div>
            </div>
          </div>
        </div>
        <KontaktForm
          fd={fd} setFd={setFd} isDemo={isDemo}
          onSubmit={async () => {
            const token = new URLSearchParams(window.location.search).get("token");
            if (token) { await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slug: "pflege-check", kundenName: fd.name, kundenEmail: fd.email, kundenTel: fd.tel || "" }) }).catch(() => {}); }
            setDanke(true);
          }}
          onBack={() => goTo(2)} makler={MAKLER} T={T}
        />
      </div>
    );
  }


  // ── Phase 1: Eingabe (4 Screens, kein Intro) ─────────────────────────────
  const BEDARF_OPTS = [
    { id: "gering", label: "Gering",  desc: "Unterstützung bei einzelnen Alltagstätigkeiten nötig",          hint: "Ø ca. " + fmt(Math.round(2000 * 0.8)) + " – " + fmt(Math.round(3500 * 0.8)) + "/Mon." },
    { id: "mittel", label: "Mittel",  desc: "Regelmäßige Hilfe bei Körperpflege & Haushalt erforderlich",    hint: "Ø ca. " + fmt(2000) + " – " + fmt(3500) + "/Mon." },
    { id: "hoch",   label: "Hoch",    desc: "Umfangreiche bis Rund-um-die-Uhr-Betreuung notwendig",          hint: "Ø ca. " + fmt(Math.round(2000 * 1.3)) + " – " + fmt(Math.round(3500 * 1.3)) + "/Mon." },
  ];

  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header />

      {/* Screen 1: Pflegesetting */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Pflege-Check · 1 / 4</div>
          <div style={T.h1}>Wie möchten Sie im Pflegefall versorgt werden?</div>
          <div style={T.body}>Das bestimmt maßgeblich, welche Kosten auf Sie zukommen.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SelectionCard value="ambulant"   label="Zuhause"     description="Ambulante Pflege durch Pflegedienst oder Angehörige — im gewohnten Umfeld." selected={p.art === "ambulant"}  accent={C} onClick={() => set("art", "ambulant")} />
            <SelectionCard value="heim"       label="Pflegeheim"  description="Vollstationäre Unterbringung in einer Pflegeeinrichtung."                     selected={p.art === "heim"}     accent={C} onClick={() => set("art", "heim")} />
          </div>
          <div style={{ ...T.infoBox, marginTop: "14px" }}>
            <strong>Hinweis:</strong> Durchschnittliche Pflegekosten liegen je nach Setting bei ca. 2.000 € (ambulant) oder 3.500 € (stationär) pro Monat. Diese Werte können je nach Region und Einrichtung abweichen.
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter</button>
        </div>
      </>}

      {/* Screen 2: Pflegebedarf */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Pflege-Check · 2 / 4</div>
          <div style={T.h1}>Wie schätzen Sie Ihren möglichen Pflegebedarf ein?</div>
          <div style={T.body}>Vereinfachte Einschätzung — intern wird der Bedarf auf typische Pflegesituationen gemappt.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {BEDARF_OPTS.map(({ id, label, desc, hint }) => (
              <div
                key={id}
                onClick={() => set("bedarf", id)}
                style={{ padding: "16px 18px", border: `1.5px solid ${p.bedarf === id ? C : "#e5e7eb"}`, borderRadius: "14px", background: p.bedarf === id ? `${C}08` : "#fff", cursor: "pointer", transition: "all 0.15s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: p.bedarf === id ? C : "#1F2937" }}>{label}</div>
                  <div style={{ fontSize: "11px", fontWeight: "500", color: "#9CA3AF" }}>{hint}</div>
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(!p.bedarf)} disabled={!p.bedarf} onClick={nextScr}>Weiter</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 3: Alter */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Pflege-Check · 3 / 4</div>
          <div style={T.h1}>Wie alt sind Sie aktuell?</div>
          <div style={T.body}>Das Einstiegsalter beeinflusst die Höhe des Vorsorgebeitrags erheblich.</div>
        </div>
        <div style={T.section}>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "14px", padding: "22px 20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "8px" }}>Ihr aktuelles Alter</div>
            <div style={{ fontSize: "44px", fontWeight: "800", color: "#111", letterSpacing: "-2px", lineHeight: 1, marginBottom: "16px" }}>
              {p.alter} <span style={{ fontSize: "18px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0" }}>Jahre</span>
            </div>
            <input type="range" min={25} max={75} step={1} value={p.alter} onChange={e => set("alter", +e.target.value)} style={{ width: "100%", accentColor: C }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
              <span>25</span><span>75</span>
            </div>
            {p.alter < 50 && (
              <div style={{ marginTop: "14px", padding: "10px 12px", background: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0", fontSize: "12px", color: "#15803D", lineHeight: 1.5 }}>
                Guter Zeitpunkt: Vor 50 zahlen Sie oft die Hälfte gegenüber einem Abschluss mit 60+.
              </div>
            )}
            {p.alter >= 60 && (
              <div style={{ marginTop: "14px", padding: "10px 12px", background: "#FFFBEB", borderRadius: "8px", border: "1px solid #FCD34D", fontSize: "12px", color: "#92400E", lineHeight: 1.5 }}>
                Ab 60 steigen Beiträge und Gesundheitsanforderungen deutlich — jetzt ist ein guter Moment zu handeln.
              </div>
            )}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 4: Bestehende Absicherung */}
      {scr === 4 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Pflege-Check · 4 / 4</div>
          <div style={T.h1}>Haben Sie bereits eine Pflegeabsicherung?</div>
          <div style={T.body}>Das hilft uns, Ihr Ergebnis passend einzuordnen.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SelectionCard value="nein"     label="Nein"     description="Ich bin bisher nicht privat gegen Pflegekosten abgesichert."             selected={p.absicherung === "nein"}     accent={C} onClick={() => set("absicherung", "nein")} />
            <SelectionCard value="ja"       label="Ja"       description="Ich habe bereits einen Pflegezusatztarif oder eine Pflegerente."           selected={p.absicherung === "ja"}       accent={C} onClick={() => set("absicherung", "ja")} />
            <SelectionCard value="unsicher" label="Unsicher" description="Ich bin nicht sicher, ob und in welchem Umfang ich abgesichert bin."       selected={p.absicherung === "unsicher"} accent={C} onClick={() => set("absicherung", "unsicher")} />
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Eigenanteil berechnen</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}
    </div>
  );
}
