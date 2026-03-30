"use client";

import { maklerFirmaInitials } from "@/lib/maklerFirmaInitials";

export function MaklerFirmaAvatarInitials({ firma }: { firma: string }) {
  return (
    <span
      style={{
        fontSize: "16px",
        fontWeight: "700",
        color: "#fff",
        letterSpacing: "-0.5px",
      }}
    >
      {maklerFirmaInitials(firma)}
    </span>
  );
}
