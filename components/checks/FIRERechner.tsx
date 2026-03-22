'use client';

import { useMemo, useState } from "react";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
import CheckKitDanke from "./CheckKitDanke";
import CheckKitKontaktForm from "./CheckKitKontaktForm";
const fmt = (n: number) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n: number) =>
  n >= 1000000
    ? (n / 1000000).toFixed(2) + " Mio. €"
    : n >= 10000
      ? Math.round(n / 1000).toLocaleString("de-DE") + ".000 €"
      : fmt(n);
const OK = "#059669";
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function berechne(p: any) {
  const zielKapital=Math.round(p.ausgaben*12/0.04);
  const r=p.rendite/100;let depot=p.depot,jahre=0;
  while(depot<zielKapital&&jahre<50){depot=(depot+p.sparrate*12)*(1+r);jahre++;}
  return{zielKapital,fireJahre:jahre,entnahme:Math.round(zielKapital*0.04/12),depotNow:Math.round(p.depot)};
}
export default function FIRERechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({ausgaben:3000,depot:20000,sparrate:1000,rendite:7});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);
  const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>FIRE-Rechner</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><CheckKitDanke makler={MAKLER} accent={C} name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>);
  if(phase===2)return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>FIRE-Analyse</div><div style={T.h1}>{R.fireJahre<50?`Finanziell frei in ${R.fireJahre} Jahren`:"Mehr als 50 Jahre — Sparrate erhöhen"}</div><div style={T.body}>Zielkapital {fmtK(R.zielKapital)} · Entnahme {fmt(R.entnahme)}/Mon.</div></div>
    <div style={T.section}>
      <div style={T.card}>
        {[{l:"Gewünschte Monatsausgaben",v:fmt(p.ausgaben)+"/Mon."},{l:"Zielkapital (4%-Regel)",v:fmtK(R.zielKapital)},{l:"Monatliche Entnahme",v:fmt(R.entnahme)+"/Mon.",ok:true},{l:"Jahre bis FIRE",v:R.fireJahre<50?R.fireJahre+" Jahre":"> 50 Jahre"},{l:"Aktuelle Sparrate",v:fmt(p.sparrate)+"/Mon."}].map(({l,v,ok},i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
            <span style={{fontSize:"13px",color:"#666"}}>{l}</span><span style={{fontSize:"13px",fontWeight:"600",color:ok?OK:"#111"}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{...T.infoBox,marginTop:"12px"}}>4%-Regel (Trinity Study): historisch konnte ein Portfolio über 30 Jahre 4% p.a. entnommen werden. Keine Garantie.</div>
    </div>
    <CheckKitKontaktForm T={T} fd={fd} setFd={setFd} onSubmit={()=>setDanke(true)} onBack={()=>goTo(1)}/>
  </div>);
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>FIRE-Rechner</div><div style={T.h1}>Wann bin ich finanziell frei?</div><div style={T.body}>Zielkapital, Sparrate und Jahre bis zur finanziellen Unabhängigkeit (4%-Regel).</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Monatliche Wunschausgaben im FIRE" value={p.ausgaben} min={1000} max={8000} step={100} unit="€/Mon" display={`Zielkapital: ${fmtK(Math.round(p.ausgaben*12/0.04))}`} onChange={v=>set("ausgaben",v)}/></div>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Aktuelles Depot / Vermögen" value={p.depot} min={0} max={500000} step={5000} unit="€" onChange={v=>set("depot",v)}/></div>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Monatliche Sparrate" value={p.sparrate} min={100} max={5000} step={50} unit="€/Mon" onChange={v=>set("sparrate",v)}/></div>
      <div style={T.rowLast}><CheckRangeField C={C} T={T} label="Erwartete Rendite" value={p.rendite} min={4} max={9} step={0.5} unit="% p.a." onChange={v=>set("rendite",v)}/></div>
    </div></div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>FIRE-Datum berechnen</button></div>
  </div>);
}