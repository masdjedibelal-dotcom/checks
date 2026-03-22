'use client';

import { useMemo, useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT, checkPageAccent } from "./checkStandardT";
const WARN = "#c0392b";

function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

const MASSNAHMEN=[
  {id:"kranken",l:"Krankenversicherung",sub:"Kind anmelden — GKV kostenlos oder PKV prüfen",dringend:true,wann:"Sofort nach Geburt",berechtigungen:["gkv","pkv_kind"]},
  {id:"haftpflicht",l:"Privathaftpflicht",sub:"Kind in bestehenden Vertrag aufnehmen",dringend:true,wann:"Innerhalb 1 Monat",berechtigungen:["alle"]},
  {id:"risikoleben",l:"Risikolebensversicherung",sub:"Versicherungssumme erhöhen — Kind erhöht Absicherungsbedarf",dringend:true,wann:"Innerhalb 3 Monate",berechtigungen:["alle"]},
  {id:"bu",l:"Berufsunfähigkeit",sub:"BU-Rente auf neue Familiensituation anpassen",dringend:true,wann:"Innerhalb 3 Monate",berechtigungen:["alle"]},
  {id:"riester",l:"Riester-Kinderzulage",sub:"300 € (ab 2008) oder 185 € Kinderzulage beantragen — läuft nicht automatisch!",dringend:true,wann:"Sofort",berechtigungen:["riester"]},
  {id:"unfall",l:"Unfallversicherung Kind",sub:"Kinder sind nicht über gesetzliche UV versichert — private UV empfohlen",dringend:false,wann:"Innerhalb 6 Monate",berechtigungen:["alle"]},
  {id:"hausrat",l:"Hausrat",sub:"Wohnfläche prüfen — größere Wohnung ggf. melden",dringend:false,wann:"Bei Umzug",berechtigungen:["hausrat"]},
  {id:"bav",l:"bAV Elternzeit",sub:"bAV läuft in Elternzeit weiter — Beitrag prüfen",dringend:false,wann:"Vor Elternzeit",berechtigungen:["bav"]},
  {id:"riester_partner",l:"Partner-Riester",sub:"Partner kann eigene Grundzulage + Kinderzulage erhalten",dringend:false,wann:"Innerhalb 1 Jahr",berechtigungen:["verheiratet"]},
  {id:"kindergeld",l:"Kindergeld beantragen",sub:"164 € monatlich — Antrag bei Familienkasse",dringend:true,wann:"Sofort",berechtigungen:["alle"]},
  {id:"testament",l:"Testament / Vorsorgevollmacht",sub:"Wer kümmert sich um das Kind wenn beide Eltern ausfallen?",dringend:false,wann:"Innerhalb 1 Jahr",berechtigungen:["alle"]},
];

export default function NachwuchsCheck(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);

  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({kranken:"gkv",verheiratet:true,riester:false,bav:false,hausrat:true,elternzeit:true});
  const set=(k:string,v:unknown)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph:number)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const TOTAL=2;

  const Header=({phase}:{phase:number})=>(
    <><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Nachwuchs-Check</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>
  );

  const relevanteMassnahmen=MASSNAHMEN.filter(m=>{
    if(m.berechtigungen.includes("alle"))return true;
    if(m.berechtigungen.includes("gkv")&&p.kranken==="gkv")return true;
    if(m.berechtigungen.includes("pkv_kind")&&p.kranken==="pkv")return true;
    if(m.berechtigungen.includes("verheiratet")&&p.verheiratet)return true;
    if(m.berechtigungen.includes("riester")&&p.riester)return true;
    if(m.berechtigungen.includes("bav")&&p.bav)return true;
    if(m.berechtigungen.includes("hausrat")&&p.hausrat)return true;
    return false;
  });
  const dringend=relevanteMassnahmen.filter(m=>m.dringend);
  const empfohlen=relevanteMassnahmen.filter(m=>!m.dringend);

  if(danke)return(
    <div style={checkPageAccent(T,C)}><Header phase={TOTAL}/>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir bereiten das Gespräch vor und melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );

  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    type MassnahmeItem = { l: string; sub: string; wann: string };
    const MassnahmeCard=({items,farbe,label}:{items:MassnahmeItem[];farbe:string;label:string})=>(
      <div style={T.section}>
        <div style={{fontSize:"11px",fontWeight:"600",color:farbe,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>{label}</div>
        <div style={T.card}>
          {items.map(({l,sub,wann},i,arr)=>(
            <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",borderLeft:`3px solid ${farbe}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
                <div><div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"2px"}}>{l}</div><div style={{fontSize:"12px",color:"#777",lineHeight:1.5}}>{sub}</div></div>
                <span style={{fontSize:"11px",fontWeight:"500",padding:"2px 8px",borderRadius:"20px",background:`${farbe}12`,color:farbe,flexShrink:0,marginTop:"1px"}}>{wann}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    return(
      <div style={checkPageAccent(T,C)} key={ak} className="fade-in">
        <Header phase={2}/>
        <div style={T.hero}><div style={T.eyebrow}>Ihre Nachwuchs-Checkliste</div><div style={T.h1}>{dringend.length} sofortige + {empfohlen.length} empfohlene Maßnahmen</div><div style={T.body}>Personalisiert auf Ihre Situation — priorisiert nach Dringlichkeit.</div></div>
        {dringend.length>0&&<MassnahmeCard items={dringend} farbe={WARN} label="Sofort erledigen"/>}
        {empfohlen.length>0&&<MassnahmeCard items={empfohlen} farbe={C} label="Innerhalb 12 Monate"/>}
        {MAKLER.isDemoMode ? (
          <DemoCTA slug={MAKLER.slug} />
        ) : (
        <div style={{...T.section,marginBottom:"0"}}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Gespräch vereinbaren</div>
          <div style={T.card}>
            {([{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}] as const).map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl}}/></div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
        </div>
        )}
        {!MAKLER.isDemoMode && (
        <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Gespräch anfragen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
        )}
      </div>
    );
  }

  return(
    <div style={checkPageAccent(T,C)} key={ak} className="fade-in">
      <Header phase={1}/>
      <div style={T.hero}><div style={T.eyebrow}>Nachwuchs-Check</div><div style={T.h1}>Baby bekommen — was ändert sich?</div><div style={T.body}>Alle Versicherungsanpassungen nach der Geburt — priorisiert und mit Fristen.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><label style={T.fldLbl}>Krankenversicherung</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}><button style={T.optBtn(p.kranken==="gkv")} onClick={()=>set("kranken","gkv")}>GKV</button><button style={T.optBtn(p.kranken==="pkv")} onClick={()=>set("kranken","pkv")}>PKV</button></div></div>
          <div style={T.row}><label style={T.fldLbl}>Verheiratet / eingetragen</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}><button style={T.optBtn(p.verheiratet)} onClick={()=>set("verheiratet",true)}>Ja</button><button style={T.optBtn(!p.verheiratet)} onClick={()=>set("verheiratet",false)}>Nein</button></div></div>
          <div style={T.row}><label style={T.fldLbl}>Riester-Vertrag vorhanden</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}><button style={T.optBtn(p.riester)} onClick={()=>set("riester",true)}>Ja</button><button style={T.optBtn(!p.riester)} onClick={()=>set("riester",false)}>Nein</button></div></div>
          <div style={T.row}><label style={T.fldLbl}>Betriebliche Altersvorsorge (bAV)</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}><button style={T.optBtn(p.bav)} onClick={()=>set("bav",true)}>Ja</button><button style={T.optBtn(!p.bav)} onClick={()=>set("bav",false)}>Nein</button></div></div>
          <div style={T.rowLast}><label style={T.fldLbl}>Elternzeit geplant</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}><button style={T.optBtn(p.elternzeit)} onClick={()=>set("elternzeit",true)}>Ja</button><button style={T.optBtn(!p.elternzeit)} onClick={()=>set("elternzeit",false)}>Nein</button></div></div>
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Checkliste erstellen</button></div>
    </div>
  );
}
