/**
 * GKV/PKV-Ergebnis — BUKTG-Ergebnisschema: Hero, Duell-Karten (GKV/PKV),
 * SmartHint, Archiv-Accordion, Footer. Fünf Ergebnis-Pfade über `resultPath`. Sie-Form.
 */

"use client";

import { useState } from "react";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { fmt, fmtK } from "@/lib/utils";

const JAEG_MONAT = 6450;
/** Beitragsbemessungsgrenze KV/PV (Monat), Orientierung 2026 */
const BBG_KV_MONAT = 5812.5;

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
      "Unter {incomeLimit} monatlich brutto sind Sie als Angestellte/r gesetzlich krankenversichert — ein Wechsel in die PKV ist derzeit ausgeschlossen. Mit Zusatzbausteinen werten Sie Ihre Versorgung dennoch auf.",
    tableIntro:
      "Ihr Brutto liegt unter {incomeLimit} — als Angestellte/r ist der PKV-Wechsel derzeit ausgeschlossen. Hier die Einordnung:",
    gkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Gesetzlich garantierte Basisversorgung." },
        { kind: "ok", text: "Beitrag richtet sich nach Ihrem Einkommen." },
        { kind: "ok", text: "Kinder & Partner oft beitragsfrei mitversichert." },
        { kind: "ok", text: "Ihr Arbeitgeber beteiligt sich am GKV-Beitrag (Hälfte des AN-Anteils)." },
      ],
      beitrag: [
        { kind: "ok", text: "Beitrag richtet sich nach Ihrem Einkommen." },
        { kind: "ok", text: "Ihr Arbeitgeber beteiligt sich am GKV-Beitrag (Hälfte des AN-Anteils)." },
      ],
      leistung: [
        { kind: "ok", text: "Gesetzlich garantierte Basisversorgung." },
        { kind: "ok", text: "Kinder & Partner oft beitragsfrei mitversichert." },
      ],
    },
    pkv: {
      tagline: "Nicht möglich",
      badge: "Derzeit nicht möglich",
      border: "caution",
      bullets: [
        { kind: "neg", text: "Wechsel aktuell gesetzlich ausgeschlossen." },
        { kind: "hinweis", text: "Lösung: Private Zusatzbausteine (Zahn/Stationär) möglich." },
        { kind: "hinweis", text: "Ziel: PKV-Leistungsniveau innerhalb der GKV erreichen." },
      ],
      beitrag: [{ kind: "neg", text: "Wechsel aktuell gesetzlich ausgeschlossen." }],
      leistung: [
        { kind: "hinweis", text: "Lösung: Private Zusatzbausteine (Zahn/Stationär) möglich." },
        { kind: "hinweis", text: "Ziel: PKV-Leistungsniveau innerhalb der GKV erreichen." },
      ],
    },
  },
  beamte: {
    heroH1: "PKV naheliegend",
    heroSubline:
      "Als Beamte/r prägt Ihr Beihilfe-Anspruch die Kosten — die private Krankenversicherung ist auf die typischen Restkosten zugeschnitten und oft sehr günstig.",
    tableIntro: "Kurzvergleich — Beamtenstatus und Beihilfe-Anspruch",
    gkv: {
      tagline: "Unwirtschaftlich",
      badge: "Unwirtschaftlich",
      border: "muted",
      bullets: [
        { kind: "neg", text: "Sie müssen den vollen Beitrag (ca. 15–20 %) meist allein tragen." },
        { kind: "neg", text: "Keine direkte Beteiligung des Dienstherrn über den Beihilfe-Anspruch möglich." },
        { kind: "neg", text: "Eingeschränkter Leistungskatalog der gesetzlichen Kassen." },
      ],
      beitrag: [
        { kind: "neg", text: "Sie müssen den vollen Beitrag (ca. 15–20 %) meist allein tragen." },
        { kind: "neg", text: "Keine direkte Beteiligung des Dienstherrn über den Beihilfe-Anspruch möglich." },
      ],
      leistung: [{ kind: "neg", text: "Eingeschränkter Leistungskatalog der gesetzlichen Kassen." }],
    },
    pkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Beihilfe-konform — deckt typischerweise nur die Restkosten (ca. 20–50 %)." },
        { kind: "ok", text: "Sehr niedrige Monatsbeiträge dank Beihilfe-Anspruch." },
        { kind: "ok", text: "Lebenslang vertraglich abgesichert: Chefarzt & Einbettzimmer (je nach Tarif)." },
        { kind: "ok", text: "Kinder lassen sich in der Regel kostengünstig mit absichern (Beihilfe)." },
      ],
      beitrag: [{ kind: "ok", text: "Sehr niedrige Monatsbeiträge dank Beihilfe-Anspruch." }],
      leistung: [
        { kind: "ok", text: "Beihilfe-konform — deckt typischerweise nur die Restkosten (ca. 20–50 %)." },
        { kind: "ok", text: "Lebenslang vertraglich abgesichert: Chefarzt & Einbettzimmer (je nach Tarif)." },
        { kind: "ok", text: "Kinder lassen sich in der Regel kostengünstig mit absichern (Beihilfe)." },
      ],
    },
  },
  pkv_fokus: {
    heroH1: "PKV naheliegend",
    heroSubline:
      "Sie sind nicht GKV-pflichtig bzw. oberhalb der Pflichtgrenze — hier zählen Beitragshöhe, Leistungsumfang und langfristige Stabilität im direkten Vergleich.",
    tableIntro: "Kurzvergleich — ohne Pflicht zur gesetzlichen Krankenversicherung",
    gkv: {
      tagline: "Teuer",
      badge: "GKV-Höchstbeitrag",
      border: "muted",
      bullets: [
        { kind: "neg", text: "Sie zahlen den Höchstbeitrag (ca. 1.050 € inkl. PV)." },
        { kind: "neg", text: "Leistungen können durch den Gesetzgeber gekürzt werden." },
        { kind: "neg", text: "Lange Wartezeiten bei Fachärzten sind häufig." },
      ],
      beitrag: [{ kind: "neg", text: "Sie zahlen den Höchstbeitrag (ca. 1.050 € inkl. PV)." }],
      leistung: [
        { kind: "neg", text: "Leistungen können durch den Gesetzgeber gekürzt werden." },
        { kind: "neg", text: "Lange Wartezeiten bei Fachärzten sind häufig." },
      ],
    },
    pkv: {
      tagline: "Empfehlung",
      badge: "Unsere Empfehlung",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Beitragsvorteil: Oft deutlich günstiger als der GKV-Höchstbetrag." },
        { kind: "ok", text: "Vertraglich garantierte Leistungen (keine gesetzlichen Kürzungen)." },
        { kind: "ok", text: "Altersrückstellungen für stabilere Beiträge im Alter." },
        { kind: "ok", text: "Freie Wahl von Ärzten und Kliniken je nach Tarif — oft kurze Wartezeiten." },
      ],
      beitrag: [
        { kind: "ok", text: "Beitragsvorteil: Oft deutlich günstiger als der GKV-Höchstbetrag." },
        { kind: "ok", text: "Altersrückstellungen für stabilere Beiträge im Alter." },
      ],
      leistung: [
        { kind: "ok", text: "Vertraglich garantierte Leistungen (keine gesetzlichen Kürzungen)." },
        { kind: "ok", text: "Freie Wahl von Ärzten und Kliniken je nach Tarif — oft kurze Wartezeiten." },
      ],
    },
  },
  individuell: {
    heroH1: "Individueller Familien-Check",
    heroSubline:
      "Mit {childrenCount} stehen Familienmitversicherung (GKV) und mehrere PKV-Tarife zur Wahl — hier lohnt ein klarer Kosten- und Leistungsabgleich.",
    tableIntro: "Kurzvergleich — mit {childrenCount} im Haushalt",
    gkv: {
      tagline: "Solidarisch",
      badge: "Solidarisch",
      border: "compare",
      bullets: [
        { kind: "ok", text: "Kinder sind beitragsfrei mitversichert (Ersparnis)." },
        { kind: "ok", text: "Einkommensabhängiger Beitrag (flexibel bei Teilzeit)." },
        { kind: "ok", text: "Ein Haushaltsbeitrag statt mehrerer Kinder-Tarife." },
      ],
      beitrag: [
        { kind: "ok", text: "Einkommensabhängiger Beitrag (flexibel bei Teilzeit)." },
        { kind: "ok", text: "Ein Haushaltsbeitrag statt mehrerer Kinder-Tarife." },
      ],
      leistung: [{ kind: "ok", text: "Kinder sind beitragsfrei mitversichert (Ersparnis)." }],
    },
    pkv: {
      tagline: "Leistungsstark",
      badge: "Leistungsstark",
      border: "compare",
      bullets: [
        { kind: "ok", text: "Sehr gute medizinische Versorgung für die ganze Familie möglich." },
        { kind: "ok", text: "Kostenfaktor: Separater Beitrag pro Kind (oft ca. 150 €)." },
        { kind: "ok", text: "Bevorzugte Termine & moderne Leistungsoptionen je nach Tarif." },
        { kind: "neutral", text: "Gesundheitsprüfung und Risikozuschläge pro Antragsteller möglich." },
      ],
      beitrag: [
        { kind: "ok", text: "Kostenfaktor: Separater Beitrag pro Kind (oft ca. 150 €)." },
        { kind: "neutral", text: "Gesundheitsprüfung und Risikozuschläge pro Antragsteller möglich." },
      ],
      leistung: [
        { kind: "ok", text: "Sehr gute medizinische Versorgung für die ganze Familie möglich." },
        { kind: "ok", text: "Bevorzugte Termine & moderne Leistungsoptionen je nach Tarif." },
      ],
    },
  },
  gkv_familie: {
    heroH1: "GKV-Wirtschaftlich",
    heroSubline:
      "Mit drei oder mehr Kindern ist die Familienversicherung in der GKV meist der stärkste Hebel — ein Haushaltsbeitrag statt vieler PKV-Einzelverträge.",
    tableIntro: "Kurzvergleich — drei oder mehr Kinder im Haushalt",
    gkv: {
      tagline: "Wirtschaftlich",
      badge: "Wirtschaftlich sinnvoll",
      border: "primary",
      bullets: [
        { kind: "ok", text: "Maximale Ersparnis: Alle Kinder kostenfrei mitversichert (sofern die Voraussetzungen erfüllt sind)." },
        { kind: "ok", text: "Beitrag gedeckelt auf den Höchstbetrag — trotz vieler Personen im Haushalt." },
        { kind: "ok", text: "Ideal für Einverdiener-Haushalte." },
        { kind: "ok", text: "Leistungen gesetzlich definiert — Erweiterung über Zusatzversicherungen möglich." },
      ],
      beitrag: [
        { kind: "ok", text: "Beitrag gedeckelt auf den Höchstbetrag — trotz vieler Personen im Haushalt." },
        { kind: "ok", text: "Ideal für Einverdiener-Haushalte." },
      ],
      leistung: [
        { kind: "ok", text: "Maximale Ersparnis: Alle Kinder kostenfrei mitversichert (sofern die Voraussetzungen erfüllt sind)." },
        { kind: "ok", text: "Leistungen gesetzlich definiert — Erweiterung über Zusatzversicherungen möglich." },
      ],
    },
    pkv: {
      tagline: "Kostenintensiv",
      badge: "Kostenintensiv",
      border: "caution",
      bullets: [
        { kind: "neg", text: "Hohe monatliche Fixkosten durch viele Einzelverträge." },
        { kind: "neg", text: "Gesamtkosten oft deutlich über dem GKV-Niveau." },
        { kind: "hinweis", text: "Empfehlung: GKV wählen und gezielt Zusatzversicherungen ergänzen." },
      ],
      beitrag: [
        { kind: "neg", text: "Hohe monatliche Fixkosten durch viele Einzelverträge." },
        { kind: "neg", text: "Gesamtkosten oft deutlich über dem GKV-Niveau." },
      ],
      leistung: [{ kind: "hinweis", text: "Empfehlung: GKV wählen und gezielt Zusatzversicherungen ergänzen." }],
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

/** Typischer Krankenbeihilfe-Satz zur Einordnung (Bund/Land variieren). */
const BEIHILFE_ANSPRUCH_PROZENT = 70;

function IconClock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M12 12v.01" />
    </svg>
  );
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

/**
 * InfoGrid: max. 3 Kacheln — Alter (immer), Familie (nur mit Kindern), Berufsstatus.
 * @param {object} p
 * @param {object} R
 */
function buildInfoGrid(p, R) {
  const age = Math.max(0, Math.round(Number(p.alter) || 0));
  const v = { ...smartVars(p), age: String(age), beihilfeProzent: String(BEIHILFE_ANSPRUCH_PROZENT) };

  const cards = [];

  let ageBody;
  if (age < 35) {
    ageBody = tpl(
      "Mit {age} Jahren sichern Sie sich extrem günstige Einstiegstarife und bauen frühzeitig hohe Altersrückstellungen für stabile Beiträge auf.",
      v,
    );
  } else if (age <= 50) {
    ageBody = tpl(
      "Ein Wechsel mit {age} Jahren ist strategisch sinnvoll, um die medizinische Versorgung langfristig auf Premium-Niveau einzufrieren.",
      v,
    );
  } else {
    ageBody = tpl(
      "Aufgrund Ihres Alters ({age} Jahre) ist eine detaillierte Prüfung der Beitragsentwicklung im Rentenalter zwingend erforderlich.",
      v,
    );
  }

  cards.push({
    key: "info-alter",
    focus: "Warum das Alter für die PKV entscheidend ist",
    title: "Eintrittsalter & Beiträge",
    body: ageBody,
    Icon: IconClock,
  });

  if (R.hatKinder) {
    let familyBody;
    if (p.beruf === "beamter") {
      const k = p.kinderImHaushalt;
      const lead =
        k === 1
          ? "Ihr Kind erhält bis zu 80 % Beihilfe."
          : k === 2
            ? "Ihre zwei Kinder erhalten bis zu 80 % Beihilfe."
            : "Ihre Kinder erhalten bis zu 80 % Beihilfe.";
      familyBody = `${lead} Die private Restkostenversicherung kostet daher nur wenige Euro pro Monat.`;
    } else {
      const k = p.kinderImHaushalt;
      const fuer = k === 1 ? "für Ihr Kind" : k === 2 ? "für Ihre zwei Kinder" : "für Ihre Kinder";
      const gkvTeil =
        k === 1
          ? "In der GKV ist es nach den Voraussetzungen meist beitragsfrei mitversichert."
          : "In der GKV sind sie nach den Voraussetzungen meist beitragsfrei mitversichert.";
      familyBody = `Beachten Sie: In der PKV fallen ${fuer} eigene Beiträge an (ca. 150–200 € mtl. pro Kind). ${gkvTeil}`;
    }
    cards.push({
      key: "info-familie",
      focus: "Die Kostenfalle oder der Beihilfe-Bonus",
      title: "Absicherung der Familie",
      body: familyBody,
      Icon: IconUsers,
    });
  }

  let statusBody;
  if (p.beruf === "beamter") {
    statusBody = tpl(
      "Ihr Dienstherr übernimmt dauerhaft {beihilfeProzent} % Ihrer Krankheitskosten. Die PKV ist auf dieses System perfekt zugeschnitten.",
      v,
    );
  } else if (p.beruf === "angestellt" && p.brutto >= JAEG_MONAT) {
    statusBody =
      "Ihr Arbeitgeber beteiligt sich mit 50 % an Ihrem PKV-Beitrag (bis zum gesetzlichen Höchstsatz). Dies macht den Premium-Schutz oft günstiger als die GKV.";
  } else if (p.beruf === "angestellt") {
    statusBody =
      "Unterhalb der Versicherungspflichtgrenze bleiben Sie in der GKV: Ihr Arbeitgeber trägt die Hälfte Ihres Arbeitnehmeranteils am GKV-Beitrag. Ein Wechsel in die PKV ist als Angestellte/r derzeit nicht möglich.";
  } else {
    statusBody =
      "Sie tragen Ihren Beitrag zu 100 % selbst. Dafür sind die Beiträge in der PKV völlig unabhängig von der Höhe Ihres Gewinns.";
  }

  cards.push({
    key: "info-status",
    focus: "Der Geldgeber (Beihilfe vs. Arbeitgeber)",
    title: "Zuschuss & Beteiligung",
    body: statusBody,
    Icon: IconBriefcase,
  });

  return cards.slice(0, 3);
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

function CompareCard({ label, tagline, color, bg, beitrag, leistung, border, badge, bulletAccent, T }) {
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
    </div>
  );
}

function SmartHintKv({ children, icon = "💡" }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "16px 18px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        boxShadow: "0 4px 14px rgba(245, 158, 11, 0.08)",
        fontSize: "13px",
        color: "#78350F",
        lineHeight: 1.55,
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }} aria-hidden>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

export default function ResultPage({ R, p, T, accentColor: C, maklerFirma, goTo, FAKTOREN }) {
  const [gkvArchiv, setGkvArchiv] = useState(null);
  const [kontextOpen, setKontextOpen] = useState(false);
  const resultPath = resolveGkvPkvResultPath(p);
  const copy = resolvePathCopy(resultPath, p);
  const infoGrid = buildInfoGrid(p, R);

  const PKV_COLOR = C;
  const pillLg = { padding: "10px 22px", fontSize: "14px", fontWeight: "700", maxWidth: "min(100%, 340px)", marginLeft: "auto", marginRight: "auto", justifyContent: "center", textAlign: "center", lineHeight: 1.35 };

  const heroPill =
    R.unterGrenze ? (
      <div style={{ ...T.statusWarn, ...pillLg, display: "inline-flex", flexWrap: "wrap" }}>Jahresarbeitsentgeltgrenze nicht erreicht</div>
    ) : R.empfehlung === "gkv" ? (
      <div style={{ ...T.statusOk, ...pillLg, display: "inline-flex", flexWrap: "wrap" }}>{R.headline}</div>
    ) : (
      <div style={{ ...T.statusInfo(C), ...pillLg, display: "inline-flex", flexWrap: "wrap" }}>{R.headline}</div>
    );

  const bbgFmt = `${BBG_KV_MONAT.toLocaleString("de-DE")} €`;

  return (
    <div style={{ ...T.page, "--accent": C, "--primary": C }} className="fade-in">
      <div style={T.header}>
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
        <span style={T.badge}>Krankenversicherung</span>
      </div>
      <div style={T.prog}>
        <div style={T.progFil(100)} />
      </div>

      <div style={{ paddingBottom: "120px" }}>
        <div
          style={{
            ...T.resultHero,
            paddingTop: "36px",
            paddingBottom: "28px",
            textAlign: "center",
          }}
        >
          <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Lebensplanung · Qualität</div>
          <div
            style={{
              ...T.resultH1,
              marginBottom: "14px",
              maxWidth: "min(100%, 20ch)",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Tendenz: {copy.heroH1}
          </div>
          <div style={{ marginBottom: "16px" }}>{heroPill}</div>
          <p
            style={{
              ...T.resultBody,
              maxWidth: "38ch",
              margin: "0 auto 8px",
            }}
          >
            {copy.heroSubline}
          </p>
          <div style={{ ...T.resultSub, marginTop: "12px", maxWidth: "36ch", marginLeft: "auto", marginRight: "auto" }}>
            {PATH_LABEL_SIE[resultPath]} · {R.subline} · vereinfachte Auswertung, keine Rechtsberatung
          </div>
        </div>

        {R.unterGrenze && (
          <div style={T.section}>
            <div style={T.warnCard}>
              <div style={T.warnCardTitle}>PKV aktuell nicht möglich</div>
              <div style={T.warnCardText}>
                {tpl(
                  "Die Versicherungspflichtgrenze 2026 liegt bei {incomeLimit} pro Monat brutto. Sie liegen darunter — ein PKV-Wechsel ist für Angestellte erst ab diesem Einkommen möglich.",
                  smartVars(p),
                )}
              </div>
              <div style={T.warnCardNote}>Ausnahme: Beamte und Selbstständige sind nicht pflichtversichert.</div>
            </div>
          </div>
        )}

        <div style={T.section}>
          <div style={T.sectionLbl}>Systemvergleich</div>
          <div style={{ ...T.tableIntro, marginBottom: "14px" }}>{copy.tableIntro}</div>
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
              T={T}
            />
          </div>
        </div>

        {!R.unterGrenze && R.diff > 30 && R.empfehlungKosten ? (
          <div style={T.section}>
            <div
              style={{
                border: `1px solid ${
                  R.empfehlungKosten === "PKV" ? "rgba(26,58,92,0.2)" : "rgba(5,150,105,0.2)"
                }`,
                borderLeft: `3px solid ${R.empfehlungKosten === "PKV" ? C : "#059669"}`,
                borderRadius: "18px",
                padding: "14px 16px",
                background:
                  R.empfehlungKosten === "PKV" ? `color-mix(in srgb, ${C} 4%, white)` : "rgba(5,150,105,0.025)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: R.empfehlungKosten === "PKV" ? C : "#059669",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Ersparnis {R.empfehlungKosten === "PKV" ? "bei PKV-Wechsel" : "mit GKV"}
              </div>
              <div
                className="gkvpkv-stack-sm"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "8px",
                }}
              >
                {[
                  {
                    l: "Pro Monat",
                    v: fmt(R.diff),
                    color: R.empfehlungKosten === "PKV" ? C : "#059669",
                  },
                  {
                    l: "Pro Jahr",
                    v: fmt(R.diff * 12),
                    color: "#1F2937",
                  },
                  {
                    l: "In 10 Jahren",
                    v: fmtK(R.diff * 12 * 10),
                    color: "#1F2937",
                  },
                ].map(({ l, v, color }) => (
                  <div
                    key={l}
                    style={{
                      textAlign: "center",
                      padding: "10px 6px",
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: "10px",
                    }}
                  >
                    <div style={{ fontSize: "16px", fontWeight: "700", color, letterSpacing: "-0.3px" }}>{v}</div>
                    <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "2px", fontWeight: "500" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div style={T.section}>
          <div
            style={{
              border: "1px solid rgba(17,24,39,0.06)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
            }}
          >
            <button
              type="button"
              onClick={() => setKontextOpen((x) => !x)}
              style={{
                width: "100%",
                padding: "14px 18px",
                background: "#faf9f6",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280" }}>
                Was das für Ihre Situation bedeutet
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                style={{
                  transition: "transform 0.2s",
                  transform: kontextOpen ? "rotate(90deg)" : "none",
                  flexShrink: 0,
                }}
              >
                <path
                  d="M4 2l4 4-4 4"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {kontextOpen ? (
              <div
                style={{
                  padding: "14px 18px",
                  fontSize: "13px",
                  color: "#6B7280",
                  lineHeight: 1.7,
                  borderTop: "1px solid #EAE5DC",
                  background: "#fff",
                }}
              >
                {infoGrid.map((c, i) => (
                  <div
                    key={c.key}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      marginBottom: i < infoGrid.length - 1 ? "10px" : "0",
                    }}
                  >
                    <span style={{ flexShrink: 0, display: "flex", color: "#888" }} aria-hidden>
                      <c.Icon />
                    </span>
                    <span style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.65 }}>
                      <strong style={{ fontWeight: "700", color: "#374151" }}>{c.title}.</strong> {c.body}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div style={T.section}>
          <div style={T.sectionLbl}>Strategie</div>
          <SmartHintKv icon="📈">
            <strong style={{ fontWeight: "700" }}>Strategie: Beitragsentlastung</strong>
            <span style={{ display: "block", marginTop: "8px" }}>
              Wenn die PKV für Sie wirtschaftlich vorteilhaft ist, bleibt häufig ein monatlicher Abstand zum GKV-Höchstbeitrag. Diesen Betrag können Sie strukturiert anlegen — etwa in ETF-Sparpläne oder andere Vermögensbausteine — und so aus der Ersparnis zusätzliches Kapital aufbauen, statt ihn ungenutzt „verstreichen“ zu lassen. Höhe und Tragfähigkeit hängen von Ihrer Situation ab; eine Einordnung ersetzt keine Anlageberatung.
            </span>
          </SmartHintKv>
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
                <p style={{ marginBottom: "12px" }}>
                  <strong>Jahresarbeitsentgeltgrenze (Orientierung 2026):</strong> Als Angestellte/r sind Sie unter{" "}
                  <strong>{formatIncomeLimitEur()} brutto pro Monat</strong> in der Regel gesetzlich krankenversichert; ein Wechsel in die PKV ist dann nicht möglich. Beamte und Selbstständige folgen anderen Regeln.
                </p>
                <p style={{ marginBottom: "12px" }}>
                  <strong>Beitragsbemessung GKV (AN-Anteil):</strong> Der allgemeine Beitragssatz wird bis zur Beitragsbemessungsgrenze KV/PV berechnet — orientierend{" "}
                  <strong>{bbgFmt} monatlich</strong> (Werte können sich gesetzlich ändern).
                </p>
                <p style={{ marginBottom: "14px", color: "#b8884a" }}>
                  Vereinfachte Einordnung auf Basis Ihrer Angaben. Keine konkreten Beiträge — diese hängen von Tarif, Kasse und individuellem Gesundheitszustand ab. Grundlage u. a. § 241 SGB V, § 257 SGB V, § 9 SGB V.
                </p>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>Wichtige Faktoren in Ihrer Situation</div>
                <div style={T.cardPrimary}>
                  {FAKTOREN.map(({ label, gkv, pkv, fav }, i, arr) => (
                    <div
                      key={label}
                      style={{
                        padding: "14px 20px",
                        borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                      }}
                    >
                      <div style={T.matrixMuted}>{label}</div>
                      <div
                        className="gkvpkv-stack-sm"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 148px), 1fr))",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                            padding: "10px",
                            background: fav === "gkv" ? "#F0FDF4" : "#f8fafc",
                            borderRadius: "10px",
                            border: fav === "gkv" ? "1px solid #BBF7D0" : "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: fav === "gkv" ? GKV_COLOR : "#888",
                              marginBottom: "4px",
                            }}
                          >
                            GKV
                          </div>
                          <div style={{ ...T.matrixCellText, overflowWrap: "break-word", wordBreak: "break-word" }}>{gkv}</div>
                        </div>
                        <div
                          style={{
                            minWidth: 0,
                            padding: "10px",
                            background: fav === "pkv" ? "#EFF6FF" : "#f8fafc",
                            borderRadius: "10px",
                            border: fav === "pkv" ? "1px solid #BFDBFE" : "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: fav === "pkv" ? PKV_COLOR : "#888",
                              marginBottom: "4px",
                            }}
                          >
                            PKV
                          </div>
                          <div style={{ ...T.matrixCellText, overflowWrap: "break-word", wordBreak: "break-word" }}>{pkv}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ ...T.section, marginBottom: "8px" }}>
          <div style={{ ...T.infoBox, fontSize: "11px" }}>{CHECK_LEGAL_DISCLAIMER_FOOTER}</div>
        </div>
      </div>

      <div style={T.footer}>
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
