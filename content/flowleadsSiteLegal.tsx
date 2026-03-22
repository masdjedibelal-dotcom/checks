import type { ReactNode } from "react";

/** Platzhalter — vor Livegang durch echte Angaben ersetzen. */
export const FLOWLEADS_LEGAL_PLACEHOLDERS = {
  name: "[Vorname Nachname]",
  street: "[Straße Hausnummer]",
  city: "[PLZ Ort]",
  email: "[deine@email.de]",
  phone: "[optional — Telefon]",
  ustId: "[USt-IdNr. — falls vorhanden, sonst weglassen]",
  hosting: "[Netlify / Vercel / anderer Anbieter]",
  authority: "[zuständige Datenschutzbehörde Ihres Bundeslandes]",
  stand: "[Monat Jahr]",
} as const;

const P = FLOWLEADS_LEGAL_PLACEHOLDERS;

export function LegalDocPage({
  title,
  children,
  prepend,
}: {
  title: string;
  children: ReactNode;
  prepend?: ReactNode;
}) {
  return (
    <div className="flow-leads-legal-doc">
      {prepend}
      <h1>{title}</h1>
      {children}
      <p className="flow-leads-legal-note">
        Hinweis: Diese Texte sind eine Arbeitsvorlage und ersetzen keine anwaltliche Prüfung.
      </p>
    </div>
  );
}

export function ImpressumLegalContent() {
  return (
    <>
      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        {P.name}
        <br />
        {P.street}
        <br />
        {P.city}
        <br />
        Deutschland
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: {P.email}
        <br />
        Telefon: {P.phone}
      </p>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: {P.ustId}</p>
      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        {P.name}, {P.street}, {P.city}
      </p>
      <h2>Hinweis</h2>
      <p>
        FlowLeads ist ein Anbieter technischer Tools für Versicherungsmakler. FlowLeads erbringt keine
        Versicherungsberatung und ist kein Versicherungsvermittler.
      </p>
    </>
  );
}

export function DatenschutzLegalContent() {
  return (
    <>
      <h2>1. Verantwortlicher</h2>
      <p>
        {P.name}
        <br />
        {P.street}, {P.city}
        <br />
        {P.email}
      </p>
      <h2>2. Hosting</h2>
      <p>
        Diese Website wird gehostet bei {P.hosting}. Der Hosting-Anbieter verarbeitet technisch bedingt
        Zugriffsdaten (IP-Adresse, Zeitpunkt des Abrufs, aufgerufene Seite). Rechtsgrundlage: Art. 6 Abs. 1
        lit. f DSGVO.
      </p>
      <h2>3. Kontaktformular / Kontaktaufnahme</h2>
      <p>
        Wenn Sie uns über das Kontaktformular oder per E-Mail kontaktieren, werden die von Ihnen angegebenen
        Daten zur Bearbeitung Ihrer Anfrage gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
      </p>
      <h2>4. Rechner / iFrame-Einbindung</h2>
      <p>
        Über unsere Website selbst werden keine personenbezogenen Daten im Rahmen der bereitgestellten Rechner
        verarbeitet. Die Rechner werden von Dritten (Versicherungsmakler) per iFrame eingebunden. Die
        Verarbeitung der dort eingegebenen Daten erfolgt ausschließlich durch den jeweiligen Anbieter in
        dessen Verantwortungsbereich.
      </p>
      <h2>5. Cookies</h2>
      <p>
        Diese Website verwendet keine Tracking-Cookies. Technisch notwendige Cookies können durch den
        Hosting-Anbieter gesetzt werden.
      </p>
      <h2>6. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und
        Widerspruch. Zuständige Aufsichtsbehörde: {P.authority}.
      </p>
      <p>
        <strong>Stand:</strong> {P.stand}
      </p>
    </>
  );
}

export function AgbLegalContent() {
  return (
    <>
      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Nutzungsbedingungen gelten für die Inanspruchnahme der von FlowLeads ({P.name}, {P.street},{" "}
        {P.city}) bereitgestellten technischen Tools (nachfolgend „Rechner“).
      </p>
      <h2>§ 2 Leistungsgegenstand</h2>
      <p>
        FlowLeads stellt interaktive Berechnungstools als technische Infrastruktur bereit. Die Tools werden als
        iFrame-Lösung zur Einbindung auf Websites Dritter angeboten.
      </p>
      <p>FlowLeads ist:</p>
      <ul>
        <li>kein Versicherungsberater</li>
        <li>kein Versicherungsvermittler</li>
        <li>kein Anbieter von Finanz- oder Rechtsberatung</li>
      </ul>
      <h2>§ 3 Verantwortlichkeit des Anbieters (Makler)</h2>
      <p>
        Der Nutzer (Versicherungsmakler), der die Rechner auf seiner Website einbindet, ist allein
        verantwortlich für:
      </p>
      <ol>
        <li>die Einbindung und technische Integration</li>
        <li>die Inhalte, die im Rahmen der Einbindung kommuniziert werden</li>
        <li>die Verarbeitung der von seinen Endkunden eingegebenen Daten</li>
        <li>die Einhaltung der datenschutzrechtlichen Anforderungen gegenüber seinen Endkunden</li>
        <li>eine ggf. erforderliche Erlaubnis nach § 34d GewO (Versicherungsvermittlererlaubnis)</li>
      </ol>
      <h2>§ 4 Haftungsausschluss</h2>
      <p>
        Die Rechner dienen ausschließlich der unverbindlichen Orientierung. FlowLeads übernimmt keine Gewähr
        für die Richtigkeit, Vollständigkeit oder Aktualität der angezeigten Ergebnisse.
      </p>
      <p>
        Die Ergebnisse der Rechner stellen keine verbindliche Beratung, keine Empfehlung und kein Angebot dar.
      </p>
      <p>
        FlowLeads haftet nicht für Schäden, die aus der Nutzung oder Nichtnutzung der bereitgestellten Tools
        entstehen.
      </p>
      <h2>§ 5 Datenschutz</h2>
      <p>
        FlowLeads verarbeitet keine personenbezogenen Daten der Endkunden der einbindenden Makler. Für die
        Datenverarbeitung im Rahmen der Einbindung ist ausschließlich der jeweilige Makler verantwortlich.
      </p>
      <h2>§ 6 Urheberrecht</h2>
      <p>
        Die Rechner und die zugehörige Berechnungslogik sind urheberrechtlich geschützt. Eine Weitergabe,
        Vervielfältigung oder Bearbeitung ohne Zustimmung ist untersagt.
      </p>
      <h2>§ 7 Änderungen</h2>
      <p>
        FlowLeads behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Die jeweils aktuelle Version
        ist auf der Website abrufbar.
      </p>
      <p>
        <strong>Stand:</strong> {P.stand}
      </p>
    </>
  );
}
