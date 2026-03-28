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
const fmtK = (n) => n>=10000 ? Math.round(n/1000)+".000 €" : fmt(n);
const WARN_RL = "#c0392b";

function berechne(p) {
  const { monatsBedarf, absicherungsjahre, witweRente, waisenRenten, partnerEinkommen, vorhandeneVS, kredite } = p;
  const eingang     = witweRente + waisenRenten + partnerEinkommen;
  const lueckeMonat = Math.max(0, monatsBedarf - eingang);
  const diskont     = 0.03;
  const barwert     = lueckeMonat > 0 ? lueckeMonat * 12 * ((1 - Math.pow(1 + diskont, -absicherungsjahre)) / diskont) : 0;
  const gesamtBedarf = barwert + kredite;
  const lueckeVS     = Math.max(0, gesamtBedarf - vorhandeneVS);
  const deckungsgrad = gesamtBedarf > 0 ? Math.min(100, Math.round((vorhandeneVS / gesamtBedarf) * 100)) : 100;
  return { eingang, lueckeMonat, barwert, gesamtBedarf, lueckeVS, deckungsgrad };
}

export default function RisikolebenRechner() {
  const MAKLER = useCheckConfig();
  const C = MAKLER.primaryColor;
  const isDemo = isCheckDemoMode();
  const [phase, setPhase] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [p, setP] = useState({ monatsBedarf:3000, absicherungsjahre:20, witweRente:700, waisenRenten:300, partnerEinkommen:1200, vorhandeneVS:0, kredite:0 });
  const [formData, setFormData] = useState({ name:"", email:"", telefon:"" });
  const [scr, setScr] = useState(1);
  const nextScr = () => scr < 5 ? setScr(s => s+1) : goTo(2);
  const backScr = () => scr > 1 && setScr(s => s-1);
  const goTo = (ph) => { setAnimKey(k=>k+1); setPhase(ph); window.scrollTo({top:0}); };
  const set  = (k,v) => setP(x=>({...x,[k]:v}));
  const R = berechne(p);
  const progPct = phase===1 ? scr*5 : {2:78,3:94,4:100}[phase]||0;

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
    footer:  { position:"sticky", bottom:0, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:"1px solid #e8e8e8", padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
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
    <Shell eyebrow={scr===1?"Risikoleben-Check":undefined}
      title={
        scr===1?"Wie ist Ihre Familie aktuell abgesichert?":
        scr===2?"Wie viel braucht Ihre Familie monatlich?":
        scr===3?"Wie lange soll die Absicherung laufen?":
        scr===4?"Haben Sie bestehende Kredite?":
        "Wie hoch ist das Einkommen Ihres Partners?"
      }
      lead={
        scr===1?"Wir berechnen Ihren persönlichen Absicherungsbedarf – in weniger als 2 Minuten.":
        scr===2?"Miete, Lebenshaltung, Kinderkosten – alles zusammen.":
        scr===3?"Zum Beispiel bis Ihr jüngstes Kind 25 ist oder bis zur Rente.":
        scr===4?"Offene Kredite müssen im Todesfall sofort abgelöst werden.":
        "Dieses Einkommen steht Ihrer Familie im Ernstfall zur Verfügung."
      }
      footer={
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <button style={T.btnMain(false)} onClick={nextScr}>
            {scr<5?"Weiter":"Ergebnis anzeigen"}
          </button>
          {scr>1&&<button style={T.btnBack} onClick={backScr}>Zurück</button>}
        </div>
      }>
      <div style={{padding:"0 16px"}}>

        {scr===1&&(
          <div style={{...T.card,marginTop:"16px"}}><div style={{padding:"24px"}}>
            <div style={{textAlign:"center",fontSize:"40px",marginBottom:"16px"}}>❤️</div>
            <p style={{fontSize:"14px",color:"#555",lineHeight:1.6,textAlign:"center",margin:0}}>
              Was würde Ihrer Familie fehlen, wenn Sie plötzlich nicht mehr da wären?
              Finden Sie in 5 Schritten heraus, wie hoch Ihr Bedarf wirklich ist.
            </p>
          </div></div>
        )}

        {scr===2&&(
          <div style={{...T.card,marginTop:"16px"}}><div style={{padding:"20px"}}>
            <div style={T.fldWrap}>
              <label style={T.fldLbl}>Monatlicher Bedarf der Familie</label>
              <div style={T.fldVal}>{fmt(p.monatsBedarf)}/Monat</div>
              <input type="range" min={1000} max={8000} step={100} value={p.monatsBedarf} onChange={e=>set("monatsBedarf",+e.target.value)} style={{width:"100%"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>1.000 €</span><span>8.000 €</span></div>
            </div>
          </div></div>
        )}

        {scr===3&&(
          <div style={{...T.card,marginTop:"16px"}}><div style={{padding:"20px"}}>
            <div style={T.fldWrap}>
              <label style={T.fldLbl}>Absicherungszeitraum</label>
              <div style={T.fldVal}>{p.absicherungsjahre} Jahre</div>
              <input type="range" min={5} max={35} step={1} value={p.absicherungsjahre} onChange={e=>set("absicherungsjahre",+e.target.value)} style={{width:"100%"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>5 Jahre</span><span>35 Jahre</span></div>
            </div>
          </div></div>
        )}

        {scr===4&&(
          <div style={{...T.card,marginTop:"16px"}}><div style={{padding:"20px"}}>
            <div style={T.fldWrap}>
              <label style={T.fldLbl}>Bestehende Kredite</label>
              <div style={T.fldVal}>{p.kredite===0?"Keine":fmtK(p.kredite)}</div>
              <input type="range" min={0} max={800000} step={5000} value={p.kredite} onChange={e=>set("kredite",+e.target.value)} style={{width:"100%"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>0 €</span><span>800.000 €</span></div>
            </div>
          </div></div>
        )}

        {scr===5&&(
          <div style={{...T.card,marginTop:"16px"}}><div style={{padding:"20px"}}>
            <div style={T.fldWrap}>
              <label style={T.fldLbl}>Einkommen des Partners (monatlich netto)</label>
              <div style={T.fldVal}>{p.partnerEinkommen===0?"Kein Einkommen":fmt(p.partnerEinkommen)+"/Monat"}</div>
              <input type="range" min={0} max={6000} step={100} value={p.partnerEinkommen} onChange={e=>set("partnerEinkommen",+e.target.value)} style={{width:"100%"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#d1d5db",marginTop:"2px"}}><span>0 €</span><span>6.000 €</span></div>
            </div>
          </div></div>
        )}

      </div>
    </Shell>
  );

  if (phase===2) {
    const ok = R.lueckeVS<=0;
    return (
      <Shell eyebrow="Auf Basis Ihrer Angaben" title="So kann der Absicherungsbedarf Ihrer Familie eingeschätzt werden"
        lead={ok ? "Auf Basis Ihrer Angaben ergibt sich kein wesentlicher Absicherungsbedarf ✓" : `Es ergibt sich ein möglicher Absicherungsbedarf von ${fmtK(R.lueckeVS)}.`}
        footer={<><button style={T.btnMain(false)} onClick={()=>goTo(3)}>Familie absichern</button><button style={T.btnBack} onClick={()=>goTo(1)}>Neue Berechnung starten</button></>}>

        {/* KPI Grid */}
        <div style={{padding:"0 16px 4px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"8px"}}>
            {[
              {l:"Gesamtbedarf", v:fmtK(R.gesamtBedarf), warn:false},
              {l:"Vorhanden",    v:fmtK(p.vorhandeneVS),  warn:false},
              {l:"Lücke",        v:fmtK(R.lueckeVS),      warn:R.lueckeVS>0},
            ].map(({l,v,warn},i)=>(
              <div key={i} style={{border:`1px solid ${warn?"#c0392b33":"#e8e8e8"}`,borderRadius:"10px",padding:"12px 8px",background:warn?"#fff5f5":"#fff",textAlign:"center"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:warn?WARN_RL:C,letterSpacing:"-0.2px"}}>{v}</div>
                <div style={{fontSize:"10px",color:"#aaa",marginTop:"2px",fontWeight:"500"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Berechnungs-Breakdown */}
        <div style={T.secLbl}>📊 Wie sich der Bedarf zusammensetzt</div>
        <div style={{padding:"0 16px 4px"}}>
          <div style={{...cardLift,overflow:"hidden"}}>
            {[
              {l:"Was deine Familie monatlich braucht",    v:fmt(p.monatsBedarf)+"/Mon.",           farbe:"#111"},
              {l:"Abzüglich gesetzlicher Leistungen",      v:"− "+fmt(p.witweRente+p.waisenRenten)+"/Mon.", farbe:"#059669"},
              {l:"Abzüglich Partnereinkommen",             v:"− "+fmt(p.partnerEinkommen)+"/Mon.",  farbe:"#059669"},
              {l:"Monatliche Lücke",                       v:fmt(R.lueckeMonat)+"/Mon.",            farbe:R.lueckeMonat>0?WARN_RL:"#059669", bold:true},
              {l:"Plus Kredite die abgelöst werden müssen",v:"+ "+fmtK(p.kredite),                  farbe:"#111"},
              {l:"Kalkulierter Absicherungsbedarf",         v:fmtK(R.gesamtBedarf),                  farbe:C, bold:true},
            ].map((row,i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 18px",borderBottom:i<arr.length-1?"1px solid #f9fafb":"none"}}>
                <div style={{fontSize:"13px",color:"#6b7280",fontWeight:row.bold?"600":"400"}}>{row.l}</div>
                <div style={{fontSize:"13px",fontWeight:"700",color:row.farbe,textAlign:"right",marginLeft:"12px",flexShrink:0}}>{row.v}</div>
              </div>
            ))}
          </div>
        </div>

        {!ok&&<div style={{margin:"12px 16px 0",padding:"14px 16px",background:alpha(C,0.06),borderRadius:"14px",border:`1.5px solid ${alpha(C,0.14)}`}}>
          <div style={{fontSize:"12px",fontWeight:"700",color:C,marginBottom:"4px"}}>Einschätzung</div>
          <div style={{fontSize:"13px",color:"#4b5563",lineHeight:1.55}}>Der mögliche Absicherungsbedarf liegt auf Basis Ihrer Angaben bei <strong>{fmtK(R.lueckeVS)}</strong>. Der tatsächliche Bedarf kann je nach Lebenssituation und finanziellen Zielen variieren.</div>
        </div>}

        {/* Info Box: Gesetzliche Witwenrente */}
        <div style={{margin:"12px 16px 0",padding:"14px 16px",background:"#f0f9ff",borderRadius:"10px",border:"1px solid #bae6fd"}}>
          <div style={{fontSize:"12px",fontWeight:"700",color:"#0369a1",marginBottom:"4px"}}>Gesetzliche Witwen-/Waisenrente</div>
          <div style={{fontSize:"12px",color:"#444",lineHeight:1.65}}>Die große Witwenrente beträgt ca. 55 % der gesetzlichen Rentenanwartschaft. Pro Kind (Halbwaise) kommen ca. 10 % hinzu. Eigenes Einkommen des Partners wird nach §97 SGB VI angerechnet — ab ca. 1.038 €/Mon. reduziert sich die Witwenrente.</div>
        </div>

        <div style={{ padding: "12px 16px" }}>
          <CheckBerechnungshinweis>
            <>
              Gesamtbedarf = monatliche Lücke × 12 × Absicherungsjahre (Barwert, 3 % Diskontierung) + Kredite. Lücke = Familienbedarf minus Witwen-/Waisenrente minus Partnereinkommen.{" "}
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
      <Shell eyebrow="Fast geschafft" title="Wo können wir dich erreichen?" lead="Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis."
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
          <><button style={T.btnMain(!valid)} disabled={!valid} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"risikoleben",kundenName:formData.name,kundenEmail:formData.email,kundenTel:formData.telefon||""})}).catch(()=>{});}goTo(4);}}>{valid?"Familie absichern":"Bitte alle Angaben machen"}</button><button style={T.btnBack} onClick={()=>goTo(2)}>Zurück</button></>
        )}>
        <div style={{padding:"0 16px"}}>
          {isDemo && (
            <div style={{ fontSize: "13px", color: "#999", textAlign: "center", marginBottom: "14px", lineHeight: 1.5 }}>
              Live-Vorschau für Sie als Makler — Ihr Kunde durchläuft dieselben Schritte; „Anpassen & kaufen“ öffnet den Konfigurator.
            </div>
          )}
          <div style={{background:alpha(C,0.06),border:`1.5px solid ${alpha(C,0.14)}`,borderRadius:"10px",padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",fontWeight:"700",color:C,marginBottom:"4px"}}>Deine Berechnung</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div><div style={{fontSize:"11px",color:"#9ca3af"}}>Fehlende Summe</div><div style={{fontSize:"16px",fontWeight:"800",color:"#dc2626"}}>{fmtK(R.lueckeVS)}</div></div>
              <div><div style={{fontSize:"11px",color:"#9ca3af"}}>Absicherungszeitraum</div><div style={{fontSize:"16px",fontWeight:"800",color:C}}>{p.absicherungsjahre} Jahre</div></div>
            </div>
          </div>
          <div style={T.card}><div style={{padding:"20px"}}>
            {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"telefon",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint})=>(
              <div key={k} style={T.iWrap}><label style={T.iLabel}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={formData[k]} onChange={e=>setFormData(f=>({...f,[k]:e.target.value}))} style={T.input}/>{hint&&<div style={{fontSize:"11px",color:"#aaa",marginTop:"4px"}}>{hint}</div>}</div>
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
        <h1 style={{fontSize:"22px",fontWeight:"700",color:"#111",letterSpacing:"-0.5px",marginBottom:"8px"}}>{formData.name?`Danke, ${formData.name.split(" ")[0]}.`:"Anfrage gesendet."}</h1>
        <p style={{fontSize:"14px",color:"#666",lineHeight:1.65}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</p>
      </div>
      <div style={{padding:"24px 16px 0"}}>
        <div style={{...cardLift,overflow:"hidden"}}>
          <div style={{padding:"16px 18px",borderBottom:"1px solid #f0f0f0"}}>
            <div style={{fontSize:"11px",fontWeight:"600",letterSpacing:"0.5px",textTransform:"uppercase",color:"#999",marginBottom:"5px"}}>Dein Berater</div>
            <div style={{fontSize:"15px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div>
            <div style={{fontSize:"13px",color:"#888"}}>{MAKLER.firma}</div>
          </div>
          <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:"10px"}}>
            <a href={`tel:${MAKLER.telefon}`} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",color:C,fontWeight:"500"}}><span style={{width:"34px",height:"34px",borderRadius:"9px",background:alpha(C,0.08),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>📞</span>{MAKLER.telefon}</a>
            <a href={`mailto:${MAKLER.email}`} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"14px",color:C,fontWeight:"500"}}><span style={{width:"34px",height:"34px",borderRadius:"9px",background:alpha(C,0.08),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>✉️</span>{MAKLER.email}</a>
          </div>
        </div>
      </div>
      <div style={{textAlign:"center",marginTop:"20px"}}>
        <button onClick={()=>goTo(1)} style={{fontSize:"13px",color:"#aaa",cursor:"pointer",background:"none",border:"none"}}>Neuen Check starten</button>
      </div>
    </Shell>
  );
}
