import type { CSSProperties } from "react";

export type CheckTheme = {
  page: CSSProperties & { ["--accent"]?: string };
  header: CSSProperties;
  logo: CSSProperties;
  logoMk: CSSProperties;
  badge: CSSProperties;
  prog: CSSProperties;
  progFil: (w: number) => CSSProperties;
  hero: CSSProperties;
  eyebrow: CSSProperties;
  h1: CSSProperties;
  body: CSSProperties;
  section: CSSProperties;
  divider: CSSProperties;
  card: CSSProperties;
  row: CSSProperties;
  rowLast: CSSProperties;
  fldLbl: CSSProperties;
  fldHint: CSSProperties;
  footer: CSSProperties;
  btnPrim: (d: boolean) => CSSProperties;
  btnSec: CSSProperties;
  infoBox: CSSProperties;
  inputEl: CSSProperties;
  optBtn: (a: boolean) => CSSProperties;
};

/** Root-Container inkl. CSS-Variable für Range-Slider (--accent). */
export function checkPageAccent(theme: CheckTheme, accent: string): CSSProperties {
  return { ...theme.page, ["--accent"]: accent } as CSSProperties;
}

export function standardCheckT(C: string): CheckTheme {
  return {
    page: {
      minHeight: "100vh",
      background: "#fff",
      fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    header: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid #e8e8e8",
      padding: "0 24px",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoMk: {
      width: "28px",
      height: "28px",
      borderRadius: "6px",
      background: C,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      fontSize: "11px",
      fontWeight: "500",
      color: "#888",
      letterSpacing: "0.3px",
      textTransform: "uppercase",
    },
    prog: { height: "2px", background: "#f0f0f0" },
    progFil: (w) => ({
      height: "100%",
      width: `${w}%`,
      background: C,
      transition: "width 0.4s ease",
    }),
    hero: { padding: "32px 24px 16px" },
    eyebrow: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#999",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: "6px",
    },
    h1: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#111",
      lineHeight: 1.25,
      letterSpacing: "-0.5px",
    },
    body: {
      fontSize: "14px",
      color: "#666",
      lineHeight: 1.65,
      marginTop: "6px",
    },
    section: { padding: "0 24px", marginBottom: "20px" },
    divider: { height: "1px", background: "#f0f0f0", margin: "0 24px 20px" },
    card: { border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" },
    row: { padding: "14px 16px", borderBottom: "1px solid #f0f0f0" },
    rowLast: { padding: "14px 16px" },
    fldLbl: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#444",
      display: "block",
      marginBottom: "8px",
    },
    fldHint: { fontSize: "11px", color: "#aaa", marginTop: "6px" },
    footer: {
      position: "sticky",
      bottom: 0,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderTop: "1px solid #e8e8e8",
      padding: "14px 24px 28px",
    },
    btnPrim: (d) => ({
      width: "100%",
      padding: "13px 20px",
      background: d ? "#e8e8e8" : C,
      color: d ? "#aaa" : "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: d ? "default" : "pointer",
    }),
    btnSec: {
      width: "100%",
      padding: "10px",
      color: "#aaa",
      fontSize: "13px",
      marginTop: "6px",
      cursor: "pointer",
    },
    infoBox: {
      padding: "12px 14px",
      background: "#f9f9f9",
      borderRadius: "8px",
      fontSize: "12px",
      color: "#666",
      lineHeight: 1.6,
    },
    inputEl: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e8e8e8",
      borderRadius: "6px",
      fontSize: "14px",
      color: "#111",
      background: "#fff",
      outline: "none",
    },
    optBtn: (a) => ({
      padding: "9px 14px",
      borderRadius: "6px",
      border: `1px solid ${a ? C : "#e8e8e8"}`,
      background: a ? C : "#fff",
      fontSize: "13px",
      fontWeight: a ? "600" : "400",
      color: a ? "#fff" : "#444",
      transition: "all 0.15s",
      cursor: "pointer",
    }),
  };
}
