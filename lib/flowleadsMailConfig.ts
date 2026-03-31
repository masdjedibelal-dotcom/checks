const DEFAULT_SENDER_NAME = "FlowLeads";

/** Fallback, wenn `FLOWLEADS_CONTACT_EMAIL` nicht gesetzt (z. B. Netlify). */
const DEFAULT_CONTACT_EMAIL = "hallo@getflowleads.com";

/** Öffentliche Kontaktadresse (Impressum, Datenschutz, Success, Onboarding-Mail). */
export function flowleadsContactEmail(): string {
  return process.env.FLOWLEADS_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
}

/**
 * Resend empfiehlt: `Anzeigename <email@verifizierte-domain>`.
 * Ist nur eine Adresse gesetzt, wird `FlowLeads <…>` davor gesetzt.
 * Ohne `RESEND_FROM_EMAIL`: gleiche Adresse wie Kontakt-Mail (über Env oder Default).
 */
export function formatResendFrom(raw: string | undefined): string {
  const t = raw?.trim();
  if (!t) return `${DEFAULT_SENDER_NAME} <${flowleadsContactEmail()}>`;
  if (t.includes("<") && t.includes(">")) return t;
  return `${DEFAULT_SENDER_NAME} <${t}>`;
}
