"use client";

import { MAKLER } from "@/lib/config";
import { alpha } from "@/lib/utils";

export type ShellProps = {
  icon: string;
  badge: string;
  badgeColor?: string;
  progPct: number;
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
};

export default function Shell({
  icon,
  badge,
  badgeColor = MAKLER.primaryColor,
  progPct,
  eyebrow,
  title,
  lead,
  children,
  footer,
  onBack,
}: ShellProps) {
  const pct = Math.min(100, Math.max(0, progPct));
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f5f4f0",
        color: "#0d0d0d",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
                color: "rgba(0,0,0,0.45)",
                padding: 4,
              }}
              aria-label="Zurück"
            >
              ←
            </button>
          )}
          <span style={{ fontSize: 18 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{MAKLER.firma}</div>
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            background: alpha(badgeColor, 0.12),
            color: badgeColor,
          }}
        >
          {badge}
        </div>
      </header>
      <div style={{ height: 3, background: "#ebebeb" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: badgeColor,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <main style={{ padding: "20px 16px 120px" }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: badgeColor,
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </div>
        )}
        {title && (
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            {title}
          </h1>
        )}
        {lead && (
          <p
            style={{
              fontSize: 13,
              color: "rgba(0,0,0,0.45)",
              lineHeight: 1.55,
              marginBottom: 24,
            }}
          >
            {lead}
          </p>
        )}
        {children}
      </main>
      {footer && (
        <footer
          style={{
            position: "sticky",
            bottom: 0,
            background: "rgba(245,244,240,0.95)",
            backdropFilter: "blur(12px)",
            padding: "12px 16px 24px",
            borderTop: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
