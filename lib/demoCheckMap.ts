import { type Template, KATALOG } from "@/lib/katalog";

export type DemoSlug = (typeof KATALOG)[number]["slug"];

export function isKnownDemoSlug(slug: string): slug is DemoSlug {
  return KATALOG.some((t) => t.slug === slug);
}

/** Für Metadaten / Validierung */
export function templateForDemoSlug(slug: string): Template | undefined {
  return KATALOG.find((t) => t.slug === slug);
}
