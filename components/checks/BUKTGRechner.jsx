import { useEffect, useMemo, useRef, useState } from "react";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
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
    .buktg-swiper {
      display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch; padding: 4px 24px 12px; margin: 0 -24px;
      scrollbar-width: none;
    }
    .buktg-swiper::-webkit-scrollbar { display: none; }
    .buktg-swiper-card {
      flex: 0 0 85%; max-width: 85%; min-width: 0; scroll-snap-align: start;
      border-radius: 16px; background: #F9FAFB; border: 1px solid rgba(17,24,39,0.06);
      padding: 16px 18px; box-sizing: border-box;
    }
    .buktg-acc-item { border-radius: 12px; background: #F9FAFB; border: 1px solid rgba(17,24,39,0.06); margin-bottom: 8px; overflow: hidden; }
    .buktg-acc-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #1F2937;
      background: transparent; cursor: pointer;
    }
    .buktg-acc-panel { padding: 0 16px 14px; font-size: 12px; color: #6B7280; line-height: 1.6; border-top: 1px solid rgba(17,24,39,0.06); }
  `;
  document.head.appendChild(s);
})();

const phaseBarColor = (pct) =>
  pct >= 75 ? "#22c55e" : pct >= 45 ? "#eab308" : "#C0392B";

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

/** Orientierender Netto-Regelbedarf (Grundsicherung) für Studenten-Vergleich */
const GRUNDSICHERUNG_NETTO_ORIENTIERUNG = 1150;

/** Priorität für genau einen zweiten Einordnungs-Hinweis (nach Szenario-Kosten). */
const EINORDNUNG_SECONDARY_PRIORITY = ["emNull", "beamterWiderruf", "inflation"];

function pickSecondaryEinordnungHint(p, R, fmtInfl) {
  const candidates = [];
  if ((p.beruf === "azubi" && p.szenario !== "unfall") || R.isStudentModus) {
    candidates.push({
      type: "emNull",
      text:
        p.beruf === "azubi" && p.szenario !== "unfall"
          ? "Die fünfjährige Wartezeit für die EM-Rente ist in der Ausbildung in der Regel noch nicht erfüllt — im Modell daher 0 € EM (Ausnahme: Unfall-Szenario)."
          : "Keine gesetzliche EM-Rente aus Erwerbstätigkeit im Modell — Phase 4 nur über private Vorsorge (z. B. BU).",
    });
  }
  if (p.beruf === "beamter" && p.beamterWiderruf && p.szenario !== "unfall") {
    candidates.push({
      type: "beamterWiderruf",
      text: "Bei Beamten auf Widerruf bzw. in der Probezeit entfällt das Ruhegeld bei Dienstunfähigkeit in der Regel — hier mit 0 € angenommen (Ausnahme z. B. Dienstunfall im gewählten Szenario).",
    });
  }
  if (R.luecke > 0 && R.inflationLuecke20 > 0) {
    candidates.push({
      type: "inflation",
      text: `In 20 Jahren ist deine heutige Lücke bei 2 % Inflation kaufkraftmäßig etwa ${fmtInfl} wert.`,
    });
  }
  for (const t of EINORDNUNG_SECONDARY_PRIORITY) {
    const hit = candidates.find((c) => c.type === t);
    if (hit) return hit;
  }
  return null;
}

/** Krankengeld-Bemessung: relevantes Brutto bis BBG (2026, orientierend) */
const KG_BBG_MONATLICH = 4068;
/** Sozialabzug vom Krankengeld (KV + PV + RV + ALV — Krankenkasse behält ein) */
const KG_KRANKENGELD_SOZIAL_SATZ = 0.1235;

// ─── SZENARIEN ────────────────────────────────────────────────────────────────
const SZENARIEN = [
  { id: "psyche",  emoji: "🧠", label: "Psyche",  desc: "Burnout oder Depression",               dauer: 42, buWahrsch: 52 },
  { id: "ruecken", emoji: "🦴", label: "Rücken",  desc: "Bandscheibe oder chronische Schmerzen", dauer: 25, buWahrsch: 38 },
  { id: "krebs",   emoji: "🎗️", label: "Krebs",   desc: "Diagnose und Behandlung",               dauer: 50, buWahrsch: 68 },
  { id: "herz",    emoji: "❤️", label: "Herz",    desc: "Infarkt oder Herzinsuffizienz",          dauer: 36, buWahrsch: 74 },
  { id: "unfall",  emoji: "🤕", label: "Unfall",  desc: "Fraktur oder Lähmung",                  dauer: 18, buWahrsch: 45 },
];

/** EM-Rente je Szenario (vereinfacht): Psyche 0, Herz 34 %, sonst 17 % des Nettos */
function emRenteNachSzenario(szenarioId, netto) {
  if (szenarioId === "psyche") return 0;
  if (szenarioId === "herz") return Math.round(netto * 0.34);
  return Math.round(netto * 0.17);
}

// ─── BERECHNUNG ───────────────────────────────────────────────────────────────
function berechne({
  brutto,
  beruf,
  kv,
  ktgTag,
  buRente,
  szenario,
  pkvBeitrag = 0,
  beamterWiderruf = false,
  zielNetto = 2500,
  nutzerAlter = 20,
}) {
  const sz = SZENARIEN.find((s) => s.id === szenario) || SZENARIEN[0];
  const alter = Math.max(16, Math.min(66, Math.round(Number(nutzerAlter) || 20)));
  const jahreBis67 = Math.max(0, 67 - alter);

  const isStudent = beruf === "student";
  const isAzubi = beruf === "azubi";
  const isBeamter = beruf === "beamter";
  const isAngestellt = beruf === "angestellt";
  const isAngestelltLike = isAngestellt || isAzubi;

  /** Student/Schüler: Zielnetto, alle Phasen 0, Lücke zu Grundsicherung */
  if (isStudent) {
    const netto = Math.max(0, Math.round(Number(zielNetto) || 2500));
    const p1 = {
      label: "Kein laufendes Arbeitseinkommen",
      sub: "Modell Student/in — kein Lohn aus unselbständiger Arbeit",
      monatl: 0,
      pct: 0,
    };
    const p2 = {
      label: "Krankengeld",
      sub: "Kein typischer GKV-Anspruch aus Erwerbstätigkeit (vereinfacht)",
      monatl: 0,
      pct: 0,
    };
    const p3 = {
      label: "Keine Leistung",
      sub: "Nach ~18 Monaten · im Modell ohne Einkommensersatz",
      monatl: 0,
      pct: 0,
    };
    const emSchaetzung = 0;
    const p4mon = buRente;
    const p4 = {
      label: buRente > 0 ? "BU-Rente (private Vorsorge)" : "Keine private Absicherung",
      sub: "Dauerhaft",
      monatl: p4mon,
      pct: netto > 0 ? Math.min(100, Math.round((p4mon / netto) * 100)) : 0,
    };
    const luecke = Math.max(0, netto - GRUNDSICHERUNG_NETTO_ORIENTIERUNG);
    const lueckeKG = netto;
    const empfKTG = lueckeKG > 0 ? Math.max(0, Math.ceil((lueckeKG / 30) / 5) * 5) : 0;
    const empfBU = luecke > 0 ? Math.max(0, Math.round(luecke / 50) * 50) : 0;
    const inflationLuecke20 = luecke > 0 ? Math.round(luecke * 1.02 ** 20) : 0;
    const gesamtschadenSzenario = Math.round(luecke * sz.dauer);
    const verlorenesLebensEinkommen = Math.round(luecke * 12 * jahreBis67);

    return {
      netto,
      p1,
      p2,
      p3,
      p4,
      luecke,
      lueckeKG,
      sz,
      kgBasis: 0,
      kgVorSozial: 0,
      ktgMon: 0,
      ktgNetNachPkv: 0,
      pkvAbzugMon: 0,
      emSchaetzung,
      empfKTG,
      empfBU,
      inflationLuecke20,
      gesamtschadenSzenario,
      verlorenesLebensEinkommen,
      grundsicherungOrientierung: GRUNDSICHERUNG_NETTO_ORIENTIERUNG,
      isStudentModus: true,
      jahreBis67,
    };
  }

  const netto = Math.round(brutto * 0.72);
  const ktgMon = ktgTag * 30;
  const pkvAb = kv === "pkv" ? Math.max(0, Number(pkvBeitrag) || 0) : 0;
  const ktgNetNachPkv = Math.max(0, ktgMon - pkvAb);

  let kgVorSozial = 0;
  let kgNachSozial = 0;
  if (kv === "gkv" && isAngestelltLike) {
    const brKg = Math.min(brutto, KG_BBG_MONATLICH);
    kgVorSozial = Math.round(brKg * 0.7);
    kgNachSozial = Math.round(kgVorSozial * (1 - KG_KRANKENGELD_SOZIAL_SATZ));
  }

  const ktgInPhasen = kv === "pkv" ? ktgNetNachPkv : ktgMon;
  /** Phase 3: nur privates KTG (nicht Beamte — siehe Beamten-Zweig) */
  const p3monDefault = ktgTag > 0 ? ktgInPhasen : 0;

  const p1 =
    beruf === "selbst"
      ? {
          label: "Keine Lohnfortzahlung",
          sub: "Erste 6 Wochen — kein Arbeitgeber-Ersatz wie bei Angestellten",
          monatl: 0,
          pct: 0,
        }
      : isBeamter
        ? {
            label: "Weiterzahlung der Bezüge",
            sub: "Erste 6 Wochen (Dienstherr)",
            monatl: netto,
            pct: 100,
          }
        : {
            label: "Lohnfortzahlung",
            sub: "Erste 6 Wochen (Arbeitgeber)",
            monatl: netto,
            pct: 100,
          };

  let p2mon;
  let p2Sub;
  if (isBeamter) {
    p2mon = netto;
    p2Sub = "Ab Woche 7 · Bezüge werden weitergezahlt (vereinfachtes Beamtenmodell, keine Lücke)";
  } else {
    p2mon =
      (kv === "gkv" && isAngestelltLike ? kgNachSozial : 0) +
      (kv === "gkv" && isAngestelltLike ? ktgMon : ktgInPhasen);
    p2Sub = "Ab Woche 7";
    if (kv === "gkv" && isAngestelltLike) {
      p2Sub =
        ktgMon > 0
          ? "Krankengeld (GKV, netto) + privates KTG"
          : "Krankengeld (GKV) nach Sozialabzug durch die Kasse";
    } else if (kv === "pkv") {
      p2Sub =
        pkvAb > 0
          ? "Privates KTG abzüglich PKV (Arbeitgeberzuschuss entfällt)"
          : "Privates Krankentagegeld";
    } else {
      p2Sub = ktgMon > 0 ? "Privates Krankentagegeld" : "Kein gesetzliches Krankengeld";
    }
  }

  const p2 = {
    label: "Krankengeld",
    sub: p2Sub,
    monatl: p2mon,
    pct: Math.min(100, Math.round((p2mon / netto) * 100)),
  };

  let p3mon;
  let p3Label;
  let p3Sub;
  if (isBeamter) {
    p3mon = netto;
    p3Label = "Weiterbezüge";
    p3Sub = "Nach ~18 Monaten · vereinfacht fortlaufende Bezüge (ohne Kürzung im Modell)";
  } else {
    p3mon = p3monDefault;
    p3Label = p3mon > 0 ? "Nur privates KTG" : "Keine Leistung";
    p3Sub = "Nach ~18 Monaten · gesetzliches Krankengeld entfällt";
  }

  const p3 = {
    label: p3Label,
    sub: p3Sub,
    monatl: p3mon,
    pct: Math.min(100, Math.round((p3mon / netto) * 100)),
  };

  let emSchaetzung;
  if (isBeamter) {
    const widerrufOhneDienstunfall = beamterWiderruf && szenario !== "unfall";
    emSchaetzung = widerrufOhneDienstunfall ? 0 : Math.round(netto * 0.35);
  } else if (isAzubi) {
    emSchaetzung = szenario === "unfall" ? emRenteNachSzenario(szenario, netto) : 0;
  } else {
    emSchaetzung = emRenteNachSzenario(szenario, netto);
  }

  const p4mon = buRente + emSchaetzung;
  let p4Label;
  if (isBeamter) {
    p4Label =
      buRente > 0
        ? "Dienstunfähigkeits-Absicherung + Ruhegehalt bei Dienstunfähigkeit"
        : "Ruhegehalt bei Dienstunfähigkeit";
  } else if (isAzubi) {
    const emShort =
      szenario === "unfall"
        ? "EM: Schätzung nach Unfall-Szenario"
        : "EM: 0 € (noch keine 5-Jahres-Wartezeit)";
    p4Label = buRente > 0 ? `BU-Rente + ${emShort}` : emShort;
  } else {
    const emShort =
      szenario === "psyche" ? "EM: 0 €" : szenario === "herz" ? "EM: 34 %" : "EM: 17 %";
    p4Label = buRente > 0 ? `BU-Rente + ${emShort}` : emShort;
  }
  const p4 = {
    label: p4Label,
    sub: "Dauerhaft",
    monatl: p4mon,
    pct: Math.min(100, Math.round((p4mon / netto) * 100)),
  };

  const luecke = Math.max(0, netto - p4mon);
  const lueckeKG = Math.max(0, netto - p2mon);

  const empfKTG = lueckeKG > 0 ? Math.max(0, Math.ceil((lueckeKG / 30) / 5) * 5) : 0;
  const empfBU = luecke > 0 ? Math.max(0, Math.round(luecke / 50) * 50) : 0;

  const inflationLuecke20 = luecke > 0 ? Math.round(luecke * 1.02 ** 20) : 0;
  const gesamtschadenSzenario = Math.round(luecke * sz.dauer);
  const verlorenesLebensEinkommen =
    isAzubi && jahreBis67 > 0 ? Math.round(luecke * 12 * jahreBis67) : 0;

  return {
    netto,
    p1,
    p2,
    p3,
    p4,
    luecke,
    lueckeKG,
    sz,
    kgBasis: kgNachSozial,
    kgVorSozial,
    ktgMon,
    ktgNetNachPkv,
    pkvAbzugMon: pkvAb,
    emSchaetzung,
    empfKTG,
    empfBU,
    inflationLuecke20,
    gesamtschadenSzenario,
    verlorenesLebensEinkommen,
    grundsicherungOrientierung: null,
    isStudentModus: false,
    jahreBis67,
  };
}

/** Amber-Infobox — gleiche Familie wie übrige Check-Hinweise (neben Akzent, Rot-Warn, Grün-OK, Grau-Kontext). */
function SmartHintCard({ children, icon = "💡", compact = false }) {
  return (
    <div
      style={{
        display: "flex",
        gap: compact ? "8px" : "12px",
        alignItems: "flex-start",
        padding: compact ? "10px 12px" : "14px 16px",
        borderRadius: compact ? "12px" : "14px",
        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
        border: "1px solid #FCD34D",
        marginBottom: compact ? 0 : "12px",
      }}
    >
      <span style={{ flexShrink: 0, fontSize: compact ? "15px" : "18px", lineHeight: 1.2 }} aria-hidden>
        {icon}
      </span>
      <div
        style={{
          fontSize: compact ? "11px" : "13px",
          fontWeight: "500",
          color: "#92400E",
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </div>
  );
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
    beamterWiderruf: false,
    kv:       "gkv",
    pkvBeitrag: 400,
    ktgTag:   0,
    buRente:  0,
    szenario: "psyche",
    zielNetto: 2500,
    nutzerAlter: 20,
  });

  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const [scr, setScr] = useState(1);

  const STEP_IDS = useMemo(() => {
    if (p.beruf === "student") {
      return ["beruf", "brutto", "szenario"];
    }
    const ids = ["beruf", "kv"];
    if (p.kv === "pkv") ids.push("pkvBeitrag");
    ids.push("brutto", "ktgBu", "szenario");
    return ids;
  }, [p.kv, p.beruf]);

  const stepCount = STEP_IDS.length;
  const sid = STEP_IDS[scr - 1] ?? "beruf";

  const prevKvRef = useRef(p.kv);
  useEffect(() => {
    setScr((s) => Math.min(s, stepCount));
  }, [stepCount]);

  useEffect(() => {
    const prev = prevKvRef.current;
    if (prev === "pkv" && p.kv === "gkv") {
      /* Nur zurückspringen, wenn der PKV-Zusatzschritt schon „durchlaufen“ war — sonst bleibt man z. B. auf Schritt 2 (KV) */
      setScr((s) => (s > 3 ? Math.max(1, s - 1) : s));
    } else if (prev === "gkv" && p.kv === "pkv") {
      setScr((s) => (s >= 3 ? s + 1 : s));
    }
    prevKvRef.current = p.kv;
  }, [p.kv]);

  const nextScr = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (scr < stepCount) setScr((s) => s + 1);
    else goTo(2);
  };
  const backScr = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (scr > 1) setScr((s) => s - 1);
  };
  const goTo = (ph) => { setAk((k) => k + 1); setPhase(ph); window.scrollTo({ top: 0 }); };

  const R = berechne(p);
  const TOTAL_PHASES = 3;

  const [phaseBarsReady, setPhaseBarsReady] = useState(false);
  const [legalOpen, setLegalOpen] = useState(null);

  useEffect(() => {
    if (phase !== 2) {
      setPhaseBarsReady(false);
      return undefined;
    }
    setPhaseBarsReady(false);
    const t = window.setTimeout(() => setPhaseBarsReady(true), 70);
    return () => window.clearTimeout(t);
  }, [phase, ak]);

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
              <div><div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{fmt(R.netto)}</div><div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{R.isStudentModus ? "Ziel-Netto" : "Ihr Netto"}</div></div>
            </div>
          </div>
        }
      />
    </div>
  );

  // ── Phase 2: Ergebnis (mobile-first, Swiper + Grid + Accordion) ───────────
  if (phase === 2) {
    const phasen = [R.p1, R.p2, R.p3, R.p4];

    const isAngLike = p.beruf === "angestellt" || p.beruf === "azubi";

    const massiveUnterdeckung = p.buRente < R.netto * 0.5;

    const detailHintRows = [];
    if (p.kv === "gkv" && isAngLike && R.kgBasis > 0) {
      detailHintRows.push({
        key: "kgSozial",
        text: "Vom Krankengeld behält die Kasse direkt Sozialbeiträge ein — dein ausgezahltes Krankengeld liegt deshalb unter den 70 % vom Brutto.",
      });
    }
    if (p.beruf === "azubi" && p.szenario !== "unfall") {
      detailHintRows.push({
        key: "azubiWarte",
        text: "Hinweis: Die fünfjährige Wartezeit für die EM-Rente ist während der Ausbildung in der Regel noch nicht erfüllt — im Modell daher 0 € EM (Ausnahme: Unfall-Szenario).",
      });
    }
    if (R.isStudentModus && R.luecke > 0) {
      detailHintRows.push({
        key: "studModell",
        text: `Vergleich: Ziel-Netto minus orientierender Grundsicherung (ca. ${fmt(R.grundsicherungOrientierung)} netto) — stark vereinfacht, kein individueller SGB-II-Check.`,
      });
    }
    if (p.beruf === "beamter" && p.beamterWiderruf && p.szenario !== "unfall") {
      detailHintRows.push({
        key: "beamterWiderruf",
        text: "Bei Beamten auf Widerruf bzw. in der Probezeit entfällt das Ruhegeld bei Dienstunfähigkeit in der Regel — hier mit 0 € angenommen (Ausnahme z. B. Dienstunfall im gewählten Szenario).",
      });
    }
    if (!R.isStudentModus && p.brutto < 2500) {
      detailHintRows.push({
        key: "grusi",
        text: "Bei niedrigem Krankengeld kann es zur Verrechnung mit Grundsicherung kommen — ein persönlicher Check lohnt sich.",
      });
    }
    if (!R.isStudentModus && p.ktgTag === 0 && p.kv === "gkv") {
      detailHintRows.push({
        key: "ktgMin",
        text: "Du stützt dich nur auf das gesetzliche Krankengeld — ein zusätzliches Krankentagegeld schließt oft die größte Lücke in den ersten Monaten.",
      });
    }
    if (R.luecke > 1500) {
      detailHintRows.push({
        key: "haus",
        text: "Deine langfristige Lücke entspricht in der Größenordnung einer typischen Finanzrate fürs Eigenheim — dieses Risiko trägst du ohne Absicherung allein.",
      });
    }
    if (R.luecke > 0 && R.inflationLuecke20 > 0) {
      detailHintRows.push({
        key: "infl",
        text: `In 20 Jahren ist deine heutige Lücke bei 2 % Inflation kaufkraftmäßig etwa ${fmt(R.inflationLuecke20)} wert.`,
      });
    }

    const secondaryEinordnung = pickSecondaryEinordnungHint(p, R, fmt(R.inflationLuecke20));
    const omitDetailKeys = new Set();
    if (secondaryEinordnung?.type === "emNull") omitDetailKeys.add("azubiWarte");
    if (secondaryEinordnung?.type === "beamterWiderruf") omitDetailKeys.add("beamterWiderruf");
    if (secondaryEinordnung?.type === "inflation") omitDetailKeys.add("infl");
    const accordionDetailHints = detailHintRows.filter((h) => !omitDetailKeys.has(h.key));

    const showLebenszeitHint =
      R.verlorenesLebensEinkommen > 0 && (p.beruf === "student" || p.beruf === "azubi");
    const showEinordnungSection = R.luecke > 0 || secondaryEinordnung != null;
    const showDetailsAccordion = accordionDetailHints.length > 0 || showLebenszeitHint;

    const toggleLegal = (id) => setLegalOpen((x) => (x === id ? null : id));

    return (
      <div style={{ ...T.page, "--accent": C, background: "#ffffff" }} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL_PHASES} makler={MAKLER} T={T} />

        <div style={{ paddingBottom: "120px" }}>
          {/* Hero: große Zahl, darunter Pill */}
          <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "28px" }}>
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Absicherung im Überblick</div>
            <div
              style={{
                ...T.resultNumber(R.luecke > 0),
                fontSize: "48px",
                color: R.luecke > 0 ? "#C0392B" : "#15803D",
              }}
            >
              {R.luecke > 0 ? fmt(R.luecke) : "Gedeckt"}
            </div>
            <div style={{ ...T.resultUnit, marginBottom: "14px" }}>
              {R.isStudentModus
                ? R.luecke > 0
                  ? "Lücke zwischen Ziel-Netto und orientierendem Regelbedarf (Grundsicherung)"
                  : "Ziel erreicht oder unter dem angenommenen Regelbedarf"
                : R.luecke > 0
                  ? "mögliche monatliche Lücke"
                  : "Ihr Einkommen ist weitgehend abgesichert"}
            </div>
            {R.luecke > 0 ? (
              <div style={{ ...T.statusWarn, margin: "0 auto", width: "fit-content" }}>Absicherungslücke erkannt</div>
            ) : (
              <div style={{ ...T.statusOk, margin: "0 auto", width: "fit-content" }}>Gut abgesichert</div>
            )}
            {massiveUnterdeckung && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 13px",
                  background: "#FFF7ED",
                  border: "1px solid #FDBA74",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#C2410C",
                  margin: "10px auto 0",
                  width: "fit-content",
                }}
              >
                Massive Unterdeckung
              </div>
            )}
            <div style={{ ...T.resultSub, marginTop: "16px" }}>Vereinfachte Einordnung · auf Basis Ihrer Angaben</div>
          </div>

          {showEinordnungSection && (
            <div style={{ ...T.section, marginTop: "4px" }}>
              <div style={{ ...T.sectionLbl, marginBottom: "8px" }}>Einordnung</div>
              {R.luecke > 0 && (
                <SmartHintCard icon="📊">
                  <strong style={{ fontWeight: "700" }}>Szenario-Kosten:</strong>{" "}
                  <span style={{ fontWeight: "700", color: "#B45309" }}>{fmt(R.gesamtschadenSzenario)}</span>
                  <span style={{ display: "block", marginTop: "6px", fontWeight: "500", opacity: 0.88, fontSize: "12px" }}>
                    {R.sz.label} · Monatslücke {fmt(R.luecke)} × Ø {R.sz.dauer} Monate
                  </span>
                </SmartHintCard>
              )}
              {secondaryEinordnung && (
                <SmartHintCard icon="💡">{secondaryEinordnung.text}</SmartHintCard>
              )}
            </div>
          )}

          {/* Horizontal Swiper (snap) */}
          <div style={T.section}>
            <div style={{ ...T.sectionLbl, paddingLeft: 0 }}>
              {R.isStudentModus ? "Modell ohne laufendes Arbeitseinkommen" : "So entwickelt sich Ihr Einkommen"}
            </div>
            <div className="buktg-swiper" role="region" aria-label="Phasen Einkommen">
              {phasen.map((ph, i) => {
                const diff = R.netto - ph.monatl;
                const barW = phaseBarsReady ? Math.min(100, ph.pct) : 0;
                const barCol = phaseBarColor(ph.pct);
                const showEmZeroWarn = i === 3 && (R.emSchaetzung === 0 || R.isStudentModus);
                return (
                  <div key={i} className="buktg-swiper-card">
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Phase {i + 1}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", lineHeight: 1.3 }}>{ph.label}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px", lineHeight: 1.45 }}>{ph.sub}</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: ph.pct < 45 ? "#C0392B" : "#111827", letterSpacing: "-0.5px", marginTop: "12px" }}>
                      {fmt(ph.monatl)}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{ph.pct} % Ihres Nettos</div>
                    <div style={{ ...T.progBarTrack, marginTop: "12px", height: "8px", borderRadius: "999px" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${barW}%`,
                          borderRadius: "999px",
                          background: barCol,
                          transition: "width 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      />
                    </div>
                    {showEmZeroWarn && (
                      <div style={{ marginTop: "10px" }} role="alert">
                        <SmartHintCard
                          icon="⚠️"
                          compact
                        >
                          {p.beruf === "azubi" && p.szenario !== "unfall"
                            ? "Wartezeit von 5 Jahren noch nicht erfüllt. EM-Rente in diesem Schritt 0 € — Ausnahme: Unfall-Szenario."
                            : R.isStudentModus
                              ? "Keine gesetzliche EM aus Erwerbstätigkeit modelliert — private Vorsorge (z. B. BU) prüfen."
                              : "Achtung: EM-Rente in diesem Schritt 0 € — hohes Absicherungsrisiko bis zur gesetzlichen Rente."}
                        </SmartHintCard>
                      </div>
                    )}
                    {diff > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          background: "#FFF6F5",
                          border: "1px solid #F2D4D0",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#C0392B",
                          lineHeight: 1.45,
                        }}
                      >
                        Lücke zu Ihrem Netto: − {fmt(diff)} / Monat
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kompakt-Empfehlung: Lückenschließung */}
          <div style={{ ...T.section, marginBottom: "8px" }}>
            <div
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: C,
                lineHeight: 1.35,
                marginBottom: "14px",
              }}
            >
              {R.luecke > 0 ? (
                <>So schließen Sie Ihre Lücke von {fmt(R.luecke)}</>
              ) : (
                <>Im Modell ist Ihre monatliche Lücke gedeckt</>
              )}
            </div>
            <div
              style={{
                border: `1px solid rgba(17,24,39,0.08)`,
                borderRadius: "14px",
                padding: "14px 16px",
                background: "#FFFFFF",
                boxShadow: "0 2px 12px rgba(17,24,39,0.04)",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>Krankentagegeld</div>
                <div style={{ fontSize: "17px", fontWeight: "800", color: C, marginTop: "4px", letterSpacing: "-0.3px" }}>
                  + {R.empfKTG} € / Tag
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "3px", lineHeight: 1.45 }}>
                  Sichert Phase 2 & 3
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(17,24,39,0.06)", paddingTop: "14px", marginTop: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                  {p.beruf === "beamter" ? "DU-Absicherung" : "BU-Absicherung"}
                </div>
                <div style={{ fontSize: "17px", fontWeight: "800", color: C, marginTop: "4px", letterSpacing: "-0.3px" }}>
                  + {fmt(R.empfBU)} / Monat
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "3px", lineHeight: 1.45 }}>
                  Sichert Phase 4 dauerhaft
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#6B7280",
                marginTop: "10px",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Risiko bei {R.sz.label}: {R.sz.buWahrsch} %
            </div>
          </div>

          {/* Accordion Rechtliches */}
          <div style={{ ...T.section, marginBottom: "24px" }}>
            <div style={{ ...T.sectionLbl, marginBottom: "10px" }}>Hinweise & Rechtliches</div>
            {showDetailsAccordion && (
              <div className="buktg-acc-item">
                <button type="button" className="buktg-acc-btn" onClick={() => toggleLegal("details")} aria-expanded={legalOpen === "details"}>
                  <span>Details zur Berechnung</span>
                  <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{legalOpen === "details" ? "▲" : "▼"}</span>
                </button>
                {legalOpen === "details" && (
                  <div className="buktg-acc-panel" style={{ paddingTop: "12px" }}>
                    {R.luecke > 0 && (
                      <p style={{ marginBottom: "12px" }}>
                        <strong>Szenario-Kosten:</strong> {fmt(R.gesamtschadenSzenario)} ({R.sz.label}: Monatslücke{" "}
                        {fmt(R.luecke)} × Ø {R.sz.dauer} Monate, vereinfacht).
                      </p>
                    )}
                    {accordionDetailHints.map((h) => (
                      <p key={h.key} style={{ marginBottom: "10px" }}>
                        {h.text}
                      </p>
                    ))}
                    {showLebenszeitHint && (
                      <p style={{ marginBottom: 0 }}>
                        <strong>Lebenszeitperspektive:</strong> Verlorenes Lebens-Einkommen (orientierend){" "}
                        {fmt(R.verlorenesLebensEinkommen)} — {fmt(R.luecke)} / Monat × 12 × {R.jahreBis67} Jahre bis Alter
                        67 (aus Ihrem angegebenen Alter {p.nutzerAlter}).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="buktg-acc-item">
              <button type="button" className="buktg-acc-btn" onClick={() => toggleLegal("calc")} aria-expanded={legalOpen === "calc"}>
                <span>Wie berechnen wir das?</span>
                <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{legalOpen === "calc" ? "▲" : "▼"}</span>
              </button>
              {legalOpen === "calc" && (
                <div className="buktg-acc-panel" style={{ paddingTop: "12px" }}>
                  Vereinfachte Einordnung auf Basis Ihrer Angaben. Netto = Brutto bzw. Gewinn bzw. Bezüge × 0,72 (Schätzwert). GKV-Krankengeld (Angestellte und Auszubildende): 70 % des relevanten Bruttos bis zur BBG Krankengeld (orientierend 4.068 €/Mon. 2026), abzüglich Sozialabzug durch die Kasse (ca. 12,2–12,5 %). Auszubildende: Phasen 1–2 wie Angestellte; EM-Rente im Modell 0 € außer Szenario „Unfall“ (fünfjährige Wartezeit typischerweise noch nicht erfüllt). Student/Schüler: Ziel-Netto vs. pauschaler Regelbedarf ({fmt(GRUNDSICHERUNG_NETTO_ORIENTIERUNG)} netto, orientierend); alle Phasen ohne laufendes Arbeitseinkommen; „verlorenes Lebens-Einkommen“ = Monatslücke × 12 × Jahre bis Alter 67. Beamte: Krankheits-Phase mit durchgehenden Bezügen modelliert; Ruhegehalt bei Dienstunfähigkeit pauschal 35 % des Nettos, außer Widerruf/Probe ohne Dienstunfall-Szenario (0 €). Ab ~18 Monaten (nicht Beamte): nur noch privates KTG. PKV: KTG abzüglich monatlichem PKV-Eigenanteil ab Woche 7 (ohne Arbeitgeberzuschuss). · Grundlage §47 SGB V. EM-Rente sonst szenariobasiert (Psyche 0 €, Herz 34 % Netto, sonst 17 % Netto) · vereinfacht, §43 SGB VI.
                  <span style={{ color: "#b8884a" }}> Keine Rechtsberatung.</span>
                </div>
              )}
            </div>
            <div className="buktg-acc-item">
              <button type="button" className="buktg-acc-btn" onClick={() => toggleLegal("legal")} aria-expanded={legalOpen === "legal"}>
                <span>Haftungsausschluss</span>
                <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{legalOpen === "legal" ? "▲" : "▼"}</span>
              </button>
              {legalOpen === "legal" && (
                <div className="buktg-acc-panel" style={{ paddingTop: "12px" }}>
                  {CHECK_LEGAL_DISCLAIMER_FOOTER}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer onNext={() => goTo(3)} onBack={() => goTo(1)} nextLabel="Absicherung gemeinsam prüfen" T={T} />
      </div>
    );
  }

  // ── Phase 1: dynamischer Flow (PKV-Zusatzscreen) ───────────────────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={scr} total={stepCount} makler={MAKLER} T={T} />

      {sid === "beruf" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>Wie sind Sie aktuell beschäftigt?</div>
            <div style={T.body}>Davon hängt ab, welche gesetzlichen Leistungen greifen.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { v: "angestellt", l: "Angestellt",    d: "Lohnfortzahlung + Krankengeld (GKV)",  emoji: "💼" },
                { v: "azubi",      l: "Auszubildende/r", d: "Wie Angestellte: Lohnfortzahlung & Krankengeld — EM oft wegen Wartezeit 0 € (außer Unfall)", emoji: "🛠️" },
                { v: "student",    l: "Student/in · Schüler/in", d: "Ziel-Netto vs. Grundsicherung — kein laufendes Arbeitseinkommen im Krankheitsmodell", emoji: "🎓" },
                { v: "selbst",     l: "Selbstständig", d: "Keine Lohnfortzahlung — im Krankheitsfall fehlen Arbeitgeber-Leistungen der ersten Wochen komplett", emoji: "🧑‍💻" },
                { v: "beamter",    l: "Beamter",       d: "Bezüge im öffentlichen Dienst — Fortzahlung durch den Dienstherrn statt privater Lohnfortzahlung", emoji: "🏛️" },
              ].map(({ v, l, d, emoji }) => (
                <SelectionCard key={v} value={v} label={l} description={d}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                  selected={p.beruf === v} accent={C} onClick={() => set("beruf", v)} />
              ))}
            </div>
            {p.beruf === "beamter" && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ ...T.fldLbl, marginBottom: "8px" }}>Ihr Beamtenverhältnis</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <SelectionCard
                    value="leben"
                    label="Lebenslaufbeamter / unbefristet"
                    description="Ruhegehalt bei Dienstunfähigkeit wird im Modell mit 35 % der Bezüge (Netto) geschätzt."
                    icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>⚖️</span>}
                    selected={!p.beamterWiderruf}
                    accent={C}
                    onClick={() => set("beamterWiderruf", false)}
                  />
                  <SelectionCard
                    value="widerruf"
                    label="Auf Widerruf / Probezeit"
                    description="Ruhegehalt bei DU oft ausgeschlossen — Modell setzt 0 €, außer Szenario „Unfall“ (Dienstunfall)."
                    icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>📋</span>}
                    selected={p.beamterWiderruf}
                    accent={C}
                    onClick={() => set("beamterWiderruf", true)}
                  />
                </div>
              </div>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} nextLabel="Weiter →" T={T} />
        </>
      )}

      {sid === "kv" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>Wie sind Sie krankenversichert?</div>
            <div style={T.body}>
              {p.beruf === "selbst"
                ? "Ohne Arbeitgeber gibt es keine Lohnfortzahlung — hier geht es um GKV/PKV und späteres Krankengeld bzw. KTG."
                : p.beruf === "beamter"
                  ? "Beim Dienstherrn gelten andere Regeln als in der GKV — Krankengeldphase und Bezüge sind vereinfacht modelliert."
                  : p.beruf === "azubi"
                    ? "Als Auszubildende/r gelten bei Lohnfortzahlung und Krankengeld weitgehend die gleichen Grundregeln wie bei Angestellten."
                    : "Das entscheidet, ob und wie viel Krankengeld Sie erhalten."}
            </div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                {
                  v: "gkv",
                  l: "Gesetzlich (GKV)",
                  d:
                    p.beruf === "beamter"
                      ? `Orientierung: BBG KG ${KG_BBG_MONATLICH.toLocaleString("de-DE")} €/Mon. — Ihre Bezüge laufen im Rechner gesondert`
                      : `Krankengeld: ca. 70 % des relevanten Bruttos (BBG KG orientierend ${KG_BBG_MONATLICH.toLocaleString("de-DE")} €/Mon.)`,
                  emoji: "🏥",
                },
                { v: "pkv", l: "Privat (PKV)",     d: "Kein gesetzliches Krankengeld — nur privates KTG sichert ab", emoji: "🔒" },
              ].map(({ v, l, d, emoji }) => (
                <SelectionCard key={v} value={v} label={l} description={d}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                  selected={p.kv === v} accent={C} onClick={() => set("kv", v)} />
              ))}
            </div>
            {p.beruf === "selbst" && p.kv === "gkv" && (
              <div style={{ marginTop: "12px" }}>
                <SmartHintCard>
                  <strong style={{ fontWeight: "700" }}>Hinweis:</strong> Selbstständige erhalten GKV-Krankengeld nur mit
                  gesonderter Option (§44 SGB V) — bitte prüfen Sie Ihren Tarif.
                </SmartHintCard>
              </div>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
        </>
      )}

      {sid === "pkvBeitrag" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>Wie hoch ist Ihr monatlicher PKV-Beitrag?</div>
            <div style={T.body}>
              {p.beruf === "beamter"
                ? "Eigenanteil ohne Zuschuss des Dienstherren — ab Woche 7 der Krankheit voll aus Ihrem Tagegeld."
                : "Eigenanteil ohne Arbeitgeberzuschuss — ab Woche 7 der Krankheit fließt er voll aus Ihrem Tagegeld."}
            </div>
          </div>
          <div style={T.section}>
            <SliderCard
              label="PKV-Beitrag (Monat)"
              value={p.pkvBeitrag}
              min={0}
              max={1200}
              step={10}
              unit="€"
              display={p.pkvBeitrag > 0 ? "wird vom KTG abgezogen" : "bitte realistischen Wert wählen"}
              accent={C}
              onChange={(v) => set("pkvBeitrag", v)}
              hint="Inkl. ggf. Pflege- und Krankenversicherungsanteil, die Sie selbst zahlen"
            />
            <SmartHintCard>
              {p.beruf === "beamter"
                ? "Achtung: Der Zuschuss des Dienstherren zur PKV entfällt nach 6 Wochen. Ihr Krankentagegeld muss auch den laufenden KV-Beitrag decken."
                : "Achtung: Der Arbeitgeberzuschuss zur PKV entfällt nach 6 Wochen. Ihr Krankentagegeld muss auch den laufenden KV-Beitrag decken."}
            </SmartHintCard>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
        </>
      )}

      {sid === "brutto" && p.beruf === "student" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>Welches Nettoeinkommen streben Sie später an?</div>
            <div style={T.body}>
              Wir vergleichen Ihr Ziel-Netto mit einem pauschalen Regelbedarf (orientierend Grundsicherung). Es gibt im Modell kein laufendes Arbeitseinkommen aus Ausbildung oder Nebenjob.
            </div>
          </div>
          <div style={T.section}>
            <SliderCard
              label="Ziel-Netto (monatlich)"
              value={p.zielNetto}
              min={800}
              max={6000}
              step={50}
              unit="€"
              display={`Orientierende Lücke zur Grundsicherung (${fmt(GRUNDSICHERUNG_NETTO_ORIENTIERUNG)}): ${fmt(Math.max(0, p.zielNetto - GRUNDSICHERUNG_NETTO_ORIENTIERUNG))}`}
              accent={C}
              onChange={(v) => set("zielNetto", v)}
              hint="z. B. Einstiegsgehalt nach dem Studium"
            />
            <SliderCard
              label="Ihr Alter"
              value={p.nutzerAlter}
              min={16}
              max={35}
              step={1}
              unit="J."
              display={`Noch ${Math.max(0, 67 - p.nutzerAlter)} Jahre bis Alter 67 (für Lebens-Einkommens-Hochrechnung)`}
              accent={C}
              onChange={(v) => set("nutzerAlter", v)}
            />
            <SmartHintCard>
              Grundsicherung im Modell pauschal {fmt(GRUNDSICHERUNG_NETTO_ORIENTIERUNG)} € netto — tatsächliche Leistungen (SGB II) sind individuell und können abweichen.
            </SmartHintCard>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
        </>
      )}

      {sid === "brutto" && p.beruf !== "student" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>
              {p.beruf === "selbst"
                ? "Wie hoch ist Ihr durchschnittlicher Gewinn pro Monat?"
                : p.beruf === "beamter"
                  ? "Wie hoch sind Ihre monatlichen Bezüge?"
                  : p.beruf === "azubi"
                    ? "Wie hoch ist Ihre monatliche Brutto-Ausbildungsvergütung?"
                    : "Was verdienen Sie aktuell brutto pro Monat?"}
            </div>
            <div style={T.body}>
              {p.beruf === "selbst"
                ? "Wir nutzen Ihren Gewinn wie ein Bruttogehalt zur Schätzung von Netto und Leistungen (vereinfacht)."
                : p.beruf === "beamter"
                  ? "Wir schätzen Ihr Netto aus den Bezügen (vereinfacht, wie bei Brutto × 0,72)."
                  : p.beruf === "azubi"
                    ? "Wie bei Angestellten schätzen wir Ihr Netto aus dem Brutto (× 0,72)."
                    : "Daraus berechnen wir Ihr Netto und die möglichen Leistungen."}
            </div>
          </div>
          <div style={T.section}>
            <SliderCard
              label={
                p.beruf === "selbst"
                  ? "Monatlicher Gewinn (vor Steuern)"
                  : p.beruf === "beamter"
                    ? "Monatliche Bezüge (vor Steuern)"
                    : p.beruf === "azubi"
                      ? "Brutto-Ausbildungsvergütung (Monat)"
                      : "Monatliches Bruttogehalt"
              }
              value={p.brutto}
              min={p.beruf === "azubi" ? 500 : 1500}
              max={12000}
              step={p.beruf === "azubi" ? 50 : 100}
              unit="€"
              display={`ca. ${fmt(R.netto)} netto`}
              accent={C}
              onChange={(v) => set("brutto", v)}
            />
            {p.beruf === "azubi" && (
              <SliderCard
                label="Ihr Alter"
                value={p.nutzerAlter}
                min={16}
                max={28}
                step={1}
                unit="J."
                display={`Noch ${Math.max(0, 67 - p.nutzerAlter)} Jahre bis Alter 67`}
                accent={C}
                onChange={(v) => set("nutzerAlter", v)}
                hint="Für die Hochrechnung „verlorenes Lebens-Einkommen“"
              />
            )}
            {p.brutto > 5800 && (p.beruf === "angestellt" || p.beruf === "azubi") && (
              <SmartHintCard>
                Ihr Einkommen liegt über der BBG der Krankenkasse beim Krankengeld. Die Lücke im Krankheitsfall kann deshalb überproportional hoch ausfallen.
              </SmartHintCard>
            )}
            {p.brutto < 2500 && (
              <SmartHintCard>
                Unterhalb von 2.500 €{" "}
                {p.beruf === "selbst" ? "Gewinn" : p.beruf === "beamter" ? "Bezüge" : p.beruf === "azubi" ? "Brutto-Ausbildungsvergütung" : "Brutto"} droht bei längerer Krankheit die Verrechnung mit Grundsicherung — das sollte im Gespräch geprüft werden.
              </SmartHintCard>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
        </>
      )}

      {sid === "ktgBu" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>Was haben Sie bereits abgesichert?</div>
            <div style={T.body}>Beide Felder sind optional — 0 eingeben wenn kein Vertrag vorhanden.</div>
          </div>
          <div style={T.section}>
            {p.beruf === "selbst" && (
              <SmartHintCard>
                Anders als Angestellte haben Sie keinen Anspruch auf Lohnfortzahlung durch einen Arbeitgeber — in den ersten Wochen einer Krankheit fehlt dieser Betrag vollständig, sofern Sie nicht privat vorsorgen. Prüfen Sie eine Absicherung ab dem 15. oder 43. Tag.
              </SmartHintCard>
            )}
            {p.kv === "pkv" && (
              <SmartHintCard>
                {p.beruf === "beamter"
                  ? "Achtung: Der Zuschuss des Dienstherren zur PKV entfällt nach 6 Wochen. Dein Tagegeld muss auch deinen KV-Beitrag decken!"
                  : "Achtung: Dein Arbeitgeberzuschuss zur PKV entfällt nach 6 Wochen. Dein Tagegeld muss auch deinen KV-Beitrag decken!"}
              </SmartHintCard>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SliderCard label="Krankentagegeld (KTG)" value={p.ktgTag} min={0} max={150} step={5} unit="€/Tag"
                display={p.ktgTag > 0 ? `= ${fmt(p.ktgTag * 30)}/Monat` : "Kein KTG vorhanden"}
                accent={C} onChange={(v) => set("ktgTag", v)} hint="0 wenn kein Vertrag vorhanden" />
              <SliderCard
                label={p.beruf === "beamter" ? "Dienstunfähigkeits-Absicherung" : "BU-Rente"}
                value={p.buRente}
                min={0}
                max={4000}
                step={100}
                unit="€/Mon"
                display={
                  p.buRente === 0
                    ? p.beruf === "beamter"
                      ? "Keine zusätzliche Absicherung"
                      : "Keine BU-Versicherung"
                    : ""
                }
                accent={C}
                onChange={(v) => set("buRente", v)}
                hint={p.beruf === "beamter" ? "0 wenn keine DU-Absicherung vorhanden" : "0 wenn keine BU vorhanden"}
              />
            </div>
            {p.ktgTag === 0 && p.kv === "gkv" && (
              <div style={{ marginTop: "12px" }}>
                <SmartHintCard>
                  Du verlässt dich rein auf das gesetzliche Minimum beim Einkommen — ein zusätzliches Krankentagegeld ist oft der schnellste Hebel.
                </SmartHintCard>
              </div>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} nextLabel="Weiter →" T={T} />
        </>
      )}

      {sid === "szenario" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommens-Check · {scr} / {stepCount}</div>
            <div style={T.h1}>Welches Szenario beschäftigt Sie am meisten?</div>
          </div>
          <div style={T.section}>
            {p.szenario === "psyche" && (
              <SmartHintCard>
                Wusstest du? Psychische Erkrankungen sind mit Ø 42 Monaten die längsten Leistungsfälle — weit über die typische Krankengeld-Dauer von 18 Monaten hinaus.
              </SmartHintCard>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SZENARIEN.map((sz) => (
                <SelectionCard key={sz.id} value={sz.id} label={sz.label}
                  description={`${sz.desc} · Ø ${sz.dauer} Mon.`}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{sz.emoji}</span>}
                  selected={p.szenario === sz.id} accent={C} onClick={() => set("szenario", sz.id)} />
              ))}
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextScr} onBack={backScr} nextLabel="Meine Lücke berechnen" T={T} />
        </>
      )}
    </div>
  );
}
