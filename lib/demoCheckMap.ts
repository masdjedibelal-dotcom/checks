import type { ComponentType } from "react";
import { type Template, KATALOG } from "@/lib/katalog";
import Bedarfscheck from "@/components/checks/Bedarfscheck";
import JahresCheck from "@/components/checks/JahresCheck";
import BUKTGRechner from "@/components/checks/BUKTGRechner";
import RentenRechnerV2 from "@/components/checks/Renten_Rechner_v2";
import RisikolebenRechner from "@/components/checks/Risikoleben_Rechner";
import ZinseszinsVisualisierer from "@/components/checks/ZinseszinsVisualisierer";
import GKVPKVRechner from "@/components/checks/GKVPKVRechner";
import AnschlussfinanzierungRechner from "@/components/checks/AnschlussfinanzierungRecher";
import ProduktCheckBu from "@/components/checks/ProduktCheckBu";
import ElternzeitRechner from "@/components/checks/Elternzeit_Rechner_v2";
import ProduktCheckRiester from "@/components/checks/ProduktCheckRiester";
import NachwuchsCheck from "@/components/checks/NachwuchsCheck";
import WohngebaeudeRechner from "@/components/checks/WohngebaeudeRechner";
import SelbststaendigenRechner from "@/components/checks/SelbststaendigenRechner";
import SteuerlastOptimierer from "@/components/checks/SteuerlastOptimierer";
import MietVsKaufRechner from "@/components/checks/MietVsKaufRechner";
import KinderkostenRechner from "@/components/checks/KinderkostenRechner";
import ETFSparplanRechner from "@/components/checks/ETFSparplanRechner";
import FIRERechner from "@/components/checks/FIRERechner";
import RentenzeitpunktOptimierer from "@/components/checks/RentenzeitpunktOptimierer";
import PflegekostenplanungRechner from "@/components/checks/PflegekostenplanungRechner";
import SchenkungErbschaftRechner from "@/components/checks/SchenkungErbschaftRechner";

/** Jeder Katalog-Slug muss genau eine Check-Komponente haben (gleiches Verhalten wie Bedarfscheck-Demo). */
export type DemoSlug = (typeof KATALOG)[number]["slug"];

export const DEMO_CHECK_MAP = {
  bedarfscheck: Bedarfscheck,
  jahrescheck: JahresCheck,
  "bu-ktg": BUKTGRechner,
  rente: RentenRechnerV2,
  risikoleben: RisikolebenRechner,
  zinseszins: ZinseszinsVisualisierer,
  "gkv-pkv": GKVPKVRechner,
  anschluss: AnschlussfinanzierungRechner,
  "bu-check": ProduktCheckBu,
  elternzeit: ElternzeitRechner,
  riester: ProduktCheckRiester,
  nachwuchs: NachwuchsCheck,
  wohngebaeude: WohngebaeudeRechner,
  selbststaendig: SelbststaendigenRechner,
  steuer: SteuerlastOptimierer,
  "miet-kauf": MietVsKaufRechner,
  kinderkosten: KinderkostenRechner,
  etf: ETFSparplanRechner,
  fire: FIRERechner,
  rentenzeitpunkt: RentenzeitpunktOptimierer,
  pflege: PflegekostenplanungRechner,
  erbschaft: SchenkungErbschaftRechner,
} as const satisfies Record<DemoSlug, ComponentType>;

export function isKnownDemoSlug(slug: string): slug is DemoSlug {
  return Object.prototype.hasOwnProperty.call(DEMO_CHECK_MAP, slug);
}

export function getDemoCheck(slug: string): ComponentType | undefined {
  if (!isKnownDemoSlug(slug)) return undefined;
  return DEMO_CHECK_MAP[slug as keyof typeof DEMO_CHECK_MAP];
}

/** Für Metadaten / Validierung */
export function templateForDemoSlug(slug: string): Template | undefined {
  return KATALOG.find((t) => t.slug === slug);
}
