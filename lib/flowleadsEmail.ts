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
  domain: string;
};

export function buildOnboardingEmailSubject(slug: string): string {
  const checkName = slugToDisplayName(slug);
  return `Ihr FlowLeads-Check ist bereit — ${checkName}`;
}

export function buildOnboardingEmail(p: OnboardingEmailParams): { subject: string; html: string } {
  const checkName = slugToDisplayName(p.slug);
  const iframeCode = buildLicensedIframeCode(p.slug, p.token, p.domain);
  const firstName = p.name.trim().split(/\s+/)[0] || p.name;
  const appUrl = publicAppUrl();
  const demoUrl = buildLicensedDemoUrl(p.slug, p.token, p.domain);
  const subject = buildOnboardingEmailSubject(p.slug);

  const safeFirst = escapeHtml(firstName);
  const safeCheck = escapeHtml(checkName);
  const safeIframeInBox = escapeHtml(iframeCode);
  const safeDomain = escapeHtml(p.domain);
  const safeDemoUrl = escapeHtml(demoUrl);
  const safeAppUrl = escapeHtml(appUrl);
  const contactEmail = flowleadsContactEmail();
  const safeContact = escapeHtml(contactEmail);

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0ede6;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#1a1a1a;padding:40px 16px;}
  .wrap{max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;}
  .header{background:#1a1a1a;padding:24px 32px;display:flex;align-items:center;gap:12px;}
  .header-logo{width:32px;height:32px;background:#b8884a;border-radius:8px;display:inline-block;}
  .header-name{color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.3px;}
  .body{padding:36px 32px;}
  .greeting{font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;margin-bottom:8px;}
  .intro{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:28px;}
  .code-label{font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;}
  .code-box{background:#f7f6f3;border:1px solid #e5e7eb;border-radius:10px;padding:16px;font-family:monospace;font-size:12px;color:#374151;word-break:break-all;line-height:1.7;margin-bottom:24px;}
  .steps-box{background:#fdf6ec;border:1px solid #f0d9b5;border-radius:12px;padding:22px 24px;margin-bottom:24px;}
  .steps-title{font-size:11px;font-weight:700;color:#b8884a;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;}
  .step{display:flex;gap:12px;margin-bottom:10px;align-items:flex-start;}
  .step:last-child{margin-bottom:0;}
  .step-num{width:22px;height:22px;background:rgba(184,136,74,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#b8884a;flex-shrink:0;text-align:center;line-height:22px;}
  .step-text{font-size:13px;color:#4b5563;line-height:1.55;padding-top:2px;}
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
    <div class="header-logo"></div>
    <span class="header-name">FlowLeads</span>
  </div>

  <div class="body">

    <div class="greeting">Ihr Check ist bereit, ${safeFirst}.</div>
    <p class="intro">
      Ihr <strong>${safeCheck}</strong> wurde erfolgreich konfiguriert und ist aktiv.
      Kopieren Sie den iFrame-Code unten und fügen Sie ihn auf Ihrer Website ein.
      Eine Anleitung finden Sie direkt darunter.
    </p>

    <div class="code-label">Ihr iFrame-Code</div>
    <div class="code-box">${safeIframeInBox}</div>

    <div class="steps-box">
      <div class="steps-title">So binden Sie den Check ein</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">Code oben kopieren</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">Im Website-Editor ein „HTML / Einbettungs-Element“ einfügen (WordPress, Jimdo, Squarespace, Wix, Webflow)</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">Code einfügen und Seite speichern</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-text">Fertig — der Check ist live auf Ihrer Website</div>
      </div>
    </div>

    <a href="${safeDemoUrl}" class="cta-btn">
      Check in der Vorschau ansehen →
    </a>

    <div class="domain-box">
      <strong>Lizenziert für:</strong> ${safeDomain}<br/>
      Der Check funktioniert ausschließlich auf dieser Domain.
      Weitergabe des Codes ist nicht gestattet.
    </div>

    <div class="divider"></div>

    <div class="hint">
      Bei Fragen stehen wir gerne zur Verfügung:<br/>
      <a href="mailto:${contactEmail.replace(/"/g, "")}">${safeContact}</a><br/><br/>
      <strong>Wichtiger Hinweis:</strong> Bitte ergänzen Sie Ihre Datenschutzerklärung
      um die Einbindung des Checks. Die Verarbeitung der Kundendaten liegt in
      Ihrer Verantwortung als Makler.
    </div>

  </div>

  <div class="footer">
    © ${new Date().getFullYear()} FlowLeads · Thomas Schreiber · Seitzstraße 15, 80538 München<br/>
    <a href="${safeAppUrl}/impressum">Impressum</a> ·
    <a href="${safeAppUrl}/datenschutz">Datenschutz</a> ·
    <a href="${safeAppUrl}/agb">AGB</a>
  </div>

</div>
</body>
</html>`;

  return { subject, html };
}
