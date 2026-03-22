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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function berechne(p: any) {
  const leistStationaer=[0,770,1262,1775,2005,2005][p.pflegegrad]||0;
  const heimkosten=[0,2800,3200,3600,4000,4400][p.pflegegrad]||3600;
  const eigenStationaer=Math.max(0,heimkosten-leistStationaer);
  const leistAmbulant=[0,347,689,1298,1612,1995][p.pflegegrad]||0;
  const eigenAmbulant=Math.max(0,Math.round(heimkosten*0.5)-leistAmbulant);
  const dauer=[0,7,6,5,4,3][p.pflegegrad]||5;
  const gesamtEigen=eigenStationaer*12*dauer;
  return{leistStationaer,heimkosten,eigenStationaer,leistAmbulant,eigenAmbulant,dauer,gesamtEigen};
}
export default function PflegekostenplanungRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({pflegegrad:3,art:"stationaer"});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Pflegekosten</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><CheckKitDanke makler={MAKLER} accent={C} name={fd.name} onBack={()=>{setDanke(false);setPhase(1);}}/></div>);
  const eigen=p.art==="stationaer"?R.eigenStationaer:R.eigenAmbulant;
  if(phase===2)return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Pflegekosten Pflegegrad {p.pflegegrad}</div><div style={T.h1}>{fmt(eigen)}/Monat Eigenanteil</div><div style={T.body}>Gesamtkosten Eigenanteil über Ø {R.dauer} Jahre: {fmtK(R.gesamtEigen)}</div></div>
    <div style={T.section}>
      <div style={T.card}>
        {[
          {l:"Pflegekassenleistung",v:fmt(p.art==="stationaer"?R.leistStationaer:R.leistAmbulant)+"/Mon.",ok:true},
          {l:p.art==="stationaer"?"Heimkosten gesamt":"Ambulante Pflegekosten",v:fmt(p.art==="stationaer"?R.heimkosten:Math.round(R.heimkosten*0.5))+"/Mon."},
          {l:"Eigenanteil monatlich",v:fmt(eigen)+"/Mon.",hl:true},
          {l:`Eigenanteil gesamt (Ø ${R.dauer} Jahre)`,v:fmtK(R.gesamtEigen),hl:true},
        ].map(({l,v,hl,ok},i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
            <span style={{fontSize:"13px",color:"#666"}}>{l}</span><span style={{fontSize:"13px",fontWeight:"600",color:hl?WARN:ok?OK:"#111"}}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{...T.infoBox,marginTop:"12px",borderLeft:`3px solid ${WARN}`,borderRadius:"0 8px 8px 0",background:"#fff9f9"}}><span style={{fontWeight:"600",color:WARN}}>Private Pflegezusatz empfohlen —</span> gesetzliche Leistungen decken nur ca. 50% der tatsächlichen Kosten.</div>
    </div>
    <CheckKitKontaktForm T={T} fd={fd} setFd={setFd} onSubmit={()=>setDanke(true)} onBack={()=>goTo(1)}/>
  </div>);
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Pflegekostenplanung</div><div style={T.h1}>Was kostet Pflege wirklich?</div><div style={T.body}>Eigenanteile nach Pflegegrad — stationär und ambulant im Vergleich.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Pflegegrad" value={p.pflegegrad} min={1} max={5} step={1} unit="" display={["","Geringe Beeinträchtigung","Erhebliche Beeinträchtigung","Schwere Beeinträchtigung","Schwerste Beeinträchtigung","Schwerste Beeinträchtigung mit besonderen Anforderungen"][p.pflegegrad]} onChange={v=>set("pflegegrad",v)}/></div>
      <div style={T.rowLast}><label style={T.fldLbl}>Pflegeart</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}><button style={T.optBtn(p.art==="stationaer")} onClick={()=>set("art","stationaer")}>Stationär (Heim)</button><button style={T.optBtn(p.art==="ambulant")} onClick={()=>set("art","ambulant")}>Ambulant (Zuhause)</button></div></div>
    </div></div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Eigenanteil berechnen</button></div>
  </div>);
}