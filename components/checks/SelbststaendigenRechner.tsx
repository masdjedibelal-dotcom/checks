'use client';

import { useMemo, useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
const WARN = "#c0392b";
const fmt = (n: number) =>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function berechne(p: any) {
  const{netto,alter,kv,bu,rente,ruecklage}=p;
  // PKV Schätzung
  const pkvMonatl=alter<35?420:alter<45?580:alter<55?780:980;
  const gkvMonatl=Math.min(netto*0.148*0.5+netto*0.017,850); // ca. Mindestbemessungsgrundlage
  const kvKosten=kv==="pkv"?pkvMonatl:gkvMonatl;
  // BU
  const buEmpfohlen=Math.round(netto*0.75/50)*50;
  const buKosten=bu>0?Math.round(bu*0.003):0; // Richtwert ~0.3% der BU-Rente als Prämie
  // Rente: Rürup 4% vom Bruttoeinkommen empfohlen
  const renteEmpfohlen=Math.round(netto*1.35*0.04); // netto → brutto geschätzt
  const renteKosten=rente;
  // Rücklage: 3 Monatsumsätze
  const ruecklageEmpfohlen=netto*3;
  const pflichtkosten=kvKosten+buKosten+renteKosten+ruecklage;
  const freiNetto=Math.max(0,netto-pflichtkosten);
  const absicherungsquote=Math.round((pflichtkosten/netto)*100);
  return{pkvMonatl,gkvMonatl,kvKosten,buEmpfohlen,buKosten,renteEmpfohlen,renteKosten,ruecklageEmpfohlen,pflichtkosten,freiNetto,absicherungsquote};
}


function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
export default function SelbststaendigenRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({netto:4500,alter:36,kv:"pkv",bu:2000,rente:300,ruecklage:500});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Selbstständigen-Check</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    const POSTEN=[
      {l:`Krankenversicherung (${p.kv.toUpperCase()})`,v:fmt(R.kvKosten)+"/Mon.",sub:p.kv==="pkv"?`Schätzung Alter ${p.alter} — inkl. Krankentagegeld`:"Freiwillige GKV — Mindestbemessungsgrundlage"},
      {l:"Berufsunfähigkeit",v:p.bu>0?fmt(R.buKosten)+"/Mon.":"Nicht vorhanden",hl:p.bu===0,sub:p.bu===0?`Empfehlung: ${fmt(R.buEmpfohlen)}/Mon. BU-Rente`:`${fmt(p.bu)}/Mon. BU-Rente`},
      {l:"Altersvorsorge (Rürup)",v:fmt(p.rente)+"/Mon.",sub:p.rente<R.renteEmpfohlen?`Empfohlen: mind. ${fmt(R.renteEmpfohlen)}/Mon.`:"Ausreichend",hl:p.rente<R.renteEmpfohlen},
      {l:"Liquiditätsrücklage",v:fmt(p.ruecklage)+"/Mon.",sub:`Ziel: ${fmt(R.ruecklageEmpfohlen)} (3 Monatsumsätze)`,hl:p.ruecklage===0},
    ];
    return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
      <div style={T.hero}><div style={T.eyebrow}>Ihre Gesamtkosten-Übersicht</div><div style={T.h1}>{fmt(R.pflichtkosten)}/Monat Absicherung</div><div style={T.body}>Von {fmt(p.netto)} Netto — {R.absicherungsquote}% für Absicherung · {fmt(R.freiNetto)} frei verfügbar</div></div>
      <div style={T.section}>
        <div style={{height:"6px",background:"#f0f0f0",borderRadius:"3px",overflow:"hidden",marginBottom:"16px"}}>
          <div style={{width:`${Math.min(100,R.absicherungsquote)}%`,height:"100%",background:R.absicherungsquote>60?WARN:C,borderRadius:"3px",transition:"width 0.6s"}}/>
        </div>
        <div style={T.card}>
          {POSTEN.map(({l,v,sub,hl},i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <div><div style={{fontSize:"13px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:hl?WARN:"#aaa",marginTop:"1px"}}>{sub}</div>}</div>
              <span style={{fontSize:"13px",fontWeight:"600",color:hl?WARN:"#111",flexShrink:0,marginLeft:"12px"}}>{v}</span>
            </div>
          ))}
          <div style={{padding:"12px 16px",background:`${C}06`,borderTop:"1px solid #e8e8e8",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:"13px",fontWeight:"700",color:"#111"}}>Gesamt Absicherung</span>
            <span style={{fontSize:"13px",fontWeight:"700",color:C}}>{fmt(R.pflichtkosten)}/Mon.</span>
          </div>
        </div>
      </div>
      <div style={{...T.section}}>
        <div style={{...T.infoBox,marginBottom:"16px"}}>Als Selbstständiger zahlen Sie PKV, BU, Rürup und Rücklage komplett selbst — das entspricht beim Angestellten ca. 40% mehr Brutto für denselben Netto-Lebensstandard.</div>
      </div>
      {MAKLER.isDemoMode ? (
        <DemoCTA slug={MAKLER.slug} />
      ) : (
      <div style={{...T.section,marginBottom:"0"}}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Gesamtpaket besprechen</div>
        <div style={T.card}>{([{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}] as const).map(({k,l,t,ph,req},i,arr)=>(<div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>))}</div>
        <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
      </div>
      )}
      {!MAKLER.isDemoMode && (
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Gesamtpaket besprechen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      )}
    </div>);
  }
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Selbstständigen-Rechner</div><div style={T.h1}>Was kostet Ihre Absicherung wirklich?</div><div style={T.body}>PKV + BU + Rürup + Rücklage — die 4 Pflichtposten für Selbstständige auf einen Blick.</div></div>
    <div style={T.section}>
      <div style={T.card}>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Monatliches Nettoeinkommen" value={p.netto} min={1500} max={15000} step={100} unit="€/Mon" onChange={v=>set("netto",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Alter" value={p.alter} min={18} max={60} step={1} unit="Jahre" onChange={v=>set("alter",v)}/></div>
        <div style={T.row}><label style={T.fldLbl}>Krankenversicherung</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}><button style={T.optBtn(p.kv==="pkv")} onClick={()=>set("kv","pkv")}>PKV</button><button style={T.optBtn(p.kv==="gkv")} onClick={()=>set("kv","gkv")}>GKV freiwillig</button></div></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="BU-Rente (vorhanden)" value={p.bu} min={0} max={5000} step={100} unit="€/Mon" hint="0 = keine BU-Versicherung" onChange={v=>set("bu",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Rürup / Altersvorsorge" value={p.rente} min={0} max={2000} step={50} unit="€/Mon" onChange={v=>set("rente",v)}/></div>
        <div style={T.rowLast}><CheckRangeField C={C} T={T} label="Monatliche Rücklage" value={p.ruecklage} min={0} max={3000} step={50} unit="€/Mon" hint="Liquiditätspuffer für Flauten und Steuernachzahlungen" onChange={v=>set("ruecklage",v)}/></div>
      </div>
    </div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Gesamtkosten berechnen</button></div>
  </div>);
}
