import { useState } from "react";
import { SelectionCard, CheckRow } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();

const MAKLER={name:"Max Mustermann",firma:"Mustermann Versicherungen",email:"kontakt@mustermann-versicherungen.de",telefon:"089 123 456 78",primaryColor:"#1a3a5c"};
const C=MAKLER.primaryColor,OK="#059669";

// ─── DATA: Produktuniversum ────────────────────────────────────────────────────
// ─── RISK-FIRST SCORING: Basisgewichte nach Risikohierarchie ─────────────────
const RISK_WEIGHTS={existenz:100,einkommen:80,langfristig:60,situativ:40,optimierung:20};

const PRODUCTS=[
  // Level 1 — EXISTENZBEDROHEND
  {id:"privathaftpflicht",name:"Privathaftpflicht",riskLevel:"existenz",
    visibilityRules:()=>true,
    scoreModifiers:({age,familyStatus})=>{let s=0;if(familyStatus==="mit_kindern")s+=15;if(familyStatus==="verheiratet")s+=8;if(age<=25)s+=10;return s;},
    shortDescription:"Schützt vor Schadensersatzforderungen Dritter — oft in Millionenhöhe.",
    reasonBuilder:({familyStatus,age})=>{if(familyStatus==="mit_kindern")return"Kinder haften nicht für Schäden — Sie als Elternteil schon. Ohne Haftpflicht drohen existenzbedrohende Forderungen.";if(age<=25)return"Ein einziges Missgeschick kann ohne Haftpflicht Ihre gesamte finanzielle Zukunft gefährden.";return"Die wichtigste Versicherung überhaupt — schützt Ihr gesamtes Vermögen vor Schadensersatzklagen.";}},
  {id:"berufsunfaehigkeit",name:"Berufsunfähigkeitsversicherung",riskLevel:"existenz",
    visibilityRules:({age,employmentStatus})=>age<=60&&employmentStatus!=="sonstiges",
    scoreModifiers:({age,jobType,netIncome,familyStatus,employmentStatus})=>{let s=0;if(jobType==="koerperlich")s+=20;if(jobType==="medizinisch_sozial")s+=10;if(age>=18&&age<=35)s+=15;else if(age<=45)s+=8;if(netIncome==="over_6000"||netIncome==="4000_6000")s+=10;if(familyStatus==="mit_kindern")s+=12;if(familyStatus==="verheiratet")s+=8;if(employmentStatus==="selbstständig")s+=15;return s;},
    shortDescription:"Sichert Ihr Einkommen, wenn Sie Ihren Beruf nicht mehr ausüben können.",
    reasonBuilder:({jobType,employmentStatus,age,familyStatus})=>{if(jobType==="koerperlich")return"Körperliche Berufe tragen das höchste BU-Risiko — jeder 4. Arbeitnehmer wird vor der Rente berufsunfähig.";if(employmentStatus==="selbstständig")return"Als Selbstständiger gibt es keinen gesetzlichen Schutz bei Berufsunfähigkeit — Ihr Einkommen bricht komplett weg.";if(familyStatus==="mit_kindern")return"Ihr Einkommen trägt die Familie. Fällt es dauerhaft weg, trifft das alle — jetzt absichern.";if(age<=30)return"Je früher abgesichert, desto günstiger die Prämie — und die Gesundheitsprüfung ist einfacher.";return"Psychische Erkrankungen und Rückenprobleme sind häufigste BU-Ursachen. Kein Berufsfeld ist ausgenommen.";}},
  {id:"erwerbsunfaehigkeit",name:"Erwerbsunfähigkeitsversicherung",riskLevel:"existenz",
    visibilityRules:({age,jobType,employmentStatus})=>age>=35&&(jobType==="koerperlich"||jobType==="sonstiges"||employmentStatus==="sonstiges"),
    scoreModifiers:({jobType})=>jobType==="koerperlich"?15:5,
    shortDescription:"Absicherung wenn Sie gar keiner Arbeit mehr nachgehen können — als Alternative zur BU.",
    reasonBuilder:()=>"Wenn eine BU-Versicherung nicht mehr abschließbar ist, ist die EU-Rente oft die entscheidende Alternative — schützt vor dem vollständigen Einkommensverlust."},

  // Level 2 — EINKOMMEN / ABHÄNGIGKEIT
  {id:"krankentagegeld",name:"Krankentagegeld",riskLevel:"einkommen",
    visibilityRules:({employmentStatus})=>["angestellt","selbstständig","ausbildung_studium"].includes(employmentStatus),
    scoreModifiers:({employmentStatus,netIncome,healthStatus})=>{let s=0;if(employmentStatus==="selbstständig")s+=40;if(healthStatus==="pkv")s+=20;if(netIncome==="over_6000"||netIncome==="4000_6000")s+=12;if(netIncome==="2500_4000")s+=6;return s;},
    shortDescription:"Sichert Ihr Nettoeinkommen ab, wenn Sie längere Zeit krankgeschrieben sind.",
    reasonBuilder:({employmentStatus})=>employmentStatus==="selbstständig"?"Als Selbstständiger bricht Ihr Einkommen ab Tag 1 der Krankheit weg — ohne Krankentagegeld kein Auffangnetz.":"Ab der 7. Krankheitswoche sinkt das gesetzliche Krankengeld deutlich unter Ihr bisheriges Netto."},
  {id:"risikoleben",name:"Risikolebensversicherung",riskLevel:"einkommen",
    visibilityRules:({familyStatus,housingStatus})=>familyStatus==="mit_kindern"||familyStatus==="verheiratet"||familyStatus==="partnerschaft"||housingStatus==="eigentuemer",
    scoreModifiers:({familyStatus,housingStatus,netIncome})=>{let s=0;if(familyStatus==="mit_kindern")s+=40;if(familyStatus==="verheiratet")s+=25;if(familyStatus==="partnerschaft")s+=15;if(housingStatus==="eigentuemer")s+=20;if(netIncome==="over_6000"||netIncome==="4000_6000")s+=10;return s;},
    shortDescription:"Schützt Ihre Familie finanziell, wenn Sie nicht mehr da sind.",
    reasonBuilder:({familyStatus,housingStatus})=>familyStatus==="mit_kindern"?"Ihre Familie ist finanziell von Ihnen abhängig — ohne Sie müssten sie ihren Lebensstandard drastisch senken.":housingStatus==="eigentuemer"?"Eine laufende Immobilienfinanzierung wird nicht kleiner, wenn der Hauptverdiener stirbt.":"Auch ohne Kinder: Wer gemeinsame Verpflichtungen trägt, sollte seinen Partner absichern."},

  // Level 3 — LANGFRISTIGE RISIKEN
  {id:"altersvorsorge",name:"Private Altersvorsorge",riskLevel:"langfristig",
    visibilityRules:({age})=>age<=62,
    scoreModifiers:({age,netIncome,employmentStatus})=>{let s=0;if(age>=36&&age<=50)s+=20;if(age>=51)s+=30;if(age<=25)s+=5;if(netIncome==="over_6000"||netIncome==="4000_6000")s+=12;if(employmentStatus==="selbstständig")s+=18;return s;},
    shortDescription:"Die gesetzliche Rente reicht nicht — private Vorsorge schließt die Lücke.",
    reasonBuilder:({age,employmentStatus})=>{if(employmentStatus==="selbstständig")return"Als Selbstständiger zahlen Sie meist keine gesetzliche Rente — private Vorsorge ist Ihre einzige Altersabsicherung.";if(age>=50)return"Je näher die Rente, desto dringender die Optimierung — jetzt zählt jeder Euro.";if(age<=30)return"Früh starten lohnt sich: Wer mit 25 beginnt, muss monatlich weit weniger einzahlen als mit 40.";return"Die Rentenlücke ist real und wächst — ohne private Vorsorge droht deutlicher Kaufkraftverlust im Alter.";}},
  {id:"pflegezusatz",name:"Pflegezusatzversicherung",riskLevel:"langfristig",
    visibilityRules:({age})=>age>=35,
    scoreModifiers:({age})=>age>=50?30:age>=40?18:8,
    shortDescription:"Gesetzliche Pflege deckt nur die Hälfte der echten Kosten — die Lücke ist riesig.",
    reasonBuilder:({age})=>age>=50?"Pflege wird mit zunehmendem Alter das größte finanzielle Risiko — und Prämien steigen stark mit dem Alter.":age>=40?"Jetzt ist der optimale Zeitpunkt: Prämien noch günstig, Gesundheitsprüfung unkompliziert.":"Wer früh absichert, zahlt deutlich weniger — und schützt damit auch seine Familie vor Belastungen."},

  // Level 4 — SITUATIVE RISIKEN
  {id:"wohngebaeude",name:"Wohngebäudeversicherung",riskLevel:"situativ",
    visibilityRules:({housingStatus})=>housingStatus==="eigentuemer",
    scoreModifiers:()=>25,
    shortDescription:"Schützt Ihr Gebäude vor Feuer, Sturm, Leitungswasser und mehr.",
    reasonBuilder:()=>"Das Gebäude ist meist das größte Vermögenswert — ein Brandschaden ohne Versicherung kann in Minuten alles vernichten."},
  {id:"hausrat",name:"Hausrat",riskLevel:"situativ",
    visibilityRules:({housingStatus})=>housingStatus!=="eltern_wg",
    scoreModifiers:({housingStatus,netIncome})=>{let s=0;if(housingStatus==="eigentuemer")s+=15;if(housingStatus==="mieter")s+=8;if(netIncome==="over_6000"||netIncome==="4000_6000")s+=8;return s;},
    shortDescription:"Schützt Ihr Hab und Gut bei Einbruch, Feuer und Wasserschaden.",
    reasonBuilder:({housingStatus})=>housingStatus==="eigentuemer"?"Als Eigentümer haben Sie mehr zu schützen — Hausrat und Gebäude ergänzen sich.":"Einbruch oder Wasserschaden: Was in Jahren angeschafft wurde, ist in Sekunden weg."},

  // Level 5 — OPTIMIERUNG
  {id:"pkv",name:"Private Krankenversicherung",riskLevel:"optimierung",
    visibilityRules:({healthStatus,employmentStatus,netIncome})=>{if(healthStatus==="pkv")return false;if(employmentStatus==="verbeamtet")return true;if(employmentStatus==="selbstständig")return true;if(netIncome==="over_6000"||netIncome==="4000_6000")return true;return false;},
    scoreModifiers:({employmentStatus,netIncome,age})=>{let s=0;if(employmentStatus==="verbeamtet")s+=55;if(employmentStatus==="selbstständig"&&age<=40)s+=20;if(netIncome==="over_6000")s+=15;if(age>=45)s-=15;return s;},
    shortDescription:"Bessere Leistungen, freie Arztwahl und für die richtige Zielgruppe oft günstiger.",
    reasonBuilder:({employmentStatus})=>employmentStatus==="verbeamtet"?"Als Beamter steht Ihnen Beihilfe zu — die PKV ist für Sie fast immer die bessere und günstigere Wahl.":"Mit Ihrem Einkommen und Status kann die PKV deutlich bessere Leistungen zu ähnlichen Kosten bieten."},
  {id:"zahnzusatz",name:"Zahnzusatzversicherung",riskLevel:"optimierung",
    visibilityRules:({healthStatus})=>healthStatus==="gkv"||healthStatus==="unsicher",
    scoreModifiers:({age})=>age<=30?5:age<=45?12:18,
    shortDescription:"Die GKV übernimmt nur einen Bruchteil — guter Zahnersatz kostet schnell tausende Euro.",
    reasonBuilder:({age})=>age>=40?"Ab 40 steigt der Bedarf für Zahnersatz deutlich — jetzt absichern ist günstiger als später zahlen.":"GKV-Leistungen bei Zahnersatz sind begrenzt — eine Zusatzversicherung schützt vor unerwarteten Kosten."},
  {id:"krankenhauszusatz",name:"Krankenhauszusatz",riskLevel:"optimierung",
    visibilityRules:({healthStatus})=>healthStatus==="gkv"||healthStatus==="unsicher",
    scoreModifiers:({age,netIncome})=>{let s=0;if(age>=40)s+=10;if(netIncome==="over_6000"||netIncome==="4000_6000")s+=8;return s;},
    shortDescription:"Chefarztbehandlung und Einzelzimmer — wenn es wirklich darauf ankommt.",
    reasonBuilder:()=>"Im Krankenhaus entscheidet die Versicherung oft über Komfort und Qualität der Behandlung."},
  {id:"ambulante_zusatz",name:"Ambulante Zusatzversicherung",riskLevel:"optimierung",
    visibilityRules:({healthStatus})=>healthStatus==="gkv"||healthStatus==="unsicher",
    scoreModifiers:({age})=>age>=35?8:3,
    shortDescription:"Heilpraktiker, Sehhilfen, Vorsorge — was die GKV nicht zahlt.",
    reasonBuilder:()=>"Viele Gesundheitsleistungen werden von der GKV gar nicht oder nur teilweise erstattet — die Zusatzversicherung schließt diese Lücken."},
  {id:"unfall",name:"Unfallversicherung",riskLevel:"optimierung",
    visibilityRules:()=>true,
    scoreModifiers:({jobType,familyStatus,age})=>{let s=0;if(jobType==="koerperlich")s+=22;if(familyStatus==="mit_kindern")s+=15;if(age<=30)s+=8;return s;},
    shortDescription:"Zahlt eine Kapitalleistung bei dauerhaften Unfallfolgen — auch in der Freizeit.",
    reasonBuilder:({jobType,familyStatus})=>jobType==="koerperlich"?"In körperlichen Berufen ist das Unfallrisiko deutlich erhöht — auch außerhalb der Arbeit.":familyStatus==="mit_kindern"?"Kinder verunglücken häufiger — eine Familienpolice schützt alle auf einmal.":"Die gesetzliche UV gilt nur auf dem Arbeitsweg und am Arbeitsplatz — privat sind Sie ungeschützt."},
  {id:"rechtsschutz",name:"Rechtsschutzversicherung",riskLevel:"optimierung",
    visibilityRules:()=>true,
    scoreModifiers:({employmentStatus,familyStatus,housingStatus})=>{let s=0;if(employmentStatus==="angestellt")s+=8;if(familyStatus==="mit_kindern")s+=5;if(housingStatus==="mieter"||housingStatus==="eigentuemer")s+=5;return s;},
    shortDescription:"Deckt Anwalts- und Gerichtskosten — damit Sie Ihr Recht auch durchsetzen können.",
    reasonBuilder:({employmentStatus})=>employmentStatus==="angestellt"?"Arbeitsrechtliche Streitigkeiten sind häufiger als gedacht — ein Anwalt kostet schnell mehrere tausend Euro.":"Ob Mietstreit oder Nachbarschaftskonflikt — ohne Rechtsschutz überlegt man zweimal, ob man sein Recht durchsetzt."},
  {id:"sparen_investieren",name:"Sparen & Investieren",riskLevel:"optimierung",
    visibilityRules:({age})=>age<=58,
    scoreModifiers:({netIncome,age})=>{let s=0;if(netIncome==="over_6000")s+=25;if(netIncome==="4000_6000")s+=15;if(netIncome==="2500_4000")s+=5;if(age<=35)s+=10;return s;},
    shortDescription:"Vermögen systematisch aufbauen — ETF-Sparplan, Fonds oder andere Anlageformen.",
    reasonBuilder:({netIncome})=>netIncome==="over_6000"?"Mit Ihrem Einkommen haben Sie das Potenzial, neben der Absicherung echtes Vermögen aufzubauen.":"Wer monatlich einen festen Betrag anlegt, profitiert langfristig vom Zinseszinseffekt."},
];

// ─── LOGIC: Risk-First Scoring + Package Builder ──────────────────────────────
const EXISTENZ_IDS=["privathaftpflicht","berufsunfaehigkeit","erwerbsunfaehigkeit"];
const OPTIMIERUNG_IDS=["pkv","zahnzusatz","krankenhauszusatz","ambulante_zusatz","unfall","rechtsschutz","sparen_investieren"];
function runScoringEngine(profil,existing){
  const existingSet=new Set(existing);
  const alreadyCovered=PRODUCTS
    .filter(p=>existingSet.has(p.id))
    .map(p=>({id:p.id,name:p.name,riskLevel:p.riskLevel}));

  // 1–3: sichtbar + nicht vorhanden + score
  let scored=PRODUCTS
    .filter(p=>!existingSet.has(p.id))
    .filter(p=>p.visibilityRules(profil))
    .map(p=>{
      const base=RISK_WEIGHTS[p.riskLevel]||20;
      const mod=typeof p.scoreModifiers==="function"?p.scoreModifiers(profil):(p.scoreModifiers||0);
      return{id:p.id,name:p.name,riskLevel:p.riskLevel,score:base+mod,
        shortDescription:p.shortDescription,reason:p.reasonBuilder(profil)};
    });

  // 4: Harte Overrides
  const hatExistenzLuecke=scored.some(c=>EXISTENZ_IDS.includes(c.id));
  const istErwerbstaetig=["angestellt","selbstständig","verbeamtet","ausbildung_studium"].includes(profil.employmentStatus);

  scored=scored.map(c=>{
    if(c.id==="privathaftpflicht")          return{...c,score:999};  // Regel 2
    if(c.id==="berufsunfaehigkeit"&&istErwerbstaetig) return{...c,score:Math.max(c.score,200)};  // Regel 3
    if(hatExistenzLuecke&&OPTIMIERUNG_IDS.includes(c.id)) return{...c,score:Math.min(c.score,19)};  // Regel 1+9
    return c;
  });
  // Regel 7: sparen_investieren nur ohne Existenzlücke
  if(hatExistenzLuecke) scored=scored.filter(c=>c.id!=="sparen_investieren");

  // 5: Sortieren
  scored.sort((a,b)=>b.score-a.score);

  // 6: Package Builder — kumulativ, harte Gesamtlimits: 2 / 3 / 5
  // Top 2 → Basis
  const basisPackage=scored.slice(0,2);

  // Top 3 gesamt → Plus (Basis ⊂ Plus)
  const plusPackage=scored.slice(0,3);

  // Top 5 gesamt → Komplett (Plus ⊂ Komplett)
  const completePackage=scored.slice(0,5);

  return{basisPackage,plusPackage,completePackage,alreadyCovered};
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const T={page:{minHeight:"100vh",background:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?C:"#e8e8e8"}`,background:a?C:"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"}),infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6}};
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
function Header({progPct=0}){return(<><div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>Bedarfscheck</span></div><div style={T.prog}><div style={T.progFil(progPct)}/></div></>);}

// Phase 1
const EMP_OPTS=[["angestellt","Angestellt"],["selbstständig","Selbstständig"],["verbeamtet","Verbeamtet"],["ausbildung_studium","Ausbildung/Studium"],["sonstiges","Sonstiges"]];
const JOB_OPTS=[["buero","Büro / Home Office"],["koerperlich","Körperlich"],["medizinisch_sozial","Medizin/Sozial"],["technisch_it","Technik/IT"],["sonstiges","Sonstiges"]];
const INC_OPTS=[["under_1500","< 1.500 €"],["1500_2500","1.500–2.500 €"],["2500_4000","2.500–4.000 €"],["4000_6000","4.000–6.000 €"],["over_6000","> 6.000 €"]];
const FAM_OPTS=[["ledig","Ledig"],["partnerschaft","Partnerschaft"],["verheiratet","Verheiratet"],["mit_kindern","Mit Kindern"]];
const HSG_OPTS=[["eltern_wg","Eltern/WG"],["mieter","Mieter"],["eigentuemer","Eigentümer"]];
const KV_OPTS=[["gkv","GKV"],["pkv","PKV"],["unsicher","Unklar"]];

function Phase1({profil,set,onWeiter}){
  const Opts=({k,opts,cols=2})=><div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:"8px"}}>{opts.map(([v,l])=><SelectionCard key={v} value={v} label={l} selected={profil[k]===v} accent={C} onClick={()=>set(k,v)}/>)}</div>;
  const ok=profil.age&&profil.employmentStatus&&profil.netIncome&&profil.familyStatus&&profil.housingStatus&&profil.healthStatus;
  return(<div style={{...T.page,"--accent":C}} className="fade-in"><Header progPct={25}/>
    <div style={T.hero}><div style={T.eyebrow}>Schritt 1 von 2</div><div style={T.h1}>Welche Versicherungen brauche ich?</div><div style={T.body}>Wenige Angaben — persönliche Empfehlung in unter 2 Minuten.</div></div>
    <div style={T.section}><div style={T.card}>
      <div style={T.row}><label style={T.fldLbl}>Ihr Alter (18–65)</label><input type="text" inputMode="numeric" placeholder="z. B. 34" value={profil.age||""} onChange={e=>set("age",e.target.value.replace(/\D/g,""))} onBlur={e=>{const v=parseInt(e.target.value)||"";set("age",v>=18&&v<=65?v:"");}} style={{...T.inputEl}}/></div>
      <div style={T.row}><label style={T.fldLbl}>Berufsstatus</label><Opts k="employmentStatus" opts={EMP_OPTS}/></div>
      {profil.employmentStatus&&profil.employmentStatus!=="sonstiges"&&<div style={T.row}><label style={T.fldLbl}>Berufsart</label><Opts k="jobType" opts={JOB_OPTS}/></div>}
      <div style={T.row}><label style={T.fldLbl}>Monatliches Nettoeinkommen</label><Opts k="netIncome" opts={INC_OPTS} cols={2}/></div>
      <div style={T.row}><label style={T.fldLbl}>Familienstand</label><Opts k="familyStatus" opts={FAM_OPTS} cols={2}/></div>
      <div style={T.row}><label style={T.fldLbl}>Wohnsituation</label><Opts k="housingStatus" opts={HSG_OPTS} cols={3}/></div>
      <div style={T.rowLast}><label style={T.fldLbl}>Krankenversicherung</label><Opts k="healthStatus" opts={KV_OPTS} cols={3}/></div>
    </div></div>
    <div style={{height:"120px"}}/>
    <div style={T.footer}><button style={T.btnPrim(!ok)} disabled={!ok} onClick={()=>ok&&onWeiter()}>Bestehende Verträge eingeben</button>{!ok&&<div style={{textAlign:"center",fontSize:"11px",color:"#ccc",marginTop:"8px"}}>Bitte alle Felder ausfüllen</div>}</div>
  </div>);}

// Phase 2
const EX_GROUPS=[
  {label:"Sachen & Wohnen",items:[{id:"privathaftpflicht",name:"Privathaftpflicht"},{id:"hausrat",name:"Hausrat"},{id:"wohngebaeude",name:"Wohngebäude"},{id:"rechtsschutz",name:"Rechtsschutz"}]},
  {label:"Einkommen & Zukunft",items:[{id:"berufsunfaehigkeit",name:"Berufsunfähigkeit (BU)"},{id:"erwerbsunfaehigkeit",name:"Erwerbsunfähigkeit (EU)"},{id:"krankentagegeld",name:"Krankentagegeld"},{id:"altersvorsorge",name:"Private Altersvorsorge"}]},
  {label:"Gesundheit",items:[{id:"pkv",name:"Private Krankenversicherung"},{id:"zahnzusatz",name:"Zahnzusatz"},{id:"krankenhauszusatz",name:"Krankenhauszusatz"},{id:"ambulante_zusatz",name:"Ambulante Zusatz"},{id:"pflegezusatz",name:"Pflegezusatz"}]},
  {label:"Familie & Vermögen",items:[{id:"unfall",name:"Unfallversicherung"},{id:"risikoleben",name:"Risikolebensversicherung"},{id:"sparen_investieren",name:"Sparen & Investieren"}]},
];
function Phase2({existing,toggle,onWeiter,onZurueck}){
  return(<div style={{...T.page,"--accent":C}} className="fade-in"><Header progPct={60}/>
    <div style={T.hero}><div style={T.eyebrow}>Schritt 2 von 2</div><div style={T.h1}>Was haben Sie bereits?</div><div style={T.body}>Vorhandene Versicherungen werden nicht erneut empfohlen.</div></div>
    {EX_GROUPS.map(group=>(
      <div key={group.label} style={T.section}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px"}}>{group.label}</div>
        <div style={T.card}>
          {group.items.map((item,i)=>(
            <CheckRow
              key={item.id}
              label={item.name}
              checked={existing.includes(item.id)}
              accent={C}
              showDivider={i < group.items.length - 1}
              onClick={()=>toggle(item.id)}
            />
          ))}
        </div>
      </div>
    ))}
    <div style={{padding:"0 24px",marginBottom:"8px"}}><div style={T.infoBox}>Nicht sicher? Einfach weitergehen — nicht ausgewählte Produkte werden als möglicher Bedarf gewertet.</div></div>
    <div style={{height:"120px"}}/>
    <div style={T.footer}><button style={T.btnPrim(false)} onClick={onWeiter}>Meine Empfehlung ansehen{existing.length>0?` · ${existing.length} vorhanden`:""}</button><button style={T.btnSec} onClick={onZurueck}>Zurück</button></div>
  </div>);}

// Phase 3: Ergebnis — Fintech Carousel
// ─── PAKET-DEFINITIONEN ───────────────────────────────────────────────────────
const PAKETE_DEFS=[
  {key:"basisPackage",label:"Essentieller Schutz",badge:null,
   stripe:"#e0e0e0",
   desc:"Die wichtigsten Absicherungen — kompakt und klar.",
   btnBg:"#f5f5f5",btnTxt:"#333",btnBorder:"1px solid #e0e0e0"},
  {key:"plusPackage",label:"Starker Rundumschutz",badge:"Empfohlen",
   stripe:C,
   desc:"Bewährtester Schutz für Ihre Situation — Basis plus die wichtigsten Ergänzungen.",
   btnBg:C,btnTxt:"#fff",btnBorder:"none"},
  {key:"completePackage",label:"Maximale Sicherheit",badge:null,
   stripe:"#2d2d2d",
   desc:"Vollständig abgesichert — alle relevanten Bereiche auf einmal.",
   btnBg:"#1a1a1a",btnTxt:"#fff",btnBorder:"none"},
];

function PackageBadge({text,stripe}){
  if(!text)return null;
  return(<span style={{display:"inline-flex",alignItems:"center",gap:"4px",
    padding:"2px 9px",background:`${stripe}18`,borderRadius:"20px",
    border:`1px solid ${stripe}44`,marginBottom:"10px",
    fontSize:"10px",fontWeight:"700",color:stripe,letterSpacing:"0.5px",textTransform:"uppercase"}}>
    {text}
  </span>);}

function PackageCard({def,items,active,onCTA}){
  const isRecommended=def.key==="plusPackage";
  return(<div style={{
    background:"#fff",
    border:`1px solid ${active?"#e0e0e0":"#ebebeb"}`,
    borderRadius:"14px",overflow:"hidden",
    display:"flex",flexDirection:"column",
    borderLeft:`3px solid ${def.stripe}`,
    transform:active?"scale(1.02)":"scale(0.97)",
    boxShadow:active
      ?(isRecommended?`0 12px 40px ${C}28`:"0 6px 20px rgba(0,0,0,0.08)")
      :"none",
    opacity:active?1:0.72,
    transition:"transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
  }}>
    {/* Header */}
    <div style={{padding:"18px 18px 14px",background:"#fff"}}>
      <PackageBadge text={def.badge} stripe={def.stripe}/>
      <div style={{fontSize:"16px",fontWeight:"700",color:"#111",letterSpacing:"-0.3px",marginBottom:"4px"}}>
        {def.label}
      </div>
      <div style={{fontSize:"12px",color:"#888",lineHeight:1.5}}>{def.desc}</div>
      <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"10px",
        paddingTop:"10px",borderTop:"1px solid #f0f0f0"}}>
        <span style={{width:"6px",height:"6px",borderRadius:"50%",background:def.stripe,flexShrink:0,display:"inline-block"}}/>
        <span style={{fontSize:"11px",fontWeight:"600",color:"#999"}}>
          {items.length} Leistung{items.length!==1?"en":""}
        </span>
      </div>
    </div>

    {/* Produkt-Liste */}
    <div style={{flex:1,padding:"0 18px 14px",background:"#fff"}}>
      {items.map((rec,i)=>(
        <div key={rec.id} style={{display:"flex",alignItems:"flex-start",gap:"10px",
          paddingTop:i===0?"0":"10px",
          paddingBottom:"10px",
          borderBottom:i<items.length-1?"1px solid #f5f5f5":"none"}}>
          <div style={{width:"18px",height:"18px",borderRadius:"50%",background:`${def.stripe}12`,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px"}}>
            <svg width="9" height="8" viewBox="0 0 9 8" fill="none">
              <path d="M1.5 4l2.2 2.2L7.5 1.5" stroke={def.stripe} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:"12px",fontWeight:"600",color:"#1a1a1a",lineHeight:1.3}}>{rec.name}</div>
            <div style={{fontSize:"11px",color:"#999",lineHeight:1.4,marginTop:"1px"}}>{rec.shortDescription}</div>
          </div>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div style={{padding:"14px 18px",borderTop:"1px solid #f0f0f0",background:"#fafafa"}}>
      <button onClick={()=>onCTA(items[0])} style={{
        width:"100%",padding:"11px",
        background:def.btnBg,color:def.btnTxt,
        border:def.btnBorder,
        borderRadius:"9px",fontSize:"13px",fontWeight:"600",
        cursor:"pointer",letterSpacing:"0.1px",
      }}>
        {def.label} anfragen
      </button>
    </div>
  </div>);}

function PackageCarousel({result,onCTA}){
  const[active,setActive]=useState(1);
  const[touchX,setTouchX]=useState(null);
  const pakete=PAKETE_DEFS.map(d=>({...d,items:result[d.key]||[]})).filter(d=>d.items.length>0);
  if(pakete.length===0)return null;
  const idx=Math.min(active,pakete.length-1);
  const hts=(e)=>setTouchX(e.touches[0].clientX);
  const hte=(e)=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(dx<-40&&idx<pakete.length-1)setActive(idx+1);if(dx>40&&idx>0)setActive(idx-1);setTouchX(null);};
  const bgTints={"basisPackage":"#f4f4f4","plusPackage":`${C}09`,"completePackage":"#f0f0ee"};
  const activeBg=bgTints[pakete[idx]?.key]||"#f4f4f4";
  const CW=82;const GAP=12;
  return(<div style={{background:activeBg,borderRadius:"16px",padding:"16px 0 14px",transition:"background 0.4s ease"}}>
    <div style={{display:"flex",justifyContent:"center",gap:"5px",marginBottom:"14px"}}>
      {pakete.map((_,i)=><button key={i} onClick={()=>setActive(i)} style={{
        width:i===idx?20:6,height:6,borderRadius:3,border:"none",cursor:"pointer",padding:0,
        background:i===idx?C:"rgba(0,0,0,0.14)",transition:"all 0.25s ease"}}/>)}
    </div>
    <div style={{overflow:"hidden",paddingLeft:`${(100-CW)/2}%`}} onTouchStart={hts} onTouchEnd={hte}>
      <div style={{display:"flex",gap:`${GAP}px`,
        transform:`translateX(calc(-${idx*(CW+GAP/4)}%))`,
        transition:"transform 0.38s cubic-bezier(0.4,0,0.2,1)"}}>
        {pakete.map((def,i)=>(
          <div key={def.key} style={{width:`${CW}%`,flexShrink:0,cursor:i!==idx?"pointer":"default"}}
            onClick={()=>i!==idx&&setActive(i)}>
            <PackageCard def={def} items={def.items} active={i===idx} onCTA={onCTA}/>
          </div>
        ))}
      </div>
    </div>
    <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"14px"}}>
      {[{d:-1,p:"M9 3L5 7l4 4"},{d:1,p:"M5 3l4 4-4 4"}].map(({d,p})=>{
        const dis=d===-1?idx===0:idx===pakete.length-1;
        return(<button key={d} onClick={()=>!dis&&setActive(idx+d)} style={{
          width:36,height:36,borderRadius:"50%",border:"1px solid rgba(0,0,0,0.1)",
          background:"rgba(255,255,255,0.8)",cursor:dis?"default":"pointer",opacity:dis?0.3:1,
          display:"flex",alignItems:"center",justifyContent:"center",transition:"opacity 0.2s"}}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d={p} stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>);})}
    </div>
    <div style={{textAlign:"center",marginTop:"8px",fontSize:"11px",color:"rgba(0,0,0,0.35)"}}>
      {idx+1} / {pakete.length} — <span style={{color:"rgba(0,0,0,0.55)",fontWeight:"600"}}>{pakete[idx]?.label}</span>
    </div>
  </div>);}
function Phase3({result,onCTA,onReset}){
  return(<div style={{...T.page,"--accent":C}} className="fade-in"><Header progPct={100}/>
    <div style={T.hero}>
      <div style={T.eyebrow}>Ihre persönliche Empfehlung</div>
      <div style={T.h1}>3 Pakete für Ihre Situation</div>
      <div style={T.body}>Wählen Sie den Schutz, der zu Ihnen passt — von essentiell bis vollständig.</div>
    </div>
    <div style={{padding:"0 20px",marginBottom:"16px"}}>
      <PackageCarousel result={result} onCTA={onCTA}/>
    </div>
    {result.alreadyCovered.length>0&&(
      <div style={T.section}>
        <div style={{fontSize:"11px",fontWeight:"600",color:"#aaa",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px"}}>Bereits abgesichert</div>
        <div style={T.card}>
          {result.alreadyCovered.map((item,i,arr)=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={OK+"20"}/><path d="M4.5 7l1.8 1.8L9.5 5" stroke={OK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{fontSize:"13px",color:"#777"}}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    <div style={{padding:"0 24px",marginBottom:"120px"}}>
      <div style={T.infoBox}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
    </div>
    <div style={T.footer}><button style={T.btnSec} onClick={onReset}>Neue Berechnung starten</button></div>
  </div>);}

// Phase 4: Kontakt
function Phase4({selectedRec,onAbsenden,onZurueck,isDemo}){
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[consent,setConsent]=useState(false);
  const valid=fd.name.trim()&&fd.email.trim()&&consent;
  return(<div style={{...T.page,"--accent":C}} className="fade-in"><Header progPct={100}/>
    <div style={T.hero}><div style={T.eyebrow}>Gespräch vereinbaren</div><div style={T.h1}>Über <span style={{color:C}}>{selectedRec?.name}</span> sprechen</div><div style={T.body}>Wir bereiten ein persönliches Angebot auf Basis Ihres Ergebnisses vor.</div></div>
    {isDemo ? (
      <>
        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
            Das ist eine Live-Vorschau — so sieht Ihr Kunde den Check.
          </div>
          <button
            type="button"
            style={{ ...T.btnPrim(false) }}
            onClick={() => window.parent.postMessage({ type: "openConfig" }, "*")}
          >
            Anpassen & kaufen
          </button>
        </div>
        <div style={T.footer}><button type="button" style={T.btnSec} onClick={onZurueck}>Zurück</button></div>
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
      <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={consent} onConsentChange={setConsent} />
    </div>
    </div>
    <div style={T.footer}><button style={T.btnPrim(!valid)} disabled={!valid} onClick={()=>valid&&onAbsenden(fd)}>Gespräch anfragen</button><button style={T.btnSec} onClick={onZurueck}>Zurück</button></div>
    </>
    )}
  </div>);}

// Danke
function DankeScreen({name,onReset}){
  return(<div style={{...T.page,"--accent":C}}><Header progPct={100}/>
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir bereiten das Gespräch mit Ihrem persönlichen Ergebnis vor und melden uns innerhalb von 24 Stunden.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={onReset} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
    </div></div>);}

// Root
export default function Bedarfscheck(){
  const isDemo = !new URLSearchParams(window.location.search).get("domain");
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[selectedRec,setSelectedRec]=useState(null);const[kontaktName,setKontaktName]=useState("");
  const[profil,setProfil]=useState({age:"",employmentStatus:"",jobType:"buero",netIncome:"",familyStatus:"",housingStatus:"",healthStatus:""});
  const[existing,setExisting]=useState([]);
  const set=(k,v)=>setProfil(x=>({...x,[k]:v}));
  const toggle=(id)=>setExisting(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const reset=()=>{setPhase(1);setAk(k=>k+1);setDanke(false);setProfil({age:"",employmentStatus:"",jobType:"buero",netIncome:"",familyStatus:"",housingStatus:"",healthStatus:""});setExisting([]);setSelectedRec(null);setKontaktName("");};
  const profilReady=profil.age&&profil.employmentStatus&&profil.netIncome&&profil.familyStatus&&profil.housingStatus&&profil.healthStatus;
  const result=profilReady?runScoringEngine(profil,existing):null;
  if(danke)return <DankeScreen name={kontaktName} onReset={reset}/>;
  if(phase===4)return <Phase4 key={ak} isDemo={isDemo} selectedRec={selectedRec} onAbsenden={(fd)=>{setKontaktName(fd.name);setDanke(true);}} onZurueck={()=>goTo(3)}/>;
  if(phase===3&&result)return <Phase3 key={ak} result={result} onCTA={(rec)=>{setSelectedRec(rec);goTo(4);}} onReset={reset}/>;
  if(phase===2)return <Phase2 key={ak} existing={existing} toggle={toggle} onWeiter={()=>goTo(3)} onZurueck={()=>goTo(1)}/>;
  return <Phase1 key={ak} profil={profil} set={set} onWeiter={()=>goTo(2)}/>;
}
