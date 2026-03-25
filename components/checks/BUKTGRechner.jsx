import { useMemo, useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";

// ─── GLOBAL SETUP ────────────────────────────────────────────────────────────
(() => {
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #ffffff; font-family: var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    button, input, select { font-family: inherit; border: none; background: none; cursor: pointer; }
    input, select { cursor: text; }
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .fade-in { animation: fadeIn 0.28s ease both; }
    button:active { opacity: 0.75; }
    input[type=range] {
      -webkit-appearance: none; appearance: none;
      width: 100%; height: 2px; border-radius: 1px;
      background: #e5e5e5; cursor: pointer;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 18px; height: 18px;
      border-radius: 50%; background: var(--accent);
      border: 2px solid #ffffff; box-shadow: 0 0 0 1px var(--accent);
    }
    a { text-decoration: none; }
  `;
  document.head.appendChild(s);
})();

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

// ─── SZENARIEN ────────────────────────────────────────────────────────────────
const SZENARIEN = [
  { id: "psyche",  label: "Psyche",    desc: "Burnout, Depression",     dauer: 42, buWahrsch: 52 },
  { id: "ruecken", label: "Rücken",    desc: "Bandscheibe, Chronisch",  dauer: 25, buWahrsch: 38 },
  { id: "krebs",   label: "Krebs",     desc: "Behandlung + Reha",       dauer: 50, buWahrsch: 68 },
  { id: "herz",    label: "Herz",      desc: "Infarkt, Herzinsuffizienz",dauer: 36, buWahrsch: 74 },
  { id: "unfall",  label: "Unfall",    desc: "Fraktur, Lähmung",        dauer: 18, buWahrsch: 45 },
];

// ─── BERECHNUNG ───────────────────────────────────────────────────────────────
function berechne({ brutto, beruf, ktgTag, buRente, szenario }) {
  const sz       = SZENARIEN.find(s => s.id === szenario) || SZENARIEN[0];
  const netto    = brutto * 0.67;
  const nettoTag = netto / 30;

  // Phase 1: Lohnfortzahlung (Tag 1–42)
  const lohnPhase = { start: 1, end: 42, pct: 100, monatl: netto, label: "Lohnfortzahlung" };

  // Phase 2: Krankengeld (Tag 43–546 = 18 Monate)
  // BBG KV 2026: 5.812,50 €/Mon. → max KG 135,63 €/Tag brutto
  // nach SV-Abzügen: ~120 €/Tag netto = ~3.600 €/Mon.
  // Quelle: §47 SGB V, BBG KV 2026
  const BBG_KV_MONAT = 5812.5;
  const BBG_KV_TAG = BBG_KV_MONAT / 30;
  const kgBruttoTag = Math.min(brutto / 30, BBG_KV_TAG) * 0.7;
  const kgNettoTag = kgBruttoTag * 0.885;
  const kg90Netto = (netto / 30) * 0.9;
  const kgEffTag = Math.min(kgNettoTag, kg90Netto);
  const gesKG = beruf === "selbst" ? 0 : kgEffTag * 30;
  const ktgMonatl = ktgTag * 30;
  const phase2    = { start: 43, end: 546, pct: Math.round(((gesKG + ktgMonatl) / netto) * 100), monatl: gesKG + ktgMonatl, label: beruf === "selbst" ? "Krankentagegeld" : "Krankengeld + KTG" };

  // Phase 3: Wartezeit BU (546–720 = 6 Monate Wartezeit)
  const phase3 = { start: 547, end: 720, pct: Math.round((ktgMonatl / netto) * 100), monatl: ktgMonatl, label: "KTG (Wartezeit BU)" };

  // Phase 4: BU anerkannt
  const phase4 = { start: 721, end: null, pct: Math.round(((buRente + (beruf === "selbst" ? 0 : 0)) / netto) * 100), monatl: buRente, label: "BU-Rente" };

  const lueckeKG  = Math.max(0, netto - phase2.monatl);
  const lueckeBU  = Math.max(0, netto - phase4.monatl);
  const ausfall   = sz.dauer; // Monate

  let kostTotal = 0;
  if (ausfall <= 1.4) kostTotal = lueckeKG * ausfall;
  else if (ausfall <= 18) kostTotal = lueckeKG * ausfall;
  else kostTotal = lueckeKG * 18 + lueckeBU * Math.max(0, ausfall - 18);

  // Empfehlungen berechnen
  const empfKTG  = Math.max(0, Math.ceil((lueckeKG / 30) / 5) * 5); // €/Tag, auf 5 gerundet
  const empfBU   = Math.max(0, Math.round(lueckeBU / 50) * 50);      // €/Mon, auf 50 gerundet
  // Größte Lücke identifizieren
  const phasenLuecken = [
    { idx: 1, label: "Krankengeld-Phase",  luecke: lueckeKG },
    { idx: 2, label: "Wartezeit",           luecke: Math.max(0, netto - phase3.monatl) },
    { idx: 3, label: "BU-Rente",           luecke: lueckeBU },
  ];
  const groessteluecke = phasenLuecken.reduce((a, b) => b.luecke > a.luecke ? b : a);
  return { netto, nettoTag, lohnPhase, phase2, phase3, phase4, lueckeKG, lueckeBU, kostTotal, sz, gesKG, ktgMonatl, empfKTG, empfBU, groessteluecke };
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
function makeBUKTGT(C) {
  return {
  page:    { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
  header:  { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { display: "flex", alignItems: "center", gap: "10px" },
  logoMk:  { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
  logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
  badge:   { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
  prog:    { height: "2px", background: "#f0f0f0" },
  progFil: (w) => ({ height: "100%", width: `${w}%`, background: C, transition: "width 0.4s ease" }),
  hero:    { padding: "32px 24px 16px" },
  label:   { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" },
  h1:      { fontSize: "22px", fontWeight: "700", color: "#111", lineHeight: 1.25, letterSpacing: "-0.5px" },
  body:    { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
  section: { padding: "0 24px", marginBottom: "20px" },
  divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
  card:    { border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" },
  row:     { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
  rowLast: { padding: "14px 16px" },
  fldLbl:  { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px", display: "block" },
  fldVal:  { fontSize: "20px", fontWeight: "700", color: C, letterSpacing: "-0.5px", marginBottom: "8px" },
  fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
  optRow:  { display: "grid", gap: "8px", marginTop: "6px" },
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px 28px" },
  btnPrim: (dis) => ({ width: "100%", padding: "13px 20px", background: dis ? "#e8e8e8" : C, color: dis ? "#aaa" : "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: dis ? "default" : "pointer", transition: "opacity 0.15s", letterSpacing: "-0.1px" }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  bigNum:  (warn) => ({ fontSize: "36px", fontWeight: "700", color: warn ? "#c0392b" : C, letterSpacing: "-1px", lineHeight: 1 }),
  bigLbl:  { fontSize: "12px", color: "#888", marginTop: "4px", fontWeight: "500" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? "#c0392b" : "#111" }),
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  timeBar: { height: "6px", borderRadius: "3px", transition: "width 0.5s ease" },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
};
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Header({ phase, total, makler, T }) {
  return (
    <>
      <div style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMk}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white"/>
            </svg>
          </div>
          <span style={T.logoTxt}>{makler.firma}</span>
        </div>
        <span style={T.badge}>BU + KTG</span>
      </div>
      <div style={T.prog}><div style={T.progFil((phase / total) * 100)} /></div>
    </>
  );
}

function Footer({ onNext, onBack, nextLabel = "Weiter", disabled = false, T }) {
  return (
    <div style={T.footer}>
      <button style={T.btnPrim(disabled)} onClick={onNext} disabled={disabled}>{nextLabel}</button>
      {onBack && <button style={T.btnSec} onClick={onBack}>Zurück</button>}
    </div>
  );
}

function ContactForm({ onSubmit, onBack, summary, isDemo, makler, T }) {
  const [fd, setFd] = useState({ name: "", email: "", tel: "" });
  const [consent, setConsent] = useState(false);
  const valid = fd.name.trim() && fd.email.trim() && consent;
  if (isDemo) {
    return (
      <div style={{ paddingBottom: "120px" }}>
        {summary && <div style={{ ...T.section }}><div style={T.infoBox}>{summary}</div></div>}
        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
            Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.
          </div>
          <button
            type="button"
            style={{ ...T.btnPrim(false) }}
            onClick={() =>
              window.parent.postMessage(
                { type: "openConfig", slug: "einkommens-check" },
                "*",
              )
            }
          >
            Anpassen & kaufen
          </button>
        </div>
        <div style={T.footer}>
          <button type="button" style={T.btnSec} onClick={onBack}>Zurück</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ paddingBottom: "120px" }}>
      {summary && <div style={{ ...T.section }}><div style={T.infoBox}>{summary}</div></div>}
      <div style={T.section}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[
            { k: "name",  l: "Name",    t: "text",  ph: "Max Mustermann",   req: true },
            { k: "email", l: "E-Mail",  t: "email", ph: "max@beispiel.de",  req: true },
            { k: "tel",   l: "Telefon", t: "tel",   ph: "089 123 456 78",   req: false },
          ].map(({ k, l, t, ph, req }, i, arr) => (
            <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
              <label style={T.fldLbl}>{l}{req ? " *" : ""}</label>
              <input type={t} placeholder={ph} value={fd[k]}
                onChange={e => setFd(f => ({ ...f, [k]: e.target.value }))}
                style={T.inputEl} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "14px" }}>
          <CheckKontaktBeforeSubmitBlock
            maklerName={makler.name}
            consent={consent}
            onConsentChange={setConsent}
          />
        </div>
      </div>
      <div style={T.footer}>
        <button style={T.btnPrim(!valid)} onClick={() => valid && onSubmit(fd)} disabled={!valid}>
          Gespräch anfragen
        </button>
        <button style={T.btnSec} onClick={onBack}>Zurück</button>
      </div>
    </div>
  );
}

function DankeScreen({ name, onBack, makler, C }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }} className="fade-in">
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `1.5px solid ${C}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontSize: "20px", fontWeight: "700", color: "#111", letterSpacing: "-0.4px", marginBottom: "8px" }}>
        {name ? `Danke, ${name.split(" ")[0]}.` : "Anfrage gesendet."}
      </div>
      <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, marginBottom: "32px" }}>
        Wir melden uns innerhalb von 24 Stunden mit Ihrer persönlichen Analyse.
      </div>
      <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden", textAlign: "left" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: "11px", color: "#999", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "4px" }}>Ihr Berater</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{makler.name}</div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "1px" }}>{makler.firma}</div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <a href={`tel:${makler.telefon}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>{makler.telefon}</a>
          <a href={`mailto:${makler.email}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>{makler.email}</a>
        </div>
      </div>
      <button onClick={onBack} style={{ marginTop: "20px", fontSize: "13px", color: "#aaa", cursor: "pointer" }}>
        Neue Berechnung starten
      </button>
    </div>
  );
}

// ─── HAUPTKOMPONENTE ──────────────────────────────────────────────────────────
export default function BUKTGRechner() {
  const MAKLER = useCheckConfig();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => makeBUKTGT(C), [C]);
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName] = useState("");
  const isDemo = isCheckDemoMode();

  const [p, setP] = useState({
    brutto:   4000,
    beruf:    "angestellt",
    ktgTag:   0,
    buRente:  0,
    szenario: "psyche",
  });

  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const goTo = (ph) => { setAk(k => k + 1); setPhase(ph); window.scrollTo({ top: 0 }); };

  const R = berechne(p);
  const istSelbst = p.beruf === 'selbst';
  const TOTAL_PHASES = 3;

  if (danke) return (
    <div style={{ ...T.page, "--accent": C }}>
      <Header phase={TOTAL_PHASES} total={TOTAL_PHASES} makler={MAKLER} T={T} />
      <DankeScreen name={name} onBack={() => { setDanke(false); setPhase(1); }} makler={MAKLER} C={C} />
    </div>
  );

  // ── Phase 4: Kontakt ───────────────────────────────────────────────────────
  if (phase === 3) return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={4} total={TOTAL_PHASES} makler={MAKLER} T={T} />
      <div style={T.hero}>
        <div style={T.label}>Beratungsgespräch</div>
        <div style={T.h1}>Lücke schliessen</div>
        <div style={T.body}>Wir bereiten das Gespräch mit Ihrer Analyse vor.</div>
      </div>
      <ContactForm
        isDemo={isDemo}
        makler={MAKLER}
        T={T}
        onSubmit={async (fd) => {
          const token = new URLSearchParams(window.location.search).get("token");
          if (token) {
            await fetch("/api/lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token,
                slug: "einkommens-check",
                kundenName: fd.name,
                kundenEmail: fd.email,
                kundenTel: fd.tel || "",
              }),
            }).catch(() => {});
          }
          setName(fd.name);
          setDanke(true);
        }}
        onBack={() => goTo(2)}
        summary={
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>Ihre Berechnung</div>
            <div style={{ display: "flex", gap: "20px" }}>
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: "#c0392b", letterSpacing: "-0.5px" }}>{fmt(R.lueckeKG)}</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Lücke Krankengeld</div></div>
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: "#c0392b", letterSpacing: "-0.5px" }}>{fmt(R.lueckeBU)}</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Lücke BU-Rente</div></div>
            </div>
          </div>
        }
      />
    </div>
  );

  // ── Phase 3: Ergebnis ─────────────────────────────────────────────────────
  if (phase === 2) {
    const phasen = [
      { label: "Lohnfortzahlung",           sub: "Tag 1–42",           monatl: R.netto,          pct: 100,         groesste: false },
      { label: R.phase2.label,              sub: "ab Tag 43",          monatl: R.phase2.monatl,  pct: R.phase2.pct, groesste: R.groessteluecke.idx===1 },
      { label: "Wartezeit / KTG",           sub: "Monate 18–24",       monatl: R.phase3.monatl,  pct: R.phase3.pct, groesste: R.groessteluecke.idx===2 },
      { label: "BU-Rente (dauerhaft)",      sub: "nach Anerkennung",   monatl: R.phase4.monatl,  pct: R.phase4.pct, groesste: R.groessteluecke.idx===3 },
    ];
    const WARN = "#c0392b";
    const groesseLueckeMon = Math.max(R.lueckeKG, R.lueckeBU);

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL_PHASES} makler={MAKLER} T={T} />
        <div style={T.hero}>
          <div style={T.label}>Ihr Einkommensschutz · {R.sz.label}</div>
          <div style={T.h1}>{groesseLueckeMon > 0 ? `${fmt(groesseLueckeMon)}/Monat ungesichert` : "Gut abgesichert"}</div>
          <div style={T.body}>Ø {R.sz.dauer} Monate Ausfall · BU-Anerkennung in {R.sz.buWahrsch}% der Fälle</div>
        </div>

        {/* Block 1: Größte Lücke */}
        {groesseLueckeMon > 0 && (
          <div style={T.section}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: WARN, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" }}>Ihre größte Lücke</div>
            <div style={{ border: `1px solid ${WARN}44`, borderRadius: "10px", padding: "14px 16px", background: `${WARN}04`, borderLeft: `3px solid ${WARN}` }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginBottom: "4px" }}>{R.groessteluecke.label}</div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: WARN, letterSpacing: "-0.8px", marginBottom: "4px" }}>
                − {fmt(R.groessteluecke.luecke)}<span style={{ fontSize: "14px", fontWeight: "500", color: "#c0392b99" }}>/Monat</span>
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Hochrechnung über {R.sz.dauer} Monate: <strong style={{ color: WARN }}>{fmt(R.kostTotal)}</strong> Gesamtverlust
              </div>
            </div>
          </div>
        )}

        {/* Selbstständigen-Block */}
        {istSelbst && (
          <div style={T.section}>
            <div style={{ border: `1px solid ${WARN}44`, borderRadius: "10px", padding: "14px 16px", background: `${WARN}04` }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: WARN, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Wichtig für Selbstständige</div>
              <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
                Sie haben <strong>kein gesetzliches Krankengeld</strong> — die Lücke beginnt ab Tag 1. Krankentagegeld und BU sind für Sie existenziell, nicht optional.
              </div>
            </div>
          </div>
        )}

        {/* Block EMR: Gesetzliche Erwerbsminderungsrente */}
        <div style={T.section}>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#f7f7f7", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "2px" }}>Was die gesetzliche Absicherung leistet</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Erwerbsminderungsrente — oft nicht genug</div>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.65, marginBottom: "12px" }}>
                Die gesetzliche Erwerbsminderungsrente greift nur unter strengen Bedingungen — und ersetzt Ihr Einkommen meist nur zu einem kleinen Teil.
              </div>
              {[
                { text: "Greift nur bei starker Einschränkung — wer noch 3–6 Stunden täglich irgendeiner Arbeit nachgehen kann, bekommt oft nur die halbe Rente oder gar nichts." },
                { text: "Ersetzt im Schnitt nur 30–40 % des letzten Nettoeinkommens — der Rest bleibt als Lücke bestehen." },
                { text: "Reicht selten für den bisherigen Lebensstandard — Miete, Kredite und laufende Kosten laufen weiter." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 2 ? "8px" : "0" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 4h4M4 2v4" stroke="#999" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                  <span style={{ fontSize: "12px", color: "#555", lineHeight: 1.55 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block 2: Empfohlene Absicherung */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: C, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" }}>Das sollten Sie absichern</div>
          <div style={T.card}>
            {R.empfKTG > 0 && (
              <div style={T.row}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>Krankentagegeld</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px", lineHeight: 1.5 }}>
                      Schließt die Lücke ab Tag 43 (Selbstständige ab Tag 1)
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>{R.empfKTG} €/Tag</div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>= {fmt(R.empfKTG * 30)}/Mon.</div>
                  </div>
                </div>
              </div>
            )}
            {R.empfBU > 0 && (
              <div style={T.rowLast}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>BU-Rente</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px", lineHeight: 1.5 }}>
                      Dauerhafter Schutz bei {R.sz.buWahrsch}% BU-Wahrscheinlichkeit im Szenario
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.3px" }}>{fmt(R.empfBU)}/Mon.</div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>empfohlen</div>
                  </div>
                </div>
              </div>
            )}
            {R.empfKTG === 0 && R.empfBU === 0 && (
              <div style={T.rowLast}>
                <div style={{ fontSize: "13px", color: "#059669", fontWeight: "500" }}>Ihre Absicherung deckt das Nettoeinkommen vollständig ab.</div>
              </div>
            )}
          </div>
        </div>

        {/* Block 3: Alternative EU */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#aaa", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" }}>Alternative Absicherung</div>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", background: "#fafafa" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>Erwerbsunfähigkeitsversicherung (EU)</div>
            <div style={{ fontSize: "12px", color: "#777", lineHeight: 1.6 }}>
              Falls eine BU-Versicherung nicht (mehr) abschließbar ist — z.B. durch Vorerkrankungen — ist die EU-Rente oft die einzige Alternative. Sie zahlt, wenn Sie gar keiner Arbeit mehr nachgehen können.
            </div>
            <div style={{ marginTop: "8px", fontSize: "11px", color: "#aaa" }}>Günstigere Prämien · Weniger strenge Gesundheitsprüfung · Kein Berufsschutz</div>
          </div>
        </div>

        {/* Block 4: Timeline */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Einkommensverlauf im Zeitverlauf</div>
          <div style={T.card}>
            {phasen.map((ph, i) => {
              const isLast = i === phasen.length - 1;
              const barColor = ph.pct >= 90 ? "#2ecc71" : ph.pct >= 60 ? "#f39c12" : ph.pct >= 30 ? "#e67e22" : "#c0392b";
              return (
                <div key={i} style={{ ...(isLast ? T.rowLast : T.row), background: ph.groesste ? `${WARN}04` : "#fff", borderLeft: ph.groesste ? `3px solid ${WARN}` : "3px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{ph.label}</div>
                        {ph.groesste && <span style={{ fontSize: "10px", fontWeight: "700", color: "#c0392b", background: "#c0392b15", padding: "1px 6px", borderRadius: "10px" }}>Größte Lücke</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>{ph.sub}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: ph.pct < 60 ? "#c0392b" : "#111", letterSpacing: "-0.3px" }}>{fmt(ph.monatl)}</div>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>{ph.pct}% des Nettos</div>
                    </div>
                  </div>
                  <div style={{ background: "#f5f5f5", borderRadius: "2px", height: "4px", overflow: "hidden" }}>
                    <div style={{ ...T.timeBar, width: `${Math.min(100, ph.pct)}%`, background: barColor }} />
                  </div>
                  {ph.monatl < R.netto && (
                    <div style={{ fontSize: "11px", color: "#c0392b", marginTop: "5px", fontWeight: "500" }}>
                      − {fmt(R.netto - ph.monatl)} / Monat Lücke
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Szenario wechseln */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>Szenario wechseln</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SZENARIEN.map(sz => (
              <SelectionCard
                key={sz.id}
                value={sz.id}
                label={sz.label}
                description={`${sz.desc} · Ø ${sz.dauer} Mon. · BU ${sz.buWahrsch}%`}
                selected={p.szenario === sz.id}
                accent={C}
                onClick={() => set("szenario", sz.id)}
              />
            ))}
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "120px" }}>
          <div style={T.infoBox}>Näherungswerte. Exakte Berechnung abhängig von Tarif, Einstufung und Gesundheitszustand.</div>
          <CheckBerechnungshinweis>
            <>
              Das <strong>Einkommen</strong> wird in 4 Phasen berechnet: Lohnfortzahlung (Tag 1–42), Krankengeld (Tag 43–546, max. 135,63 €/Tag brutto nach BBG KV 2026), Wartezeit BU (Monat 19–24, nur KTG), BU-Rente (dauerhaft).
              Selbstständige erhalten kein gesetzliches Krankengeld.{" "}
              <span style={{ color: "#b8884a" }}>Grundlage: §47 SGB V.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} nextLabel="Lücke schliessen — Gespräch anfragen" T={T} />
      </div>
    );
  }

  // ── Phase 1: Basisdaten + Absicherung (zusammengelegt) ────────────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={1} total={TOTAL_PHASES} makler={MAKLER} T={T} />
      <div style={T.hero}>
        <div style={T.label}>Schritt 1 von 2 · Ihre Situation</div>
        <div style={T.h1}>Was passiert, wenn Sie ausfallen?</div>
        <div style={T.body}>Lohnfortzahlung endet nach 6 Wochen. Wie groß ist die Lücke — und was haben Sie bereits?</div>
      </div>

      {/* Einkommen + Beruf */}
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}>
            <SliderCard
              label="Monatliches Bruttogehalt"
              value={p.brutto} min={1500} max={12000} step={100} unit="€"
              display={`ca. ${fmt(R.netto)} netto`}
              accent={C}
              onChange={v => set("brutto", v)}
            />
          </div>
          <div style={T.row}>
            <label style={T.fldLbl}>Berufsstatus</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              {[
                { v: "angestellt", l: "Angestellt", d: "Arbeitgeberzuschuss zur Sozialversicherung" },
                { v: "selbst", l: "Selbstständig", d: "Voller Beitrag, kein gesetzliches Krankengeld" },
                { v: "beamter", l: "Beamter", d: "Beihilfe + besondere Tarife" },
              ].map(({ v, l, d }) => (
                <SelectionCard key={v} value={v} label={l} description={d} selected={p.beruf === v} accent={C} onClick={() => set("beruf", v)} />
              ))}
            </div>
          </div>
          <div style={T.row}>
            <SliderCard
              label="Vorhandenes Krankentagegeld"
              value={p.ktgTag} min={0} max={150} step={5} unit="€/Tag"
              display={p.ktgTag > 0 ? `= ${fmt(p.ktgTag * 30)}/Monat` : "Kein KTG vorhanden"}
              accent={C}
              onChange={v => set("ktgTag", v)}
              hint="Tagessatz aus Ihrem Krankentagegeld-Vertrag — 0 wenn keiner vorhanden"
            />
          </div>
          <div style={T.rowLast}>
            <SliderCard
              label="Vorhandene BU-Rente"
              value={p.buRente} min={0} max={4000} step={100} unit="€/Mon"
              display={p.buRente === 0 ? "Keine BU-Versicherung" : ""}
              accent={C}
              onChange={v => set("buRente", v)}
              hint="Monatliche Rente aus bestehender BU-Versicherung"
            />
          </div>
        </div>
        {istSelbst && (
          <div style={{ ...T.infoBox, marginTop: "10px", borderLeft: `3px solid #c0392b`, background: "#fff9f9", borderRadius: "0 8px 8px 0" }}>
            <strong style={{ color: "#c0392b" }}>Selbstständig:</strong> Kein gesetzliches Krankengeld — die Lücke beginnt ab Tag 1 der Krankheit.
          </div>
        )}
      </div>

      {/* Szenario Cards */}
      <div style={T.section}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" }}>Welches Szenario betrifft Sie am meisten?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {SZENARIEN.map(sz => (
            <SelectionCard
              key={sz.id}
              value={sz.id}
              label={sz.label}
              description={`${sz.desc} · Ø ${sz.dauer} Mon. · BU ${sz.buWahrsch}%`}
              selected={p.szenario === sz.id}
              accent={C}
              onClick={() => set("szenario", sz.id)}
            />
          ))}
        </div>
      </div>

      <Footer onNext={() => goTo(2)} nextLabel="Lücke berechnen" T={T} />
    </div>
  );
}
