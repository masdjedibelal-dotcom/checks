import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CheckConfigLoadingShell } from "@/components/checks/CheckConfigLoadingShell";
import { CheckHeaderPhoneButton } from "@/components/checks/CheckHeaderPhoneButton";
import { StandaloneWrapper } from "@/components/checks/StandaloneWrapper";
import { useMakler } from "@/components/ui/MaklerContext";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import ResultPage from "@/components/checks/gkvpkv/ResultPage";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { getPkvRange, kinderAnzahlForGkvPkvRange } from "@/lib/gkvpkvPkvRange";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#ffffff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}.gkvpkv-smart-block{animation:fadeIn 0.42s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#f0f0f0;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}@media (max-width:540px){.gkvpkv-stack-sm{grid-template-columns:1fr !important;}}.gkvpkv-acc-item{border-radius:12px;background:#F9FAFB;border:1px solid rgba(17,24,39,0.06);margin-bottom:8px;overflow:hidden;}.gkvpkv-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;text-align:left;font-size:13px;font-weight:600;color:#1F2937;background:transparent;cursor:pointer;border:none;font-family:inherit;}.gkvpkv-acc-panel{padding:0 16px 14px;font-size:12px;color:#6B7280;line-height:1.65;border-top:1px solid rgba(17,24,39,0.06);}`;document.head.appendChild(s);})();
// JAEG 2026: 77.400 € / Jahr = 6.450 € / Monat
const JAEG_MONAT = 6450;
/** Beitragsbemessungsgrenze KV 2026 (Monat), Orientierung */
const BBG_KV = 5812.5;
/**
 * GKV 2026 (Orientierung): KV-Satz 14,6 % + Ø-Zusatzbeitrag 2,9 % ≈ 17,5 % vom Brutto (bis BBG).
 * KPI-Karten: voller Gesamtbeitrag (Vergleich mit PKV-Gesamtkosten). Bei Angestellten trägt der AG typisch die Hälfte — Fußnote in der Ergebnis-UI.
 */
const GKV_GESAMT_SATZ = 0.175;
const GKV_AN_SATZ = 0.0875;

function berechne({ brutto, beruf, alter, familiensituation, partnerKV, kinderImHaushalt }) {
  const bruttoNum = Math.max(0, Number(brutto) || 0);
  const unterGrenze = beruf === "angestellt" && bruttoNum < JAEG_MONAT;
  const hatKinder = familiensituation === "partner_kinder";
  /** Nur bei Kindern im Haushalt (Familien-Kontext im Ergebnis). */
  const hatPartner = familiensituation === "partner_kinder";
  const partnerInGKV = hatKinder && partnerKV === "gkv";

  // GKV AN-Anteil (≈ Hälfte von 14,6 %+Zusatz bis BBG) — Orientierung / Kontext
  const gkvANAnteil = Math.round(Math.min(bruttoNum, BBG_KV) * GKV_AN_SATZ);
  const agAnteil = beruf === "angestellt" ? gkvANAnteil : 0;

  // Empfehlung — nur strukturell, kein Tarifvergleich
  let empfehlung, headline, subline;
  if (unterGrenze) {
    empfehlung = "gkv";
    headline = "Aktuell: GKV Pflicht";
    subline = "Noch unter der Pflichtgrenze für Angestellte";
  } else if (beruf === "beamter") {
    empfehlung = "pkv";
    headline = "PKV für Sie naheliegend";
    subline = "Beihilfe macht PKV für Beamte typisch sinnvoll";
  } else if (hatKinder) {
    empfehlung = "gkv";
    headline = "GKV aktuell sinnvoll";
    subline = "Familienversicherung spricht für GKV";
  } else {
    empfehlung = "offen";
    headline = "PKV grundsätzlich möglich";
    subline =
      beruf === "selbst" ? "Freie Wahl — keine Pflichtversicherung" : "Einkommensgrenze überschritten";
  }

  /** Monatsbetrag GKV für KPI / Vergleich (Orientierung, bis BBG gekappt) — Ergebnis ganze Euro */
  const brCapped = Math.min(bruttoNum, BBG_KV);
  let gkvSchMonat;
  if (beruf === "beamter") {
    gkvSchMonat = Math.round(brCapped * 0.19);
  } else if (beruf === "angestellt") {
    gkvSchMonat = Math.round(brCapped * GKV_GESAMT_SATZ);
  } else {
    gkvSchMonat = Math.round(brCapped * GKV_GESAMT_SATZ);
  }

  const kinderNRange = kinderAnzahlForGkvPkvRange({
    familiensituation,
    kinderImHaushalt,
  });
  const pkvSpanne = getPkvRange(alter, kinderNRange, beruf);
  const pkvSchMonatMin = Math.round(pkvSpanne.min);
  const pkvSchMonatMax = Math.round(pkvSpanne.max);

  let diff = 0;
  /** Für UI: bei welchem System liegt die modellierte Ersparnis */
  let empfehlungKosten = null;
  if (!unterGrenze) {
    const setPkvWin = () => {
      empfehlungKosten = "PKV";
      /** Größte modellierte Ersparnis vs. GKV, wenn PKV an der Untergrenze der Spanne liegt */
      diff = Math.round(Math.max(0, gkvSchMonat - pkvSchMonatMin));
    };
    const setGkvWin = () => {
      empfehlungKosten = "GKV";
      /** Vorteil GKV vs. günstigstes PKV-Szenario in der Spanne */
      diff = Math.round(Math.max(0, pkvSchMonatMin - gkvSchMonat));
    };

    if (empfehlung === "pkv") {
      setPkvWin();
    } else if (empfehlung === "gkv") {
      setGkvWin();
    } else if (pkvSchMonatMax <= gkvSchMonat) {
      setPkvWin();
    } else if (pkvSchMonatMin >= gkvSchMonat) {
      setGkvWin();
    } else {
      const mid = Math.round((pkvSchMonatMin + pkvSchMonatMax) / 2);
      if (mid <= gkvSchMonat) setPkvWin();
      else setGkvWin();
    }
  }

  return {
    unterGrenze,
    hatKinder,
    hatPartner,
    partnerInGKV,
    gkvANAnteil: Math.round(gkvANAnteil),
    agAnteil: beruf === "angestellt" ? Math.round(gkvANAnteil) : 0,
    empfehlung,
    headline,
    subline,
    alter,
    brutto,
    gkvSchMonat: Math.round(gkvSchMonat),
    pkvSchMonatMin,
    pkvSchMonatMax,
    diff: Math.round(diff),
    empfehlungKosten,
  };
}
function makeGKVPKVT(C){return{page:{minHeight:"100vh",background:"#ffffff","--accent":C,fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(31,41,55,0.06)",padding:"0 24px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between"},brandMark:{fontSize:"15px",fontWeight:"700",letterSpacing:"-0.03em",color:"#111"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},logoTxt:{fontSize:"13px",fontWeight:"600",color:"#111",letterSpacing:"-0.1px"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},hero:{padding:"32px 24px 16px",textAlign:"center"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",color:"#111",lineHeight:1.25,...CHECKKIT_HERO_TITLE_TYPO},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"18px",overflow:"hidden",background:"#fff"},kpiKontaktLuecke:{borderRadius:"16px",background:"#FFF7F7",border:"1px solid #F2CFCF",padding:"12px 14px",minWidth:0,flex:"1 1 140px"},kpiKontaktEu:{borderRadius:"14px",background:"rgba(255,255,255,0.96)",border:"1px solid rgba(17,24,39,0.06)",padding:"12px 14px",minWidth:0,flex:"1 1 140px"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"#ffffff",borderTop:"1px solid rgba(31,41,55,0.06)",padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"999px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer",letterSpacing:"-0.1px",boxShadow:d?"none":"0 8px 20px rgba(26,58,92,0.18)"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#F6F8FE",border:"1px solid #DCE6FF",borderRadius:"14px",fontSize:"12px",color:"#315AA8",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a,c)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?(c||C):"#e8e8e8"}`,background:a?(c||C):"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"}),
resultHero:{padding:"52px 24px 40px",textAlign:"center",background:"#ffffff"},
resultEyebrow:{fontSize:"12px",fontWeight:"500",color:"#9CA3AF",letterSpacing:"0.2px",marginBottom:"14px"},
resultNumber:(C2)=>({fontSize:"52px",fontWeight:"800",color:C2,letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"}),
resultUnit:{fontSize:"14px",color:"#9CA3AF",marginBottom:"18px"},
resultH1:{fontSize:"28px",lineHeight:1.2,color:"#111",...CHECKKIT_HERO_TITLE_TYPO,letterSpacing:"-0.8px"},
resultBody:{fontSize:"15px",color:"#666",lineHeight:1.65},
tableIntro:{fontSize:"13px",color:"#666",lineHeight:1.55},
matrixMuted:{fontSize:"12px",fontWeight:"600",color:"#888",marginBottom:"8px"},
matrixCellText:{fontSize:"12px",color:"#666",lineHeight:1.45},
heroStepTitle:{marginTop:"36px",fontSize:"17px",fontWeight:"600",color:"#111",letterSpacing:"-0.02em",lineHeight:1.3},
heroStepHint:{marginTop:"8px",fontSize:"14px",color:"#888",lineHeight:1.6,maxWidth:"36ch"},
dankePadding:{padding:"48px 24px",textAlign:"center"},
dankeTitle:{fontSize:"22px",fontWeight:"700",color:"#111",marginBottom:"10px"},
dankeBody:{fontSize:"15px",color:"#666",lineHeight:1.65,marginBottom:"28px"},
dankeCard:{border:"1px solid #e8e8e8",borderRadius:"12px",overflow:"hidden",textAlign:"left",background:"#fff"},
dankeCardHead:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},
dankeEyebrow:{fontSize:"11px",color:"#888",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"4px"},
dankeName:{fontSize:"14px",fontWeight:"600",color:"#111"},
dankeFirma:{fontSize:"12px",color:"#888",marginTop:"1px"},
dankeContacts:{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"},
dankeLinkBtn:{marginTop:"20px",fontSize:"13px",color:"#888",cursor:"pointer",background:"none",border:"none",fontFamily:"inherit"},
kontaktSummary:{border:"1px solid #e8e8e8",borderRadius:"12px",padding:"12px 14px",background:"#fff",marginBottom:"16px"},
kontaktSummarySub:{fontSize:"12px",color:"#888"},
demoNotice:{fontSize:"13px",color:"#888",textAlign:"center",marginBottom:"14px",lineHeight:1.5},
insightText:{fontSize:"13px",lineHeight:1.65,color:"#444",fontWeight:500},
infoHintBox:{marginTop:"12px",padding:"12px 14px",borderRadius:"10px",background:"#f9f9f9",border:"1px solid #e8e8e8"},
infoHintText:{fontSize:"12px",lineHeight:1.6,color:"#666",fontWeight:500},
smartPillRow:{display:"inline-flex",alignItems:"flex-start",gap:"10px",padding:"14px 16px",borderRadius:"14px",maxWidth:"100%"},
smartPillText:{fontSize:"13px",lineHeight:1.65,color:"#444",fontWeight:500},
statusOk:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#15803D"},
statusInfo:(C2)=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:`${C2}0d`,border:`1px solid ${C2}33`,borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:C2}),
statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
resultSub:{fontSize:"13px",color:"#9CA3AF",lineHeight:1.55,marginTop:"12px"},
warnCard:{background:"#FFF6F5",border:"1px solid #F2D4D0",borderLeft:"3px solid #C0392B",borderRadius:"14px",padding:"18px 20px"},
warnCardTitle:{fontSize:"13px",fontWeight:"700",color:"#C0392B",marginBottom:"6px"},
warnCardText:{fontSize:"13px",color:"#7B2A2A",lineHeight:1.65},
warnCardNote:{fontSize:"12px",color:"#888",marginTop:"10px"},
cardPrimary:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"20px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 6px 24px rgba(17,24,39,0.08)"},
cardContext:{background:"#FAFAF8",border:"1px solid rgba(17,24,39,0.05)",borderRadius:"16px",padding:"18px 20px"},
sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"},
compareMuted:{fontSize:"12px",color:"#666",lineHeight:1.55},
infoGridFocus:{fontSize:"10px",fontWeight:"600",letterSpacing:"0.06em",textTransform:"uppercase",color:"#888",marginBottom:"6px",lineHeight:1.35},
infoGridTitle:{fontSize:"15px",fontWeight:"700",color:"#111",marginBottom:"8px",lineHeight:1.3},
infoGridBody:{fontSize:"13px",color:"#666",lineHeight:1.65},
infoGridShell:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"14px",padding:"16px 16px 17px",background:"#fff",boxShadow:"0 1px 6px rgba(17,24,39,0.04)"},
infoGridIconWrap:{width:"42px",height:"42px",borderRadius:"11px",background:"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",color:"#888",flexShrink:0},
};}
/** Intro + Beruf + Einkommen + Alter + System-Story + Familie (Fortschrittsanzeige) */
const KV_FLOW_STEPS = 8;

function fmtKvGehaltEUR(n) {
  const v = Math.round(Math.abs(Number(n) || 0));
  return `ca. ${v.toLocaleString("de-DE")} €`;
}

function fmtKvGehaltEURRange(min, max) {
  const a = Math.round(Math.abs(Number(min) || 0));
  const b = Math.round(Math.abs(Number(max) || 0));
  return `ca. ${a.toLocaleString("de-DE")} – ${b.toLocaleString("de-DE")} €`;
}

/** Slide 2: nur `beruf` (Status) & `brutto` (Gehalt) — p.beruf = angestellt | selbst | beamter */
function kvStoryStatusGehaltCopy(beruf, brutto) {
  const g = fmtKvGehaltEUR(brutto);
  switch (beruf) {
    case "selbst":
      return {
        title: "Beitragshoheit gewinnen.",
        text: `Mit einem Einkommen von ${g} zahlen Sie in der GKV oft den Höchstsatz. Wir prüfen jetzt, wie Sie in der PKV Ihre Kosten optimieren und gleichzeitig die Leistung massiv steigern können.`,
      };
    case "angestellt":
      return {
        title: "Wahlfreiheit prüfen.",
        text: `Bei ${g} Brutto gleichen wir Ihren Verdienst mit der Versicherungspflichtgrenze ab. Wir zeigen Ihnen, ob ein Wechsel in die PKV rechtlich möglich und für Sie sinnvoll ist.`,
      };
    case "beamter":
      return {
        title: "Beihilfe-Ergänzung.",
        text: `Dank Ihres Dienstherrn und einem Einkommen von ${g} haben Sie Anspruch auf Beihilfe. Wir finden den Restkosten-Tarif, der diese staatliche Leistung perfekt vervollständigt.`,
      };
    default:
      return {
        title: "Ihre Einordnung.",
        text: "Wir führen die Auswertung anhand Ihrer Angaben fort.",
      };
  }
}

/** scr 1–3 → „Über Sie“, scr 4–6 (+ Familien-Substeps) → „Einkommen“ */
const GKVPKV_HEADER_STEPS = ["Über Sie", "Einkommen", "Ergebnis", "Kontakt"];
const GKVPKV_CHECK_TITLE = "KV-Navigator";

const gkvpkvHeaderBadgeStyle = {
  fontSize: "11px",
  fontWeight: "500",
  color: "#888",
  letterSpacing: "0.3px",
  textTransform: "uppercase",
  textAlign: "right",
  lineHeight: 1.35,
  maxWidth: "min(140px, 38vw)",
};

function gkvpkvHeaderStep(phase, scr) {
  if (phase === 2) return 2;
  if (phase === 3) return 3;
  if (phase === "bridge") return 2;
  if (phase === 1) return (scr ?? 1) <= 3 ? 0 : 1;
  return 3;
}

function Header({ maklerFirma, maklerTelefon, C, currentStep = 0, showProgressBar = true }) {
  const { embedInIframe } = useMakler();
  if (embedInIframe) return null;
  return (
    <>
      <div
        className="check-header check-sticky-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(31,41,55,0.06)",
          padding: "16px 20px 12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          <div aria-hidden style={{ minWidth: 0 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              minWidth: 0,
              gridColumn: 2,
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
              <MaklerFirmaAvatarInitials firma={maklerFirma} />
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#1F2937",
                letterSpacing: "-0.1px",
                textAlign: "center",
                maxWidth: "min(200px, 52vw)",
                overflowWrap: "break-word",
                wordBreak: "break-word",
              }}
            >
              {maklerFirma}
            </span>
          </div>
          <div
            style={{
              justifySelf: "end",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingRight: "44px",
              minWidth: 0,
            }}
          >
            <span style={gkvpkvHeaderBadgeStyle}>{GKVPKV_CHECK_TITLE}</span>
          </div>
        </div>
        <CheckHeaderPhoneButton telefon={maklerTelefon} primaryColor={C} />
      </div>
      {showProgressBar ? (
        <CheckProgressBar steps={GKVPKV_HEADER_STEPS} currentStep={currentStep} accent={C} />
      ) : null}
    </>
  );
}
export default function GKVPKVRechner(){
  const MAKLER=useCheckConfig();
  const { isReady } = MAKLER;
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
  const [loading, setLoading] = useState(false);

  const slug = "gkv-pkv";
  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setScr(1);
      setFamSubStep(0);
      setLoading(false);
      setP((x) => ({
        ...x,
        kinderImHaushalt: null,
        familiensituation: "single",
        partnerKV: "keine",
        haushaltMehrverdiener: null,
      }));
    }
    if (ph === 2) {
      const t = new URLSearchParams(window.location.search).get("token") ?? undefined;
      if (t) void trackEvent({ event_type: "check_completed", slug, token: t, firma: MAKLER.firma });
    }
  };

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

  const goToBridge = () => setLoading(true);

  const nextScr = () => {
    if (scr < 4) setScr((s) => s + 1);
    else if (scr === 4) setScr(5);
    else if (scr === 5) {
      setFamSubStep(0);
      setScr(6);
    }
  };

  const backScr = () => {
    if (scr === 6 && famSubStep > 0) {
      setFamSubStep((s) => s - 1);
      return;
    }
    if (scr > 1) setScr((s) => s - 1);
  };

  useCheckScrollToTop([phase, ak, danke, scr, famSubStep, loading]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? undefined;
    if (!token) return;
    void trackEvent({ event_type: "check_started", slug, token, firma: MAKLER.firma });
  }, []);

  const R = berechne(p);

  /** Screen 3: Einkommen — Texte abhängig von Beruf; JAEG-Box nur Angestellte */
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

  if (!isReady) return <CheckConfigLoadingShell />;

  const withStandalone = (el) => (
    <StandaloneWrapper makler={MAKLER}>{el}</StandaloneWrapper>
  );

  // Danke
  if(danke)return withStandalone(
    <div className="check-root" style={{...T.page,"--accent":C}}>
      <Header maklerFirma={MAKLER.firma} maklerTelefon={MAKLER.telefon} C={C} currentStep={GKVPKV_HEADER_STEPS.length} showProgressBar={false} />
      <div style={T.dankePadding} className="fade-in">
        <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={T.dankeTitle}>{fd.name?`Vielen Dank, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
        <div style={T.dankeBody}>Wir prüfen Ihre Angaben und melden uns innerhalb von 24 Stunden mit den nächsten Schritten.</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: `${C}0d`,
              border: `1px solid ${C}33`,
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Einschätzung</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: C, letterSpacing: "-0.2px", lineHeight: 1.3 }}>
              {R.headline}
            </div>
          </div>
          <div
            style={{
              background: "rgba(31,41,55,0.03)",
              border: "1px solid rgba(31,41,55,0.08)",
              borderRadius: "12px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#999", marginBottom: "3px" }}>Kontext</div>
            <div style={{ fontSize: "12px", fontWeight: "500", color: "#374151", lineHeight: 1.3 }}>
              {R.subline}
            </div>
          </div>
        </div>
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
        <button type="button" onClick={()=>{setDanke(false);goTo(1);}} style={T.dankeLinkBtn}>Neue Berechnung starten</button>
      </div>
    </div>
  );

  if (loading) {
    return withStandalone(
      <div className="check-root" style={{ ...T.page, "--accent": C }} key={ak}>
        <Header maklerFirma={MAKLER.firma} maklerTelefon={MAKLER.telefon} C={C} showProgressBar={false} />
        <CheckLoader type="gkvpkv" checkmarkColor={C} onComplete={() => { setLoading(false); goTo("bridge"); }} />
      </div>
    );
  }

  if (phase === "bridge")
    return withStandalone(
      <div
        className="check-root fade-in"
        style={{
          ...T.page,
          "--accent": C,
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
        }}
        key={ak}
      >
        <Header maklerFirma={MAKLER.firma} maklerTelefon={MAKLER.telefon} C={C} showProgressBar={false} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <CheckKitStoryHero
            compact
            hideFooterSpacer
            emoji="🔍"
            title="System-Analyse bereit."
            text="Wir haben Ihre Angaben ausgewertet."
          />
        </div>
        <div style={T.footer} data-checkkit-footer>
          <button type="button" style={T.btnPrim(false)} onClick={() => goTo(2)}>
            Ergebnis ansehen
          </button>
          <button type="button" style={T.btnSec} onClick={() => goTo(1)}>
            Neu berechnen
          </button>
        </div>
      </div>
    );

  // ── Phase 3: Kontakt ─────────────────────────────────────────────────────
  if(phase===3){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return withStandalone(
      <div className="check-root fade-in" style={{...T.page,"--accent":C}} key={ak}>
        <Header maklerFirma={MAKLER.firma} maklerTelefon={MAKLER.telefon} C={C} currentStep={gkvpkvHeaderStep(3, scr)} />
        <div style={T.hero}>
          <div style={T.eyebrow}>Fast geschafft</div>
          <div style={T.h1}>{R.headline} — nächster Schritt.</div>
          <div style={T.body}>
            Wir melden uns innerhalb von 24 Stunden mit konkreten Tarif-Empfehlungen.
          </div>
        </div>
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
        <div style={T.footer} data-checkkit-footer>
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
            <><button type="button" style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){const highlights=[{label:"Ergebnis",value:R.headline},{label:"Kontext",value:R.subline},{label:"GKV (Orient., Monat)",value:fmtKvGehaltEUR(R.gkvSchMonat)},{label:"PKV (Orient., Monat)",value:fmtKvGehaltEURRange(R.pkvSchMonatMin, R.pkvSchMonatMax)}];if(R.diff>0&&R.empfehlungKosten)highlights.push({label:"Modell-Ersparnis (Monat)",value:`${fmtKvGehaltEUR(R.diff)} (${R.empfehlungKosten})`});const res=await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug,kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||"",highlights})}).catch(()=>null);if(res?.ok)void trackEvent({event_type:"lead_submitted",slug,token,firma:MAKLER.firma});}setDanke(true);}} disabled={!valid}>{valid?"Individuelle Einschätzung erhalten":"Bitte alle Angaben machen"}</button><button type="button" style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></>
          )}
        </div>
      </div>
    );
  }

  // ── Phase 2: Ergebnis (5 Ergebnis-Pfade → ResultPage) ───────────────────
  if (phase === 2) {
    return withStandalone(
      <ResultPage
        key={ak}
        R={R}
        p={p}
        T={T}
        accentColor={C}
        maklerFirma={MAKLER.firma}
        maklerTelefon={MAKLER.telefon}
        goTo={goTo}
        progressSteps={GKVPKV_HEADER_STEPS}
        progressCurrentStep={gkvpkvHeaderStep(2, scr)}
      />
    );
  }

  // ── Phase 1: Wizard (Intro, Daten 2–4, System-Story, Familie) → Loader → Bridge-Phase ────
  return withStandalone(
    <div className="check-root fade-in" style={{ ...T.page, "--accent": C }} key={ak}>
      <Header maklerFirma={MAKLER.firma} maklerTelefon={MAKLER.telefon} C={C} currentStep={gkvpkvHeaderStep(1, scr)} />

      {/* Slide 1: Intro */}
      {scr === 1 && (
        <>
          <CheckKitStoryHero
            emoji="🩺"
            title="Das passende Gesundheitssystem."
            text="GKV oder PKV? Wir analysieren in 2 Minuten, welches System zu Ihrem Leben passt und wo Sie die beste medizinische Versorgung für Ihr Budget erhalten."
          />
          <div style={T.footer} data-checkkit-footer>
            <button type="button" style={T.btnPrim(false)} onClick={nextScr}>
              Analyse starten
            </button>
          </div>
        </>
      )}

      {/* Screen 2: Beschäftigung */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>KV-Navigator · Schritt 2 von {KV_FLOW_STEPS}</div>
          <div style={T.h1}>Wie sind Sie aktuell beschäftigt?</div>
          <div style={T.body}>Davon hängt ab, ob Sie als Arbeitnehmer in die PKV wechseln dürfen.</div>
        </div>
        <div style={T.section}>
          <div className="check-selection-grid check-options-grid" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { v: "angestellt", l: "Angestellt",    d: "Pflichtversichert bis zur Einkommensgrenze (ca. 6.450 €/Mon.)", emoji: "💼" },
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
        <div style={T.footer} data-checkkit-footer>
          <button type="button" style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button type="button" style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 3: Einkommen */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>KV-Navigator · Schritt 3 von {KV_FLOW_STEPS}</div>
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
              <div style={T.infoHintBox}>
                <div style={T.infoHintText}>
                  {jaegOk
                    ? "Sie liegen über der Versicherungspflichtgrenze. Damit steht Ihnen der Weg in die PKV grundsätzlich offen."
                    : "Sie liegen aktuell unter der Versicherungspflichtgrenze (JAEG 2026). Ein Wechsel in die PKV ist gesetzlich erst ab ca. 6.450 € mtl. möglich."}
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer} data-checkkit-footer>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Slide 2: Status- & Gehalts-Story (nach Beruf + Einkommen) */}
      {scr === 4 && (() => {
        const s2 = kvStoryStatusGehaltCopy(p.beruf, p.brutto);
        return (
        <>
          <CheckKitStoryHero emoji="⚖️" title={s2.title} text={s2.text} />
          <div style={T.footer} data-checkkit-footer>
            <button type="button" style={T.btnPrim(false)} onClick={nextScr}>
              Weiter →
            </button>
            <button type="button" style={T.btnSec} onClick={backScr}>
              Zurück
            </button>
          </div>
        </>
        );
      })()}

      {/* Screen 5: Alter */}
      {scr === 5 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>KV-Navigator · Schritt 5 von {KV_FLOW_STEPS}</div>
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
        <div style={T.footer} data-checkkit-footer>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 6: Familie — Smart-Steps */}
      {scr === 6 && (() => {
        const kinderZahlOk =
          p.familiensituation === "single" ||
          p.familiensituation === "partnerschaft_ohne_kinder" ||
          (p.familiensituation === "partner_kinder" &&
            (p.kinderImHaushalt === 1 || p.kinderImHaushalt === 2 || p.kinderImHaushalt === 3));

        const famPrimaryDisabled =
          (famSubStep === 0 && !kinderZahlOk) ||
          (famSubStep === 1 && !partnerKvDone) ||
          (famSubStep === 2 && famCase.showEarningsQuestion && !earningsDone);

        const famPrimaryLabel =
          famSubStep === 0
            ? p.familiensituation === "partner_kinder"
              ? "Weiter →"
              : "Meine Einschätzung anzeigen"
            : famSubStep === 1 && p.familiensituation === "partner_kinder"
              ? "Weiter →"
              : "Meine Einschätzung anzeigen";

        const onFamPrimary = () => {
          if (famSubStep === 0) {
            if (p.familiensituation === "partner_kinder") setFamSubStep(1);
            else goToBridge();
            return;
          }
          if (famSubStep === 1) {
            if (p.familiensituation === "partner_kinder") setFamSubStep(2);
            else goToBridge();
            return;
          }
          goToBridge();
        };

        return (
          <>
            <div style={T.hero}>
              <div style={T.eyebrow}>KV-Navigator · Schritt 6 von {KV_FLOW_STEPS}</div>
              {famSubStep === 0 && (
                <>
                  <div style={T.h1}>Single oder in Partnerschaft?</div>
                  <div style={T.body}>Mit oder ohne Partner.</div>
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
                  <div style={T.h1}>
                    {famCase.showBeihilfePill
                      ? "Ihre Kinder sind mit Beihilfe gut abgesichert."
                      : "GKV deckt Ihre Kinder beitragsfrei mit."}
                  </div>
                  <div style={T.body}>Kurz zusammengefasst — ohne weitere Eingabe von Ihrer Seite.</div>
                </>
              )}
            </div>
            <div style={T.section}>
              {famSubStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { v: "single", l: "Single", d: "Ich lebe allein", emoji: "👤" },
                    {
                      v: "partnerschaft",
                      l: "In Partnerschaft",
                      d: "Mit oder ohne Kinder im Haushalt — wir fragen als Nächstes nach",
                      emoji: "👫",
                    },
                  ].map(({ v, l, d, emoji }) => {
                    const partnerschaftAuswahl =
                      p.familiensituation === "partnerschaft" ||
                      p.familiensituation === "partnerschaft_ohne_kinder" ||
                      p.familiensituation === "partner_kinder";
                    const selected =
                      v === "single"
                        ? p.familiensituation === "single"
                        : partnerschaftAuswahl;
                    return (
                      <SelectionCard
                        key={v}
                        value={v}
                        label={l}
                        description={d}
                        icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                        selected={selected}
                        accent={C}
                        onClick={() => {
                          set("haushaltMehrverdiener", null);
                          if (v === "single") {
                            set("familiensituation", "single");
                            set("partnerKV", "keine");
                            set("kinderImHaushalt", null);
                          } else {
                            set("familiensituation", "partnerschaft");
                            set("partnerKV", "");
                            set("kinderImHaushalt", null);
                          }
                        }}
                      />
                    );
                  })}
                  {(p.familiensituation === "partnerschaft" ||
                    p.familiensituation === "partnerschaft_ohne_kinder" ||
                    p.familiensituation === "partner_kinder") && (
                    <div className="gkvpkv-smart-block" style={{ marginTop: "4px" }}>
                      <div style={{ ...T.fldLbl, marginBottom: "8px" }}>
                        Wie viele Kinder leben bei Ihnen im Haushalt?
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          {
                            n: 0,
                            l: "Keine Kinder",
                            d: "Gleiche Einordnung wie bei Single — ohne Abfrage zum KV-Status Ihres Partners",
                            emoji: "👫",
                          },
                          { n: 1, l: "1 Kind", d: "Einkind-Haushalt — ein separater PKV-Tarif vs. GKV-Familienversicherung" },
                          { n: 2, l: "2 Kinder", d: "Zwei Kinder im Haushalt — GKV-Familienversicherung oft attraktiv" },
                          { n: 3, l: "3 oder mehr Kinder", d: "Großfamilie — GKV-Haushaltsbeitrag meist günstiger als viele PKV-Verträge" },
                        ].map(({ n, l, d, emoji }) => (
                          <SelectionCard
                            key={n}
                            value={String(n)}
                            label={l}
                            description={d}
                            icon={
                              <span style={{ fontSize: "20px", lineHeight: 1 }}>
                                {emoji != null
                                  ? emoji
                                  : n === 3
                                    ? "👨‍👩‍👧‍👦"
                                    : n === 2
                                      ? "👧👦"
                                      : "👶"}
                              </span>
                            }
                            selected={p.kinderImHaushalt === n}
                            accent={C}
                            onClick={() => {
                              if (n === 0) {
                                set("familiensituation", "partnerschaft_ohne_kinder");
                                set("partnerKV", "keine");
                                set("kinderImHaushalt", 0);
                              } else {
                                set("familiensituation", "partner_kinder");
                                set("partnerKV", "");
                                set("kinderImHaushalt", n);
                              }
                            }}
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
            <div style={T.footer} data-checkkit-footer>
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
