import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { flowleadsContactEmail } from "@/lib/flowleadsMailConfig";

export const metadata: Metadata = {
  title: "Impressum — FlowLeads",
  description: "Impressum und Anbieterkennzeichnung FlowLeads.",
};

export default function ImpressumPage() {
  const contactEmail = flowleadsContactEmail();
  return (
    <main
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "80px 24px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#1a1a1a",
        lineHeight: "1.7",
        background: "#faf9f6",
        minHeight: "100vh",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: "28px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#b8884a",
          textDecoration: "none",
        }}
      >
        ← Zurück zur Startseite
      </Link>

      <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-1px", marginBottom: "8px" }}>
        Impressum
      </h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "48px" }}>Angaben gemäß § 5 TMG</p>

      <Section title="Anbieter">
        <p>Thomas Schreiber</p>
        <p>Seitzstraße 15</p>
        <p>80538 München</p>
        <p>Deutschland</p>
      </Section>

      <Section title="Kontakt">
        <p>
          E-Mail:{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#b8884a" }}>
            {contactEmail}
          </a>
        </p>
      </Section>

      <Section title="Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)">
        <p>Thomas Schreiber, Seitzstraße 15, 80538 München</p>
      </Section>

      <Section title="Hinweis zur Tätigkeit">
        <p>
          FlowLeads ist ein Anbieter technischer Tools für Versicherungsmakler. FlowLeads erbringt keine
          Versicherungsberatung, ist kein Versicherungsvermittler und unterliegt nicht der Erlaubnispflicht nach §
          34d GewO.
        </p>
      </Section>

      <Section title="Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#b8884a" }}
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p style={{ marginTop: "8px" }}>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </Section>

      <Section title="Haftung für Inhalte">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#1a1a1a",
          marginBottom: "10px",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: "14px", color: "#4b5563" }}>{children}</div>
    </div>
  );
}
