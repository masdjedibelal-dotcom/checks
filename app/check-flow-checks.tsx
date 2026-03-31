import { type ReactNode } from "react";

export const CHECK_FLOW_META = [
  {
    slug: "einkommens-check" as const,
    catClass: "ck-cat-schutz",
    cat: "Einkommen · Absicherung",
    name: "Einkommensabsicherung",
    hook: "Wenn Ihr Einkommen wegfällt",
    erlebnis:
      "Der Nutzer sieht, wie stark sein Einkommen einbricht und wo die finanzielle Lücke entsteht.",
    price: 59,
    priceOriginal: 99,
  },
  {
    slug: "gkv-pkv" as const,
    catClass: "ck-cat-entscheidung",
    cat: "Krankenversicherung",
    name: "KV-Navigator",
    hook: "Welche Krankenversicherung zu Ihnen passt",
    erlebnis:
      "Der Nutzer bekommt eine erste Einordnung und versteht, welche Richtung für seine Situation sinnvoll ist.",
    price: 59,
    priceOriginal: 99,
  },
  {
    slug: "vorsorge-check" as const,
    catClass: "ck-cat-vorsorge",
    cat: "Altersvorsorge",
    name: "Rentenlücke",
    hook: "Wie viel Ihnen im Alter fehlen wird",
    erlebnis:
      "Der Nutzer sieht seine persönliche Rentenlücke und bekommt ein Gefühl für seine finanzielle Zukunft.",
    price: 59,
    priceOriginal: 99,
  },
  {
    slug: "risikoleben" as const,
    catClass: "ck-cat-familie",
    cat: "Familie",
    name: "Familienabsicherung",
    hook: "Wie Ihre Familie abgesichert ist",
    erlebnis:
      "Der Nutzer berechnet den finanziellen Bedarf und erkennt, welche Lücke im Ernstfall entsteht.",
    price: 49,
    priceOriginal: 79,
  },
  {
    slug: "pflege-check" as const,
    catClass: "ck-cat-pflege",
    cat: "Pflege",
    name: "Pflegekosten",
    hook: "Welche Kosten im Pflegefall entstehen",
    erlebnis:
      "Der Nutzer sieht die monatlichen Eigenanteile und versteht die tatsächliche finanzielle Belastung.",
    price: 49,
    priceOriginal: 79,
  },
  {
    slug: "bedarfscheck" as const,
    catClass: "ck-cat-neu",
    cat: "Überblick",
    name: "Absicherungspakete",
    hook: "Wie Sie sinnvoll abgesichert sind",
    erlebnis:
      "Der Nutzer bekommt eine klare Struktur aus Basis-, Rundum- und Premium-Absicherung.",
    price: 39,
    priceOriginal: 59,
  },
  {
    slug: "lebenssituations-check" as const,
    catClass: "ck-cat-neu",
    cat: "Bestand",
    name: "Jahresgespräch",
    hook: "Was sich für Sie verändert hat",
    erlebnis:
      "Der Nutzer erkennt, welche Themen durch seine aktuelle Lebenssituation relevant werden.",
    price: 1,
    priceOriginal: undefined,
  },
  {
    slug: "immobilien-check" as const,
    catClass: "ck-cat-immobilien",
    cat: "Immobilie",
    name: "Immobilienabsicherung",
    hook: "Risiko-Scanner für Finanzierung, Bau und Bestand",
    erlebnis:
      "Drei Säulen: Bank & Existenz, Objektschutz, Zukunft & Recht — inkl. RLV/BU, Pflege und Eigentümer-Rechtsschutz.",
    price: 49,
    priceOriginal: 79,
  },
] as const;

export type CheckFlowSlug = (typeof CHECK_FLOW_META)[number]["slug"];

/** Landing-Karten: `price` = Aktionspreis, `priceOriginal` = durchgestrichener Listenpreis (optional z. B. Freemium) */
export type CheckFlowMeta = {
  slug: CheckFlowSlug;
  catClass: string;
  cat: string;
  name: string;
  hook: string;
  erlebnis: string;
  price: number;
  priceOriginal?: number;
};

/** Minimales Phone-Chrome — nur Ergebnis-Screens, keine Fragen oder CTAs */
function ResultPhoneShell({ accent, children }: { accent: string; children: ReactNode }): ReactNode {
  return (
    <div className="ck-phone-wrap">
      <div className="ph-bar" style={{ height: 2, background: accent }} />
      <div
        className="ph-hd"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 8px 6px 6px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <span className="ph-firm" style={{ fontSize: 6.5, lineHeight: 1.2, color: "#111" }}>
          Ihre Agentur
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
        <ResultPhoneShell accent="#1d4f91">
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
              <div style={{ fontSize: 5.8, color: "#44403c", lineHeight: 1.35 }}>✓ + Altersvorsorge</div>
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
            <div style={{ fontSize: 6.5, color: "#6b7280", marginBottom: 4 }}>Immobilienabsicherung</div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.4px", color: "#b45309", lineHeight: 1.05 }}>
              3 Säulen
            </div>
            <div style={{ fontSize: 6.5, color: "#6b7280", marginTop: 2, marginBottom: 6 }}>Bank & Existenz · Objekt · Zukunft & Recht</div>
            <div style={{ display: "flex", gap: 3, justifyContent: "center", padding: "0 2px" }}>
              <div style={{ flex: 1, height: 10, borderRadius: 3, background: "#FFF6F5", border: "1px solid #F2D4D0" }} />
              <div style={{ flex: 1, height: 10, borderRadius: 3, background: "#FFFBEB", border: "1px solid #FDE68A" }} />
              <div style={{ flex: 1, height: 10, borderRadius: 3, background: "#FAFAF8", border: "1px solid #e5e7eb" }} />
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
