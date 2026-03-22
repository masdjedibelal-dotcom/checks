'use client';

import { useMemo, useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
const fmt = (n: number) =>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK = (n: number) =>n>=100000?(n/1000).toFixed(0)+".000 €":fmt(n);

/** Referenz-Monatskosten (mittel) je Lebensphase; wird mit `standard`-Faktor skaliert. */
const PHASEN = [
  { l: "0–1 Jahre (Säugling)", kosten: 650 },
  { l: "2–5 Jahre (Vorschule)", kosten: 520 },
  { l: "6–12 Jahre (Grundschule)", kosten: 480 },
  { l: "13–17 Jahre (Jugend)", kosten: 620 },
  { l: "18–25 Jahre (Ausbildung/Studium)", kosten: 780 },
] as const;

function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
export default function KinderkostenRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({alter:0,standard:"mittel"});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const faktor={niedrig:0.75,mittel:1.0,hoch:1.4}[p.standard]||1;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Kinderkosten</span></div><div style={T.prog}><div style={T.progFil(phase/2*100)}/></div></>);
  const gesamtKosten=PHASEN.reduce((acc,ph,i)=>{
    const starts=[0,2,6,13,18];const ends=[1,5,12,17,25];
    if(ends[i]<p.alter)return acc;
    const jahreBis25=Math.max(0,Math.min(ends[i],25)-Math.max(starts[i],p.alter));
    return acc+ph.kosten*faktor*12*jahreBis25;
  },0);
  const monatlichJetzt=(PHASEN.find((_,i)=>{const starts=[0,2,6,13,18];const ends=[1,5,12,17,25];return starts[i]<=p.alter&&ends[i]>=p.alter;})?.kosten ?? 0)*faktor;
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
      <div style={T.hero}><div style={T.eyebrow}>Kinderkosten-Analyse</div><div style={T.h1}>Bis 25: {fmtK(Math.round(gesamtKosten))}</div><div style={T.body}>Aktuell ca. {fmt(Math.round(monatlichJetzt))}/Monat · Standard: {p.standard}</div></div>
      <div style={T.section}>
        <div style={T.card}>
          {PHASEN.map((ph,i)=>{
            const starts=[0,2,6,13,18];const ends=[1,5,12,17,25];
            if(ends[i]<p.alter)return null;
            const jahreBis25=Math.max(0,Math.min(ends[i],25)-Math.max(starts[i],p.alter));
            const kosten=Math.round(ph.kosten*faktor*12*jahreBis25);
            const aktiv=starts[i]<=p.alter&&ends[i]>=p.alter;
            return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<PHASEN.length-1?"1px solid #f5f5f5":"none",background:aktiv?`${C}06`:"#fff"}}>
              <div><div style={{fontSize:"13px",fontWeight:aktiv?"600":"400",color:aktiv?C:"#555"}}>{ph.l}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{fmt(Math.round(ph.kosten*faktor))}/Mon.</div></div>
              <span style={{fontSize:"13px",fontWeight:"600",color:aktiv?C:"#111"}}>{fmtK(kosten)}</span>
            </div>);
          })}
          <div style={{padding:"12px 16px",background:`${C}06`,borderTop:"1px solid #e8e8e8",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:"13px",fontWeight:"700",color:"#111"}}>Gesamt bis 25</span>
            <span style={{fontSize:"13px",fontWeight:"700",color:C}}>{fmtK(Math.round(gesamtKosten))}</span>
          </div>
        </div>
        <div style={{...T.infoBox,marginTop:"12px"}}>Statistisches Bundesamt: Ø Kinderkosten Deutschland 2024. Ohne Betreuungskosten unter 3 Jahren (Kita: 200–800 €/Mon. zusätzlich).</div>
      </div>
      {MAKLER.isDemoMode ? (
        <DemoCTA slug={MAKLER.slug} />
      ) : (
      <div style={{...T.section,marginBottom:"0"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Absicherung für Ihr Kind besprechen</div>
        <div style={T.card}>{([{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}] as const).map(({k,l,t,ph,req},i,arr)=>(<div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>))}</div>
        <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
      </div>
      )}
      {!MAKLER.isDemoMode && (
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Gespräch anfragen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      )}
    </div>);
  }
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Kinderkosten-Rechner</div><div style={T.h1}>Was kostet ein Kind bis 25?</div><div style={T.body}>Kosten nach Lebensphase — von der Geburt bis zum Studium.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><CheckRangeField C={C} T={T} label="Aktuelles Alter des Kindes" value={p.alter} min={0} max={24} step={1} unit="Jahre" onChange={v=>set("alter",v)}/></div>
      <div style={T.rowLast}><label style={T.fldLbl}>Lebensstandard</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginTop:"8px"}}>{[["niedrig","Einfach"],["mittel","Mittel"],["hoch","Gehoben"]].map(([v,l])=><button key={v} style={{padding:"9px 14px",borderRadius:"6px",border:`1px solid ${p.standard===v?C:"#e8e8e8"}`,background:p.standard===v?C:"#fff",fontSize:"13px",fontWeight:p.standard===v?"600":"400",color:p.standard===v?"#fff":"#444",cursor:"pointer"}} onClick={()=>set("standard",v)}>{l}</button>)}</div></div>
    </div></div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Kosten berechnen</button></div>
  </div>);
}
