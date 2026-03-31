import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AGB — FlowLeads",
  description: "Allgemeine Geschäftsbedingungen von FlowLeads.",
};

export default function AGBPage() {
  return (
    <main
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "80px 24px",
        fontFamily: 'var(--font-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
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
        Allgemeine Geschäftsbedingungen
      </h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "48px" }}>Stand: März 2026</p>

      <Section title="§ 1 Geltungsbereich">
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen FlowLeads (Max Schreiber,
          Seitzstraße 16, 80538 München) — nachfolgend „Anbieter“ — und den Käufern der bereitgestellten digitalen
          Microsites — nachfolgend „Kunde“.
        </p>
        <p style={{ marginTop: "8px" }}>
          Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung
          ausdrücklich schriftlich zu.
        </p>
      </Section>

      <Section title="§ 2 Leistungsgegenstand">
        <p>
          Der Anbieter stellt interaktive Microsites („Checks“) als technische Infrastruktur bereit. Die Microsites
          werden als lizenzierte iFrame-Lösung zur Einbindung auf Websites des Kunden angeboten.
        </p>
        <p style={{ marginTop: "8px" }}>Der Anbieter ist ausdrücklich:</p>
        <ul
          style={{
            paddingLeft: "20px",
            marginTop: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <li>kein Versicherungsberater</li>
          <li>kein Versicherungsvermittler</li>
          <li>kein Anbieter von Finanz- oder Rechtsberatung</li>
        </ul>
      </Section>

      <Section title="§ 3 Vertragsschluss">
        <p>
          Der Vertrag kommt durch den Abschluss des Kaufvorgangs über Stripe zustande. Nach erfolgreicher Zahlung
          erhält der Kunde per E-Mail einen personalisierten iFrame-Code sowie einen Lizenz-Token zur Einbindung auf
          der angegebenen Domain.
        </p>
      </Section>

      <Section title="§ 4 Lizenz & Nutzungsrechte">
        <p>
          Der Kunde erhält ein nicht-exklusives, nicht-übertragbares Recht zur Nutzung des erworbenen Checks auf der
          bei Kauf angegebenen Domain.
        </p>
        <p style={{ marginTop: "8px" }}>Folgendes ist ausdrücklich nicht gestattet:</p>
        <ul
          style={{
            paddingLeft: "20px",
            marginTop: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <li>Weitergabe des iFrame-Codes oder Lizenz-Tokens an Dritte</li>
          <li>Einbindung auf anderen als der angegebenen Domain</li>
          <li>Vervielfältigung, Bearbeitung oder Weiterverkauf</li>
          <li>Entfernung von Hinweistexten oder Disclaimern</li>
        </ul>
      </Section>

      <Section title="§ 5 Verantwortlichkeit des Kunden">
        <p>Der Kunde ist allein verantwortlich für:</p>
        <ul
          style={{
            paddingLeft: "20px",
            marginTop: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <li>die Einbindung und technische Integration des Checks</li>
          <li>die Inhalte, die im Rahmen der Einbindung kommuniziert werden</li>
          <li>die Verarbeitung der von seinen Endkunden eingegebenen Daten (DSGVO)</li>
          <li>eine ggf. erforderliche Erlaubnis nach § 34d GewO</li>
          <li>die Aufnahme der Datenverarbeitung in seine Datenschutzerklärung</li>
        </ul>
      </Section>

      <Section title="§ 6 Preise & Zahlung">
        <p>
          Die Preise sind Einmalzahlungen in Euro inkl. gesetzlicher Mehrwertsteuer. Die Zahlung erfolgt über Stripe.
          Es entstehen keine monatlichen Kosten, Abonnements oder Folgeverpflichtungen.
        </p>
      </Section>

      <Section title="§ 7 Digitale Inhalte & Widerrufsrecht">
        <p>
          Bei digitalen Inhalten, die nach Vertragsschluss sofort bereitgestellt werden, erlischt das Widerrufsrecht
          gemäß § 356 Abs. 5 BGB mit Beginn der Ausführung des Vertrags, sofern der Kunde ausdrücklich zugestimmt hat
          und seine Kenntnis vom Erlöschen des Widerrufsrechts bestätigt hat.
        </p>
        <p style={{ marginTop: "8px" }}>Der Kunde bestätigt dies durch Abschluss des Kaufvorgangs.</p>
      </Section>

      <Section title="§ 8 Haftungsausschluss">
        <p>
          Die Checks dienen ausschließlich der unverbindlichen Orientierung. Der Anbieter übernimmt keine Gewähr für
          die Richtigkeit, Vollständigkeit oder Aktualität der angezeigten Ergebnisse.
        </p>
        <p style={{ marginTop: "8px" }}>
          Der Anbieter haftet nicht für Schäden, die aus der Nutzung oder Nichtnutzung der bereitgestellten Microsites
          entstehen, es sei denn, diese beruhen auf Vorsatz oder grober Fahrlässigkeit des Anbieters.
        </p>
      </Section>

      <Section title="§ 9 Verfügbarkeit">
        <p>
          Der Anbieter bemüht sich um eine hohe Verfügbarkeit der Microsites, übernimmt jedoch keine Garantie für eine
          ununterbrochene Verfügbarkeit. Wartungsarbeiten werden nach Möglichkeit angekündigt.
        </p>
      </Section>

      <Section title="§ 10 Kündigung & Deaktivierung">
        <p>
          Der Anbieter behält sich das Recht vor, Lizenzen bei Verstoß gegen diese AGB ohne Rückerstattung zu
          deaktivieren. Der Kunde wird in diesem Fall vorab informiert, sofern dies zumutbar ist.
        </p>
      </Section>

      <Section title="§ 11 Datenschutz">
        <p>
          Es gilt die{" "}
          <Link href="/datenschutz" style={{ color: "#b8884a" }}>
            Datenschutzerklärung
          </Link>{" "}
          von FlowLeads.
        </p>
      </Section>

      <Section title="§ 12 Änderungen der AGB">
        <p>
          Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Die jeweils aktuelle Version ist auf der Website
          abrufbar. Bei wesentlichen Änderungen werden bestehende Kunden per E-Mail informiert.
        </p>
      </Section>

      <Section title="§ 13 Anwendbares Recht & Gerichtsstand">
        <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand für Kaufleute ist München.</p>
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
