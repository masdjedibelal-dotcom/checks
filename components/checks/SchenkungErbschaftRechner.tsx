'use client';

import { useMemo, useState } from "react";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
import CheckKitDanke from "./CheckKitDanke";
import CheckKitKontaktForm from "./CheckKitKontaktForm";
const WARN = "#c0392b";
const OK = "#059669";
const fmt = (n: number) =>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK = (n: number) =>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":n>=10000?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

const FB = { kind: 400000, enkel: 200000, partner: 500000, geschwister: 20000, sonstige: 20000 } as const;
type FbKey = keyof typeof FB;

function berechne(p: { vermoegen: number; anzahl: number; beziehung: string }) {
  const fbPerson = (p.beziehung in FB ? FB[p.beziehung as FbKey] : 20000);
  const fbGesamt=fbPerson*p.anzahl;
  const fb10J=fbGesamt*2;
  const steuerpflichtig=Math.max(0,p.vermoegen-fbGesamt);
  const satz=steuerpflichtig<=75000?0.07:steuerpflichtig<=300000?0.11:steuerpflichtig<=600000?0.15:steuerpflichtig<=6000000?0.19:0.23;
  const steuer=steuerpflichtig>0?Math.round(steuerpflichtig*satz):0;
  const ersparnisFb=Math.round(Math.min(p.vermoegen,fbGesamt)*satz);
  return{fbPerson,fbGesamt,fb10J,steuerpflichtig,satz:Math.round(satz*100),steuer,ersparnisFb};
}
export default function SchenkungErbschaftRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({vermoegen:500000,beziehung:"kind",anzahl:2});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Schenkung & Erbschaft</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><CheckKitDanke makler={MAKLER} accent={C} name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>);
  if(phase===2)return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Erbschaft-/Schenkungsteuer</div><div style={T.h1}>{R.steuer>0?`${fmt(R.steuer)} Steuer fällig`:"Vollständig steuerfrei übertragbar"}</div><div style={T.body}>Freibetrag {fmtK(R.fbGesamt)} · Steuerpflichtig {fmtK(R.steuerpflichtig)} · Satz {R.satz}%</div></div>
    <div style={T.section}>
      <div style={T.card}>
        {[
          {l:"Freibetrag je Person",v:fmtK(R.fbPerson),ok:true},
          {l:`Freibetrag gesamt (${p.anzahl} Personen)`,v:fmtK(R.fbGesamt),ok:true},
          {l:"Freibetrag in 20 Jahren nutzbar",v:fmtK(R.fb10J),ok:true,sub:"10-Jahres-Regelung: alle 10 Jahre neu nutzen"},
          {l:"Steuerpflichtiger Anteil",v:fmtK(R.steuerpflichtig),hl:R.steuerpflichtig>0},
          {l:"Steuersatz",v:R.satz+"%"},
          {l:"Erbschaft-/Schenkungsteuer",v:fmt(R.steuer),hl:R.steuer>0},
          {l:"Ersparnis durch Freibetrag",v:fmt(R.ersparnisFb),ok:true},
        ].map(({l,v,sub,hl,ok},i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
            <div><span style={{fontSize:"13px",color:"#666"}}>{l}</span>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div>
            <span style={{fontSize:"13px",fontWeight:"600",color:hl?WARN:ok?OK:"#111",flexShrink:0,marginLeft:"8px"}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{...T.infoBox,marginTop:"12px"}}>Steuerklasse I (Kinder, Enkel, Partner). Immobilien und Betriebsvermögen können abweichende Bewertungsregeln haben. Steuerberatung empfohlen.</div>
    </div>
    <CheckKitKontaktForm T={T} fd={fd} setFd={setFd} onSubmit={()=>setDanke(true)} onBack={()=>goTo(1)}/>
  </div>);
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Schenkung &amp; Erbschaft</div><div style={T.h1}>Wie viel lässt sich steuerfrei übertragen?</div><div style={T.body}>Freibeträge nach Verwandtschaftsgrad, Steuerbelastung und 10-Jahres-Regelung.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Zu übertragendes Vermögen" value={p.vermoegen} min={10000} max={5000000} step={10000} unit="€" onChange={v=>set("vermoegen",v)}/></div>
      <div style={T.row}><label style={T.fldLbl}>Beziehung zu Begünstigten</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}>{[["kind","Kinder"],["enkel","Enkel"],["partner","Partner/in"],["geschwister","Geschwister"],["sonstige","Sonstige"]].map(([v,l])=><button key={v} style={T.optBtn(p.beziehung===v)} onClick={()=>set("beziehung",v)}>{l}</button>)}</div></div>
      <div style={T.rowLast}><CheckRangeField C={C} T={T} label="Anzahl Begünstigte" value={p.anzahl} min={1} max={10} step={1} unit="Personen" hint="Freibetrag gilt je Begünstigtem und je Schenkendem" onChange={v=>set("anzahl",v)}/></div>
    </div></div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Freibeträge berechnen</button></div>
  </div>);
}