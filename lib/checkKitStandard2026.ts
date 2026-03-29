import type { CSSProperties } from "react";

/**
 * Checkkit 2026 — globale Story-, Loader- und Ergebnis-Tokens
 * (Story/Bridge-Screens, 3-Spalten-Ergebnis, ResultCard)
 */

export const CHECKKIT_HEADER_OFFSET_PX = 54;

export const CHECKKIT2026 = {
  /** Volle Viewport-Höhe (Page-/Story-Column, inkl. unter Header scrollen) */
  storyPageMinHeight: "100vh" as const,
  /** Inhalt unter Sticky-Header — vertikal zentrierbar */
  storyScreenMinHeight: `calc(100vh - ${CHECKKIT_HEADER_OFFSET_PX}px)` as const,

  /**
   * Story-/Bridge-Spalte: mindestens eine Viewport-Höhe (Phase 1 & 2).
   * Liegt typisch unter Header + Fortschrittsbalken im Page-Flow.
   */
  storyRoot: {
    width: "100%",
    minHeight: "100vh",
    boxSizing: "border-box" as const,
  } satisfies CSSProperties,

  /** Story-/Bridge: Sektions-Padding (oben / seitlich / unten) */
  storySection: {
    padding: "44px 24px 32px",
    width: "100%",
  } satisfies CSSProperties,

  /** Story-/Bridge: Content-Wrapper — max. 600px, zentriert */
  storyContentWrap: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center" as const,
  } satisfies CSSProperties,

  /** Story-/Bridge: Emoji oder Icon-Zeichen — einheitlich 56px (nicht 64px o. ä.) */
  storyEmoji: {
    fontSize: "56px",
    lineHeight: 1,
    marginBottom: 24,
  } satisfies CSSProperties,

  /** Story-/Bridge: Headline (h1) — 32px, 800, -1.2px; marginBottom 20px */
  storyH1: {
    fontSize: "32px",
    fontWeight: 800,
    letterSpacing: "-1.2px",
    lineHeight: 1.2,
    color: "#111",
    margin: 0,
    marginBottom: "20px",
  } satisfies CSSProperties,

  /** Story-/Bridge: Fließtext — 16px, max. 42ch (Zeilenbegrenzung) */
  storyBody: {
    fontSize: "16px",
    lineHeight: 1.65,
    maxWidth: "42ch",
    margin: 0,
    marginLeft: "auto",
    marginRight: "auto",
    color: "#4B5563",
  } satisfies CSSProperties,

  storyEyebrow: {
    fontSize: 11,
    fontWeight: 600,
    color: "#999",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    marginBottom: 10,
  } satisfies CSSProperties,

  storySubtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 1.65,
    margin: "0 auto 16px",
    maxWidth: "42ch",
  } satisfies CSSProperties,

  footerSpacerPx: 120,

  /** Loader-Hauptfläche (unter Header im Page-Wrapper) */
  loaderBody: {
    minHeight: `calc(100vh - ${CHECKKIT_HEADER_OFFSET_PX}px)`,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "0 24px",
    background: "#ffffff",
    width: "100%",
  } satisfies CSSProperties,

  /**
   * Fallback ohne Media Query (z. B. PDF): drei Spalten.
   * Für responsives Layout `CheckKitResultGrid` + `ensureCheckKitResultGridStyles` nutzen.
   */
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    alignItems: "stretch",
  } satisfies CSSProperties,

  /** Getönte Säule um ResultCards (Existenz / Standard / Plus) */
  resultColumnStack: {
    borderRadius: 16,
    padding: "16px 14px 18px",
    border: "1px solid rgba(17,24,39,0.05)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    minHeight: 120,
  } satisfies CSSProperties,

  resultCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "16px 16px 14px",
    boxShadow: "0 4px 20px rgba(17,24,39,0.07)",
    border: "1px solid rgba(17,24,39,0.06)",
    textAlign: "left" as const,
  } satisfies CSSProperties,

  /** Säule links: Existenz / Pflicht / akut */
  colExistenz: "#FFF6F5",
  /** Mitte: Standard / Optimierung */
  colStandard: "#FFFBEB",
  /** Rechts: Plus / optional */
  colPlus: "#FAFAF8",
} as const;

/**
 * Wizard- & Ergebnis-Hero-Überschriften (T.h1, resultH1, …): einheitlich 800 / -1.2px.
 * Schriftgröße und Farbe bleiben pro Screen.
 */
export const CHECKKIT_HERO_TITLE_TYPO = {
  fontWeight: 800 as const,
  letterSpacing: "-1.2px" as const,
} satisfies Pick<CSSProperties, "fontWeight" | "letterSpacing">;

/** CSS-Klasse: eine Spalte unter 900px, `repeat(3, 1fr)` ab 900px */
export const CHECKKIT_RESULT_GRID_CLASS = "checkkit-result-grid-3";

const CHECKKIT_RESULT_GRID_STYLE_ID = "checkkit-2026-result-grid";

export function ensureCheckKitResultGridStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(CHECKKIT_RESULT_GRID_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = CHECKKIT_RESULT_GRID_STYLE_ID;
  el.textContent = `
.${CHECKKIT_RESULT_GRID_CLASS} {
  display: grid;
  gap: 14px;
  align-items: stretch;
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .${CHECKKIT_RESULT_GRID_CLASS} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
`;
  document.head.appendChild(el);
}

/** Score-Buckets für globale Ergebnis-Priorisierung */
export const CHECKKIT_SCORE_EXISTENZ_MIN_EXCLUSIVE = 700;
export const CHECKKIT_SCORE_STANDARD_MIN = 300;
export const CHECKKIT_SCORE_STANDARD_MAX = 700;

/** Ergebnis-UI v2.3 — Schockmoment, KPI-Tiles, Info-Boxen, Accordion, Timeline-Farben */
export {
  CHECKKIT_RESULT_UI_V23,
  checkkitTimelineFillColor,
  checkkitEmpfehlungBadgeStyle,
  checkkitResultHeroNumberStyle,
} from "./checkKitResultUIV23";
