import { useState } from "react";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();

const MAKLER={name:"Max Mustermann",firma:"Mustermann Versicherungen",email:"kontakt@mustermann-versicherungen.de",telefon:"089 123 456 78",primaryColor:"#1a3a5c"};
const C=MAKLER.primaryColor,WARN="#c0392b",OK="#059669";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK=(n)=>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":n>=10000?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);

// ─── BERECHNUNGEN (unverändert aus Quell-Rechnern) ────────────────────────────
function berechneMK(p){
  const{kaufpreis,eigenkapital,miete,mietSteigerung,zinsen,tilgung,instandhaltung,jahre}=p;
  const darlehen=kaufpreis-eigenkapital;
  const rate=(darlehen*(zinsen/100+tilgung/100))/12;
  const nebenkosten=kaufpreis*0.1;
  const gesamtinvest=eigenkapital+nebenkosten;
  const kaufKosten=rate*12*jahre+gesamtinvest;
  let mietGesamt=0,mietAkt=miete;
  for(let j=0;j<jahre;j++){mietGesamt+=mietAkt*12;mietAkt*=(1+mietSteigerung/100);}
  const diffMonatl=rate-miete;
  let anlageVerm=0;
  if(diffMonatl<0){for(let j=0;j<jahre;j++)anlageVerm=(anlageVerm+Math.abs(diffMonatl)*12)*(1+0.05);}
  const immWert=Math.round(kaufpreis*Math.pow(1.02,jahre));
  const restschuld=Math.max(0,darlehen*(1-tilgung/100*jahre)*0.9);
  const eigentumsWert=immWert-restschuld;
  let breakeven=null,kaufKum=gesamtinvest,mietKum=0,immW=kaufpreis;
  for(let j=1;j<=50;j++){
    kaufKum+=rate*12+instandhaltung*12;mietKum+=miete*Math.pow(1+mietSteigerung/100,j-1)*12;immW*=1.02;
    const nettoKauf=kaufKum-(immW-restschuld*Math.max(0,1-j*tilgung/100*0.1));
    if(breakeven===null&&nettoKauf<mietKum)breakeven=j;
  }
  return{rate,nebenkosten,gesamtinvest,kaufKosten,mietGesamt,diffMonatl,anlageVerm,immWert,eigentumsWert,breakeven};
}

function berechneAnschluss(p){
  const{restschuld,altZins,neuZins,tilgung,laufzeit}=p;
  const altRate=(restschuld*(altZins/100+tilgung/100))/12;
  const neuRate=(restschuld*(neuZins/100+tilgung/100))/12;
  const diffMonatl=neuRate-altRate;
  const mehrGesamt=diffMonatl*laufzeit*12;
  const altEnde=Math.max(0,restschuld-restschuld*(tilgung/100)*laufzeit);
  return{altRate,neuRate,diffMonatl,mehrGesamt,altEnde};
}

const BAUART_FAKTOR={massiv:1.0,fertig:0.85,holz:0.9,denkmal:1.4};
const BAUJAHR_ZUSCHLAG=(j)=>j<1950?1.3:j<1970?1.15:j<1990?1.05:1.0;
function berechneWG(p){
  const{flaeche,baujahr,bauart,versSum,photovoltaik}=p;
  const neuwert=Math.round(flaeche*1950*(BAUART_FAKTOR[bauart]||1)*BAUJAHR_ZUSCHLAG(baujahr));
  const pv_aufschlag=photovoltaik?Math.round(flaeche*120):0;
  const empfohleneVS=neuwert+pv_aufschlag;
  const unterversichert=versSum>0&&versSum<empfohleneVS*0.9;
  const deckungsluecke=Math.max(0,empfohleneVS-versSum);
  const deckung=versSum>0?Math.min(100,Math.round((versSum/empfohleneVS)*100)):0;
  return{neuwert,empfohleneVS,unterversichert,deckungsluecke,deckung,pv_aufschlag};
}

// ─── ABSICHERUNGS-CARDS je Modul ─────────────────────────────────────────────
const ABSICHERUNG={
  mk:[
    {t:"Risikolebensversicherung",n:"Sichert die Finanzierung im Todesfall ab — damit die Familie die Immobilie behalten kann.",p:"kritisch"},
    {t:"Berufsunfähigkeitsversicherung",n:"Bei BU können Rate und Lebenshaltung schnell nicht mehr tragbar sein.",p:"kritisch"},
    {t:"Wohngebäudeversicherung",n:"Pflichtversicherung bei Immobilienbesitz — Feuer, Leitungswasser, Sturm.",p:"kritisch"},
  ],
  anschluss:[
    {t:"Risikolebensversicherung",n:"Die Restschuld läuft weiter — wer übernimmt sie im Todesfall?",p:"kritisch"},
    {t:"Berufsunfähigkeitsversicherung",n:"Ein Einkommensausfall macht die neue Rate sofort zum Problem.",p:"kritisch"},
    {t:"Rechtsschutzversicherung",n:"Streitigkeiten rund um Darlehen oder Anschlussfinanzierung absichern.",p:"optional"},
  ],
  wg:[
    {t:"Wohngebäudeversicherung",n:"Ausreichende Versicherungssumme ist Pflicht — Unterversicherung kostet im Schadenfall.",p:"kritisch"},
    {t:"Elementarschadenversicherung",n:"Überschwemmung, Rückstau und Erdrutsch sind nicht im Standard enthalten.",p:"kritisch"},
    {t:"Privathaftpflichtversicherung",n:"Als Eigentümer haftest du auch für Schäden, die von deiner Immobilie ausgehen.",p:"sinnvoll"},
    {t:"Rechtsschutzversicherung",n:"Eigentümerrechtsschutz schützt bei Streit mit Mietern, Handwerkern oder Behörden.",p:"optional"},
  ],
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T={
  page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},
  header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{display:"flex",alignItems:"center",gap:"10px"},
  logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},
  badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},
  prog:{height:"2px",background:"#f0f0f0"},
  progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),
  hero:{padding:"32px 24px 16px"},
  eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},
  h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},
  body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},
  section:{padding:"0 24px",marginBottom:"20px"},
  card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},
  row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},
  rowLast:{padding:"14px 16px"},
  fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},
  fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},
  footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},
  btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),
  btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},
  infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},
  inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},
};

function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

// ─── ABSICHERUNGS-BLOCK ───────────────────────────────────────────────────────
function AbsicherungBlock({modul}){
  const cards=ABSICHERUNG[modul]||[];
  const prioColor={kritisch:WARN,sinnvoll:"#d97706",optional:"#888"};
  const prioBg={kritisch:"#fff5f5",sinnvoll:"#fffbf0",optional:"#f9f9f9"};
  return(
    <div style={T.section}>
      <div style={{fontSize:"11px",fontWeight:"700",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Absicherung rund um Ihre Immobilie</div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {cards.map(({t,n,p},i)=>(
          <div key={i} style={{border:`1px solid ${prioColor[p]}33`,borderRadius:"10px",padding:"12px 14px",background:prioBg[p],display:"flex",gap:"12px",alignItems:"flex-start"}}>
            <div style={{flexShrink:0,marginTop:"2px"}}>
              <span style={{fontSize:"10px",fontWeight:"700",color:prioColor[p],background:`${prioColor[p]}15`,padding:"2px 7px",borderRadius:"20px",letterSpacing:"0.3px",textTransform:"uppercase"}}>{p}</span>
            </div>
            <div>
              <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"3px"}}>{t}</div>
              <div style={{fontSize:"12px",color:"#555",lineHeight:1.55}}>{n}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HAUPTKOMPONENTE ──────────────────────────────────────────────────────────
export default function ImmobilienCheck(){
  const[phase,setPhase]=useState(1);
  const[ak,setAk]=useState(0);
  const[danke,setDanke]=useState(false);
  const[detailsOpen,setDetailsOpen]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[kontaktConsent,setKontaktConsent]=useState(false);
  // Phase 1 State
  const[situation,setSituation]=useState(""); // mieter | eigentuemer | kaufplan
  const[modul,setModul]=useState("");         // mk | anschluss | wg
  // Modul-States
  const[mk,setMk]=useState({kaufpreis:350000,eigenkapital:70000,miete:1200,mietSteigerung:2,zinsen:3.5,tilgung:2,instandhaltung:150,jahre:20});
  const[anschluss,setAnschluss]=useState({restschuld:220000,altZins:1.2,neuZins:3.8,tilgung:2,laufzeit:10});
  const[wg,setWg]=useState({flaeche:140,baujahr:1985,bauart:"massiv",versSum:320000,elementar:false,photovoltaik:false});
  const setM=(s,k,v)=>{if(s==="mk")setMk(x=>({...x,[k]:v}));else if(s==="anschluss")setAnschluss(x=>({...x,[k]:v}));else setWg(x=>({...x,[k]:v}));};
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const TOTAL=4;

  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Immobilien-Check</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);

  // Danke
  if(danke)return(<div style={{...T.page,"--accent":C}}><Header/><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden mit konkreten Hinweisen zu Ihrer Immobilie.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>{setDanke(false);setPhase(1);}} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);

  // ── Phase 4: Kontakt ─────────────────────────────────────────────────────
  if(phase===4){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>
      <div style={T.hero}><div style={T.eyebrow}>Gespräch vereinbaren</div><div style={T.h1}>Wir bereiten alles vor</div><div style={T.body}>Ihr Ergebnis wird mit dem Gespräch verknüpft — so können wir direkt loslegen.</div></div>
      <div style={T.section}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
            <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"4px"}}/></div>
          ))}
        </div>
        <div style={{marginTop:"14px",marginBottom:"100px"}}>
          <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Gespräch anfragen</button><button style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
    </div>);
  }

  // ── Phase 3: Ergebnis ────────────────────────────────────────────────────
  if(phase===3){
    const RMK=modul==="mk"?berechneMK(mk):null;
    const RA=modul==="anschluss"?berechneAnschluss(anschluss):null;
    const RWG=modul==="wg"?berechneWG(wg):null;

    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>

      {/* MODUL: Mieten vs. Kaufen */}
      {modul==="mk"&&RMK&&(<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Kaufen vs. Mieten</div>
          <div style={T.h1}>{RMK.breakeven?`Kaufen lohnt sich ab Jahr ${RMK.breakeven}`:"Langfristig rechnet sich Kaufen"}</div>
          <div style={T.body}>Monatliche Rate {fmt(RMK.rate)} · Nebenkosten {fmtK(RMK.nebenkosten)}</div>
        </div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}>
              <div style={{fontSize:"11px",fontWeight:"600",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px"}}>Monatliche Rate</div>
              <div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmt(RMK.rate)}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>Zins + Tilgung</div>
            </div>
            <div style={{border:`1px solid ${RMK.diffMonatl>0?WARN:"#e8e8e8"}`,borderRadius:"10px",padding:"14px",background:RMK.diffMonatl>0?"#fff5f5":"#f0fdf4"}}>
              <div style={{fontSize:"11px",fontWeight:"600",color:RMK.diffMonatl>0?WARN:OK,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px"}}>{RMK.diffMonatl>0?"Mehr als Miete":"Günstiger als Miete"}</div>
              <div style={{fontSize:"22px",fontWeight:"700",color:RMK.diffMonatl>0?WARN:OK,letterSpacing:"-0.5px"}}>{fmt(Math.abs(RMK.diffMonatl))}/Mon.</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>{RMK.diffMonatl>0?"Differenz zur Miete":"Differenz zur Miete"}</div>
            </div>
          </div>
          {RMK.breakeven&&(
            <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px 16px",background:"#f9f9f9",marginBottom:"12px"}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"4px"}}>Ab Jahr {RMK.breakeven} wird Kaufen günstiger als Mieten</div>
              <div style={{fontSize:"12px",color:"#666",lineHeight:1.55}}>Bis dahin überwiegen Nebenkosten und Zinsen. Danach profitiert der Käufer von gesunkener Restschuld und Wertsteigerung der Immobilie.</div>
            </div>
          )}
          <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Details {detailsOpen?"ausblenden":"anzeigen"}
          </button>
          {detailsOpen&&(<div style={T.card}>{[
            {l:"Darlehen",v:fmtK(mk.kaufpreis-mk.eigenkapital)},
            {l:"Nebenkosten (~10%)",v:fmtK(RMK.nebenkosten)},
            {l:"Gesamtinvestition",v:fmtK(RMK.gesamtinvest)},
            {l:`Kaufkosten über ${mk.jahre} Jahre`,v:fmtK(RMK.kaufKosten)},
            {l:`Mietkosten über ${mk.jahre} Jahre`,v:fmtK(RMK.mietGesamt)},
            {l:`Immobilienwert nach ${mk.jahre} Jahren`,v:fmtK(RMK.immWert)},
            {l:"Vermögenswert (Eigentum)",v:fmtK(RMK.eigentumsWert)},
          ].map(({l,v},i,arr)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><span style={{fontSize:"12px",color:"#666"}}>{l}</span><span style={{fontSize:"12px",fontWeight:"600",color:"#111"}}>{v}</span></div>))}</div>)}
        </div>
      </>)}

      {/* MODUL: Anschlussfinanzierung */}
      {modul==="anschluss"&&RA&&(<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Anschlussfinanzierung</div>
          <div style={T.h1}>{RA.diffMonatl>0?`+${fmt(RA.diffMonatl)}/Monat ab Anschluss`:"Rate bleibt stabil oder sinkt"}</div>
          <div style={T.body}>Restschuld {fmtK(anschluss.restschuld)} · Neuer Zins {anschluss.neuZins}% · {anschluss.laufzeit} Jahre</div>
        </div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}>
              <div style={{fontSize:"11px",fontWeight:"600",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px"}}>Aktuell</div>
              <div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmt(RA.altRate)}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>/Monat</div>
            </div>
            <div style={{border:`1px solid ${RA.diffMonatl>0?WARN:"#e8e8e8"}`,borderRadius:"10px",padding:"14px",background:RA.diffMonatl>0?"#fff5f5":"#fff"}}>
              <div style={{fontSize:"11px",fontWeight:"600",color:RA.diffMonatl>0?WARN:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px"}}>Ab Anschluss</div>
              <div style={{fontSize:"22px",fontWeight:"700",color:RA.diffMonatl>0?WARN:"#111",letterSpacing:"-0.5px"}}>{fmt(RA.neuRate)}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>/Monat</div>
            </div>
          </div>
          {RA.diffMonatl>0&&(
            <div style={{border:`1px solid ${WARN}33`,borderRadius:"10px",padding:"13px 16px",background:`${WARN}04`,borderLeft:`3px solid ${WARN}`,marginBottom:"12px"}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:WARN,marginBottom:"3px"}}>+{fmt(RA.diffMonatl)}/Monat Mehrbelastung</div>
              <div style={{fontSize:"12px",color:"#555",lineHeight:1.55}}>Über {anschluss.laufzeit} Jahre summiert sich das auf <strong>{fmtK(Math.abs(RA.mehrGesamt))}</strong> Mehrkosten.</div>
            </div>
          )}
          <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Details {detailsOpen?"ausblenden":"anzeigen"}
          </button>
          {detailsOpen&&(<div style={T.card}>{[
            {l:"Aktuelle Rate",v:fmt(RA.altRate)+"/Mon.",sub:`Zins ${anschluss.altZins}% + Tilgung ${anschluss.tilgung}%`},
            {l:"Neue Rate",v:fmt(RA.neuRate)+"/Mon.",sub:`Zins ${anschluss.neuZins}% + Tilgung ${anschluss.tilgung}%`,hl:RA.diffMonatl>0},
            {l:"Differenz monatlich",v:(RA.diffMonatl>0?"+":"")+fmt(RA.diffMonatl)+"/Mon.",hl:RA.diffMonatl>0},
            {l:`Mehrkosten über ${anschluss.laufzeit} Jahre`,v:fmtK(Math.abs(RA.mehrGesamt)),hl:RA.diffMonatl>0},
            {l:"Restschuld nach Laufzeit",v:fmtK(RA.altEnde)},
          ].map(({l,v,sub,hl},i,arr)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><div><div style={{fontSize:"12px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div><span style={{fontSize:"12px",fontWeight:"600",color:hl?WARN:"#111",flexShrink:0,marginLeft:"10px"}}>{v}</span></div>))}</div>)}
        </div>
      </>)}

      {/* MODUL: Wohngebäude */}
      {modul==="wg"&&RWG&&(<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Wohngebäude-Check</div>
          <div style={T.h1}>{RWG.unterversichert?`${fmtK(RWG.deckungsluecke)} Unterversicherung`:RWG.deckung===0?"Noch keine Versicherungssumme":"Ausreichend versichert"}</div>
          <div style={T.body}>Empfohlene Versicherungssumme {fmtK(RWG.empfohleneVS)} · Deckungsgrad {RWG.deckung}%</div>
        </div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            {[
              {l:"Empfohlen",v:fmtK(RWG.empfohleneVS),warn:false,accent:true},
              {l:"Vorhanden",v:wg.versSum>0?fmtK(wg.versSum):"Keine",warn:false,accent:false},
              {l:"Lücke",v:RWG.deckungsluecke>0?fmtK(RWG.deckungsluecke):"Keine",warn:RWG.unterversichert,accent:false},
            ].map(({l,v,warn,accent},i)=>(
              <div key={i} style={{border:`1px solid ${warn?WARN+"33":accent?C+"33":"#e8e8e8"}`,borderRadius:"10px",padding:"12px 8px",background:warn?"#fff5f5":accent?`${C}06`:"#fff",textAlign:"center"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:warn?WARN:accent?C:"#111",letterSpacing:"-0.2px"}}>{v}</div>
                <div style={{fontSize:"10px",color:"#aaa",marginTop:"3px",fontWeight:"500"}}>{l}</div>
              </div>
            ))}
          </div>
          {!wg.elementar&&(
            <div style={{border:`1px solid ${WARN}44`,borderRadius:"10px",padding:"13px 16px",background:`${WARN}04`,borderLeft:`3px solid ${WARN}`,marginBottom:"12px"}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:WARN,marginBottom:"3px"}}>Elementarschutz fehlt</div>
              <div style={{fontSize:"12px",color:"#555",lineHeight:1.55}}>Überschwemmung, Rückstau und Erdrutsch sind im Standard nicht enthalten — und werden bei Starkregen immer häufiger.</div>
            </div>
          )}
          <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Details {detailsOpen?"ausblenden":"anzeigen"}
          </button>
          {detailsOpen&&(<div style={T.card}>{[
            {l:"Wohnfläche",v:`${wg.flaeche} m²`},
            {l:"Baupreisindex 2025",v:"ca. 1.950 €/m²",sub:"GDV-Richtwert — regional abweichend"},
            {l:"Alters-/Baukostenzuschlag",v:BAUJAHR_ZUSCHLAG(wg.baujahr)===1?"-":`+${Math.round((BAUJAHR_ZUSCHLAG(wg.baujahr)-1)*100)}%`},
            {l:"Geschätzter Neuwert",v:fmtK(RWG.neuwert)},
            ...(wg.photovoltaik?[{l:"PV-Anlage Aufschlag",v:fmtK(RWG.pv_aufschlag)}]:[]),
            {l:"Empfohlene Versicherungssumme",v:fmtK(RWG.empfohleneVS)},
          ].map(({l,v,sub},i,arr)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><div><div style={{fontSize:"12px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div><span style={{fontSize:"12px",fontWeight:"600",color:"#111",flexShrink:0,marginLeft:"10px"}}>{v}</span></div>))}</div>)}
        </div>
      </>)}

      {/* Absicherungs-Block */}
      <AbsicherungBlock modul={modul}/>

      <div style={{...T.section,marginBottom:"120px"}}>
        <div style={T.infoBox}>Orientierungs-Check — Näherungswerte. Für verbindliche Angebote empfehlen wir ein persönliches Gespräch.</div>
        <div style={{...T.infoBox,marginTop:"10px"}}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
      </div>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={()=>goTo(4)}>Gespräch anfragen</button>
        <button style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button>
      </div>
    </div>);
  }

  // ── Phase 2: Modul-Eingabe ───────────────────────────────────────────────
  if(phase===2){
    const modulLabel={mk:"Kaufen vs. Mieten",anschluss:"Anschlussfinanzierung",wg:"Wohngebäude-Check"}[modul]||"";
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>
      <div style={T.hero}>
        <div style={T.eyebrow}>Schritt 2 von 3 · {modulLabel}</div>
        <div style={T.h1}>{{mk:"Kaufen oder Mieten?",anschluss:"Wie ändert sich Ihre Rate?",wg:"Sind Sie ausreichend versichert?"}[modul]}</div>
        <div style={T.body}>Geben Sie Ihre Daten ein — das Ergebnis erscheint im nächsten Schritt.</div>
      </div>

      {/* MODUL 1: Mieten vs Kaufen */}
      {modul==="mk"&&(
        <div style={T.section}><div style={T.card}>
          <div style={T.row}><SliderCard label="Kaufpreis" value={mk.kaufpreis} min={100000} max={1500000} step={10000} unit="€" accent={C} onChange={v=>setM("mk","kaufpreis",v)}/></div>
          <div style={T.row}><SliderCard label="Eigenkapital" value={mk.eigenkapital} min={0} max={500000} step={5000} unit="€" display={`= ${Math.round(mk.eigenkapital/mk.kaufpreis*100)}% Eigenkapitalquote`} accent={C} onChange={v=>setM("mk","eigenkapital",v)}/></div>
          <div style={T.row}><SliderCard label="Aktuelle Miete" value={mk.miete} min={300} max={4000} step={50} unit="€/Mon" accent={C} onChange={v=>setM("mk","miete",v)}/></div>
          <div style={T.row}><SliderCard label="Zinssatz" value={mk.zinsen} min={1} max={8} step={0.1} unit="%" accent={C} onChange={v=>setM("mk","zinsen",v)}/></div>
          <div style={T.row}><SliderCard label="Tilgungsrate" value={mk.tilgung} min={1} max={5} step={0.5} unit="%" accent={C} onChange={v=>setM("mk","tilgung",v)}/></div>
          <div style={T.row}><SliderCard label="Mietsteigerung p.a." value={mk.mietSteigerung} min={0} max={5} step={0.5} unit="%" accent={C} onChange={v=>setM("mk","mietSteigerung",v)}/></div>
          <div style={T.rowLast}><SliderCard label="Betrachtungszeitraum" value={mk.jahre} min={5} max={30} step={1} unit="Jahre" accent={C} onChange={v=>setM("mk","jahre",v)}/></div>
        </div></div>
      )}

      {/* MODUL 2: Anschlussfinanzierung */}
      {modul==="anschluss"&&(
        <div style={T.section}><div style={T.card}>
          <div style={T.row}><SliderCard label="Restschuld bei Anschluss" value={anschluss.restschuld} min={50000} max={800000} step={5000} unit="€" accent={C} onChange={v=>setM("anschluss","restschuld",v)}/></div>
          <div style={T.row}><SliderCard label="Alter Zinssatz (aktuell)" value={anschluss.altZins} min={0.5} max={5} step={0.1} unit="%" hint="Aus Ihrem laufenden Darlehensvertrag" accent={C} onChange={v=>setM("anschluss","altZins",v)}/></div>
          <div style={T.row}><SliderCard label="Neuer Zinssatz (Schätzung)" value={anschluss.neuZins} min={1} max={8} step={0.1} unit="%" hint="Aktuelles Marktniveau für Ihre Laufzeit" accent={C} onChange={v=>setM("anschluss","neuZins",v)}/></div>
          <div style={T.row}><SliderCard label="Tilgungsrate" value={anschluss.tilgung} min={1} max={5} step={0.5} unit="%" accent={C} onChange={v=>setM("anschluss","tilgung",v)}/></div>
          <div style={T.rowLast}><SliderCard label="Neue Zinsbindung" value={anschluss.laufzeit} min={5} max={20} step={1} unit="Jahre" accent={C} onChange={v=>setM("anschluss","laufzeit",v)}/></div>
        </div></div>
      )}

      {/* MODUL 3: Wohngebäude */}
      {modul==="wg"&&(
        <div style={T.section}><div style={T.card}>
          <div style={T.row}><SliderCard label="Wohnfläche" value={wg.flaeche} min={40} max={500} step={5} unit="m²" accent={C} onChange={v=>setM("wg","flaeche",v)}/></div>
          <div style={T.row}><SliderCard label="Baujahr" value={wg.baujahr} min={1900} max={2024} step={1} unit="" display={wg.baujahr<1950?"Altbau — höhere Wiederherstellungskosten":wg.baujahr<1990?"Bestandsbau":"Neuerer Bau"} accent={C} onChange={v=>setM("wg","baujahr",v)}/></div>
          <div style={T.row}>
            <label style={T.fldLbl}>Bauart</label>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
              {[
                {v:"massiv",l:"Massivbau",d:"Standard-Faktor für Neuwert"},
                {v:"fertig",l:"Fertighaus",d:"Oft günstigerer Wiederherstellungswert"},
                {v:"holz",l:"Holzbau",d:"Besondere Brand- und Feuchte-Risiken"},
                {v:"denkmal",l:"Denkmal",d:"Höherer Wiederherstellungsaufwand"},
              ].map(({v,l,d})=>(
                <SelectionCard key={v} value={v} label={l} description={d} selected={wg.bauart===v} accent={C} onClick={()=>setM("wg","bauart",v)}/>
              ))}
            </div>
          </div>
          <div style={T.row}><SliderCard label="Aktuelle Versicherungssumme" value={wg.versSum} min={0} max={2000000} step={10000} unit="€" hint="Aus Ihrem laufenden Wohngebäudevertrag" accent={C} onChange={v=>setM("wg","versSum",v)}/></div>
          <div style={T.row}>
            <label style={T.fldLbl}>Elementarschutz vorhanden?</label>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
              <SelectionCard value="el-ja" label="Ja" description="Überschwemmung & Co. mit abgesichert" selected={wg.elementar} accent={C} onClick={()=>setM("wg","elementar",true)}/>
              <SelectionCard value="el-nein" label="Nein / Unklar" description="Häufige Lücke im Standard-Tarif" selected={!wg.elementar} accent={C} onClick={()=>setM("wg","elementar",false)}/>
            </div>
          </div>
          <div style={T.rowLast}>
            <label style={T.fldLbl}>Photovoltaik-Anlage?</label>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
              <SelectionCard value="pv-ja" label="Ja" description="Zusatzwert in der Neuwertberechnung" selected={wg.photovoltaik} accent={C} onClick={()=>setM("wg","photovoltaik",true)}/>
              <SelectionCard value="pv-nein" label="Nein" description="Keine PV auf dem Dach" selected={!wg.photovoltaik} accent={C} onClick={()=>setM("wg","photovoltaik",false)}/>
            </div>
          </div>
        </div></div>
      )}

      <div style={{height:"120px"}}/>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Ergebnis berechnen</button>
        <button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button>
      </div>
    </div>);
  }

  // ── Phase 1: Situation + Thema ───────────────────────────────────────────
  const SIT_OPTS=[
    {v:"mieter",l:"Ich miete",desc:"Prüfe ob Kaufen sinnvoller ist",icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 10L10 3l9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="7" y="13" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/></svg>},
    {v:"eigentuemer",l:"Ich bin Eigentümer",desc:"Finanzierung oder Absicherung prüfen",icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 18h16M4 18V9.5L10 4l6 5.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="7.5" y="12" width="5" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/></svg>},
    {v:"kaufplan",l:"Ich plane zu kaufen",desc:"Kaufentscheidung vorbereiten",icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 18h16M4 18V9.5L10 4l6 5.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 10l1.5 1.5L17 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>},
  ];
  const MODUL_OPTS={
    mieter:[{v:"mk",l:"Kaufen oder Mieten?",desc:"Breakeven-Analyse"}],
    eigentuemer:[{v:"anschluss",l:"Anschlussfinanzierung",desc:"Neue Rate berechnen"},{v:"wg",l:"Wohngebäude-Check",desc:"Unterversicherung prüfen"}],
    kaufplan:[{v:"mk",l:"Kaufen oder Mieten?",desc:"Breakeven-Analyse"},{v:"anschluss",l:"Finanzierung kalkulieren",desc:"Rate berechnen"}],
  };
  const modulOpts=MODUL_OPTS[situation]||[];
  const canProceed=situation&&modul;

  return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in"><Header/>
    <div style={T.hero}>
      <div style={T.eyebrow}>Schritt 1 von 3 · Ihre Situation</div>
      <div style={T.h1}>Was bewegt Sie rund um Ihre Immobilie?</div>
      <div style={T.body}>Wählen Sie Ihre Situation — der Check passt sich automatisch an.</div>
    </div>

    {/* Situation */}
    <div style={T.section}>
      <div style={{fontSize:"12px",fontWeight:"600",color:"#555",marginBottom:"10px"}}>Meine aktuelle Situation</div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {SIT_OPTS.map(({v,l,desc,icon})=>{
          const a=situation===v;
          return(<button key={v} onClick={()=>{setSituation(v);setModul("");}} style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",borderRadius:"12px",border:`1.5px solid ${a?C:"#e8e8e8"}`,background:a?C:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.15s",boxShadow:a?`0 3px 10px ${C}30`:"none"}}>
            <div style={{color:a?"rgba(255,255,255,0.9)":"#888",flexShrink:0}}>{icon}</div>
            <div>
              <div style={{fontSize:"14px",fontWeight:"600",color:a?"#fff":"#111"}}>{l}</div>
              <div style={{fontSize:"12px",color:a?"rgba(255,255,255,0.7)":"#aaa",marginTop:"1px"}}>{desc}</div>
            </div>
            {a&&<div style={{marginLeft:"auto",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.2)"/><path d="M5 8l2.5 2.5L11 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
          </button>);
        })}
      </div>
    </div>

    {/* Modul-Auswahl — nur wenn Situation gewählt */}
    {situation&&modulOpts.length>0&&(
      <div style={T.section}>
        <div style={{fontSize:"12px",fontWeight:"600",color:"#555",marginBottom:"10px"}}>Was möchten Sie prüfen?</div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {modulOpts.map(({v,l,desc})=>{
            const a=modul===v;
            return(<button key={v} onClick={()=>setModul(v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderRadius:"10px",border:`1.5px solid ${a?C:"#e8e8e8"}`,background:a?`${C}08`:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div>
                <div style={{fontSize:"13px",fontWeight:"600",color:a?C:"#111"}}>{l}</div>
                <div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{desc}</div>
              </div>
              <div style={{width:"20px",height:"20px",borderRadius:"50%",border:`1.5px solid ${a?C:"#ddd"}`,background:a?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:"12px"}}>
                {a&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </button>);
          })}
        </div>
      </div>
    )}

    <div style={{height:"120px"}}/>
    <div style={T.footer}>
      <button style={T.btnPrim(!canProceed)} onClick={()=>canProceed&&goTo(2)} disabled={!canProceed}>
        {canProceed?"Weiter zu den Eingaben":"Bitte Situation und Thema wählen"}
      </button>
    </div>
  </div>);
}
