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
  const r=p.rendite/100;let depot=0;
  for(let j=0;j<p.jahre;j++)depot=(depot+p.rate*12)*(1+r);
  const eingezahlt=p.rate*12*p.jahre;
  const zinseszins=Math.max(0,depot-eingezahlt);
  const steuer=Math.round(Math.max(0,zinseszins-1000)*0.26375);
  const nettoDepot=Math.round(depot-steuer);
  return{depot:Math.round(depot),eingezahlt,zinseszins:Math.round(zinseszins),steuer,nettoDepot};
}
export default function ETFSparplanRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({rate:200,jahre:25,rendite:7});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>ETF-Sparplan</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><CheckKitDanke makler={MAKLER} accent={C} name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>);
  if(phase===2){return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>ETF-Sparplan Ergebnis</div><div style={T.h1}>{fmtK(R.nettoDepot)} netto nach {p.jahre} Jahren</div><div style={T.body}>Eingezahlt {fmtK(R.eingezahlt)} · Zinseszins {fmtK(R.zinseszins)} · Steuer {fmt(R.steuer)}</div></div>
    <div style={T.section}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
        <div style={{border:`1px solid ${C}`,borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Netto-Endvermögen</div><div style={{fontSize:"24px",fontWeight:"700",color:C,letterSpacing:"-0.8px"}}>{fmtK(R.nettoDepot)}</div></div>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Zinseszins</div><div style={{fontSize:"24px",fontWeight:"700",color:OK,letterSpacing:"-0.8px"}}>{fmtK(R.zinseszins)}</div></div>
      </div>
      <div style={T.card}>
        {[{l:"Monatliche Sparrate",v:fmt(p.rate)+"/Mon."},{l:"Eingezahlt gesamt",v:fmtK(R.eingezahlt)},{l:"Brutto-Endvermögen",v:fmtK(R.depot)},{l:"Abgeltungsteuer (26,375%)",v:fmt(R.steuer)},{l:"Netto-Endvermögen",v:fmtK(R.nettoDepot),ok:true}].map(({l,v,ok},i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
            <span style={{fontSize:"13px",color:"#666"}}>{l}</span><span style={{fontSize:"13px",fontWeight:"600",color:ok?OK:"#111"}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{...T.infoBox,marginTop:"12px"}}>Vereinfacht — ohne Vorabpauschale und Inflation. Sparerpauschbetrag 1.000 €/Jahr angerechnet.</div>
    </div>
    <CheckKitKontaktForm T={T} fd={fd} setFd={setFd} onSubmit={()=>setDanke(true)} onBack={()=>goTo(1)}/>
  </div>);}
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>ETF-Sparplan-Rechner</div><div style={T.h1}>Was wird aus Ihrem Sparplan?</div><div style={T.body}>Endvermögen, Zinseszins und Abgeltungsteuer auf einen Blick.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Monatliche Sparrate" value={p.rate} min={25} max={2000} step={25} unit="€/Mon" onChange={v=>set("rate",v)}/></div>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Laufzeit" value={p.jahre} min={5} max={40} step={1} unit="Jahre" onChange={v=>set("jahre",v)}/></div>
      <div style={T.rowLast}><CheckRangeField C={C} T={T} label="Erwartete Rendite" value={p.rendite} min={3} max={10} step={0.5} unit="% p.a." hint="Weltaktienindex historisch Ø 7–8% nominal" onChange={v=>set("rendite",v)}/></div>
    </div></div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Endvermögen berechnen</button></div>
  </div>);
}