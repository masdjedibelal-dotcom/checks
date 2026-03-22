"use client";

import { useState, useMemo } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";

const PRODUKTE=[
  {id:"haftpflicht",l:"Privathaftpflicht",sp:"Familie"},
  {id:"bu",l:"Berufsunfähigkeit (BU)",sp:"Arbeitskraft"},
  {id:"hausrat",l:"Hausrat",sp:"Eigentum"},
  {id:"risikoleben",l:"Risikolebensversicherung",sp:"Familie"},
  {id:"wohngebaeude",l:"Wohngebäudeversicherung",sp:"Eigentum"},
  {id:"gkv_pkv",l:"GKV / PKV",sp:"Gesundheit"},
  {id:"krankentagegeld",l:"Krankentagegeld",sp:"Gesundheit"},
  {id:"zahn",l:"Zahnzusatz",sp:"Gesundheit"},
  {id:"kh_zusatz",l:"Krankenhaus-Zusatz",sp:"Gesundheit"},
  {id:"pflege",l:"Private Pflegeversicherung",sp:"Vorsorge"},
  {id:"riester",l:"Riester-Rente",sp:"Vorsorge"},
  {id:"bav",l:"Betriebliche Altersvorsorge (bAV)",sp:"Vorsorge"},
  {id:"etf",l:"ETF-Depot / Fondssparplan",sp:"Vorsorge"},
  {id:"kfz",l:"Kfz-Versicherung",sp:"Eigentum"},
  {id:"rechtsschutz",l:"Rechtsschutz",sp:"Familie"},
];
const SPARTEN=[...new Set(PRODUKTE.map(p=>p.sp))];

function berechnePakete(profil,vorhanden){
  const{alter,fs,kinder,beruf,wohnen}=profil;
  const f=(id)=>!vorhanden.includes(id);
  const istFam=fs==="familie"||(fs==="paar"&&kinder>0);
  const istEig=wohnen==="eigen";
  const istSel=beruf==="selbst";
  const senior=alter>=55;
  const basis=[],empf=[],prem=[];
  if(f("haftpflicht"))basis.push({id:"haftpflicht",l:"Privathaftpflicht",g:"Schutz vor Schadensersatzforderungen — wichtigste Versicherung überhaupt."});
  if(f("bu")&&!senior)basis.push({id:"bu",l:"Berufsunfähigkeit",g:istSel?"Kein gesetzlicher Schutz als Selbstständiger — existenziell.":"Jeder 4. Arbeitnehmer wird berufsunfähig vor der Rente."});
  if(f("hausrat"))basis.push({id:"hausrat",l:"Hausrat",g:"Schutz bei Einbruch, Feuer und Wasserschaden."});
  if(f("risikoleben")&&(istFam||istEig))basis.push({id:"risikoleben",l:"Risikoleben",g:istEig?"Schützt die Familie vor dem Verlust der Immobilie.":"Finanzielle Verantwortung für Familie absichern."});
  if(f("wohngebaeude")&&istEig)basis.push({id:"wohngebaeude",l:"Wohngebäude",g:"Pflichtversicherung bei jeder Immobilienfinanzierung."});
  if(f("zahn"))empf.push({id:"zahn",l:"Zahnzusatz",g:"GKV übernimmt nur einen Bruchteil — hochwertiger Zahnersatz kostet tausende Euro."});
  if(f("krankentagegeld"))empf.push({id:"krankentagegeld",l:"Krankentagegeld",g:istSel?"Kein gesetzliches Krankengeld — Ausfall ab Tag 1.":"Ab Woche 7 sinkt das Krankengeld deutlich unter das Netto."});
  if(f("pflege")&&alter>=40)empf.push({id:"pflege",l:"Pflegezusatz",g:"Gesetzlich werden nur ca. 50% der Pflegekosten gedeckt."});
  if(!istSel&&f("bav"))empf.push({id:"bav",l:"bAV",g:"Arbeitgeberzuschuss von mindestens 15% — geschenktes Geld."});
  if(f("kh_zusatz"))prem.push({id:"kh_zusatz",l:"Krankenhaus-Zusatz",g:"Chefarztbehandlung und Einzelzimmer."});
  if(f("etf")&&alter<50)prem.push({id:"etf",l:"ETF-Depot",g:"Zinseszinseffekt frühzeitig nutzen."});
  if(f("rechtsschutz"))prem.push({id:"rechtsschutz",l:"Rechtsschutz",g:"Schutz bei arbeitsrechtlichen und verkehrsrechtlichen Streitigkeiten."});
  return{basis,empf,prem};
}

function buildT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a)=>({padding:"9px 12px",borderRadius:"6px",border:`1px solid ${a?C:"#e8e8e8"}`,background:a?C:"#fff",fontSize:"12px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"}) }; }
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

export default function Bedarfscheck(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => buildT(C), [C]);
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[profil,setProfil]=useState({alter:"",fs:"",kinder:0,beruf:"",wohnen:""});
  const[vorhanden,setVorhanden]=useState([]);
  const[gewaehlt,setGewaehlt]=useState("");
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const set=(k,v)=>setProfil(x=>({...x,[k]:v}));
  const toggleV=(id)=>setVorhanden(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const ok=profil.alter&&profil.fs&&profil.beruf&&profil.wohnen;
  const pakete=ok?berechnePakete(profil,vorhanden):null;

  if(danke)return(
    <div style={{...T.page,"--accent":C}}><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Bedarfscheck</span></div>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir bereiten das Gespräch mit Ihrem Ergebnis vor und melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );

  // Phase 4: Kontakt
  if(phase===4){
    const valid=fd.name.trim()&&fd.email.trim();
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Bedarfscheck</span></div>
        <div style={T.prog}><div style={T.progFil(100)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Gespräch vereinbaren</div><div style={{...T.h1}}>{`Paket „${gewaehlt}“ besprechen`}</div><div style={T.body}>Wir bereiten Ihr persönliches Angebot vor.</div></div>
        {MAKLER.isDemoMode ? (
          <DemoCTA slug={MAKLER.slug} />
        ) : (
        <div style={T.section}>
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"0"}}/></div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#ccc",marginTop:"10px",marginBottom:"100px"}}>Vertraulich behandelt.</div>
        </div>
        )}
        {!MAKLER.isDemoMode && (
        <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={()=>{if(valid){setDanke(true);}}} disabled={!valid}>Gespräch anfragen</button><button style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
        )}
      </div>
    );
  }

  // Phase 3: Pakete
  if(phase===3&&pakete){
    const PaketCard=({titel,sub,items,highlight,onWaehlen})=>(
      <div style={{border:`1px solid ${highlight?C:"#e8e8e8"}`,borderRadius:"10px",overflow:"hidden",marginBottom:"10px"}}>
        {highlight&&<div style={{background:C,padding:"5px 14px",fontSize:"11px",fontWeight:"600",color:"#fff",letterSpacing:"0.3px"}}>Empfohlen</div>}
        <div style={{padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
            <div><div style={{fontSize:"15px",fontWeight:"700",color:"#111"}}>{titel}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>{sub}</div></div>
          </div>
          {items.length===0?<div style={{fontSize:"13px",color:"#059669",padding:"4px 0"}}>Alle Produkte dieser Kategorie bereits vorhanden.</div>:items.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"10px"}}>
              <div style={{width:"5px",height:"5px",borderRadius:"50%",background:C,marginTop:"6px",flexShrink:0}}/>
              <div><div style={{fontSize:"13px",fontWeight:"500",color:"#111"}}>{item.l}</div><div style={{fontSize:"12px",color:"#888",marginTop:"2px",lineHeight:1.5}}>{item.g}</div></div>
            </div>
          ))}
          <button onClick={onWaehlen} style={{width:"100%",padding:"10px",marginTop:"4px",background:highlight?C:"#f5f5f5",color:highlight?"#fff":C,borderRadius:"7px",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}>Paket wählen</button>
        </div>
      </div>
    );
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Bedarfscheck</span></div>
        <div style={T.prog}><div style={T.progFil(80)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Ihre Empfehlung</div><div style={T.h1}>3 Pakete für Ihre Situation</div><div style={T.body}>Berechnet auf Basis Ihres Profils und Ihrer bestehenden Verträge.</div></div>
        <div style={T.section}>
          <PaketCard titel="Basis" sub="Unverzichtbare Grundabsicherung" items={pakete.basis} highlight={false} onWaehlen={()=>{setGewaehlt("Basis");goTo(4);}}/>
          <PaketCard titel="Empfohlen" sub="Basis + sinnvolle Ergänzungen" items={pakete.empf} highlight={true} onWaehlen={()=>{setGewaehlt("Empfohlen");goTo(4);}}/>
          <PaketCard titel="Premium" sub="Vollständige Rundumabsicherung" items={pakete.prem} highlight={false} onWaehlen={()=>{setGewaehlt("Premium");goTo(4);}}/>
        </div>
        <div style={T.footer}><button style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></div>
      </div>
    );
  }

  // Phase 2: Bestand
  if(phase===2){
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Bedarfscheck</span></div>
        <div style={T.prog}><div style={T.progFil(55)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Schritt 2 von 3 · Bestehende Verträge</div><div style={T.h1}>Was haben Sie bereits?</div><div style={T.body}>Wählen Sie alle vorhandenen Versicherungen. Nicht vorhandene werden als Lücke behandelt.</div></div>
        {SPARTEN.map(sp=>{
          const prods=PRODUKTE.filter(p=>p.sp===sp);
          return(
            <div key={sp} style={T.section}>
              <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px"}}>{sp}</div>
              <div style={T.card}>
                {prods.map((prod,i)=>{
                  const a=vorhanden.includes(prod.id);
                  return(
                    <div key={prod.id} onClick={()=>toggleV(prod.id)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"13px 16px",background:a?`${C}06`:"#fff",borderBottom:i<prods.length-1?"1px solid #f0f0f0":"none",cursor:"pointer"}}>
                      <div style={{width:"20px",height:"20px",borderRadius:"5px",border:`1.5px solid ${a?C:"#ddd"}`,background:a?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                        {a&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontSize:"13px",fontWeight:a?"500":"400",color:a?"#111":"#444"}}>{prod.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{padding:"0 24px",marginBottom:"120px"}}>
          <div style={T.infoBox}>Nicht sicher? Einfach weitergehen — fehlende Verträge werden als Bedarf gewertet.</div>
        </div>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Pakete berechnen{vorhanden.length>0?` · ${vorhanden.length} vorhanden`:""}</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      </div>
    );
  }

  // Phase 1: Profil
  const Opt=({k,opts,cols=3})=><div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:"8px",marginTop:"8px"}}>{opts.map(([v,l])=><button key={v} style={T.optBtn(profil[k]===v)} onClick={()=>set(k,v)}>{l}</button>)}</div>;
  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Bedarfscheck</span></div>
      <div style={T.prog}><div style={T.progFil(20)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>Schritt 1 von 3 · Ihr Profil</div><div style={T.h1}>Welche Versicherungen brauche ich?</div><div style={T.body}>Persönliche Empfehlung in 3 Schritten — für Ihre Situation berechnet.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}>
            <label style={T.fldLbl}>Ihr Alter</label>
            <input type="number" min="18" max="80" placeholder="z. B. 34" value={profil.alter} onChange={e=>set("alter",parseInt(e.target.value)||"")} style={{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"}}/>
          </div>
          <div style={T.row}><label style={T.fldLbl}>Familienstand</label><Opt k="fs" opts={[["single","Single"],["paar","Paar"],["familie","Familie"]]}/></div>
          {(profil.fs==="familie"||profil.fs==="paar")&&<div style={T.row}><label style={T.fldLbl}>Kinder</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"8px",marginTop:"8px"}}>{[0,1,2,3].map(n=><button key={n} style={T.optBtn(profil.kinder===n)} onClick={()=>set("kinder",n)}>{n===0?"Keine":n===3?"3+":String(n)}</button>)}</div></div>}
          <div style={T.row}><label style={T.fldLbl}>Berufsstatus</label><Opt k="beruf" opts={[["angestellt","Angestellt"],["selbst","Selbstständig"],["beamter","Beamter/in"],["nicht_berufst.","Nicht berufst."]]}/></div>
          <div style={T.rowLast}><label style={T.fldLbl}>Wohnsituation</label><Opt k="wohnen" opts={[["mieter","Mieter"],["eigen","Eigentümer"]]} cols={2}/></div>
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(!ok)} onClick={()=>ok&&goTo(2)} disabled={!ok}>Bestehende Verträge eingeben</button><div style={{textAlign:"center",fontSize:"11px",color:"#ccc",marginTop:"8px"}}>{!ok?"Bitte alle Felder ausfüllen":"Profil vollständig"}</div></div>
    </div>
  );
}
