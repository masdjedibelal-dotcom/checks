"use client";

import { useState, useMemo } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
(() => { if (typeof document === "undefined") return; const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();
const WARN="#c0392b";

const SPARTEN=[
  {id:"gesundheit",l:"Gesundheit",beschr:"Was passiert wenn ich krank werde?",prods:["GKV / PKV","Krankentagegeld","Zahnzusatz","Krankenhaus-Zusatz","Ambulante Zusatz","Auslandskranken"]},
  {id:"arbeitskraft",l:"Arbeitskraft",beschr:"Was wenn ich nicht mehr arbeiten kann?",prods:["Berufsunfähigkeit (BU)","Grundfähigkeit","Unfallversicherung"]},
  {id:"familie",l:"Familie & Leben",beschr:"Was passiert mit meiner Familie?",prods:["Risikolebensversicherung","Sterbegeld","Private Pflegeversicherung","Privathaftpflicht","Rechtsschutz"]},
  {id:"eigentum",l:"Eigentum & Sach",beschr:"Was passiert mit meinen Sachen?",prods:["Hausrat","Wohngebäude","Kfz-Versicherung","E-Bike / Fahrrad"]},
  {id:"vorsorge",l:"Altersvorsorge",beschr:"Wie baue ich Vermögen auf?",prods:["Riester-Rente","Rürup-Rente","Betriebliche AV (bAV)","Private Rentenversicherung","ETF-Depot","Bausparvertrag"]},
];
const EREIGNISSE=[
  {id:"umzug",l:"Umzug oder Hauskauf"},
  {id:"heirat",l:"Heirat oder Trennung"},
  {id:"kind",l:"Kind bekommen oder erwartet"},
  {id:"kfz",l:"Neues Fahrzeug"},
  {id:"job",l:"Jobwechsel oder Gehaltssprung"},
  {id:"selbst",l:"Selbstständig gemacht"},
  {id:"immobilie",l:"Immobilie gekauft"},
  {id:"pflege",l:"Pflege eines Angehörigen"},
];
const MATRIX={
  umzug:{b:[{p:"Hausrat",t:"Neue Adresse und Wohnfläche melden — Unterversicherung vermeiden.",h:true},{p:"Wohngebäude",t:"Als Eigentümer: auf neues Objekt umschreiben, Elementarschutz prüfen.",h:true},{p:"Kfz-Versicherung",t:"Neue Adresse melden — Regionalklasse kann sich ändern.",h:false}],n:[{p:"Wohngebäude",t:"Als Eigentümer: Wohngebäudeversicherung ist Pflicht.",h:true}]},
  heirat:{b:[{p:"Privathaftpflicht",t:"Partner aufnehmen — viele Tarife bieten kostenlose Familienerweiterung.",h:true},{p:"Risikolebensversicherung",t:"Bezugsrecht und Versicherungssumme anpassen.",h:true}],n:[{p:"Risikolebensversicherung",t:"Gegenseitige finanzielle Absicherung jetzt essenziell.",h:true}]},
  kind:{b:[{p:"Risikolebensversicherung",t:"Versicherungssumme erhöhen — Kind bedeutet mehr Verantwortung.",h:true},{p:"Berufsunfähigkeit (BU)",t:"BU-Rente auf neue Familiensituation prüfen.",h:true},{p:"Riester-Rente",t:"Kinderzulage (185 € / 300 €) beantragen — läuft nicht automatisch!",h:true},{p:"Privathaftpflicht",t:"Kind in die Familienhaftpflicht aufnehmen.",h:true}],n:[{p:"Unfallversicherung",t:"Kinder sind am aktivsten — und am häufigsten verletzt.",h:false}]},
  kfz:{b:[{p:"Kfz-Versicherung",t:"Neues Fahrzeug anmelden, Kasko und SF-Klasse prüfen.",h:true}],n:[{p:"E-Bike / Fahrrad",t:"E-Bikes sind nicht automatisch über Hausrat versichert.",h:true}]},
  job:{b:[{p:"Berufsunfähigkeit (BU)",t:"BU-Rente anpassen — Nachversicherungsgarantie nutzen.",h:true},{p:"Krankentagegeld",t:"Tagessatz an neues Bruttogehalt anpassen.",h:true},{p:"GKV / PKV",t:"Über 73.800 € Jahresgehalt: PKV-Wechsel prüfen.",h:true}],n:[{p:"Betriebliche AV (bAV)",t:"bAV über neuen Arbeitgeber einrichten — Arbeitgeberzuschuss mitnehmen.",h:false}]},
  selbst:{b:[{p:"Berufsunfähigkeit (BU)",t:"Kein gesetzlicher BU-Schutz mehr als Selbstständiger.",h:true},{p:"Krankentagegeld",t:"Kein gesetzliches Krankengeld — Tagessatz prüfen.",h:true}],n:[{p:"Rürup-Rente",t:"Rürup: Ideal für Selbstständige — bis 27.565 € absetzbar (2025).",h:true}]},
  immobilie:{b:[{p:"Wohngebäude",t:"Auf neues Objekt umschreiben — Elementarschutz prüfen.",h:true},{p:"Risikolebensversicherung",t:"Versicherungssumme auf Darlehensbetrag anpassen.",h:true}],n:[{p:"Wohngebäude",t:"Wohngebäudeversicherung ist Pflicht bei jeder Immobilienfinanzierung.",h:true}]},
  pflege:{b:[{p:"Private Pflegeversicherung",t:"Pflegelücke analysieren — gesetzlich werden nur ca. 50% gedeckt.",h:true}],n:[{p:"Private Pflegeversicherung",t:"Eigene Pflegeabsicherung jetzt planen.",h:true}]},
};

function buildT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"}};}
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

export default function JahresCheck(){
  const MAKLER=useMakler();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>buildT(C),[C]);
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[prods,setProds]=useState([]);const[events,setEvents]=useState([]);
  const[offene,setOffene]=useState(["gesundheit","arbeitskraft"]);
  const[showZusatz,setShowZusatz]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const toggleProd=(id)=>setProds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleEv=(id)=>setEvents(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleOffen=(id)=>setOffene(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const empf=()=>{
    const b=[],n=[];
    for(const eid of events){const m=MATRIX[eid];if(!m)continue;const el=EREIGNISSE.find(e=>e.id===eid)?.l||eid;(m.b||[]).forEach(i=>b.push({...i,ereignis:el}));(m.n||[]).forEach(i=>n.push({...i,ereignis:el}));}
    return{b:b.sort((a)=>a.h?-1:1),n};
  };
  const E=empf();

  if(danke)return(
    <div style={{...T.page,"--accent":C}}><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Jahrescheck</span></div>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir bereiten das Jahresgespräch mit Ihren Änderungen vor und melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );

  // Phase 3: Ergebnis + Kontakt
  if(phase===3){
    const valid=fd.name.trim()&&fd.email.trim();
    const dringend=E.b.filter(e=>e.h);
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Jahrescheck {new Date().getFullYear()}</span></div>
        <div style={T.prog}><div style={T.progFil(90)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Ihr Jahrescheck-Ergebnis</div><div style={T.h1}>{dringend.length>0?`${dringend.length} dringende Anpassungen`:"Alles auf dem neuesten Stand"}</div><div style={T.body}>{events.length} Lebensereignisse · {E.b.length} Vertragshinweise · {E.n.length} mögliche Ergänzungen</div></div>
        {E.b.filter(e=>e.h).length>0&&(
          <div style={T.section}>
            <div style={{fontSize:"11px",fontWeight:"600",color:WARN,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Dringend</div>
            <div style={T.card}>
              {E.b.filter(e=>e.h).map((item,i,arr)=>(
                <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",borderLeft:`3px solid ${WARN}`}}>
                  <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"3px"}}>{item.p}</div>
                  <div style={{fontSize:"12px",color:"#555",lineHeight:1.55}}>{item.t}</div>
                  <div style={{fontSize:"11px",color:"#bbb",marginTop:"3px"}}>Anlass: {item.ereignis}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {E.b.filter(e=>!e.h).length>0&&(
          <div style={T.section}>
            <button onClick={()=>setShowZusatz(v=>!v)} style={{fontSize:"12px",color:"#888",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",marginBottom:"8px"}}>
              {E.b.filter(e=>!e.h).length} weitere Hinweise {showZusatz?"▲":"▼"}
            </button>
            {showZusatz&&<div style={T.card}>{E.b.filter(e=>!e.h).map((item,i,arr)=>(
              <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",borderLeft:`3px solid ${C}`}}>
                <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"3px"}}>{item.p}</div>
                <div style={{fontSize:"12px",color:"#555",lineHeight:1.55}}>{item.t}</div>
                <div style={{fontSize:"11px",color:"#bbb",marginTop:"3px"}}>Anlass: {item.ereignis}</div>
              </div>
            ))}</div>}
          </div>
        )}
        {E.n.length>0&&(
          <div style={T.section}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Mögliche Ergänzungen</div>
            <div style={T.card}>
              {E.n.map((item,i,arr)=>(
                <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none"}}>
                  <div style={{fontSize:"13px",fontWeight:"500",color:"#111",marginBottom:"2px"}}>{item.p}</div>
                  <div style={{fontSize:"12px",color:"#777",lineHeight:1.5}}>{item.t}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={T.divider}/>
        {MAKLER.isDemoMode ? (
          <DemoCTA slug={MAKLER.slug} />
        ) : (
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Jahresgespräch vereinbaren</div>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl}}/></div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
        </div>
        )}
        {!MAKLER.isDemoMode && (
        <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid){setDanke(true);}}} disabled={!valid}>Termin vereinbaren</button><button style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></div>
        )}
      </div>
    );
  }

  // Phase 2: Lebensereignisse
  if(phase===2){
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Schritt 2/2</span></div>
        <div style={T.prog}><div style={T.progFil(65)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Schritt 2 von 2 · Lebensereignisse</div><div style={T.h1}>Was hat sich verändert?</div><div style={T.body}>Die letzten 12 Monate — alles Zutreffende auswählen.</div></div>
        <div style={T.section}>
          <div style={T.card}>
            {EREIGNISSE.map((ev,i,arr)=>{
              const a=events.includes(ev.id);
              return(
                <div key={ev.id} onClick={()=>toggleEv(ev.id)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",background:a?`${C}06`:"#fff",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none",cursor:"pointer"}}>
                  <div style={{width:"20px",height:"20px",borderRadius:"5px",border:`1.5px solid ${a?C:"#ddd"}`,background:a?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                    {a&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{fontSize:"14px",fontWeight:a?"500":"400",color:a?"#111":"#444"}}>{ev.l}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{padding:"0 24px",marginBottom:"120px"}}>
          <div style={T.infoBox}>Keine Änderungen? Trotzdem fortfahren — wir prüfen dann ob Ihre bestehenden Verträge noch aktuell sind.</div>
        </div>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Ergebnis anzeigen{events.length>0?` · ${events.length} ausgewählt`:""}</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      </div>
    );
  }

  // Phase 1: Bestand
  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Jahrescheck {new Date().getFullYear()}</span></div>
      <div style={T.prog}><div style={T.progFil(30)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>Schritt 1 von 2 · Bestandsaufnahme</div><div style={T.h1}>Was haben Sie bereits?</div><div style={T.body}>Tippen Sie alle vorhandenen Versicherungen an. Dient als Basis für die Jahresanalyse.</div></div>
      {SPARTEN.map(sp=>{
        const offen=offene.includes(sp.id);
        const anz=sp.prods.filter(p=>prods.includes(p)).length;
        return(
          <div key={sp.id} style={T.section}>
            <div style={T.card}>
              <button onClick={()=>toggleOffen(sp.id)} style={{width:"100%",padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:offen?`${C}04`:"#fff",textAlign:"left",cursor:"pointer"}}>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"600",color:offen?C:"#111"}}>{sp.l}</div>
                  <div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sp.beschr}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,marginLeft:"12px"}}>
                  {anz>0&&<span style={{fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px",background:`${C}12`,color:C}}>{anz}</span>}
                  <span style={{fontSize:"12px",color:"#ccc"}}>{offen?"▲":"▼"}</span>
                </div>
              </button>
              {offen&&<div style={{borderTop:"1px solid #f0f0f0"}}>
                {sp.prods.map((prod,i)=>{
                  const a=prods.includes(prod);
                  return(
                    <div key={prod} onClick={()=>toggleProd(prod)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 16px",background:a?`${C}06`:"#fff",borderBottom:i<sp.prods.length-1?"1px solid #f5f5f5":"none",cursor:"pointer"}}>
                      <div style={{width:"18px",height:"18px",borderRadius:"4px",border:`1.5px solid ${a?C:"#ddd"}`,background:a?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                        {a&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontSize:"13px",fontWeight:a?"500":"400",color:a?"#111":"#444"}}>{prod}</span>
                    </div>
                  );
                })}
              </div>}
            </div>
          </div>
        );
      })}
      <div style={{padding:"0 24px",marginBottom:"120px"}}><div style={T.infoBox}>Nicht sicher? Einfach weitergehen — im nächsten Schritt sehen Sie was sich verändert hat.</div></div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Weiter zu den Lebensereignissen{prods.length>0?` · ${prods.length} vorhanden`:""}</button></div>
    </div>
  );
}
