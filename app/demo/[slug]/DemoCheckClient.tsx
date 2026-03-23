"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoSlug } from "@/lib/demoCheckMap";

/**
 * gkv-pkv → GKVPKVRechner.jsx
 * risikoleben → Risikoleben_Rechner.jsx
 * (einheitliches Layout: Inter / Helvetica-Stack, Header 52px, sticky Footer, SliderCard aus CheckComponents)
 */
const CHECKS: Record<DemoSlug, ComponentType> = {
  bedarfscheck: dynamic(() => import("@/components/checks/Bedarfscheck"), {
    ssr: false,
  }),
  "lebenssituations-check": dynamic(
    () => import("@/components/checks/JahresCheck"),
    { ssr: false },
  ),
  "einkommens-check": dynamic(
    () => import("@/components/checks/BUKTGRechner"),
    { ssr: false },
  ),
  "gkv-pkv": dynamic(() => import("@/components/checks/GKVPKVRechner"), {
    ssr: false,
  }),
  "vorsorge-check": dynamic(
    () => import("@/components/checks/RentenRechner"),
    { ssr: false },
  ),
  risikoleben: dynamic(
    () => import("@/components/checks/Risikoleben_Rechner"),
    { ssr: false },
  ),
  "pflege-check": dynamic(
    () => import("@/components/checks/PflegekostenplanungRechner"),
    { ssr: false },
  ),
  "immobilien-check": dynamic(
    () => import("@/components/checks/ImmobilienCheck_v2"),
    { ssr: false },
  ),
};

export default function DemoCheckClient({ slug }: { slug: DemoSlug }) {
  const Check = CHECKS[slug];
  return <Check />;
}
