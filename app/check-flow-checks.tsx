import { useEffect, useState, type ReactNode } from "react";

// ─── PREMIUM HERO RESULT MOCKUP ───────────────────────────────────────────────
const BAR_SEGMENTS = [
  { label: "Einkommen",         pct: 36, color: "#374151" },
  { label: "Gesetzl. Leistung", pct: 24, color: "#D1D5DB" },
  { label: "Absicherung",       pct:  5, color: "#1a3a5c" },
  { label: "Lücke",             pct: 35, color: "#EF4444" },
] as const;

const INSIGHTS = [
  "Größte Lücke ab Monat 7",
  "Bestehende Absicherung reicht nicht aus",
  "Absicherung gemeinsam prüfen",
] as const;

export function HeroResultMockup(): ReactNode {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    }}>

      {/* Glow behind phone */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(26,58,92,0.10) 0%, transparent 75%)",
        borderRadius: "32px",
        pointerEvents: "none",
      }} />

      {/* Phone frame */}
      <div style={{
        position: "relative",
        width: "min(300px, 84vw)",
        background: "#fff",
        borderRadius: "36px",
        border: "1.5px solid rgba(26,58,92,0.14)",
        boxShadow: "0 40px 80px rgba(15,23,42,0.18), 0 12px 32px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.06)",
        overflow: "hidden",
        fontFamily: "var(--font-sans), 'Inter', 'Helvetica Neue', sans-serif",
      }}>

        {/* Status bar / notch area */}
        <div style={{
          height: "32px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #F3F4F6",
        }}>
          <div style={{
            width: "72px",
            height: "8px",
            background: "#E5E7EB",
            borderRadius: "4px",
          }} />
        </div>

        {/* Progress bar */}
        <div style={{ height: "2px", background: "#F3F4F6" }}>
          <div style={{
            height: "100%",
            width: animated ? "88%" : "0%",
            background: "#1a3a5c",
            transition: "width 0.9s cubic-bezier(0.34,1.08,0.64,1)",
          }} />
        </div>

        {/* Screen content */}
        <div style={{ padding: "22px 22px 24px" }}>

          {/* Eyebrow */}
          <div style={{
            fontSize: "10px",
            fontWeight: "600",
            color: "#9CA3AF",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            Ihre Einschätzung
          </div>

          {/* Central number */}
          <div style={{
            fontSize: "48px",
            fontWeight: "800",
            color: "#0f1f35",
            letterSpacing: "-2.5px",
            lineHeight: 1,
            marginBottom: "6px",
            transition: "opacity 0.5s ease",
            opacity: animated ? 1 : 0,
          }}>
            1.850 €
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: "12px",
            color: "#9CA3AF",
            marginBottom: "22px",
            letterSpacing: "0.1px",
          }}>
            mögliche monatliche Lücke
          </div>

          {/* Segmented bar */}
          <div style={{ marginBottom: "20px" }}>
            {/* Bar track */}
            <div style={{
              display: "flex",
              height: "8px",
              borderRadius: "4px",
              overflow: "hidden",
              gap: "1px",
              marginBottom: "6px",
            }}>
              {BAR_SEGMENTS.map((seg, i) => (
                <div
                  key={seg.label}
                  style={{
                    height: "100%",
                    width: animated ? `${seg.pct}%` : "0%",
                    background: seg.color,
                    borderRadius: i === 0 ? "4px 0 0 4px" : i === BAR_SEGMENTS.length - 1 ? "0 4px 4px 0" : "0",
                    transition: `width 0.8s cubic-bezier(0.34,1.08,0.64,1) ${i * 0.07}s`,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>

            {/* Bar labels */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "2px",
            }}>
              {BAR_SEGMENTS.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    fontSize: "8.5px",
                    color: seg.color === "#D1D5DB" ? "#9CA3AF" : seg.color,
                    fontWeight: "600",
                    letterSpacing: "0.2px",
                    opacity: animated ? 1 : 0,
                    transition: "opacity 0.5s ease 0.4s",
                    maxWidth: `${seg.pct + 2}%`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {seg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#F3F4F6", marginBottom: "16px" }} />

          {/* Insight lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {INSIGHTS.map((line, i) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  opacity: animated ? 1 : 0,
                  transform: animated ? "translateY(0)" : "translateY(4px)",
                  transition: `opacity 0.4s ease ${0.3 + i * 0.08}s, transform 0.4s ease ${0.3 + i * 0.08}s`,
                }}
              >
                <div style={{
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: i === 1 ? "#EF4444" : "#9CA3AF",
                  flexShrink: 0,
                  marginTop: "5px",
                }} />
                <div style={{
                  fontSize: "11px",
                  color: i === 1 ? "#EF4444" : "#6B7280",
                  fontWeight: i === 1 ? "600" : "400",
                  lineHeight: 1.4,
                }}>
                  {line}
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div
            style={{
              background: "#1a3a5c",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "12px",
              fontWeight: "600",
              textAlign: "center",
              letterSpacing: "0.2px",
              opacity: animated ? 1 : 0,
              transform: animated ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.4s ease 0.55s, transform 0.4s ease 0.55s",
            }}
          >
            Ergebnis anfragen
          </div>
        </div>
      </div>
    </div>
  );
}

export const CHECK_FLOW_META = [
  {
    slug: "einkommens-check" as const,
    catClass: "ck-cat-schutz",
    cat: "Einkommen · Absicherung",
    name: "Einkommensabsicherung",
    hook: "Wenn Ihr Einkommen wegfällt",
    erlebnis:
      "Der Nutzer sieht, wie stark sein Einkommen einbricht und wo die finanzielle Lücke entsteht.",
    price: "59",
  },
  {
    slug: "gkv-pkv" as const,
    catClass: "ck-cat-entscheidung",
    cat: "Krankenversicherung",
    name: "PKV-Entscheidung",
    hook: "Welche Krankenversicherung zu Ihnen passt",
    erlebnis:
      "Der Nutzer bekommt eine erste Einordnung und versteht, welche Richtung für seine Situation sinnvoll ist.",
    price: "49",
  },
  {
    slug: "vorsorge-check" as const,
    catClass: "ck-cat-vorsorge",
    cat: "Altersvorsorge",
    name: "Rentenlücke",
    hook: "Wie viel Ihnen im Alter fehlen wird",
    erlebnis:
      "Der Nutzer sieht seine persönliche Rentenlücke und bekommt ein Gefühl für seine finanzielle Zukunft.",
    price: "59",
  },
  {
    slug: "risikoleben" as const,
    catClass: "ck-cat-familie",
    cat: "Familie",
    name: "Familienabsicherung",
    hook: "Wie Ihre Familie abgesichert ist",
    erlebnis:
      "Der Nutzer berechnet den finanziellen Bedarf und erkennt, welche Lücke im Ernstfall entsteht.",
    price: "59",
  },
  {
    slug: "pflege-check" as const,
    catClass: "ck-cat-pflege",
    cat: "Pflege",
    name: "Pflegekosten",
    hook: "Welche Kosten im Pflegefall entstehen",
    erlebnis:
      "Der Nutzer sieht die monatlichen Eigenanteile und versteht die tatsächliche finanzielle Belastung.",
    price: "59",
  },
  {
    slug: "bedarfscheck" as const,
    catClass: "ck-cat-neu",
    cat: "Überblick",
    name: "Absicherungspakete",
    hook: "Wie Sie sinnvoll abgesichert sind",
    erlebnis:
      "Der Nutzer bekommt eine klare Struktur aus Basis-, Rundum- und Premium-Absicherung.",
    price: "79",
  },
  {
    slug: "lebenssituations-check" as const,
    catClass: "ck-cat-neu",
    cat: "Bestand",
    name: "Jahresgespräch",
    hook: "Was sich für Sie verändert hat",
    erlebnis:
      "Der Nutzer erkennt, welche Themen durch seine aktuelle Lebenssituation relevant werden.",
    price: "79",
  },
  {
    slug: "immobilien-check" as const,
    catClass: "ck-cat-immobilien",
    cat: "Immobilie",
    name: "Immobilien",
    hook: "Was Ihre Entscheidung finanziell bedeutet",
    erlebnis:
      "Der Nutzer bekommt Klarheit bei Kauf, Finanzierung oder Absicherung seiner Immobilie.",
    price: "59",
  },
] as const;

export type CheckFlowSlug = (typeof CHECK_FLOW_META)[number]["slug"];

function PhMark9(): ReactNode {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
      <rect x=".5" y=".5" width="3" height="3" rx=".5" fill="white" />
      <rect x="5.5" y=".5" width="3" height="3" rx=".5" fill="white" opacity=".5" />
      <rect x=".5" y="5.5" width="3" height="3" rx=".5" fill="white" opacity=".5" />
      <rect x="5.5" y="5.5" width="3" height="3" rx=".5" fill="white" />
    </svg>
  );
}

/** Minimales Phone-Chrome — nur Ergebnis-Screens, keine Fragen oder CTAs */
function ResultPhoneShell({ accent, children }: { accent: string; children: ReactNode }): ReactNode {
  return (
    <div className="ck-phone-wrap">
      <div className="ph-bar" style={{ height: 2, background: accent }} />
      <div className="ph-hd" style={{ padding: "6px 8px", gap: 5, borderBottom: "1px solid #f3f4f6" }}>
        <div className="ph-logo" style={{ width: 18, height: 18, borderRadius: 5, background: accent }}>
          <PhMark9 />
        </div>
        <span className="ph-firm" style={{ fontSize: 6.5 }}>
          Mustermann Versicherungen
        </span>
      </div>
      <div className="ph-body" style={{ padding: "10px 8px 11px" }}>
        {children}
      </div>
    </div>
  );
}

export function CheckFlowPhoneMock({ slug }: { slug: CheckFlowSlug }): ReactNode {
  switch (slug) {
    case "einkommens-check":
      return (
        <ResultPhoneShell accent="#7c3aed">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.4px", color: "#111", lineHeight: 1.05 }}>
              1.850 €
            </div>
            <div style={{ fontSize: 6.5, color: "#6b7280", marginTop: 2, marginBottom: 7 }}>monatliche Lücke</div>
            <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", gap: 1, marginBottom: 3 }}>
              <div style={{ flex: 38, background: "#374151" }} />
              <div style={{ flex: 32, background: "#9ca3af" }} />
              <div style={{ flex: 30, background: "#ef4444" }} />
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 5.5,
                color: "#6b7280",
                justifyContent: "space-between",
                lineHeight: 1.2,
              }}
            >
              <span>Einkommen</span>
              <span>Krankengeld</span>
              <span style={{ color: "#ef4444", fontWeight: 700 }}>Lücke</span>
            </div>
          </div>
        </ResultPhoneShell>
      );
    case "gkv-pkv":
      return (
        <ResultPhoneShell accent="#1a3a5c">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "-0.2px", color: "#111", marginBottom: 7 }}>
              GKV oder PKV
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6, textAlign: "center" }}>
              <div style={{ background: "#f3f4f6", borderRadius: 5, padding: "5px 4px" }}>
                <div style={{ fontSize: 5, fontWeight: 600, color: "#6b7280", marginBottom: 3 }}>Beitrag</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#111" }}>412 €</div>
                <div style={{ fontSize: 5, fontWeight: 600, color: "#6b7280", marginTop: 5, marginBottom: 2 }}>Situation</div>
                <div style={{ fontSize: 6, fontWeight: 600, color: "#374151", lineHeight: 1.25 }}>Angestellt</div>
              </div>
              <div style={{ background: "#eff6ff", borderRadius: 5, padding: "5px 4px" }}>
                <div style={{ fontSize: 5, fontWeight: 600, color: "#6b7280", marginBottom: 3 }}>Beitrag</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#1d4ed8" }}>298 €</div>
                <div style={{ fontSize: 5, fontWeight: 600, color: "#6b7280", marginTop: 5, marginBottom: 2 }}>Situation</div>
                <div style={{ fontSize: 6, fontWeight: 600, color: "#1e40af", lineHeight: 1.25 }}>Gesund</div>
              </div>
            </div>
            <div style={{ fontSize: 5, color: "#9ca3af", lineHeight: 1.4, padding: "0 2px" }}>
              Einschätzung auf Basis Ihrer Angaben
            </div>
          </div>
        </ResultPhoneShell>
      );
    case "vorsorge-check":
      return (
        <ResultPhoneShell accent="#059669">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.4px", color: "#111", lineHeight: 1.05 }}>
              1.200 €
            </div>
            <div style={{ fontSize: 6.5, color: "#6b7280", marginTop: 2, marginBottom: 8 }}>monatliche Rentenlücke</div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 5.5, fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                <span>Heute</span>
                <span>72%</span>
              </div>
              <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "72%", height: "100%", background: "#059669", borderRadius: 3 }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 5.5, fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                <span>Alter</span>
                <span>48%</span>
              </div>
              <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "48%", height: "100%", background: "#94a3b8", borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </ResultPhoneShell>
      );
    case "risikoleben":
      return (
        <ResultPhoneShell accent="#9d174d">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.35px", color: "#111", lineHeight: 1.05 }}>
              250.000 €
            </div>
            <div style={{ fontSize: 6.5, color: "#6b7280", marginTop: 2, marginBottom: 6 }}>Absicherungsbedarf</div>
            <div style={{ fontSize: 6.5, fontWeight: 600, color: "#374151" }}>für Ihre Familie</div>
          </div>
        </ResultPhoneShell>
      );
    case "pflege-check":
      return (
        <ResultPhoneShell accent="#0369a1">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.4px", color: "#111", lineHeight: 1.05 }}>
              2.300 €
            </div>
            <div style={{ fontSize: 6.5, color: "#6b7280", marginTop: 2, marginBottom: 6 }}>monatlicher Eigenanteil</div>
            <div style={{ fontSize: 6.5, fontWeight: 600, color: "#374151" }}>Pflegeheim</div>
          </div>
        </ResultPhoneShell>
      );
    case "bedarfscheck":
      return (
        <ResultPhoneShell accent="#78716c">
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ borderRadius: 5, border: "1px solid #e7e5e4", padding: "4px 5px", background: "#fafaf9" }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: "#1c1917", marginBottom: 3 }}>Basis</div>
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ Haftpflicht</div>
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ BU</div>
            </div>
            <div
              style={{
                borderRadius: 5,
                border: "1.5px solid #a8a29e",
                padding: "4px 5px",
                background: "#f5f5f4",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 7, fontWeight: 800, color: "#292524", marginBottom: 3 }}>Rundum</div>
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ + Krankentagegeld</div>
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ + Risikoleben</div>
            </div>
            <div style={{ borderRadius: 5, border: "1px solid #e7e5e4", padding: "4px 5px", background: "#fafaf9" }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: "#1c1917", marginBottom: 3 }}>Premium</div>
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ + Vorsorge</div>
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ + Pflege</div>
            </div>
          </div>
        </ResultPhoneShell>
      );
    case "lebenssituations-check":
      return (
        <ResultPhoneShell accent="#166534">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "-0.25px", color: "#111", marginBottom: 7 }}>
              3 Themen relevant
            </div>
            <div style={{ textAlign: "left", borderTop: "1px solid #f3f4f6" }}>
              {["Jobwechsel", "Familie", "Immobilie"].map((t) => (
                <div
                  key={t}
                  style={{
                    fontSize: 6.5,
                    fontWeight: 600,
                    color: "#374151",
                    padding: "5px 2px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </ResultPhoneShell>
      );
    case "immobilien-check":
      return (
        <ResultPhoneShell accent="#b45309">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.4px", color: "#111", lineHeight: 1.05 }}>
              +250 €
            </div>
            <div style={{ fontSize: 6.5, color: "#6b7280", marginTop: 2, marginBottom: 8 }}>monatlicher Unterschied</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
              <span style={{ fontSize: 7, fontWeight: 700, color: "#374151" }}>Kaufen</span>
              <span style={{ fontSize: 5.5, color: "#d1d5db" }}>·</span>
              <span style={{ fontSize: 7, fontWeight: 700, color: "#374151" }}>Mieten</span>
            </div>
          </div>
        </ResultPhoneShell>
      );
    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}
