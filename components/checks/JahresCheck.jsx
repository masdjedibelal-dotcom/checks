import { useMemo, useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard, CheckRow } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();
const WARN="#c0392b";

const SPARTEN=[
  {id:"sachen",l:"Sachen & Wohnen",beschr:"Was passiert mit meiner Wohnung und meinem Eigentum?",prods:["Privathaftpflicht","Hausratversicherung","Wohngebäudeversicherung","Rechtsschutzversicherung","Kfz-Versicherung","E-Bike / Fahrrad"]},
  {id:"einkommen",l:"Einkommen & Arbeitskraft",beschr:"Was wenn ich nicht mehr arbeiten kann?",prods:["Berufsunfähigkeitsversicherung","Erwerbsunfähigkeitsversicherung","Krankentagegeld","Unfallversicherung"]},
  {id:"gesundheit",l:"Gesundheit",beschr:"Was passiert wenn ich krank werde?",prods:["Private Krankenversicherung (PKV)","Zahnzusatzversicherung","Krankenhauszusatzversicherung","Ambulante Zusatzversicherung","Pflegezusatzversicherung","Auslandskrankenversicherung"]},
  {id:"familie",l:"Familie & Existenz",beschr:"Was passiert mit meiner Familie?",prods:["Risikolebensversicherung","Sterbegeldversicherung","Privathaftpflicht"]},
  {id:"vorsorge",l:"Vorsorge & Vermögen",beschr:"Wie baue ich Vermögen auf?",prods:["Altersvorsorge / private Rentenversicherung","Riester-Rente","Rürup-Rente","Betriebliche Altersvorsorge (bAV)","Sparen & Investieren","Bausparvertrag"]},
];
const EREIGNISSE=[
  {id:"umzug",l:"Umzug oder Hauskauf"},
  {id:"heirat",l:"Heirat oder Trennung"},
  {id:"nachwuchs",l:"Nachwuchs / Geburt"},
  {id:"elternzeit",l:"Elternzeit"},
  {id:"jobwechsel",l:"Jobwechsel / Gehaltssprung"},
  {id:"selbst",l:"Selbstständig gemacht"},
  {id:"immobilie",l:"Immobilie gekauft"},
  {id:"pflege",l:"Pflege eines Angehörigen"},
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


function makeJahresCheckT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"'Inter','Helvetica Neue',Helvetica,Arial,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"}};}
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}

export default function JahresCheck(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makeJahresCheckT(C),[C]);
  const isDemo = isCheckDemoMode();
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[prods,setProds]=useState([]);const[events,setEvents]=useState([]);
  const[kontaktConsent,setKontaktConsent]=useState(false);
  const[offene,setOffene]=useState(["sachen"]);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[kontext,setKontext]=useState({housingStatus:"",employmentStatus:"",familyStatus:""});
  const setK=(k,v)=>setKontext(x=>({...x,[k]:v}));
  const toggleProd=(id)=>setProds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleEv=(id)=>setEvents(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleOffen=(id)=>setOffene(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const E=buildEmpfehlungen(events,prods,kontext);


  if(danke)return(
    <div style={{...T.page,"--accent":C}}><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Jahrescheck</span></div>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir bereiten das Gespräch mit Ihren Ergebnissen vor und melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>setDanke(false)} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>
  );

  // Phase 4: Kontakt
  if(phase===4){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Jahresgespräch</span></div>
      <div style={T.prog}><div style={T.progFil(100)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>Gespräch vereinbaren</div><div style={T.h1}>Wir bereiten alles vor</div><div style={T.body}>Ihr Ergebnis wird mit dem Gesprächstermin verknüpft — so können wir direkt loslegen.</div></div>
      {isDemo ? (
        <>
          <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
              Das ist eine Live-Vorschau — so sieht Ihr Kunde das Tool.
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
          {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
            <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"4px"}}/></div>
          ))}
        </div>
        <div style={{marginTop:"14px",marginBottom:"100px"}}>
          <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"lebenssituations-check",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setDanke(true);}} disabled={!valid}>Termin vereinbaren</button><button style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
      </>
      )}
    </div>);
  }

  // Phase 3: Ergebnis
  if(phase===3){
    const total=E.anpassen.length+E.abschliessen.length;
    const HinweisCard=({item,accentColor})=>(
      <div style={{padding:"13px 16px",borderLeft:`3px solid ${accentColor}`,background:"#fff",
        borderBottom:"1px solid #f5f5f5"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}>
          <span style={{fontSize:"10px",fontWeight:"700",color:accentColor,letterSpacing:"0.5px",
            textTransform:"uppercase",padding:"1px 7px",background:`${accentColor}10`,borderRadius:"20px"}}>
            {item.vorhanden?"Anpassen":"Neu abschließen"}
          </span>
          {item.h&&<span style={{fontSize:"10px",fontWeight:"700",color:WARN,letterSpacing:"0.5px",
            textTransform:"uppercase",padding:"1px 7px",background:`${WARN}10`,borderRadius:"20px"}}>Dringend</span>}
        </div>
        <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"3px"}}>{item.p}</div>
        <div style={{fontSize:"12px",color:"#555",lineHeight:1.55,marginBottom:"4px"}}>{item.t}</div>
        <div style={{fontSize:"11px",color:"#bbb"}}>Anlass: {item.ereignis}</div>
      </div>
    );
    return(<div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Lebenssituations-Check</span></div>
      <div style={T.prog}><div style={T.progFil(80)}/></div>
      {/* Zusammenfassung */}
      <div style={{margin:"20px 24px 0",padding:"14px 16px",background:`${C}08`,borderRadius:"10px",border:`1px solid ${C}20`}}>
        <div style={{fontSize:"11px",fontWeight:"600",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px"}}>Zusammenfassung</div>
        <div style={{fontSize:"14px",color:"#111",lineHeight:1.55}}>
          {total===0&&E.ergaenzen.length===0
            ?"Auf Basis Ihrer Angaben gibt es aktuell keine dringenden Änderungen."
            :`Auf Basis Ihrer Angaben ergeben sich ${total>0?`${total} wichtige ${total===1?"Anpassung":"Anpassungen"}`:""}${total>0&&E.ergaenzen.length>0?" und ":""}${E.ergaenzen.length>0?`${E.ergaenzen.length} neue${E.ergaenzen.length===1?"s Thema":" Themen"}`:""}.`}
        </div>
      </div>

      {/* Elternzeit-Sonderblock */}
      {events.includes("elternzeit")&&(
        <div style={{...T.section,marginTop:"16px"}}>
          <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"}}>
            <div style={{padding:"10px 16px",background:"#f7f8ff",borderBottom:"1px solid #f0f0f0"}}>
              <div style={{fontSize:"11px",fontWeight:"700",color:C,letterSpacing:"0.5px",textTransform:"uppercase"}}>Finanzielle Veränderung in der Elternzeit</div>
            </div>
            <div style={{padding:"13px 16px"}}>
              <div style={{fontSize:"12px",color:"#555",lineHeight:1.65,marginBottom:"10px"}}>
                Während der Elternzeit ersetzt das Elterngeld in der Regel ca. 65 % des letzten Nettoeinkommens — maximal 1.800 € pro Monat. Krankentagegeld und Krankengeld ruhen in dieser Zeit, da keine Arbeitspflicht besteht. Für Selbstständige und nach Wiederaufnahme der Arbeit gelten Sonderregelungen.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                {[
                  {l:"Elterngeld",v:"65 % des Nettos",sub:"max. 1.800 €/Mon."},
                  {l:"Lücke",v:"ca. 35 %",sub:"aus Einkommen/Vermögen"},
                  {l:"Dauer",v:"bis 14 Mon.",sub:"Basis-Elterngeld"},
                ].map(({l,v,sub},i)=>(
                  <div key={i} style={{textAlign:"center",padding:"8px",background:"#f9f9f9",borderRadius:"7px"}}>
                    <div style={{fontSize:"13px",fontWeight:"700",color:"#333"}}>{v}</div>
                    <div style={{fontSize:"10px",color:C,fontWeight:"600",marginTop:"2px"}}>{l}</div>
                    <div style={{fontSize:"10px",color:"#aaa",marginTop:"1px"}}>{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"8px"}}>Grobe Orientierung — individuelle Werte können abweichen.</div>
            </div>
          </div>
        </div>
      )}

      {/* Block 1: Jetzt prüfen — Anpassungen dringender Einträge */}
      {E.anpassen.length>0&&(
        <div style={{...T.section,marginTop:"20px"}}>
          <div style={{fontSize:"11px",fontWeight:"700",color:WARN,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Das sollten Sie jetzt prüfen</div>
          <div style={T.card}>
            {E.anpassen.map((item,i,arr)=>(
              <div key={i} style={{borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
                <HinweisCard item={item} accentColor={item.h?WARN:C}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block 2: Für Ihre Situation relevant — neue Abschlüsse */}
      {E.abschliessen.length>0&&(
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:C,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Das ist für Ihre Situation relevant</div>
          <div style={T.card}>
            {E.abschliessen.map((item,i,arr)=>(
              <div key={i} style={{borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
                <HinweisCard item={item} accentColor={item.h?WARN:C}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block 3: Ergänzungen */}
      {E.ergaenzen.length>0&&(
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#aaa",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Das kann zusätzlich sinnvoll sein</div>
          <div style={T.card}>
            {E.ergaenzen.map((item,i,arr)=>(
              <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
                <div style={{fontSize:"13px",fontWeight:"500",color:"#333",marginBottom:"2px"}}>{item.p}</div>
                <div style={{fontSize:"12px",color:"#888",lineHeight:1.5}}>{item.t}</div>
                <div style={{fontSize:"11px",color:"#ccc",marginTop:"3px"}}>Anlass: {item.ereignis}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total===0&&E.ergaenzen.length===0&&(
        <div style={{...T.section,marginTop:"20px"}}><div style={T.infoBox}>Ihre Verträge sind auf dem aktuellen Stand — beim Jahresgespräch prüfen wir Details gemeinsam.</div></div>
      )}
      <div style={{padding:"0 24px",marginBottom:"120px"}}>
        <div style={T.infoBox}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(4)}>Gespräch vereinbaren</button><button style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></div>
    </div>);
  }

  // Phase 2: Lebensereignisse — Card Grid
  if(phase===2){
    const EV_ICONS={
      umzug:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10.5L10 3l7 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 17V11h4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11h4v6h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      heirat:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16s-7-4.5-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 17 7c0 4.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      nachwuchs:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 17c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="14.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M14.5 7v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      elternzeit:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="15" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3"/><path d="M13.5 11.5c0-1.5 1.5-2 3-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
      jobwechsel:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 4l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      selbst:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 4l1.5 1.5L14 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      immobilie:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 17h16M4 17V9.5L10 4l6 5.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="7.5" y="12" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
      pflege:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 17s-6-3.5-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 16 9c0 4.5-6 8-6 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 9v4M8 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    };
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Schritt 2 / 3</span></div>
        <div style={T.prog}><div style={T.progFil(60)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Schritt 2 von 3 · Lebenssituation</div><div style={T.h1}>Was bewegt Sie gerade?</div><div style={T.body}>Alles Zutreffende antippen — das Tool passt sich Ihrer Situation an.</div></div>
        <div style={{padding:"0 20px",marginBottom:"16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            {EREIGNISSE.map(ev=>(
              <SelectionCard
                key={ev.id}
                value={ev.id}
                label={ev.l}
                icon={EV_ICONS[ev.id]||<svg width="20" height="20" viewBox="0 0 20 20"/>}
                selected={events.includes(ev.id)}
                accent={C}
                onClick={()=>toggleEv(ev.id)}
              />
            ))}
          </div>
        </div>
        <div style={{padding:"0 20px",marginBottom:"120px"}}>
          <div style={T.infoBox}>Keine Änderungen? Trotzdem fortfahren — wir prüfen ob Ihre Verträge noch aktuell sind.</div>
          {events.length>0&&<div style={{marginTop:"8px",fontSize:"12px",color:C,fontWeight:"500",textAlign:"center"}}>{events.length} Ereignis{events.length!==1?"se":""} ausgewählt</div>}
        </div>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Ergebnis anzeigen{events.length>0?` · ${events.length} ausgewählt`:""}</button><button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button></div>
      </div>
    );
  }

    // Phase 1: Bestand + Kontext
  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Lebenssituations-Check</span></div>
      <div style={T.prog}><div style={T.progFil(30)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>Schritt 1 von 3 · Bestandsaufnahme</div><div style={T.h1}>Was haben Sie bereits?</div><div style={T.body}>Vorhandene Versicherungen antippen — wird für Ihre persönliche Auswertung genutzt.</div></div>
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
                {sp.prods.map((prod,i)=>(
                  <CheckRow
                    key={prod}
                    label={prod}
                    checked={prods.includes(prod)}
                    accent={C}
                    showDivider={i<sp.prods.length-1}
                    onClick={()=>toggleProd(prod)}
                  />
                ))}
              </div>}
            </div>
          </div>
        );
      })}
      <div style={{padding:"0 20px",marginBottom:"8px"}}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"12px"}}>Kurze Angaben zur Situation</div>
        {/* Wohnsituation */}
        <div style={{marginBottom:"14px"}}>
          <div style={{fontSize:"12px",fontWeight:"600",color:"#555",marginBottom:"8px"}}>Wohnsituation</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {v:"mieter",l:"Mieter",d:"Mietwohnung oder zur Miete",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="7" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M1 7.5L8 2l7 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>},
              {v:"eigentuemer",l:"Eigentümer",d:"Haus oder Eigentumswohnung",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 15h12M4 15V8L8 3l4 5v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="10" width="4" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/></svg>},
              {v:"",l:"Sonstiges",d:"z. B. WG, Untermiete, Sonderfall",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>},
            ].map(({v,l,d,icon})=>(
              <SelectionCard
                key={v||"sonst"}
                value={v||"sonst"}
                label={l}
                description={d}
                icon={icon}
                selected={v===""?kontext.housingStatus==="":kontext.housingStatus===v}
                accent={C}
                onClick={()=>setK("housingStatus",v)}
              />
            ))}
          </div>
        </div>
        {/* Berufsstatus */}
        <div style={{marginBottom:"14px"}}>
          <div style={{fontSize:"12px",fontWeight:"600",color:"#555",marginBottom:"8px"}}>Berufsstatus</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {v:"angestellt",l:"Angestellt",d:"Festanstellung oder ähnlich",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6V5a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>},
              {v:"selbstständig",l:"Selbstständig",d:"Freiberufler, Gewerbe, GmbH-Gesellschafter",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 2l1.2 1.2L11.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
            ].map(({v,l,d,icon})=>(
              <SelectionCard
                key={v}
                value={v}
                label={l}
                description={d}
                icon={icon}
                selected={kontext.employmentStatus===v}
                accent={C}
                onClick={()=>setK("employmentStatus",v)}
              />
            ))}
          </div>
        </div>
        {/* Familienstand */}
        <div>
          <div style={{fontSize:"12px",fontWeight:"600",color:"#555",marginBottom:"8px"}}>Familienstand</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {v:"ledig",l:"Ledig",d:"Alleinstehend ohne Partner",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>},
              {v:"partnerschaft",l:"Partner",d:"Verheiratet, verpartnert oder feste Beziehung",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-2.5 2-4.5 4.5-4.5S10 11.5 10 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10.5 9.5c2.5 0 4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>},
              {v:"mit_kindern",l:"Kinder",d:"Ein oder mehrere Kinder im Haushalt",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.5 2.2-4.5 5-4.5S11 10.5 11 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="12" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M11 13c0-1.5 1-2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>},
            ].map(({v,l,d,icon})=>(
              <SelectionCard
                key={v}
                value={v}
                label={l}
                description={d}
                icon={icon}
                selected={kontext.familyStatus===v}
                accent={C}
                onClick={()=>setK("familyStatus",v)}
              />
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"0 24px",marginBottom:"120px"}}><div style={T.infoBox}>Nicht sicher? Einfach weitergehen — im nächsten Schritt sehen Sie was sich verändert hat.</div></div>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Weiter zu den Lebensereignissen{prods.length>0?` · ${prods.length} vorhanden`:""}</button></div>
    </div>
  );
}
