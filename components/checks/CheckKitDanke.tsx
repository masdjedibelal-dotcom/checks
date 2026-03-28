"use client";

import { checkStandardT } from "@/lib/checkStandardT";
import { DankeScreen } from "@/components/ui/CheckComponents";
import type { MaklerConfig } from "@/components/ui/MaklerContext";

type Props = {
  name: string;
  onBack: () => void;
  makler: MaklerConfig;
  accent: string;
};

export default function CheckKitDanke({ name, onBack, makler, accent }: Props) {
  const T = checkStandardT(accent);
  return (
    <DankeScreen
      T={T}
      C={accent}
      name={name}
      makler={makler}
      onBack={onBack}
    />
  );
}
