import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { textOnAccent } from "@/lib/utils";
import { checkStandardT } from "@/lib/checkStandardT";
import { CheckHeader } from "@/components/checks/CheckHeader";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();

const OK="#059669";

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
    reasonBuilder:({age})=>age>=50?"Pflege wird mit zunehmendem Alter das größte finanzielle Risiko — und Prämien steigen stark mit dem Alter.":age>=40?"Jetzt ist ein guter Zeitpunkt: Prämien noch günstig, Gesundheitsprüfung unkompliziert.":"Wer früh absichert, zahlt deutlich weniger — und schützt damit auch seine Familie vor Belastungen."},

  // Level 4 — SITUATIVE RISIKEN
  {id:"wohngebaeude",name:"Wohngebäudeversicherung",riskLevel:"situativ",
    visibilityRules:({housingStatus})=>housingStatus==="eigentuemer",
    scoreModifiers:()=>25,
    shortDescription:"Schützt Ihr Gebäude vor Feuer, Sturm, Leitungswasser und mehr.",
    reasonBuilder:()=>"Das Gebäude ist meist der größte Vermögenswert — ein Brandschaden ohne Versicherung kann in Minuten alles vernichten."},
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

  let scored=PRODUCTS
    .filter(p=>!existingSet.has(p.id))
    .filter(p=>p.visibilityRules(profil))
    .map(p=>{
      const base=RISK_WEIGHTS[p.riskLevel]||20;
      const mod=typeof p.scoreModifiers==="function"?p.scoreModifiers(profil):(p.scoreModifiers||0);
      return{id:p.id,name:p.name,riskLevel:p.riskLevel,score:base+mod,
        shortDescription:p.shortDescription,reason:p.reasonBuilder(profil)};
    });

  const hatExistenzLuecke=scored.some(c=>EXISTENZ_IDS.includes(c.id));
  const istErwerbstaetig=["angestellt","selbstständig","verbeamtet","ausbildung_studium"].includes(profil.employmentStatus);

  scored=scored.map(c=>{
    if(c.id==="privathaftpflicht")          return{...c,score:999};
    if(c.id==="berufsunfaehigkeit"&&istErwerbstaetig) return{...c,score:Math.max(c.score,200)};
    if(hatExistenzLuecke&&OPTIMIERUNG_IDS.includes(c.id)) return{...c,score:Math.min(c.score,19)};
    return c;
  });
  const istEigentuemer=profil.housingStatus==="eigentuemer";
  scored=scored.map(c=>{
    if(istEigentuemer&&c.id==="risikoleben") return{...c,score:Math.max(c.score,180)};
    if(istEigentuemer&&c.id==="wohngebaeude") return{...c,score:Math.max(c.score,190)};
    return c;
  });
  if(hatExistenzLuecke) scored=scored.filter(c=>c.id!=="sparen_investieren");

  scored.sort((a,b)=>b.score-a.score);

  // Bucket by risk level (largest financial impact first)
  const wichtig  = scored.filter(c => c.riskLevel === "existenz");
  const relevant = scored.filter(c => c.riskLevel === "einkommen" || c.riskLevel === "langfristig");
  const optional = scored.filter(c => c.riskLevel === "situativ"  || c.riskLevel === "optimierung");

  return { wichtig, relevant, optional, alreadyCovered };
}


function LogoSVG({ color = "#ffffff" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1" fill={color} />
      <rect x="8" y="1" width="5" height="5" rx="1" fill={color} opacity="0.6" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill={color} opacity="0.6" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill={color} />
    </svg>
  );
}

function Opts({ k, opts, profil, set, C, T, cols = 1 }) {
  const sel = profil[k];
  const mark = textOnAccent(C);
  return (
    <div style={cols > 1 ? T.optsGrid : T.opts}>
      {opts.map(([v, l, sub]) => {
        const active = sel === v;
        const iconChar = Array.from(l)[0] ?? l[0];
        const labelText = l.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, "");
        return (
          <button type="button" key={v} onClick={() => set(k, v)} style={cols > 1 ? T.optGrid(active) : T.opt(active)}>
            <div style={cols > 1 ? T.optGridIcon(active) : T.optIcon(active)}>
              <span style={{ fontSize: cols > 1 ? 20 : 22, lineHeight: 1, color: active ? C : "#98A2B3" }}>{iconChar}</span>
            </div>
            {cols > 1 ? (
              <div style={T.optGridLabel}>{labelText}</div>
            ) : (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={T.optLabel}>{labelText}</div>
                  {sub ? <div style={T.optSub}>{sub}</div> : null}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `1.5px solid ${active ? C : "#EAE5DC"}`, background: active ? C : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke={mark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Vereinfachte Optionen (1 Frage pro Screen) ───────────────────────────────
const EMP_OPTS=[
  ["angestellt","💼 Angestellt","Festanstellung oder ähnlich"],
  ["selbstständig","🧑‍💻 Selbstständig","Freiberuflich oder Gewerbe"],
  ["verbeamtet","🏛️ Beamter","Beamtenverhältnis"],
  ["ausbildung_studium","🎓 In Ausbildung / Studium","Studium oder Ausbildung"],
];
const FAM_OPTS=[
  ["ledig","🧍 Nur für mich selbst","Ich bin aktuell allein verantwortlich"],
  ["partnerschaft","🤝 Partner / Beziehung","Wir tragen gemeinsam Verantwortung"],
  ["mit_kindern","👨‍👩‍👧 Familie mit Kindern","Ich habe Kinder, die abgesichert sein müssen"],
];
const HSG_OPTS=[
  ["mieter","🔑 Zur Miete","Ich miete meine Wohnung"],
  ["eigentuemer","🏡 Eigentum","Ich besitze eine Immobilie"],
  ["eltern_wg","🏠 Bei Eltern / WG","Ich wohne noch zu Hause oder in einer WG"],
];
const INC_OPTS=[
  ["1500_2500","Unter 2.000 €"],
  ["2500_4000","2.000 – 3.500 €"],
  ["4000_6000","3.500 – 5.000 €"],
  ["over_6000","Über 5.000 €"],
];
const EX_GROUPS=[
  {label:"Sachen & Wohnen",items:[{id:"privathaftpflicht",name:"Privathaftpflicht"},{id:"hausrat",name:"Hausrat"},{id:"wohngebaeude",name:"Wohngebäude"},{id:"rechtsschutz",name:"Rechtsschutz"}]},
  {label:"Einkommen & Zukunft",items:[{id:"berufsunfaehigkeit",name:"Berufsunfähigkeit (BU)"},{id:"erwerbsunfaehigkeit",name:"Erwerbsunfähigkeit (EU)"},{id:"krankentagegeld",name:"Krankentagegeld"},{id:"altersvorsorge",name:"Private Altersvorsorge"}]},
  {label:"Gesundheit",items:[{id:"pkv",name:"Private Krankenversicherung"},{id:"zahnzusatz",name:"Zahnzusatz"},{id:"krankenhauszusatz",name:"Krankenhauszusatz"},{id:"ambulante_zusatz",name:"Ambulante Zusatz"},{id:"pflegezusatz",name:"Pflegezusatz"}]},
  {label:"Familie & Vermögen",items:[{id:"unfall",name:"Unfallversicherung"},{id:"risikoleben",name:"Risikolebensversicherung"},{id:"sparen_investieren",name:"Sparen & Investieren"}]},
];

// ─── Phase 1: 1 Frage pro Screen (6 Screens) ─────────────────────────────────
function Phase1({profil,set,existing,toggle,onWeiter,C,T,firma,logoIconColor}){
  const[scr,setScr]=useState(1);
  useCheckScrollToTop([scr]);
  const mark=textOnAccent(C);
  const canNext=scr===1||scr===6?true:scr===2?!!profil.employmentStatus:scr===3?!!profil.familyStatus:scr===4?!!profil.housingStatus:!!profil.netIncome;
  const next=()=>scr<6?setScr(s=>s+1):onWeiter();
  const back=()=>scr>1&&setScr(s=>s-1);
  return(
    <div style={{...T.page,...T.fadeIn,"--accent":C}} className="fade-in">
      <CheckHeader T={T} firma={firma} badge="Bedarfscheck" phase={scr} total={6} logo={<LogoSVG color={logoIconColor}/>}/>

      {scr===1&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>In wenigen Schritten</div>
          <div style={T.h1}>Wie gut sind Sie aktuell abgesichert?</div>
          <div style={T.hint}>Wir schauen gemeinsam an, wo Ihr Schutz ausreicht — und wo Lücken bestehen.</div>
        </div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(false)} onClick={next}>Check starten</button></div>
      </>}

      {scr===2&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Situation</div>
          <div style={T.h1}>Wie sieht Ihre aktuelle Situation aus?</div>
        </div>
        <div style={T.section}><div style={T.sliderCard}><div style={T.sliderRowLast}><Opts k="employmentStatus" opts={EMP_OPTS} profil={profil} set={set} C={C} T={T}/></div></div></div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(!canNext)} disabled={!canNext} onClick={next}>Weiter →</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===3&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Verantwortung</div>
          <div style={T.h1}>Für wen tragen Sie aktuell Verantwortung?</div>
        </div>
        <div style={T.section}><div style={T.sliderCard}><div style={T.sliderRowLast}><Opts k="familyStatus" opts={FAM_OPTS} profil={profil} set={set} C={C} T={T}/></div></div></div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(!canNext)} disabled={!canNext} onClick={next}>Weiter →</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===4&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Wohnsituation</div>
          <div style={T.h1}>Wie wohnen Sie aktuell?</div>
        </div>
        <div style={T.section}><div style={T.sliderCard}><div style={T.sliderRowLast}><Opts k="housingStatus" opts={HSG_OPTS} profil={profil} set={set} C={C} T={T}/></div></div></div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(!canNext)} disabled={!canNext} onClick={next}>Weiter →</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===5&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihr Einkommen</div>
          <div style={T.h1}>Wie hoch ist Ihr monatliches Nettoeinkommen?</div>
        </div>
        <div style={T.section}><div style={T.sliderCard}><div style={T.sliderRowLast}><Opts k="netIncome" opts={INC_OPTS} cols={2} profil={profil} set={set} C={C} T={T}/></div></div></div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}><button style={T.btnPrim(!canNext)} disabled={!canNext} onClick={next}>Weiter →</button><button style={T.btnSec} onClick={back}>Zurück</button></div>
      </>}

      {scr===6&&<>
        <div style={T.hero}>
          <div style={T.eyebrow}>Bestehende Absicherung</div>
          <div style={T.h1}>Was haben Sie bereits abgesichert?</div>
          <div style={T.hint}>Alles antippen, was bereits vorhanden ist — was fehlt, sehen Sie im Ergebnis.</div>
        </div>
        {EX_GROUPS.map(group=>(
          <div key={group.label} style={T.section}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"8px"}}>{group.label}</div>
            <div style={T.multiList}>
              {group.items.map((item,i)=>{
                const checked=existing.includes(item.id);
                const isLast=i===group.items.length-1;
                return(
                  <div key={item.id} role="button" tabIndex={0}
                    onClick={()=>toggle(item.id)}
                    onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle(item.id);}}}
                    style={isLast?T.multiRowLast:T.multiRow}>
                    <span style={T.multiLabel}>{item.name}</span>
                    <div style={T.checkbox(checked)}>
                      {checked?(<svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden><path d="M1 4L3.5 6.5L9 1" stroke={mark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>):null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{padding:"0 24px",marginBottom:"8px"}}><div style={T.infoBlue}>Nicht sicher? Einfach weitergehen — im Ergebnis sehen Sie was fehlt.</div></div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={onWeiter}>Mein Ergebnis ansehen{existing.length>0?` · ${existing.length} vorhanden`:""}</button>
          <button style={T.btnSec} onClick={back}>Zurück</button>
        </div>
      </>}
    </div>
  );
}


// ── Phase 3: Ergebnis — 3-Tier Priorisierung ──────────────────────────────────
function Phase3({ result, onCTA, onReset, isDemo, C, T, firma, logoIconColor }) {
  const { wichtig, relevant, optional, alreadyCovered } = result;
  const totalCount = wichtig.length + relevant.length + optional.length;

  const TIERS = [
    { label: "Wichtig",   color: "#C0392B", bg: "#FFF6F5", items: wichtig,   sectionTitle: "Das ist aktuell am wichtigsten",         hint: "Level 1 — Existenzbedrohende Risiken" },
    { label: "Relevant",  color: "#D97706", bg: "#FFFBEB", items: relevant,  sectionTitle: "Das sollten Sie prüfen",                  hint: "Level 2 + 3 — Einkommen & Gesundheit" },
    { label: "Optional",  color: "#6B7280", bg: "#FAFAF8", items: optional,  sectionTitle: "Das kann ergänzend sinnvoll sein",        hint: "Level 4 — Sach & Optimierung" },
  ].filter(t => t.items.length > 0);

  const ProductRow = ({ item, accentColor }) => (
    <div style={{ padding: "16px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentColor, flexShrink: 0, marginTop: "7px" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937", marginBottom: "3px" }}>{item.name}</div>
        <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.55, marginBottom: "5px" }}>{item.reason}</div>
        <div style={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic" }}>In Ihrer Situation häufig relevant</div>
      </div>
    </div>
  );

  return (
    <div style={{ ...T.page, ...T.fadeIn, "--accent": C }} className="fade-in">
      <CheckHeader T={T} firma={firma} badge="Bedarfscheck" phase={7} total={8} logo={<LogoSVG color={logoIconColor} />} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "52px 24px 36px", textAlign: "center", background: "#F8F6F2" }}>
        <div style={{ fontSize: "12px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.2px", marginBottom: "14px" }}>Ihre Absicherung im Überblick</div>
        <div style={{ fontSize: "52px", fontWeight: "800", color: C, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "8px" }}>{totalCount}</div>
        <div style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "18px" }}>relevante Themen</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: `${C}14`, border: `1px solid ${C}33`, borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: C }}>Individuelle Einschätzung</div>
        <div style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.55, marginTop: "12px" }}>auf Basis Ihrer Angaben · nach Risikostufe geordnet</div>
      </div>

      {/* ── Visual: 3-Tier Überblick ──────────────────────────────────────── */}
      <div style={T.section}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" }}>Ihre Prioritäten im Überblick</div>
        <div style={{ border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", overflow: "hidden" }}>
          {TIERS.map(({ label, color, bg, items }, i, arr) => (
            <div key={label} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none", background: bg, display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ padding: "2px 10px", background: color + "18", border: `1px solid ${color}33`, borderRadius: "999px", fontSize: "11px", fontWeight: "700", color, flexShrink: 0, marginTop: "2px" }}>{label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {items.map(r => (
                  <span key={r.id} style={{ fontSize: "12px", color: "#4B5563", background: "#fff", border: "1px solid rgba(17,24,39,0.07)", borderRadius: "20px", padding: "2px 10px" }}>{r.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sektionen pro Tier ────────────────────────────────────────────── */}
      {TIERS.map(({ label, color, items, sectionTitle, hint }) => (
        <div key={label} style={T.section}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "4px" }}>{sectionTitle}</div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "12px" }}>{hint}</div>
          <div style={{ border: "1px solid rgba(17,24,39,0.08)", borderRadius: "16px", overflow: "hidden", background: "#fff" }}>
            {items.map((item, i, arr) => (
              <div key={item.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none" }}>
                <ProductRow item={item} accentColor={color} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Bereits abgesichert ───────────────────────────────────────────── */}
      {alreadyCovered.length > 0 && (
        <div style={T.section}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" }}>Bereits abgesichert</div>
          <div style={{ border: "1px solid rgba(17,24,39,0.06)", borderRadius: "16px", overflow: "hidden", background: "#fff" }}>
            {alreadyCovered.map((item, i, arr) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill={OK + "18"} /><path d="M5 8l2 2L11 5.5" stroke={OK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Legal ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 24px", marginBottom: "120px" }}>
        <CheckBerechnungshinweis t={T}>
          <>Vereinfachte Einschätzung auf Basis eines <strong>Risiko-Scorings</strong>: Produkte werden nach Risikostufe eingeordnet (Existenz → Einkommen → Langfristig → Optional) und anhand Ihres Profils gewichtet. <strong>Privathaftpflicht</strong> ist stets Priorität 1. Alle Angaben: in Ihrer Situation häufig relevant — kein Ersatz für individuelle Beratung.</>
        </CheckBerechnungshinweis>
        <div style={T.infoGold}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
      </div>

      <div style={T.footer}>
        {isDemo
          ? <button style={T.btnPrim(false)} onClick={() => window.parent.postMessage({ type: "openConfig", slug: "bedarfscheck" }, "*")}>Anpassen & kaufen</button>
          : <button style={T.btnPrim(false)} onClick={onCTA}>Absicherung gemeinsam durchgehen</button>
        }
        <button style={T.btnSec} onClick={onReset}>Neue Einschätzung starten</button>
      </div>
    </div>
  );
}

// Phase 4: Kontakt
function Phase4({ onAbsenden, onZurueck, isDemo, makler, C, T, firma, logoIconColor }) {
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[consent,setConsent]=useState(false);
  const valid=fd.name.trim()&&fd.email.trim()&&consent;
  return(<div style={{...T.page,...T.fadeIn,"--accent":C}} className="fade-in">
    <CheckHeader T={T} firma={firma} badge="Bedarfscheck" phase={8} total={8} logo={<LogoSVG color={logoIconColor} />} />
    <div style={T.hero}>
      <div style={T.eyebrow}>Fast geschafft</div>
      <div style={T.h1}>Wo können wir dich erreichen?</div>
      <div style={T.hint}>Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis.</div>
    </div>
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
                { type: "openConfig", slug: "bedarfscheck" },
                "*",
              )
            }
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
      {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"tel",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
        <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.input,marginTop:"4px"}}/>{hint&&<div style={T.fldHint}>{hint}</div>}</div>
      ))}
    </div>
    <div style={{marginTop:"14px",marginBottom:"100px"}}>
      <CheckKontaktBeforeSubmitBlock maklerName={makler.name} consent={consent} onConsentChange={setConsent} />
    </div>
    </div>
    <div style={T.footer}><button style={T.btnPrim(!valid)} disabled={!valid} onClick={()=>valid&&onAbsenden(fd)}>{valid?"Ergebnis gemeinsam durchgehen":"Bitte alle Angaben machen"}</button><button style={T.btnSec} onClick={onZurueck}>Zurück</button></div>
    </>
    )}
  </div>);}

// Danke
function DankeScreen({ name, onReset, makler, C, T, firma, logoIconColor }) {
  return(<div style={{...T.page,...T.fadeIn,"--accent":C}} className="fade-in">
    <CheckHeader T={T} firma={firma} badge="Bedarfscheck" phase={8} total={8} logo={<LogoSVG color={logoIconColor} />} />
    <div style={T.dankeScreen}>
      <div style={T.dankeRing(C)}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={T.dankeH}>{name?`Danke, ${name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={T.dankeBody}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
      <div style={T.maklerCard}>
        <div style={T.maklerTop}>
          <div style={T.maklerName}>{makler.name}</div>
          <div style={T.maklerFirma}>{makler.firma}</div>
        </div>
        <div style={T.maklerLinks}>
          <a href={`tel:${makler.telefon}`} style={T.maklerLink(C)}>{makler.telefon}</a>
          <a href={`mailto:${makler.email}`} style={T.maklerLink(C)}>{makler.email}</a>
        </div>
      </div>
      <button type="button" onClick={onReset} style={{...T.btnSec,marginTop:"16px"}}>Neuen Check starten</button>
    </div></div>);}

// Root
export default function Bedarfscheck(){
  const isDemo = isCheckDemoMode();
  const makler = useCheckConfig();
  const C = makler.primaryColor;
  const onAccent = useMemo(() => textOnAccent(C), [C]);
  const T = useMemo(() => checkStandardT(C), [C]);
  const logoIconColor = onAccent;
  const firma = makler.firma;
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[kontaktName,setKontaktName]=useState("");
  const[profil,setProfil]=useState({age:35,employmentStatus:"",jobType:"buero",netIncome:"",familyStatus:"",housingStatus:"",healthStatus:"gkv"});
  const[existing,setExisting]=useState([]);
  const set=(k,v)=>setProfil(x=>({...x,[k]:v}));
  const toggle=(id)=>setExisting(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);};
  useCheckScrollToTop([phase, ak, danke]);
  const reset=()=>{setPhase(1);setAk(k=>k+1);setDanke(false);setProfil({age:35,employmentStatus:"",jobType:"buero",netIncome:"",familyStatus:"",housingStatus:"",healthStatus:"gkv"});setExisting([]);setKontaktName("");};
  const profilReady=profil.employmentStatus&&profil.netIncome&&profil.familyStatus&&profil.housingStatus;
  const result=profilReady?runScoringEngine(profil,existing):null;
  if(danke)return <DankeScreen name={kontaktName} onReset={reset} makler={makler} C={C} T={T} firma={firma} logoIconColor={logoIconColor}/>;
  if(phase===4)return <Phase4 key={ak} isDemo={isDemo} selectedRec={selectedRec} onAbsenden={async (fd)=>{const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"bedarfscheck",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setKontaktName(fd.name);setDanke(true);}} onZurueck={()=>goTo(3)} makler={makler} C={C} T={T} firma={firma} logoIconColor={logoIconColor}/>;
  if(phase===3&&result)return <Phase3 key={ak} isDemo={isDemo} result={result} onCTA={()=>goTo(4)} onReset={reset} C={C} T={T} firma={firma} logoIconColor={logoIconColor}/>;
  return <Phase1 key={ak} profil={profil} set={set} existing={existing} toggle={toggle} onWeiter={()=>goTo(3)} C={C} T={T} firma={firma} logoIconColor={logoIconColor}/>;
}
