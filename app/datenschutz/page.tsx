import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { flowleadsContactEmail } from "@/lib/flowleadsMailConfig";

export const metadata: Metadata = {
  title: "Datenschutz — FlowLeads",
  description: "Datenschutzerklärung der FlowLeads-Website.",
};

export default function DatenschutzPage() {
  const contactEmail = flowleadsContactEmail();
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
        Datenschutzerklärung
      </h1>
      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "48px" }}>Stand: März 2026</p>

      <Section title="1. Verantwortlicher">
        <p>Thomas Schreiber</p>
        <p>Seitzstraße 15, 80538 München</p>
        <p>
          E-Mail:{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#b8884a" }}>
            {contactEmail}
          </a>
        </p>
      </Section>

      <Section title="2. Hosting">
        <p>
          Diese Website wird gehostet bei Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, USA. Beim
          Aufruf der Website werden technisch bedingt Zugriffsdaten verarbeitet (IP-Adresse, Zeitpunkt des Abrufs,
          aufgerufene Seite). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb).
        </p>
      </Section>

      <Section title="3. Kontaktaufnahme">
        <p>
          Wenn Sie uns per E-Mail kontaktieren, werden die von Ihnen angegebenen Daten zur Bearbeitung Ihrer Anfrage
          gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden nach Abschluss der Anfrage
          gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
        </p>
      </Section>

      <Section title="4. Kaufabwicklung (Stripe)">
        <p>
          Zahlungen werden über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irland abgewickelt.
          Bei einem Kauf werden Name, E-Mail-Adresse und Zahlungsdaten an Stripe übermittelt. Rechtsgrundlage: Art. 6
          Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </p>
        <p style={{ marginTop: "8px" }}>
          Datenschutzerklärung Stripe:{" "}
          <a href="https://stripe.com/de/privacy" target="_blank" rel="noreferrer" style={{ color: "#b8884a" }}>
            stripe.com/de/privacy
          </a>
        </p>
      </Section>

      <Section title="5. E-Mail-Versand (Resend)">
        <p>
          Nach einem Kauf wird eine Onboarding-E-Mail über Resend, Inc., 185 Berry Street, Suite 550, San Francisco, CA
          94107, USA versendet. Dabei werden Name und E-Mail-Adresse übermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
          DSGVO (Vertragserfüllung).
        </p>
        <p style={{ marginTop: "8px" }}>
          Datenschutzerklärung Resend:{" "}
          <a href="https://resend.com/privacy" target="_blank" rel="noreferrer" style={{ color: "#b8884a" }}>
            resend.com/privacy
          </a>
        </p>
      </Section>

      <Section title="6. Datenbankdienst (Supabase)">
        <p>
          Kaufdaten (Name, E-Mail, Domain, Lizenz-Token) werden in einer Datenbank bei Supabase, Inc. gespeichert.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden für die Dauer der aktiven Lizenz gespeichert.
        </p>
      </Section>

      <Section title="7. Rechner / iFrame-Einbindung durch Makler">
        <p>
          Die von FlowLeads bereitgestellten Rechner werden von Dritten (Versicherungsmakler) per iFrame auf deren
          eigenen Websites eingebunden. Die Verarbeitung der dort von Endkunden eingegebenen Daten erfolgt ausschließlich
          durch den jeweiligen Makler in dessen eigenem Verantwortungsbereich. FlowLeads ist für diese Datenverarbeitung
          nicht verantwortlich.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Diese Website verwendet keine Tracking-Cookies oder Analyse-Tools. Technisch notwendige Cookies können durch den
          Hosting-Anbieter (Netlify) gesetzt werden.
        </p>
      </Section>

      <Section title="9. Ihre Rechte">
        <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
        <ul
          style={{
            paddingLeft: "20px",
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
        </ul>
        <p style={{ marginTop: "12px" }}>
          Zur Ausübung Ihrer Rechte:{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#b8884a" }}>
            {contactEmail}
          </a>
        </p>
        <p style={{ marginTop: "8px" }}>
          Zuständige Aufsichtsbehörde (Bayern):{" "}
          <a href="https://www.lda.bayern.de" target="_blank" rel="noreferrer" style={{ color: "#b8884a" }}>
            Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)
          </a>
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
