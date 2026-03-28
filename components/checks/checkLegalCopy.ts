/** Rechtstexte Szenario 1 (FlowLeads = Microsite-Anbieter). Vor Livegang juristisch prüfen. */

export const CHECK_LEGAL_DISCLAIMER_FOOTER =
  "Die Ergebnisse basieren auf Ihren Angaben und dienen der ersten Orientierung. Sie stellen keine individuelle Beratung dar und ersetzen kein persönliches Gespräch.";

/** Direkt über den Formularfeldern */
export const CHECK_LEAD_NOTICE =
  "Ihre Anfrage wird direkt an den jeweiligen Anbieter übermittelt.";

export function checkDataForwardingNote(maklerName: string) {
  return `Ihre Angaben werden direkt an ${maklerName} weitergeleitet. FlowLeads speichert oder verarbeitet diese Daten nicht.`;
}

export const CHECK_CONSENT_TEXT =
  "Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage durch den jeweiligen Versicherungsmakler verarbeitet werden.";
