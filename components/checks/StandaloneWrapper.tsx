"use client";

import { useEffect, useState, type ReactNode } from "react";

type StandaloneWrapperProps = {
  /** Makler-Daten aus useCheckConfig */
  makler: {
    name: string;
    firma: string;
    telefon: string;
    email: string;
    primaryColor: string;
  };
  /** Der Rechner-Inhalt */
  children: ReactNode;
};

function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    // Ist nicht in einem iFrame UND hat einen token-Parameter
    const inIframe = window.self !== window.top;
    const hasToken = new URLSearchParams(window.location.search).has("token");
    setStandalone(!inIframe && hasToken);
  }, []);
  return standalone;
}

export function StandaloneWrapper({ makler, children }: StandaloneWrapperProps) {
  const isStandalone = useIsStandalone();
  const C = makler.primaryColor;

  if (!isStandalone) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Makler-Zeile (Logo + Anruf) kommt aus ShellWrapper — hier nur Inhalt + Mini-Footer */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* ── Standalone Mini-Footer ── */}
      <div style={{
        background: "#F9FAFB",
        borderTop: "1px solid rgba(31,41,55,0.06)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>
          <span style={{ fontWeight: "600", color: "#374151" }}>{makler.name}</span>
          {" · "}{makler.firma}
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <a href={`tel:${makler.telefon}`} style={{
            fontSize: "12px",
            color: C,
            fontWeight: "600",
            textDecoration: "none",
          }}>
            {makler.telefon}
          </a>
          <a href={`mailto:${makler.email}`} style={{
            fontSize: "12px",
            color: C,
            fontWeight: "600",
            textDecoration: "none",
          }}>
            {makler.email}
          </a>
        </div>
      </div>

    </div>
  );
}
