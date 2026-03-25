import { useMemo, useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
const WARN="#c0392b",OK="#059669";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK=(n)=>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":n>=10000?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
function makePflegeT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?C:"#e8e8e8"}`,background:a?C:"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"})};}
function Danke({name,onBack,makler,C}){return(<div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{makler.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${makler.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{makler.telefon}</a><a href={`mailto:${makler.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{makler.email}</a></div></div><button onClick={onBack} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div>);}
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
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Gespräch anfragen</div>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
            <div key={k} style={i<arr.length-1?T.row:T.rowLast}>
              <label style={T.fldLbl}>{l}{req?" *":""}</label>
              <input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>
            </div>
          ))}
        </div>
        <div style={{marginTop:"14px",marginBottom:"100px"}}>
          <CheckKontaktBeforeSubmitBlock maklerName={makler.name} consent={consent} onConsentChange={setConsent} />
        </div>
      </div>
      <div style={T.footer}>
        <button type="button" style={T.btnPrim(!valid)} onClick={()=>{if(valid)onSubmit();}} disabled={!valid}>Gespräch anfragen</button>
        <button type="button" style={T.btnSec} onClick={onBack}>Zurück</button>
      </div>
    </>
  );
}
function berechne(p){
  const leistStationaer=[0,770,1262,1775,2005,2005][p.pflegegrad]||0;
  const heimkosten=[0,2800,3200,3600,4000,4400][p.pflegegrad]||3600;
  const eigenStationaerBrutto = Math.max(0, heimkosten - leistStationaer);
  const UNTERKUNFT_VERPFLEGUNG = 700;
  const pflegeEigenanteil = Math.max(0, eigenStationaerBrutto - UNTERKUNFT_VERPFLEGUNG);
  const eigenJahr1 = UNTERKUNFT_VERPFLEGUNG + Math.round(pflegeEigenanteil * 0.85);
  const eigenJahr2 = UNTERKUNFT_VERPFLEGUNG + Math.round(pflegeEigenanteil * 0.7);
  const eigenJahr3 = UNTERKUNFT_VERPFLEGUNG + Math.round(pflegeEigenanteil * 0.5);
  const eigenJahr4 = UNTERKUNFT_VERPFLEGUNG + Math.round(pflegeEigenanteil * 0.25);
  const eigenStationaer = UNTERKUNFT_VERPFLEGUNG + Math.round(pflegeEigenanteil * 0.7);
  const leistAmbulant=[0,347,689,1298,1612,1995][p.pflegegrad]||0;
  const eigenAmbulant=Math.max(0,Math.round(heimkosten*0.5)-leistAmbulant);
  const dauer=[0,7,6,5,4,3][p.pflegegrad]||5;
  const gesamtEigen=eigenStationaer*12*dauer;
  // §43c SGB XI (ab 01.01.2024): 0–12 Mon: 15%, 13–24 Mon: 30%, 25–36 Mon: 50%,
  // ab 37 Mon: 75% auf pflegebedingten Eigenanteil; U+V (~700€/Mon.) nicht rabattierbar
  return{leistStationaer,heimkosten,eigenStationaer,eigenStationaerBrutto,eigenJahr1,eigenJahr2,eigenJahr3,eigenJahr4,pflegeEigenanteil,leistAmbulant,eigenAmbulant,dauer,gesamtEigen};
}
export default function PflegekostenplanungRechner(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makePflegeT(C),[C]);
  const isDemo = isCheckDemoMode();
  const[phase,setPhase]=useState(1);
  const[ak,setAk]=useState(0);
  const[danke,setDanke]=useState(false);
  const[detailsOpen,setDetailsOpen]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({pflegegrad:3,art:"stationaer",alter:50,absicherung:"keine"});
  const set=(k,v)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=3;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Pflegekosten</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={{...T.page,"--accent":C}}><Header/><Danke name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}} makler={MAKLER} C={C}/></div>);
  const eigen=p.art==="stationaer"?R.eigenStationaer:R.eigenAmbulant;

  // ── Phase 2: Ergebnis ────────────────────────────────────────────────────
  if(phase===2){
    // Einordnung basierend auf Alter und Eigenanteil
    const einordnung=()=>{
      const parts=[];
      if(eigen>=2000) parts.push(`${fmt(eigen)}/Monat ist eine erhebliche Belastung — das entspricht einem vollen Monatsgehalt, das aus Einkommen oder Vermögen getragen werden muss.`);
      else if(eigen>=1000) parts.push(`${fmt(eigen)}/Monat überschreitet für viele Menschen das verfügbare Einkommen im Rentenalter.`);
      else parts.push(`${fmt(eigen)}/Monat Eigenanteil klingt überschaubar — im Pflegefall über mehrere Jahre summiert sich das jedoch auf ${fmtK(R.gesamtEigen)}.`);
      parts.push(`Gesetzliche Pflegeversicherung deckt nur einen Teil — den Rest müssen Sie oder Ihre Familie selbst aufbringen.`);
      return parts.join(" ");
    };
    // Empfehlung je nach Absicherungsstatus
    const empfTitle=p.absicherung==="vorhanden"?"Ihren Schutz prüfen lassen":p.absicherung==="unsicher"?"Bestehenden Schutz prüfen":"Jetzt absichern";
    const empfText=p.absicherung==="vorhanden"
      ?"Prüfen Sie, ob Ihre bestehende Absicherung den tatsächlichen Eigenanteil von "+fmt(eigen)+"/Monat ausreichend deckt — viele Tarife sind mit alten Sätzen berechnet."
      :p.absicherung==="unsicher"
      ?"Klären Sie zunächst, ob und in welchem Umfang Sie bereits abgesichert sind — unvollständige Absicherung kann im Ernstfall teuer werden."
      :`Mit Pflegegrad ${p.pflegegrad} und einem Eigenanteil von ${fmt(eigen)}/Monat empfehlen wir eine private Pflegevorsorge, die diese Lücke schließt.`;
    // Altershinweis: unter 50 ist günstiger
    const alterHinweis=p.alter<50?"Je früher Sie abschließen, desto günstiger der Beitrag — vor 50 zahlen Sie oft die Hälfte gegenüber 60+.":p.alter<60?"Im Alter 50–60 ist Pflegevorsorge noch gut abschließbar — danach steigen die Beiträge deutlich.":"Ab 60 wird Pflegevorsorge teurer und Gesundheitsprüfungen aufwändiger — Handlungsbedarf besteht jetzt.";
    const tableItems=[
      {l:"Pflegekassenleistung",v:fmt(p.art==="stationaer"?R.leistStationaer:R.leistAmbulant)+"/Mon.",ok:true},
      {l:p.art==="stationaer"?"Heimkosten gesamt":"Ambulante Pflegekosten",v:fmt(p.art==="stationaer"?R.heimkosten:Math.round(R.heimkosten*0.5))+"/Mon."},
      {l:"Eigenanteil monatlich",v:fmt(eigen)+"/Mon.",hl:true},
      {l:`Eigenanteil gesamt (Ø ${R.dauer} Jahre)`,v:fmtK(R.gesamtEigen),hl:true},
    ];
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>

      {/* Block 1: Eigenanteil prominent */}
      <div style={T.hero}>
        <div style={T.eyebrow}>Pflegegrad {p.pflegegrad} · {p.art==="stationaer"?"Stationär":"Ambulant"}</div>
        <div style={T.h1}>{fmt(eigen)}/Monat Eigenanteil</div>
        <div style={T.body}>Über Ø {R.dauer} Jahre: <strong style={{color:WARN}}>{fmtK(R.gesamtEigen)}</strong> Gesamtbelastung</div>
        {p.art==="stationaer"&&(
          <div style={{fontSize:"11px",color:"#666",marginTop:"8px",lineHeight:1.6}}>
            Inkl. gesetzlichem Leistungszuschlag (§43c SGB XI):
            Jahr 1: {fmt(R.eigenJahr1)}/Mon. →
            Jahr 2: {fmt(R.eigenJahr2)}/Mon. →
            ab Jahr 3: {fmt(R.eigenJahr3)}/Mon. →
            ab Jahr 4: {fmt(R.eigenJahr4)}/Mon.
          </div>
        )}
      </div>

      {/* KPI-Kacheln */}
      <div style={T.section}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          {[
            {l:"Kassenleistung",v:fmt(p.art==="stationaer"?R.leistStationaer:R.leistAmbulant)+"/Mon.",ok:true},
            {l:"Eigenanteil",v:fmt(eigen)+"/Mon.",warn:true},
          ].map(({l,v,warn},i)=>(
            <div key={i} style={{border:`1px solid ${warn?WARN+"33":OK+"33"}`,borderRadius:"10px",padding:"12px 10px",background:warn?"#fff5f5":"#f0fdf4",textAlign:"center"}}>
              <div style={{fontSize:"15px",fontWeight:"700",color:warn?WARN:OK,letterSpacing:"-0.3px"}}>{v}</div>
              <div style={{fontSize:"10px",color:"#aaa",marginTop:"3px",fontWeight:"500"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Block 2: Einordnung */}
      <div style={T.section}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Was bedeutet das für Sie</div>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px 16px",background:"#fafafa"}}>
          <div style={{fontSize:"13px",color:"#444",lineHeight:1.65,marginBottom:"10px"}}>{einordnung()}</div>
          <div style={{fontSize:"12px",color:"#888",fontStyle:"italic"}}>{alterHinweis}</div>
        </div>
      </div>

      {/* Block 3: Empfehlung */}
      <div style={T.section}>
        <div style={{fontSize:"11px",fontWeight:"600",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>So können Sie vorsorgen</div>
        <div style={{border:`1.5px solid ${C}33`,borderRadius:"10px",overflow:"hidden"}}>
          <div style={{padding:"12px 16px",background:`${C}06`,borderBottom:"1px solid #f0f0f0"}}>
            <div style={{fontSize:"14px",fontWeight:"700",color:"#111"}}>{empfTitle}</div>
            <div style={{fontSize:"12px",color:"#666",marginTop:"4px",lineHeight:1.55}}>{empfText}</div>
          </div>
          {/* Produktübersicht */}
          {[
            {n:"Pflegetagegeld",t:"Zahlt einen festen Betrag pro Pflegetag — unabhängig von den tatsächlichen Kosten. Flexibel einsetzbar."},
            {n:"Pflegerente",t:"Zahlt eine monatliche Rente ab einem bestimmten Pflegegrad. Ideal zur Deckung laufender Eigenanteile."},
            {n:"Pflegekostenversicherung",t:"Erstattet konkrete Pflegekosten bis zur vereinbarten Höhe. Besonders bei hohen stationären Kosten sinnvoll."},
          ].map(({n,t},i,arr)=>(
            <div key={i} style={{padding:"11px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{fontSize:"12px",fontWeight:"700",color:"#333",marginBottom:"2px"}}>{n}</div>
              <div style={{fontSize:"12px",color:"#777",lineHeight:1.5}}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Block 4: Details einklappbar */}
      <div style={T.section}>
        <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Vollständige Berechnung {detailsOpen?"ausblenden":"anzeigen"}
        </button>
        {detailsOpen&&(
          <div style={T.card}>
            {tableItems.map(({l,v,hl,ok},i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
                <span style={{fontSize:"12px",color:"#666"}}>{l}</span>
                <span style={{fontSize:"12px",fontWeight:"600",color:hl?WARN:ok?OK:"#111"}}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{...T.section,marginBottom:"0"}}>
        <CheckBerechnungshinweis>
          <>
            <strong>Eigenanteil</strong> = Heimkosten minus gesetzliche Kassenleistung (<span style={{ color: "#b8884a" }}>§43 SGB XI</span>).
            Ab Monat 13 reduziert sich der pflegebedingte Eigenanteil durch den gesetzlichen Leistungszuschlag (<span style={{ color: "#b8884a" }}>§43c SGB XI</span>): Monat 13–24: 30% Rabatt, Monat 25–36: 50% Rabatt, ab Monat 37: 75% Rabatt.
            Unterkunft und Verpflegung (~700 €/Mon.) sind nicht rabattierbar. Alle Werte: Ø-Werte nach BMG 2026.
          </>
        </CheckBerechnungshinweis>
        <div style={T.infoBox}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
      </div>
      {/* Block 5: Kontakt CTA */}
      <div style={{height:"120px"}}/>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Gespräch anfragen</button>
        <button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button>
      </div>
    </div>);
  }

  // ── Phase 3: Kontakt ─────────────────────────────────────────────────────
  if(phase===3){
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>
      <div style={T.hero}>
        <div style={T.eyebrow}>Gespräch vereinbaren</div>
        <div style={T.h1}>Wir bereiten alles vor</div>
        <div style={T.body}>Ihr Ergebnis wird mit dem Gespräch verknüpft — so können wir direkt loslegen.</div>
      </div>
      <div style={{...T.section,marginBottom:"8px",padding:"0 24px"}}>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"12px 14px",background:"#fafafa",marginBottom:"16px",display:"flex",gap:"20px"}}>
          <div><div style={{fontSize:"16px",fontWeight:"700",color:WARN,letterSpacing:"-0.3px"}}>{fmt(eigen)}/Mon.</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>Eigenanteil</div></div>
          <div><div style={{fontSize:"16px",fontWeight:"700",color:"#111",letterSpacing:"-0.3px"}}>PG {p.pflegegrad}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>Pflegegrad</div></div>
          <div><div style={{fontSize:"16px",fontWeight:"700",color:"#111",letterSpacing:"-0.3px"}}>{fmtK(R.gesamtEigen)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>Gesamt Ø</div></div>
        </div>
      </div>
      <KontaktForm fd={fd} setFd={setFd} isDemo={isDemo} onSubmit={async ()=>{const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"pflege-check",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setDanke(true);}} onBack={()=>goTo(2)} makler={MAKLER} T={T}/>
    </div>);
  }


  // ── Phase 1: Eingabe ─────────────────────────────────────────────────────
  return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Pflegekostenplanung</div><div style={T.h1}>Was kostet Pflege wirklich?</div><div style={T.body}>Eigenanteile nach Pflegegrad — stationär und ambulant. Inklusive Einordnung und Vorsorgeempfehlung.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><SliderCard label="Pflegegrad" value={p.pflegegrad} min={1} max={5} step={1} unit="" display={["","Geringe Beeinträchtigung","Erhebliche Beeinträchtigung","Schwere Beeinträchtigung","Schwerste Beeinträchtigung","Schwerste Beeinträchtigung mit bes. Anforderungen"][p.pflegegrad]} accent={C} onChange={v=>set("pflegegrad",v)}/></div>
      <div style={T.row}><SliderCard label="Ihr Alter" value={p.alter} min={30} max={80} step={1} unit="Jahre" hint="Beeinflusst Beitragshöhe und Handlungsempfehlung" accent={C} onChange={v=>set("alter",v)}/></div>
      <div style={T.row}><label style={T.fldLbl}>Pflegeart</label><div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
        <SelectionCard value="stationaer" label="Stationär (Heim)" description="Vollstationäre Pflege" selected={p.art==="stationaer"} accent={C} onClick={()=>set("art","stationaer")}/>
        <SelectionCard value="ambulant" label="Ambulant (Zuhause)" description="Pflege zu Hause" selected={p.art==="ambulant"} accent={C} onClick={()=>set("art","ambulant")}/>
      </div></div>
      <div style={T.rowLast}><label style={T.fldLbl}>Bestehende Pflegeabsicherung</label><div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
        {[
          {v:"keine",l:"Keine",d:"Noch keine private Vorsorge"},
          {v:"unsicher",l:"Unsicher",d:"Vertrag unklar oder alt"},
          {v:"vorhanden",l:"Vorhanden",d:"Aktiver Pflege-Baustein"},
        ].map(({v,l,d})=>(
          <SelectionCard key={v} value={v} label={l} description={d} selected={p.absicherung===v} accent={C} onClick={()=>set("absicherung",v)}/>
        ))}
      </div></div>
    </div></div>
    <div style={{height:"120px"}}/>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Eigenanteil berechnen</button></div>
  </div>);
}
