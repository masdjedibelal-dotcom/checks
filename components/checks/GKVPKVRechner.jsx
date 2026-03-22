"use client";

import { useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
(() => { if (typeof document === "undefined") return; const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
const MAKLER={name:"Max Mustermann",firma:"Mustermann Versicherungen",email:"kontakt@mustermann-versicherungen.de",telefon:"089 123 456 78",primaryColor:"#1a3a5c"};
const C=MAKLER.primaryColor,OK="#059669";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
function berechne(p){
  const{brutto,alter,kinder,partner,beruf,gesundheit}=p;
  const gkvBeitrag=beruf==="selbst"?Math.min(brutto*0.148+brutto*0.017,1178):brutto*0.074+brutto*0.009;
  const pkv=beruf==="beamter"?brutto*0.025:alter<30?brutto*0.045:alter<40?brutto*0.06:alter<50?brutto*0.075:brutto*0.095;
  const pkv80=alter<30?brutto*0.055:alter<40?brutto*0.072:alter<50?brutto*0.09:brutto*0.12;
  const famBonus=kinder>0&&partner&&beruf!=="selbst"&&beruf!=="beamter"?true:false;
  const score={gkv:0,pkv:0};
  if(kinder>0){score.gkv+=2;}
  if(!partner||beruf==="selbst"||beruf==="beamter"){score.pkv+=2;}
  if(alter<35){score.pkv+=1;}if(alter>45){score.gkv+=1;}
  if(gesundheit==="gut"){score.pkv+=2;}if(gesundheit==="schlecht"){score.gkv+=3;}
  if(beruf==="beamter"){score.pkv+=3;}if(beruf==="selbst"){score.pkv+=1;}
  if(brutto>5000){score.pkv+=1;}
  const total=score.gkv+score.pkv;
  const empfehlung=score.gkv>score.pkv?"GKV":"PKV";
  return{gkvBeitrag,pkv,pkv80,famBonus,score,total,empfehlung,diff:Math.abs(gkvBeitrag-pkv)};
}
const T={page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a,c)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?(c||C):"#e8e8e8"}`,background:a?(c||C):"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"})};
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
function SliderField({label,value,min,max,step,onChange,display,hint,unit=""}){
  const[inputVal,setInputVal]=useState(String(value));const[focused,setFocused]=useState(false);
  const handleSlider=(v)=>{onChange(v);if(!focused)setInputVal(String(v));};
  const handleBlur=()=>{setFocused(false);const raw=parseFloat(inputVal.replace(/[^\d.-]/g,""));if(!isNaN(raw)){const c=Math.min(max,Math.max(min,Math.round(raw/step)*step));onChange(c);setInputVal(String(c));}else setInputVal(String(value));};
  return(<div style={{marginBottom:"22px"}}><div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"8px"}}><label style={{...T.fldLbl,marginBottom:0}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:"4px"}}><input type="text" inputMode="numeric" value={focused?inputVal:String(value)} placeholder={focused?"":String(value)} onFocus={()=>{setFocused(true);setInputVal(String(value));}} onBlur={handleBlur} onChange={e=>setInputVal(e.target.value)} style={{width:"90px",padding:"5px 8px",border:`1px solid ${focused?C:"#e8e8e8"}`,borderRadius:"5px",fontSize:"14px",fontWeight:"600",color:focused?"#111":C,textAlign:"right",outline:"none",background:focused?"#fff":`${C}08`,fontFamily:"'DM Sans',system-ui,sans-serif"}}/>{unit&&<span style={{fontSize:"12px",color:"#999",flexShrink:0}}>{unit}</span>}</div></div>{!focused&&display&&<div style={{fontSize:"12px",color:"#888",marginBottom:"8px"}}>{display}</div>}<input type="range" min={min} max={max} step={step} value={value} onChange={e=>handleSlider(+e.target.value)} style={{width:"100%","--accent":C}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#ccc",marginTop:"4px"}}><span>{min}{unit?" "+unit:""}</span><span>{max}{unit?" "+unit:""}</span></div>{hint&&<div style={T.fldHint}>{hint}</div>}</div>);
}
export default function GKVPKVRechner(){
  const demoCtx=useMakler();
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({brutto:4500,alter:32,kinder:0,partner:false,beruf:"angestellt",gesundheit:"gut"});
  const set=(k,v)=>setP(x=>({...x,[k]:v}));const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);
  const FAKTOREN=[
    {l:"Kinder vorhanden",gkv:"Beitragsfrei mitversichert",pkv:"Eigener Beitrag je Kind",fav:p.kinder>0?"gkv":"neutral"},
    {l:"Gesundheitszustand",gkv:"Irrelevant für Beitrag",pkv:"Risikoaufschlag bei Vorerkrankungen",fav:p.gesundheit==="gut"?"pkv":"gkv"},
    {l:"Alter",gkv:"Steigerung mit Einkommen",pkv:p.alter<35?"Günstig einsteigen":"Steigende Altersrückstellungen",fav:p.alter<35?"pkv":"gkv"},
    {l:"Beruf",gkv:p.beruf==="beamter"?"Freiwillig möglich":"Pflichtversicherung",pkv:p.beruf==="beamter"?"Beihilfe 50-70%":p.beruf==="selbst"?"Keine Mindestbemessungsgrundlage":"Nur über Einkommensgrenze",fav:p.beruf==="beamter"?"pkv":"neutral"},
    {l:"Beitrag aktuell",gkv:fmt(R.gkvBeitrag)+"/Mon.",pkv:fmt(R.pkv)+"/Mon.",fav:R.gkvBeitrag<R.pkv?"gkv":"pkv"},
  ];
  if(danke)return(
    <div style={{...T.page,"--accent":C}}><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px"}}>Ihr Berater</div><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );
  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
        <div style={T.prog}><div style={T.progFil(100)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Ihre Analyse</div><div style={T.h1}>Empfehlung: {R.empfehlung}</div><div style={T.body}>{R.score[R.empfehlung.toLowerCase()]} von {R.total} Faktoren sprechen für {R.empfehlung} · Beitragsdifferenz {fmt(R.diff)}/Monat</div></div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={{border:`2px solid ${R.empfehlung==="GKV"?C:"#e8e8e8"}`,borderRadius:"10px",padding:"14px"}}>
              <div style={{fontSize:"11px",fontWeight:"600",color:R.empfehlung==="GKV"?C:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>{R.empfehlung==="GKV"?"Empfohlen · ":""}GKV</div>
              <div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmt(R.gkvBeitrag)}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>pro Monat</div>
            </div>
            <div style={{border:`2px solid ${R.empfehlung==="PKV"?C:"#e8e8e8"}`,borderRadius:"10px",padding:"14px"}}>
              <div style={{fontSize:"11px",fontWeight:"600",color:R.empfehlung==="PKV"?C:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"6px"}}>{R.empfehlung==="PKV"?"Empfohlen · ":""}PKV</div>
              <div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmt(R.pkv)}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>pro Monat (Ø-Schätzung)</div>
            </div>
          </div>
          <div style={T.card}>
            {FAKTOREN.map(({l,gkv,pkv,fav},i,arr)=>(
              <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none"}}>
                <div style={{fontSize:"11px",fontWeight:"600",color:"#999",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.3px"}}>{l}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div style={{padding:"8px",background:fav==="gkv"?"#f0fdf4":"#f9f9f9",borderRadius:"6px",border:fav==="gkv"?`1px solid #bbf7d0`:"1px solid transparent"}}><div style={{fontSize:"11px",fontWeight:"600",color:fav==="gkv"?OK:"#888",marginBottom:"2px"}}>GKV</div><div style={{fontSize:"12px",color:"#444"}}>{gkv}</div></div>
                  <div style={{padding:"8px",background:fav==="pkv"?"#eff6ff":"#f9f9f9",borderRadius:"6px",border:fav==="pkv"?`1px solid #bfdbfe`:"1px solid transparent"}}><div style={{fontSize:"11px",fontWeight:"600",color:fav==="pkv"?C:"#888",marginBottom:"2px"}}>PKV</div><div style={{fontSize:"12px",color:"#444"}}>{pkv}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {demoCtx.isDemoMode ? (
          <DemoCTA slug={demoCtx.slug} />
        ) : (
        <div style={{...T.section}}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Gespräch anfragen</div>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
        </div>
        )}
        {!demoCtx.isDemoMode && (
        <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid){setDanke(true);}}} disabled={!valid}>Gespräch anfragen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
        )}
      </div>
    );
  }
  const opt3=(k,opts)=><div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(opts.length,3)},1fr)`,gap:"8px",marginTop:"8px"}}>{opts.map(([v,l])=><button key={v} style={T.optBtn(p[k]===v)} onClick={()=>set(k,v)}>{l}</button>)}</div>;
  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
      <div style={T.prog}><div style={T.progFil(50)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>GKV vs. PKV Entscheidungsrechner</div><div style={T.h1}>Was lohnt sich für Sie?</div><div style={T.body}>Faustformeln für Ihre Situation — Beitragsvergleich und gewichtete Empfehlung.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Monatliches Bruttoeinkommen" value={p.brutto} min={1000} max={12000} step={100} unit="€" onChange={v=>set("brutto",v)}/></div>
          <div style={T.row}><SliderField label="Aktuelles Alter" value={p.alter} min={18} max={60} step={1} unit="Jahre" onChange={v=>set("alter",v)}/></div>
          <div style={T.row}><SliderField label="Kinder" value={p.kinder} min={0} max={5} step={1} unit="Kinder" onChange={v=>set("kinder",v)}/></div>
          <div style={T.row}><label style={T.fldLbl}>Partner mitversichern?</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"0"}}><button style={T.optBtn(!p.partner)} onClick={()=>set("partner",false)}>Nein / arbeitet selbst</button><button style={T.optBtn(p.partner)} onClick={()=>set("partner",true)}>Ja, ohne eigenes Einkommen</button></div></div>
          <div style={T.row}><label style={T.fldLbl}>Berufsstatus</label>{opt3("beruf",[["angestellt","Angestellt"],["selbst","Selbstständig"],["beamter","Beamter"]])}</div>
          <div style={T.rowLast}><label style={T.fldLbl}>Gesundheitszustand</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginTop:"8px"}}>{[["gut","Gut"],["mittel","Mittel"],["schlecht","Eingeschränkt"]].map(([v,l])=><button key={v} style={T.optBtn(p.gesundheit===v)} onClick={()=>set("gesundheit",v)}>{l}</button>)}</div></div>
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Empfehlung anzeigen</button></div>
    </div>
  );
}
