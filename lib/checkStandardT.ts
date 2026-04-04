import type { CSSProperties } from "react";
import { CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";

export const checkStandardT = (C: string) => {
  const cLight = `color-mix(in srgb, ${C} 8%, white)`;

  const logoMark = {
    width: "30px",
    height: "30px",
    borderRadius: "10px",
    background: C,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const multiRow = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderBottom: "1px solid #f5f5f5",
    cursor: "pointer",
  };

  const multiRowLast = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    cursor: "pointer",
  };

  const input = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid rgba(31,41,55,0.08)",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#1F2937",
    background: "rgba(255,255,255,0.96)",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    boxShadow: "inset 0 1px 2px rgba(17,24,39,0.03)",
  };

  const inputHint = {
    fontSize: "11px",
    color: "#9CA3AF",
    marginTop: "5px",
  };

  const hint = {
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.65,
  };

  const progFillFn = (pct: number) => ({
    height: "100%",
    width: `${pct}%`,
    background: C,
    borderRadius: "999px",
    transition: "width 0.35s ease",
  });

  const infoBoxBase = {
    padding: "15px 16px",
    borderRadius: "14px",
    fontSize: "13px",
    lineHeight: 1.7,
  };

  return {
    // ── PAGE ──────────────────────────────────
    page: {
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily:
        "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
      WebkitFontSmoothing: "antialiased" as const,
      ...( { ["--accent"]: C } as Record<string, string> ),
    },
    // ── HEADER ────────────────────────────────
    header: {
      height: "56px",
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(31,41,55,0.06)",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky" as const,
      top: 0,
      zIndex: 100,
    },
    logoMark,
    logoName: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#1F2937",
    },
    badge: {
      fontSize: "11px",
      fontWeight: "600" as const,
      color: "#98A2B3",
      letterSpacing: "0.2px",
    },

    // ── PROGRESS ──────────────────────────────
    progWrap: {
      background: "#fff",
    },
    progTrack: {
      height: "6px",
      background: "rgba(31,41,55,0.08)",
    },
    progFill: progFillFn,
    progMeta: {
      display: "flex",
      justifyContent: "center",
      gap: "6px",
      padding: "6px 24px 8px",
      fontSize: "12px",
      fontWeight: "500" as const,
      color: "#9CA3AF",
    },

    // ── HERO ──────────────────────────────────
    hero: {
      padding: "32px 24px 16px",
      background: "#ffffff",
      textAlign: "center" as const,
    },
    eyebrow: {
      fontSize: "11px",
      fontWeight: "600" as const,
      color: "#999",
      letterSpacing: "1px",
      textTransform: "uppercase" as const,
      marginBottom: "6px",
    },
    h1: {
      fontSize: "22px",
      color: "#111",
      lineHeight: 1.25,
      marginBottom: "12px",
      ...CHECKKIT_HERO_TITLE_TYPO,
    },
    hint,

    // ── SCREEN BODY ───────────────────────────
    screenBody: {
      padding: "20px 24px 140px",
      background: "#ffffff",
    },

    // ── SELECTION CARDS (1-spaltig) ───────────
    opts: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
    },
    opt: (selected: boolean) => ({
      padding: "18px",
      borderRadius: "18px",
      border: selected ? `1.5px solid ${C}` : "1px solid rgba(17,24,39,0.06)",
      background: selected ? cLight : "rgba(255,255,255,0.96)",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      cursor: "pointer",
      transition:
        "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
      boxShadow: selected
        ? "0 10px 28px rgba(26,58,92,0.12)"
        : "0 2px 10px rgba(17,24,39,0.04)",
      minHeight: "66px",
    }),
    optIcon: (selected: boolean) => ({
      width: "50px",
      height: "50px",
      borderRadius: "14px",
      background: selected ? `rgba(26,58,92,0.09)` : "#F3F4F6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: "22px",
    }),
    optLabel: {
      fontSize: "15px",
      fontWeight: "600" as const,
      color: "#1F2937",
      lineHeight: 1.3,
    },
    optSub: {
      fontSize: "13px",
      color: "#6B7280",
      marginTop: "3px",
      lineHeight: 1.45,
    },

    // ── SELECTION GRID (2-spaltig) ────────────
    optsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    optGrid: (selected: boolean) => ({
      padding: "18px 12px",
      borderRadius: "18px",
      border: selected ? `1.5px solid ${C}` : "1px solid rgba(17,24,39,0.06)",
      background: selected ? cLight : "rgba(255,255,255,0.96)",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      transition:
        "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
      boxShadow: selected
        ? "0 10px 28px rgba(26,58,92,0.12)"
        : "0 2px 10px rgba(17,24,39,0.04)",
      minHeight: "96px",
      textAlign: "center" as const,
    }),
    optGridIcon: (selected: boolean) => ({
      width: "46px",
      height: "46px",
      borderRadius: "14px",
      background: selected ? `rgba(26,58,92,0.09)` : "#F3F4F6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
    }),
    optGridLabel: {
      fontSize: "14px",
      fontWeight: "600" as const,
      color: "#1F2937",
      lineHeight: 1.3,
    },

    // ── MULTI CHOICE LIST ─────────────────────
    multiList: {
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "18px",
      overflow: "hidden",
      background: "#FFFFFF",
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
    },
    multiRow,
    multiRowLast,
    multiLabel: {
      fontSize: "14px",
      color: "#1F2937",
      flex: 1,
    },
    checkbox: (checked: boolean) => ({
      width: "22px",
      height: "22px",
      borderRadius: "7px",
      border: checked ? `1.5px solid ${C}` : "1.5px solid #E5E7EB",
      background: checked ? C : "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.15s",
    }),

    // ── SLIDER ────────────────────────────────
    sliderCard: {
      background: "#FFFFFF",
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "18px",
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
      overflow: "hidden",
    },
    sliderRow: {
      padding: "18px 20px",
      borderBottom: "1px solid #f5f5f5",
    },
    sliderRowLast: {
      padding: "18px 20px",
    },
    sliderLabel: {
      fontSize: "11px",
      fontWeight: "700" as const,
      color: "#6B7280",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      marginBottom: "4px",
    },
    sliderVal: {
      fontSize: "28px",
      fontWeight: "700" as const,
      color: C,
      letterSpacing: "-0.5px",
      lineHeight: 1,
      marginBottom: "14px",
      display: "block",
    },
    sliderHint: {
      fontSize: "12px",
      color: "#9CA3AF",
      marginTop: "10px",
    },

    // ── TEXT INPUT ────────────────────────────
    fldLbl: {
      fontSize: "11px",
      fontWeight: "700" as const,
      color: "#667085",
      textTransform: "uppercase" as const,
      letterSpacing: "0.4px",
      marginBottom: "8px",
      display: "block",
    },
    input,
    inputHint,

    // ── INFO BOX ──────────────────────────────
    infoBox: {
      ...infoBoxBase,
      background: "#F9FAFB",
      color: "#6B7280",
    },
    infoBlue: {
      ...infoBoxBase,
      background: "#F6F8FE",
      border: "1px solid #DCE6FF",
      color: "#315AA8",
    },
    infoRed: {
      ...infoBoxBase,
      background: "#FFF7F7",
      border: "1px solid #F2D0D0",
      color: "#A13232",
    },
    infoGreen: {
      ...infoBoxBase,
      background: "#F6FCF7",
      border: "1px solid #CBE9D4",
      color: "#237446",
    },
    infoGold: {
      ...infoBoxBase,
      background: "#FDF8F0",
      border: "1px solid #EDD9BB",
      color: "#94622D",
    },

    // ── KPI TILES ─────────────────────────────
    kpiGrid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
    },
    kpiGrid3: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "10px",
    },
    kpiTile: {
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "16px",
      padding: "16px 12px",
      textAlign: "center" as const,
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
    },
    kpiTileAccent: () => ({
      background: "#F5F8FF",
      border: `1px solid rgba(26,58,92,0.14)`,
      borderRadius: "16px",
      padding: "16px 12px",
      textAlign: "center" as const,
      boxShadow: "0 8px 24px rgba(17,24,39,0.06)",
    }),
    kpiTileWarn: {
      background: "#FFF7F7",
      border: "1px solid #F2CFCF",
      borderRadius: "16px",
      padding: "16px 12px",
      textAlign: "center" as const,
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
    },
    kpiTileOk: {
      background: "#F6FCF7",
      border: "1px solid #CBE9D4",
      borderRadius: "16px",
      padding: "16px 12px",
      textAlign: "center" as const,
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
    },
    kpiVal: {
      fontSize: "22px",
      fontWeight: "700" as const,
      color: "#1F2937",
      letterSpacing: "-0.5px",
      lineHeight: 1.2,
    },
    kpiValAccent: (C2: string) => ({
      fontSize: "22px",
      fontWeight: "700" as const,
      color: C2,
      letterSpacing: "-0.5px",
      lineHeight: 1.2,
    }),
    kpiValWarn: {
      fontSize: "22px",
      fontWeight: "700" as const,
      color: "#B83232",
      letterSpacing: "-0.5px",
      lineHeight: 1.2,
    },
    kpiValOk: {
      fontSize: "22px",
      fontWeight: "700" as const,
      color: "#1E7A46",
      letterSpacing: "-0.5px",
      lineHeight: 1.2,
    },
    kpiLbl: {
      fontSize: "11px",
      color: "#9CA3AF",
      fontWeight: "500" as const,
      marginTop: "5px",
    },

    // ── DYNAMIC CONTENT CARD ──────────────────
    dynamicCard: {
      background: "linear-gradient(180deg, #FFFFFF 0%, #FCFBF8 100%)",
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 8px 24px rgba(17,24,39,0.06)",
      margin: "0",
    },
    dynamicName: {
      fontSize: "24px",
      fontWeight: "700" as const,
      color: "#1F2937",
      marginBottom: "6px",
      letterSpacing: "-0.4px",
    },
    dynamicSub: {
      fontSize: "14px",
      color: "#6B7280",
      marginBottom: "18px",
      lineHeight: 1.55,
    },
    dynamicVal: (C2: string) => ({
      fontSize: "38px",
      fontWeight: "700" as const,
      color: C2,
      letterSpacing: "-0.9px",
      lineHeight: 1,
      marginBottom: "6px",
    }),
    dynamicUnit: {
      fontSize: "14px",
      color: "#98A2B3",
    },

    // ── BUTTONS ───────────────────────────────
    btnPrim: (disabled: boolean) => ({
      width: "100%",
      padding: "13px 20px",
      background: disabled ? "#e8e8e8" : C,
      color: disabled ? "#aaa" : "#FFFFFF",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: "700" as const,
      border: "none",
      cursor: disabled ? "default" : "pointer",
      fontFamily: "inherit",
      boxShadow: disabled ? "none" : "0 8px 20px rgba(26,58,92,0.18)",
      transition:
        "transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease",
      letterSpacing: "0.1px",
    }),
    btnSec: {
      width: "100%",
      padding: "12px",
      color: "#9CA3AF",
      fontSize: "13px",
      fontWeight: "500" as const,
      border: "none",
      background: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      marginTop: "8px",
    },

    // ── FOOTER ────────────────────────────────
    footer: {
      position: "sticky" as const,
      bottom: 0,
      background: "#ffffff",
      borderTop: "1px solid rgba(31,41,55,0.06)",
      padding: "14px 24px max(28px, env(safe-area-inset-bottom, 28px))",
      zIndex: 50,
    },

    // ── LOADER ────────────────────────────────
    loaderScreen: {
      padding: "56px 24px",
      textAlign: "center" as const,
      background: "#ffffff",
    },
    loaderH: {
      fontSize: "19px",
      fontWeight: "700" as const,
      color: "#1F2937",
      marginBottom: "8px",
    },
    loaderSub: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: 1.65,
      maxWidth: "28ch",
      margin: "0 auto",
    },

    // ── DANKE SCREEN ──────────────────────────
    dankeScreen: {
      padding: "48px 24px",
      textAlign: "center" as const,
      background: "#ffffff",
    },
    dankeRing: (C2: string) => ({
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: `color-mix(in srgb, ${C2} 8%, white)`,
      border: `2px solid ${C2}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
    }),
    dankeH: {
      fontSize: "22px",
      fontWeight: "700" as const,
      color: "#1F2937",
      marginBottom: "8px",
    },
    dankeBody: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: 1.65,
      marginBottom: "24px",
    },
    maklerCard: {
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
      background: "#FFFFFF",
      textAlign: "left" as const,
    },
    maklerTop: {
      padding: "14px 18px",
      borderBottom: "1px solid #E5E7EB",
      background: "#fafafa",
    },
    maklerName: {
      fontSize: "15px",
      fontWeight: "700" as const,
      color: "#1F2937",
    },
    maklerFirma: {
      fontSize: "12px",
      color: "#9CA3AF",
      marginTop: "2px",
    },
    maklerLinks: {
      padding: "14px 18px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "10px",
    },
    maklerLink: (C2: string) => ({
      fontSize: "14px",
      color: C2,
      fontWeight: "600" as const,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),

    // ── BERECHNUNGSHINWEIS ────────────────────
    calcHintWrap: {
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
      marginBottom: "12px",
    },
    calcHintBtn: {
      width: "100%",
      padding: "14px 18px",
      background: "#F9FAFB",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "inherit",
    },
    calcHintBody: {
      padding: "14px 18px",
      fontSize: "13px",
      color: "#6B7280",
      lineHeight: 1.7,
      borderTop: "1px solid #E5E7EB",
      background: "#FFFFFF",
    },

    // ── RESULT HERO ───────────────────────────
    resultHero: {
      padding: "52px 24px 40px",
      textAlign: "center" as const,
      background: "#ffffff",
    },
    resultEyebrow: {
      fontSize: "12px",
      fontWeight: "500" as const,
      color: "#9CA3AF",
      letterSpacing: "0.2px",
      marginBottom: "14px",
    },
    resultNumber: (warn: boolean) => ({
      fontSize: "52px",
      fontWeight: "800" as const,
      color: warn ? "#C0392B" : C,
      letterSpacing: "-2.5px",
      lineHeight: 1,
      marginBottom: "8px",
    }),
    resultNumberNeutral: {
      fontSize: "52px",
      fontWeight: "800" as const,
      color: C,
      letterSpacing: "-2.5px",
      lineHeight: 1,
      marginBottom: "8px",
    },
    resultUnit: {
      fontSize: "14px",
      fontWeight: "400" as const,
      color: "#9CA3AF",
      letterSpacing: "0",
      marginBottom: "18px",
    },
    statusBadgeOk: {
      display: "inline-flex" as const,
      alignItems: "center" as const,
      gap: "5px",
      padding: "5px 13px",
      background: "#F0FDF4",
      border: "1px solid #BBF7D0",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600" as const,
      color: "#15803D",
    },
    statusBadgeWarn: {
      display: "inline-flex" as const,
      alignItems: "center" as const,
      gap: "5px",
      padding: "5px 13px",
      background: "#FFF6F5",
      border: "1px solid #F2D4D0",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600" as const,
      color: "#C0392B",
    },
    statusBadgeInfo: {
      display: "inline-flex" as const,
      alignItems: "center" as const,
      gap: "5px",
      padding: "5px 13px",
      background: "#F0F9FF",
      border: "1px solid #BAE6FD",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600" as const,
      color: "#0369A1",
    },
    resultSub: {
      fontSize: "13px",
      color: "#9CA3AF",
      lineHeight: 1.55,
      marginTop: "12px",
    },

    // ── CARD HIERARCHY ────────────────────────
    cardPrimary: {
      border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: "20px",
      overflow: "hidden",
      background: "#FFFFFF",
      boxShadow: "0 6px 24px rgba(17,24,39,0.08)",
    },
    cardContext: {
      background: "#FAFAF8",
      border: "1px solid rgba(17,24,39,0.05)",
      borderRadius: "16px",
      padding: "18px 20px",
    },
    warnCard: {
      background: "#FFF6F5",
      border: "1px solid #F2D4D0",
      borderLeft: "3px solid #C0392B",
      borderRadius: "14px",
      padding: "18px 20px",
    },
    warnCardTitle: {
      fontSize: "13px",
      fontWeight: "700" as const,
      color: "#C0392B",
      marginBottom: "6px",
    },
    warnCardText: {
      fontSize: "13px",
      color: "#7B2A2A",
      lineHeight: 1.65,
    },

    // ── SECTION LABEL (UPGRADED) ──────────────
    sectionLbl: {
      fontSize: "13px",
      fontWeight: "600" as const,
      color: "#6B7280",
      marginBottom: "12px",
      letterSpacing: "0",
    },

    // ── PROGRESS BAR (UPGRADED) ───────────────
    progBarTrack: {
      height: "10px",
      background: "#F3F4F6",
      borderRadius: "999px",
      overflow: "hidden",
    },
    progBarFill: (pct: number, color: string) => ({
      height: "100%",
      width: `${pct}%`,
      background: color,
      borderRadius: "999px",
      transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
    }),

    // ── DATA ROWS (EDITORIAL) ─────────────────
    dataRow: {
      padding: "14px 20px",
      borderBottom: "1px solid rgba(17,24,39,0.04)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dataRowLast: {
      padding: "14px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dataLabel: {
      fontSize: "14px",
      color: "#6B7280",
    },
    dataValue: {
      fontSize: "15px",
      fontWeight: "600" as const,
      color: "#1F2937",
      letterSpacing: "-0.2px",
    },
    dataValueAccent: {
      fontSize: "15px",
      fontWeight: "700" as const,
      color: C,
      letterSpacing: "-0.3px",
    },
    dataValueWarn: {
      fontSize: "15px",
      fontWeight: "700" as const,
      color: "#C0392B",
      letterSpacing: "-0.3px",
    },

    // ── RECOMMENDATION ROW ────────────────────
    recCard: {
      border: "1px solid rgba(17,24,39,0.08)",
      borderRadius: "18px",
      overflow: "hidden",
      background: "#FFFFFF",
      boxShadow: "0 4px 16px rgba(17,24,39,0.06)",
    },
    recRow: {
      padding: "18px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottom: "1px solid rgba(17,24,39,0.04)",
    },
    recRowLast: {
      padding: "18px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    recLabel: {
      fontSize: "14px",
      fontWeight: "600" as const,
      color: "#1F2937",
    },
    recSub: {
      fontSize: "12px",
      color: "#9CA3AF",
      marginTop: "3px",
      lineHeight: 1.4,
    },
    recValue: (C2: string) => ({
      fontSize: "18px",
      fontWeight: "700" as const,
      color: C2,
      letterSpacing: "-0.5px",
      textAlign: "right" as const,
      flexShrink: 0,
      marginLeft: "12px",
    }),
    recValueSub: {
      fontSize: "11px",
      color: "#9CA3AF",
      textAlign: "right" as const,
      marginTop: "2px",
    },

    // ── FADE IN ANIMATION ─────────────────────
    fadeIn: {
      animation: "fadeIn 0.28s ease",
    },

    // ── SECTION PADDING ───────────────────────
    section: {
      padding: "0 24px",
      marginBottom: "20px",
    },

    // ── Legacy (bestehende Checks / CheckKit) ─
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoMk: logoMark,
    prog: {
      height: "6px",
      background: "rgba(31,41,55,0.08)",
      borderRadius: "999px",
      overflow: "hidden",
    },
    progFil: progFillFn,
    body: hint,
    divider: {
      height: "1px",
      background: "#E5E7EB",
      margin: "0 24px 20px",
    },
    card: {
      border: "1px solid rgba(17,24,39,0.06)",
      borderRadius: "18px",
      overflow: "hidden",
      background: "#FFFFFF",
      boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
    },
    row: multiRow,
    rowLast: multiRowLast,
    fldHint: inputHint,
    inputEl: input,
    optBtn: (a: boolean) => ({
      padding: "9px 14px",
      borderRadius: "999px",
      border: `1px solid ${a ? C : "rgba(17,24,39,0.06)"}`,
      background: a ? C : "#fff",
      fontSize: "13px",
      fontWeight: a ? "600" : "400",
      color: a ? "#fff" : "#444",
      transition: "all 0.15s",
      cursor: "pointer",
    }),
  };
};

export type CheckT = ReturnType<typeof checkStandardT>;

/** @deprecated Nutze CheckT */
export type CheckTheme = CheckT;

export function checkPageAccent(theme: CheckT, accent: string): CSSProperties {
  return { ...theme.page, ["--accent"]: accent } as CSSProperties;
}

export const standardCheckT = checkStandardT;
