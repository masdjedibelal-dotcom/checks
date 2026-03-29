import { useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import ResultPage from "@/components/checks/gkvpkv/ResultPage";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fafafa;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}.gkvpkv-smart-block{animation:fadeIn 0.42s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e2e8f0;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
// JAEG 2026: 77.400 € / Jahr = 6.450 € / Monat
const JAEG_MONAT = 6450;
const BBG_KV    = 5812.5;

function berechne({ brutto, beruf, alter, familiensituation, partnerKV }) {
  const unterGrenze  = beruf === "angestellt" && brutto < JAEG_MONAT;
  const hatKinder    = familiensituation === "partner_kinder";
  const hatPartner   = familiensituation !== "single";
  const partnerInGKV = hatPartner && partnerKV === "gkv";

  // GKV AN-Anteil (8,75 % bis BBG) — nur für Orientierung im Kontext
  const gkvANAnteil = Math.round(Math.min(brutto, BBG_KV) * 0.0875);
  const agAnteil    = beruf === "angestellt" ? gkvANAnteil : 0;

  // Empfehlung — nur strukturell, kein Tarifvergleich
  let empfehlung, headline, subline;
  if (unterGrenze) {
    empfehlung = "gkv";
    headline   = "Aktuell: GKV Pflicht";
    subline    = "Einkommensgrenze 6.450 € noch nicht erreicht";
  } else if (beruf === "beamter") {
    empfehlung = "pkv";
    headline   = "PKV für Sie naheliegend";
    subline    = "Beihilfe macht PKV für Beamte typisch sinnvoll";
  } else if (hatKinder || partnerInGKV) {
    empfehlung = "gkv";
    headline   = "GKV aktuell sinnvoll";
    subline    = "Familienversicherung spricht für GKV";
  } else {
    empfehlung = "offen";
    headline   = "PKV grundsätzlich möglich";
    subline    = beruf === "selbst"
      ? "Freie Wahl — keine Pflichtversicherung"
      : "Einkommensgrenze überschritten";
  }

  return { unterGrenze, hatKinder, hatPartner, partnerInGKV,
           gkvANAnteil, agAnteil, empfehlung, headline, subline, alter, brutto };
}
function makeGKVPKVT(C){return{page:{minHeight:"100vh",background:"#fafafa",fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderBottom:"1px solid #f1f5f9",padding:"0 28px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between"},brandMark:{fontSize:"15px",fontWeight:"700",letterSpacing:"-0.03em",color:"#0f172a"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"10px",fontWeight:"600",color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase"},prog:{height:"2px",background:"#f1f5f9"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"44px 28px 32px"},eyebrow:{fontSize:"10px",fontWeight:"600",color:"#94a3b8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"14px"},h1:{fontSize:"24px",fontWeight:"700",color:"#0f172a",lineHeight:1.22,letterSpacing:"-0.55px"},body:{fontSize:"15px",color:"#64748b",lineHeight:1.65,marginTop:"12px"},section:{padding:"0 28px",marginBottom:"32px"},divider:{height:"1px",background:"#f1f5f9",margin:"0 28px 28px"},card:{border:"1px solid #eef2f6",borderRadius:"12px",overflow:"hidden",background:"#fff"},row:{padding:"14px 16px",borderBottom:"1px solid #f1f5f9"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#475569",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#94a3b8",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",borderTop:"1px solid #f1f5f9",padding:"16px 28px max(28px, env(safe-area-inset-bottom, 28px))"},btnPrim:(d)=>({width:"100%",padding:"14px 20px",background:d?"#e2e8f0":C,color:d?"#94a3b8":"#fff",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#94a3b8",fontSize:"13px",marginTop:"8px",cursor:"pointer"},infoBox:{padding:"14px 16px",background:"#f8fafc",borderRadius:"10px",fontSize:"13px",color:"#64748b",lineHeight:1.6},inputEl:{width:"100%",padding:"12px 14px",border:"1px solid #e2e8f0",borderRadius:"8px",fontSize:"14px",color:"#0f172a",background:"#fff",outline:"none"},optBtn:(a,c)=>({padding:"10px 14px",borderRadius:"8px",border:`1px solid ${a?(c||C):"#e2e8f0"}`,background:a?(c||C):"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#334155",transition:"all 0.15s",cursor:"pointer"}),
resultHero:{padding:"48px 28px 36px",textAlign:"center",background:"transparent"},
resultEyebrow:{fontSize:"10px",fontWeight:"600",color:"#94a3b8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"12px"},
resultNumber:(C2)=>({fontSize:"52px",fontWeight:"800",color:C2,letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"}),
resultUnit:{fontSize:"14px",color:"#94a3b8",marginBottom:"18px"},
resultH1:{fontSize:"24px",fontWeight:"800",letterSpacing:"-0.55px",lineHeight:1.2,color:"#0f172a"},
resultBody:{fontSize:"15px",color:"#64748b",lineHeight:1.65},
tableIntro:{fontSize:"13px",color:"#64748b",lineHeight:1.55},
pillAgency:{display:"inline-flex",alignItems:"center",padding:"6px 14px",borderRadius:"999px",fontSize:"11px",fontWeight:"600",letterSpacing:"0.06em",textTransform:"uppercase",color:"#64748b",background:"#f1f5f9",border:"1px solid #e2e8f0"},
matrixMuted:{fontSize:"12px",fontWeight:"600",color:"#94a3b8",marginBottom:"8px"},
matrixCellText:{fontSize:"12px",color:"#64748b",lineHeight:1.45},
heroStepTitle:{marginTop:"36px",fontSize:"17px",fontWeight:"600",color:"#0f172a",letterSpacing:"-0.02em",lineHeight:1.3},
heroStepHint:{marginTop:"8px",fontSize:"14px",color:"#94a3b8",lineHeight:1.6,maxWidth:"36ch"},
dankePadding:{padding:"48px 28px",textAlign:"center"},
dankeTitle:{fontSize:"22px",fontWeight:"700",color:"#0f172a",marginBottom:"10px"},
dankeBody:{fontSize:"15px",color:"#64748b",lineHeight:1.65,marginBottom:"28px"},
dankeCard:{border:"1px solid #e2e8f0",borderRadius:"12px",overflow:"hidden",textAlign:"left",background:"#fff"},
dankeCardHead:{padding:"14px 16px",borderBottom:"1px solid #f1f5f9"},
dankeEyebrow:{fontSize:"11px",color:"#94a3b8",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"4px"},
dankeName:{fontSize:"14px",fontWeight:"600",color:"#0f172a"},
dankeFirma:{fontSize:"12px",color:"#94a3b8",marginTop:"1px"},
dankeContacts:{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"},
dankeLinkBtn:{marginTop:"20px",fontSize:"13px",color:"#94a3b8",cursor:"pointer",background:"none",border:"none",fontFamily:"inherit"},
kontaktSummary:{border:"1px solid #e2e8f0",borderRadius:"12px",padding:"12px 14px",background:"#fff",marginBottom:"16px"},
kontaktSummarySub:{fontSize:"12px",color:"#94a3b8"},
demoNotice:{fontSize:"13px",color:"#94a3b8",textAlign:"center",marginBottom:"14px",lineHeight:1.5},
insightText:{fontSize:"13px",lineHeight:1.65,color:"#334155",fontWeight:500},
infoHintBox:{marginTop:"12px",padding:"12px 14px",borderRadius:"10px",background:"#f8fafc",border:"1px solid #e2e8f0"},
infoHintText:{fontSize:"12px",lineHeight:1.6,color:"#64748b",fontWeight:500},
smartPillRow:{display:"inline-flex",alignItems:"flex-start",gap:"10px",padding:"14px 16px",borderRadius:"14px",maxWidth:"100%"},
smartPillText:{fontSize:"13px",lineHeight:1.65,color:"#334155",fontWeight:500},
statusOk:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#15803D"},
statusInfo:(C2)=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:`${C2}0d`,border:`1px solid ${C2}33`,borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:C2}),
statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
resultSub:{fontSize:"13px",color:"#94a3b8",lineHeight:1.55,marginTop:"12px"},
warnCard:{background:"#FFF6F5",border:"1px solid #F2D4D0",borderLeft:"3px solid #C0392B",borderRadius:"14px",padding:"18px 20px"},
warnCardTitle:{fontSize:"13px",fontWeight:"700",color:"#C0392B",marginBottom:"6px"},
warnCardText:{fontSize:"13px",color:"#7B2A2A",lineHeight:1.65},
warnCardNote:{fontSize:"12px",color:"#94a3b8",marginTop:"10px"},
cardPrimary:{border:"1px solid #e2e8f0",borderRadius:"16px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 4px 20px rgba(15,23,42,0.06)"},
cardContext:{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"18px 20px"},
sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#64748b",marginBottom:"12px"},
compareMuted:{fontSize:"12px",color:"#64748b",lineHeight:1.55},
infoGridFocus:{fontSize:"10px",fontWeight:"600",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8",marginBottom:"6px",lineHeight:1.35},
infoGridTitle:{fontSize:"15px",fontWeight:"700",color:"#0f172a",marginBottom:"8px",lineHeight:1.3},
infoGridBody:{fontSize:"13px",color:"#64748b",lineHeight:1.65},
fahrplanIntro:{fontSize:"14px",color:"#64748b",maxWidth:"34ch",margin:"0 auto",lineHeight:1.6},
fahrplanStepTitle:{fontSize:"14px",fontWeight:"700",color:"#0f172a",marginBottom:"5px",lineHeight:1.3},
fahrplanStepText:{fontSize:"13px",color:"#64748b",lineHeight:1.6},
fahrplanCard:{display:"flex",gap:"14px",alignItems:"flex-start",padding:"14px 16px",borderRadius:"14px",border:"1px solid #e2e8f0",background:"#fff"},
infoGridShell:{border:"1px solid #e2e8f0",borderRadius:"14px",padding:"16px 16px 17px",background:"#fff",boxShadow:"0 1px 6px rgba(15,23,42,0.04)"},
infoGridIconWrap:{width:"42px",height:"42px",borderRadius:"11px",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",flexShrink:0},
};}
const KV_WIZARD_STEPS = 5;
function KvNavigatorHeader({ T }) {
  return (
    <div style={T.header}>
      <span style={T.brandMark}>KV-Navigator</span>
      <span style={T.badge}>Krankenversicherung</span>
    </div>
  );
}
export default function GKVPKVRechner(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makeGKVPKVT(C),[C]);
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [ak, setAk]       = useState(0);
  const [danke, setDanke] = useState(false);
  const [fd, setFd]       = useState({ name: "", email: "", tel: "" });
  const [kontaktConsent, setKontaktConsent] = useState(false);

  const [p, setP] = useState({
    brutto:               4500,
    beruf:                "angestellt",
    alter:                32,
    familiensituation:    "single",
    partnerKV:            "keine",
    haushaltMehrverdiener: null,
    /** 1 | 2 | 3 (3 = drei oder mehr) — nur bei partner_kinder */
    kinderImHaushalt:     null,
  });
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));

  const [scr, setScr] = useState(1);
  const [famSubStep, setFamSubStep] = useState(0);

  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setFamSubStep(0);
      setP((x) => ({ ...x, kinderImHaushalt: null }));
    }
  };

  const nextScr = () => {
    if (scr < 3) setScr((s) => s + 1);
    else if (scr === 3) {
      setFamSubStep(0);
      setScr(4);
    }
  };

  const backScr = () => {
    if (scr === 4 && famSubStep > 0) {
      setFamSubStep((s) => s - 1);
      return;
    }
    if (scr > 1) setScr((s) => s - 1);
  };

  const wizardProgPct = useMemo(() => {
    if (scr < 4) return scr * 20;
    return Math.min(100, 80 + famSubStep * 8);
  }, [scr, famSubStep]);

  const famCase = useMemo(() => {
    const jaegOkAngestellt = p.beruf === "angestellt" && p.brutto >= JAEG_MONAT;
    const pk = p.familiensituation === "partner_kinder";
    return {
      showEarningsQuestion: pk && (jaegOkAngestellt || p.beruf === "selbst"),
      showBeihilfePill: pk && p.beruf === "beamter",
      showGkvKinderPill: pk && p.beruf === "angestellt" && p.brutto < JAEG_MONAT,
    };
  }, [p.beruf, p.brutto, p.familiensituation]);

  const partnerKvDone = ["gkv", "pkv", "nicht_erwerb"].includes(p.partnerKV);
  const earningsDone =
    p.haushaltMehrverdiener === "ich" ||
    p.haushaltMehrverdiener === "partner" ||
    p.haushaltMehrverdiener === "gleich";

  const finishFamilyWizard = () => {
    goTo(2);
  };

  useCheckScrollToTop([phase, ak, danke, scr]);

  const R = berechne(p);

  /** Screen 2/5: Einkommen — Texte abhängig von Beruf (Screen 1); JAEG-Box nur Angestellte */
  const einkommenSchritt = useMemo(() => {
    switch (p.beruf) {
      case "selbst":
        return {
          h1: "Wie hoch ist Ihr monatlicher Gewinn?",
          sliderLabel: "Monatlicher Gewinn (vor Steuern)",
          body: "Unabhängig vom Einkommen haben Sie die freie Wahl des Systems.",
          showJaegBox: false,
        };
      case "beamter":
        return {
          h1: "Wie hoch ist Ihre monatliche Besoldung?",
          sliderLabel: "Brutto-Besoldung (inkl. Zulagen)",
          body: "Ihre Besoldung ist die Basis für Ihren Beihilfeanspruch.",
          showJaegBox: false,
        };
      default:
        return {
          h1: "Wie hoch ist Ihr monatliches Bruttoeinkommen?",
          sliderLabel: "Monatliches Bruttogehalt",
          body: "Der Abgleich mit der Jahresarbeitsentgeltgrenze (JAEG 2026) zeigt, ob Sie als Arbeitnehmer in die PKV wechseln dürfen — darunter besteht Versicherungspflicht in der GKV.",
          showJaegBox: true,
        };
    }
  }, [p.beruf]);

  // Danke
  if(danke)return(
    <div style={{...T.page,"--accent":C}}>
      <KvNavigatorHeader T={T} />
      <div style={T.dankePadding} className="fade-in">
        <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={T.dankeTitle}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
        <div style={T.dankeBody}>Wir prüfen Ihre Angaben und melden uns innerhalb von 24 Stunden mit den nächsten Schritten.</div>
        <div style={T.dankeCard}>
          <div style={T.dankeCardHead}>
            <div style={T.dankeEyebrow}>Ihr Ansprechpartner</div>
            <div style={T.dankeName}>{MAKLER.name}</div>
            <div style={T.dankeFirma}>{MAKLER.firma}</div>
          </div>
          <div style={T.dankeContacts}>
            <a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a>
            <a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a>
          </div>
        </div>
        <button type="button" onClick={()=>{setDanke(false);setPhase(1);setScr(1);setFamSubStep(0);setP((x)=>({...x,kinderImHaushalt:null}));}} style={T.dankeLinkBtn}>Neue Berechnung starten</button>
      </div>
    </div>
  );

  // ── Phase 3: Kontakt ─────────────────────────────────────────────────────
  if(phase===3){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <KvNavigatorHeader T={T} />
        <div style={T.prog}><div style={T.progFil(100)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Fast geschafft</div><div style={T.h1}>Wo können wir Sie erreichen?</div><div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit Ihrem Ergebnis.</div></div>
        <div style={T.section}>
          <div style={T.kontaktSummary}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: C, letterSpacing: "-0.3px", marginBottom: "2px" }}>{R.headline}</div>
            <div style={T.kontaktSummarySub}>{R.subline}</div>
          </div>
          {isDemo && (
            <div style={T.demoNotice}>
              Live-Vorschau für Sie als Makler — Ihr Kunde durchläuft dieselben Schritte; „Anpassen & kaufen“ öffnet den Konfigurator.
            </div>
          )}
          <CheckKontaktLeadLine />
          <div style={T.card}>
            {[{k:"name",l:"Ihr Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Ihre E-Mail",t:"email",ph:"ihre@email.de",req:true},{k:"tel",l:"Ihre Telefonnummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/>{hint&&<div style={T.fldHint}>{hint}</div>}</div>
            ))}
          </div>
          <div style={{marginTop:"14px",marginBottom:"100px"}}>
            <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
          </div>
        </div>
        <div style={T.footer}>
          {isDemo ? (
            <>
              <button
                type="button"
                style={T.btnPrim(false)}
                onClick={() =>
                  window.parent.postMessage(
                    { type: "openConfig", slug: "gkv-pkv" },
                    "*",
                  )
                }
              >
                Anpassen & kaufen
              </button>
              <button type="button" style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button>
            </>
          ) : (
            <><button type="button" style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"gkv-pkv",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setDanke(true);}} disabled={!valid}>{valid?"Individuelle Einschätzung erhalten":"Bitte alle Angaben machen"}</button><button type="button" style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></>
          )}
        </div>
      </div>
    );
  }

  // ── Phase 2: Ergebnis (5 Ergebnis-Pfade → ResultPage) ───────────────────
  if (phase === 2) {
    const FAKTOREN = [
      {
        label: "Kinder",
        gkv: R.hatKinder ? "Beitragsfrei mitversichert (unter Voraussetzungen)" : "Beitragsfrei möglich, wenn kein eigenes Einkommen",
        pkv: R.hatKinder ? "Eigener Tarif je Kind notwendig" : "Kein Unterschied ohne Kinder",
        fav: R.hatKinder ? "gkv" : "neutral",
      },
      {
        label: "Alter",
        gkv: "Beitrag steigt mit dem Einkommen, nicht mit dem Alter",
        pkv: R.alter < 35 ? "Jetzt günstig einsteigen — je früher, desto besser" : R.alter < 50 ? "Altersrückstellungen bereits aufgebaut" : "Wechsel wird zunehmend teurer",
        fav: R.alter < 35 ? "pkv" : R.alter > 45 ? "gkv" : "neutral",
      },
      {
        label: "Einkommen",
        gkv: "Einkommensabhängig — Beitrag steigt proportional",
        pkv: "Einkommensunabhängig — individueller Risikobeitrag",
        fav: R.brutto > 7000 ? "pkv" : "gkv",
      },
      {
        label: "Gesundheit",
        gkv: "Keine Gesundheitsprüfung — Aufnahme immer garantiert",
        pkv: "Gesundheitsprüfung bei Aufnahme — Risikoaufschlag möglich",
        fav: "gkv",
      },
    ];

    return (
      <ResultPage
        key={ak}
        R={R}
        p={p}
        T={T}
        accentColor={C}
        maklerFirma={MAKLER.firma}
        goTo={goTo}
        FAKTOREN={FAKTOREN}
      />
    );
  }

  // ── Phase 1: Wizard (Screens 1–4, Familie mit Smart-Substeps) ────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <KvNavigatorHeader T={T} />
      <div style={T.prog}><div style={T.progFil(wizardProgPct)} /></div>
      {scr === 4 && (
        <div
          style={{
            padding: "10px 28px 0",
            fontSize: "11px",
            fontWeight: 500,
            color: "#94a3b8",
            textAlign: "center",
            letterSpacing: "0.04em",
          }}
        >
          Analyse von: {MAKLER.firma}
        </div>
      )}

      {/* Screen 1: Beschäftigung — Einstiegs-Hero */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>KV-Navigator · Schritt 1 von {KV_WIZARD_STEPS}</div>
          <div style={{ ...T.h1, fontSize: "26px", maxWidth: "18ch" }}>Ihr Wegweiser im Krankenversicherungs-System</div>
          <div style={{ ...T.body, marginTop: "18px", maxWidth: "38ch" }}>
            GKV oder PKV? Finden Sie in 2 Minuten heraus, welches System wirklich zu Ihrer Lebensplanung passt.
          </div>
          <div style={T.heroStepTitle}>Wie sind Sie aktuell beschäftigt?</div>
          <div style={T.heroStepHint}>Davon hängt ab, ob Sie als Arbeitnehmer überhaupt in die PKV wechseln können.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { v: "angestellt", l: "Angestellt",    d: "Pflichtversichert bis zur Einkommensgrenze (6.450 €/Mon.)", emoji: "💼" },
              { v: "selbst",     l: "Selbstständig", d: "Freie Wahl zwischen GKV und PKV",                          emoji: "🧑‍💻" },
              { v: "beamter",    l: "Beamter",       d: "Beihilfe vom Dienstherrn — PKV fast immer sinnvoller",     emoji: "🏛️" },
            ].map(({ v, l, d, emoji }) => (
              <SelectionCard key={v} value={v} label={l} description={d}
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                selected={p.beruf === v} accent={C} onClick={() => set("beruf", v)} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
        </div>
      </>}

      {/* Screen 2: Einkommen — Wording & JAEG-Box abhängig von Beruf (Screen 1) */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>KV-Navigator · Schritt 2 von {KV_WIZARD_STEPS}</div>
          <div style={T.h1}>{einkommenSchritt.h1}</div>
          <div style={T.body}>{einkommenSchritt.body}</div>
        </div>
        <div style={T.section}>
          <SliderCard
            label={einkommenSchritt.sliderLabel}
            value={p.brutto}
            min={1000}
            max={15000}
            step={100}
            unit="€"
            accent={C}
            onChange={(v) => set("brutto", v)}
          />
          {einkommenSchritt.showJaegBox && (() => {
            const jaegOk = p.brutto >= JAEG_MONAT;
            return (
            <div
              style={{
                ...T.infoBox,
                marginTop: "12px",
                borderLeft: `3px solid ${jaegOk ? C : "#f59e0b"}`,
                background: jaegOk ? `${C}0d` : "#fffbeb",
                border: jaegOk ? `1px solid ${C}26` : "1px solid #fde68a",
                borderRadius: "8px",
              }}
            >
              <div style={T.insightText}>
                {jaegOk
                  ? "Sie liegen über der Versicherungspflichtgrenze. Damit steht Ihnen der Weg in die PKV grundsätzlich offen."
                  : "Sie liegen aktuell unter der Versicherungspflichtgrenze (JAEG 2026). Ein Wechsel in die PKV ist gesetzlich erst ab 6.450 € mtl. möglich."}
              </div>
            </div>
            );
          })()}
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 3: Alter — PKV-Beiträge & Altersrückstellungen; Hinweis ab > 50 */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>KV-Navigator · Schritt 3 von {KV_WIZARD_STEPS}</div>
          <div style={T.h1}>Wie alt sind Sie?</div>
          <div style={T.body}>
            Ihr Eintrittsalter bestimmt maßgeblich Ihre PKV-Beiträge und den Aufbau Ihrer Altersrückstellungen.
          </div>
        </div>
        <div style={T.section}>
          <SliderCard
            label="Ihr aktuelles Alter"
            value={p.alter}
            min={18}
            max={60}
            step={1}
            unit="Jahre"
            accent={C}
            onChange={(v) => set("alter", v)}
          />
          {p.alter > 50 && (
            <div style={T.infoHintBox}>
              <div style={T.infoHintText}>
                Hinweis: Ab 50 Jahren ist ein Wechsel in die PKV besonders sorgfältig zu prüfen, da die Zeit für den
                Aufbau von Altersrückstellungen kürzer ist.
              </div>
            </div>
          )}
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 4: Familie — Smart-Steps (Single direkt zum Ergebnis; Partner → KV; Kinder → Experten-Weiche) */}
      {scr === 4 && (() => {
        const kinderZahlOk =
          p.familiensituation !== "partner_kinder" ||
          p.kinderImHaushalt === 1 ||
          p.kinderImHaushalt === 2 ||
          p.kinderImHaushalt === 3;

        const famPrimaryDisabled =
          (famSubStep === 0 && !kinderZahlOk) ||
          (famSubStep === 1 && !partnerKvDone) ||
          (famSubStep === 2 && famCase.showEarningsQuestion && !earningsDone);

        const famPrimaryLabel =
          famSubStep === 0
            ? p.familiensituation === "single"
              ? "Meine Einschätzung anzeigen"
              : "Weiter →"
            : famSubStep === 1 && p.familiensituation === "partner_kinder"
              ? "Weiter →"
              : "Meine Einschätzung anzeigen";

        const onFamPrimary = () => {
          if (famSubStep === 0) {
            if (p.familiensituation === "single") finishFamilyWizard();
            else setFamSubStep(1);
            return;
          }
          if (famSubStep === 1) {
            if (p.familiensituation === "partner_kinder") setFamSubStep(2);
            else finishFamilyWizard();
            return;
          }
          finishFamilyWizard();
        };

        return (
          <>
            <div style={T.hero}>
              <div style={T.eyebrow}>KV-Navigator · Schritt 4 von {KV_WIZARD_STEPS}</div>
              {famSubStep === 0 && (
                <>
                  <div style={T.h1}>Ihre Familiensituation</div>
                  <div style={T.body}>
                    Die Absicherung Ihrer Angehörigen beeinflusst die Wahl des Systems und die monatlichen Kosten
                    erheblich.
                  </div>
                </>
              )}
              {famSubStep === 1 && (
                <>
                  <div style={T.h1}>Wie ist Ihr Partner aktuell versichert?</div>
                  <div style={T.body}>
                    Das beeinflusst, ob eine GKV-Familienversicherung für Ihre Angehörigen infrage kommt.
                  </div>
                </>
              )}
              {famSubStep === 2 && famCase.showEarningsQuestion && (
                <>
                  <div style={T.h1}>Wer verdient in Ihrem Haushalt mehr?</div>
                  <div style={T.body}>
                    Das ist unter anderem für die beitragsfreie Mitversicherung von Kindern in der GKV relevant (§ 10
                    SGB V).
                  </div>
                </>
              )}
              {famSubStep === 2 && (famCase.showBeihilfePill || famCase.showGkvKinderPill) && (
                <>
                  <div style={T.h1}>Einordnung für Ihre Konstellation</div>
                  <div style={T.body}>Kurz zusammengefasst — ohne weitere Eingabe von Ihrer Seite.</div>
                </>
              )}
            </div>
            <div style={T.section}>
              {famSubStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { v: "single", l: "Single", d: "Allein — kein Partner im Haushalt", emoji: "👤" },
                    { v: "partner", l: "Partner", d: "Mit Partner — keine Kinder im Haushalt", emoji: "👫" },
                    {
                      v: "partner_kinder",
                      l: "Partner & Kinder",
                      d: "Familie mit Kindern — Familienversicherung und Kosten besonders relevant",
                      emoji: "👨‍👩‍👧‍👦",
                    },
                  ].map(({ v, l, d, emoji }) => (
                    <SelectionCard
                      key={v}
                      value={v}
                      label={l}
                      description={d}
                      icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                      selected={p.familiensituation === v}
                      accent={C}
                      onClick={() => {
                        set("familiensituation", v);
                        set("haushaltMehrverdiener", null);
                        if (v === "single") {
                          set("partnerKV", "keine");
                          set("kinderImHaushalt", null);
                        } else if (v === "partner") {
                          set("partnerKV", "");
                          set("kinderImHaushalt", null);
                        } else {
                          set("partnerKV", "");
                        }
                      }}
                    />
                  ))}
                  {p.familiensituation === "partner_kinder" && (
                    <div className="gkvpkv-smart-block" style={{ marginTop: "4px" }}>
                      <div style={{ ...T.fldLbl, marginBottom: "8px" }}>
                        Wie viele Kinder leben bei Ihnen im Haushalt?
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { n: 1, l: "1 Kind", d: "Für die Ergebnis-Weiche (Kostenvergleich vs. große Familie)" },
                          { n: 2, l: "2 Kinder", d: "Für die Ergebnis-Weiche (Kostenvergleich vs. große Familie)" },
                          { n: 3, l: "3 oder mehr Kinder", d: "Schwerpunkt: GKV-Ersparnis bei mehreren Tarifen in der PKV" },
                        ].map(({ n, l, d }) => (
                          <SelectionCard
                            key={n}
                            value={String(n)}
                            label={l}
                            description={d}
                            icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{n === 3 ? "👨‍👩‍👧‍👦" : n === 2 ? "👧👦" : "👶"}</span>}
                            selected={p.kinderImHaushalt === n}
                            accent={C}
                            onClick={() => set("kinderImHaushalt", n)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {famSubStep === 1 && (
                <div className="gkvpkv-smart-block" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    {
                      v: "gkv",
                      l: "Gesetzlich (GKV)",
                      d: "Ihr Partner ist in der gesetzlichen Krankenversicherung",
                      emoji: "🏥",
                    },
                    {
                      v: "pkv",
                      l: "Privat (PKV)",
                      d: "Ihr Partner hat einen eigenen privaten Krankenversicherungstarif",
                      emoji: "🔒",
                    },
                    {
                      v: "nicht_erwerb",
                      l: "Nicht erwerbstätig / Elterngeld",
                      d: "Z. B. Elternzeit — ohne eigene GKV/PKV-Mitgliedschaft",
                      emoji: "👶",
                    },
                  ].map(({ v, l, d, emoji }) => (
                    <SelectionCard
                      key={v}
                      value={v}
                      label={l}
                      description={d}
                      icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                      selected={p.partnerKV === v}
                      accent={C}
                      onClick={() => set("partnerKV", v)}
                    />
                  ))}
                </div>
              )}

              {famSubStep === 2 && famCase.showEarningsQuestion && (
                <div className="gkvpkv-smart-block" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { v: "ich", l: "Ich", d: "Ich verdiene in unserem Haushalt mehr", emoji: "🙋" },
                    { v: "partner", l: "Partner", d: "Mein Partner / meine Partnerin verdient mehr", emoji: "👤" },
                    { v: "gleich", l: "Ungefähr gleich", d: "Unser Einkommen liegt in einer vergleichbaren Größenordnung", emoji: "⚖️" },
                  ].map(({ v, l, d, emoji }) => (
                    <SelectionCard
                      key={v}
                      value={v}
                      label={l}
                      description={d}
                      icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                      selected={p.haushaltMehrverdiener === v}
                      accent={C}
                      onClick={() => set("haushaltMehrverdiener", v)}
                    />
                  ))}
                </div>
              )}

              {famSubStep === 2 && famCase.showBeihilfePill && (
                <div className="gkvpkv-smart-block">
                  <div
                    style={{
                      ...T.smartPillRow,
                      background: `${C}10`,
                      border: `1px solid ${C}33`,
                    }}
                  >
                    <span style={{ fontSize: "18px", lineHeight: 1.2 }} aria-hidden>
                      🏛️
                    </span>
                    <div style={T.smartPillText}>
                      Ihre Kinder genießen in der Regel 80&nbsp;% Beihilfe-Anspruch. Die private Restkosten-Absicherung
                      ist dadurch besonders günstig.
                    </div>
                  </div>
                </div>
              )}

              {famSubStep === 2 && famCase.showGkvKinderPill && (
                <div className="gkvpkv-smart-block">
                  <div
                    style={{
                      ...T.smartPillRow,
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    <span style={{ fontSize: "18px", lineHeight: 1.2 }} aria-hidden>
                      🏥
                    </span>
                    <div style={T.smartPillText}>
                      In der gesetzlichen Kasse bleiben Ihre Kinder meist beitragsfrei mitversichert.
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ height: "120px" }} />
            <div style={T.footer}>
              <button type="button" style={T.btnPrim(famPrimaryDisabled)} disabled={famPrimaryDisabled} onClick={onFamPrimary}>
                {famPrimaryLabel}
              </button>
              <button type="button" style={T.btnSec} onClick={backScr}>
                Zurück
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}
