import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();
const EREIGNISSE=[
  {id:"nachwuchs",l:"Nachwuchs",display:"🍼 Nachwuchs ist unterwegs oder da"},
  {id:"jobwechsel",l:"Jobwechsel",display:"💼 Ich habe den Job gewechselt oder mehr verdient"},
  {id:"heirat",l:"Heirat / Trennung",display:"💍 Ich habe geheiratet oder mich getrennt"},
  {id:"immobilie",l:"Immobilienkauf",display:"🏠 Ich habe eine Immobilie gekauft"},
  {id:"elternzeit",l:"Elternzeit",display:"👶 Ich bin in Elternzeit"},
  {id:"selbst",l:"Selbstständigkeit",display:"🚀 Ich habe mich selbstständig gemacht"},
  {id:"pflege",l:"Pflege Angehöriger",display:"👴 Ich pflege jemanden aus meiner Familie"},
  {id:"umzug",l:"Umzug",display:"📦 Ich bin umgezogen"},
];

// ─── MATRIX — bestandsabhängig + kontextbewusst ───────────────────────────────
// Jeder Eintrag: p=Produktname, tVorhanden=Text wenn vorhanden, tNeu=Text wenn fehlt,
// h=dringend, condition={housingStatus?,employmentStatus?,familyStatus?}
const MATRIX={
  umzug:{
    b:[
      {p:"Hausratversicherung",h:true,tVorhanden:"Neue Adresse und Wohnfläche melden — sonst droht Unterversicherung.",tNeu:"Hausratversicherung abschließen — schützt Ihr Hab und Gut am neuen Ort."},
      {p:"Wohngebäudeversicherung",h:true,tVorhanden:"Auf neues Objekt umschreiben — Elementarschutz prüfen.",tNeu:"Wohngebäudeversicherung ist Pflicht bei Immobilienbesitz.",condition:{housingStatus:"eigentuemer"}},
      {p:"Kfz-Versicherung",h:false,tVorhanden:"Neue Adresse melden — Regionalklasse kann sich ändern und die Prämie beeinflussen.",tNeu:"Kfz-Versicherung für Ihr Fahrzeug abschließen."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Mietrechtliche Streitigkeiten sind häufig — Rechtsschutz schützt Sie."},
    ]
  },
  heirat:{
    b:[
      {p:"Privathaftpflicht",h:true,tVorhanden:"Partner aufnehmen — viele Tarife bieten kostenlose Familienerweiterung.",tNeu:"Familienhaftpflicht abschließen — schützt Sie und Ihren Partner."},
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Bezugsrecht auf Partner prüfen und Versicherungssumme anpassen.",tNeu:"Gegenseitige Absicherung — jetzt essenziell."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Familienrechtsschutz deckt Streitigkeiten rund um Ehe und Unterhalt."},
      {p:"Riester-Rente",h:false,tNeu:"Als Ehepaar können beide Riester nutzen — Zulagen doppelt mitnehmen."},
    ]
  },
  nachwuchs:{
    b:[
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Deine Risikolebensversicherung sollte an deine neue familiäre Situation angepasst werden.",tNeu:"Mit einem Kind ist eine finanzielle Absicherung deiner Familie besonders wichtig."},
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Prüfe, ob deine BU-Rente ausreichend ist, um deine Familie abzusichern.",tNeu:"Deine Arbeitskraft ist jetzt die wichtigste finanzielle Grundlage für deine Familie."},
      {p:"Krankenhauszusatzversicherung",h:false,tVorhanden:"Deine Gesundheitsabsicherung kann für deine Familie erweitert werden.",tNeu:"Zusätzliche Gesundheitsleistungen können für dein Kind sinnvoll sein."},
      {p:"Privathaftpflicht",h:true,tVorhanden:"Kind in die bestehende Familienhaftpflicht aufnehmen.",tNeu:"Familienhaftpflicht abschließen — Kinder haften selbst nicht, Sie schon."},
    ],
    n:[
      {p:"Pflegezusatzversicherung",h:false,tNeu:"Eine frühzeitige Absicherung im Pflegefall kann langfristig sinnvoll sein."},
      {p:"Altersvorsorge / private Rentenversicherung",h:false,tNeu:"Mit einem Kind steigt die Bedeutung einer stabilen Altersvorsorge."},
    ]
  },
  kfz:{
    b:[
      {p:"Kfz-Versicherung",h:true,tVorhanden:"Neues Fahrzeug anmelden, Kasko-Stufe und SF-Klasse prüfen.",tNeu:"Kfz-Versicherung für das neue Fahrzeug abschließen."},
    ],
    n:[
      {p:"E-Bike / Fahrrad",h:true,tNeu:"E-Bikes sind nicht automatisch über Hausrat versichert — separate Police prüfen."},
    ]
  },
  jobwechsel:{
    b:[
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Deine BU-Rente sollte an dein neues Einkommen angepasst werden.",tNeu:"Mit steigendem Einkommen wächst auch die Absicherungslücke deiner Arbeitskraft."},
      {p:"Krankentagegeld",h:true,tVorhanden:"Prüfe dein Krankentagegeld – es sollte zu deinem aktuellen Einkommen passen.",tNeu:"Ohne ausreichendes Krankentagegeld kann dein Einkommen bei Krankheit deutlich sinken."},
      {p:"Altersvorsorge / private Rentenversicherung",h:true,tVorhanden:"Deine Altersvorsorge kann an dein höheres Einkommen angepasst werden.",tNeu:"Ein höheres Einkommen bietet die Chance, gezielt Vermögen aufzubauen."},
    ],
    n:[
      {p:"Private Krankenversicherung (PKV)",h:false,tNeu:"Mit höherem Einkommen kann ein Wechsel in die PKV eine Option sein – abhängig von deiner Situation.",condition:{employmentStatus:"angestellt"}},
      {p:"Sparen & Investieren",h:false,tNeu:"Ein Teil deines höheren Einkommens kann gezielt für Vermögensaufbau genutzt werden."},
    ]
  },
  elternzeit:{
    b:[
      {p:"Krankentagegeld",h:true,tVorhanden:"Während der Elternzeit ruht der KTG-Anspruch in der Regel — prüfe mit deiner Versicherung, ob Beiträge angepasst oder ausgesetzt werden können.",tNeu:"Ohne KTG besteht nach der Elternzeit beim Wiedereinstieg kein Schutz — vor allem für Selbstständige ist der Abschluss vor der Geburt wichtig."},
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"BU-Schutz bleibt in der Elternzeit bestehen — prüfe ob Beitragsstundung möglich ist und ob die Nachversicherungsgarantie bei Geburt genutzt werden kann.",tNeu:"Jetzt abschließen ist wichtig: Nach der Elternzeit steigt das Eintrittsalter und es folgen neue Gesundheitsfragen — Schutz wird teurer oder schwieriger."},
      {p:"Altersvorsorge / private Rentenversicherung",h:false,tVorhanden:"Deine Altersvorsorge sollte überprüft werden, da Beiträge während der Elternzeit reduziert sein können.",tNeu:"Während der Elternzeit entstehen oft Lücken in der Altersvorsorge."},
    ],
    n:[
      {p:"Risikolebensversicherung",h:true,tNeu:"Mit einem Kind steigt die finanzielle Verantwortung – eine Risikolebensversicherung kann sinnvoll sein."},
    ]
  },
  selbst:{
    b:[
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Vertrag prüfen — manche Policen schränken Schutz für Selbstständige ein.",tNeu:"Kein gesetzlicher BU-Schutz mehr — jetzt absichern."},
      {p:"Krankentagegeld",h:true,tVorhanden:"Tagessatz prüfen — als Selbstständiger kein gesetzliches Krankengeld.",tNeu:"Ab Tag 1 kein Krankengeld mehr — Krankentagegeld ist existenziell."},
    ],
    n:[
      {p:"Rürup-Rente",h:true,tNeu:"Rürup ist ideal für Selbstständige — bis 27.566 € jährlich steuerlich absetzbar (2025)."},
      {p:"Pflegezusatzversicherung",h:false,tNeu:"Eigene Pflegevorsorge aufbauen — kein gesetzliches Sicherheitsnetz mehr."},
    ]
  },
  immobilie:{
    b:[
      {p:"Wohngebäudeversicherung",h:true,tVorhanden:"Auf neues Objekt umschreiben — Elementarschutz und Versicherungssumme prüfen.",tNeu:"Wohngebäudeversicherung ist Pflicht — ohne sie keine Finanzierung."},
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Versicherungssumme auf aktuellen Darlehensbetrag prüfen und anpassen.",tNeu:"Immobilienfinanzierung absichern — Darlehen läuft auch wenn Sie sterben."},
      {p:"Hausratversicherung",h:false,tVorhanden:"Wohnfläche und Wertsachen melden — Unterversicherung nach Umzug häufig.",tNeu:"Hausrat für neue Immobilie abschließen."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Eigentümerrechtsschutz deckt Streitigkeiten mit Mietern, Handwerkern und Behörden."},
    ]
  },
  pflege:{
    b:[
      {p:"Pflegezusatzversicherung",h:true,tVorhanden:"Eigene Absicherung prüfen — Pflegefall im Umfeld erhöht Bewusstsein für eigenes Risiko.",tNeu:"Pflegelücke analysieren — gesetzlich werden nur ca. 50% der echten Kosten gedeckt."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Pflegerechtliche Streitigkeiten nehmen zu — Rechtsschutz kann entlasten."},
      {p:"Vorsorgevollmacht / Patientenverfügung",h:false,tNeu:"Nicht direkt Versicherung, aber essenziell: Vorsorgevollmacht und Patientenverfügung regeln."},
    ]
  },
};

// ─── EMPF-LOGIK — bestandsabhängig + kontextbewusst ──────────────────────────
function buildEmpfehlungen(events, prods, kontext) {
  const prodSet = new Set(prods);
  const anpassen = []; // vorhanden → anpassen
  const abschliessen = []; // nicht vorhanden → neu
  const ergaenzen = [];    // n-Liste

  for (const eid of events) {
    const m = MATRIX[eid];
    if (!m) continue;
    const ereignisLabel = EREIGNISSE.find(e => e.id === eid)?.l || eid;

    // b-Liste: Bestandsanpassungen
    for (const item of (m.b || [])) {
      // Kontext-Bedingung prüfen
      if (item.condition) {
        const { housingStatus, employmentStatus, familyStatus } = item.condition;
        if (housingStatus && kontext.housingStatus !== housingStatus) continue;
        if (employmentStatus && kontext.employmentStatus !== employmentStatus) continue;
        if (familyStatus && kontext.familyStatus !== familyStatus) continue;
      }
      const vorhanden = prodSet.has(item.p);
      const ziel = vorhanden ? anpassen : abschliessen;
      // Duplikate vermeiden
      if (!ziel.find(x => x.p === item.p && x.ereignis === ereignisLabel)) {
        ziel.push({
          p: item.p,
          t: vorhanden ? item.tVorhanden : item.tNeu,
          h: item.h,
          vorhanden,
          ereignis: ereignisLabel,
        });
      }
    }

    // n-Liste: Ergänzungen (nur wenn Produkt noch nicht vorhanden)
    for (const item of (m.n || [])) {
      if (item.condition) {
        const { housingStatus, employmentStatus, familyStatus } = item.condition;
        if (housingStatus && kontext.housingStatus !== housingStatus) continue;
        if (employmentStatus && kontext.employmentStatus !== employmentStatus) continue;
        if (familyStatus && kontext.familyStatus !== familyStatus) continue;
      }
      if (!prodSet.has(item.p) && !ergaenzen.find(x => x.p === item.p)) {
        ergaenzen.push({ p: item.p, t: item.tNeu, h: item.h, ereignis: ereignisLabel });
      }
    }
  }

  // Sortierung: dringend zuerst
  const sortH = arr => [...arr.filter(x => x.h), ...arr.filter(x => !x.h)];
  return { anpassen: sortH(anpassen), abschliessen: sortH(abschliessen), ergaenzen };
}


function makeJahresCheckT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},
resultHero:{padding:"52px 24px 40px",textAlign:"center",background:"#fff"},
resultEyebrow:{fontSize:"12px",fontWeight:"500",color:"#9CA3AF",letterSpacing:"0.2px",marginBottom:"14px"},
resultNumber:(C2)=>({fontSize:"52px",fontWeight:"800",color:C2,letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"}),
resultUnit:{fontSize:"14px",color:"#9CA3AF",marginBottom:"18px"},
resultSub:{fontSize:"13px",color:"#9CA3AF",lineHeight:1.55,marginTop:"12px"},
statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
statusOk:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#15803D"},
statusInfo:(C2)=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:`${C2}0d`,border:`1px solid ${C2}33`,borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:C2}),
cardPrimary:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"20px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 6px 24px rgba(17,24,39,0.08)"},
cardContext:{background:"#FAFAF8",border:"1px solid rgba(17,24,39,0.05)",borderRadius:"16px",padding:"18px 20px"},
warnCard:{background:"#FFF6F5",border:"1px solid #F2D4D0",borderLeft:"3px solid #C0392B",borderRadius:"14px",padding:"18px 20px"},
sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"},
};}
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

// ─── 6 konkrete Ereignisse (ohne Intro-Screen) ────────────────────────────────
const SIMPLE_EVENTS_DEF = [
  { id: "nachwuchs",  l: "Nachwuchs",           sub: "Kind unterwegs oder neu da",      icon: "🍼", evIds: ["nachwuchs"] },
  { id: "jobwechsel", l: "Jobwechsel",           sub: "Neuer Arbeitgeber",               icon: "💼", evIds: ["jobwechsel"] },
  { id: "gehalt",     l: "Gehalt gestiegen",     sub: "Deutlich mehr Einkommen",         icon: "📈", evIds: ["jobwechsel"] }, // gleiche Matrix
  { id: "immobilie",  l: "Immobilie",            sub: "Kauf oder Eigenheim",             icon: "🏠", evIds: ["immobilie"] },
  { id: "trennung",   l: "Trennung",             sub: "Scheidung oder Trennung",         icon: "💔", evIds: ["heirat"] },     // Familienmatrix
  { id: "selbst",     l: "Selbstständigkeit",    sub: "Freiberuflich oder Gewerbe",      icon: "🚀", evIds: ["selbst"] },
];

// ─── Konkrete Produkte (nicht Bereiche!) ──────────────────────────────────────
const PRODUKT_ITEMS = [
  { id: "bu",           name: "BU / Berufsunfähigkeit",  icon: "💼", matrixNames: ["Berufsunfähigkeitsversicherung", "Erwerbsunfähigkeitsversicherung"] },
  { id: "haftpflicht",  name: "Privathaftpflicht",       icon: "🛡️", matrixNames: ["Privathaftpflicht"] },
  { id: "altersvorsorge",name:"Altersvorsorge",          icon: "🌱", matrixNames: ["Altersvorsorge / private Rentenversicherung", "Riester-Rente", "Rürup-Rente"] },
  { id: "risikoleben",  name: "Risikoleben",             icon: "❤️", matrixNames: ["Risikolebensversicherung"] },
  { id: "pflege",       name: "Pflegezusatz",            icon: "🏥", matrixNames: ["Pflegezusatzversicherung"] },
  { id: "kv",           name: "Krankenversicherung",     icon: "⚕️", matrixNames: ["Private Krankenversicherung (PKV)"] },
];
export default function JahresCheck(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makeJahresCheckT(C),[C]);
  const isDemo = isCheckDemoMode();
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[loading,setLoading]=useState(false);
  const[prods,setProds]=useState([]);const[events,setEvents]=useState([]);
  const[kontaktConsent,setKontaktConsent]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[kontext]=useState({housingStatus:"",employmentStatus:"",familyStatus:""});
  const[scr,setScr]=useState(1);
  const[selEvKats,setSelEvKats]=useState([]);
  const[selProdukte,setSelProdukte]=useState([]);
  const toggleSimpleEv=(catId)=>{const cat=SIMPLE_EVENTS_DEF.find(c=>c.id===catId);if(!cat)return;setSelEvKats(p=>{const next=p.includes(catId)?p.filter(x=>x!==catId):[...p,catId];setEvents(SIMPLE_EVENTS_DEF.filter(c=>next.includes(c.id)).flatMap(c=>c.evIds));return next;});};
  const toggleProdukt=(prodId)=>{const prod=PRODUKT_ITEMS.find(p=>p.id===prodId);if(!prod)return;setSelProdukte(p=>{const next=p.includes(prodId)?p.filter(x=>x!==prodId):[...p,prodId];setProds(PRODUKT_ITEMS.filter(p=>next.includes(p.id)).flatMap(p=>p.matrixNames));return next;});};
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);if(ph===1){setLoading(false);setScr(1);}};
  const E=buildEmpfehlungen(events,prods,kontext);
  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  if(danke)return(
    <div style={{...T.page,"--accent":C}}><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Lebenssituations-Check</span></div>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>{setDanke(false);goTo(1);}} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neuen Check starten</button>
    </div></div>
  );

  if(loading)return(
    <div style={{...T.page,"--accent":C}} key={ak}>
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Lebenssituations-Check</span></div>
      <div style={T.prog}><div style={T.progFil(100)}/></div>
      <CheckLoader type="jahrescheck" onComplete={()=>{setLoading(false);goTo(3);}}/>
    </div>
  );

  // Phase 4: Kontakt
  if(phase===4){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Jahresgespräch</span></div>
      <div style={T.prog}><div style={T.progFil(100)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>Fast geschafft</div><div style={T.h1}>Wo können wir dich erreichen?</div><div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis.</div></div>
      {isDemo ? (
        <>
          <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
              Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.
            </div>
            <button
              type="button"
              style={{ ...T.btnPrim(false) }}
              onClick={() =>
                window.parent.postMessage(
                  { type: "openConfig", slug: "lebenssituations-check" },
                  "*",
                )
              }
            >
              Anpassen & kaufen
            </button>
          </div>
          <div style={T.footer}><button type="button" style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
        </>
      ) : (
      <>
      <div style={T.section}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"tel",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"4px"}}/>{hint&&<div style={T.fldHint}>{hint}</div>}</div>
            ))}
        </div>
        <div style={{marginTop:"14px",marginBottom:"100px"}}>
          <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"lebenssituations-check",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setDanke(true);}} disabled={!valid}>{valid?"Situation gemeinsam prüfen":"Bitte alle Angaben machen"}</button><button style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
      </>
      )}
    </div>);
  }

  // ── Phase 3: Ergebnis — 3 Prioritäts-Blöcke ──────────────────────────────
  if (phase === 3) {
    // Mapping: dringende Items → Jetzt relevant; nicht-dringende → Prüfen; ergaenzen → Optional
    const jetztRelevant = [...E.anpassen.filter(x => x.h), ...E.abschliessen.filter(x => x.h)];
    const pruefen       = [...E.anpassen.filter(x => !x.h), ...E.abschliessen.filter(x => !x.h)];
    const optionalItems = E.ergaenzen;
    const totalCount    = jetztRelevant.length + pruefen.length + optionalItems.length;

    const ItemCard = ({ item, accentColor, badge }) => (
      <div style={{ padding: "14px 18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentColor, flexShrink: 0, marginTop: "6px" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937" }}>{item.p}</div>
            {badge && <span style={{ fontSize: "10px", fontWeight: "700", color: accentColor, background: accentColor + "14", border: `1px solid ${accentColor}33`, borderRadius: "20px", padding: "1px 7px", letterSpacing: "0.3px" }}>{badge}</span>}
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55, marginBottom: "3px" }}>{item.t}</div>
          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Anlass: {item.ereignis}</div>
        </div>
      </div>
    );

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG /></div><span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{MAKLER.firma}</span></div><span style={T.badge}>Lebenssituations-Check</span></div>
        <div style={T.prog}><div style={T.progFil(88)} /></div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Ihre aktuelle Situation</div>
          <div style={T.resultNumber(totalCount > 0 ? C : "#059669")}>{totalCount === 0 ? "✓" : totalCount}</div>
          <div style={T.resultUnit}>{totalCount === 0 ? "kein Handlungsbedarf erkannt" : `relevante Punkt${totalCount !== 1 ? "e" : ""}`}</div>
          {totalCount === 0
            ? <div style={T.statusOk}>Alles in Ordnung</div>
            : jetztRelevant.length > 0
              ? <div style={T.statusWarn}>Handlungsbedarf erkannt</div>
              : <div style={T.statusInfo(C)}>Prüfbedarf erkannt</div>
          }
          <div style={T.resultSub}>auf Basis Ihrer Angaben · nicht verbindlich</div>
        </div>

        {/* ── Visual: 3 Blöcke ──────────────────────────────────────────────── */}
        {totalCount > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>Ihre Prioritäten im Überblick</div>
            <div style={{ border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", overflow: "hidden" }}>
              {[
                { label: "🔴 Jetzt relevant", count: jetztRelevant.length, color: "#C0392B", bg: "#FFF6F5" },
                { label: "🟡 Prüfen",         count: pruefen.length,       color: "#D97706", bg: "#FFFBEB" },
                { label: "⚪ Optional",        count: optionalItems.length, color: "#6B7280", bg: "#FAFAF8" },
              ].filter(b => b.count > 0).map(({ label, count, color, bg }, i, arr) => (
                <div key={label} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none", background: bg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color }}>{label}</span>
                  <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{count} Punkt{count !== 1 ? "e" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Block 1: Was sich verändert hat ───────────────────────────────── */}
        {selEvKats.length > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>Was sich verändert hat</div>
            <div style={T.cardContext}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selEvKats.map(id => {
                  const ev = SIMPLE_EVENTS_DEF.find(e => e.id === id);
                  return ev ? (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#fff", border: "1px solid rgba(17,24,39,0.08)", borderRadius: "20px" }}>
                      <span style={{ fontSize: "16px" }}>{ev.icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#1F2937" }}>{ev.l}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "10px", lineHeight: 1.5 }}>Diese Ereignisse beeinflussen Ihre bestehende und notwendige Absicherung.</div>
            </div>
          </div>
        )}

        {/* ── Block 2: Jetzt relevant ───────────────────────────────────────── */}
        {jetztRelevant.length > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>🔴 Jetzt relevant — direkte Risiken</div>
            <div style={T.cardPrimary}>
              {jetztRelevant.map((item, i, arr) => (
                <div key={i} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none" }}>
                  <ItemCard item={item} accentColor="#C0392B" badge={item.vorhanden ? "Anpassen" : "Fehlend"} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Block 3: Prüfen ───────────────────────────────────────────────── */}
        {pruefen.length > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>🟡 Prüfen — Anpassung sinnvoll</div>
            <div style={T.cardPrimary}>
              {pruefen.map((item, i, arr) => (
                <div key={i} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none" }}>
                  <ItemCard item={item} accentColor="#D97706" badge={item.vorhanden ? "Anpassen" : "Prüfen"} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Block 4: Optional ─────────────────────────────────────────────── */}
        {optionalItems.length > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>⚪ Optional — sinnvolle Ergänzungen</div>
            <div style={T.cardContext}>
              {optionalItems.map((item, i, arr) => (
                <div key={i} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937", marginBottom: "3px" }}>{item.p}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55 }}>{item.t}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "3px" }}>Anlass: {item.ereignis}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalCount === 0 && (
          <div style={{ ...T.section, marginTop: "20px" }}><div style={T.infoBox}>Gut so — aktuell kein dringender Handlungsbedarf erkannt.</div></div>
        )}

        {/* ── Was das bedeutet ──────────────────────────────────────────────── */}
        {totalCount > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>Das kann sinnvoll sein</div>
            <div style={T.cardContext}>
              <div style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.7 }}>
                Lebensereignisse verändern Ihren Absicherungsbedarf — bestehende Verträge müssen häufig angepasst, neue Risiken neu abgesichert werden. Ein Gespräch klärt, was konkret zu tun ist.
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: "0 24px", marginBottom: "120px" }}>
          <CheckBerechnungshinweis>
            <>Die Empfehlungen basieren auf einer <strong>Ereignis-Matrix</strong>: Jedes Lebensereignis löst definierte Prüfpunkte aus — sortiert nach Dringlichkeit. <span style={{ color: "#b8884a" }}>Grundlage: Anlassbezogene Beratungsempfehlungen. Keine individuelle Rechtsberatung.</span></>
          </CheckBerechnungshinweis>
          <div style={T.infoBox}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={() => goTo(4)}>Situation gemeinsam prüfen</button>
          <button style={T.btnSec} onClick={() => { setScr(2); goTo(1); }}>Zurück</button>
        </div>
      </div>
    );
  }


  // ── Phase 1: Eingabe (2 Screens, kein Intro) ──────────────────────────────
  const nextScr = () => { if (scr < 2) { setScr(s => s + 1); } else { setLoading(true); } };
  const backScr = () => { if (scr > 1) { setScr(s => s - 1); } };
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <div style={T.header}>
        <div style={T.logo}><div style={T.logoMk}><LogoSVG /></div><span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{MAKLER.firma}</span></div>
        <span style={T.badge}>Schritt {scr} / 2</span>
      </div>
      <div style={T.prog}><div style={T.progFil(scr * 44)} /></div>

      {/* Screen 1: Was hat sich verändert? */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Lebenssituations-Check · 1 / 2</div>
          <div style={T.h1}>Was hat sich bei Ihnen verändert?</div>
          <div style={T.body}>Alles Zutreffende auswählen — mehreres möglich.</div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {SIMPLE_EVENTS_DEF.map(ev => {
              const sel = selEvKats.includes(ev.id);
              return (
                <SelectionCard key={ev.id} value={ev.id} label={ev.l} description={ev.sub}
                  icon={<span style={{ fontSize: "22px", lineHeight: 1 }}>{ev.icon}</span>}
                  selected={sel} accent={C} onClick={() => toggleSimpleEv(ev.id)} />
              );
            })}
          </div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "120px" }}>
          <div style={T.infoBox}>Nichts Zutreffendes dabei? Einfach weitergehen — wir prüfen ob Ihre Absicherung noch passt.</div>
          {selEvKats.length > 0 && <div style={{ marginTop: "8px", fontSize: "12px", color: C, fontWeight: "500", textAlign: "center" }}>{selEvKats.length} Ereignis{selEvKats.length !== 1 ? "se" : ""} ausgewählt</div>}
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter{selEvKats.length > 0 ? ` · ${selEvKats.length} ausgewählt` : ""}</button>
        </div>
      </>}

      {/* Screen 2: Was ist bereits vorhanden? (konkrete Produkte) */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Lebenssituations-Check · 2 / 2</div>
          <div style={T.h1}>Was haben Sie bereits abgesichert?</div>
          <div style={T.body}>Alles antippen, was vorhanden ist — auch wenn Sie unsicher sind.</div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {PRODUKT_ITEMS.map(prod => {
              const sel = selProdukte.includes(prod.id);
              return (
                <SelectionCard key={prod.id} value={prod.id} label={prod.name}
                  icon={<span style={{ fontSize: "22px", lineHeight: 1 }}>{prod.icon}</span>}
                  selected={sel} accent={C} onClick={() => toggleProdukt(prod.id)} />
              );
            })}
          </div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "120px" }}>
          {selProdukte.length > 0 && <div style={{ fontSize: "12px", color: C, fontWeight: "500", textAlign: "center" }}>{selProdukte.length} Produkt{selProdukte.length !== 1 ? "e" : ""} vorhanden</div>}
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Mein Ergebnis ansehen</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}
    </div>
  );
}
