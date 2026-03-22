import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShellWrapper from "@/components/ui/ShellWrapper";
import { KATALOG } from "@/lib/katalog";
import { getDemoCheck, templateForDemoSlug } from "@/lib/demoCheckMap";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return KATALOG.map((t) => ({ slug: t.slug }));
}

export default function DemoPage({ params }: Props) {
  const t = KATALOG.find((x) => x.slug === params.slug);
  if (!t) notFound();
  const Check = getDemoCheck(params.slug);
  if (!Check) notFound();

  return (
    <Suspense fallback={<div className="h-[100dvh] bg-[#f5f4f0]" />}>
      <ShellWrapper>
        <div className="min-h-[100dvh] bg-[#f5f4f0]">
          <Check />
        </div>
      </ShellWrapper>
    </Suspense>
  );
}

export function generateMetadata({ params }: Props): Metadata {
  const t = templateForDemoSlug(params.slug);
  return {
    title: t ? `${t.name} — CheckKit` : "CheckKit",
    description: t?.desc,
    robots: { index: false, follow: false },
  };
}
