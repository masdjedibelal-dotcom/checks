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
  { id: "psyche",  emoji: "🧠", label: "Psyche",  desc: "Burnout oder Depression",               dauer: 42, buWahrsch: 52 },
  { id: "ruecken", emoji: "🦴", label: "Rücken",  desc: "Bandscheibe oder chronische Schmerzen", dauer: 25, buWahrsch: 38 },
  { id: "krebs",   emoji: "🎗️", label: "Krebs",   desc: "Diagnose und Behandlung",               dauer: 50, buWahrsch: 68 },
  { id: "herz",    emoji: "❤️", label: "Herz",    desc: "Infarkt oder Herzinsuffizienz",          dauer: 36, buWahrsch: 74 },
  { id: "unfall",  emoji: "🤕", label: "Unfall",  desc: "Fraktur oder Lähmung",                  dauer: 18, buWahrsch: 45 },
];

// ─── BERECHNUNG ───────────────────────────────────────────────────────────────
function berechne({ brutto, beruf, kv, ktgTag, buRente, szenario }) {
  const sz    = SZENARIEN.find(s => s.id === szenario) || SZENARIEN[0];
  const netto = Math.round(brutto * 0.72);
  const ktgMon = ktgTag * 30;

  // Phase 1: Lohnfortzahlung (0–6 Wochen) — immer 100 %
  const p1 = { label: "Lohnfortzahlung", sub: "Erste 6 Wochen (Arbeitgeber)", monatl: netto, pct: 100 };

  // Phase 2: Krankengeld / KTG (ab Woche 7)
  // GKV-Angestellte: min(brutto × 0,7 ; 3.000 €) + KTG
  // PKV oder Selbstständige ohne GKV-KG: nur KTG
  const kgBasis = (kv === "gkv" && beruf !== "selbst")
    ? Math.min(Math.round(brutto * 0.7), 3000)
    : 0;
  const p2mon  = kgBasis + ktgMon;
  const p2 = {
    label: kv === "gkv" && beruf !== "selbst"
      ? (ktgMon > 0 ? "Krankengeld + KTG" : "Krankengeld (GKV)")
      : (ktgMon > 0 ? "Krankentagegeld" : "Kein Krankengeld"),
    sub:    "Ab Woche 7",
    monatl: p2mon,
    pct:    Math.min(100, Math.round((p2mon / netto) * 100)),
  };

  // Phase 3: Wartezeit — nur noch KTG (GKV-KG läuft nach ~18 Monaten aus)
  const p3 = {
    label: ktgMon > 0 ? "Nur KTG (Wartezeit)" : "Keine Leistung",
    sub:   "Nach ~18 Monaten",
    monatl: ktgMon,
    pct:   Math.min(100, Math.round((ktgMon / netto) * 100)),
  };

  // Phase 4: Langfristig — BU-Rente + EM-Schätzung (grob: 35 % des Nettos)
  const emSchaetzung = Math.round(netto * 0.35);
  const p4mon = buRente + emSchaetzung;
  const p4 = {
    label: buRente > 0 ? "BU-Rente + EM-Rente" : "Nur EM-Rente (gesetzlich)",
    sub:   "Dauerhaft",
    monatl: p4mon,
    pct:   Math.min(100, Math.round((p4mon / netto) * 100)),
  };

  const luecke   = Math.max(0, netto - p4mon);
  const lueckeKG = Math.max(0, netto - p2mon);

  // Empfehlungen (nur wenn Lücke besteht)
  const empfKTG = lueckeKG > 0 ? Math.max(0, Math.ceil((lueckeKG / 30) / 5) * 5) : 0;
  const empfBU  = luecke   > 0 ? Math.max(0, Math.round(luecke / 50) * 50)       : 0;

  return { netto, p1, p2, p3, p4, luecke, lueckeKG, sz, kgBasis, ktgMon, emSchaetzung, empfKTG, empfBU };
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
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
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
  // ── Result Design System ──
  resultHero: { padding: "52px 24px 40px", textAlign: "center", background: "#ffffff" },
  resultEyebrow: { fontSize: "12px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.2px", marginBottom: "14px" },
  resultNumber: (warn) => ({ fontSize: "52px", fontWeight: "800", color: warn ? "#C0392B" : C, letterSpacing: "-2.5px", lineHeight: 1, marginBottom: "8px" }),
  resultUnit: { fontSize: "14px", color: "#9CA3AF", marginBottom: "18px" },
  resultSub: { fontSize: "13px", color: "#9CA3AF", lineHeight: 1.55, marginTop: "12px" },
  statusOk: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#15803D" },
  statusWarn: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 13px", background: "#FFF6F5", border: "1px solid #F2D4D0", borderRadius: "999px", fontSize: "12px", fontWeight: "600", color: "#C0392B" },
  warnCard: { background: "#FFF6F5", border: "1px solid #F2D4D0", borderLeft: "3px solid #C0392B", borderRadius: "14px", padding: "18px 20px" },
  warnCardTitle: { fontSize: "13px", fontWeight: "700", color: "#C0392B", marginBottom: "6px" },
  warnCardText: { fontSize: "13px", color: "#7B2A2A", lineHeight: 1.65 },
  cardPrimary: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "20px", overflow: "hidden", background: "#FFFFFF", boxShadow: "0 6px 24px rgba(17,24,39,0.08)" },
  cardContext: { background: "#FAFAF8", border: "1px solid rgba(17,24,39,0.05)", borderRadius: "16px", padding: "18px 20px" },
  sectionLbl: { fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px" },
  recCard: { border: "1px solid rgba(17,24,39,0.08)", borderRadius: "18px", overflow: "hidden", background: "#FFFFFF", boxShadow: "0 4px 16px rgba(17,24,39,0.06)" },
  recRow: { padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(17,24,39,0.04)" },
  recRowLast: { padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  recLabel: { fontSize: "14px", fontWeight: "600", color: "#1F2937" },
  recSub: { fontSize: "12px", color: "#9CA3AF", marginTop: "3px", lineHeight: 1.4 },
  recValue: { fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px", textAlign: "right", flexShrink: 0, marginLeft: "12px" },
  recValueSub: { fontSize: "11px", color: "#9CA3AF", textAlign: "right", marginTop: "2px" },
  progBarTrack: { height: "10px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden", marginTop: "10px" },
  progBarFill: (pct, color) => ({ height: "100%", width: `${pct}%`, background: color, borderRadius: "999px", transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)" }),
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

function Footer({ onNext, onBack, nextLabel = "Weiter →", disabled = false, T }) {
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
            { k: "name",  l: "Dein Name",    t: "text",  ph: "Vor- und Nachname",  req: true },
            { k: "email", l: "Deine E-Mail", t: "email", ph: "deine@email.de",      req: true },
            { k: "tel",   l: "Deine Nummer", t: "tel",   ph: "Optional",            req: false, hint: "Optional — für eine schnellere Rückmeldung" },
          ].map(({ k, l, t, ph, req, hint }, i, arr) => (
            <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
              <label style={T.fldLbl}>{l}{req ? " *" : ""}</label>
              <input type={t} placeholder={ph} value={fd[k]}
                onChange={e => setFd(f => ({ ...f, [k]: e.target.value }))}
                style={T.inputEl} />
              {hint && <div style={T.fldHint}>{hint}</div>}
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
          {valid ? "Absicherung prüfen lassen" : "Bitte alle Angaben machen"}
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
        Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.
      </div>
      <div style={{ border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden", textAlign: "left" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: "11px", color: "#999", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "4px" }}>Dein Berater</div>
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
    kv:       "gkv",
    ktgTag:   0,
    buRente:  0,
    szenario: "psyche",
  });

  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const [scr, setScr] = useState(1);
  const nextScr = () => { window.scrollTo({ top: 0, behavior: "smooth" }); if (scr < 5) { setScr(s => s + 1); } else { goTo(2); } };
  const backScr = () => { window.scrollTo({ top: 0, behavior: "smooth" }); if (scr > 1) { setScr(s => s - 1); } };
  const goTo = (ph) => { setAk(k => k + 1); setPhase(ph); window.scrollTo({ top: 0 }); };

  const R = berechne(p);
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
        <div style={T.label}>Fast geschafft</div>
        <div style={T.h1}>Wo können wir dich erreichen?</div>
        <div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis.</div>
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
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: "#c0392b", letterSpacing: "-0.5px" }}>{fmt(R.luecke)}</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Mögliche Lücke</div></div>
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{fmt(R.netto)}</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Ihr Netto</div></div>
            </div>
          </div>
        }
      />
    </div>
  );

  // ── Phase 2: Ergebnis ─────────────────────────────────────────────────────
  if (phase === 2) {
    const phasen = [R.p1, R.p2, R.p3, R.p4];

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL_PHASES} makler={MAKLER} T={T} />

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={T.resultHero}>
          <div style={T.resultEyebrow}>Ihre Absicherung im Überblick</div>
          <div style={T.resultNumber(R.luecke > 0)}>
            {R.luecke > 0 ? fmt(R.luecke) : "Gedeckt"}
          </div>
          <div style={T.resultUnit}>
            {R.luecke > 0 ? "mögliche monatliche Lücke" : "Ihr Einkommen ist weitgehend abgesichert"}
          </div>
          {R.luecke > 0
            ? <div style={T.statusWarn}>Absicherungslücke erkannt</div>
            : <div style={T.statusOk}>Gut abgesichert</div>
          }
          <div style={T.resultSub}>Vereinfachte Einordnung · auf Basis Ihrer Angaben</div>
        </div>

        {/* ── Section 1: Einkommensverlauf ──────────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>So entwickelt sich Ihr Einkommen</div>
          <div style={T.cardPrimary}>
            {phasen.map((ph, i) => {
              const isLast = i === phasen.length - 1;
              const barColor = ph.pct >= 90 ? "#22c55e" : ph.pct >= 60 ? "#f59e0b" : ph.pct >= 30 ? "#f97316" : "#C0392B";
              const diff = R.netto - ph.monatl;
              return (
                <div key={i} style={{ padding: "16px 20px", borderBottom: isLast ? "none" : "1px solid rgba(17,24,39,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{ph.label}</div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{ph.sub}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: ph.pct < 60 ? "#C0392B" : "#1F2937", letterSpacing: "-0.4px" }}>{fmt(ph.monatl)}</div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{ph.pct} % des Nettos</div>
                    </div>
                  </div>
                  <div style={T.progBarTrack}>
                    <div style={T.progBarFill(Math.min(100, ph.pct), barColor)} />
                  </div>
                  {diff > 0 && (
                    <div style={{ fontSize: "12px", color: "#C0392B", marginTop: "6px", fontWeight: "500" }}>
                      − {fmt(diff)} / Monat Lücke
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 2: Was aktuell abgesichert ist ────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Was aktuell abgesichert ist</div>
          <div style={T.cardContext}>
            {[
              {
                label: p.kv === "gkv" && p.beruf !== "selbst" ? "Krankengeld (GKV)" : "GKV-Krankengeld",
                val:   p.kv === "gkv" && p.beruf !== "selbst" ? fmt(R.kgBasis) : "–",
                hint:  p.kv === "gkv" && p.beruf !== "selbst" ? "ca. 70 % des Bruttos, max. 3.000 €/Mon." : "Nicht anwendbar",
              },
              {
                label: "Krankentagegeld (KTG)",
                val:   R.ktgMon > 0 ? fmt(R.ktgMon) : "Nicht vorhanden",
                hint:  R.ktgMon > 0 ? `${p.ktgTag} €/Tag × 30` : "Kein KTG-Vertrag angegeben",
              },
              {
                label: "BU-Rente",
                val:   p.buRente > 0 ? fmt(p.buRente) : "Nicht vorhanden",
                hint:  p.buRente > 0 ? "Monatlich bei Berufsunfähigkeit" : "Kein BU-Vertrag angegeben",
              },
              {
                label: "EM-Rente (gesetzlich, geschätzt)",
                val:   fmt(R.emSchaetzung),
                hint:  "ca. 35 % des Nettos — vereinfachte Schätzung (§ 43 SGB VI)",
              },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: i < arr.length - 1 ? "12px" : "0", marginBottom: i < arr.length - 1 ? "12px" : "0", borderBottom: i < arr.length - 1 ? "1px solid rgba(17,24,39,0.06)" : "none" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937" }}>{row.label}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{row.hint}</div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: C, flexShrink: 0, marginLeft: "12px" }}>{row.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Größte Lücke (Warnblock) ──────────────────────────── */}
        {R.luecke > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>Ihre größte Lücke</div>
            <div style={T.warnCard}>
              <div style={T.warnCardTitle}>Langfristige Absicherungslücke</div>
              <div style={{ fontSize: "40px", fontWeight: "800", color: "#C0392B", letterSpacing: "-2px", lineHeight: 1, marginBottom: "6px" }}>
                {fmt(R.luecke)}
              </div>
              <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "10px" }}>pro Monat · dauerhaft</div>
              <div style={T.warnCardText}>
                BU-Rente und EM-Rente zusammen ({fmt(R.p4.monatl)}) decken Ihr Netto ({fmt(R.netto)}) nicht vollständig ab. Die Lücke wächst mit der Zeit — je früher abgesichert, desto günstiger die Prämie.
              </div>
            </div>
          </div>
        )}

        {/* ── Section 4: Das kann sinnvoll sein ────────────────────────────── */}
        <div style={T.section}>
          <div style={T.sectionLbl}>Das kann sinnvoll sein</div>
          <div style={T.recCard}>
            {R.empfKTG > 0 && (
              <div style={R.empfBU > 0 ? T.recRow : T.recRowLast}>
                <div>
                  <div style={T.recLabel}>Krankentagegeld prüfen</div>
                  <div style={T.recSub}>
                    {p.kv === "gkv" && p.beruf !== "selbst"
                      ? "Schließt die Lücke nach Krankengeld-Ende"
                      : "Existenzielle Absicherung — ab Tag 1 der Krankheit"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                  <div style={T.recValue}>{R.empfKTG} €/Tag</div>
                  <div style={T.recValueSub}>= {fmt(R.empfKTG * 30)}/Mon.</div>
                </div>
              </div>
            )}
            {R.empfBU > 0 && (
              <div style={T.recRowLast}>
                <div>
                  <div style={T.recLabel}>BU-Rente anpassen</div>
                  <div style={T.recSub}>Dauerhafter Schutz · {R.sz.buWahrsch} % BU-Wahrscheinlichkeit im Szenario</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                  <div style={T.recValue}>{fmt(R.empfBU)}/Mon.</div>
                  <div style={T.recValueSub}>kalkulierter Richtwert</div>
                </div>
              </div>
            )}
            {R.empfKTG === 0 && R.empfBU === 0 && (
              <div style={T.recRowLast}>
                <div style={{ fontSize: "14px", color: "#059669", fontWeight: "500" }}>Ihre Absicherung deckt das Nettoeinkommen vollständig ab.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Berechnungshinweis + Legal ────────────────────────────────────── */}
        <div style={{ ...T.section, marginBottom: "120px" }}>
          <CheckBerechnungshinweis>
            <>
              Vereinfachte Einordnung auf Basis Ihrer Angaben. Netto = Brutto × 0,72 (Schätzwert).
              GKV-Krankengeld: min(Brutto × 0,7 ; 3.000 €/Mon.) · Grundlage §47 SGB V.
              EM-Rente: ca. 35 % des Nettos · Grundlage §43 SGB VI.
              <span style={{ color: "#b8884a" }}> Keine Rechtsberatung.</span>
            </>
          </CheckBerechnungshinweis>
          <div style={{ ...T.infoBox, marginTop: "10px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>

        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} nextLabel="Absicherung gemeinsam prüfen" T={T} />
      </div>
    );
  }

  // ── Phase 1: 1 Frage pro Screen ──────────────────────────────────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={scr} total={5} makler={MAKLER} T={T} />

      {/* Screen 1: Beschäftigung */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.label}>Einkommens-Check · 1 / 5</div>
          <div style={T.h1}>Wie sind Sie aktuell beschäftigt?</div>
          <div style={T.body}>Davon hängt ab, welche gesetzlichen Leistungen greifen.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { v: "angestellt", l: "Angestellt",    d: "Lohnfortzahlung + Krankengeld (GKV)",  emoji: "💼" },
              { v: "selbst",     l: "Selbstständig", d: "Kein gesetzliches Sicherheitsnetz",    emoji: "🧑‍💻" },
              { v: "beamter",    l: "Beamter",       d: "Beihilfe + besondere Absicherungstarife", emoji: "🏛️" },
            ].map(({ v, l, d, emoji }) => (
              <SelectionCard key={v} value={v} label={l} description={d}
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                selected={p.beruf === v} accent={C} onClick={() => set("beruf", v)} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} nextLabel="Weiter →" T={T} showBack={false} />
      </>}

      {/* Screen 2: Krankenversicherung */}
      {scr === 2 && <>
        <div style={T.hero}>
          <div style={T.label}>Einkommens-Check · 2 / 5</div>
          <div style={T.h1}>Wie sind Sie krankenversichert?</div>
          <div style={T.body}>Das entscheidet, ob und wie viel Krankengeld Sie erhalten.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { v: "gkv", l: "Gesetzlich (GKV)", d: "Krankengeld nach §47 SGB V: ca. 70 % des Bruttos, max. 3.000 €/Mon.", emoji: "🏥" },
              { v: "pkv", l: "Privat (PKV)",     d: "Kein gesetzliches Krankengeld — nur privates KTG sichert ab",          emoji: "🔒" },
            ].map(({ v, l, d, emoji }) => (
              <SelectionCard key={v} value={v} label={l} description={d}
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                selected={p.kv === v} accent={C} onClick={() => set("kv", v)} />
            ))}
          </div>
          {p.beruf === "selbst" && p.kv === "gkv" && (
            <div style={{ ...T.infoBox, marginTop: "12px", borderLeft: "3px solid #f59e0b", background: "#fffbf0", borderRadius: "0 8px 8px 0" }}>
              <strong style={{ color: "#92400e" }}>Hinweis:</strong> Selbstständige erhalten GKV-Krankengeld nur mit gesonderter Option (§44 SGB V) — bitte prüfen Sie Ihren Tarif.
            </div>
          )}
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
      </>}

      {/* Screen 3: Einkommen */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.label}>Einkommens-Check · 3 / 5</div>
          <div style={T.h1}>Was verdienen Sie aktuell brutto pro Monat?</div>
          <div style={T.body}>Daraus berechnen wir Ihr Netto und die möglichen Leistungen.</div>
        </div>
        <div style={T.section}>
          <SliderCard label="Monatliches Bruttogehalt" value={p.brutto} min={1500} max={12000} step={100} unit="€"
            display={`ca. ${fmt(R.netto)} netto`} accent={C} onChange={v => set("brutto", v)} />
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
      </>}

      {/* Screen 4: Bestehende Absicherung */}
      {scr === 4 && <>
        <div style={T.hero}>
          <div style={T.label}>Einkommens-Check · 4 / 5</div>
          <div style={T.h1}>Was haben Sie bereits abgesichert?</div>
          <div style={T.body}>Beide Felder sind optional — 0 eingeben wenn kein Vertrag vorhanden.</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <SliderCard label="Krankentagegeld (KTG)" value={p.ktgTag} min={0} max={150} step={5} unit="€/Tag"
              display={p.ktgTag > 0 ? `= ${fmt(p.ktgTag * 30)}/Monat` : "Kein KTG vorhanden"}
              accent={C} onChange={v => set("ktgTag", v)} hint="0 wenn kein Vertrag vorhanden" />
            <SliderCard label="BU-Rente" value={p.buRente} min={0} max={4000} step={100} unit="€/Mon"
              display={p.buRente === 0 ? "Keine BU-Versicherung" : ""}
              accent={C} onChange={v => set("buRente", v)} hint="0 wenn keine BU vorhanden" />
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
      </>}

      {/* Screen 5: Szenario */}
      {scr === 5 && <>
        <div style={T.hero}>
          <div style={T.label}>Einkommens-Check · 5 / 5</div>
          <div style={T.h1}>Welches Szenario beschäftigt Sie am meisten?</div>
        </div>
        <div style={T.section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SZENARIEN.map(sz => (
              <SelectionCard key={sz.id} value={sz.id} label={sz.label}
                description={`${sz.desc} · Ø ${sz.dauer} Mon.`}
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{sz.emoji}</span>}
                selected={p.szenario === sz.id} accent={C} onClick={() => set("szenario", sz.id)} />
            ))}
          </div>
        </div>
        <div style={{ height: "120px" }} />
        <Footer onNext={nextScr} onBack={backScr} nextLabel="Meine Lücke berechnen" T={T} />
      </>}
    </div>
  );
}
