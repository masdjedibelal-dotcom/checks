"use client";

import type { MaklerConfig } from "@/components/ui/MaklerContext";

type Props = {
  name: string;
  onBack: () => void;
  makler: MaklerConfig;
  accent: string;
};

export default function CheckKitDanke({ name, onBack, makler, accent }: Props) {
  const C = accent;
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }} className="fade-in">
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: `1.5px solid ${C}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10l4.5 4.5L16 6"
            stroke={C}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#111",
          marginBottom: "8px",
        }}
      >
        {name ? `Danke, ${name.split(" ")[0]}.` : "Anfrage gesendet."}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: "#666",
          lineHeight: 1.65,
          marginBottom: "32px",
        }}
      >
        Wir melden uns innerhalb von 24 Stunden.
      </div>
      <div
        style={{
          border: "1px solid #e8e8e8",
          borderRadius: "10px",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111" }}>{makler.name}</div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <a href={`tel:${makler.telefon}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>
            {makler.telefon}
          </a>
          <a href={`mailto:${makler.email}`} style={{ fontSize: "13px", color: C, fontWeight: "500" }}>
            {makler.email}
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={onBack}
        style={{ marginTop: "20px", fontSize: "13px", color: "#aaa", cursor: "pointer" }}
      >
        Neue Berechnung starten
      </button>
    </div>
  );
}
