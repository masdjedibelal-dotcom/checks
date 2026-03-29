import type { CSSProperties } from "react";

/**
 * FlowLeads Checkkit — gemeinsame Ergebnis-UI v2.3 (alle Checks).
 * Nur Design-Tokens & Helfer; keine Geschäftslogik.
 */

const LUECKE_RED = "#c0392b";

/** Farbbalken nach Auslastungs-/Fortschritts-Prozent (Timeline) */
export function checkkitTimelineFillColor(percent: number): string {
  const p = Number.isFinite(percent) ? percent : 0;
  if (p > 90) return "#22c55e";
  if (p >= 60) return "#f59e0b";
  if (p >= 30) return "#e67e22";
  return "#c0392b";
}

/** Große Hauptzahl: Lücke (rot) oder positiv (Akzentfarbe C) */
export function checkkitResultHeroNumberStyle(variant: "luecke" | "positiv", accent: string): CSSProperties {
  return {
    fontSize: "36px",
    fontWeight: 700,
    letterSpacing: "-0.8px",
    color: variant === "luecke" ? LUECKE_RED : accent,
  };
}

/**
 * Empfehlung-Badge: Hintergrund = Akzent + Hex-Alpha 15 (8-stellig), wenn C wie #RRGGBB.
 */
export function checkkitEmpfehlungBadgeStyle(accent: string): CSSProperties {
  const bg =
    typeof accent === "string" && /^#[0-9A-Fa-f]{6}$/.test(accent) ? `${accent}15` : "rgba(37,99,235,0.08)";
  return {
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "999px",
    textTransform: "uppercase",
    background: bg,
    color: accent,
    letterSpacing: "0.04em",
  };
}

const infoBoxBase: CSSProperties = {
  padding: "15px 16px",
  borderRadius: "14px",
  fontSize: "13px",
  lineHeight: 1.7,
};

export const CHECKKIT_RESULT_UI_V23 = {
  /** Schockmoment-Block (roter Left-Border) */
  shockMomentBlock: {
    border: "1px solid rgba(192,57,43,0.27)",
    borderLeft: "3px solid #c0392b",
    background: "rgba(192,57,43,0.025)",
    borderRadius: 18,
    padding: "14px 16px",
  } satisfies CSSProperties,

  /** Timeline-/Fortschrittsbalken (Track); Füllfarbe via `checkkitTimelineFillColor` */
  timelineBar: {
    borderRadius: "999px",
    height: "4px",
  } satisfies CSSProperties,

  kpiTile: {
    normal: {
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "16px",
    } satisfies CSSProperties,
    accent: {
      background: "#F5F8FF",
      border: "1px solid rgba(26,58,92,0.14)",
      borderRadius: "16px",
    } satisfies CSSProperties,
    warn: {
      background: "#FFF7F7",
      border: "1px solid #F2CFCF",
      borderRadius: "16px",
    } satisfies CSSProperties,
    ok: {
      background: "#F6FCF7",
      border: "1px solid #CBE9D4",
      borderRadius: "16px",
    } satisfies CSSProperties,
  },

  kpiVal: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  } satisfies CSSProperties,

  kpiValWarn: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
    color: "#B83232",
  } satisfies CSSProperties,

  kpiValOk: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
    color: "#1E7A46",
  } satisfies CSSProperties,

  kpiLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#9CA3AF",
    marginTop: "4px",
    lineHeight: 1.35,
  } satisfies CSSProperties,

  infoBox: {
    blue: {
      ...infoBoxBase,
      background: "#F6F8FE",
      border: "1px solid #DCE6FF",
      color: "#315AA8",
    } satisfies CSSProperties,
    red: {
      ...infoBoxBase,
      background: "#FFF7F7",
      border: "1px solid #F2D0D0",
      color: "#A13232",
    } satisfies CSSProperties,
    green: {
      ...infoBoxBase,
      background: "#F6FCF7",
      border: "1px solid #CBE9D4",
      color: "#237446",
    } satisfies CSSProperties,
    gold: {
      ...infoBoxBase,
      background: "#FDF8F0",
      border: "1px solid #EDD9BB",
      color: "#94622D",
    } satisfies CSSProperties,
  },

  accordion: {
    wrapper: {
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "14px",
      overflow: "hidden",
    } satisfies CSSProperties,
    button: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 16px",
      textAlign: "left",
      fontSize: "13px",
      fontWeight: 600,
      color: "#6B7280",
      background: "#faf9f6",
      border: "none",
      cursor: "pointer",
      fontFamily: "inherit",
    } satisfies CSSProperties,
    body: {
      padding: "14px 16px",
      background: "#fff",
      fontSize: "13px",
      color: "#6B7280",
      lineHeight: 1.7,
      borderTop: "1px solid rgba(17,24,39,0.06)",
    } satisfies CSSProperties,
  },
} as const;
