import { useMemo, useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
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
function makeGKVPKVT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a,c)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?(c||C):"#e8e8e8"}`,background:a?(c||C):"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"}),
resultHero:{padding:"52px 24px 40px",textAlign:"center",background:"#fff"},
resultEyebrow:{fontSize:"12px",fontWeight:"500",color:"#9CA3AF",letterSpacing:"0.2px",marginBottom:"14px"},
resultNumber:(C2)=>({fontSize:"52px",fontWeight:"800",color:C2,letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"}),
resultUnit:{fontSize:"14px",color:"#9CA3AF",marginBottom:"18px"},
statusOk:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#15803D"},
statusInfo:(C2)=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:`${C2}0d`,border:`1px solid ${C2}33`,borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:C2}),
statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
resultSub:{fontSize:"13px",color:"#9CA3AF",lineHeight:1.55,marginTop:"12px"},
warnCard:{background:"#FFF6F5",border:"1px solid #F2D4D0",borderLeft:"3px solid #C0392B",borderRadius:"14px",padding:"18px 20px"},
warnCardTitle:{fontSize:"13px",fontWeight:"700",color:"#C0392B",marginBottom:"6px"},
warnCardText:{fontSize:"13px",color:"#7B2A2A",lineHeight:1.65},
cardPrimary:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"20px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 6px 24px rgba(17,24,39,0.08)"},
cardContext:{background:"#FAFAF8",border:"1px solid rgba(17,24,39,0.05)",borderRadius:"16px",padding:"18px 20px"},
sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"},
};}
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
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
    brutto:          4500,
    beruf:           "angestellt",
    alter:           32,
    familiensituation: "single",
    partnerKV:       "keine",
  });
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));

  const [scr, setScr] = useState(1);
  const nextScr = () => { window.scrollTo({ top: 0, behavior: "smooth" }); if (scr < 5) { setScr(s => s + 1); } else { goTo(2); } };
  const backScr = () => { window.scrollTo({ top: 0, behavior: "smooth" }); if (scr > 1) { setScr(s => s - 1); } };
  const goTo   = (ph) => { setAk(k => k + 1); setPhase(ph); window.scrollTo({ top: 0 }); };

  const R = berechne(p);

  // Danke
  if(danke)return(
    <div style={{...T.page,"--accent":C}}>
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
      <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
        <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
        <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px"}}>Dein Berater</div><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
        <button onClick={()=>{setDanke(false);setPhase(1);}} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neue Berechnung starten</button>
      </div>
    </div>
  );

  // ── Phase 3: Kontakt ─────────────────────────────────────────────────────
  if(phase===3){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
        <div style={T.prog}><div style={T.progFil(100)}/></div>
        <div style={T.hero}><div style={T.eyebrow}>Fast geschafft</div><div style={T.h1}>Wo können wir dich erreichen?</div><div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis.</div></div>
        <div style={T.section}>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", padding: "12px 14px", background: "#fafafa", marginBottom: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: C, letterSpacing: "-0.3px", marginBottom: "2px" }}>{R.headline}</div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>{R.subline}</div>
          </div>
          {isDemo && (
            <div style={{ fontSize: "13px", color: "#999", textAlign: "center", marginBottom: "14px", lineHeight: 1.5 }}>
              Live-Vorschau für Sie als Makler — Ihr Kunde durchläuft dieselben Schritte; „Anpassen & kaufen“ öffnet den Konfigurator.
            </div>
          )}
          <CheckKontaktLeadLine />
          <div style={T.card}>
            {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"tel",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
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

  // ── Phase 2: Ergebnis ────────────────────────────────────────────────────
  if (phase === 2) {
    const GKV_COLOR = "#059669";
    const PKV_COLOR = C;

    // Faktoren — keine Beträge, nur systemische Unterschiede
    const FAKTOREN = [
      {
        label: "Kinder",
        gkv:   R.hatKinder ? "Beitragsfrei mitversichert (unter Voraussetzungen)" : "Beitragsfrei möglich, wenn kein eigenes Einkommen",
        pkv:   R.hatKinder ? "Eigener Tarif je Kind notwendig" : "Kein Unterschied ohne Kinder",
        fav:   R.hatKinder ? "gkv" : "neutral",
      },
      {
        label: "Alter",
        gkv:   "Beitrag steigt mit dem Einkommen, nicht mit dem Alter",
        pkv:   R.alter < 35 ? "Jetzt günstig einsteigen — je früher, desto besser" : R.alter < 50 ? "Altersrückstellungen bereits aufgebaut" : "Wechsel wird zunehmend teurer",
        fav:   R.alter < 35 ? "pkv" : R.alter > 45 ? "gkv" : "neutral",
      },
      {
        label: "Einkommen",
        gkv:   "Einkommensabhängig — Beitrag steigt proportional",
        pkv:   "Einkommensunabhängig — individueller Risikobeitrag",
        fav:   R.brutto > 7000 ? "pkv" : "gkv",
      },
      {
        label: "Gesundheit",
        gkv:   "Keine Gesundheitsprüfung — Aufnahme immer garantiert",
        pkv:   "Gesundheitsprüfung bei Aufnahme — Risikoaufschlag möglich",
        fav:   "gkv",
      },
    ];

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <div style={T.header}>
          <div style={T.logo}>
            <div style={T.logoMk}><LogoSVG /></div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{MAKLER.firma}</span>
          </div>
          <span style={T.badge}>GKV vs. PKV</span>
        </div>
        <div style={T.prog}><div style={T.progFil(66)} /></div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Ihre Einschätzung · GKV vs. PKV</div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: R.unterGrenze ? "#6B7280" : C, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "10px" }}>
            {R.headline}
          </div>
          <div style={T.resultUnit}>{R.subline}</div>
          {R.unterGrenze
            ? <div style={T.statusWarn}>Einkommensgrenze nicht erreicht</div>
            : R.empfehlung === "pkv"
              ? <div style={T.statusInfo(C)}>PKV-Zugang gegeben</div>
              : <div style={T.statusOk}>Erste Einordnung · kein Tarifvergleich</div>
          }
          <div style={T.resultSub}>Erste Orientierung · auf Basis Ihrer Angaben · keine verbindliche Empfehlung</div>
        </div>

        {/* ── Warn: Einkommensgrenze ────────────────────────────────────────── */}
        {R.unterGrenze && (
          <div style={T.section}>
            <div style={T.warnCard}>
              <div style={T.warnCardTitle}>PKV aktuell nicht möglich</div>
              <div style={T.warnCardText}>
                Die Versicherungspflichtgrenze 2026 liegt bei 6.450 €/Monat brutto. Sie liegen darunter — ein PKV-Wechsel ist für Angestellte erst ab diesem Einkommen möglich.
              </div>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#9CA3AF" }}>
                Ausnahme: Beamte und Selbstständige sind nicht pflichtversichert.
              </div>
            </div>
          </div>
        )}

        {/* ── Section 1: Das bedeutet für Sie ──────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Das bedeutet für Sie</div>
          <div style={T.cardContext}>
            {[
              R.unterGrenze && {
                icon: "🔒",
                text: "Ihr Einkommen liegt unter der Versicherungspflichtgrenze. Als Angestellter bleiben Sie in der GKV. Eine Verbesserung der Leistungen ist innerhalb der GKV über Zusatzversicherungen möglich.",
              },
              !R.unterGrenze && p.beruf === "beamter" && {
                icon: "🏛️",
                text: "Als Beamter erhalten Sie Beihilfe vom Dienstherrn (50–70 % der Kosten). Die PKV deckt nur den Restanteil — das macht die PKV für Beamte typischerweise deutlich attraktiver als die GKV.",
              },
              !R.unterGrenze && p.beruf === "selbst" && {
                icon: "🧑‍💼",
                text: "Als Selbstständiger haben Sie freie Wahl. Sie tragen den GKV-Beitrag vollständig selbst. Die PKV kann je nach Gesundheitszustand und Alter günstiger sein — ein genauer Vergleich lohnt sich.",
              },
              (R.hatKinder || R.partnerInGKV) && {
                icon: "👨‍👩‍👧",
                text: R.hatKinder
                  ? "Kinder können in der GKV unter Voraussetzungen beitragsfrei mitversichert sein. In der PKV benötigt jedes Familienmitglied einen eigenen Tarif — das macht die GKV hier kostengünstiger."
                  : "Ihr Partner ist in der GKV versichert. Kinder können in der GKV beitragsfrei familienversichert werden — das ist ein relevanter Vorteil gegenüber der PKV.",
              },
              p.beruf === "angestellt" && !R.unterGrenze && {
                icon: "🤝",
                text: `Ihr Arbeitgeber übernimmt ca. 50 % Ihres GKV-Beitrags (bis zur Beitragsbemessungsgrenze). Das ist ein relevanter Vorteil — auch bei einem möglichen PKV-Wechsel zahlt der AG einen Zuschuss.`,
              },
            ].filter(Boolean).map(({ icon, text }, i, arr) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: i < arr.length - 1 ? "14px" : "0", marginBottom: i < arr.length - 1 ? "14px" : "0", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none" }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.65 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: GKV vs PKV im Überblick ───────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>GKV vs. PKV im Überblick</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              {
                label: "GKV",
                color: GKV_COLOR,
                bg: "#F0FDF4",
                border: "#BBF7D0",
                active: R.empfehlung === "gkv" || R.unterGrenze,
                props: [
                  "Einkommensabhängiger Beitrag",
                  "Familienversicherung möglich",
                  "Keine Gesundheitsprüfung",
                  "AG trägt ~50 % (Angestellte)",
                ],
              },
              {
                label: "PKV",
                color: PKV_COLOR,
                bg: "#EFF6FF",
                border: "#BFDBFE",
                active: R.empfehlung === "pkv" || R.empfehlung === "offen",
                props: [
                  "Individueller Risikobeitrag",
                  "Jede Person eigener Tarif",
                  "Gesundheitsprüfung bei Eintritt",
                  "Altersrückstellungen (Beitragsstabilität)",
                ],
              },
            ].map(({ label, color, bg, active, props }) => (
              <div key={label} style={{ border: `${active ? "2px" : "1px"} solid ${active ? color : "rgba(17,24,39,0.08)"}`, borderRadius: "16px", padding: "16px 14px", background: active ? bg : "#FAFAF8" }}>
                {active && <div style={{ fontSize: "10px", fontWeight: "700", color, marginBottom: "6px", letterSpacing: "0.3px" }}>Tendenz</div>}
                <div style={{ fontSize: "14px", fontWeight: "700", color, marginBottom: "10px" }}>{label}</div>
                {props.map((p2, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: color, flexShrink: 0, marginTop: "7px" }} />
                    <span style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.5 }}>{p2}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Wichtige Faktoren ─────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Wichtige Faktoren in Ihrer Situation</div>
          <div style={T.cardPrimary}>
            {FAKTOREN.map(({ label, gkv, pkv, fav }, i, arr) => (
              <div key={i} style={{ padding: "14px 20px", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.04)" : "none" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF", marginBottom: "8px" }}>{label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ padding: "10px", background: fav === "gkv" ? "#F0FDF4" : "rgba(17,24,39,0.02)", borderRadius: "10px", border: fav === "gkv" ? "1px solid #BBF7D0" : "1px solid rgba(17,24,39,0.04)" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: fav === "gkv" ? GKV_COLOR : "#9CA3AF", marginBottom: "4px" }}>GKV</div>
                    <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.45 }}>{gkv}</div>
                  </div>
                  <div style={{ padding: "10px", background: fav === "pkv" ? "#EFF6FF" : "rgba(17,24,39,0.02)", borderRadius: "10px", border: fav === "pkv" ? "1px solid #BFDBFE" : "1px solid rgba(17,24,39,0.04)" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: fav === "pkv" ? PKV_COLOR : "#9CA3AF", marginBottom: "4px" }}>PKV</div>
                    <div style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.45 }}>{pkv}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Alternative innerhalb der GKV ──────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Alternative innerhalb der GKV</div>
          <div style={T.cardContext}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1F2937", marginBottom: "8px" }}>
              Gesetzlich versichert — trotzdem besser versorgt
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7, marginBottom: "14px" }}>
              Wer in der GKV bleibt oder bleiben muss, kann Leistungen gezielt mit privaten Zusatzversicherungen erweitern — ohne in die PKV zu wechseln.
            </div>
            {[
              { label: "Zahnzusatz", desc: "Hochwertiger Zahnersatz, Implantate, Prophylaxe — über GKV-Niveau hinaus" },
              { label: "Krankenhaus-Zusatz", desc: "Chefarztbehandlung, Einbettzimmer — Komfort ohne PKV" },
              { label: "Krankentagegeld", desc: "Einkommensschutz ab Tag 43 — besonders für Selbstständige relevant" },
              { label: "Auslandskranken", desc: "Weltweiter Schutz ohne GKV-Deckungslücken" },
            ].map(({ label, desc }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 3 ? "10px" : "0" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: `${C}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C }} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Berechnungshinweis ────────────────────────────────────────────── */}
        <div style={{ ...T.section, marginBottom: "120px" }}>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Einordnung auf Basis Ihrer Angaben. Keine konkreten Beiträge — diese hängen von Tarif, Kasse und individuellem Gesundheitszustand ab.
              <span style={{ color: "#b8884a" }}> Grundlage: §241 SGB V, §257 SGB V, §9 SGB V.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={() => goTo(3)}>Situation gemeinsam prüfen</button>
          <button style={T.btnSec} onClick={() => goTo(1)}>Neue Berechnung starten</button>
        </div>
      </div>
    );
  }

  // ── Phase 1: 1 Frage pro Screen (5 Screens) ─────────────────────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <div style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMk}><LogoSVG /></div>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{MAKLER.firma}</span>
        </div>
        <span style={T.badge}>GKV vs. PKV</span>
      </div>
      <div style={T.prog}><div style={T.progFil(scr * 20)} /></div>

      {/* Screen 1: Beschäftigung */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>GKV vs. PKV · 1 / 5</div>
          <div style={T.h1}>Wie sind Sie aktuell beschäftigt?</div>
          <div style={T.body}>Davon hängt ab, ob Sie überhaupt in die PKV wechseln können.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

      {/* Screen 2: Einkommen */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>GKV vs. PKV · 2 / 5</div>
          <div style={T.h1}>Wie hoch ist Ihr monatliches Bruttoeinkommen?</div>
          {p.beruf === "angestellt" && (
            <div style={T.body}>
              {p.brutto >= JAEG_MONAT
                ? "Über der Versicherungspflichtgrenze — PKV möglich"
                : "Unter der Versicherungspflichtgrenze (6.450 €) — PKV aktuell nicht möglich"}
            </div>
          )}
        </div>
        <div style={T.section}>
          <SliderCard label="Monatliches Bruttogehalt" value={p.brutto} min={1000} max={12000} step={100} unit="€" accent={C}
            onChange={v => set("brutto", v)} />
          {p.beruf === "angestellt" && (
            <div style={{ ...T.infoBox, marginTop: "10px", borderLeft: `3px solid ${p.brutto >= JAEG_MONAT ? C : "#f59e0b"}`, background: p.brutto >= JAEG_MONAT ? `${C}08` : "#fffbf0", borderRadius: "0 8px 8px 0" }}>
              <strong style={{ color: p.brutto >= JAEG_MONAT ? C : "#92400e" }}>Versicherungspflichtgrenze 2026:</strong>{" "}
              {p.brutto >= JAEG_MONAT
                ? "6.450 €/Monat — Sie liegen darüber."
                : `6.450 €/Monat — Sie liegen ${Math.round((6450 - p.brutto)).toLocaleString("de-DE")} € darunter.`}
            </div>
          )}
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 3: Alter */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>GKV vs. PKV · 3 / 5</div>
          <div style={T.h1}>Wie alt sind Sie?</div>
          <div style={T.body}>Das Alter beeinflusst PKV-Beiträge und Altersrückstellungen erheblich.</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Ihr aktuelles Alter" value={p.alter} min={18} max={60} step={1} unit="Jahre" accent={C}
            onChange={v => set("alter", v)} />
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 4: Familiensituation */}
      {scr === 4 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>GKV vs. PKV · 4 / 5</div>
          <div style={T.h1}>Ihre Familiensituation</div>
          <div style={T.body}>GKV-Familienversicherung kann Kinder und Partner beitragsfrei mitversichern.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { v: "single",          l: "Single",              d: "Allein — kein Partner im Haushalt",                       emoji: "🙋" },
              { v: "partner",         l: "Partner",             d: "Mit Partner — keine Kinder im Haushalt",                  emoji: "👫" },
              { v: "partner_kinder",  l: "Partner + Kinder",    d: "Familie mit Kindern — GKV-Familienversicherung relevant",  emoji: "👨‍👩‍👧" },
            ].map(({ v, l, d, emoji }) => (
              <SelectionCard key={v} value={v} label={l} description={d}
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                selected={p.familiensituation === v} accent={C}
                onClick={() => {
                  set("familiensituation", v);
                  if (v === "single") { set("partnerKV", "keine"); }
                }} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Weiter →</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 5: Partner-Versicherung */}
      {scr === 5 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>GKV vs. PKV · 5 / 5</div>
          <div style={T.h1}>
            {p.familiensituation === "single"
              ? "Noch eine letzte Frage"
              : "Wie ist Ihr Partner versichert?"}
          </div>
          <div style={T.body}>
            {p.familiensituation === "single"
              ? "Als Single spielt die Partnerversicherung keine Rolle — wir rechnen trotzdem durch."
              : "Das beeinflusst, ob eine GKV-Familienversicherung infrage kommt."}
          </div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { v: "gkv",   l: "Gesetzlich versichert", d: "Familienversicherung der Kinder über GKV möglich", emoji: "🏥" },
              { v: "pkv",   l: "Privat versichert",      d: "Partner hat eigenen PKV-Tarif",                   emoji: "🔒" },
              { v: "keine", l: "Kein Partner",           d: "Partnerversicherung nicht relevant",               emoji: "—" },
            ].map(({ v, l, d, emoji }) => (
              <SelectionCard key={v} value={v} label={l} description={d}
                icon={<span style={{ fontSize: v === "keine" ? "14px" : "20px", lineHeight: 1 }}>{emoji}</span>}
                selected={p.partnerKV === v} accent={C} onClick={() => set("partnerKV", v)} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Meine Einschätzung anzeigen</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}
    </div>
  );
}
