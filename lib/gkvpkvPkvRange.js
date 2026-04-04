/**
 * PKV-Orientierungsspanne (Monat, ganze Euro) — KPI, Ersparnis, berechne().
 * Nicht einkommensabhängig; Modell nach Alter (+ Kinder je Tarif, Orientierung).
 * Altersbänder ~ realistische Modellwerte 2026 (Ø Markt ca. 600–620 € ohne Kinder).
 */

/** @param {{ familiensituation?: string, kinderImHaushalt?: number | null }} p */
export function kinderAnzahlForGkvPkvRange(p) {
  if (!p || p.familiensituation !== "partner_kinder") return 0;
  const k = p.kinderImHaushalt;
  if (k === 1 || k === 2 || k === 3) return k;
  return 0;
}

/**
 * @param {number} alter
 * @param {number} kinderAnzahl 0–3
 * @param {string} beruf z. B. "beamter" | "angestellt" | "selbst"
 * @returns {{ min: number, max: number }}
 */
export function getPkvRange(alter, kinderAnzahl, beruf) {
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

  /** Single / Erwachsene ohne Kinder-Zuschlag im Basisband (Kinder: +150 / +200 je Kind). */
  let base;
  if (a >= 65) {
    base = { min: 500, max: 700 };
  } else if (a >= 50) {
    base = { min: 650, max: 900 };
  } else if (a >= 40) {
    base = { min: 550, max: 800 };
  } else if (a >= 30) {
    base = { min: 450, max: 650 };
  } else {
    base = { min: 350, max: 500 };
  }

  return {
    min: base.min + k * 150,
    max: base.max + k * 200,
  };
}
