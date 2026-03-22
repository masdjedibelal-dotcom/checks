'use client';

import { useMemo, useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
import CheckRangeField from "./CheckRangeField";
const WARN = "#c0392b";
const OK = "#059669";
const fmtK = (n: number) =>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":Math.round(n).toLocaleString("de-DE")+" €";

// Baupreisindex 2025: Basis 1914er-Wert ca. 1.800–2.200 €/m² je Bauart
const BAUART_FAKTOR={massiv:1.0,fertig:0.85,holz:0.9,denkmal:1.4};
type BauartKey = keyof typeof BAUART_FAKTOR;
const BAUJAHR_ZUSCHLAG=(j:number)=>j<1950?1.3:j<1970?1.15:j<1990?1.05:1.0;

type WohngebaeudeParam = {
  flaeche: number;
  baujahr: number;
  bauart: string;
  versSum: number;
  photovoltaik: boolean;
};

function berechne(p: WohngebaeudeParam) {
  const{flaeche,baujahr,bauart,versSum,photovoltaik}=p;
  const basisPreis=1950; // €/m² Neubaupreis 2025 (GDV-Wert 1914 × Baupreisindex)
  const faktor=(bauart in BAUART_FAKTOR ? BAUART_FAKTOR[bauart as BauartKey] : 1) || 1;
  const altersZuschlag=BAUJAHR_ZUSCHLAG(baujahr);
  const neuwert=Math.round(flaeche*basisPreis*faktor*altersZuschlag);
  const pv_aufschlag=photovoltaik?Math.round(flaeche*120):0;
  const empfohleneVS=neuwert+pv_aufschlag;
  const unterversichert=versSum>0&&versSum<empfohleneVS*0.9;
  const deckungsluecke=Math.max(0,empfohleneVS-versSum);
  const deckung=versSum>0?Math.min(100,Math.round((versSum/empfohleneVS)*100)):0;
  return{neuwert,empfohleneVS,unterversichert,deckungsluecke,deckung,pv_aufschlag};
}


function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
export default function WohngebaeudeRechner(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({flaeche:140,baujahr:1985,bauart:"massiv",versSum:320000,elementar:false,photovoltaik:false});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;
  const Header=()=>(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Wohngebäude</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>);
  if(danke)return(<div style={checkPageAccent(T,C)}><Header/><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
      <div style={T.hero}><div style={T.eyebrow}>Unterversicherungs-Check</div><div style={T.h1}>{R.unterversichert?`${fmtK(R.deckungsluecke)} Unterversicherung`:R.deckung===0?"Noch keine Versicherungssumme":"Ausreichend versichert"}</div><div style={T.body}>Geschätzter Neuwert {fmtK(R.empfohleneVS)} · Deckungsgrad {R.deckung}%</div></div>
      <div style={T.section}>
        <div style={T.card}>
          {[
            {l:"Wohnfläche",v:`${p.flaeche} m²`},
            {l:"Baupreisindex 2025",v:"ca. 1.950 €/m²",sub:"GDV-Richtwert — regional abweichend"},
            {l:"Alters-/Baukostenzuschlag",v:BAUJAHR_ZUSCHLAG(p.baujahr)===1?"-":`+${Math.round((BAUJAHR_ZUSCHLAG(p.baujahr)-1)*100)}%`,sub:p.baujahr<1970?"Ältere Bausubstanz: höhere Wiederherstellungskosten":""},
            {l:"Geschätzter Neuwert",v:fmtK(R.neuwert),hl:false},
            ...(p.photovoltaik?[{l:"PV-Anlage Aufschlag",v:fmtK(R.pv_aufschlag),sub:"Richtwert ~120 €/m² Wohnfläche"}]:[]),
            {l:"Empfohlene Versicherungssumme",v:fmtK(R.empfohleneVS)},
            {l:"Aktuelle Versicherungssumme",v:p.versSum>0?fmtK(p.versSum):"Keine",ok:!R.unterversichert&&p.versSum>0},
            {l:"Unterversicherungslücke",v:R.deckungsluecke>0?fmtK(R.deckungsluecke):"Keine",hl:R.unterversichert},
          ].map(({l,v,sub,hl,ok},i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <div><div style={{fontSize:"13px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div>
              <span style={{fontSize:"13px",fontWeight:"600",color:hl?WARN:ok?OK:"#111",flexShrink:0,marginLeft:"12px"}}>{v}</span>
            </div>
          ))}
        </div>
        {!p.elementar&&<div style={{...T.infoBox,marginTop:"12px",borderLeft:`3px solid ${WARN}`,borderRadius:"0 8px 8px 0",background:"#fff9f9"}}><span style={{fontWeight:"600",color:WARN}}>Elementarschutz fehlt —</span> Überschwemmung, Rückstau und Erdrutsch sind in der Standard-Wohngebäudeversicherung nicht enthalten.</div>}
      </div>
      {MAKLER.isDemoMode ? (
        <DemoCTA slug={MAKLER.slug} />
      ) : (
      <div style={{...T.section,marginBottom:"0"}}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Versicherung anpassen lassen</div>
        <div style={T.card}>{([{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}] as const).map(({k,l,t,ph,req},i,arr)=>(<div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>))}</div>
        <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
      </div>
      )}
      {!MAKLER.isDemoMode && (
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Versicherung prüfen lassen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      )}
    </div>);
  }
  return(<div style={checkPageAccent(T,C)} key={ak} className="fade-in"><Header/>
    <div style={T.hero}><div style={T.eyebrow}>Wohngebäude-Rechner</div><div style={T.h1}>Bin ich unterversichert?</div><div style={T.body}>Geschätzter Neuwert Ihres Hauses nach Baupreisindex 2025 — mit Unterversicherungs-Check.</div></div>
    <div style={T.section}>
      <div style={T.card}>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Wohnfläche" value={p.flaeche} min={40} max={500} step={5} unit="m²" onChange={v=>set("flaeche",v)}/></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Baujahr" value={p.baujahr} min={1900} max={2024} step={1} unit="" display={p.baujahr<1950?"Altbau — höhere Wiederherstellungskosten":p.baujahr<1990?"Bestandsbau":"Neuerer Bau"} onChange={v=>set("baujahr",v)}/></div>
        <div style={T.row}><label style={T.fldLbl}>Bauart</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}>{[["massiv","Massivbau"],["fertig","Fertighaus"],["holz","Holzbau"],["denkmal","Denkmal"]].map(([v,l])=><button key={v} style={T.optBtn(p.bauart===v)} onClick={()=>set("bauart",v)}>{l}</button>)}</div></div>
        <div style={T.row}><CheckRangeField C={C} T={T} label="Aktuelle Versicherungssumme" value={p.versSum} min={0} max={2000000} step={10000} unit="€" hint="Aus Ihrem laufenden Wohngebäudevertrag" onChange={v=>set("versSum",v)}/></div>
        <div style={T.row}><label style={T.fldLbl}>Elementarschutz vorhanden?</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}><button style={T.optBtn(p.elementar)} onClick={()=>set("elementar",true)}>Ja</button><button style={T.optBtn(!p.elementar)} onClick={()=>set("elementar",false)}>Nein / Unklar</button></div></div>
        <div style={T.rowLast}><label style={T.fldLbl}>Photovoltaik-Anlage vorhanden?</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}><button style={T.optBtn(p.photovoltaik)} onClick={()=>set("photovoltaik",true)}>Ja</button><button style={T.optBtn(!p.photovoltaik)} onClick={()=>set("photovoltaik",false)}>Nein</button></div></div>
      </div>
    </div>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Neuwert berechnen</button></div>
  </div>);
}
