const DEFAULT_SENDER_NAME = "FlowLeads";

/**
 * Resend empfiehlt: `Anzeigename <email@verifizierte-domain>`.
 * Ist nur eine Adresse gesetzt, wird `FlowLeads <…>` davor gesetzt.
 */
export function formatResendFrom(raw: string | undefined): string {
  const t = raw?.trim();
  if (!t) return `${DEFAULT_SENDER_NAME} <noreply@flowleads.de>`;
  if (t.includes("<") && t.includes(">")) return t;
  return `${DEFAULT_SENDER_NAME} <${t}>`;
}

/** Öffentliche Kontaktadresse (Impressum, Datenschutz, Success, Onboarding-Mail). */
export function flowleadsContactEmail(): string {
  return process.env.FLOWLEADS_CONTACT_EMAIL?.trim() || "schreiberflowleads@gmail.com";
}
