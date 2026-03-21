import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { KATALOG } from "@/lib/katalog";
import Bedarfscheck from "@/components/checks/Bedarfscheck";
import JahresCheck from "@/components/checks/JahresCheck";
import BUKTGRechner from "@/components/checks/BUKTGRechner";
import RentenRechner from "@/components/checks/RentenRechner";
import RisikolebenRechner from "@/components/checks/RisikolebenRechner";
import ZinseszinsVisualisierer from "@/components/checks/ZinseszinsVisualisierer";
import GKVPKVRechner from "@/components/checks/GKVPKVRechner";
import AnschlussfinanzierungRechner from "@/components/checks/AnschlussfinanzierungRechner";
import ProduktCheckBu from "@/components/checks/ProduktCheckBu";
import ElternzeitRechner from "@/components/checks/ElternzeitRechner";
import ProduktCheckRiester from "@/components/checks/ProduktCheckRiester";

const MAP: Record<string, ComponentType> = {
  bedarfscheck: Bedarfscheck,
  jahrescheck: JahresCheck,
  "bu-ktg": BUKTGRechner,
  rente: RentenRechner,
  risikoleben: RisikolebenRechner,
  zinseszins: ZinseszinsVisualisierer,
  "gkv-pkv": GKVPKVRechner,
  anschluss: AnschlussfinanzierungRechner,
  "bu-check": ProduktCheckBu,
  elternzeit: ElternzeitRechner,
  riester: ProduktCheckRiester,
};

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return KATALOG.map((t) => ({ slug: t.slug }));
}

export default function DemoPage({ params }: Props) {
  const t = KATALOG.find((x) => x.slug === params.slug);
  if (!t) notFound();
  const C = MAP[params.slug];
  if (!C) notFound();
  return (
    <div className="h-[100dvh] bg-[#f5f4f0]">
      <C />
    </div>
  );
}
