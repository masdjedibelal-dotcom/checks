"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect } from "react";
import { CHECKKIT_RESULT_GRID_CLASS, ensureCheckKitResultGridStyles } from "@/lib/checkKitStandard2026";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Phase-3-Ergebnis: drei Säulen-Bereiche immer untereinander (alle Viewports).
 */
export function CheckKitResultGrid({ children, className = "", style }: Props) {
  useLayoutEffect(() => {
    ensureCheckKitResultGridStyles();
  }, []);

  const cn = [CHECKKIT_RESULT_GRID_CLASS, "check-result-grid-3col", className].filter(Boolean).join(" ");

  return (
    <div className={cn} style={style}>
      {children}
    </div>
  );
}
