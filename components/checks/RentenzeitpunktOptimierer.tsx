'use client';

import { useMemo, useState } from "react";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
import CheckKitDanke from "./CheckKitDanke";
import CheckKitKontaktForm from "./CheckKitKontaktForm";
const fmt = (n: number) =>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK = (n: number) =>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":n>=10000?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function berechne(p: any) {
  const r67=p.renteVoll;
  const r65=Math.round(r67*(1-0.072));
  const r63=Math.round(r67*(1-0.144));
  const g67=Math.max(0,p.lebenserw-67)*12*r67;
  const g65=Math.max(0,p.lebenserw-65)*12*r65;
  const g63=Math.max(0,p.lebenserw-63)*12*r63;
  const be6367=r67-r63>0?Math.round((4*12*r63)/(r67-r63)/12):null;
  const be6567=r67-r65>0?Math.round((2*12*r65)/(r67-r65)/12):null;
  return{r67,r65,r63,g67:Math.round(g67),g65:Math.round(g65),g63:Math.round(g63),be6367,be6567};
}
export default function RentenzeitpunktOptimierer(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({renteVoll:1600,lebenserw:84});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Rentenzeitpunkt</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><CheckKitDanke makler={MAKLER} accent={C} name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>);
  const bestOption=[{age:63,total:R.g63},{age:65,total:R.g65},{age:67,total:R.g67}].sort((a,b)=>b.total-a.total)[0];
  if(phase===2)return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Rentenzeitpunkt-Vergleich</div><div style={T.h1}>Mit {bestOption.age} erhalten Sie am meisten</div><div style={T.body}>Bei Lebenserwartung {p.lebenserw} · Break-even 63/67: Alter {R.be6367?67+R.be6367:"n/a"}</div></div>
    <div style={T.section}>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {[{age:63,rente:R.r63,gesamt:R.g63,abschlag:"−14,4%"},{age:65,rente:R.r65,gesamt:R.g65,abschlag:"−7,2%"},{age:67,rente:R.r67,gesamt:R.g67,abschlag:"Kein Abschlag"}].map(({age,rente,gesamt,abschlag})=>(
          <div key={age} style={{border:`1px solid ${age===bestOption.age?C:"#e8e8e8"}`,borderRadius:"10px",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:"14px",fontWeight:age===bestOption.age?"700":"500",color:age===bestOption.age?C:"#111"}}>Mit {age} Jahren</div><div style={{fontSize:"12px",color:"#aaa",marginTop:"2px"}}>{abschlag} · {fmt(rente)}/Mon.</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:"18px",fontWeight:"700",color:age===bestOption.age?C:"#111"}}>{fmtK(gesamt)}</div><div style={{fontSize:"11px",color:"#aaa"}}>Lebensgesamtrente</div></div>
          </div>
        ))}
      </div>
      <div style={{...T.infoBox,marginTop:"12px"}}>Vereinfacht — ohne Steuer, KV-Beiträge im Rentenalter und Hinterbliebenenrente.</div>
    </div>
    <CheckKitKontaktForm T={T} fd={fd} setFd={setFd} onSubmit={()=>setDanke(true)} onBack={()=>goTo(1)}/>
  </div>);
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Rentenzeitpunkt-Optimierer</div><div style={T.h1}>Mit 63, 65 oder 67 in Rente?</div><div style={T.body}>Lebensgesamtrente im Vergleich — Break-even-Alter und monatliche Abschläge.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Rente bei Regelalter 67" value={p.renteVoll} min={500} max={4000} step={50} unit="€/Mon" hint="Aus Ihrem aktuellen Rentenbescheid" onChange={v=>set("renteVoll",v)}/></div>
      <div style={T.rowLast}><CheckRangeField C={C} T={T} label="Erwartetes Lebensalter" value={p.lebenserw} min={70} max={100} step={1} unit="Jahre" hint="Statistisch: Männer 79, Frauen 83 (Ø Deutschland 2024)" onChange={v=>set("lebenserw",v)}/></div>
    </div></div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Rentenzeitpunkte vergleichen</button></div>
  </div>);
}