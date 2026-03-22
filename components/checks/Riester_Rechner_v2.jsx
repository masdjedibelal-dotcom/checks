import { useState } from "react";
(() => { const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();

const MAKLER={name:"Max Mustermann",firma:"Mustermann Versicherungen",email:"kontakt@mustermann-versicherungen.de",telefon:"089 123 456 78",primaryColor:"#1a3a5c"};
const C=MAKLER.primaryColor,WARN="#c0392b",OK="#059669";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";

function berechne(p){
  const{brutto,kinder,kinderVor2008,verheiratet,eigenBeitrag,berufstaetig}=p;
  // Zulagen 2025
  const grundzulage=175;
  const kinderZulageNeu=300;   // Kinder ab 2008
  const kinderZulageAlt=185;   // Kinder vor 2008
  const kinderZulageGesamt=(kinder-kinderVor2008)*kinderZulageNeu + kinderVor2008*kinderZulageAlt;
  const partnerZulage=verheiratet?175:0;
  const gesamtZulage=grundzulage+kinderZulageGesamt+partnerZulage;
  // Mindesteigenbeitrag: 4% des Vorjahres-Bruttos minus Zulagen, min 60 €
  const pflichtBeitrag=Math.max(60, Math.round(brutto*12*0.04)-gesamtZulage);
  // Steuerersparnis: Sonderausgabenabzug max 2.100 € p.a.
  const abzugsfaehig=Math.min(2100, eigenBeitrag*12+gesamtZulage);
  const steuerErsparnis=Math.round(abzugsfaehig*0.25);  // Grenzsteuersatz ca. 25%
  const nettoEigenBeitrag=Math.max(0,eigenBeitrag*12-gesamtZulage-Math.max(0,steuerErsparnis-gesamtZulage));
  const zulagenQuote=gesamtZulage>0?(gesamtZulage/(eigenBeitrag*12+gesamtZulage)*100).toFixed(0):0;
  const fehltMindesteigen=eigenBeitrag*12<pflichtBeitrag;
  const bonus=berufstaetig&&p.alter<=25?200:0; // Berufseinsteiger-Bonus einmalig
  return{grundzulage,kinderZulageGesamt,partnerZulage,gesamtZulage,pflichtBeitrag,steuerErsparnis,nettoEigenBeitrag,zulagenQuote,fehltMindesteigen,bonus,gesamtFoerderung:gesamtZulage+steuerErsparnis};
}

const T={page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?C:"#e8e8e8"}`,background:a?C:"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"})};

function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

function SliderField({label,value,min,max,step,onChange,display,hint,unit=""}){
  const[inputVal,setInputVal]=useState(String(value));const[focused,setFocused]=useState(false);
  const handleSlider=(v)=>{onChange(v);if(!focused)setInputVal(String(v));};
  const handleBlur=()=>{setFocused(false);const raw=parseFloat(inputVal.replace(/[^\d.-]/g,""));if(!isNaN(raw)){const c=Math.min(max,Math.max(min,Math.round(raw/step)*step));onChange(c);setInputVal(String(c));}else setInputVal(String(value));};
  return(<div style={{marginBottom:"22px"}}><div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"8px"}}><label style={{...T.fldLbl}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:"4px"}}><input type="text" inputMode="numeric" value={focused?inputVal:String(value)} placeholder={focused?"":String(value)} onFocus={()=>{setFocused(true);setInputVal(String(value));}} onBlur={handleBlur} onChange={e=>setInputVal(e.target.value)} style={{width:"90px",padding:"5px 8px",border:`1px solid ${focused?C:"#e8e8e8"}`,borderRadius:"5px",fontSize:"14px",fontWeight:"600",color:focused?"#111":C,textAlign:"right",outline:"none",background:focused?"#fff":`${C}08`,fontFamily:"'DM Sans',system-ui,sans-serif"}}/>{unit&&<span style={{fontSize:"12px",color:"#999",flexShrink:0}}>{unit}</span>}</div></div>{!focused&&display&&<div style={{fontSize:"12px",color:"#888",marginBottom:"8px"}}>{display}</div>}<input type="range" min={min} max={max} step={step} value={value} onChange={e=>handleSlider(+e.target.value)} style={{width:"100%","--accent":C}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#ccc",marginTop:"4px"}}><span>{min}{unit?" "+unit:""}</span><span>{max}{unit?" "+unit:""}</span></div>{hint&&<div style={T.fldHint}>{hint}</div>}</div>);
}

export default function RiesterRechner(){
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[p,setP]=useState({brutto:3600,alter:34,kinder:1,kinderVor2008:0,verheiratet:false,eigenBeitrag:100,berufstaetig:true});
  const set=(k,v)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);const TOTAL=2;

  const Header=()=>(
    <><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Riester-Check</span></div><div style={T.prog}><div style={T.progFil(phase/TOTAL*100)}/></div></>
  );

  if(danke)return(
    <div style={{...T.page,"--accent":C}}><Header/>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir prüfen Ihren Riester-Vertrag und melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );

  if(phase===2){
    const valid=fd.name.trim()&&fd.email.trim();
    const POSITIONEN=[
      {l:"Grundzulage",v:fmt(R.grundzulage)+"/Jahr",ok:true,sub:"175 € jährlich (automatisch bei 4%-Beitrag)"},
      ...(R.kinderZulageGesamt>0?[{l:"Kinderzulage",v:fmt(R.kinderZulageGesamt)+"/Jahr",ok:true,sub:`${p.kinder} Kind${p.kinder>1?"er":""} · muss jährlich beantragt werden`}]:[]),
      ...(R.partnerZulage>0?[{l:"Partner-Grundzulage",v:fmt(R.partnerZulage)+"/Jahr",ok:true,sub:"Nur wenn Partner eigenen Riester-Vertrag hat"}]:[]),
      ...(R.bonus>0?[{l:"Berufseinsteiger-Bonus",v:fmt(R.bonus)+" einmalig",ok:true,sub:"Einmalig bis zum 25. Lebensjahr"}]:[]),
      {l:"Steuerersparnis (Sonderausgaben)",v:fmt(R.steuerErsparnis)+"/Jahr",ok:true,sub:"Sonderausgabenabzug bis 2.100 € p.a."},
    ];
    const WARNUNGEN=[
      ...(R.fehltMindesteigen?[{l:"Mindesteigenbeitrag nicht erreicht",sub:`Mindestens ${fmt(R.pflichtBeitrag)}/Jahr nötig — aktuell ${fmt(p.eigenBeitrag*12)}/Jahr. Zulagen werden anteilig gekürzt!`,dringend:true}]:[]),
      {l:"Kinderzulage beantragen",sub:"Die Kinderzulage läuft NICHT automatisch — muss jährlich beim Anbieter beantragt werden.",dringend:true},
      {l:"Dauerzulageantrag prüfen",sub:"Einmaliger Antrag beim Anbieter — dann automatisch jedes Jahr beantragt.",dringend:false},
      ...(p.kinder>0&&p.verheiratet?[{l:"Partner-Vertrag prüfen",sub:"Partner bekommt eigene Grundzulage nur mit eigenem Riester-Vertrag und Mindesteigenbeitrag (60 €/Jahr).",dringend:false}]:[]),
    ];
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <Header/>
        <div style={T.hero}><div style={T.eyebrow}>Ihre Riester-Analyse</div><div style={T.h1}>Gesamtförderung: {fmt(R.gesamtFoerderung)}/Jahr</div><div style={T.body}>Zulagen {fmt(R.gesamtZulage)} + Steuer {fmt(R.steuerErsparnis)} · Zulagenquote {R.zulagenQuote}%</div></div>

        {/* Förderübersicht */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Ihre Förderung im Detail</div>
          <div style={T.card}>
            {POSITIONEN.map(({l,v,ok,sub},i,arr)=>(
              <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",display:"flex",alignItems:"flex-start",gap:"10px"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:ok?OK:WARN,marginTop:"5px",flexShrink:0}}/>
                <div style={{flex:1}}><div style={{fontSize:"13px",fontWeight:"500",color:"#111"}}>{l}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div></div>
                <div style={{fontSize:"13px",fontWeight:"600",color:C,flexShrink:0,marginLeft:"8px"}}>{v}</div>
              </div>
            ))}
            <div style={{padding:"12px 16px",background:`${C}06`,borderTop:"1px solid #e8e8e8",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:"13px",fontWeight:"700",color:"#111"}}>Gesamtförderung</span>
              <span style={{fontSize:"13px",fontWeight:"700",color:C}}>{fmt(R.gesamtFoerderung)}/Jahr</span>
            </div>
          </div>
        </div>

        <div style={T.divider}/>

        {/* Warnungen */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Checkliste</div>
          <div style={T.card}>
            {WARNUNGEN.map(({l,sub,dringend},i,arr)=>(
              <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",borderLeft:`3px solid ${dringend?WARN:C}`}}>
                <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"2px"}}>{l}</div>
                <div style={{fontSize:"12px",color:"#777",lineHeight:1.55}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{...T.section,marginBottom:"0"}}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Vertrag prüfen lassen</div>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
        </div>
        <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid)setDanke(true);}} disabled={!valid}>Riester prüfen lassen</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      </div>
    );
  }

  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <Header/>
      <div style={T.hero}><div style={T.eyebrow}>Riester-Check</div><div style={T.h1}>Hole ich alle Zulagen raus?</div><div style={T.body}>Grundzulage, Kinderzulagen und Steuerbonus — was Ihnen zusteht und was häufig verschenkt wird.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderField label="Jahresbruttoeinkommen" value={p.brutto} min={10000} max={80000} step={500} unit="€/Jahr" display={`Mindesteigenbeitrag: ${fmt(R.pflichtBeitrag)}/Jahr`} onChange={v=>set("brutto",v)}/></div>
          <div style={T.row}><SliderField label="Eigener Jahresbeitrag" value={p.eigenBeitrag*12} min={60} max={2100} step={60} unit="€/Jahr" display={R.fehltMindesteigen?`Zu wenig — mind. ${fmt(R.pflichtBeitrag)} nötig`:"Mindesteigenbeitrag erreicht"} onChange={v=>set("eigenBeitrag",Math.round(v/12))} hint="Ihr tatsächlicher Jahresbeitrag an den Riester-Anbieter"/></div>
          <div style={T.row}><SliderField label="Anzahl Kinder" value={p.kinder} min={0} max={5} step={1} unit="Kinder" onChange={v=>set("kinder",v)}/></div>
          {p.kinder>0&&<div style={T.row}><SliderField label="Davon vor 2008 geboren" value={p.kinderVor2008} min={0} max={p.kinder} step={1} unit="Kinder" hint="Kinderzulage 185 € (vor 2008) vs. 300 € (ab 2008)" onChange={v=>set("kinderVor2008",Math.min(v,p.kinder))}/></div>}
          <div style={T.row}>
            <label style={T.fldLbl}>Verheiratet / eingetragen</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}>
              <button style={T.optBtn(!p.verheiratet)} onClick={()=>set("verheiratet",false)}>Nein</button>
              <button style={T.optBtn(p.verheiratet)} onClick={()=>set("verheiratet",true)}>Ja</button>
            </div>
          </div>
          <div style={T.rowLast}>
            <label style={T.fldLbl}>Berufstätig / rentenversicherungspflichtig</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"8px"}}>
              <button style={T.optBtn(p.berufstaetig)} onClick={()=>set("berufstaetig",true)}>Ja</button>
              <button style={T.optBtn(!p.berufstaetig)} onClick={()=>set("berufstaetig",false)}>Nein / Beamter</button>
            </div>
          </div>
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Zulagen berechnen</button></div>
    </div>
  );
}
