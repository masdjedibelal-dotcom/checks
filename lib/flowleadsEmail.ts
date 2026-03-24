// Onboarding-E-Mail nach Kauf — wird im Webhook aufgerufen

import {
  buildLicensedDemoUrl,
  buildLicensedIframeCode,
  escapeHtml,
  slugToDisplayName,
} from "@/lib/flowleadsEmbed";
import { flowleadsContactEmail } from "@/lib/flowleadsMailConfig";
import { publicAppUrl } from "@/lib/licenseUtils";

/** @deprecated Nutze slugToDisplayName — Alias für ältere Aufrufe */
export const slugToName = slugToDisplayName;

/** @deprecated Nutze buildLicensedIframeCode — Alias für ältere Aufrufe */
export const buildIframeCode = buildLicensedIframeCode;

export type OnboardingEmailParams = {
  name: string;
  firma: string;
  slug: string;
  token: string;
  /** Stripe Checkout Session-ID für Link zur Bestätigungsseite */
  sessionId?: string;
  /** data:image/png;base64,… für eingebetteten QR-Code */
  qrDataUrl?: string;
};

export function buildOnboardingEmailSubject(slug: string): string {
  const checkName = slugToDisplayName(slug);
  return `Ihr FlowLeads-Tool ist bereit — ${checkName}`;
}

export function buildOnboardingEmail(p: OnboardingEmailParams): { subject: string; html: string } {
  const checkName = slugToDisplayName(p.slug);
  const iframeCode = buildLicensedIframeCode(p.slug, p.token);
  const firstName = p.name?.split(" ")[0] || "dort";
  const appUrl = publicAppUrl();
  const directUrl = buildLicensedDemoUrl(p.slug, p.token);
  const subject = buildOnboardingEmailSubject(p.slug);

  const safeFirst = escapeHtml(firstName);
  const safeCheck = escapeHtml(checkName);
  const safeIframeInBox = escapeHtml(iframeCode);
  const safeDirectUrl = escapeHtml(directUrl);
  const safeAppUrl = escapeHtml(appUrl);
  const contactEmail = flowleadsContactEmail();
  const safeContact = escapeHtml(contactEmail);
  const qrBlock = p.qrDataUrl
    ? `
      <img src="${p.qrDataUrl}"
      width="160" height="160"
      alt="QR-Code"
      style="border-radius:8px;margin-bottom:12px;display:block;margin:0 auto 12px;"/>
    `
    : "";

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0ede6;font-family:'DM Sans',Helvetica,'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:40px 16px;}
  .wrap{max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;}
  .header{background:#1a1a1a;padding:24px 32px;display:flex;align-items:center;gap:12px;}
  .header-name{color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.3px;}
  .body{padding:36px 32px;}
  .greeting{font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;margin-bottom:8px;}
  .intro{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:28px;}
  .code-box{background:#f7f6f3;border:1px solid #e5e7eb;border-radius:10px;padding:16px;font-family:monospace;font-size:12px;color:#374151;word-break:break-all;line-height:1.7;margin-bottom:6px;}
  .steps-box{background:#fdf6ec;border:1px solid #f0d9b5;border-radius:12px;padding:22px 24px;margin-bottom:24px;}
  .steps-title{font-size:11px;font-weight:700;color:#b8884a;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;}
  .step-line{font-size:13px;color:#4b5563;line-height:1.55;padding:4px 0;}
  .domain-box{background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#6b7280;line-height:1.65;}
  .domain-box strong{color:#1a1a1a;}
  .cta-btn{display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 24px;border-radius:9px;font-size:14px;font-weight:700;text-decoration:none;margin-bottom:24px;}
  .divider{height:1px;background:#f3f4f6;margin:24px 0;}
  .hint{font-size:12px;color:#9ca3af;line-height:1.65;}
  .hint a{color:#b8884a;}
  .footer{background:#faf9f6;border-top:1px solid #f3f4f6;padding:18px 32px;font-size:11px;color:#9ca3af;text-align:center;}
  .footer a{color:#9ca3af;}
</style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="header-logo" style="width:32px;height:32px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a"/>
        <rect x="9.5" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4"/>
        <rect x="1" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4"/>
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a"/>
      </svg>
    </div>
    <span class="header-name">FlowLeads</span>
  </div>

  <div class="body">

    <div class="greeting">Ihr Tool ist bereit, ${safeFirst}.</div>
    <p class="intro">
      Ihr <strong>${safeCheck}</strong> wurde erfolgreich konfiguriert und ist aktiv.
    </p>
    <p class="intro" style="margin-bottom:28px;">
      Ihr Tool ist in 3 Varianten verfügbar — wählen Sie was am besten zu Ihnen passt:
    </p>

    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:28px;height:28px;border-radius:7px;background:#f0ede6;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="12" height="9" rx="1.5" stroke="#b8884a" stroke-width="1.3"/>
            <path d="M4 6l-2 1.5L4 9M10 6l2 1.5L10 9" stroke="#b8884a" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#1a1a1a;">Variante 1 — iFrame einbetten</div>
          <div style="font-size:11px;color:#9ca3af;">Direkt auf Ihrer Website</div>
        </div>
      </div>
      <div style="background:#f7f6f3;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;font-family:monospace;font-size:11px;color:#374151;word-break:break-all;line-height:1.7;">
        ${safeIframeInBox}
      </div>
      <div style="font-size:11px;color:#9ca3af;margin-top:5px;text-align:center;">
        ↑ Code markieren und kopieren
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:28px;height:28px;border-radius:7px;background:#f0ede6;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 7h10M7 2l5 5-5 5" stroke="#b8884a" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#1a1a1a;">Variante 2 — Direkt-Link teilen</div>
          <div style="font-size:11px;color:#9ca3af;">Per E-Mail, WhatsApp oder Social Media</div>
        </div>
      </div>
      <div style="background:#f7f6f3;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;font-size:12px;color:#374151;word-break:break-all;line-height:1.7;">
        <a href="${directUrl}" style="color:#b8884a;">
          ${safeDirectUrl}
        </a>
      </div>
      <div style="font-size:11px;color:#9ca3af;margin-top:5px;">
        Einfach kopieren und in jede Nachricht einfügen.
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:28px;height:28px;border-radius:7px;background:#f0ede6;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="#b8884a" stroke-width="1.3"/>
            <rect x="8" y="1" width="5" height="5" rx="1" stroke="#b8884a" stroke-width="1.3"/>
            <rect x="1" y="8" width="5" height="5" rx="1" stroke="#b8884a" stroke-width="1.3"/>
            <path d="M8 8h2v2H8zM10 10h3v3h-3z" fill="#b8884a"/>
          </svg>
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#1a1a1a;">Variante 3 — QR-Code drucken</div>
          <div style="font-size:11px;color:#9ca3af;">Für Visitenkarte, Flyer oder Messestand</div>
        </div>
      </div>
      <div style="background:#f7f6f3;border:1px solid #e5e7eb;border-radius:10px;padding:20px;text-align:center;">
        ${qrBlock}
        <a href="${directUrl}"
        style="display:inline-block;padding:9px 18px;background:#0f1a14;color:#fff;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">
          QR-Code herunterladen →
        </a>
        <div style="font-size:11px;color:#9ca3af;margin-top:8px;">
          Auf Visitenkarte oder Flyer — Kunde scannt und startet das Tool direkt.
        </div>
      </div>
    </div>

    <div style="margin-bottom:24px;">
      <div class="steps-title" style="margin-bottom:10px;">So binden Sie das Tool ein</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:5px 0;vertical-align:top;width:20px;font-size:13px;color:#b8884a;font-weight:700;">1.</td>
        <td style="padding:5px 0;font-size:13px;color:#4b5563;line-height:1.55;">
        iFrame-Code, Direkt-Link oder QR-Code aus dieser E-Mail wählen</td></tr>
        <tr><td style="padding:5px 0;vertical-align:top;width:20px;font-size:13px;color:#b8884a;font-weight:700;">2.</td>
        <td style="padding:5px 0;font-size:13px;color:#4b5563;line-height:1.55;">
        iFrame: Im Website-Editor ein &#8222;HTML-Element&#8220; einfügen und Code einfügen</td></tr>
        <tr><td style="padding:5px 0;vertical-align:top;width:20px;font-size:13px;color:#b8884a;font-weight:700;">3.</td>
        <td style="padding:5px 0;font-size:13px;color:#4b5563;line-height:1.55;">
        Link: Direkt in E-Mail oder Social Media teilen</td></tr>
        <tr><td style="padding:5px 0;vertical-align:top;width:20px;font-size:13px;color:#b8884a;font-weight:700;">4.</td>
        <td style="padding:5px 0;font-size:13px;color:#4b5563;line-height:1.55;">
        QR-Code: Herunterladen und drucken lassen</td></tr>
      </table>
    </div>

    <a href="${directUrl}" class="cta-btn">
      Tool in der Vorschau ansehen →
    </a>

    <div class="domain-box">
      Das Tool kann auf Ihrer Website eingebunden werden.<br/>
      Weitergabe des Codes ist gemäß AGB nicht gestattet.
    </div>

    <div class="divider"></div>

    <div class="hint">
      Bei Fragen stehen wir gerne zur Verfügung:<br/>
      <a href="mailto:${contactEmail.replace(/"/g, "")}">${safeContact}</a><br/><br/>
      <strong>Wichtiger Hinweis:</strong> Bitte ergänzen Sie Ihre Datenschutzerklärung
      um die Einbindung des Tools. Die Verarbeitung der Kundendaten liegt in
      Ihrer Verantwortung als Makler.
    </div>

  </div>

  <div class="footer">
    © ${new Date().getFullYear()} FlowLeads · Belal Masdjedi · Seitzstraße 15, 80538 München<br/>
    <a href="${safeAppUrl}/impressum">Impressum</a> ·
    <a href="${safeAppUrl}/datenschutz">Datenschutz</a> ·
    <a href="${safeAppUrl}/agb">AGB</a>
  </div>

</div>
</body>
</html>`;

  return { subject, html };
}
