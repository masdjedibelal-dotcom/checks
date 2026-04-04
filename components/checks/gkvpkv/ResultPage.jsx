/**
 * GKV/PKV-Ergebnis — BUKTG-Ergebnisschema: Hero, Duell-Karten (GKV/PKV),
 * Archiv-Accordion, Footer. Fünf Ergebnis-Pfade über `resultPath`. Sie-Form.
 */

"use client";

import { useState } from "react";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";
import { CheckHeaderPhoneButton } from "@/components/checks/CheckHeaderPhoneButton";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
import { useMakler } from "@/components/ui/MaklerContext";

const JAEG_MONAT = 6450;

/** Monatsbeträge: ganze Euro, mit „ca.“ */
function fmtCaEuro(n) {
  const v = Math.round(Math.abs(Number(n) || 0));
  return `ca. ${v.toLocaleString("de-DE")} €`;
}

/**
 * @typedef {'pflicht'|'beamte'|'pkv_fokus'|'individuell'|'gkv_familie'} GkvPkvResultPath
 */

function formatIncomeLimitEur() {
  return `ca. ${JAEG_MONAT.toLocaleString("de-DE")} €`;
}

/** @param {object} p */
function smartVars(p) {
  const incomeLimit = formatIncomeLimitEur();
  const k = p.kinderImHaushalt;
  let childrenCount = "Ihren Kindern";
  if (k === 1) childrenCount = "einem Kind";
  else if (k === 2) childrenCount = "zwei Kindern";
  else if (k === 3) childrenCount = "drei oder mehr Kindern";
  return { incomeLimit, childrenCount };
}

function tpl(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : `{${key}}`));
}

/**
 * Ermittelt den Ergebnis-Pfad aus den Wizard-Daten (5 Pfade).
 *
 * - **pflicht:** Angestellte unter 6.450 € brutto (JAEG)
 * - **beamte:** alle Beamte
 * - **gkv_familie:** Partner & Kinder, 3+ Kinder im Haushalt
 * - **individuell:** Partner & Kinder, 1–2 Kinder, und (Angestellte ≥ JAEG oder Selbstständige)
 * - **pkv_fokus:** Angestellte ≥ JAEG oder Selbstständige *ohne* den Familien-Pfad oben (ohne Kinder bzw. nicht partner_kinder mit 1–2 Kindern)
 *
 * @param {object} p
 * @returns {GkvPkvResultPath}
 */
export function resolveGkvPkvResultPath(p) {
  if (p.beruf === "beamter") return "beamte";
  if (p.beruf === "angestellt" && p.brutto < JAEG_MONAT) return "pflicht";

  const mitKindern = p.familiensituation === "partner_kinder";
  const k = p.kinderImHaushalt;

  if (mitKindern && k === 3) return "gkv_familie";
  if (
    mitKindern &&
    (k === 1 || k === 2) &&
    ((p.beruf === "angestellt" && p.brutto >= JAEG_MONAT) || p.beruf === "selbst")
  ) {
    return "individuell";
  }

  return "pkv_fokus";
}

const GKV_COLOR = "#059669";

/**
 * Headline + Fließtext wie im Hero ohne Ersparnis-Zahl — für die Zeile unter dem Zahlen-Hero
 * (ersetzt „Pfad · R.subline“).
 */
function gkvPkvHeroTextWithoutSavings({ beruf, dreiPlusKinder, kinderN, heroGkvFokus, heroPkvFokus, copy }) {
  if (beruf === "beamter") {
    return {
      title: "PKV passt zu Ihrer Situation",
      body: "Als Beamte/r übernimmt Ihr Dienstherr 50–70 % der Kosten — die PKV deckt den Rest günstig ab.",
    };
  }
  if (heroGkvFokus) {
    return {
      title: dreiPlusKinder ? "GKV ist für Sie günstiger" : "GKV passt besser zu Ihnen",
      body: dreiPlusKinder
        ? `Mit ${kinderN} Kindern überwiegt tendenziell die GKV — ein Haushaltsbeitrag statt mehrerer PKV-Einzelverträge.`
        : "Auf Basis Ihrer Situation spricht tendenziell mehr für die GKV — vor allem bei Beitragslogik und Mitversicherung.",
    };
  }
  if (heroPkvFokus) {
    return {
      title: kinderN > 0 ? "Kommt auf Ihre Familie an" : "Tendenz: PKV lohnt sich",
      body:
        kinderN > 0
          ? `Mit ${kinderN} Kind${kinderN === 1 ? "" : "ern"} lohnt ein genauer Vergleich — GKV-Familienversicherung vs. mehrere PKV-Verträge.`
          : "Tendenziell ist die PKV für Ihre Situation wirtschaftlich attraktiver — konkrete Tarife klären sich im persönlichen Gespräch.",
    };
  }
  return {
    title: `Tendenz: ${copy.heroH1}`,
    body: copy.heroSubline,
  };
}

/**
 * Inhalte je Pfad: kurze H1, Subline, Duell-Karten (Bullets: ok = Vorteil/Check, neg|hinweis = dezenter Punkt).
 * Platzhalter: {incomeLimit}, {childrenCount}
 */
const pathContent = {
  pflicht: {
    heroH1: "GKV-Pflicht",
    heroSubline:
      "Unter der gesetzlichen Pflichtgrenze für Angestellte bleiben Sie in der GKV — ein Wechsel in die PKV ist derzeit ausgeschlossen. Mit Zusatzbausteinen werten Sie Ihre Versorgung dennoch auf.",
    gkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Gesetzlich garantierte Basisversorgung." },
        { kind: "ok", text: "Beitrag richtet sich nach Einkommen." },
        { kind: "ok", text: "Kinder oft beitragsfrei mitversichert." },
        { kind: "ok", text: "Arbeitgeber beteiligt sich am Beitrag." },
      ],
      beitrag: [
        { kind: "ok", text: "Beitrag richtet sich nach Einkommen." },
        { kind: "ok", text: "Arbeitgeber beteiligt sich am Beitrag." },
      ],
      leistung: [
        { kind: "ok", text: "Gesetzlich garantierte Basisversorgung." },
        { kind: "ok", text: "Kinder oft beitragsfrei mitversichert." },
      ],
    },
    pkv: {
      tagline: "Nicht möglich",
      badge: "Derzeit nicht möglich",
      border: "caution",
      bullets: [
        { kind: "neg", text: "Wechsel gesetzlich ausgeschlossen." },
        { kind: "hinweis", text: "Zusatz für Zahn und Klinik möglich." },
        { kind: "hinweis", text: "GKV-Leistung mit Zusatz stärken." },
      ],
      beitrag: [{ kind: "neg", text: "Wechsel gesetzlich ausgeschlossen." }],
      leistung: [
        { kind: "hinweis", text: "Zusatz für Zahn und Klinik möglich." },
        { kind: "hinweis", text: "GKV-Leistung mit Zusatz stärken." },
      ],
    },
  },
  beamte: {
    heroH1: "PKV naheliegend",
    heroSubline:
      "Als Beamte/r prägt Ihr Beihilfe-Anspruch die Kosten — die private Krankenversicherung ist auf die typischen Restkosten zugeschnitten und oft sehr günstig.",
    gkv: {
      tagline: "Unwirtschaftlich",
      badge: "Unwirtschaftlich",
      border: "muted",
      bullets: [
        { kind: "neg", text: "Voller Beitrag meist ohne Beihilfe." },
        { kind: "neg", text: "Kein Dienstherr am GKV-Beitrag." },
        { kind: "neg", text: "Engerer Katalog als bei PKV." },
      ],
      beitrag: [
        { kind: "neg", text: "Voller Beitrag meist ohne Beihilfe." },
        { kind: "neg", text: "Kein Dienstherr am GKV-Beitrag." },
      ],
      leistung: [{ kind: "neg", text: "Engerer Katalog als bei PKV." }],
    },
    pkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Restkosten nach Beihilfe abgedeckt." },
        { kind: "ok", text: "Niedrige Beiträge dank Beihilfe." },
        { kind: "ok", text: "Chefarzt und Einbettzimmer tarifabhängig." },
        { kind: "ok", text: "Kinder günstig mit Beihilfe absicherbar." },
      ],
      beitrag: [{ kind: "ok", text: "Niedrige Beiträge dank Beihilfe." }],
      leistung: [
        { kind: "ok", text: "Restkosten nach Beihilfe abgedeckt." },
        { kind: "ok", text: "Chefarzt und Einbettzimmer tarifabhängig." },
        { kind: "ok", text: "Kinder günstig mit Beihilfe absicherbar." },
      ],
    },
  },
  pkv_fokus: {
    heroH1: "PKV naheliegend",
    heroSubline:
      "Sie sind nicht GKV-pflichtig bzw. oberhalb der Pflichtgrenze — hier zählen Beitragshöhe, Leistungsumfang und langfristige Stabilität im direkten Vergleich.",
    gkv: {
      tagline: "Teuer",
      badge: "GKV-Höchstbeitrag",
      border: "muted",
      bullets: [
        { kind: "neg", text: "Höchstbeitrag fällig." },
        { kind: "neg", text: "Leistungen gesetzlich änderbar." },
        { kind: "neg", text: "Oft lange Facharzt-Wartezeiten." },
      ],
      beitrag: [{ kind: "neg", text: "Höchstbeitrag fällig." }],
      leistung: [
        { kind: "neg", text: "Leistungen gesetzlich änderbar." },
        { kind: "neg", text: "Oft lange Facharzt-Wartezeiten." },
      ],
    },
    pkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Oft günstiger als GKV-Höchstbetrag." },
        { kind: "ok", text: "Leistungen vertraglich garantiert." },
        { kind: "ok", text: "Altersrückstellungen für stabilere Beiträge." },
        { kind: "ok", text: "Freie Arzt- und Klinikwahl." },
      ],
      beitrag: [
        { kind: "ok", text: "Oft günstiger als GKV-Höchstbetrag." },
        { kind: "ok", text: "Altersrückstellungen für stabilere Beiträge." },
      ],
      leistung: [
        { kind: "ok", text: "Leistungen vertraglich garantiert." },
        { kind: "ok", text: "Freie Arzt- und Klinikwahl." },
      ],
    },
  },
  individuell: {
    heroH1: "Individueller Familien-Check",
    heroSubline:
      "Mit {childrenCount} stehen Familienmitversicherung (GKV) und mehrere PKV-Tarife zur Wahl — hier lohnt ein klarer Kosten- und Leistungsabgleich.",
    gkv: {
      tagline: "Solidarisch",
      badge: "Solidarisch",
      border: "compare",
      bullets: [
        { kind: "ok", text: "Kinder beitragsfrei mitversichert." },
        { kind: "ok", text: "Beitrag vom Einkommen abhängig." },
        { kind: "ok", text: "Ein Haushaltsbeitrag statt vieler Tarife." },
      ],
      beitrag: [
        { kind: "ok", text: "Beitrag vom Einkommen abhängig." },
        { kind: "ok", text: "Ein Haushaltsbeitrag statt vieler Tarife." },
      ],
      leistung: [{ kind: "ok", text: "Kinder beitragsfrei mitversichert." }],
    },
    pkv: {
      tagline: "Leistungsstark",
      badge: "Leistungsstark",
      border: "compare",
      bullets: [
        { kind: "ok", text: "Hohe Versorgung für die Familie." },
        { kind: "ok", text: "Eigenbeitrag pro Kind fällig." },
        { kind: "ok", text: "Schnellere Termine je nach Tarif." },
        { kind: "neutral", text: "Gesundheitsprüfung und Zuschläge möglich." },
      ],
      beitrag: [
        { kind: "ok", text: "Eigenbeitrag pro Kind fällig." },
        { kind: "neutral", text: "Gesundheitsprüfung und Zuschläge möglich." },
      ],
      leistung: [
        { kind: "ok", text: "Hohe Versorgung für die Familie." },
        { kind: "ok", text: "Schnellere Termine je nach Tarif." },
      ],
    },
  },
  gkv_familie: {
    heroH1: "GKV-Wirtschaftlich",
    heroSubline:
      "Mit drei oder mehr Kindern ist die Familienversicherung in der GKV meist der stärkste Hebel — ein Haushaltsbeitrag statt vieler PKV-Einzelverträge.",
    gkv: {
      tagline: "Wirtschaftlich",
      badge: "Wirtschaftlich sinnvoll",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Alle Kinder kostenfrei mitversichert." },
        { kind: "ok", text: "Beitrag bis Höchstbetrag gedeckelt." },
        { kind: "ok", text: "Ideal für Einverdiener-Haushalte." },
        { kind: "ok", text: "Leistungen gesetzlich mit Zusatz erweiterbar." },
      ],
      beitrag: [
        { kind: "ok", text: "Beitrag bis Höchstbetrag gedeckelt." },
        { kind: "ok", text: "Ideal für Einverdiener-Haushalte." },
      ],
      leistung: [
        { kind: "ok", text: "Alle Kinder kostenfrei mitversichert." },
        { kind: "ok", text: "Leistungen gesetzlich mit Zusatz erweiterbar." },
      ],
    },
    pkv: {
      tagline: "Kostenintensiv",
      badge: "Kostenintensiv",
      border: "caution",
      bullets: [
        { kind: "neg", text: "Hohe Fixkosten vieler Einzelverträge." },
        { kind: "neg", text: "Gesamtkosten oft über GKV-Niveau." },
        { kind: "hinweis", text: "GKV plus Zusatz oft sinnvoller." },
      ],
      beitrag: [
        { kind: "neg", text: "Hohe Fixkosten vieler Einzelverträge." },
        { kind: "neg", text: "Gesamtkosten oft über GKV-Niveau." },
      ],
      leistung: [{ kind: "hinweis", text: "GKV plus Zusatz oft sinnvoller." }],
    },
  },
};

/**
 * @param {GkvPkvResultPath} path
 * @param {object} p
 */
function resolvePathCopy(path, p) {
  const raw = pathContent[path] || pathContent.pkv_fokus;
  const v = smartVars(p);
  return {
    heroH1: tpl(raw.heroH1, v),
    heroSubline: tpl(raw.heroSubline, v),
    gkv: raw.gkv,
    pkv: raw.pkv,
  };
}

/** PKV-Kartenzeile: Alter (Orientierung). */
function pkvAlterFaktorText(alter) {
  const a = Number(alter) || 0;
  if (a < 35) return "Jetzt einsteigen — günstigste Einstiegstarife";
  if (a < 50) return "Guter Zeitpunkt — Rückstellungen bereits aufgebaut";
  return "Prüfen ob Wechsel noch wirtschaftlich sinnvoll";
}

const FAKTOR_ZEILE_STYLE = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "12px",
  color: "#6B7280",
  padding: "4px 0",
  gap: "8px",
};

function FaktorFooter({ rows }) {
  return (
    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: "12px", paddingTop: "10px" }}>
      {rows.map(([left, right], i) => (
        <div key={i} style={FAKTOR_ZEILE_STYLE}>
          <span style={{ flexShrink: 0 }}>{left}</span>
          <span style={{ textAlign: "right", marginLeft: "8px" }}>{right}</span>
        </div>
      ))}
    </div>
  );
}

const COMPARE_SECTION_LBL = {
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#6B7280",
  marginBottom: "8px",
};

/** @param {'primary'|'muted'|'compare'|'caution'} border */
function cardBorderStyle(border) {
  switch (border) {
    case "primary":
      return {
        border: "2px solid var(--primary)",
        boxShadow: "0 8px 28px color-mix(in srgb, var(--primary) 14%, transparent)",
      };
    case "compare":
      return {
        border: "2px solid color-mix(in srgb, var(--primary) 28%, transparent)",
        boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 8%, transparent)",
      };
    case "caution":
      return {
        border: "1px solid #E8D4C4",
        boxShadow: "0 4px 16px rgba(192, 57, 43, 0.06)",
      };
    default:
      return { border: "1px solid rgba(17,24,39,0.08)", boxShadow: "none" };
  }
}

/** @param {'primary'|'muted'|'compare'|'caution'} tone */
function badgeStyle(tone) {
  if (tone === "primary") {
    return { background: "var(--primary)", color: "#fff", border: "none" };
  }
  if (tone === "compare") {
    return {
      background: "color-mix(in srgb, var(--primary) 12%, transparent)",
      color: "var(--primary)",
      border: "1px solid color-mix(in srgb, var(--primary) 32%, transparent)",
    };
  }
  if (tone === "caution") {
    return { background: "#FFF6F5", color: "#9A3412", border: "1px solid #F2D4D0" };
  }
  return { background: "#f0f0f0", color: "#666", border: "1px solid #e8e8e8" };
}

function CompareCard({ label, tagline, color, bg, beitrag, leistung, border, badge, footer, T }) {
  const b = cardBorderStyle(border);
  const badgeT =
    border === "primary" ? "primary" : border === "compare" ? "compare" : border === "caution" ? "caution" : "muted";
  const bs = badgeStyle(badgeT);

  const renderRows = (rows) =>
    rows.map((row, i) => (
      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: i < rows.length - 1 ? "8px" : 0 }}>
        <span style={{ flexShrink: 0, marginTop: "0.32em", color: "#9CA3AF", fontSize: "12px", lineHeight: 1 }} aria-hidden>
          •
        </span>
        <span style={{ ...T.compareMuted, overflowWrap: "break-word", wordBreak: "break-word" }}>{row.text}</span>
      </div>
    ));

  return (
    <div
      style={{
        position: "relative",
        minWidth: 0,
        ...b,
        borderRadius: "18px",
        padding: "18px 14px 16px",
        background: border === "muted" ? "#f8fafc" : bg,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {badge ? (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            maxWidth: "min(118px, 46%)",
            textAlign: "right",
            fontSize: "9px",
            fontWeight: "700",
            letterSpacing: "0.03em",
            lineHeight: 1.25,
            textTransform: "uppercase",
            padding: "4px 8px",
            borderRadius: "999px",
            ...bs,
          }}
        >
          {badge}
        </div>
      ) : null}
      <div style={{ fontSize: "15px", fontWeight: "800", color, marginBottom: "2px", paddingRight: badge ? "78px" : 0 }}>{label}</div>
      <div style={{ fontSize: "11px", fontWeight: "600", color: "#888", marginBottom: "14px", paddingRight: badge ? "78px" : 0 }}>{tagline}</div>
      {beitrag?.length ? (
        <div style={{ marginBottom: leistung?.length ? "14px" : 0 }}>
          <div style={COMPARE_SECTION_LBL}>💶 Beitrag</div>
          {renderRows(beitrag)}
        </div>
      ) : null}
      {leistung?.length ? (
        <div>
          <div style={COMPARE_SECTION_LBL}>🏥 Leistung</div>
          {renderRows(leistung)}
        </div>
      ) : null}
      {footer}
    </div>
  );
}

const GKVPKV_CHECK_TITLE = "KV-Navigator";

const headerBadgeStyle = {
  fontSize: "11px",
  fontWeight: "500",
  color: "#888",
  letterSpacing: "0.3px",
  textTransform: "uppercase",
  textAlign: "right",
  lineHeight: 1.35,
  maxWidth: "min(140px, 38vw)",
};

export default function ResultPage({
  R,
  p,
  T,
  accentColor: C,
  maklerFirma,
  maklerTelefon = "",
  checkTitle = GKVPKV_CHECK_TITLE,
  goTo,
  progressSteps = ["Über Sie", "Einkommen", "Ergebnis", "Kontakt"],
  progressCurrentStep = 1,
}) {
  const { embedInIframe } = useMakler();
  const [gkvArchiv, setGkvArchiv] = useState(null);
  const resultPath = resolveGkvPkvResultPath(p);
  const copy = resolvePathCopy(resultPath, p);

  const PKV_COLOR = C;
  /** Größte modellierte Monatsersparnis vs. GKV, wenn PKV an der Untergrenze der KPI-Spanne liegt */
  const ersparnisMonatlich = Math.max(0, Math.round(R.gkvSchMonat) - R.pkvSchMonatMin);
  const pkvRangeLabel = `ca. ${R.pkvSchMonatMin.toLocaleString("de-DE")} – ${R.pkvSchMonatMax.toLocaleString("de-DE")} €`;

  const gkvKpiSubline =
    p.beruf === "selbst"
      ? "Orientierung: voller Beitrag (Ø)"
      : p.beruf === "beamter"
        ? "GKV 2026 (Ø)"
        : "Orientierung (Ø)";
  const pkvKpiSubline =
    p.beruf === "angestellt" ? "Orientierungs-Spanne (ohne AG-Zuschuss)" : "Orientierungs-Spanne";

  /** Angestellte unter JAEG: PKV gesetzlich nicht wählbar — kein PKV-Beitrag in den KPI-Karten */
  const pkvKeineOption = R.unterGrenze && p.beruf === "angestellt";

  const kpiMetodikFootnote = pkvKeineOption
    ? "GKV: Monatsbetrag ohne Arbeitgeberzuschuss (bei Angestellten nur der persönliche KV-Anteil, Ø bis BBG). KV-Satzbasis 14,6 %+Ø-Zusatzbeitrag 2,9 % (2026). PKV: für Angestellte unter der Versicherungspflichtgrenze derzeit nicht wählbar — kein Beitragsvergleich."
    : p.beruf === "selbst"
      ? "GKV: voller KV-Beitrag als Selbstzahler (Orientierung, Ø bis BBG). KV-Satzbasis 14,6 %+Ø-Zusatzbeitrag 2,9 % (2026). PKV: Orientierungswerte — Tarif abhängig von Gesundheit &amp; Leistungsumfang · Pflegepflichtversicherung nicht berücksichtigt."
      : p.beruf === "beamter"
        ? "GKV: KV-Beitrag (Orientierung, Ø bis BBG). KV-Satzbasis 14,6 %+Ø-Zusatzbeitrag 2,9 % (2026). PKV: Orientierungswerte für den typischen Restkosten-Tarif — Beihilfe: der Dienstherr übernimmt in der Regel 50–70 % der anrechenbaren Aufwendungen (nicht vergleichbar mit dem Arbeitgeberzuschuss zur PKV bei Angestellten). Tarif abhängig von Gesundheit &amp; Leistungsumfang · Pflegepflichtversicherung nicht berücksichtigt."
        : "GKV: Monatsbetrag ohne Arbeitgeberzuschuss (bei Angestellten nur der persönliche KV-Anteil, Ø bis BBG). KV-Satzbasis 14,6 %+Ø-Zusatzbeitrag 2,9 % (2026). PKV: Spanne ohne Arbeitgeberzuschuss — Tarif abhängig von Gesundheit &amp; Leistungsumfang · Pflegepflichtversicherung nicht berücksichtigt · PKV-AG-Zuschuss 2026 bis max. ~508 € hier nicht eingerechnet";

  const gkvFaktorRows = [];
  if (R.hatKinder) gkvFaktorRows.push(["👨‍👩‍👧 Kinder", "Beitragsfrei mitversichert"]);
  gkvFaktorRows.push(["💰 Einkommen", "Beitrag steigt mit dem Gehalt"]);
  gkvFaktorRows.push(["🏥 Gesundheit", "Keine Gesundheitsprüfung — Aufnahme garantiert"]);

  const pkvFaktorRows = [];
  if (R.hatKinder) pkvFaktorRows.push(["👨‍👩‍👧 Kinder", "Eigener Tarif je Kind (ca. 150–200 €)"]);
  pkvFaktorRows.push(["📅 Alter", pkvAlterFaktorText(R.alter)]);
  pkvFaktorRows.push(["💰 Einkommen", "Beitrag unabhängig vom Einkommen"]);
  pkvFaktorRows.push(["🏥 Gesundheit", "Gesundheitsprüfung bei Aufnahme — Aufschlag möglich"]);

  const mitPartnerKinder = p.familiensituation === "partner_kinder";
  const kinderN = mitPartnerKinder ? p.kinderImHaushalt : 0;
  const dreiPlusKinder = mitPartnerKinder && p.kinderImHaushalt === 3;
  const heroGkvFokus =
    !R.unterGrenze &&
    p.beruf !== "beamter" &&
    (dreiPlusKinder || R.empfehlung === "gkv" || R.empfehlungKosten === "GKV");
  const heroPkvFokus =
    !R.unterGrenze && p.beruf !== "beamter" && R.empfehlungKosten === "PKV" && !dreiPlusKinder;

  const showSavingsHero = !(R.unterGrenze && p.beruf === "angestellt") && ersparnisMonatlich > 0;

  const savingsContextHero = showSavingsHero
    ? gkvPkvHeroTextWithoutSavings({
        beruf: p.beruf,
        dreiPlusKinder,
        kinderN,
        heroGkvFokus,
        heroPkvFokus,
        copy,
      })
    : null;

  return (
    <div className="check-root fade-in" style={{ ...T.page, "--accent": C, "--primary": C }}>
      {!embedInIframe ? (
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
                <span style={headerBadgeStyle}>{checkTitle}</span>
              </div>
            </div>
            <CheckHeaderPhoneButton telefon={maklerTelefon} primaryColor={C} />
          </div>
          <CheckProgressBar steps={progressSteps} currentStep={progressCurrentStep} accent={C} />
        </>
      ) : null}

      <div style={{ paddingBottom: "120px" }}>
        <div
          style={{
            ...T.resultHero,
            paddingTop: "36px",
            paddingBottom: "28px",
            textAlign: "center",
          }}
        >
          {/* Block 1: Tendenz / Ersparnis */}
          {showSavingsHero ? (
            <p
              style={{
                fontSize: "11px",
                color: "#9CA3AF",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Mögliche Ersparnis
            </p>
          ) : (
            <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Einschätzung</div>
          )}

          {R.unterGrenze && p.beruf === "angestellt" ? (
            <>
              <div
                style={{
                  ...T.resultH1,
                  marginBottom: "14px",
                  maxWidth: "min(100%, 26ch)",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                PKV ist aktuell keine Option
              </div>
              <p
                style={{
                  ...T.resultBody,
                  maxWidth: "38ch",
                  margin: "0 auto 8px",
                }}
              >
                Sie liegen unter der Versicherungspflichtgrenze — ein Wechsel in die PKV ist derzeit nicht möglich. Mit Zusatzbausteinen sind Sie in der GKV gut aufgestellt.
              </p>
            </>
          ) : showSavingsHero ? (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "48px",
                  fontWeight: "800",
                  color: C,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  margin: "0 0 4px",
                }}
              >
                {fmtCaEuro(ersparnisMonatlich)}
                <span style={{ fontSize: "16px", fontWeight: "400", color: "#6B7280" }}> /Monat</span>
              </p>
            </div>
          ) : p.beruf === "beamter" ? (
            <>
              <div
                style={{
                  ...T.resultH1,
                  marginBottom: "14px",
                  maxWidth: "min(100%, 26ch)",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                PKV passt zu Ihrer Situation
              </div>
              <p
                style={{
                  ...T.resultBody,
                  maxWidth: "38ch",
                  margin: "0 auto 8px",
                }}
              >
                Als Beamte/r übernimmt Ihr Dienstherr 50–70 % der Kosten — die PKV deckt den Rest günstig ab.
              </p>
            </>
          ) : heroGkvFokus ? (
            <>
              <div
                style={{
                  ...T.resultH1,
                  marginBottom: "14px",
                  maxWidth: "min(100%, 26ch)",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {dreiPlusKinder ? "GKV ist für Sie günstiger" : "GKV passt besser zu Ihnen"}
              </div>
              <p
                style={{
                  ...T.resultBody,
                  maxWidth: "38ch",
                  margin: "0 auto 8px",
                }}
              >
                {dreiPlusKinder
                  ? `Mit ${kinderN} Kindern überwiegt tendenziell die GKV — ein Haushaltsbeitrag statt mehrerer PKV-Einzelverträge.`
                  : "Auf Basis Ihrer Situation spricht tendenziell mehr für die GKV — vor allem bei Beitragslogik und Mitversicherung."}
              </p>
            </>
          ) : heroPkvFokus ? (
            <>
              <div
                style={{
                  ...T.resultH1,
                  marginBottom: "14px",
                  maxWidth: "min(100%, 26ch)",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {kinderN > 0 ? "Kommt auf Ihre Familie an" : "Tendenz: PKV lohnt sich"}
              </div>
              <p
                style={{
                  ...T.resultBody,
                  maxWidth: "38ch",
                  margin: "0 auto 8px",
                }}
              >
                {kinderN > 0
                  ? `Mit ${kinderN} Kind${kinderN === 1 ? "" : "ern"} lohnt ein genauer Vergleich — GKV-Familienversicherung vs. mehrere PKV-Verträge.`
                  : "Tendenziell ist die PKV für Ihre Situation wirtschaftlich attraktiver — konkrete Tarife klären sich im persönlichen Gespräch."}
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  ...T.resultH1,
                  marginBottom: "14px",
                  maxWidth: "min(100%, 26ch)",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Tendenz: {copy.heroH1}
              </div>
              <p
                style={{
                  ...T.resultBody,
                  maxWidth: "38ch",
                  margin: "0 auto 8px",
                }}
              >
                {copy.heroSubline}
              </p>
            </>
          )}

          {showSavingsHero && savingsContextHero ? (
            <div
              style={{
                ...T.resultSub,
                marginTop: "12px",
                maxWidth: "38ch",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#111827",
                  lineHeight: 1.25,
                  marginBottom: "8px",
                  letterSpacing: "-0.02em",
                }}
              >
                {savingsContextHero.title}
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.55 }}>{savingsContextHero.body}</div>
            </div>
          ) : null}
        </div>

        <div style={T.section}>
          <div style={{ ...T.sectionLbl, marginBottom: "14px" }}>Systemvergleich</div>

          {/* Beitragsvergleich — Monatsbeträge (Orientierung) */}
          <div style={{ marginBottom: "14px" }}>
            <div
              className="gkvpkv-stack-sm"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <div
                style={{
                  border: "1px solid rgba(17,24,39,0.08)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>GKV</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.35 }}>{gkvKpiSubline}</div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    marginTop: "8px",
                    letterSpacing: "-0.4px",
                    color: GKV_COLOR,
                  }}
                >
                  {fmtCaEuro(R.gkvSchMonat)}
                </div>
                <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "2px" }}>/ Mon.</div>
              </div>
              <div
                style={{
                  border: "1px solid rgba(17,24,39,0.08)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>PKV</div>
                {pkvKeineOption ? (
                  <>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.35 }}>
                      Derzeit keine Option
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        marginTop: "10px",
                        lineHeight: 1.35,
                        color: "#6B7280",
                      }}
                    >
                      Unter der Versicherungspflichtgrenze nicht wählbar
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.35 }}>{pkvKpiSubline}</div>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        marginTop: "8px",
                        letterSpacing: "-0.4px",
                        color: PKV_COLOR,
                        lineHeight: 1.15,
                      }}
                    >
                      {pkvRangeLabel}
                    </div>
                    <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "4px" }}>/ Mon.</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", lineHeight: 1.35 }}>
                      Richtwert nach Alter &amp; Familiensituation
                    </div>
                  </>
                )}
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#9CA3AF",
                padding: "6px 10px",
                background: "rgba(255,255,255,0.6)",
                borderRadius: "8px",
                marginTop: "4px",
                lineHeight: 1.45,
              }}
            >
              {kpiMetodikFootnote}
            </div>
          </div>

          <div
            className="gkvpkv-stack-sm"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: "12px",
            }}
          >
            <CompareCard
              label="GKV"
              tagline={copy.gkv.tagline}
              color={GKV_COLOR}
              bg="#F0FDF4"
              beitrag={copy.gkv.beitrag}
              leistung={copy.gkv.leistung}
              border={copy.gkv.border}
              badge={copy.gkv.badge}
              footer={<FaktorFooter rows={gkvFaktorRows} />}
              T={T}
            />
            <CompareCard
              label="PKV"
              tagline={copy.pkv.tagline}
              color={PKV_COLOR}
              bg="#EFF6FF"
              beitrag={copy.pkv.beitrag}
              leistung={copy.pkv.leistung}
              border={copy.pkv.border}
              badge={copy.pkv.badge}
              footer={<FaktorFooter rows={pkvFaktorRows} />}
              T={T}
            />
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "16px" }}>
          <div style={T.sectionLbl}>Details &amp; Tabellen</div>
          <div className="gkvpkv-acc-item">
            <button type="button" className="gkvpkv-acc-btn" onClick={() => setGkvArchiv((x) => (x === "archiv" ? null : "archiv"))} aria-expanded={gkvArchiv === "archiv"}>
              <span>JAEG, Beitragsbemessung, Faktoren &amp; Methodik</span>
              <span style={{ color: "#9CA3AF", fontSize: "10px" }}>{gkvArchiv === "archiv" ? "▲" : "▼"}</span>
            </button>
            {gkvArchiv === "archiv" && (
              <div className="gkvpkv-acc-panel" style={{ paddingTop: "12px" }}>
                <p style={{ margin: 0, color: "#6B7280", fontSize: "12px", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                  {`Pflichtgrenze 2026: ${formatIncomeLimitEur()} brutto/Monat —
darunter ist PKV für Angestellte nicht möglich.
GKV-Beitrag: 14,6 % + Ø 2,9 % Zusatzbeitrag.
PKV-Beiträge: individuell nach Alter, Gesundheit
und gewähltem Tarif. Alle Werte sind Richtwerte.
PKV-Orientierungsspannen: Standardtarife, ohne Krankentagegeld.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={T.footer} data-checkkit-footer>
        <button type="button" style={T.btnPrim(false)} onClick={() => goTo(3)}>
          Beratung anfordern
        </button>
        <button type="button" style={T.btnSec} onClick={() => goTo(1)}>
          Neue Berechnung starten
        </button>
      </div>
    </div>
  );
}
