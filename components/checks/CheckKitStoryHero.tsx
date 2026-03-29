"use client";

import type { ReactNode } from "react";
import { CHECKKIT2026 } from "@/lib/checkKitStandard2026";

type Props = {
  emoji?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  text?: string;
  children?: ReactNode;
  /** Vertikal zentriert in der Höhe unter dem Header */
  fillViewport?: boolean;
  /** Kein 120px-Spacer (z. B. wenn danach noch Blöcke vor dem Footer kommen) */
  hideFooterSpacer?: boolean;
};

/**
 * Globaler Story-/Bridge-Block (Checkkit 2026)
 * Reihenfolge: optional Eyebrow → Emoji → H1 → optional Subtitle → optional Fließtext → children
 */
export function CheckKitStoryHero({
  emoji,
  eyebrow,
  title,
  subtitle,
  text,
  children,
  fillViewport,
  hideFooterSpacer,
}: Props) {
  const block = (
    <>
      <div style={CHECKKIT2026.storySection}>
        <div style={CHECKKIT2026.storyContentWrap}>
          {eyebrow ? <div style={CHECKKIT2026.storyEyebrow}>{eyebrow}</div> : null}
          {emoji ? (
            <div style={CHECKKIT2026.storyEmoji} aria-hidden>
              {emoji}
            </div>
          ) : null}
          <h1 style={CHECKKIT2026.storyH1}>{title}</h1>
          {subtitle ? <p style={CHECKKIT2026.storySubtitle}>{subtitle}</p> : null}
          {text ? <p style={CHECKKIT2026.storyBody}>{text}</p> : null}
          {children}
        </div>
      </div>
      {!hideFooterSpacer ? (
        <div style={{ height: CHECKKIT2026.footerSpacerPx, flexShrink: 0 }} aria-hidden />
      ) : null}
    </>
  );

  if (fillViewport) {
    return (
      <div style={CHECKKIT2026.storyRoot}>
        <div
          style={{
            minHeight: CHECKKIT2026.storyScreenMinHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {block}
        </div>
      </div>
    );
  }

  return <div style={CHECKKIT2026.storyRoot}>{block}</div>;
}
