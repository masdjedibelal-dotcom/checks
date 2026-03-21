"use client";

import { useState } from "react";
(() => { if (typeof document === "undefined") return; const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
const MAKLER={name:"Max Mustermann",firma:"Mustermann Versicherungen",email:"kontakt@mustermann-versicherungen.de",telefon:"089 123 456 78",primaryColor:"#1a3a5c"};
const C=MAKLER.primaryColor,WARN="#c0392b";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK=(n)=>n>=10000?Math.round(n/1000)+".000 €":fmt(n);
function berechne(p){
  const{restschuld,altZins,neuZins,tilgung,laufzeit}=p;
  const altRate=(restschuld*(altZins/100+tilgung/100))/12;
  const neuRate=(restschuld*(neuZins/100+tilgung/100))/12;
  const diffMonatl=neuRate-altRate;
  const mehrGesamt=diffMonatl*laufzeit*12;
  const altEnde=restschuld-restschuld*(tilgung/100)*laufzeit;
  return{altRate,neuRate,diffMonatl,mehrGesamt,altEnde:Math.max(0,altEnde)};
}
const T={page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"}};
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
function SliderField({label,value,min,max,step,onChange,display,hint,unit=""}){
  const[inputVal,setInputVal]=useState(String(value));const[focused,setFocused]=useState(false);
  const handleSlider=(v)=>{onChange(v);if(!focused)setInputVal(String(v));};
  const handleBlur=()=>{setFocused(false);const raw=parseFloat(inputVal.replace(/[^\d.-]/g,""));if(!isNaN(raw)){const c=Math.min(max,Math.max(min,Math.round(raw/step)*step));onChange(c);setInputVal(String(c));}else setInputVal(String(value));};
  return(<div style={{marginBottom:"22px"}}><div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"8px"}}><label style={{...T.fldLbl}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:"4px"}}><input type="text" inputMode="numeric" value={focused?inputVal:String(value)} placeholder={focused?"":String(value)} onFocus={()=>{setFocused(true);setInputVal(String(value));}} onBlur={handleBlur} onChange={e=>setInputVal(e.target.value)} style={{width:"90px",padding:"5px 8px",border:`1px solid ${focused?C:"#e8e8e8"}`,borderRadius:"5px",fontSize:"14px",fontWeight:"600",color:focused?"#111":C,textAlign:"right",outline:"none",background:focused?"#fff":`${C}08`,fontFamily:"'DM Sans',system-ui,sans-serif"}}/>{unit&&<span style={{fontSize:"12px",color:"#999",flexShrink:0}}>{unit}</span>}</div></div>{!focused&&display&&<div style={{fontSize:"12px",color:"#888",marginBottom:"8px"}}>{display}</div>}<input type="range" min={min} max={max} step={step} value={value} onChange={e=>handleSlider(+e.target.value)} style={{width:"100%","--accent":C}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#ccc",marginTop:"4px"}}><span>{min}{unit?" "+unit:""}</span><span>{max}{unit?" "+unit:""}</span></div>{hint&&<div style={T.fldHint}>{hint}</div>}</div>);
}
export default function AnschlussfinanzierungRechner(){
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({restschuld:220000,altZins:1.2,neuZins:3.8,tilgung:2,laufzeit:10});
  const set=(k,v)=>setP(x=>({...x,[k]:v}));const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);
  const istTeurer=R.diffMonatl>0;
  if(danke)return(
    <div style={{...T.page,"--accent":C}}><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Anschlussfinanzierung</span></div>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden mit konkreten Angeboten.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    const items=[
      {l:"Aktuelle Rate",v:fmt(R.altRate)+"/Mon.",sub:`Zins ${p.altZins}% + Tilgung ${p.tilgung}%`},
      {l:"Neue Rate",v:fmt(R.neuRate)+"/Mon.",sub:`Zins ${p.neuZins}% + Tilgung ${p.tilgung}%`,hl:istTeurer},
      {l:"Differenz monatlich",v:(istTeurer?"+":"-")+fmt(Math.abs(R.diffMonatl))+"/Mon.",hl:istTeurer},
      {l:`Mehrkosten über ${p.laufzeit} Jahre`,v:(istTeurer?"+":"-")+fmtK(Math.abs(R.mehrGesamt)),hl:istTeurer},
      {l:"Restschuld nach Laufzeit",v:fmtK(R.altEnde)},
    ];
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Anschlussfinanzierung</span></div>
        <div style={T.prog}><div style={T.progFil(100)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Ihre Analyse</div><div style={T.h1}>{istTeurer?`+${fmt(R.diffMonatl)}/Monat mehr ab Anschluss`:"Rate bleibt stabil"}</div><div style={T.body}>Restschuld {fmtK(p.restschuld)} · Neuer Zins {p.neuZins}% · Laufzeit {p.laufzeit} Jahre</div></div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Aktuell</div><div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmt(R.altRate)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>pro Monat</div></div>
            <div style={{border:`1px solid ${istTeurer?WARN:"#e8e8e8"}`,borderRadius:"10px",padding:"14px"}}><div style={{fontSize:"11px",fontWeight:"600",color:istTeurer?WARN:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>Ab Anschluss</div><div style={{fontSize:"22px",fontWeight:"700",color:istTeurer?WARN:"#111",letterSpacing:"-0.5px"}}>{fmt(R.neuRate)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>pro Monat</div></div>
          </div>
          <div style={T.card}>
            {items.map(({l,v,sub,hl},i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
                <div><div style={{fontSize:"13px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div>
                <span style={{fontSize:"13px",fontWeight:"600",color:hl?WARN:"#111",flexShrink:0,marginLeft:"12px"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{...T.section,marginBottom:"0"}}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Gespräch anfragen</div>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
        </div>
        <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid){setDanke(true);}}} disabled={!valid}>Gespräch anfragen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      </div>
    );
  }
  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Anschlussfinanzierung</span></div>
      <div style={T.prog}><div style={T.progFil(50)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>Anschlussfinanzierungs-Rechner</div><div style={T.h1}>Was kostet Ihre neue Rate?</div><div style={T.body}>Alte Rate vs. neue Rate nach Zinsbindungsende — Mehrkosten über die gesamte Laufzeit.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Restschuld bei Anschluss" value={p.restschuld} min={50000} max={800000} step={5000} unit="€" onChange={v=>set("restschuld",v)}/></div>
          <div style={T.row}><SliderField label="Alter Zinssatz (aktuell)" value={p.altZins} min={0.5} max={5} step={0.1} unit="%" hint="Aus Ihrem laufenden Darlehensvertrag" onChange={v=>set("altZins",v)}/></div>
          <div style={T.row}><SliderField label="Neuer Zinssatz (Schätzung)" value={p.neuZins} min={1} max={8} step={0.1} unit="%" hint="Aktuelles Marktniveau für Ihre Laufzeit" onChange={v=>set("neuZins",v)}/></div>
          <div style={T.row}><SliderField label="Tilgungsrate" value={p.tilgung} min={1} max={5} step={0.5} unit="%" onChange={v=>set("tilgung",v)}/></div>
          <div style={T.rowLast}><SliderField label="Neue Zinsbindung" value={p.laufzeit} min={5} max={20} step={1} unit="Jahre" onChange={v=>set("laufzeit",v)}/></div>
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Rate berechnen</button></div>
    </div>
  );
}
