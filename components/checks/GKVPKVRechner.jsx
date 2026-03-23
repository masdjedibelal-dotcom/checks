import { useMemo, useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
(() => { const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";document.head.appendChild(l);const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;border-radius:1px;background:#e5e5e5;cursor:pointer;}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px var(--accent);}a{text-decoration:none;}`;document.head.appendChild(s);})();
const WARN="#c0392b",OK="#059669";
const fmt=(n)=>Math.round(Math.abs(n)).toLocaleString("de-DE")+" €";
// JAEG 2026: 77.400 € / Jahr = 6.450 € / Monat
const JAEG_MONAT = 6450;
function berechne(p){
  const{brutto,alter,kinder,partner,beruf,gesundheit}=p;
  // GKV 2026: 14,6% allg. + 2,9% Ø-Zusatzbeitrag — Beitrag unten über feste Sätze
  const gkvBeitrag = beruf==="selbst"
    ? Math.min(brutto*0.175, 6450*0.175)  // Beitragsbemessungsgrenze
    : Math.min(brutto*0.0875, 6450*0.0875);
  const pkv=beruf==="beamter"?brutto*0.025:alter<30?brutto*0.045:alter<40?brutto*0.06:alter<50?brutto*0.075:brutto*0.095;
  // Zugang PKV für Angestellte: nur über JAEG
  const pkuZugang = beruf!=="angestellt" || brutto>=JAEG_MONAT;
  const unterGrenze = beruf==="angestellt" && brutto<JAEG_MONAT;
  const score={gkv:0,pkv:0};
  if(kinder>0){score.gkv+=2;}
  if(!partner||beruf==="selbst"||beruf==="beamter"){score.pkv+=2;}
  if(alter<35){score.pkv+=1;}if(alter>45){score.gkv+=1;}
  if(gesundheit==="gut"){score.pkv+=2;}if(gesundheit==="schlecht"){score.gkv+=3;}
  if(beruf==="beamter"){score.pkv+=3;}if(beruf==="selbst"){score.pkv+=1;}
  if(brutto>5000){score.pkv+=1;}
  const total=score.gkv+score.pkv;
  const empfehlung=score.gkv>score.pkv?"GKV":"PKV";
  return{gkvBeitrag,pkv,famBonus:kinder>0&&partner&&beruf!=="selbst"&&beruf!=="beamter",
    score,total,empfehlung,diff:Math.abs(gkvBeitrag-pkv),pkuZugang,unterGrenze};
}
function makeGKVPKVT(C){return{page:{minHeight:"100vh",background:"#fff",fontFamily:"'Inter','Helvetica Neue',Helvetica,Arial,sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid #e8e8e8",padding:"0 24px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"#f0f0f0"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",fontWeight:"700",color:"#111",lineHeight:1.25,letterSpacing:"-0.5px"},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderTop:"1px solid #e8e8e8",padding:"14px 24px 28px"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#f9f9f9",borderRadius:"8px",fontSize:"12px",color:"#666",lineHeight:1.6},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},optBtn:(a,c)=>({padding:"9px 14px",borderRadius:"6px",border:`1px solid ${a?(c||C):"#e8e8e8"}`,background:a?(c||C):"#fff",fontSize:"13px",fontWeight:a?"600":"400",color:a?"#fff":"#444",transition:"all 0.15s",cursor:"pointer"})};}
function LogoSVG(){return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="white"/><rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/><rect x="8" y="8" width="5" height="5" rx="1" fill="white"/></svg>;}
export default function GKVPKVRechner(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makeGKVPKVT(C),[C]);
  const isDemo = isCheckDemoMode();
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[kontaktConsent,setKontaktConsent]=useState(false);
  const[p,setP]=useState({brutto:4500,alter:32,kinder:0,partner:false,beruf:"angestellt",gesundheit:"gut"});
  const set=(k,v)=>setP(x=>({...x,[k]:v}));
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);window.scrollTo({top:0});};
  const R=berechne(p);
  /** Unter JAEG ist PKV für Angestellte nicht wählbar — Anzeige immer GKV, unabhängig vom Score. */
  const tendenzAnzeige=R.unterGrenze?"GKV":R.empfehlung;
  const gkvHervorgehoben=R.empfehlung==="GKV"||R.unterGrenze;
  const pkvHervorgehoben=R.empfehlung==="PKV"&&!R.unterGrenze;

  const FAKTOREN=[
    {l:"Kinder",gkv:p.kinder>0?"Beitragsfrei mitversichert (unter Voraussetzungen)":"Kein Unterschied",pkv:p.kinder>0?"Eigener Beitrag je Kind (~100–250 €/Mon.)":"Kein Unterschied",fav:p.kinder>0?"gkv":"neutral"},
    {l:"Gesundheit",gkv:"Irrelevant für Beitragshöhe",pkv:p.gesundheit==="gut"?"Günstig einsteigen":p.gesundheit==="mittel"?"Risikoaufschlag möglich":"Annahme kann abgelehnt werden",fav:p.gesundheit==="gut"?"pkv":"gkv"},
    {l:"Alter",gkv:"Steigerung mit Einkommen",pkv:p.alter<35?"Jetzt günstig einsteigen":p.alter<50?"Altersrückstellungen aufgebaut":"Wechsel wird teurer",fav:p.alter<35?"pkv":p.alter>45?"gkv":"neutral"},
    {l:"Beruf",gkv:p.beruf==="beamter"?"Freiwillig möglich":p.beruf==="selbst"?"Voller Beitrag":"Arbeitgeberzuschuss 50%",pkv:p.beruf==="beamter"?"Beihilfe 50–70%":p.beruf==="selbst"?"Keine Pflichtversicherung":"Nur über Einkommensgrenze",fav:p.beruf==="beamter"?"pkv":p.beruf==="selbst"?"pkv":"neutral"},
    {l:"Beitrag (Ø)",gkv:fmt(R.gkvBeitrag)+"/Mon.",pkv:fmt(R.pkv)+"/Mon. (Schätzung)",fav:R.gkvBeitrag<R.pkv?"gkv":"pkv"},
  ];

  // Kontext-Übersetzung
  const buildKontext=()=>{
    const items=[];
    if(p.kinder>0&&!p.partner)
      items.push({icon:"👶",text:`Mit ${p.kinder} ${p.kinder===1?"Kind":"Kindern"} können diese in der GKV unter Voraussetzungen beitragsfrei familienversichert sein. In der PKV entstehen in der Regel eigene Beiträge je Kind — das macht die GKV hier kostengünstiger.`});
    if(p.partner)
      items.push({icon:"👫",text:"Die GKV-Familienversicherung kann Ihren Partner ohne eigenes Einkommen beitragsfrei mitversichern. In der PKV wäre ein eigener Tarif nötig — das ist ein zentraler GKV-Vorteil in Ihrer Situation."});
    if(p.kinder>0&&p.partner)
      items.push({icon:"🏠",text:`Partner und ${p.kinder} ${p.kinder===1?"Kind":"Kinder"} könnten in der GKV beitragsfrei mitversichert sein. In der PKV würde jeder separate Tarife benötigen — das addiert sich erheblich.`});
    if(p.gesundheit==="gut"&&p.kinder===0&&!p.partner&&p.alter<40)
      items.push({icon:"💪",text:"Für gesunde Personen ohne Familienverpflichtungen kann die PKV beim Leistungsniveau und je nach Tarif auch beim Beitrag interessant sein — besonders bei frühem Einstieg."});
    if(p.gesundheit==="schlecht")
      items.push({icon:"⚕️",text:"Bei eingeschränktem Gesundheitszustand prüft die PKV bei Aufnahme genau — Risikoaufschläge oder Ablehnungen sind möglich. Die GKV nimmt jeden ohne Gesundheitsprüfung auf."});
    if(p.alter>=50)
      items.push({icon:"📅",text:"Mit steigendem Alter werden PKV-Tarife teurer und ein Wechsel zurück in die GKV ist im Alter schwierig. Die langfristige Perspektive sollte in Ihre Entscheidung einfließen."});
    if(p.beruf==="beamter")
      items.push({icon:"🏛️",text:"Als Beamter erhalten Sie Beihilfe vom Dienstherrn (50–70 % der Kosten) — die PKV ergänzt nur den Restanteil. Das macht die PKV für Beamte typischerweise deutlich attraktiver."});
    if(p.beruf==="selbst")
      items.push({icon:"🧑‍💼",text:"Als Selbstständiger sind Sie nicht pflichtversichert und müssen den vollen GKV-Beitrag selbst tragen. Die PKV kann je nach Gesundheitszustand und Tarif eine relevante Alternative sein."});
    if(items.length===0)
      items.push({icon:"⚖️",text:"Ihre Situation ist ausgewogen — keine der typischen Stärken von GKV oder PKV überwiegt deutlich. Eine individuelle Tarifprüfung lohnt sich."});
    return items;
  };

  // Danke
  if(danke)return(
    <div style={{...T.page,"--accent":C}}>
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
      <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
        <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
        <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir melden uns innerhalb von 24 Stunden mit einer individuellen Einschätzung.</div>
        <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"11px",color:"#999",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px"}}>Ihr Berater</div><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
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
        <div style={T.hero}><div style={T.eyebrow}>Gespräch vereinbaren</div><div style={T.h1}>Individuelle Tarif­prüfung</div><div style={T.body}>Wir bereiten eine konkrete Gegenüberstellung auf Basis Ihrer Situation vor.</div></div>
        <div style={T.section}>
          <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"12px 14px",background:"#fafafa",marginBottom:"16px",display:"flex",gap:"20px"}}>
            <div><div style={{fontSize:"15px",fontWeight:"700",color:C,letterSpacing:"-0.3px"}}>{tendenzAnzeige}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>Tendenz{R.unterGrenze?" (GKV-pflichtig)":""}</div></div>
            <div><div style={{fontSize:"15px",fontWeight:"700",color:"#111",letterSpacing:"-0.3px"}}>{fmt(R.gkvBeitrag)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>GKV Ø/Mon.</div></div>
            <div><div style={{fontSize:"15px",fontWeight:"700",color:"#111",letterSpacing:"-0.3px"}}>{fmt(R.pkv)}</div><div style={{fontSize:"11px",color:"#aaa",marginTop:"1px"}}>PKV Schätzung</div></div>
          </div>
          {isDemo && (
            <div style={{ fontSize: "13px", color: "#999", textAlign: "center", marginBottom: "14px", lineHeight: 1.5 }}>
              Live-Vorschau für Sie als Makler — Ihr Kunde durchläuft dieselben Schritte; „Anpassen & kaufen“ öffnet den Konfigurator.
            </div>
          )}
          <CheckKontaktLeadLine />
          <div style={T.card}>
            {[{k:"name",l:"Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"tel",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"6px"}}/></div>
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
            <><button type="button" style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"gkv-pkv",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setDanke(true);}} disabled={!valid}>Gespräch anfragen</button><button type="button" style={T.btnSec} onClick={()=>goTo(2)}>Zurück</button></>
          )}
        </div>
      </div>
    );
  }

  // ── Phase 2: Ergebnis ────────────────────────────────────────────────────
  if(phase===2){
    const kontextItems=buildKontext();
    return(
      <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
        <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
        <div style={T.prog}><div style={T.progFil(66)}/></div>

        {/* Block 1: Tendenz + Eligibility */}
        <div style={T.hero}>
          <div style={T.eyebrow}>Ihre Einschätzung</div>
          {R.unterGrenze ? (
            <>
              <div style={T.h1}>Aktuell GKV-pflichtig</div>
              <div style={T.body}>Als angestellte Person mit {fmt(p.brutto)}/Monat liegen Sie unter der Versicherungspflichtgrenze — ein Wechsel in die PKV steht derzeit nicht frei offen.</div>
            </>
          ):(
            <>
              <div style={T.h1}>Tendenz: {R.empfehlung}</div>
              <div style={T.body}>{R.score[R.empfehlung.toLowerCase()]} von {R.total} Faktoren sprechen für {R.empfehlung} · Beitragsdifferenz {fmt(R.diff)}/Monat</div>
            </>
          )}
        </div>

        {/* Eligibility-Hinweis prominent */}
        {R.unterGrenze&&(
          <div style={T.section}>
            <div style={{border:`1px solid ${WARN}44`,borderRadius:"10px",padding:"14px 16px",background:`${WARN}04`,borderLeft:`3px solid ${WARN}`}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:WARN,marginBottom:"4px"}}>PKV aktuell nicht frei wählbar</div>
              <div style={{fontSize:"12px",color:"#555",lineHeight:1.65}}>Die Versicherungspflichtgrenze 2026 liegt bei 6.450 € brutto/Monat (77.400 €/Jahr). Sie liegen mit {fmt(p.brutto)}/Monat darunter. Ein PKV-Wechsel ist für Angestellte erst ab diesem Einkommen möglich.</div>
              <div style={{marginTop:"8px",fontSize:"11px",color:"#888"}}>Ausnahme: Beamte und Selbstständige sind nicht versicherungspflichtig.</div>
            </div>
          </div>
        )}

        {/* Block 2: Beitragsvergleich */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Beitragsvergleich</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"8px"}}>
            {[
              {label:"GKV",beitrag:R.gkvBeitrag,sub:"Ø-Zusatzbeitrag 2026",empf:gkvHervorgehoben},
              {label:"PKV",beitrag:R.pkv,sub:"Faustschätzung nach Alter",empf:pkvHervorgehoben},
            ].map(({label,beitrag,sub,empf},i)=>(
              <div key={i} style={{border:`2px solid ${empf?C:"#e8e8e8"}`,borderRadius:"10px",padding:"14px",background:empf?`${C}06`:"#fff"}}>
                <div style={{fontSize:"11px",fontWeight:"700",color:empf?C:"#aaa",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"4px"}}>{empf?"Tendenz · ":""}{label}</div>
                <div style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px"}}>{fmt(beitrag)}</div>
                <div style={{fontSize:"10px",color:"#aaa",marginTop:"2px"}}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:"11px",color:"#aaa",padding:"6px 10px",background:"#f7f7f7",borderRadius:"6px"}}>GKV-Beispiel: allg. Beitragssatz 14,6% + Ø-Zusatzbeitrag 2,9% (2026). Der tatsächliche Zusatzbeitrag variiert je nach Krankenkasse.</div>
        </div>

        {/* Block 3: Faktor-Tabelle */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Darum passt das eher zu Ihrer Situation</div>
          <div style={T.card}>
            {FAKTOREN.map(({l,gkv,pkv,fav},i,arr)=>(
              <div key={i} style={{padding:"12px 16px",borderBottom:i<arr.length-1?"1px solid #f0f0f0":"none"}}>
                <div style={{fontSize:"11px",fontWeight:"600",color:"#aaa",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.3px"}}>{l}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div style={{padding:"8px",background:fav==="gkv"?"#f0fdf4":"#f9f9f9",borderRadius:"6px",border:fav==="gkv"?"1px solid #bbf7d0":"1px solid transparent"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:fav==="gkv"?OK:"#aaa",marginBottom:"2px"}}>GKV</div>
                    <div style={{fontSize:"12px",color:"#444",lineHeight:1.4}}>{gkv}</div>
                  </div>
                  <div style={{padding:"8px",background:fav==="pkv"?"#eff6ff":"#f9f9f9",borderRadius:"6px",border:fav==="pkv"?"1px solid #bfdbfe":"1px solid transparent"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:fav==="pkv"?C:"#aaa",marginBottom:"2px"}}>PKV</div>
                    <div style={{fontSize:"12px",color:"#444",lineHeight:1.4}}>{pkv}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 4: Kontext-Übersetzung */}
        <div style={T.section}>
          <div style={{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:"10px"}}>Was das für Sie konkret bedeutet</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {kontextItems.map(({icon,text},i)=>(
              <div key={i} style={{border:"1px solid #e8e8e8",borderRadius:"10px",padding:"12px 14px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                <span style={{fontSize:"16px",flexShrink:0,marginTop:"1px"}}>{icon}</span>
                <span style={{fontSize:"12px",color:"#444",lineHeight:1.65}}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{...T.section,marginBottom:"120px"}}>
          <div style={T.infoBox}>Diese Einschätzung ist eine erste Orientierung und ersetzt keine individuelle Tarif- und Leistungsprüfung. PKV-Beiträge basieren auf Faustformeln — konkrete Angebote können abweichen.</div>
          <div style={{...T.infoBox,marginTop:"10px"}}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        {/* Block 5: CTA */}
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={()=>goTo(3)}>Individuelle Prüfung anfragen</button>
          <button style={T.btnSec} onClick={()=>goTo(1)}>Zurück</button>
        </div>
      </div>
    );
  }

  // ── Phase 1: Eingabe ─────────────────────────────────────────────────────
  return(
    <div style={{...T.page,"--accent":C}} key={ak} className="fade-in">
      <div style={T.header}><div style={T.logo}><div style={T.logoMk}><LogoSVG/></div><span style={{fontSize:"13px",fontWeight:"600",color:"#111"}}>{MAKLER.firma}</span></div><span style={T.badge}>GKV vs. PKV</span></div>
      <div style={T.prog}><div style={T.progFil(33)}/></div>
      <div style={T.hero}><div style={T.eyebrow}>GKV vs. PKV Entscheidungshilfe</div><div style={T.h1}>Was lohnt sich für Sie?</div><div style={T.body}>Einschätzung auf Basis Ihrer Situation — inkl. Zugangsvoraussetzung für die PKV.</div></div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}><SliderCard label="Monatliches Bruttoeinkommen" value={p.brutto} min={1000} max={12000} step={100} unit="€" display={p.beruf==="angestellt"?p.brutto>=JAEG_MONAT?"✓ Über der Versicherungspflichtgrenze":"Unter der Versicherungspflichtgrenze (6.450 €/Mon.)":""} accent={C} onChange={v=>set("brutto",v)}/></div>
          <div style={T.row}><SliderCard label="Aktuelles Alter" value={p.alter} min={18} max={60} step={1} unit="Jahre" accent={C} onChange={v=>set("alter",v)}/></div>
          <div style={T.row}><SliderCard label="Kinder" value={p.kinder} min={0} max={5} step={1} unit="Kinder" accent={C} onChange={v=>set("kinder",v)}/></div>
          <div style={T.row}><label style={T.fldLbl}>Partner mitversichern?</label><div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
            <SelectionCard value="no" label="Nein / arbeitet selbst" description="Partner hat eigenes Einkommen oder keine Mitversicherung" selected={!p.partner} accent={C} onClick={()=>set("partner",false)}/>
            <SelectionCard value="yes" label="Ja, ohne eigenes Einkommen" description="Familienversicherung in der GKV möglich" selected={p.partner} accent={C} onClick={()=>set("partner",true)}/>
          </div></div>
          <div style={T.row}><label style={T.fldLbl}>Berufsstatus</label><div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
            {[
              {v:"angestellt",l:"Angestellt",d:"Arbeitgeberanteil zur GKV"},
              {v:"selbst",l:"Selbstständig",d:"Voller Beitrag, PKV oft relevant"},
              {v:"beamter",l:"Beamter",d:"Beihilfe + PKV-Logik"},
            ].map(({v,l,d})=>(<SelectionCard key={v} value={v} label={l} description={d} selected={p.beruf===v} accent={C} onClick={()=>set("beruf",v)}/>))}
          </div></div>
          <div style={T.rowLast}><label style={T.fldLbl}>Gesundheitszustand</label><div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"8px"}}>
            {[
              {v:"gut",l:"Gut",d:"Günstiger PKV-Einstieg möglich"},
              {v:"mittel",l:"Mittel",d:"Risikoaufschläge in der PKV"},
              {v:"schlecht",l:"Eingeschränkt",d:"GKV ohne Gesundheitsprüfung"},
            ].map(({v,l,d})=>(<SelectionCard key={v} value={v} label={l} description={d} selected={p.gesundheit===v} accent={C} onClick={()=>set("gesundheit",v)}/>))}
          </div></div>
        </div>
      </div>
      <div style={{height:"120px"}}/>
      <div style={T.footer}><button style={T.btnPrim(false)} onClick={()=>goTo(2)}>Empfehlung anzeigen</button></div>
    </div>
  );
}
