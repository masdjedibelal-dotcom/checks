import { useEffect, useMemo, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SliderCard, SelectionCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitStoryHero } from "@/components/checks/CheckKitStoryHero";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";

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

/** Phase-2 Swiper: Timeline-Track (Ergebnis) — 4px, Pill-Track, grauer Slate-Ton */
const BUKTG_PHASE2_TIMELINE_TRACK = {
  background: "rgba(31,41,55,0.08)",
  borderRadius: "999px",
  overflow: "hidden",
  height: "4px",
  marginTop: "12px",
};
const BUKTG_PHASE2_TIMELINE_FILL = { borderRadius: "999px" };

const fmt = (n) => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

/** Geschätzter Arbeitgeber-Anteil am PKV-Gesamtbeitrag (nach Entfall des Zuschusses ab Woche 7) */
const PKV_AG_ANTEIL_SCHAETZUNG = 0.5;

/** Priorität für genau einen zweiten Einordnungs-Hinweis (nach Szenario-Kosten). */
const EINORDNUNG_SECONDARY_PRIORITY = ["emNull", "beamterWiderruf"];

function pickSecondaryEinordnungHint(p, R) {
  const candidates = [];
  if ((p.beruf === "azubi" && p.szenario !== "unfall") || R.isStudentModus) {
    candidates.push({
      type: "emNull",
      text:
        p.beruf === "azubi" && p.szenario !== "unfall"
          ? "Die fünfjährige Wartezeit für die EMR ist in der Ausbildung in der Regel noch nicht erfüllt — im Modell daher 0 € EMR (Ausnahme: Unfall-Szenario)."
          : "Keine gesetzliche EMR aus Erwerbstätigkeit im Modell — Absicherung nur über private Vorsorge (z. B. BU).",
    });
  }
  if (p.beruf === "beamter" && p.beamterWiderruf && p.szenario !== "unfall") {
    candidates.push({
      type: "beamterWiderruf",
      text: "Bei Beamten auf Widerruf bzw. in der Probezeit entfällt das Ruhegeld bei Dienstunfähigkeit in der Regel — hier mit 0 € angenommen (Ausnahme z. B. Dienstunfall im gewählten Szenario).",
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

/** EMR je Szenario (vereinfacht): Psyche 0, Herz 34 %, sonst 17 % des Nettos */
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
  gkvKrankengeldJa = false,
}) {
  const sz = SZENARIEN.find((s) => s.id === szenario) || SZENARIEN[0];

  const isStudent = beruf === "student";
  const isAzubi = beruf === "azubi";
  const isBeamter = beruf === "beamter";
  const isAngestellt = beruf === "angestellt";
  const isSelbst = beruf === "selbst";
  const isAngestelltLike = isAngestellt || isAzubi;

  /** Student/Schüler: Ziel-Netto direkt — Fokus 0 € staatliche Absicherung, keine Grundsicherungs-Vergleichslogik */
  if (isStudent) {
    const netto = Math.max(0, Math.round(Number(brutto)));
    const p1 = {
      label: "Kein laufendes Arbeitseinkommen",
      sub: "Modell Student/in — kein Lohn aus unselbständiger Arbeit (keine Lohnfortzahlung)",
      monatl: 0,
      pct: 0,
    };
    const p2 = {
      label: "Krankengeld",
      sub: "Kein typischer GKV-Anspruch aus Erwerbstätigkeit (vereinfacht)",
      monatl: 0,
      pct: 0,
    };
    const emSchaetzung = 0;
    const p3mon = buRente;
    const p3 = {
      label: buRente > 0 ? "Staatliche EMR + private BU-Rente" : "Staatliche Erwerbsminderungsrente (EMR)",
      sub:
        buRente > 0
          ? "Dauerhaft · keine gesetzliche EMR aus Erwerbstätigkeit modelliert — Betrag = private BU"
          : "Dauerhaft · keine EMR aus Erwerbstätigkeit (private Vorsorge empfohlen)",
      monatl: p3mon,
      pct: netto > 0 ? Math.min(100, Math.round((p3mon / netto) * 100)) : 0,
    };
    const luecke = Math.max(0, netto - p3mon);
    const lueckeKG = netto;
    const empfKTG = lueckeKG > 0 ? Math.max(0, Math.ceil((lueckeKG / 30) / 5) * 5) : 0;
    const empfBU = luecke > 0 ? Math.max(0, Math.round(luecke / 50) * 50) : 0;
    const gesamtschadenSzenario = Math.round(luecke * sz.dauer);

    return {
      netto,
      p1,
      p2,
      p3,
      phasesDisplay: [p1, p2, p3],
      luecke,
      lueckeKG,
      sz,
      kgBasis: 0,
      kgVorSozial: 0,
      ktgMon: 0,
      ktgNetNachPkv: 0,
      pkvAbzugMon: 0,
      pkvAgZuschussSchaetzungMonat: 0,
      emSchaetzung,
      empfKTG,
      empfBU,
      gesamtschadenSzenario,
      grundsicherungOrientierung: null,
      isStudentModus: true,
      hideLohnfortzahlungChart: false,
      showPkvAgZuschussWarn: false,
      showDrvEmrHinweisSelbst: false,
    };
  }

  const netto = Math.round(brutto * 0.72);
  const ktgMon = ktgTag * 30;
  const pkvAb = kv === "pkv" ? Math.max(0, Number(pkvBeitrag) || 0) : 0;
  const ktgNetNachPkv = Math.max(0, ktgMon - pkvAb);

  const pkvGesamtMonat = pkvAb;
  const pkvAgZuschussSchaetzungMonat =
    kv === "pkv" && isAngestellt ? Math.round(pkvGesamtMonat * PKV_AG_ANTEIL_SCHAETZUNG) : 0;

  const hatGkvKrankengeld =
    kv === "gkv" &&
    (isAngestelltLike || (isSelbst && gkvKrankengeldJa));

  let kgVorSozial = 0;
  let kgNachSozial = 0;
  if (hatGkvKrankengeld) {
    const brKg = Math.min(brutto, KG_BBG_MONATLICH);
    kgVorSozial = Math.round(brKg * 0.7);
    kgNachSozial = Math.round(kgVorSozial * (1 - KG_KRANKENGELD_SOZIAL_SATZ));
  }

  const ktgInPhasen = kv === "pkv" ? ktgNetNachPkv : ktgMon;

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
            label: "Weiterzahlung der Bezüge (100 % Netto)",
            sub: "Erste 6 Wochen (Dienstherr)",
            monatl: netto,
            pct: 100,
          }
        : {
            label: "Lohnfortzahlung (100 % Netto)",
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
    const ktgTeil =
      kv === "gkv" && isAngestelltLike
        ? ktgMon
        : kv === "gkv" && isSelbst && gkvKrankengeldJa
          ? ktgMon
          : ktgInPhasen;
    p2mon = (hatGkvKrankengeld ? kgNachSozial : 0) + ktgTeil;
    p2Sub = "Ab Woche 7";
    if (kv === "gkv" && isAngestelltLike) {
      p2Sub =
        ktgMon > 0
          ? "Krankengeld (GKV, netto) + privates KTG"
          : "Krankengeld (GKV) nach Sozialabzug durch die Kasse";
    } else if (kv === "gkv" && isSelbst && gkvKrankengeldJa) {
      p2Sub =
        ktgMon > 0
          ? "Krankengeld (GKV, bis BBG) + privates KTG"
          : "Krankengeld (GKV) nach Sozialabzug — Bemessung bis Beitragsbemessungsgrenze";
    } else if (kv === "gkv" && isSelbst && !gkvKrankengeldJa) {
      p2Sub =
        ktgMon > 0
          ? "Ohne GKV-Krankengeld im Modell — nur privates KTG"
          : "Kein Krankengeld gewählt — prüfen Sie Ihren Tarif (§44 SGB V)";
    } else if (kv === "pkv") {
      p2Sub =
        pkvAb > 0
          ? isSelbst
            ? "Privates KTG abzüglich Ihres PKV-Gesamtbeitrags"
            : "Privates KTG abzüglich PKV-Gesamtbeitrag (nach Entfall des AG-Zuschusses zahlen Sie den vollen Betrag)"
          : "Privates Krankentagegeld";
    } else {
      p2Sub = ktgMon > 0 ? "Privates Krankentagegeld" : "Kein gesetzliches Krankengeld";
    }
  }

  const p2 = {
    label: isBeamter ? "Krankengeld / Bezüge" : "Krankengeld (berechnetes Netto-Krankengeld)",
    sub: p2Sub,
    monatl: p2mon,
    pct: Math.min(100, Math.round((p2mon / netto) * 100)),
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

  /** Phase 3: staatliche EMR (bzw. Ruhegehalt) + private BU — ohne separate Aussteuerungs-Zwischenphase */
  const p3mon = buRente + emSchaetzung;
  let p3Label;
  let p3Sub;
  if (isBeamter) {
    p3Label =
      buRente > 0
        ? "Ruhegehalt (staatlich) + private DU-Absicherung"
        : "Ruhegehalt bei Dienstunfähigkeit";
    p3Sub =
      buRente > 0
        ? "Dauerhaft · geschätztes Ruhegehalt zzgl. Ihrer Angabe zur DU-Vorsorge"
        : "Dauerhaft · pauschal 35 % Netto im Modell (siehe Hinweise)";
  } else if (isAzubi) {
    if (szenario === "unfall") {
      p3Label = buRente > 0 ? "Staatliche EMR + BU-Rente" : "Staatliche Erwerbsminderungsrente (EMR)";
      p3Sub = "Dauerhaft · EMR nach Unfall-Szenario geschätzt";
    } else {
      p3Label = buRente > 0 ? "EMR derzeit 0 € + BU-Rente" : "Staatliche Erwerbsminderungsrente (EMR)";
      p3Sub = "Dauerhaft · 5-Jahres-Wartezeit in der Ausbildung typischerweise noch nicht erfüllt";
    }
  } else {
    p3Label = buRente > 0 ? "Staatliche EMR + BU-Rente" : "Staatliche Erwerbsminderungsrente (EMR)";
    p3Sub =
      szenario === "psyche"
        ? "Dauerhaft · im Modell 0 € EMR bei Psyche-Szenario (§43 SGB VI vereinfacht)"
        : szenario === "herz"
          ? "Dauerhaft · EMR grob ~34 % des Nettos geschätzt"
          : "Dauerhaft · EMR grob ~17 % des Nettos geschätzt";
  }
  const p3 = {
    label: p3Label,
    sub: p3Sub,
    monatl: p3mon,
    pct: Math.min(100, Math.round((p3mon / netto) * 100)),
  };

  const luecke = Math.max(0, netto - p3mon);
  const lueckeKG = Math.max(0, netto - p2mon);

  const empfKTG = lueckeKG > 0 ? Math.max(0, Math.ceil((lueckeKG / 30) / 5) * 5) : 0;
  const empfBU = luecke > 0 ? Math.max(0, Math.round(luecke / 50) * 50) : 0;

  const zuschussPkVSzenario =
    pkvAgZuschussSchaetzungMonat > 0 ? Math.round(pkvAgZuschussSchaetzungMonat * sz.dauer) : 0;
  const gesamtschadenSzenario = Math.round(luecke * sz.dauer) + zuschussPkVSzenario;

  const phasesDisplay = isSelbst ? [p2, p3] : [p1, p2, p3];

  return {
    netto,
    p1,
    p2,
    p3,
    phasesDisplay,
    luecke,
    lueckeKG,
    sz,
    kgBasis: kgNachSozial,
    kgVorSozial,
    ktgMon,
    ktgNetNachPkv,
    pkvAbzugMon: pkvAb,
    pkvAgZuschussSchaetzungMonat,
    emSchaetzung,
    empfKTG,
    empfBU,
    gesamtschadenSzenario,
    grundsicherungOrientierung: null,
    isStudentModus: false,
    hideLohnfortzahlungChart: isSelbst,
    showPkvAgZuschussWarn: isAngestellt && kv === "pkv" && pkvAgZuschussSchaetzungMonat > 0,
    showDrvEmrHinweisSelbst: isSelbst,
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

/**
 * Slide 2 „Status-Check“ — Logik nur für angestellt | beamter | selbst (Selbstständige).
 * `p.beruf` entspricht formData.status im Wizard; azubi/student: neutrales Fallback ohne Zusatzannahmen.
 */
function storyStaatCopyForStatus(beruf) {
  switch (beruf) {
    case "selbst":
      return {
        emoji: "⚖️",
        title: "Volle Eigenverantwortung.",
        text: "Als Selbstständiger entfällt das staatliche Netz fast komplett. Wir kalkulieren jetzt, wie viel privates Tagegeld Sie benötigen, um Ihre laufenden Kosten ohne Umsatz weiterzuzahlen.",
      };
    case "angestellt":
      return {
        emoji: "⚖️",
        title: "Die 6-Wochen-Grenze.",
        text: "Nach 42 Tagen endet die Lohnfortzahlung durch Ihren Arbeitgeber. Wir berechnen jetzt die Differenz zwischen Ihrem Krankengeld und Ihrem gewohnten Netto.",
      };
    case "beamter":
      return {
        emoji: "⚖️",
        title: "Dienstfähigkeit sichern.",
        text: "Ihr Status bietet Schutz, aber bei Dienstunfähigkeit drohen dennoch finanzielle Einbußen. Wir prüfen jetzt Ihren individuellen Ergänzungsbedarf zur Beihilfe.",
      };
    default:
      return {
        emoji: "⚖️",
        title: "Im nächsten Schritt",
        text: "Wir führen die Kalkulation anhand Ihrer Angaben fort.",
      };
  }
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
function makeBUKTGT(C) {
  return {
  page:    { minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif", "--accent": C },
  header:  { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(31,41,55,0.06)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { display: "flex", alignItems: "center", gap: "10px" },
  logoMk:  { width: "28px", height: "28px", borderRadius: "6px", background: C, display: "flex", alignItems: "center", justifyContent: "center" },
  logoTxt: { fontSize: "13px", fontWeight: "600", color: "#111", letterSpacing: "-0.1px" },
  badge:   { fontSize: "11px", fontWeight: "500", color: "#888", letterSpacing: "0.3px", textTransform: "uppercase" },
  prog:    { height: "2px", background: "#f0f0f0" },
  progFil: (w) => ({ height: "100%", width: `${w}%`, background: C, transition: "width 0.4s ease" }),
  hero:    { padding: "32px 24px 16px" },
  label:   { fontSize: "11px", fontWeight: "600", color: "#999", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" },
  h1:      { fontSize: "22px", color: "#111", lineHeight: 1.25, ...CHECKKIT_HERO_TITLE_TYPO },
  body:    { fontSize: "14px", color: "#666", lineHeight: 1.65, marginTop: "6px" },
  section: { padding: "0 24px", marginBottom: "20px" },
  divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
  card:    { border: "1px solid #e8e8e8", borderRadius: "18px", overflow: "hidden" },
  /** Kontakt-Summary: Lücke BU (warn) + zweite Kachel im EU-Box-Stil */
  kpiKontaktLuecke: {
    borderRadius: "16px",
    background: "#FFF7F7",
    border: "1px solid #F2CFCF",
    padding: "12px 14px",
    minWidth: 0,
    flex: "1 1 140px",
  },
  kpiKontaktEu: {
    borderRadius: "14px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(17,24,39,0.06)",
    padding: "12px 14px",
    minWidth: 0,
    flex: "1 1 140px",
  },
  row:     { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
  rowLast: { padding: "14px 16px" },
  fldLbl:  { fontSize: "12px", fontWeight: "600", color: "#444", marginBottom: "6px", display: "block" },
  fldVal:  { fontSize: "20px", fontWeight: "700", color: C, letterSpacing: "-0.5px", marginBottom: "8px" },
  fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
  optRow:  { display: "grid", gap: "8px", marginTop: "6px" },
  footer:  { position: "sticky", bottom: 0, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(31,41,55,0.06)", boxShadow: "0 -6px 20px rgba(17,24,39,0.05)", padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))" },
  btnPrim: (dis) => ({
    width: "100%",
    padding: "13px 20px",
    background: dis ? "#e8e8e8" : C,
    color: dis ? "#aaa" : "#fff",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: dis ? "default" : "pointer",
    transition: "opacity 0.15s",
    letterSpacing: "-0.1px",
    boxShadow: dis ? "none" : "0 8px 20px rgba(26,58,92,0.18)",
  }),
  btnSec:  { width: "100%", padding: "10px", color: "#aaa", fontSize: "13px", marginTop: "6px", cursor: "pointer" },
  bigNum:  (warn) => ({ fontSize: "36px", fontWeight: "700", color: warn ? "#c0392b" : C, letterSpacing: "-1px", lineHeight: 1 }),
  bigLbl:  { fontSize: "12px", color: "#888", marginTop: "4px", fontWeight: "500" },
  detRow:  { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  detLbl:  { fontSize: "13px", color: "#666" },
  detVal:  (hl) => ({ fontSize: "13px", fontWeight: "600", color: hl ? "#c0392b" : "#111" }),
  infoBox: {
    padding: "12px 14px",
    background: "#F6F8FE",
    border: "1px solid #DCE6FF",
    borderRadius: "14px",
    fontSize: "12px",
    color: "#315AA8",
    lineHeight: 1.6,
  },
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
function Header({ phase, total, makler, C }) {
  const pct = total > 0 ? (phase / total) * 100 : 0;
  return (
    <>
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(31,41,55,0.06)",
          padding: "16px 20px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          position: "sticky",
          top: 0,
          zIndex: 100,
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
          <MaklerFirmaAvatarInitials firma={makler.firma} />
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#1F2937",
            letterSpacing: "-0.1px",
            textAlign: "center",
          }}
        >
          {makler.firma}
        </span>
      </div>
      <div style={{ height: "6px", background: "rgba(31,41,55,0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: C,
            borderRadius: "999px",
            transition: "width 0.35s ease",
          }}
        />
      </div>
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
        {summary && <div style={{ ...T.section }}>{summary}</div>}
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
      {summary && <div style={{ ...T.section }}>{summary}</div>}
      <div style={T.section}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[
            { k: "name",  l: "Ihr Name",     t: "text",  ph: "Vor- und Nachname",  req: true },
            { k: "email", l: "Ihre E-Mail",  t: "email", ph: "ihre@email.de",      req: true },
            { k: "tel",   l: "Ihre Nummer",  t: "tel",   ph: "Optional",            req: false, hint: "Optional — für eine schnellere Rückmeldung" },
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
          {valid ? "Absicherung prüfen lassen" : "Bitte füllen Sie alle Pflichtfelder aus"}
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
        {name ? `Vielen Dank, ${name.split(" ")[0]}.` : "Ihre Anfrage wurde gesendet."}
      </div>
      <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, marginBottom: "32px" }}>
        Wir schauen uns Ihr Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.
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
    beamterWiderruf: false,
    kv:       "gkv",
    pkvBeitrag: 400,
    gkvKrankengeldJa: false,
    ktgTag:   0,
    buRente:  0,
    szenario: "psyche",
  });

  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const [wizStep, setWizStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const STEP_IDS = useMemo(() => {
    if (p.beruf === "student") {
      return ["beruf", "brutto", "szenario"];
    }
    const ids = ["beruf", "kv"];
    if (p.kv === "pkv" && p.beruf !== "azubi") ids.push("pkvBeitrag");
    if (p.beruf === "selbst" && p.kv === "gkv") ids.push("selbstGkvKg");
    ids.push("brutto", "ktgBu", "szenario");
    return ids;
  }, [p.kv, p.beruf]);

  /** Intro → Beruf → [Staats-Story nur wenn kein Azubi/Student] → restliche Daten → Bridge → Loader */
  const wizardFlow = useMemo(() => {
    const ids = STEP_IDS;
    const flow = [{ kind: "intro" }];
    if (ids.length === 0) {
      flow.push({ kind: "bridge" });
      return flow;
    }
    flow.push({ kind: "data", sid: ids[0] });
    const showStatusStory = p.beruf !== "azubi" && p.beruf !== "student";
    if (showStatusStory) {
      flow.push({ kind: "storyStaat" });
    }
    for (let i = 1; i < ids.length; i++) {
      flow.push({ kind: "data", sid: ids[i] });
    }
    flow.push({ kind: "bridge" });
    return flow;
  }, [STEP_IDS, p.beruf]);

  const totalWizSteps = wizardFlow.length;

  useEffect(() => {
    if (p.beruf === "azubi" && p.kv === "pkv") {
      setP((x) => ({ ...x, kv: "gkv" }));
    }
  }, [p.beruf, p.kv]);

  useEffect(() => {
    setWizStep((w) => Math.min(w, totalWizSteps));
  }, [totalWizSteps]);

  useCheckScrollToTop([wizStep, phase, ak, danke, loading]);

  const nextWiz = () => {
    if (wizStep < totalWizSteps) setWizStep((w) => w + 1);
  };
  const backWiz = () => {
    if (wizStep > 1) setWizStep((w) => w - 1);
  };
  const goTo = (ph) => {
    setAk((k) => k + 1);
    setPhase(ph);
    if (ph === 1) {
      setWizStep(1);
      setLoading(false);
    }
  };

  const curFlow = wizardFlow[wizStep - 1];
  const sid = curFlow?.kind === "data" ? curFlow.sid : null;

  const R = berechne({
    ...p,
    gkvKrankengeldJa: p.beruf === "selbst" && p.kv === "gkv" ? p.gkvKrankengeldJa : false,
  });
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
      <Header phase={TOTAL_PHASES} total={TOTAL_PHASES} makler={MAKLER} C={C} />
      <DankeScreen name={name} onBack={() => { setDanke(false); goTo(1); }} makler={MAKLER} C={C} />
    </div>
  );

  if (loading) {
    return (
      <div style={{ ...T.page, "--accent": C }} key={ak}>
        <Header phase={totalWizSteps} total={totalWizSteps} makler={MAKLER} C={C} />
        <CheckLoader type="bu" checkmarkColor={C} onComplete={() => { setLoading(false); goTo(2); }} />
      </div>
    );
  }

  // ── Kontakt (nach Ergebnis) ─────────────────────────────────────────────────
  if (phase === 3) return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={4} total={TOTAL_PHASES} makler={MAKLER} C={C} />
      <div style={T.hero}>
        <div style={T.label}>Fast geschafft</div>
        <div style={T.h1}>Wo können wir Sie erreichen?</div>
        <div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit Ihrem Ergebnis.</div>
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
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={T.kpiKontaktLuecke}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#c0392b", letterSpacing: "-0.5px" }}>{fmt(R.luecke)}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Mögliche Lücke</div>
              </div>
              <div style={T.kpiKontaktEu}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: C, letterSpacing: "-0.5px" }}>{fmt(R.netto)}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{R.isStudentModus ? "Ziel-Netto" : "Ihr Netto"}</div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );

  // ── Phase 2: Ergebnis (mobile-first, Swiper + Grid + Accordion) ───────────
  if (phase === 2) {
    const phasen = R.phasesDisplay ?? [R.p1, R.p2, R.p3];

    const isAngLike =
      p.beruf === "angestellt" ||
      p.beruf === "azubi" ||
      (p.beruf === "selbst" && p.kv === "gkv" && p.gkvKrankengeldJa);

    const massiveUnterdeckung = p.buRente < R.netto * 0.5;

    const detailHintRows = [];
    if (p.kv === "gkv" && isAngLike && R.kgBasis > 0) {
      detailHintRows.push({
        key: "kgSozial",
        text: "Vom Krankengeld behält die Kasse direkt Sozialbeiträge ein — Ihr ausgezahltes Krankengeld liegt deshalb unter den 70 % vom Brutto.",
      });
    }
    if (p.beruf === "azubi" && p.szenario !== "unfall") {
      detailHintRows.push({
        key: "azubiWarte",
        text: "Hinweis: Die fünfjährige Wartezeit für die EMR ist während der Ausbildung in der Regel noch nicht erfüllt — im Modell daher 0 € EMR (Ausnahme: Unfall-Szenario).",
      });
    }
    if (p.beruf === "beamter" && p.beamterWiderruf && p.szenario !== "unfall") {
      detailHintRows.push({
        key: "beamterWiderruf",
        text: "Bei Beamten auf Widerruf bzw. in der Probezeit entfällt das Ruhegeld bei Dienstunfähigkeit in der Regel — hier mit 0 € angenommen (Ausnahme z. B. Dienstunfall im gewählten Szenario).",
      });
    }
    if (!R.isStudentModus && p.beruf !== "azubi" && p.brutto < 2500) {
      detailHintRows.push({
        key: "grusi",
        text: "Bei niedrigem Krankengeld kann es zur Verrechnung mit Grundsicherung kommen — ein persönlicher Check lohnt sich.",
      });
    }
    if (R.showPkvAgZuschussWarn && R.pkvAgZuschussSchaetzungMonat > 0) {
      detailHintRows.push({
        key: "pkvAgZuschuss",
        text: `Achtung: Der Arbeitgeberzuschuss zur PKV von ca. ${fmt(R.pkvAgZuschussSchaetzungMonat)} entfällt nach 6 Wochen — Sie tragen die Kosten allein. Der geschätzte Mehrbedarf ist in den Szenario-Kosten berücksichtigt.`,
      });
    }
    if (!R.isStudentModus && p.ktgTag === 0 && p.kv === "gkv") {
      detailHintRows.push({
        key: "ktgMin",
        text: "Sie stützen sich nur auf das gesetzliche Krankengeld — ein zusätzliches Krankentagegeld schließt oft die größte Lücke in den ersten Monaten.",
      });
    }
    if (R.luecke > 1500) {
      detailHintRows.push({
        key: "haus",
        text: "Ihre langfristige Lücke entspricht in der Größenordnung einer typischen Finanzrate fürs Eigenheim — dieses Risiko tragen Sie ohne Absicherung allein.",
      });
    }

    const secondaryEinordnung = pickSecondaryEinordnungHint(p, R);
    const omitDetailKeys = new Set();
    if (secondaryEinordnung?.type === "emNull") omitDetailKeys.add("azubiWarte");
    if (secondaryEinordnung?.type === "beamterWiderruf") omitDetailKeys.add("beamterWiderruf");
    const accordionDetailHints = detailHintRows.filter((h) => !omitDetailKeys.has(h.key));

    const showEinordnungSection = R.luecke > 0 || secondaryEinordnung != null;
    const showDetailsAccordion = accordionDetailHints.length > 0;

    const toggleLegal = (id) => setLegalOpen((x) => (x === id ? null : id));

    return (
      <div style={{ ...T.page, "--accent": C, background: "#ffffff" }} key={ak} className="fade-in">
        <Header phase={2} total={TOTAL_PHASES} makler={MAKLER} C={C} />

        <div style={{ paddingBottom: "120px" }}>
          {/* Hero: große Zahl, darunter Pill */}
          <div style={{ ...T.resultHero, paddingTop: "36px", paddingBottom: "28px", background: "#ffffff" }}>
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
                  ? "Lücke zwischen Ziel-Netto und privater Absicherung (staatliche EMR im Modell 0 €)"
                  : "Ziel-Netto im Modell durch private Absicherung gedeckt"
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
                    {R.showPkvAgZuschussWarn && R.pkvAgZuschussSchaetzungMonat > 0 && (
                      <span style={{ display: "block", marginTop: "4px" }}>
                        zzgl. geschätzt {fmt(R.pkvAgZuschussSchaetzungMonat)}/Mon. entfallener AG-PKV-Zuschuss × {R.sz.dauer} Mon.
                      </span>
                    )}
                  </span>
                </SmartHintCard>
              )}
              {secondaryEinordnung && (
                <SmartHintCard icon="💡">{secondaryEinordnung.text}</SmartHintCard>
              )}
              {R.showDrvEmrHinweisSelbst && (
                <SmartHintCard icon="📋">
                  Hinweis: Anspruch auf Erwerbsminderungsrente besteht nur, wenn Sie pflichtversichert in der DRV sind oder freiwillig einzahlen.
                </SmartHintCard>
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
                const emrIdx = phasen.length - 1;
                const showEmZeroWarn = i === emrIdx && (R.emSchaetzung === 0 || R.isStudentModus);
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
                    <div style={BUKTG_PHASE2_TIMELINE_TRACK}>
                      <div
                        style={{
                          height: "100%",
                          width: `${barW}%`,
                          ...BUKTG_PHASE2_TIMELINE_FILL,
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
                            ? "Wartezeit von 5 Jahren noch nicht erfüllt. EMR in diesem Schritt 0 € — Ausnahme: Unfall-Szenario."
                            : R.isStudentModus
                              ? "Keine gesetzliche EMR aus Erwerbstätigkeit modelliert — bitte private Vorsorge (z. B. BU) prüfen."
                              : "Achtung: EMR in diesem Schritt 0 € — hohes Absicherungsrisiko bis zur gesetzlichen Rente."}
                        </SmartHintCard>
                      </div>
                    )}
                    {diff > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 12px",
                          borderRadius: "18px",
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
                  Sichert die Krankengeld-Phase (ab Woche 7)
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
                  Sichert Phase 3 (EMR) dauerhaft
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
                    {accordionDetailHints.map((h) => (
                      <p key={h.key} style={{ marginBottom: "10px" }}>
                        {h.text}
                      </p>
                    ))}
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
                  Vereinfachte Einordnung auf Basis Ihrer Angaben — Angestellte/Beamte/Auszubildende: (1) Lohnfortzahlung bzw. 100 % Netto in den ersten Wochen, (2) Krankengeldphase ab Woche 7 (GKV: 70 % des relevanten Bruttos bis BBG Krankengeld, orientierend 4.068 €/Mon. 2026, abzüglich Sozialabzug durch die Kasse ca. 12,2–12,5 %; zzgl. privates KTG falls angegeben), (3) langfristig staatliche EMR (bzw. Ruhegehalt bei Beamten) plus private BU/DU. Selbstständige GKV: im Chart ohne Phase 1 — Start mit Krankengeldphase (Tag 43 bzw. Tarif); Krankengeld nur bei gewähltem Anspruch, Bemessung bis BBG; sonst Phase 2 = 0 €. Netto = Brutto bzw. Gewinn bzw. Bezüge × 0,72 (Schätzwert). Auszubildende: nur GKV im Modell; Phasen 1–2 wie Angestellte; EMR in Phase 3 im Modell 0 € außer Szenario „Unfall“. Student/Schüler: Ziel-Netto; keine Lohnfortzahlung/KG/EMR aus Erwerbstätigkeit, Phase 3 = private BU (0 € staatlich). Beamte: Bezüge in Phase 1–2; Phase 3 Ruhegehalt pauschal 35 % Netto, außer Widerruf/Probe ohne Dienstunfall (0 €). PKV Angestellte: Gesamtbeitrag inkl. AG-Zuschuss; nach 6 Wochen entfällt der Zuschuss — im Szenario mit angenommen. PKV sonst: KTG abzüglich PKV-Eigenanteil ab Woche 7. · Grundlage §47 SGB V. EMR szenariobasiert (Psyche 0 €, Herz 34 % Netto, sonst 17 % Netto) · vereinfacht, §43 SGB VI.
                  <span style={{ color: "#666" }}> Keine Rechtsberatung.</span>
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

  // ── Phase 1: Story + dynamischer Flow + Bridge ─────────────────────────────
  return (
    <div style={{ ...T.page, "--accent": C }} key={ak} className="fade-in">
      <Header phase={wizStep} total={totalWizSteps} makler={MAKLER} C={C} />

      {curFlow?.kind === "intro" && (
        <>
          <CheckKitStoryHero
            emoji="🛡️"
            title="Ihr Einkommen im Fokus."
            text="Ihre Arbeitskraft ist Ihr wertvollstes Gut. Wir berechnen in 2 Minuten, wie viel Geld Ihnen bei langer Krankheit oder Berufsunfähigkeit wirklich zum Leben bleibt."
          />
          <Footer onNext={nextWiz} nextLabel="Analyse starten" T={T} />
        </>
      )}

      {curFlow?.kind === "storyStaat" && (() => {
        const st = storyStaatCopyForStatus(p.beruf);
        return (
        <>
          <CheckKitStoryHero emoji={st.emoji} title={st.title} text={st.text} />
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter zur Kalkulation" T={T} />
        </>
        );
      })()}

      {curFlow?.kind === "bridge" && (
        <>
          <CheckKitStoryHero
            hideFooterSpacer
            emoji="🚀"
            title="Ihre Analyse ist bereit."
            text={`Basierend auf Ihren Angaben von ${fmt(R.netto)} Netto haben wir Ihre Versorgungslücke präzise ermittelt.`}
          />
          <div style={{ padding: "0 24px 8px", ...CHECKKIT2026.storyContentWrap }}>
            {[
              "Berechnung der monatlichen Netto-Lücke.",
              "Ermittlung des notwendigen Krankentagegeldes.",
              "Strategie zur dauerhaften Einkommenssicherung.",
            ].map((line) => (
              <div
                key={line}
                style={{
                  ...CHECKKIT2026.storyBody,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  marginBottom: 16,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }} aria-hidden>
                  ✅
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          <div style={{ height: CHECKKIT2026.footerSpacerPx }} />
          <div style={T.footer}>
            <button type="button" style={T.btnPrim(false)} onClick={() => setLoading(true)}>
              Ergebnis jetzt anzeigen
            </button>
            <button type="button" style={T.btnSec} onClick={backWiz}>
              Zurück
            </button>
          </div>
        </>
      )}

      {sid === "beruf" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>Wie sind Sie aktuell beschäftigt?</div>
            <div style={T.body}>Davon hängt ab, welche gesetzlichen Leistungen greifen.</div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { v: "angestellt", l: "Angestellt", d: "Meist GKV- oder PKV-pflichtversichert.", emoji: "💼" },
                { v: "azubi", l: "Azubi", d: "Aktuell oft 0 € staatlicher Schutz.", emoji: "🛠️" },
                { v: "student", l: "Student", d: "Ziel-Einkommen nach dem Abschluss.", emoji: "🎓" },
                { v: "selbst", l: "Selbstständig", d: "Eigenverantwortlich ohne Pflichtschutz.", emoji: "🚀" },
                { v: "beamter", l: "Beamte", d: "Mit Beihilfe & Dienstunfähigkeit (DU).", emoji: "🏛️" },
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
                    label="Auf Widerruf / Probezeit (BaP)"
                    description="Bei DU meist kein Ruhegehalt (außer Dienstunfall) — Entlassung und Nachversicherung in der Rente sind typisch. Modell: 0 € Ruhegeld, außer Szenario „Unfall“."
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
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "kv" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
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
              {(p.beruf === "azubi"
                ? [
                    {
                      v: "gkv",
                      l: "Gesetzlich (GKV)",
                      d: `Ausbildung: Versicherungspflicht — Krankengeld wie bei Angestellten (BBG KG orientierend ${KG_BBG_MONATLICH.toLocaleString("de-DE")} €/Mon.)`,
                      emoji: "🏥",
                    },
                  ]
                : [
                    {
                      v: "gkv",
                      l: "Gesetzlich (GKV)",
                      d:
                        p.beruf === "beamter"
                          ? `Orientierung: BBG KG ${KG_BBG_MONATLICH.toLocaleString("de-DE")} €/Mon. — Ihre Bezüge laufen im Rechner gesondert`
                          : p.beruf === "selbst"
                            ? `Krankengeld nur mit gewählter Option — Bemessung bis BBG (orientierend ${KG_BBG_MONATLICH.toLocaleString("de-DE")} €/Mon.)`
                            : `Krankengeld: ca. 70 % des relevanten Bruttos (BBG KG orientierend ${KG_BBG_MONATLICH.toLocaleString("de-DE")} €/Mon.)`,
                      emoji: "🏥",
                    },
                    { v: "pkv", l: "Privat (PKV)", d: "Kein gesetzliches Krankengeld — nur privates KTG sichert ab", emoji: "🔒" },
                  ]
              ).map(({ v, l, d, emoji }) => (
                <SelectionCard key={v} value={v} label={l} description={d}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>}
                  selected={p.kv === v} accent={C} onClick={() => set("kv", v)} />
              ))}
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "selbstGkvKg" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>Haben Sie in Ihrem GKV-Tarif Anspruch auf Krankengeld gewählt?</div>
            <div style={T.body}>
              Ohne diese Option gibt es im Krankheitsfall in der Regel kein gesetzliches Krankengeld — nur privates KTG zählt.
            </div>
          </div>
          <div style={T.section}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <SelectionCard
                value="ja"
                label="Ja"
                description="Sie haben Krankengeld in der GKV mitgewählt (z. B. nach §44 SGB V) — Bemessung im Modell bis zur BBG."
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>✓</span>}
                selected={p.gkvKrankengeldJa}
                accent={C}
                onClick={() => set("gkvKrankengeldJa", true)}
              />
              <SelectionCard
                value="nein"
                label="Nein"
                description="Kein Anspruch auf GKV-Krankengeld modelliert — Phase Krankengeld basiert nur auf privatem KTG."
                icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>—</span>}
                selected={!p.gkvKrankengeldJa}
                accent={C}
                onClick={() => set("gkvKrankengeldJa", false)}
              />
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "pkvBeitrag" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>
              {p.beruf === "angestellt"
                ? "Wie hoch ist Ihr privater Krankenversicherungs-Beitrag (Gesamtbetrag)?"
                : "Wie hoch ist Ihr monatlicher PKV-Beitrag?"}
            </div>
            <div style={T.body}>
              {p.beruf === "angestellt"
                ? "Gesamtbetrag inkl. Arbeitgeberzuschuss — ab Woche 7 entfällt der Zuschuss; der volle Betrag muss aus Ihrem KTG finanziert werden."
                : p.beruf === "beamter"
                  ? "Eigenanteil ohne Zuschuss des Dienstherren — ab Woche 7 der Krankheit voll aus Ihrem Tagegeld."
                  : "Gesamtbetrag — wird vom privaten Krankentagegeld abgezogen."}
            </div>
          </div>
          <div style={T.section}>
            <SliderCard
              label={
                p.beruf === "angestellt"
                  ? "PKV-Gesamtbetrag (Monat, inkl. AG-Zuschuss)"
                  : "PKV-Beitrag (Monat)"
              }
              value={p.pkvBeitrag}
              min={0}
              max={1200}
              step={10}
              unit="€"
              display={p.pkvBeitrag > 0 ? "wird vom KTG abgezogen" : "Bitte wählen Sie einen realistischen Wert"}
              accent={C}
              onChange={(v) => set("pkvBeitrag", v)}
              hint={
                p.beruf === "angestellt"
                  ? "Summe aus Ihrem Anteil und Arbeitgeberzuschuss (Gesamt-PKV pro Monat)"
                  : "Inkl. ggf. Pflege- und Krankenversicherungsanteil"
              }
            />
            {p.beruf !== "selbst" && (
              <SmartHintCard>
                {p.beruf === "beamter"
                  ? "Achtung: Der Zuschuss des Dienstherren zur PKV entfällt nach 6 Wochen. Ihr Krankentagegeld muss auch den laufenden KV-Beitrag decken."
                  : "Nach 6 Wochen tragen Sie den vollen Gesamtbeitrag allein — im Ergebnis weisen wir auf den entfallenden Arbeitgeberzuschuss hin."}
              </SmartHintCard>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "brutto" && p.beruf === "student" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>Welches Netto-Einkommen streben Sie nach dem Studium an?</div>
            <div style={T.body}>
              Fokus: keine gesetzliche EMR aus Erwerbstätigkeit im Modell — private Vorsorge (z. B. BU) schließt die Lücke.
            </div>
          </div>
          <div style={T.section}>
            <SliderCard
              label="Ziel-Netto (Monat)"
              value={p.brutto}
              min={800}
              max={8500}
              step={50}
              unit="€"
              display={p.brutto > 0 ? `${fmt(p.brutto)} Ziel-Netto` : ""}
              accent={C}
              onChange={(v) => set("brutto", v)}
              hint="Direkt als Netto — ohne Brutto-Umrechnung"
            />
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "brutto" && p.beruf !== "student" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>
              {p.beruf === "selbst"
                ? "Wie hoch ist Ihr monatlicher Gewinn (vor Steuern)?"
                : p.beruf === "beamter"
                  ? "Wie hoch sind Ihre monatlichen Dienstbezüge (Brutto)?"
                  : p.beruf === "azubi"
                    ? "Wie hoch ist Ihre monatliche Ausbildungsvergütung (Brutto)?"
                    : "Wie hoch ist Ihr monatliches Brutto-Einkommen?"}
            </div>
            <div style={T.body}>
              {p.beruf === "selbst"
                ? "Grundlage für Krankengeld (GKV, falls gewählt) bis BBG und für Ihre Netto-Schätzung (× 0,72)."
                : p.beruf === "beamter"
                  ? "Relevant für Ihre Beihilfe und Dienstunfähigkeit."
                  : p.beruf === "azubi"
                    ? "Grundlage für Ihren (noch) geringen staatlichen Schutz."
                    : "Basis für die Berechnung Ihres Krankengeldes."}
            </div>
          </div>
          <div style={T.section}>
            <SliderCard
              label={
                p.beruf === "selbst"
                  ? "Monatlicher Gewinn (vor Steuern)"
                  : p.beruf === "beamter"
                    ? "Monatliche Dienstbezüge (Brutto)"
                    : p.beruf === "azubi"
                      ? "Monatliche Ausbildungsvergütung (Brutto)"
                      : "Monatliches Brutto-Einkommen"
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
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "ktgBu" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>Was haben Sie bereits abgesichert?</div>
            <div style={T.body}>Beide Felder sind optional — geben Sie 0 ein, wenn kein Vertrag vorhanden ist.</div>
          </div>
          <div style={T.section}>
            {p.beruf === "selbst" && (
              <SmartHintCard>
                Anders als Angestellte haben Sie keinen Anspruch auf Lohnfortzahlung durch einen Arbeitgeber — in den ersten Wochen einer Krankheit fehlt dieser Betrag vollständig, sofern Sie nicht privat vorsorgen. Prüfen Sie eine Absicherung ab dem 15. oder 43. Tag.
              </SmartHintCard>
            )}
            {p.kv === "pkv" && p.beruf !== "selbst" && (
              <SmartHintCard>
                {p.beruf === "beamter"
                  ? "Achtung: Der Zuschuss des Dienstherren zur PKV entfällt nach 6 Wochen. Ihr Krankentagegeld muss auch Ihren KV-Beitrag decken."
                  : "Achtung: Der Arbeitgeberzuschuss zur PKV entfällt nach 6 Wochen — im Ergebnis gesondert ausgewiesen."}
              </SmartHintCard>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <SliderCard label="Krankentagegeld (KTG)" value={p.ktgTag} min={0} max={150} step={5} unit="€/Tag"
                display={p.ktgTag > 0 ? `= ${fmt(p.ktgTag * 30)}/Monat` : "Kein KTG vorhanden"}
                accent={C} onChange={(v) => set("ktgTag", v)} hint="0, wenn kein Vertrag vorhanden" />
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
                hint={p.beruf === "beamter" ? "0, wenn keine DU-Absicherung vorhanden" : "0, wenn keine BU vorhanden"}
              />
            </div>
            {p.ktgTag === 0 && p.kv === "gkv" && (
              <div style={{ marginTop: "12px" }}>
                <SmartHintCard>
                  Sie verlassen sich rein auf das gesetzliche Minimum beim Einkommen — ein zusätzliches Krankentagegeld ist oft der schnellste Hebel.
                </SmartHintCard>
              </div>
            )}
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}

      {sid === "szenario" && (
        <>
          <div style={T.hero}>
            <div style={T.label}>Einkommensabsicherung · {wizStep} / {totalWizSteps}</div>
            <div style={T.h1}>Welches Szenario beschäftigt Sie am meisten?</div>
          </div>
          <div style={T.section}>
            {p.szenario === "psyche" && (
              <SmartHintCard>
                Wussten Sie? Psychische Erkrankungen sind mit Ø 42 Monaten die längsten Leistungsfälle — weit über die typische Krankengeld-Dauer von 18 Monaten hinaus.
              </SmartHintCard>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {SZENARIEN.map((sz) => (
                <SelectionCard key={sz.id} value={sz.id} label={sz.label}
                  description={`${sz.desc} · Ø ${sz.dauer} Mon.`}
                  icon={<span style={{ fontSize: "20px", lineHeight: 1 }}>{sz.emoji}</span>}
                  selected={p.szenario === sz.id} accent={C} onClick={() => set("szenario", sz.id)} />
              ))}
            </div>
          </div>
          <div style={{ height: "120px" }} />
          <Footer onNext={nextWiz} onBack={backWiz} nextLabel="Weiter" T={T} />
        </>
      )}
    </div>
  );
}
