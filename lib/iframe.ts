// lib/iframe.ts
// Generiert den personalisierten iFrame-Code für Makler nach dem Kauf

import { demoPagePath } from "./demoPaths";

export type IFrameConfig = {
  slug:   string;
  name:   string;
  firma:  string;
  email:  string;
  tel?:   string;
  farbe:  string;  // ohne #
};

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://checkkit.de';

// ─── URL mit Parametern ───────────────────────────────────────────────────────
export function buildDemoUrl(config: IFrameConfig): string {
  const params = new URLSearchParams({
    name:  config.name,
    firma: config.firma,
    email: config.email,
    farbe: config.farbe.replace('#', ''),
    ...(config.tel ? { tel: config.tel } : {}),
  });
  return `${BASE_URL.replace(/\/$/, "")}${demoPagePath(config.slug)}?${params.toString()}`;
}

// ─── Fertiger iFrame-Code ─────────────────────────────────────────────────────
export function buildIFrameCode(config: IFrameConfig): string {
  const url = buildDemoUrl(config);
  return `<iframe
  src="${url}"
  width="100%"
  height="750"
  frameborder="0"
  scrolling="no"
  style="border:none;border-radius:16px;overflow:hidden;"
  title="${config.firma} — Interaktiver Check"
></iframe>`;
}

// ─── Responsiver Wrapper (optional, für Makler die es brauchen) ───────────────
export function buildResponsiveCode(config: IFrameConfig): string {
  const url = buildDemoUrl(config);
  return `<div style="position:relative;width:100%;max-width:480px;margin:0 auto;">
  <iframe
    src="${url}"
    width="100%"
    height="750"
    frameborder="0"
    scrolling="no"
    style="border:none;border-radius:16px;overflow:hidden;display:block;"
    title="${config.firma} — Interaktiver Check"
  ></iframe>
</div>`;
}
