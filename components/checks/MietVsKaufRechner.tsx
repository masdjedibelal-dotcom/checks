'use client';

import { useMemo, useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
const fmt = (n: number) =>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK = (n: number) =>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":Math.round(n/1000)*1000>0?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function berechne(p: any) {
  const{kaufpreis,eigenkapital,miete,mietSteigerung,zinsen,tilgung,instandhaltung,jahre}=p;
  const darlehen=kaufpreis-eigenkapital;
  const rate=(darlehen*(zinsen/100+tilgung/100))/12;
  const nebenkosten=kaufpreis*0.1; // ~10% Nebenkosten (Notar, Grunderwerbsteuer, Makler)
  const gesamtinvest=eigenkapital+nebenkosten;
  // Kauf: Gesamtkosten über Laufzeit
  const kaufKosten=rate*12*jahre+gesamtinvest;
  // Miete: Gesamtkosten über Laufzeit mit Steigerung
  let mietGesamt=0,mietAkt=miete;
  for(let j=0;j<jahre;j++){mietGesamt+=mietAkt*12;mietAkt*=(1+mietSteigerung/100);}
  // Vermögensaufbau: gesparte Differenz (wenn Miete < Rate) könnte angelegt werden
  const diffMonatl=rate-miete;
  const anlageRendite=0.05;
  let anlageVerm=0;
  if(diffMonatl<0){for(let j=0;j<jahre;j++)anlageVerm=(anlageVerm+Math.abs(diffMonatl)*12)*(1+anlageRendite);}
  // Immobilienwert nach Laufzeit (Ø 2% p.a. Wertsteigerung)
  const immWert=Math.round(kaufpreis*Math.pow(1.02,jahre));
  const restschuld=Math.max(0,darlehen*(1-tilgung/100*jahre)*0.9);
  const eigentumsWert=immWert-restschuld;
  // Breakeven-Jahr
  let breakeven=null;
  let kaufKum=gesamtinvest,mietKum=0,immW=kaufpreis;
  for(let j=1;j<=50;j++){
    kaufKum+=rate*12+instandhaltung*12;
    mietKum+=miete*Math.pow(1+mietSteigerung/100,j-1)*12;
    immW*=1.02;
    const nettoKauf=kaufKum-(immW-restschuld*Math.max(0,1-j*tilgung/100*0.1));
    if(breakeven===null&&nettoKauf<mietKum)breakeven=j;
  }
  return{rate,nebenkosten,gesamtinvest,kaufKosten,mietGesamt,diffMonatl,anlageVerm,immWert,eigentumsWert,breakeven};
}


function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
export default function MietVsKaufRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({kaufpreis:450000,eigenkapital:90000,miete:1400,mietSteigerung:2,zinsen:3.8,tilgung:2,instandhaltung:150,jahre:20});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Mieten vs. Kaufen</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
      <div style={T.hero}><div style={T.eyebrow}>Vergleich nach {p.jahre} Jahren</div><div style={T.h1}>{R.breakeven?`Breakeven nach ${R.breakeven} Jahren`:"Kauf lohnt sich langfristig"}</div><div style={T.body}>Kauf-Rate {fmt(R.rate)}/Mon. vs. Miete {fmt(p.miete)}/Mon. · Immobilienwert {fmtK(R.immWert)}</div></div>
      <div style={T.section}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
          <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Kauf gesamt</div><div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmtK(R.kaufKosten)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>über {p.jahre} Jahre</div></div>
          <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Miete gesamt</div><div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmtK(R.mietGesamt)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>über {p.jahre} Jahre</div></div>
        </div>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px",marginBottom:"12px",textAlign:"center"}}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px"}}>Vermögenswert Immobilie nach {p.jahre} Jahren</div>
          <div style={{fontSize:"28px",fontWeight:"700",color:C,letterSpacing:"-0.8px"}}>{fmtK(R.eigentumsWert)}</div>
          <div style={{fontSize:"12px",color:"#aaa",marginTop:"4px"}}>Wert {fmtK(R.immWert)} − Restschuld</div>
        </div>
        <div style={{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6,marginBottom:"16px"}}>Vereinfachte Modellrechnung. Tatsächliche Entwicklung abhängig von Lage, Marktsituation und individuellen Faktoren. Keine Anlageberatung.</div>
      </div>
      {MAKLER.isDemoMode ? (
        <DemoCTA slug={MAKLER.slug} />
      ) : (
      <div style={{...T.section,marginBottom:"0"}}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Finanzierung besprechen</div>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"}}>{([{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}] as const).map(({k,l,t,ph,req},i,arr)=>(<div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>))}</div>
        <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
      </div>
      )}
      {!MAKLER.isDemoMode && (
      <div style={T.footer}><button style={{...T.btnPrim(!valid)}} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Finanzierung besprechen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      )}
    </div>);
  }
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Mieten vs. Kaufen</div><div style={T.h1}>Ab wann lohnt sich Kaufen?</div><div style={T.body}>Breakeven-Jahr und Vermögensvergleich über Ihre Laufzeit.</div></div>
    <div style={T.section}>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"}}>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Kaufpreis" value={p.kaufpreis} min={100000} max={1500000} step={10000} unit="€" onChange={v=>set("kaufpreis",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Eigenkapital" value={p.eigenkapital} min={0} max={500000} step={5000} unit="€" display={`${Math.round(p.eigenkapital/p.kaufpreis*100)}% des Kaufpreises · Darlehen ${fmtK(p.kaufpreis-p.eigenkapital)}`} hint="Empfohlen: mind. 20% Eigenkapital" onChange={v=>set("eigenkapital",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Vergleichsmiete" value={p.miete} min={500} max={5000} step={50} unit="€/Mon" hint="Was Sie alternativ zahlen würden" onChange={v=>set("miete",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Zinssatz" value={p.zinsen} min={1} max={7} step={0.1} unit="%" onChange={v=>set("zinsen",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Tilgung" value={p.tilgung} min={1} max={5} step={0.5} unit="%" onChange={v=>set("tilgung",v)}/></div>
        <div style={T.rowLast}><CheckRangeField C={C} T={T} label="Betrachtungszeitraum" value={p.jahre} min={5} max={40} step={1} unit="Jahre" onChange={v=>set("jahre",v)}/></div>
      </div>
    </div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Vergleich berechnen</button></div>
  </div>);
}