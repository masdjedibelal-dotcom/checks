import { useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";

(() => {
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
    html, body { height:100%; background:#fff; font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased; }
    button, input { font-family:inherit; cursor:pointer; border:none; background:none; }
    input { cursor:text; }
    ::-webkit-scrollbar { display:none; } * { scrollbar-width:none; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:none;} }
    .anim-fadeup { animation:fadeUp 0.28s ease both; }
    button:active { opacity:0.75; }
    input:focus { outline:none; }
    input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:2px; border-radius:1px; background:#e5e5e5; cursor:pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:var(--accent, #1a3a5c); border:2px solid #fff; box-shadow:0 0 0 1px var(--accent, #1a3a5c); }
    a { text-decoration:none; }
  `;
  document.head.appendChild(s);
})();

const alpha = (hex,a) => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; };
const fmt  = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
const fmtK = (n) => n>=10000 ? Math.round(n/1000)+"0".repeat(0)+".000 €" : fmt(n);
const FREIBETRAG_WITWE = 1038;
const WARN_RL = "#c0392b";

function berechne(p) {
  const { bruttoVerstorben, alterJuengstesKind, kinder, partnerEinkommen, vorhandeneVS, kredite } = p;

  // Gesetzliche Witwen-/Witwerrente
  // Große Witwe/r: 55% der Rentenanwartschaft (vereinfacht: 55% × 48% Netto × Brutto)
  const renteAnwartschaft = bruttoVerstorben * 0.48; // ca. gesetzl. Rente
  const witweRente        = renteAnwartschaft * 0.55;

  // Waisenrente: 10% (Halbwaise) pro Kind, bis 18 (25 in Ausbildung)
  const jahreWaisenrente  = Math.max(0, 25 - alterJuengstesKind);
  const waisenRenteJKind  = renteAnwartschaft * 0.10;
  const waisenRenteGesamt = waisenRenteJKind * Math.min(kinder, 3); // max. 3 Kinder

  // §97 SGB VI: Eigenes Einkommen wird auf Witwenrente angerechnet wenn über Freibetrag
  const anrechnung =
    partnerEinkommen > FREIBETRAG_WITWE
      ? Math.round((partnerEinkommen - FREIBETRAG_WITWE) * 0.4)
      : 0;
  const gesWitwe = Math.max(0, witweRente - anrechnung);
  const gesGesetzl = gesWitwe + waisenRenteGesamt;

  // Monatlicher Eingang nach Tod
  const eingang = gesWitwe + waisenRenteGesamt + partnerEinkommen;

  // Bedarf: Haushalt läuft weiter bis jüngstes Kind 25 ist, dann Witwenbedarf
  const familienBedarf    = bruttoVerstorben * 0.67 * 0.75; // 75% des Nettos als Familienbedarf
  const lueckeMonat       = Math.max(0, familienBedarf - eingang);

  // Absicherungszeitraum: bis jüngstes Kind 25 Jahre alt
  const absicherungsjahre = Math.max(5, Math.min(30, 25 - alterJuengstesKind + 5));

  // Kapitalbedarf Barwert (3% Diskontierung)
  const diskont = 0.03;
  const barwert = lueckeMonat * 12 * ((1 - Math.pow(1+diskont, -absicherungsjahre)) / diskont);

  const gesamtBedarf      = barwert + kredite;
  const lueckeVS          = Math.max(0, gesamtBedarf - vorhandeneVS);
  const deckungsgrad      = gesamtBedarf > 0 ? Math.min(100, Math.round((vorhandeneVS / gesamtBedarf) * 100)) : 100;

  return {
    witweRente,
    gesWitwe,
    anrechnung,
    gesGesetzl,
    waisenRenteGesamt,
    waisenRenteJKind,
    jahreWaisenrente,
    eingang,
    familienBedarf,
    lueckeMonat,
    absicherungsjahre,
    barwert,
    gesamtBedarf,
    lueckeVS,
    deckungsgrad,
  };
}

export default function RisikolebenRechner() {
  const MAKLER = useCheckConfig();
  const C = MAKLER.primaryColor;
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [p, setP] = useState({ bruttoVerstorben:4500, alterJuengstesKind:8, kinder:2, partnerEinkommen:1800, vorhandeneVS:0, kredite:0 });
  const [formData, setFormData] = useState({ name:"", email:"", telefon:"" });
  const goTo = (ph) => { setAnimKey(k=>k+1); setPhase(ph); window.scrollTo({top:0}); };
  const set  = (k,v) => setP(x=>({...x,[k]:v}));
  const R = berechne(p);
  const progPct = {1:25,2:78,3:94,4:100}[phase]||0;

  const cardLift = {
    background:"#fff",
    borderRadius:"10px",
    border:"1px solid #e8e8e8",
    boxShadow:"0 1px 2px rgba(0,0,0,0.04)",
  };

  const T = {
    root:    { minHeight:"100vh", background:"#fff", fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
    header:  { position:"sticky", top:0, zIndex:100, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderBottom:"1px solid #e8e8e8", padding:"0 24px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    logoWrap:{ display:"flex", alignItems:"center", gap:"10px" },
    logoBox: { width:"28px", height:"28px", borderRadius:"6px", background:C, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700" },
    logoTxt: { fontSize:"13px", fontWeight:"600", color:"#111" },
    badge:   { fontSize:"11px", fontWeight:"500", color:"#888", letterSpacing:"0.3px", textTransform:"uppercase" },
    progBar: { height:"2px", background:"#f0f0f0" },
    progFill:{ height:"100%", width:`${progPct}%`, background:C, transition:"width 0.4s ease" },
    hero:    { padding:"32px 24px 16px" },
    eyebrow: { fontSize:"11px", fontWeight:"600", letterSpacing:"1px", textTransform:"uppercase", color:"#999", marginBottom:"6px" },
    h1:      { fontSize:"22px", fontWeight:"700", color:"#111", lineHeight:1.25, letterSpacing:"-0.5px" },
    lead:    { fontSize:"14px", color:"#666", lineHeight:1.65, marginTop:"6px" },
    body:    { paddingBottom:"120px" },
    card:    { margin:"0 16px 10px", ...cardLift, overflow:"hidden" },
    secLbl:  { fontSize:"11px", fontWeight:"600", letterSpacing:"0.5px", textTransform:"uppercase", color:"#999", padding:"16px 24px 8px" },
    fldLbl:  { display:"block", fontSize:"12px", fontWeight:"600", color:"#444", marginBottom:"8px" },
    fldVal:  { fontSize:"21px", fontWeight:"700", color:C, letterSpacing:"-0.4px", marginBottom:"6px" },
    fldHint: { fontSize:"11px", color:"#aaa", marginTop:"4px" },
    fldWrap: { marginBottom:"20px" },
    opt3:    { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"6px", marginTop:"8px" },
    optBtn:  (a) => ({ padding:"9px 8px", borderRadius:"6px", border:`1px solid ${a?C:"#e8e8e8"}`, background:a?C:"#fff", fontSize:"13px", fontWeight:a?"600":"400", color:a?"#fff":"#444", transition:"all 0.15s", textAlign:"center", cursor:"pointer" }),
    footer:  { position:"sticky", bottom:0, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:"1px solid #e8e8e8", padding:"14px 24px 28px" },
    btnMain: (d) => ({ width:"100%", padding:"13px 20px", background:d?"#e8e8e8":C, color:d?"#aaa":"#fff", borderRadius:"8px", fontSize:"14px", fontWeight:"600", cursor:d?"default":"pointer" }),
    btnBack: { width:"100%", padding:"10px", color:"#aaa", fontSize:"13px", marginTop:"6px", cursor:"pointer" },
    iLabel:  { display:"block", fontSize:"12px", fontWeight:"600", color:"#444", marginBottom:"6px" },
    input:   { width:"100%", padding:"10px 12px", border:"1px solid #e8e8e8", borderRadius:"6px", fontSize:"14px", color:"#111", background:"#fff", outline:"none" },
    iWrap:   { marginBottom:"14px" },
  };

  const Shell = ({ eyebrow, title, lead, children, footer }) => (
    <div style={T.root}>
      <div style={T.header}><div style={T.logoWrap}><div style={T.logoBox}>❤️</div><span style={T.logoTxt}>{MAKLER.firma}</span></div><span style={T.badge}>Risikoleben</span></div>
      <div style={T.progBar}><div style={T.progFill} /></div>
      <div key={animKey} className="anim-fadeup" style={T.body}>
        <div style={T.hero}>{eyebrow&&<div style={T.eyebrow}>{eyebrow}</div>}{title&&<h1 style={T.h1}>{title}</h1>}{lead&&<p style={T.lead}>{lead}</p>}</div>
        {children}
      </div>
      {footer&&<div style={T.footer}>{footer}</div>}
    </div>
  );

  if (phase===1) return (
    <Shell eyebrow="Risikoleben · Absicherungs-Rechner" title="Ist Ihre Familie wirklich abgesichert?" lead="Wir rechnen mit gesetzlichen Witwen-/Waisenrenten — nicht nur mit dem Kapitalbedarf. So entsteht das realistische Bild."
      footer={<button style={T.btnMain(false)} onClick={()=>goTo(2)}>Ergebnis berechnen →</button>}>
      <div style={{ padding:"0 16px" }}><div style={T.card}><div style={{ padding:"20px" }}>

        <div style={T.fldWrap}>
          <label style={T.fldLbl}>Bruttogehalt der abzusichernden Person</label>
          <div style={T.fldVal}>{fmt(p.bruttoVerstorben)}/Monat</div>
          <input type="range" min={1500} max={12000} step={100} value={p.bruttoVerstorben} onChange={e=>set("bruttoVerstorben",+e.target.value)} style={{width:"100%"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>1.500 €</span><span>12.000 €</span></div>
          <div style={T.fldHint}>Basis für gesetzliche Witwen-/Waisenrente (55% der Rentenanwartschaft)</div>
        </div>

        <div style={T.fldWrap}>
          <label style={T.fldLbl}>Kinder</label>
          <div style={T.opt3}>{[0,1,2,3].map(n=><button key={n} style={T.optBtn(p.kinder===n)} onClick={()=>set("kinder",n)}>{n===0?"Keine":n===3?"3+":n}</button>)}</div>
        </div>

        {p.kinder>0&&<div style={T.fldWrap}>
          <label style={T.fldLbl}>Alter des jüngsten Kindes</label>
          <div style={T.fldVal}>{p.alterJuengstesKind} Jahre · Waisenrente noch {Math.max(0,25-p.alterJuengstesKind)} Jahre</div>
          <input type="range" min={0} max={24} step={1} value={p.alterJuengstesKind} onChange={e=>set("alterJuengstesKind",+e.target.value)} style={{width:"100%"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>0 Jahre</span><span>24 Jahre</span></div>
        </div>}

        <div style={T.fldWrap}>
          <label style={T.fldLbl}>Eigenes Einkommen des Partners (Netto)</label>
          <div style={T.fldVal}>{p.partnerEinkommen===0?"Kein Einkommen":fmt(p.partnerEinkommen)+"/Monat"}</div>
          <input type="range" min={0} max={6000} step={100} value={p.partnerEinkommen} onChange={e=>set("partnerEinkommen",+e.target.value)} style={{width:"100%"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>0 €</span><span>6.000 €</span></div>
          <div style={T.fldHint}>Fließt als Einnahme der Familie ein</div>
        </div>

        <div style={T.fldWrap}>
          <label style={T.fldLbl}>Bestehende Risikolebens-Versicherungssumme</label>
          <div style={T.fldVal}>{p.vorhandeneVS===0?"Keine":fmtK(p.vorhandeneVS)}</div>
          <input type="range" min={0} max={1000000} step={10000} value={p.vorhandeneVS} onChange={e=>set("vorhandeneVS",+e.target.value)} style={{width:"100%"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>0 €</span><span>1.000.000 €</span></div>
        </div>

        <div style={{...T.fldWrap,marginBottom:0}}>
          <label style={T.fldLbl}>Bestehende Kredite / Restschuld</label>
          <div style={T.fldVal}>{p.kredite===0?"Keine":fmtK(p.kredite)}</div>
          <input type="range" min={0} max={800000} step={5000} value={p.kredite} onChange={e=>set("kredite",+e.target.value)} style={{width:"100%"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>0 €</span><span>800.000 €</span></div>
          <div style={T.fldHint}>Werden bei Todesfall sofort fällig</div>
        </div>

      </div></div></div>
    </Shell>
  );

  if (phase===2) {
    const ok = R.lueckeVS<=0;
    return (
      <Shell eyebrow="Ihre Absicherungs-Analyse" title={ok?"Familie gut abgesichert ✓":`${fmtK(R.lueckeVS)} fehlen zur Absicherung`} lead={ok?"Ihre vorhandene Versicherungssumme deckt den Familienbedarf.":null}
        footer={<><button style={T.btnMain(false)} onClick={()=>goTo(3)}>Lücke schließen →</button><button style={T.btnBack} onClick={()=>goTo(1)}>← Anpassen</button></>}>

        {/* Einkommensfluss nach Todesfall */}
        <div style={T.secLbl}>📊 Was die Familie monatlich erhält</div>
        <div style={{padding:"0 16px 4px"}}>
          <div style={{...cardLift,padding:"18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
              <span style={{fontSize:"12px",color:"#9ca3af"}}>Familienbedarf (geschätzt)</span>
              <span style={{fontSize:"13px",fontWeight:"800",color:"#111827"}}>{fmt(R.familienBedarf)}/Monat</span>
            </div>
            {[
              {l:"Gesetzl. Witwen-/Witwerrente",  v:fmt(R.gesWitwe),        farbe:"#059669", sub:`55% der Rentenanwartschaft des Verstorbenen`},
              {l:`Waisenrente (${p.kinder} Kind${p.kinder>1?"er":""})`,        v:fmt(R.waisenRenteGesamt),  farbe:"#059669", sub:`je ${fmt(R.waisenRenteJKind)}/Mon. × ${Math.min(p.kinder,3)} Kinder · noch ${R.jahreWaisenrente} Jahre`},
              {l:"Eigenes Einkommen Partner",      v:fmt(p.partnerEinkommen),  farbe:"#059669", sub:"Bleibt der Familie erhalten"},
              {l:"Gesamteingang",                  v:fmt(R.eingang),           farbe:C,         sub:"Summe aller Einnahmen", bold:true},
              {l:"Monatliche Lücke",               v:fmt(R.lueckeMonat),       farbe:R.lueckeMonat>0?"#dc2626":"#059669", sub:"Differenz zum Familienbedarf", bold:true},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"9px 0",borderBottom:i<4?"1px solid #f9fafb":"none"}}>
                <div><div style={{fontSize:"13px",color:"#6b7280",fontWeight:row.bold?"600":"400"}}>{row.l}</div><div style={{fontSize:"11px",color:"#9ca3af",marginTop:"1px"}}>{row.sub}</div></div>
                <div style={{fontSize:"13px",fontWeight:"700",color:row.farbe,textAlign:"right",marginLeft:"12px",flexShrink:0}}>{row.v}</div>
              </div>
            ))}
            {R.gesWitwe < R.witweRente && (
              <div style={{fontSize:"11px",color:WARN_RL,marginTop:"4px",lineHeight:1.5}}>
                Witwen-/Witwerrente durch Einkommensanrechnung auf {fmt(R.gesWitwe)}/Mon. reduziert (§97 SGB VI, Freibetrag {fmt(FREIBETRAG_WITWE)}/Mon.)
              </div>
            )}
          </div>
        </div>

        {/* Kapitalbedarf */}
        <div style={T.secLbl}>💰 Kapitalbedarf gesamt</div>
        <div style={{padding:"0 16px"}}>
          <div style={{...cardLift,overflow:"hidden"}}>
            {[
              {l:"Barwert monatliche Lücke",   v:fmtK(R.barwert),         sub:`${fmt(R.lueckeMonat)}/Mon. × ${R.absicherungsjahre} Jahre (bis jüngstes Kind 30)`, rot:false},
              {l:"Bestehende Kredite",          v:fmtK(p.kredite),         sub:"Werden bei Todesfall sofort fällig",                         rot:p.kredite>0},
              {l:"Gesamtbedarf",               v:fmtK(R.gesamtBedarf),    sub:"Barwert Lücke + Kredite",                                    rot:true},
              {l:"Vorhandene Versicherung",     v:fmtK(p.vorhandeneVS),    sub:"Bestehende Risikolebensversicherung",                         rot:false},
              {l:"Fehlende Absicherung",        v:fmtK(R.lueckeVS),        sub:`Deckungsgrad: ${R.deckungsgrad}%`,                           rot:R.lueckeVS>0},
            ].map((row,i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"12px 18px",borderBottom:i<arr.length-1?"1px solid #f3f4f6":"none"}}>
                <div><div style={{fontSize:"13px",color:"#6b7280"}}>{row.l}</div><div style={{fontSize:"11px",color:"#9ca3af",marginTop:"2px"}}>{row.sub}</div></div>
                <div style={{fontSize:"14px",fontWeight:"700",color:row.rot?"#dc2626":C,textAlign:"right",marginLeft:"12px",flexShrink:0}}>{row.v}</div>
              </div>
            ))}
          </div>
        </div>

        {!ok&&<div style={{margin:"8px 16px 0",padding:"14px 16px",background:alpha(C,0.06),borderRadius:"14px",border:`1.5px solid ${alpha(C,0.14)}`}}>
          <div style={{fontSize:"12px",fontWeight:"700",color:C,marginBottom:"4px"}}>Empfehlung</div>
          <div style={{fontSize:"13px",color:"#4b5563",lineHeight:1.55}}>Versicherungssumme von mindestens <strong>{fmtK(R.lueckeVS)}</strong> absichern. Als kostengünstige Risikolebensversicherung — für 30 Jahre ca. 20–50 €/Monat je nach Alter und Gesundheit.</div>
        </div>}

        <div style={{ padding: "0 16px" }}>
          <CheckBerechnungshinweis>
            <>
              Gesamtbedarf = monatlicher Eigenbedarf × 12 × Absicherungsjahre + Kredite. Eigenbedarf = Monatsbedarf minus Witwenrente minus Waisenrente minus Partnereinkommen.{" "}
              Wichtig: Eigenes Einkommen des Partners wird nach <span style={{ color: "#b8884a" }}>§97 SGB VI</span> auf die Witwenrente angerechnet (Freibetrag 1.038 €/Mon., 40% Anrechnung darüber).{" "}
              <span style={{ color: "#b8884a" }}>Grundlage: §46–48 SGB VI</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

      </Shell>
    );
  }

  if (phase===3) {
    const valid = formData.name.trim()&&formData.email.trim();
    return (
      <Shell eyebrow="Absicherung regeln" title="Gespräch vereinbaren" lead="Wir berechnen die günstigste Risikolebensversicherung für Ihre genaue Situation."
        footer={isDemo ? (
          <>
            <button
              type="button"
              style={T.btnMain(false)}
              onClick={() =>
                window.parent.postMessage(
                  { type: "openConfig", slug: "risikoleben" },
                  "*",
                )
              }
            >
              Anpassen & kaufen
            </button>
            <button type="button" style={T.btnBack} onClick={()=>goTo(2)}>← Zurück</button>
          </>
        ) : (
          <><button style={T.btnMain(!valid)} disabled={!valid} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"risikoleben",kundenName:formData.name,kundenEmail:formData.email,kundenTel:formData.telefon||""})}).catch(()=>{});}goTo(4);}}>Anfrage senden</button><button style={T.btnBack} onClick={()=>goTo(2)}>← Zurück</button></>
        )}>
        <div style={{padding:"0 16px"}}>
          {isDemo && (
            <div style={{ fontSize: "13px", color: "#999", textAlign: "center", marginBottom: "14px", lineHeight: 1.5 }}>
              Live-Vorschau für Sie als Makler — Ihr Kunde durchläuft dieselben Schritte; „Anpassen & kaufen“ öffnet den Konfigurator.
            </div>
          )}
          <div style={{background:alpha(C,0.06),border:`1.5px solid ${alpha(C,0.14)}`,borderRadius:"10px",padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",fontWeight:"700",color:C,marginBottom:"4px"}}>Ihre Berechnung</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div><div style={{fontSize:"11px",color:"#9ca3af"}}>Fehlende Summe</div><div style={{fontSize:"16px",fontWeight:"800",color:"#dc2626"}}>{fmtK(R.lueckeVS)}</div></div>
              <div><div style={{fontSize:"11px",color:"#9ca3af"}}>Absicherungszeitraum</div><div style={{fontSize:"16px",fontWeight:"800",color:C}}>{R.absicherungsjahre} Jahre</div></div>
            </div>
          </div>
          <div style={T.card}><div style={{padding:"20px"}}>
            {[{k:"name",l:"Ihr Name",t:"text",ph:"Max Mustermann",req:true},{k:"email",l:"E-Mail",t:"email",ph:"max@beispiel.de",req:true},{k:"telefon",l:"Telefon",t:"tel",ph:"089 123 456 78",req:false}].map(({k,l,t,ph,req})=>(
              <div key={k} style={T.iWrap}><label style={T.iLabel}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={formData[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} style={T.input}/></div>
            ))}
            <p style={{fontSize:"11px",color:"#aaa",marginTop:"4px"}}>Vertraulich behandelt.</p>
          </div></div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{padding:"48px 20px 0",textAlign:"center"}} className="anim-fadeup">
        <div style={{width:"72px",height:"72px",borderRadius:"50%",background:alpha(C,0.1),color:C,fontSize:"28px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>✓</div>
        <h1 style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px",marginBottom:"8px"}}>Danke, {formData.name.split(" ")[0]||""}!</h1>
        <p style={{fontSize:"14px",color:"#666",lineHeight:1.65}}>Wir melden uns innerhalb von 24 Stunden<br/>mit konkreten Tarifen.</p>
      </div>
      <div style={{padding:"24px 16px 0"}}>
        <div style={{...cardLift,overflow:"hidden"}}>
          <div style={{padding:"16px 18px",borderBottom:"1px solid #f0f0f0"}}>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",color:"#999",marginBottom:"5px"}}>Ihr Berater</div>
            <div style={{fontSize:"15px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div>
            <div style={{fontSize:"13px",color:"#888"}}>{MAKLER.firma}</div>
          </div>
          <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:"10px"}}>
            <a href={`tel:${MAKLER.telefon}`} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",color:C,fontWeight:"500"}}><span style={{width:"34px",height:"34px",borderRadius:"9px",background:alpha(C,0.08),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>📞</span>{MAKLER.telefon}</a>
            <a href={`mailto:${MAKLER.email}`} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",color:C,fontWeight:"500"}}><span style={{width:"34px",height:"34px",borderRadius:"9px",background:alpha(C,0.08),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>✉️</span>{MAKLER.email}</a>
          </div>
        </div>
      </div>
    </Shell>
  );
}
