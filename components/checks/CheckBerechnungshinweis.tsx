"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { checkStandardT } from "@/lib/checkStandardT";
import type { CheckT } from "@/lib/checkStandardT";

/** Gesetzes-/Normverweise im Hinweistext: `<CheckGesetzRef>§ 123 SGB VI</CheckGesetzRef>` */
export { CheckGesetzRef, CHECK_GES_REF_STYLE } from "@/components/ui/CheckComponents";

const FALLBACK = checkStandardT("#1a3a5c");

interface Props {
  children: ReactNode;
  /** Styles aus checkStandardT(C) — sonst Fallback */
  t?: CheckT;
  /** Optional: rechtlicher oder fachlicher Zusatztext, immer sichtbar unter dem Aufklapp-Bereich */
  footer?: ReactNode;
}

const calcHintFooter: CSSProperties = {
  padding: "12px 18px 14px",
  fontSize: "11px",
  color: "#868686",
  lineHeight: 1.6,
  borderTop: "1px solid #EAE5DC",
  background: "#F7F6F3",
};

export function CheckBerechnungshinweis({ children, t, footer }: Props) {
  const H = t ?? FALLBACK;
  const [open, setOpen] = useState(false);
  return (
    <div style={H.calcHintWrap}>
      <button type="button" onClick={() => setOpen((x) => !x)} style={H.calcHintBtn}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="6" stroke="#98A2B3" strokeWidth="1.2" />
            <path
              d="M7 6v4M7 4.5v.5"
              stroke="#98A2B3"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Wie berechnen wir das?
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="#98A2B3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div style={H.calcHintBody}>{children}</div>}
      {footer != null ? <div style={calcHintFooter}>{footer}</div> : null}
    </div>
  );
}
