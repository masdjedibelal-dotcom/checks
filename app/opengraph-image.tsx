import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0F172A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#ffffff",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M16 14H30V18H20V22H28V26H20V34H16V14Z" fill="#0F172A" />
              <path d="M32 14H36V34H26V30H32V14Z" fill="#0F172A" />
            </svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", letterSpacing: -0.5 }}>
            FlowLeads
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#b8884a",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Für Versicherungsmakler
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            Mehr Anfragen.{"\n"}
            <span style={{ color: "#b8884a" }}>Weniger Aufwand.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            Fertige Microsites mit Rechnern — zur Leadgenerierung, Bedarfsanalyse oder live in der Beratung.
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>getflowleads.com</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["Einmal kaufen", "Kein Abo", "Sofort einsetzbar"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
