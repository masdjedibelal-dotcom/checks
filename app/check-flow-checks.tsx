import type { ReactNode } from "react";

export const CHECK_FLOW_META = [
  {
    slug: "bedarfscheck" as const,
    catClass: "ck-cat-neu",
    cat: "Neukunden",
    name: "Versicherungs-Check",
    context: "Für Erstgespräche und neue Website-Besucher",
    erlebnis:
      "Der Kunde gibt an, was bereits abgesichert ist, und erkennt sofort, wo Lücken bestehen. So entsteht ein klares erstes Gespräch – ohne Tarifvergleich und ohne langen Erklärbedarf.",
    price: "79",
  },
  {
    slug: "lebenssituations-check" as const,
    catClass: "ck-cat-neu",
    cat: "Bestandskunden",
    name: "Lebenssituations-Check",
    context: "Für Bestandskunden, Anlässe und Reaktivierung",
    erlebnis:
      "Ob Nachwuchs, Jobwechsel oder Immobilienkauf: Der Kunde erkennt, was in seiner aktuellen Lebenssituation überprüft oder angepasst werden sollte. Ideal für Jahresgespräche und Bestandskunden-Kampagnen.",
    price: "79",
  },
  {
    slug: "einkommens-check" as const,
    catClass: "ck-cat-schutz",
    cat: "Einkommensschutz",
    name: "Einkommens-Check",
    context: "Für BU-, Krankentagegeld- und Einkommensschutz-Beratung",
    erlebnis:
      "Der Check zeigt auf einer Zeitachse, wie stark das Einkommen bei Krankheit oder Berufsunfähigkeit einbrechen kann. Dadurch wird aus einem abstrakten Risiko eine konkrete Versorgungslücke.",
    price: "59",
  },
  {
    slug: "gkv-pkv" as const,
    catClass: "ck-cat-entscheidung",
    cat: "Entscheidung",
    name: "GKV vs. PKV",
    context: "Für Wechselinteresse, Orientierung und Erstprüfung",
    erlebnis:
      "Der Kunde bekommt eine verständliche Einordnung, ob GKV oder PKV grundsätzlich besser zu seiner Situation passt. Keine Tarifflut, sondern eine klare erste Richtung für das Gespräch.",
    price: "49",
  },
  {
    slug: "vorsorge-check" as const,
    catClass: "ck-cat-vorsorge",
    cat: "Altersvorsorge",
    name: "Vorsorge-Check",
    context: "Für Rentenlücke, Vorsorgeaufbau und Strategiegespräche",
    erlebnis:
      "Der Kunde sieht, was ihm im Alter voraussichtlich fehlt, wie seine heutige Vorsorge aufgestellt ist und welche grundsätzlichen Wege infrage kommen. Das schafft sofort Relevanz im Vorsorgegespräch.",
    price: "59",
  },
  {
    slug: "risikoleben" as const,
    catClass: "ck-cat-familie",
    cat: "Familie",
    name: "Risikoleben-Check",
    context: "Für Familien, Finanzierung und Todesfall-Absicherung",
    erlebnis:
      "Aus Einkommen, Verpflichtungen und Familiensituation wird eine konkrete Versorgungslücke berechnet. So versteht der Kunde sofort, welche Summe im Ernstfall wirklich abgesichert werden sollte.",
    price: "59",
  },
  {
    slug: "pflege-check" as const,
    catClass: "ck-cat-pflege",
    cat: "Pflegevorsorge",
    name: "Pflege-Check",
    context: "Für Pflegevorsorge und Kostenbewusstsein",
    erlebnis:
      "Der Check macht sichtbar, welcher Eigenanteil bei Pflege tatsächlich selbst getragen werden müsste. Dadurch wird ein oft verdrängtes Thema in eine verständliche und greifbare Zahl übersetzt.",
    price: "49",
  },
  {
    slug: "immobilien-check" as const,
    catClass: "ck-cat-immobilien",
    cat: "Immobilien",
    name: "Immobilien-Check",
    context: "Für Kaufentscheidung, Anschlussfinanzierung und Immobilien-Schutz",
    erlebnis:
      "Ob Kaufen oder Mieten, neue Zinsbindung oder Unterversicherung: Der Kunde bekommt je nach Situation eine klare Einordnung und erkennt gleichzeitig, welche Absicherung rund um die Immobilie wichtig wird.",
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

export function CheckFlowPhoneMock({ slug }: { slug: CheckFlowSlug }): ReactNode {
  switch (slug) {
    case "bedarfscheck":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#c9a96e 65%,#eee 65%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#c9a96e" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#fff3e0", color: "#c9a96e" }}>
              Check
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#c9a96e" }}>
              Versicherungs-Check
            </div>
            <div className="ph-ttl">Was haben Sie bereits?</div>
            <div className="ph-sub">Tippen Sie an, was vorhanden ist</div>
            <div className="ph-items">
              <div className="ph-item">
                <div className="ph-dot" style={{ background: "#e8f5e9" }} />
                <span className="ph-itxt">Privathaftpflicht ✓</span>
              </div>
              <div className="ph-item">
                <div className="ph-dot" style={{ background: "#fff3e0" }} />
                <span className="ph-itxt">BU-Versicherung</span>
              </div>
              <div className="ph-item">
                <div className="ph-dot" style={{ background: "#e8f5e9" }} />
                <span className="ph-itxt">Hausrat ✓</span>
              </div>
              <div className="ph-item">
                <div className="ph-dot" style={{ background: "#fff3e0" }} />
                <span className="ph-itxt">Risikoleben</span>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#c9a96e" }}>
              Weiter →
            </div>
          </div>
        </div>
      );
    case "lebenssituations-check":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#166534 70%,#eee 70%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#166534" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#dcfce7", color: "#166534" }}>
              Check
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#166534" }}>
              Lebenssituations-Check
            </div>
            <div className="ph-ttl">Was bewegt Sie gerade?</div>
            <div className="ph-sub">Alles Zutreffende antippen</div>
            <div className="ph-opts">
              <div className="ph-opt on" style={{ background: "#dcfce7", color: "#166534" }}>
                🍼 Nachwuchs
              </div>
              <div className="ph-opt">💼 Jobwechsel</div>
              <div className="ph-opt on" style={{ background: "#dcfce7", color: "#166534" }}>
                🏠 Immobilie
              </div>
              <div className="ph-opt">💍 Heirat</div>
            </div>
            <div className="ph-btn" style={{ background: "#166534" }}>
              Ergebnis anzeigen →
            </div>
          </div>
        </div>
      );
    case "einkommens-check":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#7c3aed 55%,#eee 55%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#7c3aed" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#ede9fe", color: "#7c3aed" }}>
              BU+KTG
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#7c3aed" }}>
              Ihre Einkommenslücke
            </div>
            <div className="ph-ttl">Ab Monat 7: 0 €</div>
            <div className="ph-sub">Einkommenseinbruch simuliert</div>
            <div className="ph-tl">
              <div className="ph-tlr">
                <div className="ph-tld" style={{ background: "#22c55e" }} />
                <div className="ph-tlb" style={{ background: "#22c55e", width: "100%" }} />
                <span className="ph-tlv" style={{ color: "#22c55e" }}>
                  100%
                </span>
              </div>
              <div className="ph-tlr">
                <div className="ph-tld" style={{ background: "#f59e0b" }} />
                <div className="ph-tlb" style={{ background: "#f59e0b", width: "65%" }} />
                <span className="ph-tlv" style={{ color: "#f59e0b" }}>
                  65%
                </span>
              </div>
              <div className="ph-tlr">
                <div className="ph-tld" style={{ background: "#ef4444" }} />
                <div className="ph-tlb" style={{ background: "#ef4444", width: "0%" }} />
                <span className="ph-tlv" style={{ color: "#ef4444" }}>
                  0%
                </span>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#7c3aed" }}>
              Absicherung prüfen →
            </div>
          </div>
        </div>
      );
    case "gkv-pkv":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#dc2626 60%,#eee 60%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#dc2626" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#fee2e2", color: "#dc2626" }}>
              GKV/PKV
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#dc2626" }}>
              Tendenz
            </div>
            <div className="ph-ttl">Eher PKV</div>
            <div className="ph-sub">Beitragsvergleich</div>
            <div className="ph-2col">
              <div className="ph-cell" style={{ background: "#f3f4f6" }}>
                <div className="ph-cn">GKV/Mon.</div>
                <div className="ph-cv">412 €</div>
              </div>
              <div className="ph-cell" style={{ background: "#eff6ff" }}>
                <div className="ph-cn">PKV/Mon.</div>
                <div className="ph-cv" style={{ color: "#1d4ed8" }}>
                  298 €
                </div>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#dc2626" }}>
              PKV prüfen lassen →
            </div>
          </div>
        </div>
      );
    case "vorsorge-check":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#059669 64%,#eee 64%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#059669" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#d1fae5", color: "#059669" }}>
              Rente
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#059669" }}>
              Ihre Rentenanalyse
            </div>
            <div className="ph-big" style={{ color: "#ef4444" }}>
              520 €/Mon.
            </div>
            <div className="ph-sub">fehlen ab Rentenbeginn</div>
            <div className="ph-2col">
              <div className="ph-cell" style={{ background: "#fee2e2" }}>
                <div className="ph-cn">Lücke</div>
                <div className="ph-cv" style={{ color: "#ef4444" }}>
                  520 €
                </div>
              </div>
              <div className="ph-cell" style={{ background: "#f3f4f6" }}>
                <div className="ph-cn">Deckung</div>
                <div className="ph-cv">64%</div>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#059669" }}>
              Strategie besprechen →
            </div>
          </div>
        </div>
      );
    case "risikoleben":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#be185d 70%,#eee 70%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#be185d" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#fce7f3", color: "#be185d" }}>
              Familie
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#be185d" }}>
              Versorgungslücke
            </div>
            <div className="ph-big" style={{ color: "#ef4444" }}>
              320.000 €
            </div>
            <div className="ph-sub">empfohlene Absicherung</div>
            <div className="ph-2col">
              <div className="ph-cell" style={{ background: "#fce7f3" }}>
                <div className="ph-cn">Vorhanden</div>
                <div className="ph-cv">0 €</div>
              </div>
              <div className="ph-cell" style={{ background: "#fee2e2" }}>
                <div className="ph-cn">Lücke</div>
                <div className="ph-cv" style={{ color: "#ef4444" }}>
                  320 T€
                </div>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#be185d" }}>
              Familie absichern →
            </div>
          </div>
        </div>
      );
    case "pflege-check":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#0369a1 60%,#eee 60%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#0369a1" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
              Pflege
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#0369a1" }}>
              Eigenanteil Pflege
            </div>
            <div className="ph-big" style={{ color: "#0369a1" }}>
              2.548 €
            </div>
            <div className="ph-sub">pro Monat selbst zu tragen</div>
            <div className="ph-2col">
              <div className="ph-cell" style={{ background: "#fee2e2" }}>
                <div className="ph-cn">Pflegekosten</div>
                <div className="ph-cv">3.800 €</div>
              </div>
              <div className="ph-cell" style={{ background: "#d1fae5" }}>
                <div className="ph-cn">Leistung</div>
                <div className="ph-cv" style={{ color: "#059669" }}>
                  1.252 €
                </div>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#0369a1" }}>
              Vorsorge prüfen →
            </div>
          </div>
        </div>
      );
    case "immobilien-check":
      return (
        <div className="ck-phone-wrap">
          <div className="ph-bar" style={{ background: "linear-gradient(90deg,#b45309 65%,#eee 65%)" }} />
          <div className="ph-hd">
            <div className="ph-logo" style={{ background: "#b45309" }}>
              <PhMark9 />
            </div>
            <span className="ph-firm">Mustermann Versicherungen</span>
            <span className="ph-badge" style={{ background: "#fef3c7", color: "#b45309" }}>
              Immobilie
            </span>
          </div>
          <div className="ph-body">
            <div className="ph-ey" style={{ color: "#b45309" }}>
              Anschlussfinanzierung
            </div>
            <div className="ph-big" style={{ color: "#ef4444" }}>
              +340 €
            </div>
            <div className="ph-sub">mehr pro Monat ab Anschluss</div>
            <div className="ph-2col">
              <div className="ph-cell" style={{ background: "#f3f4f6" }}>
                <div className="ph-cn">Aktuell</div>
                <div className="ph-cv">820 €</div>
              </div>
              <div className="ph-cell" style={{ background: "#fee2e2" }}>
                <div className="ph-cn">Ab Anschluss</div>
                <div className="ph-cv" style={{ color: "#ef4444" }}>
                  1.160 €
                </div>
              </div>
            </div>
            <div className="ph-btn" style={{ background: "#b45309" }}>
              Finanzierung prüfen →
            </div>
          </div>
        </div>
      );
    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}
