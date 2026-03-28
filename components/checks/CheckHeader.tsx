"use client";

import type { ReactNode } from "react";
import type { CheckT } from "@/lib/checkStandardT";

type Props = {
  T: CheckT;
  firma: string;
  badge: string;
  /** Aktueller Schritt (1-basiert) */
  phase: number;
  /** Gesamt-Schritte für Progress-Text und -Fill */
  total: number;
  /** Optional: Fill überschreiben (0–100), z. B. wenn nicht phase/total */
  fillPct?: number;
  logo: ReactNode;
};

export function CheckHeader({ T, firma, badge, phase, total, fillPct, logo }: Props) {
  const pct = fillPct != null ? fillPct : total > 0 ? (phase / total) * 100 : 0;
  const metaText =
    pct >= 100
      ? "Dein Ergebnis ist bereit ✓"
      : `Fast geschafft · Schritt ${phase} von ${total}`;

  return (
    <>
      <div style={T.header}>
        <div style={T.logo}>
          <div style={T.logoMark}>{logo}</div>
          <span style={T.logoName}>{firma}</span>
        </div>
        <span style={T.badge}>{badge}</span>
      </div>
      <div style={T.progWrap}>
        <div
          style={{
            ...T.progTrack,
            borderRadius: "999px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div style={T.progFill(Math.min(100, Math.max(0, pct)))} />
        </div>
        <div style={T.progMeta}>{metaText}</div>
      </div>
    </>
  );
}
