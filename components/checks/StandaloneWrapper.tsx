"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";

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
  /** Label für den Header z.B. "Vorsorge-Check" */
  checkLabel?: string;
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

export function StandaloneWrapper({ makler, children, checkLabel }: StandaloneWrapperProps) {
  const isStandalone = useIsStandalone();
  const C = makler.primaryColor;

  if (!isStandalone) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>

      {/* ── Standalone Header ── */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid rgba(31,41,55,0.08)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: C,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}>
            <MaklerFirmaAvatarInitials firma={makler.firma} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#111827",
              letterSpacing: "-0.1px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {makler.firma}
            </div>
            {checkLabel && (
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>
                {checkLabel}
              </div>
            )}
          </div>
        </div>
        <a
          href={`tel:${makler.telefon}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 12px",
            borderRadius: "999px",
            border: `1px solid ${C}40`,
            background: `${C}0d`,
            color: C,
            fontSize: "12px",
            fontWeight: "600",
            textDecoration: "none",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 2.5C2 2.5 3 4.5 4.5 6S9.5 10 9.5 10l1-1.5-2-1.5-1 1c-.5-.3-1.5-1-2-2S4.5 4 4.5 4L3.5 3 2 2.5z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {makler.telefon}
        </a>
      </div>

      {/* ── Rechner-Inhalt ── */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

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
