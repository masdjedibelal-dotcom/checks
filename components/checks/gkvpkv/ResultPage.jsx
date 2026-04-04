/**
 * GKV/PKV-Ergebnis — BUKTG-Ergebnisschema: Hero, Duell-Karten (GKV/PKV),
 * Archiv-Accordion, Footer. Fünf Ergebnis-Pfade über `resultPath`. Sie-Form.
 */

"use client";

import { useState } from "react";
import { fmt } from "@/lib/utils";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";

const JAEG_MONAT = 6450;

/**
 * @typedef {'pflicht'|'beamte'|'pkv_fokus'|'individuell'|'gkv_familie'} GkvPkvResultPath
 */

function formatIncomeLimitEur() {
  return `${JAEG_MONAT.toLocaleString("de-DE")} €`;
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

/** Kurzbezeichnung für die Hero-Zeile „Einordnung · …“ */
const PATH_LABEL_SIE = {
  pflicht: "GKV-Pflicht",
  beamte: "Beamte",
  pkv_fokus: "PKV-Fokus",
  individuell: "Familien-Check",
  gkv_familie: "Großfamilie",
};

/**
 * Inhalte je Pfad: kurze H1, Subline, Duell-Karten (Bullets: ok = Vorteil/Check, neg|hinweis = dezenter Punkt).
 * Platzhalter: {incomeLimit}, {childrenCount}
 */
const pathContent = {
  pflicht: {
    heroH1: "GKV-Pflicht",
    heroSubline:
      "Unter der gesetzlichen Pflichtgrenze für Angestellte bleiben Sie in der GKV — ein Wechsel in die PKV ist derzeit ausgeschlossen. Mit Zusatzbausteinen werten Sie Ihre Versorgung dennoch auf.",
    tableIntro: "GKV ist Pflicht — PKV derzeit nicht möglich",
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
    tableIntro: "Beihilfe macht PKV attraktiv",
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
    tableIntro: "Freie Wahl — PKV tendenziell günstiger",
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
    tableIntro: "Familiencheck — GKV vs. PKV-Einzeltarife",
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
    tableIntro: "Ab 3 Kindern meist GKV wirtschaftlicher",
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
    tableIntro: tpl(raw.tableIntro, v),
    gkv: raw.gkv,
    pkv: raw.pkv,
  };
}

function IconBeitrag({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M12 7v10M9.5 10h5M9.5 14h5" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function IconLeistung({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v4M12 14v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 9.5c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5v2.5a3.5 3.5 0 0 1-7 0V9.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** PKV-Spanne nach Alter, Kinderzahl und Beruf (Orientierung). */
function getPkvRange(alter, kinderAnzahl, beruf) {
  const a = Math.max(0, Math.round(Number(alter) || 0));
  const k = Math.max(0, Math.min(3, Math.round(Number(kinderAnzahl) || 0)));
  const isBeamter = beruf === "beamter";

  if (isBeamter) {
    const base = { min: 200, max: 300 };
    return {
      min: base.min + k * 80,
      max: base.max + k * 120,
    };
  }

  let base = { min: 300, max: 450 };
  if (a >= 30 && a < 40) base = { min: 400, max: 550 };
  if (a >= 40 && a < 50) base = { min: 500, max: 650 };
  if (a >= 50 && a < 60) base = { min: 600, max: 800 };
  if (a >= 60) base = { min: 550, max: 750 };

  return {
    min: base.min + k * 150,
    max: base.max + k * 200,
  };
}

function kinderAnzahlForRange(p) {
  if (p.familiensituation !== "partner_kinder") return 0;
  const k = p.kinderImHaushalt;
  if (k === 1 || k === 2 || k === 3) return k;
  return 0;
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

function bulletLeadKind(rowKind) {
  if (rowKind === "ok") return "ok";
  if (rowKind === "neg") return "neg";
  return "dot";
}

function BulletLead({ kind, accent }) {
  if (kind === "ok") {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden style={{ flexShrink: 0, marginTop: "3px" }}>
        <circle cx="7.5" cy="7.5" r="7.5" fill={accent} />
        <path d="M4.2 7.6 6.4 9.8 10.8 5.4" stroke="#fff" strokeWidth="1.65" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "neg") {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden style={{ flexShrink: 0, marginTop: "3px" }}>
        <circle cx="7.5" cy="7.5" r="7.5" fill="#FEE2E2" />
        <path d="M5 5l5 5M10 5l-5 5" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#D1D5DB",
        marginTop: "7px",
        flexShrink: 0,
        display: "inline-block",
      }}
      aria-hidden
    />
  );
}

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

function CompareCard({ label, tagline, color, bg, beitrag, leistung, border, badge, bulletAccent, footer, T }) {
  const b = cardBorderStyle(border);
  const badgeT =
    border === "primary" ? "primary" : border === "compare" ? "compare" : border === "caution" ? "caution" : "muted";
  const bs = badgeStyle(badgeT);

  const renderRows = (rows) =>
    rows.map((row, i) => (
      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: i < rows.length - 1 ? "8px" : 0 }}>
        <BulletLead kind={bulletLeadKind(row.kind)} accent={bulletAccent} />
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <IconBeitrag color={color} />
            <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280" }}>Beitrag</span>
          </div>
          {renderRows(beitrag)}
        </div>
      ) : null}
      {leistung?.length ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <IconLeistung color={color} />
            <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280" }}>Leistung</span>
          </div>
          {renderRows(leistung)}
        </div>
      ) : null}
      {footer}
    </div>
  );
}

export default function ResultPage({
  R,
  p,
  T,
  accentColor: C,
  maklerFirma,
  goTo,
  progressSteps = ["Über Sie", "Einkommen", "Ergebnis", "Kontakt"],
  progressCurrentStep = 1,
}) {
  const [gkvArchiv, setGkvArchiv] = useState(null);
  const resultPath = resolveGkvPkvResultPath(p);
  const copy = resolvePathCopy(resultPath, p);

  const PKV_COLOR = C;
  const ersparnisMonatlich = Math.max(0, R.gkvSchMonat - R.pkvSchMonat);
  const pkvRange = getPkvRange(p.alter, kinderAnzahlForRange(p), p.beruf);
  const pkvRangeLabel = `${pkvRange.min.toLocaleString("de-DE")} – ${pkvRange.max.toLocaleString("de-DE")} €`;

  const gkvFaktorRows = [];
  if (R.hatKinder) gkvFaktorRows.push(["👨‍👩‍👧 Kinder", "Beitragsfrei mitversichert"]);
  gkvFaktorRows.push(["💰 Einkommen", "Beitrag steigt mit dem Gehalt"]);
  gkvFaktorRows.push(["🏥 Gesundheit", "Keine Gesundheitsprüfung — Aufnahme garantiert"]);

  const pkvFaktorRows = [];
  if (R.hatKinder) pkvFaktorRows.push(["👨‍👩‍👧 Kinder", "Eigener Tarif je Kind (~150–200 €)"]);
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

  return (
    <div className="check-root fade-in" style={{ ...T.page, "--accent": C, "--primary": C }}>
      <div className="check-header check-sticky-header" style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMk}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <span style={T.logoTxt}>{maklerFirma}</span>
        </div>
        <span style={T.badge}>KV-Navigator</span>
      </div>
      <CheckProgressBar steps={progressSteps} currentStep={progressCurrentStep} accent={C} />

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
                {fmt(ersparnisMonatlich)}
                <span style={{ fontSize: "16px", fontWeight: "400", color: "#6B7280" }}> /Monat</span>
              </p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "8px auto 0", maxWidth: "38ch", lineHeight: 1.55 }}>
                {copy.heroSubline}
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

          <div style={{ ...T.resultSub, marginTop: "12px", maxWidth: "36ch", marginLeft: "auto", marginRight: "auto" }}>
            {PATH_LABEL_SIE[resultPath]} · {R.subline}
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#6B7280",
              lineHeight: 1.55,
              maxWidth: "38ch",
              margin: "10px auto 0",
              textAlign: "center",
            }}
          >
            Diese Einschätzung basiert auf Ihren Angaben. PKV-Beiträge variieren je nach Anbieter und Gesundheitszustand —
            sprechen Sie mit Ihrem Makler für ein konkretes Angebot.
          </p>
        </div>

        <div style={T.section}>
          <div style={T.sectionLbl}>Systemvergleich</div>
          <div style={{ ...T.tableIntro, marginBottom: "14px" }}>{copy.tableIntro}</div>

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
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.35 }}>GKV 2026 (Ø)</div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    marginTop: "8px",
                    letterSpacing: "-0.4px",
                    color: GKV_COLOR,
                  }}
                >
                  {fmt(R.gkvSchMonat)}
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
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.35 }}>Orientierungs-Spanne</div>
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
              GKV: 14,6% + Ø-Zusatzbeitrag 2,9% (2026) · PKV: Orientierungswerte 2026 — Tarif abhängig von Gesundheit &amp; Leistungsumfang
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
              bulletAccent={GKV_COLOR}
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
              bulletAccent={PKV_COLOR}
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
und gewähltem Tarif. Alle Werte sind Richtwerte.`}
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
