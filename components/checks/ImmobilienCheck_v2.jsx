import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input{font-family:inherit;border:none;background:none;cursor:pointer;}input{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();

const WARN="#c0392b";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
const fmtK=(n)=>n>=1000000?(n/1000000).toFixed(2)+" Mio. €":n>=10000?Math.round(n/1000).toLocaleString("de-DE")+".000 €":fmt(n);

// ─── BERECHNUNGEN (unverändert aus Quell-Rechnern) ────────────────────────────
function berechneMK(p){
  const{kaufpreis,eigenkapital,miete,mietSteigerung,zinsen,tilgung,instandhaltung,jahre}=p;
  const darlehen=kaufpreis-eigenkapital;
  const rate=(darlehen*(zinsen/100+tilgung/100))/12;
  const nebenkosten=kaufpreis*0.1;
  const gesamtinvest=eigenkapital+nebenkosten;
  const kaufKosten=rate*12*jahre+gesamtinvest;
  let mietGesamt=0,mietAkt=miete;
  for(let j=0;j<jahre;j++){mietGesamt+=mietAkt*12;mietAkt*=(1+mietSteigerung/100);}
  const diffMonatl=rate-miete;
  let anlageVerm=0;
  if(diffMonatl<0){for(let j=0;j<jahre;j++)anlageVerm=(anlageVerm+Math.abs(diffMonatl)*12)*(1+0.05);}
  const immWert=Math.round(kaufpreis*Math.pow(1.02,jahre));
  const i = zinsen / 100;
  const t = tilgung / 100;
  const restschuld =
    Math.abs(i) < 1e-12
      ? Math.max(0, Math.round(darlehen * (1 - t * jahre)))
      : Math.max(
          0,
          Math.round(
            darlehen * Math.pow(1 + i, jahre) -
              ((i + t) / i) * darlehen * (Math.pow(1 + i, jahre) - 1),
          ),
        );
  const eigentumsWert=immWert-restschuld;
  let breakeven=null,kaufKum=gesamtinvest,mietKum=0,immW=kaufpreis;
  for(let j=1;j<=50;j++){
    kaufKum+=rate*12+instandhaltung*12;mietKum+=miete*Math.pow(1+mietSteigerung/100,j-1)*12;immW*=1.02;
    const nettoKauf=kaufKum-(immW-restschuld*Math.max(0,1-j*tilgung/100*0.1));
    if(breakeven===null&&nettoKauf<mietKum)breakeven=j;
  }
  return{rate,nebenkosten,gesamtinvest,kaufKosten,mietGesamt,diffMonatl,anlageVerm,immWert,eigentumsWert,breakeven};
}

function berechneAnschluss(p){
  const{restschuld,altZins,neuZins,tilgung,laufzeit}=p;
  const altRate=(restschuld*(altZins/100+tilgung/100))/12;
  const neuRate=(restschuld*(neuZins/100+tilgung/100))/12;
  const diffMonatl=neuRate-altRate;
  const mehrGesamt=diffMonatl*laufzeit*12;
  const i2 = neuZins / 100;
  const t2 = tilgung / 100;
  const altEnde =
    Math.abs(i2) < 1e-12
      ? Math.max(0, Math.round(restschuld * (1 - t2 * laufzeit)))
      : Math.max(
          0,
          Math.round(
            restschuld * Math.pow(1 + i2, laufzeit) -
              ((i2 + t2) / i2) * restschuld * (Math.pow(1 + i2, laufzeit) - 1),
          ),
        );
  return{altRate,neuRate,diffMonatl,mehrGesamt,altEnde};
}

const BAUART_FAKTOR={massiv:1.0,fertig:0.85,holz:0.9,denkmal:1.4};
const BAUJAHR_ZUSCHLAG=(j)=>j<1950?1.3:j<1970?1.15:j<1990?1.05:1.0;
function berechneWG(p){
  const{flaeche,baujahr,bauart,versSum,photovoltaik}=p;
  const neuwert=Math.round(flaeche*1950*(BAUART_FAKTOR[bauart]||1)*BAUJAHR_ZUSCHLAG(baujahr));
  const pv_aufschlag=photovoltaik?Math.round(flaeche*120):0;
  const empfohleneVS=neuwert+pv_aufschlag;
  const unterversichert=versSum>0&&versSum<empfohleneVS*0.9;
  const deckungsluecke=Math.max(0,empfohleneVS-versSum);
  const deckung=versSum>0?Math.min(100,Math.round((versSum/empfohleneVS)*100)):0;
  const empfPraemieWG=Math.max(15,Math.round((empfohleneVS*0.001/12)/5)*5);
  return{neuwert,empfohleneVS,unterversichert,deckungsluecke,deckung,pv_aufschlag,empfPraemieWG};
}

// ─── ABSICHERUNGS-CARDS je Modul ─────────────────────────────────────────────
const ABSICHERUNG={
  mk:[
    {t:"Risikolebensversicherung",n:"Die Restschuld läuft weiter — wer übernimmt sie, wenn du stirbst?",p:"kritisch"},
    {t:"Berufsunfähigkeitsversicherung",n:"Wenn du nicht mehr arbeiten kannst, wird die Rate zum Problem.",p:"kritisch"},
    {t:"Wohngebäudeversicherung",n:"Pflichtversicherung bei Immobilienbesitz — Feuer, Leitungswasser, Sturm.",p:"kritisch"},
  ],
  anschluss:[
    {t:"Risikolebensversicherung",n:"Die Restschuld läuft weiter — wer übernimmt sie, wenn du stirbst?",p:"kritisch"},
    {t:"Berufsunfähigkeitsversicherung",n:"Wenn du nicht mehr arbeiten kannst, wird die Rate zum Problem.",p:"kritisch"},
    {t:"Rechtsschutzversicherung",n:"Streit mit Handwerkern, Mietern oder der Bank — das passiert öfter als man denkt.",p:"optional"},
  ],
  wg:[
    {t:"Wohngebäudeversicherung",n:"Ausreichende Versicherungssumme ist Pflicht — Unterversicherung kostet im Schadenfall.",p:"kritisch"},
    {t:"Elementarschadenversicherung",n:"Überschwemmung, Rückstau und Erdrutsch sind nicht im Standard enthalten.",p:"kritisch"},
    {t:"Privathaftpflichtversicherung",n:"Als Eigentümer haftest du auch für Schäden, die von deiner Immobilie ausgehen.",p:"sinnvoll"},
    {t:"Rechtsschutzversicherung",n:"Streit mit Handwerkern, Mietern oder der Bank — das passiert öfter als man denkt.",p:"optional"},
  ],
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
function makeImmobilienT(C){return{
  page:{minHeight:"100vh",background:"#fff","--accent":C,fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},
  header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(31,41,55,0.06)",padding:"0 24px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{display:"flex",alignItems:"center",gap:"10px"},
  logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},
  badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},
  prog:{height:"2px",background:"rgba(31,41,55,0.08)"},
  progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),
  hero:{padding:"32px 24px 16px"},
  eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},
  h1:{fontSize:"22px",color:"#111",lineHeight:1.25,...CHECKKIT_HERO_TITLE_TYPO},
  body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},
  section:{padding:"0 24px",marginBottom:"20px"},
  card:{border:"1px solid #e8e8e8",borderRadius:"18px",overflow:"hidden"},
  row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},
  rowLast:{padding:"14px 16px"},
  fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},
  fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},
  footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.88)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderTop:"1px solid rgba(31,41,55,0.06)",boxShadow:"0 -6px 20px rgba(17,24,39,0.05)",padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))"},
  btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"999px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer",letterSpacing:"-0.1px",boxShadow:d?"none":"0 8px 20px rgba(26,58,92,0.18)"}),
  btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},
  infoBox:{padding:"12px 14px",background:"#F6F8FE",border:"1px solid #DCE6FF",borderRadius:"14px",fontSize:"12px",color:"#315AA8",lineHeight:1.6},
  inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},
  resultHero:{padding:"52px 24px 40px",textAlign:"center",background:"#fff"},
  resultEyebrow:{fontSize:"12px",fontWeight:"500",color:"#9CA3AF",letterSpacing:"0.2px",marginBottom:"14px"},
  resultNumber:(warn,C2)=>({fontSize:"52px",fontWeight:"800",color:warn?WARN:(C2||C),letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"}),
  resultUnit:{fontSize:"14px",color:"#9CA3AF",marginBottom:"18px"},
  resultSub:{fontSize:"13px",color:"#9CA3AF",lineHeight:1.55,marginTop:"12px"},
  statusOk:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#15803D"},
  statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
  statusInfo:(C2)=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 14px",background:`${C2}14`,border:`1px solid ${C2}33`,borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:C2}),
  cardPrimary:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"20px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 6px 24px rgba(17,24,39,0.08)"},
  cardContext:{background:"#FAFAF8",border:"1px solid rgba(17,24,39,0.05)",borderRadius:"16px",padding:"18px 20px"},
  warnCard:{background:"rgba(192,57,43,0.025)",border:"1px solid rgba(192,57,43,0.27)",borderLeft:"3px solid #c0392b",borderRadius:"18px",padding:"14px 16px"},
  warnCardTitle:{fontSize:"13px",fontWeight:"700",color:"#C0392B",marginBottom:"6px"},
  sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"},
};}

// ─── ABSICHERUNGS-BLOCK ───────────────────────────────────────────────────────
function AbsicherungBlock({modul,T,RWG}){
  const base=ABSICHERUNG[modul]||[];
  const cards=modul==="wg"&&RWG&&base.length
    ?base.map((c,i)=>(i===0?{...c,praemie:`ab ca. ${fmt(RWG.empfPraemieWG)}/Mon.`}:c))
    :base;
  const prioColor={kritisch:WARN,sinnvoll:"#d97706",optional:"#888"};
  const prioBg={kritisch:"#fff5f5",sinnvoll:"#fffbf0",optional:"#f9f9f9"};
  return(
    <div style={T.section}>
      <div style={{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"}}>Absicherung rund um Ihre Immobilie</div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {cards.map(({t,n,p,praemie},i)=>(
          <div key={i} style={{border:`1px solid ${prioColor[p]}33`,borderRadius:"10px",padding:"12px 14px",background:prioBg[p],display:"flex",gap:"12px",alignItems:"flex-start"}}>
            <div style={{flexShrink:0,marginTop:"2px"}}>
              <span style={{fontSize:"10px",fontWeight:"700",color:prioColor[p],background:`${prioColor[p]}15`,padding:"2px 7px",borderRadius:"20px",letterSpacing:"0.3px",textTransform:"uppercase"}}>{p}</span>
            </div>
            <div>
              <div style={{fontSize:"13px",fontWeight:"600",color:"#111",marginBottom:"3px"}}>{t}</div>
              <div style={{fontSize:"12px",color:"#555",lineHeight:1.55}}>{n}</div>
              {praemie&&(
                <div style={{marginTop:"4px",fontSize:"12px",fontWeight:"600",color:"#1F2937"}}>
                  {praemie}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HAUPTKOMPONENTE ──────────────────────────────────────────────────────────
export default function ImmobilienCheck(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makeImmobilienT(C),[C]);
  const isDemo = isCheckDemoMode();
  const[phase,setPhase]=useState(1);
  const[scr2,setScr2]=useState(1);           // sub-screen within phase 2
  const[ak,setAk]=useState(0);
  const[danke,setDanke]=useState(false);
  const[detailsOpen,setDetailsOpen]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[kontaktConsent,setKontaktConsent]=useState(false);
  const[loading,setLoading]=useState(false);
  // Phase 1 State
  const[,setSituation]=useState(""); // mieter | eigentuemer | kaufplan
  const[modul,setModul]=useState("");         // mk | anschluss | wg
  // Modul-States
  const[mk,setMk]=useState({kaufpreis:350000,eigenkapital:70000,miete:1200,mietSteigerung:2,zinsen:3.5,tilgung:2,instandhaltung:150,jahre:20});
  const[anschluss,setAnschluss]=useState({restschuld:220000,altZins:1.2,neuZins:3.8,tilgung:2,laufzeit:10});
  const[wg,setWg]=useState({flaeche:140,baujahr:1985,bauart:"massiv",versSum:320000,elementar:false,photovoltaik:false});
  const setM=(s,k,v)=>{if(s==="mk")setMk(x=>({...x,[k]:v}));else if(s==="anschluss")setAnschluss(x=>({...x,[k]:v}));else setWg(x=>({...x,[k]:v}));};
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);setScr2(1);if(ph===1)setLoading(false);};
  const SCR2_TOTAL={mk:4,anschluss:3,wg:3};
  const scr2Total=SCR2_TOTAL[modul]||3;
  const nextScr2=()=>{if(scr2<scr2Total){setAk(k=>k+1);setScr2(s=>s+1);}else setLoading(true);};
  const backScr2=()=>{if(scr2>1){setAk(k=>k+1);setScr2(s=>s-1);}else goTo(1);};
  // Fortschritt über alle Phasen: Phase 1 = 1 Screen, Phase 2 = n Screens, Phase 3 = 1
  const totalSteps=1+scr2Total+1;
  const curStep=phase===1?1:phase===2?1+scr2:1+scr2Total+1;
  useCheckScrollToTop([phase, ak, danke, scr2, loading]);

  function Header({ phase, total }) {
    const pct = total > 0 ? (phase / total) * 100 : 0;
    return (
      <>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(31,41,55,0.06)",
            padding: "16px 20px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: C,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,58,92,0.2)",
            }}
          >
            <MaklerFirmaAvatarInitials firma={MAKLER.firma} />
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1F2937",
              letterSpacing: "-0.1px",
              textAlign: "center",
            }}
          >
            {MAKLER.firma}
          </span>
        </div>
        <div style={{ height: "6px", background: "rgba(31,41,55,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: C,
              borderRadius: "999px",
              transition: "width 0.35s ease",
            }}
          />
        </div>
      </>
    );
  }

  // Danke
  if(danke)return(<div style={T.page}><Header phase={totalSteps} total={totalSteps} /><div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in"><div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div><div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div><div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"11px",fontWeight:"600",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"3px"}}>Dein Berater</div><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div><button onClick={()=>{setDanke(false);goTo(1);}} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button></div></div>);

  if(loading)return(<div style={T.page} key={ak}><Header phase={totalSteps} total={totalSteps} /><CheckLoader type="immobilie" checkmarkColor={C} onComplete={()=>{setLoading(false);goTo(3);}}/></div>);

  // ── Phase 4: Kontakt ─────────────────────────────────────────────────────
  if(phase===4){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    const immoHighlights=(()=>{
      if(modul==="mk"){const RMK=berechneMK(mk);const pref=RMK.diffMonatl>0?"+":"";return[{label:"Modul",value:"Kaufen vs. Mieten"},{label:"Diff. Rate − Miete (Monat)",value:`${pref}${fmt(Math.abs(RMK.diffMonatl))}`},{label:"Immobilienrate",value:fmt(RMK.rate)}];}
      if(modul==="anschluss"){const RA=berechneAnschluss(anschluss);return[{label:"Modul",value:"Anschlussfinanzierung"},{label:"Rate alt → neu",value:`${fmt(RA.altRate)} → ${fmt(RA.neuRate)}`},{label:"Differenz (Monat)",value:fmt(RA.diffMonatl)}];}
      if(modul==="wg"){const RWG=berechneWG(wg);return[{label:"Modul",value:"Wohngebäude"},{label:"Empfohlene VS",value:fmtK(RWG.empfohleneVS)},{label:"Deckung",value:`${RWG.deckung}%`}];}
      return[];
    })();
    return(<div style={T.page} key={ak} className="fade-in"><Header phase={curStep} total={totalSteps} />
      <div style={T.hero}><div style={T.eyebrow}>Letzter Schritt</div><div style={T.h1}>Ergebnis besprechen</div><div style={T.body}>Wir gehen dein Ergebnis gemeinsam durch — konkret, ohne Druck.</div></div>
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
                  { type: "openConfig", slug: "immobilien-check" },
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
      <div style={T.footer}><button type="button" style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"immobilien-check",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||"",highlights:immoHighlights})}).catch(()=>{});}setDanke(true);}} disabled={!valid}>{valid?"Ergebnis besprechen":"Bitte alle Angaben machen"}</button><button type="button" style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
      </>
      )}
    </div>);
  }

  // ── Phase 3: Ergebnis ────────────────────────────────────────────────────
  if(phase===3){
    const RMK=modul==="mk"?berechneMK(mk):null;
    const RA=modul==="anschluss"?berechneAnschluss(anschluss):null;
    const RWG=modul==="wg"?berechneWG(wg):null;

    return(<div style={T.page} key={ak} className="fade-in"><Header phase={curStep} total={totalSteps} />

      {/* MODUL: Mieten vs. Kaufen */}
      {modul==="mk"&&RMK&&(<>
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Kaufen vs. Mieten · Ihre Situation</div>
          <div style={T.resultNumber(RMK.diffMonatl>0, RMK.diffMonatl<=0?"#059669":undefined)}>
            {(RMK.diffMonatl>0?"+":"")+fmt(Math.abs(RMK.diffMonatl))}
          </div>
          <div style={T.resultUnit}>
            {RMK.diffMonatl>0?"monatlich teurer als Mieten":"monatlich günstiger als Mieten"}
          </div>
          {RMK.diffMonatl<=0
            ? <div style={T.statusOk}>Kaufen lohnt sich</div>
            : RMK.breakeven
              ? <div style={T.statusInfo(C)}>Break-even ab Jahr {RMK.breakeven}</div>
              : <div style={T.statusWarn}>Derzeit teurer als Mieten</div>
          }
          <div style={T.resultSub}>Rate {fmt(RMK.rate)}/Mon. · Miete {fmt(mk.miete)}/Mon. · auf Basis Ihrer Angaben</div>
        </div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"18px",padding:"16px 14px",background:"#fff"}}>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginBottom:"8px"}}>Monatliche Rate (Kauf)</div>
              <div style={{fontSize:"26px",fontWeight:"800",color:C,letterSpacing:"-1px"}}>{fmt(RMK.rate)}</div>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"4px"}}>/Monat</div>
            </div>
            <div style={{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"18px",padding:"16px 14px",background:"#fff"}}>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginBottom:"8px"}}>Kaltmiete (Angabe)</div>
              <div style={{fontSize:"26px",fontWeight:"800",color:"#1F2937",letterSpacing:"-1px"}}>{fmt(mk.miete)}</div>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"4px"}}>/Monat</div>
            </div>
          </div>
          {RMK.breakeven&&(
            <div style={{
              border:"1px solid rgba(26,58,92,0.2)",
              borderLeft:`3px solid ${C}`,
              borderRadius:"18px",
              padding:"14px 16px",
              background:`color-mix(in srgb, ${C} 3%, white)`,
              marginBottom:"16px",
            }}>
              <div style={{
                fontSize:"11px",fontWeight:"700",
                color:C,letterSpacing:"0.5px",
                textTransform:"uppercase",marginBottom:"6px",
              }}>
                Breakeven-Analyse
              </div>
              <div style={{
                fontSize:"22px",fontWeight:"700",
                color:C,letterSpacing:"-0.5px",
                marginBottom:"4px",
              }}>
                Ab Jahr {RMK.breakeven}
              </div>
              <div style={{
                fontSize:"13px",color:"#6B7280",
                lineHeight:1.6,
              }}>
                wird Kaufen günstiger als Mieten.
                Bis dahin: ca.{" "}
                <strong style={{color:"#c0392b"}}>
                  {fmtK(Math.abs(RMK.diffMonatl)*12*RMK.breakeven)}
                </strong>{" "}
                mehr als Miete.
              </div>
            </div>
          )}
          <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Details {detailsOpen?"ausblenden":"anzeigen"}
          </button>
          {detailsOpen&&(<div style={T.card}>{[
            {l:"Darlehen",v:fmtK(mk.kaufpreis-mk.eigenkapital)},
            {l:"Nebenkosten (~10%)",v:fmtK(RMK.nebenkosten)},
            {l:"Gesamtinvestition",v:fmtK(RMK.gesamtinvest)},
            {l:`Kaufkosten über ${mk.jahre} Jahre`,v:fmtK(RMK.kaufKosten)},
            {l:`Mietkosten über ${mk.jahre} Jahre`,v:fmtK(RMK.mietGesamt)},
            {l:`Immobilienwert nach ${mk.jahre} Jahren`,v:fmtK(RMK.immWert)},
            {l:"Vermögenswert (Eigentum)",v:fmtK(RMK.eigentumsWert)},
          ].map(({l,v},i,arr)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><span style={{fontSize:"12px",color:"#666"}}>{l}</span><span style={{fontSize:"12px",fontWeight:"600",color:"#111"}}>{v}</span></div>))}</div>)}
        </div>
      </>)}

      {/* MODUL: Anschlussfinanzierung */}
      {modul==="anschluss"&&RA&&(<>
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Anschlussfinanzierung · Ihre neue Rate</div>
          <div style={T.resultNumber(RA.diffMonatl>0)}>{fmt(RA.neuRate)}</div>
          <div style={T.resultUnit}>neue monatliche Rate</div>
          {RA.diffMonatl>0
            ? <div style={T.statusWarn}>+{fmt(RA.diffMonatl)}/Monat mehr als bisher</div>
            : <div style={T.statusOk}>Rate günstiger als bisher</div>
          }
          <div style={T.resultSub}>Restschuld {fmtK(anschluss.restschuld)} · {anschluss.neuZins}% Zins · {anschluss.laufzeit} Jahre</div>
        </div>
        <div style={T.section}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            <div style={{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"18px",padding:"16px 14px",background:"#fff"}}>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginBottom:"8px"}}>Aktuelle Rate</div>
              <div style={{fontSize:"26px",fontWeight:"800",color:"#1F2937",letterSpacing:"-1px"}}>{fmt(RA.altRate)}</div>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"4px"}}>/Monat</div>
            </div>
            <div style={{border:`${RA.diffMonatl>0?"1.5px":"1px"} solid ${RA.diffMonatl>0?"rgba(192,57,43,0.27)":"rgba(17,24,39,0.08)"}`,borderRadius:"18px",padding:"16px 14px",background:RA.diffMonatl>0?"rgba(192,57,43,0.025)":"#fff",boxShadow:RA.diffMonatl>0?"0 4px 16px rgba(192,57,43,0.08)":"none"}}>
              <div style={{fontSize:"12px",color:RA.diffMonatl>0?"#C0392B":"#9CA3AF",marginBottom:"8px"}}>Neue Rate</div>
              <div style={{fontSize:"26px",fontWeight:"800",color:RA.diffMonatl>0?WARN:"#1F2937",letterSpacing:"-1px"}}>{fmt(RA.neuRate)}</div>
              <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"4px"}}>/Monat</div>
            </div>
          </div>
          {RA.diffMonatl>0&&(
            <div style={T.warnCard}>
              <div style={T.warnCardTitle}>+{fmt(RA.diffMonatl)}/Monat Mehrbelastung</div>
              <div style={{fontSize:"13px",color:"#7B2A2A",lineHeight:1.65}}>
                Über {anschluss.laufzeit} Jahre summiert sich das auf <strong style={{color:"#C0392B"}}>{fmtK(Math.abs(RA.mehrGesamt))}</strong> Mehrkosten.
              </div>
            </div>
          )}
          <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Details {detailsOpen?"ausblenden":"anzeigen"}
          </button>
          {detailsOpen&&(<div style={T.card}>{[
            {l:"Deine aktuelle Rate",v:fmt(RA.altRate)+"/Mon.",sub:`Zins ${anschluss.altZins}% + Tilgung ${anschluss.tilgung}%`},
            {l:"Deine neue Rate",v:fmt(RA.neuRate)+"/Mon.",sub:`Zins ${anschluss.neuZins}% + Tilgung ${anschluss.tilgung}%`,hl:RA.diffMonatl>0},
            {l:"Unterschied pro Monat",v:(RA.diffMonatl>0?"+":"")+fmt(RA.diffMonatl)+"/Mon.",hl:RA.diffMonatl>0},
            {l:`Mehrkosten über ${anschluss.laufzeit} Jahre`,v:fmtK(Math.abs(RA.mehrGesamt)),hl:RA.diffMonatl>0},
            {l:"Restschuld nach Laufzeit",v:fmtK(RA.altEnde)},
          ].map(({l,v,sub,hl},i,arr)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><div><div style={{fontSize:"12px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div><span style={{fontSize:"12px",fontWeight:"600",color:hl?WARN:"#111",flexShrink:0,marginLeft:"10px"}}>{v}</span></div>))}</div>)}
        </div>
      </>)}

      {/* MODUL: Wohngebäude */}
      {modul==="wg"&&RWG&&(<>
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Wohngebäude · Ihr Versicherungsschutz</div>
          <div style={T.resultNumber(RWG.unterversichert, !RWG.unterversichert&&wg.elementar?"#059669":undefined)}>
            {RWG.unterversichert?fmtK(RWG.deckungsluecke):fmtK(RWG.empfohleneVS)}
          </div>
          <div style={T.resultUnit}>
            {RWG.unterversichert?"mögliche Unterversicherung":"empfohlener Versicherungswert"}
          </div>
          {RWG.unterversichert
            ? <div style={T.statusWarn}>Unterversicherung erkannt</div>
            : !wg.elementar
              ? <div style={T.statusInfo(C)}>Elementarschutz prüfen</div>
              : <div style={T.statusOk}>Gut versichert</div>
          }
          <div style={T.resultSub}>{wg.flaeche} m² · Baujahr {wg.baujahr} · auf Basis Ihrer Angaben</div>
        </div>
        <div style={T.section}>
          {!wg.elementar&&(
            <div style={{...T.warnCard,marginBottom:"12px"}}>
              <div style={T.warnCardTitle}>Elementarschutz fehlt</div>
              <div style={{fontSize:"13px",color:"#7B2A2A",lineHeight:1.65}}>Überschwemmung, Rückstau und Erdrutsch sind im Standard nicht enthalten — und betreffen immer mehr Regionen in Deutschland.</div>
            </div>
          )}
          <button onClick={()=>setDetailsOpen(x=>!x)} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"#aaa",cursor:"pointer",marginBottom:"8px"}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:detailsOpen?"rotate(90deg)":"none"}}><path d="M4 2l4 4-4 4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Details {detailsOpen?"ausblenden":"anzeigen"}
          </button>
          {detailsOpen&&(<div style={T.card}>{[
            {l:"Wohnfläche",v:`${wg.flaeche} m²`},
            {l:"Baupreisindex 2026",v:"ca. 1.950 €/m²",sub:"GDV-Richtwert — regional abweichend"},
            {l:"Alters-/Baukostenzuschlag",v:BAUJAHR_ZUSCHLAG(wg.baujahr)===1?"-":`+${Math.round((BAUJAHR_ZUSCHLAG(wg.baujahr)-1)*100)}%`},
            {l:"Geschätzter Neuwert deiner Immobilie",v:fmtK(RWG.neuwert)},
            ...(wg.photovoltaik?[{l:"PV-Anlage Aufschlag",v:fmtK(RWG.pv_aufschlag)}]:[]),
            {l:"Kalkulierter Versicherungswert",v:fmtK(RWG.empfohleneVS)},
            ...(wg.versSum>0?[{l:"Deine aktuelle Versicherungssumme",v:fmtK(wg.versSum)}]:[]),
          ].map(({l,v,sub},i,arr)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><div><div style={{fontSize:"12px",color:"#666"}}>{l}</div>{sub&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>{sub}</div>}</div><span style={{fontSize:"12px",fontWeight:"600",color:"#111",flexShrink:0,marginLeft:"10px"}}>{v}</span></div>))}</div>)}
        </div>
      </>)}

      {/* Absicherungs-Block */}
      <AbsicherungBlock modul={modul} T={T} RWG={RWG}/>

      <div style={{...T.section,marginBottom:"120px"}}>
        <div style={T.infoBox}>Orientierungs-Check — Näherungswerte. Für verbindliche Angebote empfehlen wir ein persönliches Gespräch.</div>
        <CheckBerechnungshinweis>
          <>
            <strong>Monatsrate</strong> = Darlehen × (Zinssatz + Tilgung) / 12 (Annuitätendarlehen). Restschuld nach n Jahren: exakte Annuitätenformel.
            <strong>Immobilienwert</strong>: Ø 2%/Jahr Wertsteigerung (historischer DE-Mittelwert, keine Garantie). Nebenkosten: 10% des Kaufpreises (Grunderwerbsteuer, Notar, ggf. Makler).
            <strong>Break-even</strong>: Jahr in dem Nettokaufkosten {"<"} kumulative Mietkosten.
          </>
        </CheckBerechnungshinweis>
        <div style={{...T.infoBox,marginTop:"10px"}}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
      </div>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={()=>goTo(4)}>Ergebnis besprechen</button>
        <button style={T.btnSec} onClick={()=>goTo(2)}>Neuen Check starten</button>
      </div>
    </div>);
  }

  // ── Phase 2: Modul-Eingabe (1 Frage pro Screen) ─────────────────────────
  if(phase===2){
    const stepLbl=`Schritt ${scr2} von ${scr2Total}`;

    // ── MK: Kaufen vs. Mieten ──────────────────────────────────────────────
    if(modul==="mk"){
      const screens=[
        {
          eyebrow:"Das Objekt",
          h1:"Was würde die Immobilie kosten?",
          body:"Kaufpreis und Eigenkapital bestimmen, wie viel du finanzieren müsstest.",
          content:(
            <div style={T.card}>
              <div style={T.row}><SliderCard label="Kaufpreis" value={mk.kaufpreis} min={100000} max={1500000} step={10000} unit="€" accent={C} onChange={v=>setM("mk","kaufpreis",v)}/></div>
              <div style={T.rowLast}><SliderCard label="Eigenkapital" value={mk.eigenkapital} min={0} max={500000} step={5000} unit="€" display={`= ${Math.round(mk.eigenkapital/mk.kaufpreis*100)} % Eigenkapitalquote`} accent={C} onChange={v=>setM("mk","eigenkapital",v)}/></div>
            </div>
          ),
        },
        {
          eyebrow:"Die Finanzierung",
          h1:"Zu welchen Konditionen würdest du finanzieren?",
          body:"Zinssatz und Tilgung bestimmen deine monatliche Rate.",
          content:(
            <div style={T.card}>
              <div style={T.row}><SliderCard label="Zinssatz" value={mk.zinsen} min={1} max={8} step={0.1} unit="%" accent={C} onChange={v=>setM("mk","zinsen",v)}/></div>
              <div style={T.rowLast}><SliderCard label="Tilgungsrate" value={mk.tilgung} min={1} max={5} step={0.5} unit="%" accent={C} onChange={v=>setM("mk","tilgung",v)}/></div>
            </div>
          ),
        },
        {
          eyebrow:"Der Vergleich",
          h1:"Was zahlst du aktuell für Miete?",
          body:"Wir vergleichen Kaufen und Mieten auf Basis deiner aktuellen Miete.",
          content:(
            <div style={T.card}>
              <div style={T.rowLast}><SliderCard label="Aktuelle Miete" value={mk.miete} min={300} max={4000} step={50} unit="€/Mon." accent={C} onChange={v=>setM("mk","miete",v)}/></div>
            </div>
          ),
        },
        {
          eyebrow:"Der Zeitraum",
          h1:"Über welchen Zeitraum soll verglichen werden?",
          body:"Je länger der Zeitraum, desto klarer wird, ob sich Kaufen lohnt.",
          content:(
            <div style={T.card}>
              <div style={T.row}><SliderCard label="Mietsteigerung p.a." value={mk.mietSteigerung} min={0} max={5} step={0.5} unit="%" accent={C} onChange={v=>setM("mk","mietSteigerung",v)}/></div>
              <div style={T.rowLast}><SliderCard label="Betrachtungszeitraum" value={mk.jahre} min={5} max={30} step={1} unit="Jahre" accent={C} onChange={v=>setM("mk","jahre",v)}/></div>
            </div>
          ),
        },
      ];
      const s=screens[scr2-1];
      return(<div style={T.page} key={ak} className="fade-in"><Header phase={curStep} total={totalSteps} />
        <div style={T.hero}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
            <div style={{fontSize:"10px",fontWeight:"700",color:C,letterSpacing:"0.8px",textTransform:"uppercase"}}>{s.eyebrow}</div>
            <div style={{fontSize:"10px",color:"#ccc"}}>·</div>
            <div style={{fontSize:"10px",color:"#bbb"}}>{stepLbl}</div>
          </div>
          <div style={T.h1}>{s.h1}</div>
          <div style={T.body}>{s.body}</div>
        </div>
        <div style={T.section}>{s.content}</div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr2}>{scr2<scr2Total?"Weiter":"Ergebnis anzeigen"}</button>
          <button style={T.btnSec} onClick={backScr2}>Zurück</button>
        </div>
      </div>);
    }

    // ── Anschlussfinanzierung ──────────────────────────────────────────────
    if(modul==="anschluss"){
      const screens=[
        {
          eyebrow:"Deine aktuelle Finanzierung",
          h1:"Wie hoch ist deine Restschuld bei Ablauf?",
          body:"Das ist der Betrag, der bei der Anschlussfinanzierung neu verhandelt wird.",
          content:(
            <div style={T.card}>
              <div style={T.rowLast}><SliderCard label="Restschuld bei Anschluss" value={anschluss.restschuld} min={50000} max={800000} step={5000} unit="€" accent={C} onChange={v=>setM("anschluss","restschuld",v)}/></div>
            </div>
          ),
        },
        {
          eyebrow:"Die Zinsen",
          h1:"Wie verändern sich deine Zinsen?",
          body:"Trage deinen alten und einen realistischen neuen Zinssatz ein.",
          content:(
            <div style={T.card}>
              <div style={T.row}><SliderCard label="Dein aktueller Zinssatz" value={anschluss.altZins} min={0.5} max={5} step={0.1} unit="%" hint="Aus deinem laufenden Darlehensvertrag" accent={C} onChange={v=>setM("anschluss","altZins",v)}/></div>
              <div style={T.rowLast}><SliderCard label="Neuer Zinssatz (Schätzung)" value={anschluss.neuZins} min={1} max={8} step={0.1} unit="%" hint="Aktuelles Marktniveau für deine Laufzeit" accent={C} onChange={v=>setM("anschluss","neuZins",v)}/></div>
            </div>
          ),
        },
        {
          eyebrow:"Die Laufzeit",
          h1:"Wie lange soll die neue Zinsbindung laufen?",
          body:"Längere Bindung gibt Planungssicherheit — kürzere mehr Flexibilität.",
          content:(
            <div style={T.card}>
              <div style={T.row}><SliderCard label="Tilgungsrate" value={anschluss.tilgung} min={1} max={5} step={0.5} unit="%" accent={C} onChange={v=>setM("anschluss","tilgung",v)}/></div>
              <div style={T.rowLast}><SliderCard label="Neue Zinsbindung" value={anschluss.laufzeit} min={5} max={20} step={1} unit="Jahre" accent={C} onChange={v=>setM("anschluss","laufzeit",v)}/></div>
            </div>
          ),
        },
      ];
      const s=screens[scr2-1];
      return(<div style={T.page} key={ak} className="fade-in"><Header phase={curStep} total={totalSteps} />
        <div style={T.hero}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
            <div style={{fontSize:"10px",fontWeight:"700",color:C,letterSpacing:"0.8px",textTransform:"uppercase"}}>{s.eyebrow}</div>
            <div style={{fontSize:"10px",color:"#ccc"}}>·</div>
            <div style={{fontSize:"10px",color:"#bbb"}}>{stepLbl}</div>
          </div>
          <div style={T.h1}>{s.h1}</div>
          <div style={T.body}>{s.body}</div>
        </div>
        <div style={T.section}>{s.content}</div>
        <div style={{height:"120px"}}/>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr2}>{scr2<scr2Total?"Weiter":"Ergebnis anzeigen"}</button>
          <button style={T.btnSec} onClick={backScr2}>Zurück</button>
        </div>
      </div>);
    }

    // ── Wohngebäude ────────────────────────────────────────────────────────
    const screens=[
      {
        eyebrow:"Das Gebäude",
        h1:"Wie groß ist deine Immobilie?",
        body:"Wohnfläche und Baujahr sind die wichtigsten Faktoren für den Versicherungswert.",
        content:(
          <div style={T.card}>
            <div style={T.row}><SliderCard label="Wohnfläche" value={wg.flaeche} min={40} max={500} step={5} unit="m²" accent={C} onChange={v=>setM("wg","flaeche",v)}/></div>
            <div style={T.rowLast}><SliderCard label="Baujahr" value={wg.baujahr} min={1900} max={2024} step={1} unit="" display={wg.baujahr<1950?"Altbau — höhere Kosten":wg.baujahr<1990?"Bestandsbau":"Neuerer Bau"} accent={C} onChange={v=>setM("wg","baujahr",v)}/></div>
          </div>
        ),
      },
      {
        eyebrow:"Die Bauart",
        h1:"Wie ist dein Haus gebaut?",
        body:"Die Bauart beeinflusst die Wiederherstellungskosten im Schadensfall.",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              {v:"massiv",l:"Massivbau",d:"Standard-Faktor für Neuwert"},
              {v:"fertig",l:"Fertighaus",d:"Oft günstigerer Wiederherstellungswert"},
              {v:"holz",l:"Holzbau",d:"Besondere Brand- und Feuchte-Risiken"},
              {v:"denkmal",l:"Denkmal",d:"Höherer Wiederherstellungsaufwand"},
            ].map(({v,l,d})=>(
              <button key={v} onClick={()=>{setM("wg","bauart",v);}} style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px 18px",borderRadius:"14px",border:`1.5px solid ${wg.bauart===v?C:"rgba(17,24,39,0.1)"}`,background:wg.bauart===v?`${C}07`:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.18s",boxShadow:wg.bauart===v?`0 4px 14px ${C}18`:"none"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"15px",fontWeight:"700",color:wg.bauart===v?C:"#111"}}>{l}</div>
                  <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"3px"}}>{d}</div>
                </div>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`1.5px solid ${wg.bauart===v?C:"#ddd"}`,background:wg.bauart===v?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {wg.bauart===v&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>
            ))}
          </div>
        ),
      },
      {
        eyebrow:"Deine Absicherung",
        h1:"Wie hoch ist deine aktuelle Versicherungssumme?",
        body:"Und gibt es besondere Merkmale an deiner Immobilie?",
        content:(
          <>
            <div style={{...T.card,marginBottom:"14px"}}>
              <div style={T.rowLast}><SliderCard label="Aktuelle Versicherungssumme" value={wg.versSum} min={0} max={2000000} step={10000} unit="€" hint="Aus deinem laufenden Wohngebäudevertrag" accent={C} onChange={v=>setM("wg","versSum",v)}/></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <button onClick={()=>setM("wg","photovoltaik",!wg.photovoltaik)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px 18px",borderRadius:"14px",border:`1.5px solid ${wg.photovoltaik?C:"rgba(17,24,39,0.1)"}`,background:wg.photovoltaik?`${C}07`:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.18s"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"14px",fontWeight:"600",color:wg.photovoltaik?C:"#111"}}>Photovoltaik-Anlage vorhanden</div>
                  <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"3px",lineHeight:1.5}}>Muss in der Wohngebäudeversicherung separat berücksichtigt werden</div>
                </div>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`1.5px solid ${wg.photovoltaik?C:"#ddd"}`,background:wg.photovoltaik?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {wg.photovoltaik&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>
              <button onClick={()=>setM("wg","elementar",!wg.elementar)} style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px 18px",borderRadius:"14px",border:`1.5px solid ${wg.elementar?C:"rgba(17,24,39,0.1)"}`,background:wg.elementar?`${C}07`:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.18s"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"14px",fontWeight:"600",color:wg.elementar?C:"#111"}}>Elementarschutz prüfen</div>
                  <div style={{fontSize:"12px",color:"#9CA3AF",marginTop:"3px",lineHeight:1.5}}>Überschwemmung, Rückstau und Erdrutsch sind im Standard oft nicht enthalten</div>
                </div>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`1.5px solid ${wg.elementar?C:"#ddd"}`,background:wg.elementar?C:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {wg.elementar&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>
            </div>
          </>
        ),
      },
    ];
    const s=screens[scr2-1];
    return(<div style={T.page} key={ak} className="fade-in"><Header phase={curStep} total={totalSteps} />
      <div style={T.hero}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
          <div style={{fontSize:"10px",fontWeight:"700",color:C,letterSpacing:"0.8px",textTransform:"uppercase"}}>{s.eyebrow}</div>
          <div style={{fontSize:"10px",color:"#ccc"}}>·</div>
          <div style={{fontSize:"10px",color:"#bbb"}}>{stepLbl}</div>
        </div>
        <div style={T.h1}>{s.h1}</div>
        <div style={T.body}>{s.body}</div>
      </div>
      <div style={T.section}>{s.content}</div>
      <div style={{height:"120px"}}/>
      <div style={T.footer}>
        <button style={T.btnPrim(false)} onClick={nextScr2}>{scr2<scr2Total?"Weiter":"Ergebnis anzeigen"}</button>
        <button style={T.btnSec} onClick={backScr2}>Zurück</button>
      </div>
    </div>);
  }

  // ── Phase 1: Premium Modulwahl ───────────────────────────────────────────
  const MOD_OPTS=[
    {
      sit:"mieter",mod:"mk",letter:"A",
      label:"Kaufen oder mieten",
      sub:"Break-even-Analyse",
      desc:"Sie sehen sofort, ob sich Kaufen langfristig lohnt — oder ob Mieten die bessere Wahl bleibt.",
      kpi:"Monatlicher Unterschied",
      accent:"#1D4ED8",
    },
    {
      sit:"kaufplan",mod:"anschluss",letter:"B",
      label:"Finanzierung prüfen",
      sub:"Ratenvergleich",
      desc:"Wie verändert sich Ihre Rate bei der Anschlussfinanzierung? Was bleibt nach Ablauf der Zinsbindung?",
      kpi:"Rate alt vs. neu",
      accent:"#0369A1",
    },
    {
      sit:"eigentuemer",mod:"wg",letter:"C",
      label:"Wohngebäude prüfen",
      sub:"Versicherungssumme",
      desc:"Ist Ihre Wohngebäudeversicherung ausreichend? Unterversicherung ist häufiger als gedacht.",
      kpi:"Empfohlener Versicherungswert",
      accent:"#065F46",
    },
  ];

  return(<div style={T.page} key={ak} className="fade-in"><Header phase={curStep} total={totalSteps} />
    <div style={{padding:"36px 24px 20px"}}>
      <div style={{fontSize:"11px",fontWeight:"700",color:"#9CA3AF",letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:"8px"}}>Immobilien-Check</div>
      <div style={{fontSize:"24px",color:"#111",lineHeight:1.2,marginBottom:"6px",...CHECKKIT_HERO_TITLE_TYPO}}>Was möchten Sie prüfen?</div>
      <div style={{fontSize:"14px",color:"#9CA3AF",lineHeight:1.6}}>Wählen Sie ein Thema — der Check passt sich automatisch an.</div>
    </div>

    <div style={{padding:"0 24px",display:"flex",flexDirection:"column",gap:"14px",paddingBottom:"40px"}}>
      {MOD_OPTS.map(({sit,mod,letter,label,sub,desc,kpi,accent:ac})=>(
        <button
          key={mod}
          onClick={()=>{setSituation(sit);setModul(mod);goTo(2);}}
          style={{
            display:"block",width:"100%",padding:"0",
            borderRadius:"18px",
            border:`1.5px solid rgba(17,24,39,0.1)`,
            background:"#fff",
            cursor:"pointer",textAlign:"left",
            boxShadow:"0 4px 16px rgba(17,24,39,0.06)",
            transition:"all 0.22s",
            overflow:"hidden",
          }}
        >
          {/* Farbige Top-Bar */}
          <div style={{height:"3px",background:ac,borderRadius:"18px 18px 0 0"}}/>
          <div style={{padding:"22px 22px 20px"}}>
            {/* Letter + KPI */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"14px"}}>
              <div style={{
                width:"38px",height:"38px",borderRadius:"10px",
                background:`${ac}12`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"18px",fontWeight:"800",color:ac,
              }}>{letter}</div>
              <div style={{
                padding:"4px 10px",borderRadius:"20px",
                background:`${ac}10`,
                fontSize:"11px",fontWeight:"600",color:ac,
                letterSpacing:"0.2px",marginTop:"2px",
              }}>{kpi}</div>
            </div>
            {/* Titel */}
            <div style={{fontSize:"18px",fontWeight:"800",color:"#111",letterSpacing:"-0.4px",lineHeight:1.2,marginBottom:"4px"}}>{label}</div>
            <div style={{fontSize:"11px",fontWeight:"600",color:ac,letterSpacing:"0.3px",textTransform:"uppercase",marginBottom:"12px"}}>{sub}</div>
            {/* Beschreibung */}
            <div style={{fontSize:"13px",color:"#6B7280",lineHeight:1.65,marginBottom:"18px"}}>{desc}</div>
            {/* CTA-Zeile */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:ac}}>Jetzt prüfen</div>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>);
}
