/**
 * GKV/PKV-Ergebnis — BUKTG-Ergebnisschema: Hero, Duell-Karten (GKV/PKV),
 * Archiv-Accordion, Footer. Fünf Ergebnis-Pfade über `resultPath`. Sie-Form.
 */

"use client";

import { useState } from "react";
import { fmt } from "@/lib/utils";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";

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
      "Unter der gesetzlichen Pflichtgrenze für Angestellte bleiben Sie in der GKV — ein Wechsel in die PKV ist derzeit ausgeschlossen. Mit Zusatzbausteinen werten Sie Ihre Versorgung dennoch auf.",
    tableIntro: "Kurzvergleich — GKV-Pflicht unter {incomeLimit}",
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
    tableIntro: "Kurzvergleich — Beamtenstatus mit Beihilfe",
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
    tableIntro: "Kurzvergleich — ohne GKV-Pflicht",
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
    tableIntro: "Kurzvergleich — mit {childrenCount} im Haushalt",
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
    tableIntro: "Kurzvergleich — Großfamilie (3+ Kinder)",
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

export default function ResultPage({
  R,
  p,
  T,
  accentColor: C,
  maklerFirma,
  goTo,
  FAKTOREN,
  progressSteps = ["Über Sie", "Einkommen", "Ergebnis", "Kontakt"],
  progressCurrentStep = 1,
}) {
  const [gkvArchiv, setGkvArchiv] = useState(null);
  const [kontextOpen, setKontextOpen] = useState(true);
  const resultPath = resolveGkvPkvResultPath(p);
  const copy = resolvePathCopy(resultPath, p);
  const kontextItems = buildInfoGrid(p, R).map((c) => ({
    key: c.key,
    icon: (
      <span style={{ display: "flex", color: "#888" }} aria-hidden>
        <c.Icon />
      </span>
    ),
    text: (
      <>
        <strong style={{ fontWeight: "700", color: "#374151" }}>{c.title}.</strong> {c.body}
      </>
    ),
  }));

  const PKV_COLOR = C;

  const mitPartnerKinder = p.familiensituation === "partner_kinder";
  const kinderN = mitPartnerKinder ? p.kinderImHaushalt : 0;
  const dreiPlusKinder = mitPartnerKinder && p.kinderImHaushalt === 3;
  const heroGkvFokus =
    !R.unterGrenze &&
    p.beruf !== "beamter" &&
    (dreiPlusKinder || R.empfehlung === "gkv" || R.empfehlungKosten === "GKV");
  const heroPkvFokus =
    !R.unterGrenze && p.beruf !== "beamter" && R.empfehlungKosten === "PKV" && !dreiPlusKinder;

  const bbgFmt = `${BBG_KV_MONAT.toLocaleString("de-DE")} €`;

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
          {/* Block 1: Tendenz + Eligibility */}
          <div style={{ ...T.resultEyebrow, marginBottom: "10px" }}>Ihre Einschätzung</div>

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
                PKV passt zu deiner Situation
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
              {[
                { label: "GKV", sub: "GKV 2026 (Ø)", val: fmt(R.gkvSchMonat), valColor: GKV_COLOR },
                { label: "PKV", sub: "PKV-Schätzwert", val: fmt(R.pkvSchMonat), valColor: PKV_COLOR },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    border: "1px solid rgba(17,24,39,0.08)",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{row.label}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px", lineHeight: 1.35 }}>{row.sub}</div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      marginTop: "8px",
                      letterSpacing: "-0.4px",
                      color: row.valColor,
                    }}
                  >
                    {row.val}
                  </div>
                  <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "2px" }}>/ Mon.</div>
                </div>
              ))}
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
              GKV: 14,6% + Ø-Zusatzbeitrag 2,9% (2026) · PKV: Faustformel nach Alter
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

          <div style={{ marginTop: "22px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#9CA3AF",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Ihr Situationsvergleich
            </div>
            <div style={T.card}>
              {FAKTOREN.filter((f) => {
                if (f.label === "Kinder") return R.hatKinder;
                if (f.label === "Gesundheit")
                  return p.gesundheit == null || p.gesundheit !== "mittel";
                if (f.label === "Alter") return p.alter < 35 || p.alter > 45;
                if (f.label === "Einkommen") return true;
                return true;
              })
                .slice(0, 3)
                .map(({ label, gkv, pkv, fav }, i, arr) => (
                  <div
                    key={label}
                    style={{
                      padding: "12px 16px",
                      borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#9CA3AF",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      className="gkvpkv-stack-sm"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          background: fav === "gkv" ? "#F6FCF7" : "rgba(255,255,255,0.96)",
                          borderRadius: "10px",
                          border:
                            fav === "gkv" ? "1px solid #CBE9D4" : "1px solid rgba(17,24,39,0.06)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: fav === "gkv" ? "#1E7A46" : "#9CA3AF",
                            marginBottom: "3px",
                          }}
                        >
                          GKV
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#1F2937",
                            lineHeight: 1.5,
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {gkv}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "8px",
                          background: fav === "pkv" ? "#F5F8FF" : "rgba(255,255,255,0.96)",
                          borderRadius: "10px",
                          border:
                            fav === "pkv"
                              ? `1px solid color-mix(in srgb, ${C} 28%, #e5e7eb)`
                              : "1px solid rgba(17,24,39,0.06)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: fav === "pkv" ? C : "#9CA3AF",
                            marginBottom: "3px",
                          }}
                        >
                          PKV
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#1F2937",
                            lineHeight: 1.5,
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {pkv}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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

                {/* Block 4: Kontext — aufklappbar */}
                {kontextItems.length > 0 && (
                  <div style={{ marginBottom: "18px" }}>
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
                        aria-expanded={kontextOpen}
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
                          Was das konkret für Sie bedeutet
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
                            borderTop: "1px solid #E5E7EB",
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {kontextItems.map(({ key, icon, text }) => (
                            <div
                              key={key}
                              style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "flex-start",
                              }}
                            >
                              <span style={{ fontSize: "16px", flexShrink: 0, display: "flex", alignItems: "flex-start" }}>
                                {icon}
                              </span>
                              <span style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.65 }}>{text}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                <p style={{ marginTop: "10px", marginBottom: 0, color: "#6B7280", fontSize: "12px", lineHeight: 1.55 }}>
                  Diese Einschätzung basiert auf Ihren Angaben. PKV-Beiträge variieren je nach Anbieter und
                  Gesundheitszustand — sprechen Sie mit Ihrem Makler für ein konkretes Angebot.
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
