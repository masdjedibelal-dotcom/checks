/**
 * Demo-Route: Lazy geladene Checks (`ssr: false`) für iframe / Einbettung.
 * Die eigentlichen `dynamic()`-Imports liegen in `DemoCheckClient.tsx` (Client Boundary).
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShellWrapper from "@/components/ui/ShellWrapper";
import { KATALOG } from "@/lib/katalog";
import { isKnownDemoSlug, templateForDemoSlug } from "@/lib/demoCheckMap";
import DemoCheckClient from "./DemoCheckClient";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return KATALOG.map((t) => ({ slug: t.slug }));
}

export default function DemoPage({ params }: Props) {
  const t = KATALOG.find((x) => x.slug === params.slug);
  if (!t) notFound();
  if (!isKnownDemoSlug(params.slug)) notFound();

  return (
    <Suspense fallback={<div className="h-[100dvh] bg-[#f5f4f0]" />}>
      <ShellWrapper isDemoMode slug={params.slug}>
        <div className="min-h-[100dvh] bg-[#f5f4f0]">
          <DemoCheckClient slug={params.slug} />
        </div>
      </ShellWrapper>
    </Suspense>
  );
}

export function generateMetadata({ params }: Props): Metadata {
  const tmpl = templateForDemoSlug(params.slug);
  return {
    title: tmpl ? `${tmpl.name} — CheckKit` : "CheckKit",
    description: tmpl?.desc,
    robots: { index: false, follow: false },
  };
}
