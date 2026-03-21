"use client";

import { useState } from "react";

// ─── GLOBAL SETUP ────────────────────────────────────────────────────────────
(() => {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #ffffff; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
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

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const MAKLER = {
  name:         "Max Mustermann",
  firma:        "Mustermann Versicherungen",
  email:        "kontakt@mustermann-versicherungen.de",
  telefon:      "089 123 456 78",
  primaryColor: "#1a3a5c",
};
const C = MAKLER.primaryColor;
const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

// ─── SZENARIEN ────────────────────────────────────────────────────────────────
const SZENARIEN = [
  { id: "psyche",  label: "Psychische Erkrankung", dauer: 42, buWahrsch: 52 },
  { id: "ruecken", label: "Rückenerkrankung",       dauer: 25, buWahrsch: 38 },
  { id: "krebs",   label: "Krebserkrankung",        dauer: 50, buWahrsch: 68 },
  { id: "herz",    label: "Herzerkrankung",         dauer: 36, buWahrsch: 74 },
  { id: "unfall",  label: "Unfall",                 dauer: 18, buWahrsch: 45 },
];

// ─── BERECHNUNG ───────────────────────────────────────────────────────────────
function berechne({ brutto, beruf, ktgTag, buRente, szenario }) {
  const sz       = SZENARIEN.find(s => s.id === szenario) || SZENARIEN[0];
  const netto    = brutto * 0.67;
  const nettoTag = netto / 30;

  // Phase 1: Lohnfortzahlung (Tag 1–42)
  const lohnPhase = { start: 1, end: 42, pct: 100, monatl: netto, label: "Lohnfortzahlung" };

  // Phase 2: Krankengeld (Tag 43–546 = 18 Monate)
  const kgBrutto  = brutto * 0.70 / 30;
  const kgNetto   = Math.min(kgBrutto, netto * 0.90 / 30);
  const gesKG     = beruf === "selbst" ? 0 : kgNetto * 30;
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

  return { netto, nettoTag, lohnPhase, phase2, phase3, phase4, lueckeKG, lueckeBU, kostTotal, sz, gesKG, ktgMonatl };
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  page:    { minHeight: "100vh", background: "#ffffff", fontFamily: "'DM Sans', system-ui, sans-serif", "--accent": C },
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
  optBtn:  (a) => ({ padding: "9px 14px", borderRadius: "6px", border: `1px solid ${a ? C : "#e8e8e8"}`, background: a ? C : "#fff", fontSize: "13px", fontWeight: a ? "600" : "400", color: a ? "#fff" : "#444", transition: "all 0.15s", cursor: "pointer", textAlign: "left" }),
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #e8e8e8", padding: "14px 24px 28px" },
  btnPrim: (dis) => ({ width: "100%", padding: "13px 20px", background: dis ? "#e8e8e8" : C, color: dis ? "#aaa" : "#fff", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: dis ? "default" : "pointer", transition: "opacity 0.15s", letterSpacing: "-0.1px" }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  // Ergebnis
  bigNum:  (warn) => ({ fontSize: "36px", fontWeight: "700", color: warn ? "#c0392b" : C, letterSpacing: "-1px", lineHeight: 1 }),
  bigLbl:  { fontSize: "12px", color: "#888", marginTop: "4px", fontWeight: "500" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? "#c0392b" : "#111" }),
  infoBox: { padding: "12px 14px", background: "#f9f9f9", borderRadius: "8px", fontSize: "12px", color: "#666", lineHeight: 1.6 },
  timeBar: { height: "6px", borderRadius: "3px", transition: "width 0.5s ease" },
  inputEl: { width: "100%", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "14px", color: "#111", background: "#fff", outline: "none" },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Divider = () => <div style={T.divider} />;

function Header({ phase, total }) {
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
          <span style={T.logoTxt}>{MAKLER.firma}</span>
        </div>
        <span style={T.badge}>BU + KTG</span>
      </div>
      <div style={T.prog}><div style={T.progFil((phase / total) * 100)} /></div>
    </>
  );
}

function Footer({ onNext, onBack, nextLabel = "Weiter", disabled = false }) {
  return (
    <div style={T.footer}>
      <button style={T.btnPrim(disabled)} onClick={onNext} disabled={disabled}>{nextLabel}</button>
      {onBack && <button style={T.btnSec} onClick={onBack}>Zurück</button>}
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, display, hint, unit = "" }) {
  const [inputVal, setInputVal] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Sync input when slider moves (only if not typing)
  const handleSlider = (v) => {
    onChange(v);
    if (!focused) setInputVal(String(v));
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
  };

  const handleInputBlur = () => {
    setFocused(false);
    const raw = parseFloat(inputVal.replace(/[^\d.-]/g, ""));
    if (!isNaN(raw)) {
      const clamped = Math.min(max, Math.max(min, Math.round(raw / step) * step));
      onChange(clamped);
      setInputVal(String(clamped));
    } else {
      setInputVal(String(value));
    }
  };

  // Keep input in sync when external value changes (e.g. slider)
  useState(() => { if (!focused) setInputVal(String(value)); });

  return (
    <div style={{ marginBottom: "22px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
        <label style={{ ...T.fldLbl, marginBottom: 0 }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type="text"
            inputMode="numeric"
            value={focused ? inputVal : (display ? "" : String(value))}
            placeholder={focused ? "" : (display || String(value))}
            onFocus={() => { setFocused(true); setInputVal(String(value)); }}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            style={{
              width: "90px", padding: "5px 8px", border: `1px solid ${focused ? C : "#e8e8e8"}`,
              borderRadius: "5px", fontSize: "14px", fontWeight: "600",
              color: focused ? "#111" : C, textAlign: "right", outline: "none",
              background: focused ? "#fff" : `${C}08`, transition: "border-color 0.15s, background 0.15s",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          />
          {unit && <span style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}>{unit}</span>}
        </div>
      </div>
      {!focused && display && (
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{display}</div>
      )}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => handleSlider(+e.target.value)} style={{ width: "100%", "--accent": C }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#ccc", marginTop: "4px" }}>
        <span>{min}{unit ? " " + unit : ""}</span><span>{max}{unit ? " " + unit : ""}</span>
      </div>
      {hint && <div style={T.fldHint}>{hint}</div>}
    </div>
  );
}

function ContactForm({ onSubmit, onBack, summary }) {
  const [fd, setFd] = useState({ name: "", email: "", tel: "" });
  const valid = fd.name.trim() && fd.email.trim();
  return (
    <div style={{ paddingBottom: "120px" }}>
      {summary && <div style={{ ...T.section }}><div style={T.infoBox}>{summary}</div></div>}
      <div style={T.section}>
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
        <div style={{ fontSize: "11px", color: "#bbb", marginTop: "10px" }}>
          Ihre Daten werden vertraulich behandelt.
        </div>
      </div>
      <div style={T.footer}>
        <button style={T.btnPrim(!valid)} onClick={() => valid && onSubmit(fd.name)} disabled={!valid}>
          Gespräch anfragen
        </button>
        <button style={T.btnSec} onClick={onBack}>Zurück</button>
      </div>
    </div>
  );
}

function DankeScreen({ name, onBack }) {
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
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{MAKLER.name}</div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "1px" }}>{MAKLER.firma}</div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <a href={`tel:${MAKLER.telefon}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>{MAKLER.telefon}</a>
          <a href={`mailto:${MAKLER.email}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>{MAKLER.email}</a>
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
  const [phase, setPhase] = useState(1);
  const [ak, setAk] = useState(0);
  const [danke, setDanke] = useState(false);
  const [name, setName] = useState("");

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
  const TOTAL_PHASES = 4;

  if (danke) return (
    <div style={{ ...T.page, "--accent": C }}>
      <Header phase={TOTAL_PHASES} total={TOTAL_PHASES} />
      <DankeScreen name={name} onBack={() => { setDanke(false); setPhase(1); }} />
    </div>
  );

  // ── Phase 4: Kontakt ───────────────────────────────────────────────────────
  if (phase === 4) return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={4} total={TOTAL_PHASES} />
      <div style={T.hero}>
        <div style={T.label}>Beratungsgespräch</div>
        <div style={T.h1}>Lücke schliessen</div>
        <div style={T.body}>Wir bereiten das Gespräch mit Ihrer Analyse vor.</div>
      </div>
      <ContactForm
        onSubmit={n => { setName(n); setDanke(true); }}
        onBack={() => goTo(3)}
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
  if (phase === 3) {
    const phasen = [
      { label: "Lohnfortzahlung", sub: "Tag 1–42", monatl: R.netto, pct: 100, days: 42 },
      { label: R.phase2.label,    sub: "ab Tag 43", monatl: R.phase2.monatl, pct: R.phase2.pct, days: 78 * 7 - 42 },
      { label: "Wartezeit / KTG", sub: "Monate 18–24", monatl: R.phase3.monatl, pct: R.phase3.pct, days: 174 },
      { label: "BU-Rente",        sub: "nach Anerkennung", monatl: R.phase4.monatl, pct: R.phase4.pct, days: null },
    ];

    return (
      <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
        <Header phase={3} total={TOTAL_PHASES} />
        <div style={T.hero}>
          <div style={T.label}>Ihre Analyse · {R.sz.label}</div>
          <div style={T.h1}>
            {R.lueckeBU > 0 ? `${fmt(R.lueckeBU)}/Monat fehlen dauerhaft` : "Gut abgesichert"}
          </div>
          <div style={T.body}>
            Szenario: {R.sz.label} · Ø {R.sz.dauer} Monate Ausfall · BU-Anerkennung in {R.sz.buWahrsch}% der Fälle
          </div>
        </div>

        {/* Zeitstrahl */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Einkommensverlauf im Zeitverlauf</div>
          <div style={T.card}>
            {phasen.map((ph, i) => {
              const isLast = i === phasen.length - 1;
              const barColor = ph.pct >= 90 ? "#2ecc71" : ph.pct >= 60 ? "#f39c12" : ph.pct >= 30 ? "#e67e22" : "#c0392b";
              return (
                <div key={i} style={isLast ? T.rowLast : T.row}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{ph.label}</div>
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

        <Divider />

        {/* Zusammenfassung */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Zusammenfassung</div>
          <div style={T.card}>
            {[
              { l: "Nettoeinkommen heute", v: fmt(R.netto), hl: false },
              { l: "Krankengeld monatl. (ab Tag 43)", v: p.beruf === "selbst" ? "Kein Anspruch" : fmt(R.gesKG), hl: R.gesKG < R.netto * 0.7 },
              { l: "Krankentagegeld (privat)", v: R.ktgMonatl > 0 ? fmt(R.ktgMonatl) : "Nicht vorhanden", hl: R.ktgMonatl === 0 },
              { l: "BU-Rente (monatl.)", v: p.buRente > 0 ? fmt(p.buRente) : "Nicht vorhanden", hl: p.buRente === 0 },
              { l: "Lücke während Krankheit", v: fmt(R.lueckeKG), hl: R.lueckeKG > 200 },
              { l: "Lücke bei dauerhafter BU", v: fmt(R.lueckeBU), hl: R.lueckeBU > 200 },
              { l: `Hochrechnung: ${R.sz.dauer} Monate`, v: fmt(R.kostTotal), hl: R.kostTotal > 5000 },
            ].map(({ l, v, hl }, i, arr) => (
              <div key={i} style={i < arr.length - 1 ? T.detRow : { ...T.detRow, borderBottom: "none" }}>
                <span style={T.detLbl}>{l}</span>
                <span style={T.detVal(hl)}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Szenario-Auswahl */}
        <div style={T.section}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Szenario wechseln</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {SZENARIEN.map(sz => (
              <button key={sz.id} onClick={() => set("szenario", sz.id)}
                style={{ padding: "6px 12px", borderRadius: "20px", border: `1px solid ${p.szenario === sz.id ? C : "#e8e8e8"}`, background: p.szenario === sz.id ? C : "#fff", fontSize: "12px", fontWeight: "500", color: p.szenario === sz.id ? "#fff" : "#666", cursor: "pointer" }}>
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hinweis */}
        <div style={{ ...T.section, marginBottom: "120px" }}>
          <div style={T.infoBox}>
            Näherungswerte. Exakte Berechnung abhängig von Ihrem Tarif, Einstufung und Gesundheitszustand.
          </div>
        </div>

        <Footer onNext={() => goTo(4)} onBack={() => goTo(2)} nextLabel="Lücke schliessen — Gespräch anfragen" />
      </div>
    );
  }

  // ── Phase 2: BU + KTG ─────────────────────────────────────────────────────
  if (phase === 2) return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={2} total={TOTAL_PHASES} />
      <div style={T.hero}>
        <div style={T.label}>Schritt 2 von 3 · Bestehende Absicherung</div>
        <div style={T.h1}>Was haben Sie bereits?</div>
        <div style={T.body}>Tragen Sie vorhandene Verträge ein. Bei 0 wird der Ausfall ohne jede Absicherung berechnet.</div>
      </div>
      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}>
            <SliderField
              label="Vorhandenes Krankentagegeld"
              value={p.ktgTag}
              min={0} max={150} step={5}
              unit="€/Tag"
              display={p.ktgTag > 0 ? `= ${fmt(p.ktgTag * 30)}/Monat` : ""}
              onChange={v => set("ktgTag", v)}
              hint="Tagessatz aus Ihrem Krankentagegeld-Vertrag"
            />
          </div>
          <div style={T.rowLast}>
            <SliderField
              label="Monatliche BU-Rente"
              value={p.buRente}
              min={0} max={4000} step={100}
              unit="€"
              display={p.buRente === 0 ? "Keine BU-Versicherung" : ""}
              onChange={v => set("buRente", v)}
              hint="Laufende monatliche Rente aus bestehender BU-Versicherung"
            />
          </div>
        </div>
      </div>
      <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} nextLabel="Zeitstrahl berechnen" />
    </div>
  );

  // ── Phase 1: Basisdaten ────────────────────────────────────────────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={1} total={TOTAL_PHASES} />
      <div style={T.hero}>
        <div style={T.label}>Schritt 1 von 3 · Ihre Situation</div>
        <div style={T.h1}>Was passiert, wenn Sie ausfallen?</div>
        <div style={T.body}>
          Lohnfortzahlung endet nach 6 Wochen. Was kommt danach — und wie groß ist die Lücke?
        </div>
      </div>

      <div style={T.section}>
        <div style={T.card}>
          <div style={T.row}>
            <SliderField
              label="Monatliches Bruttogehalt"
              value={p.brutto}
              min={1500} max={12000} step={100}
              unit="€"
              display={`ca. ${fmt(R.netto)} netto`}
              onChange={v => set("brutto", v)}
            />
          </div>
          <div style={T.rowLast}>
            <label style={T.fldLbl}>Berufsstatus</label>
            <div style={{ ...T.optRow, gridTemplateColumns: "1fr 1fr 1fr" }}>
              {[["angestellt", "Angestellt"], ["selbst", "Selbstständig"], ["beamter", "Beamter"]].map(([v, l]) => (
                <button key={v} style={T.optBtn(p.beruf === v)} onClick={() => set("beruf", v)}>{l}</button>
              ))}
            </div>
            {p.beruf === "selbst" && (
              <div style={{ ...T.infoBox, marginTop: "10px" }}>
                Als Selbstständiger erhalten Sie kein gesetzliches Krankengeld. Die Lücke beginnt bereits ab Tag 1.
              </div>
            )}
          </div>
        </div>
      </div>

      <Divider />

      {/* Szenario */}
      <div style={T.section}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Erkrankungstyp für Zeitstrahl</div>
        <div style={T.card}>
          {SZENARIEN.map((sz, i) => (
            <div key={sz.id}
              onClick={() => set("szenario", sz.id)}
              style={{ padding: "12px 16px", borderBottom: i < SZENARIEN.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: p.szenario === sz.id ? `${C}08` : "#fff" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: p.szenario === sz.id ? "600" : "400", color: p.szenario === sz.id ? C : "#333" }}>{sz.label}</div>
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Ø {sz.dauer} Monate · BU-Anerkennung {sz.buWahrsch}%</div>
              </div>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `1.5px solid ${p.szenario === sz.id ? C : "#ddd"}`, background: p.szenario === sz.id ? C : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.szenario === sz.id && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer onNext={() => goTo(2)} nextLabel="Weiter zur Absicherung" />
    </div>
  );
}
