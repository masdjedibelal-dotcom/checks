'use client';

import { useMemo, useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
const OK = "#059669";
const fmt = (n: number) =>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";

// Vereinfachter Grenzsteuersatz (2025)
function grenzsteuer(brutto: number) {
  if(brutto<=11784)return 0;
  if(brutto<=17005)return 0.14;
  if(brutto<=66760)return 0.14+((brutto-17005)/(66760-17005))*(0.42-0.14);
  if(brutto<=277825)return 0.42;
  return 0.45;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function berechne(p: any) {
  const{brutto,ruerupBeitrag,buPraemie,bavBeitrag,verheiratet}=p;
  const gst=grenzsteuer(brutto*(verheiratet?0.5:1))*(verheiratet?0.5:1); // vereinfacht
  const soli=gst>0.025?0.055:0;
  const gesamtSatz=gst+soli*gst;

  // Rürup: max 27.566 € p.a. (2025), abzugsfähig 100%
  const ruerupAbzug=Math.min(ruerupBeitrag*12,27566);
  const ruerupErsparnis=Math.round(ruerupAbzug*gesamtSatz);

  // BU-Prämie: Sonderausgaben, wenn in Rürup oder als Zusatzbaustein
  // Vereinfacht: 50% der BU-Prämie steuerlich absetzbar
  const buAbzug=buPraemie*12*0.5;
  const buErsparnis=Math.round(buAbzug*gesamtSatz);

  // bAV: Entgeltumwandlung steuerfrei bis 8% der BBG (7.728 € p.a. 2025)
  const bavMax=7728/12;
  const bavSteuerfreiMonatl=Math.min(bavBeitrag,bavMax);
  const bavErsparnis=Math.round(bavSteuerfreiMonatl*12*gesamtSatz);

  const gesamtErsparnis=ruerupErsparnis+buErsparnis+bavErsparnis;
  const nettoKosten=ruerupBeitrag*12+buPraemie*12+bavBeitrag*12-gesamtErsparnis;

  return{gst:Math.round(gesamtSatz*100),ruerupAbzug,ruerupErsparnis,buAbzug,buErsparnis,bavSteuerfreiMonatl,bavErsparnis,gesamtErsparnis,nettoKosten};
}


function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
export default function SteuerlastOptimierer(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({brutto:72000,beruf:"angestellt",ruerupBeitrag:0,buPraemie:80,bavBeitrag:0,verheiratet:false});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Steuer-Optimierer</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    const ROWS=[
      {l:"Grenzsteuersatz",v:`ca. ${R.gst}%`,sub:"Inkl. Solidaritätszuschlag — vereinfachte Schätzung"},
      {l:"Rürup-Beitrag p.a.",v:fmt(p.ruerupBeitrag*12),sub:`Abzugsfähig: ${fmt(R.ruerupAbzug)} (max. 27.566 €)`,show:p.ruerupBeitrag>0},
      {l:"Steuerersparnis Rürup",v:fmt(R.ruerupErsparnis)+"/Jahr",ok:true,show:p.ruerupBeitrag>0},
      {l:"BU-Prämie p.a.",v:fmt(p.buPraemie*12),sub:"Ca. 50% als Sonderausgabe absetzbar",show:p.buPraemie>0},
      {l:"Steuerersparnis BU",v:fmt(R.buErsparnis)+"/Jahr",ok:true,show:p.buPraemie>0},
      {l:"bAV-Beitrag p.a.",v:fmt(p.bavBeitrag*12),sub:`Steuerfrei bis ${fmt(R.bavSteuerfreiMonatl)}/Mon. (8% BBG)`,show:p.bavBeitrag>0},
      {l:"Steuerersparnis bAV",v:fmt(R.bavErsparnis)+"/Jahr",ok:true,show:p.bavBeitrag>0},
    ].filter(r=>r.show!==false);
    return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
      <div style={T.hero}><div style={T.eyebrow}>Ihre Steuerersparnis</div><div style={T.h1}>{fmt(R.gesamtErsparnis)} Ersparnis pro Jahr</div><div style={T.body}>Durch Rürup, BU und bAV — reale Nettokosten {fmt(R.nettoKosten)}/Jahr</div></div>
      <div style={T.section}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
          <div style={{border:`1px solid ${C}`,borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Steuerersparnis</div><div style={{fontSize:"24px",fontWeight:"700",color:C,letterSpacing:"-0.8px"}}>{fmt(R.gesamtErsparnis)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>pro Jahr</div></div>
          <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Nettokosten</div><div style={{fontSize:"24px",fontWeight:"700",color:"#111",letterSpacing:"-0.8px"}}>{fmt(R.nettoKosten)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>pro Jahr effektiv</div></div>
        </div>
        <div style={T.card}>
          {ROWS.map(({l,v,sub,ok},i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <div><div style={{fontSize:"13px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div>
              <span style={{fontSize:"13px",fontWeight:"600",color:ok?OK:"#111",flexShrink:0,marginLeft:"12px"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 14px",background:"#fffbf0",border:"1px solid #fde68a",borderRadius:"8px",marginTop:"12px",fontSize:"12px",color:"#92400e"}}>Richtwerte — steuerliche Beratung durch einen Steuerberater empfohlen.</div>
      </div>
      {MAKLER.isDemoMode ? (
        <DemoCTA slug={MAKLER.slug} />
      ) : (
      <div style={{...T.section,marginBottom:"0"}}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Steueroptimierung besprechen</div>
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
    <div style={T.hero}><div style={T.eyebrow}>Steuer-Optimierer</div><div style={T.h1}>Was spare ich durch Rürup, BU und bAV?</div><div style={T.body}>Konkreter Steuerbonus durch geförderte Vorsorge — auf Basis Ihres Einkommens und Grenzsteuersatzes.</div></div>
    <div style={T.section}>
      <div style={T.card}>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Jahresbruttoeinkommen" value={p.brutto} min={20000} max={300000} step={1000} unit="€/Jahr" display={`Grenzsteuersatz ca. ${R.gst}%`} onChange={v=>set("brutto",v)}/></div>
        <div style={T.row}><label style={T.fldLbl}>Steuerklasse / Familienstand</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}><button style={T.optBtn(!p.verheiratet)} onClick={()=>set("verheiratet",false)}>Ledig / Klasse I</button><button style={T.optBtn(p.verheiratet)} onClick={()=>set("verheiratet",true)}>Verheiratet / III+V</button></div></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Rürup-Beitrag" value={p.ruerupBeitrag} min={0} max={2300} step={50} unit="€/Mon" hint="Für Selbstständige besonders attraktiv — bis 27.566 € p.a. absetzbar" onChange={v=>set("ruerupBeitrag",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="BU-Monatsprämie" value={p.buPraemie} min={0} max={400} step={10} unit="€/Mon" hint="Ca. 50% der Prämie als Sonderausgabe absetzbar" onChange={v=>set("buPraemie",v)}/></div>
        <div style={T.rowLast}><CheckRangeField C={C} T={T} label="bAV-Beitrag" value={p.bavBeitrag} min={0} max={644} step={10} unit="€/Mon" hint="Bis 644 €/Mon. (8% BBG 2025) steuerfrei" onChange={v=>set("bavBeitrag",v)}/></div>
      </div>
    </div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Steuerersparnis berechnen</button></div>
  </div>);
}
