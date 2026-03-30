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
  return `Ihre FlowLeads-Microsite ist bereit — ${checkName}`;
}

export function buildOnboardingEmail(p: OnboardingEmailParams): { subject: string; html: string } {
  const checkName = slugToDisplayName(p.slug);
  const iframeCode = buildLicensedIframeCode(p.slug, p.token);
  const firstName = p.name?.trim().split(/\s+/)[0] || "";
  const appUrl = publicAppUrl();
  const directUrl = buildLicensedDemoUrl(p.slug, p.token);
  const subject = buildOnboardingEmailSubject(p.slug);
  const contactEmail = flowleadsContactEmail();

  const safeFirst = escapeHtml(firstName);
  const safeCheck = escapeHtml(checkName);
  const safeIframe = escapeHtml(iframeCode);
  const safeDirectUrl = escapeHtml(directUrl);
  const safeAppUrl = escapeHtml(appUrl);
  const safeContact = escapeHtml(contactEmail);

  const successUrl = p.sessionId
    ? `${appUrl}/success?session_id=${encodeURIComponent(p.sessionId)}`
    : `${appUrl}`;
  const safeSuccessUrl = escapeHtml(successUrl);

  const greetingName = safeFirst ? `Vielen Dank, ${safeFirst}.` : "Vielen Dank für Ihren Kauf.";

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f9fafb;font-family:'DM Sans',Helvetica,'Helvetica Neue',Arial,sans-serif;color:#111827;padding:32px 16px;}
  .wrap{max-width:540px;margin:0 auto;}
  .card{background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;}
  .hd{background:#111827;padding:18px 28px;display:flex;align-items:center;gap:10px;}
  .hd-name{color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.2px;}
  .body{padding:32px 28px;}
  .eyebrow{font-size:10px;font-weight:700;color:#3B6D11;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
  .greeting{font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.4px;margin-bottom:8px;line-height:1.2;}
  .sub{font-size:14px;color:#6B7280;line-height:1.65;margin-bottom:20px;}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#EAF3DE;border:1px solid #C0DD97;border-radius:999px;font-size:12px;font-weight:600;color:#3B6D11;margin-bottom:24px;}
  .chip-dot{width:6px;height:6px;border-radius:50%;background:#3B6D11;flex-shrink:0;}
  .cta{display:block;background:#111827;color:#ffffff;padding:13px 20px;border-radius:10px;font-size:14px;font-weight:700;text-align:center;text-decoration:none;margin-bottom:28px;}
  .divider{height:1px;background:#F3F4F6;margin:0 0 20px;}
  .section-lbl{font-size:10px;font-weight:700;color:#9CA3AF;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;}
  .variant{display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid #F3F4F6;}
  .variant:last-child{border-bottom:none;}
  .v-icon{width:34px;height:34px;border-radius:9px;background:#F9FAFB;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;}
  .v-title{font-size:13px;font-weight:700;color:#111827;margin-bottom:2px;}
  .v-sub{font-size:11px;color:#9CA3AF;margin-bottom:6px;line-height:1.45;}
  .v-code{font-size:10px;font-family:ui-monospace,monospace;color:#6B7280;background:#F9FAFB;padding:7px 9px;border-radius:6px;border:1px solid #E5E7EB;margin-bottom:5px;overflow:hidden;display:block;word-break:break-all;line-height:1.6;}
  .v-action{font-size:11px;color:#185FA5;font-weight:600;text-decoration:none;}
  .steps{background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:18px 20px;margin:24px 0;}
  .steps-lbl{font-size:10px;font-weight:700;color:#854F0B;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;}
  .step{font-size:13px;color:#4B5563;line-height:1.55;padding:3px 0;display:flex;gap:8px;}
  .step-n{color:#854F0B;font-weight:700;flex-shrink:0;}
  .hint{font-size:12px;color:#9CA3AF;line-height:1.7;}
  .hint a{color:#854F0B;}
  .footer{background:#F9FAFB;border-top:1px solid #F3F4F6;padding:16px 28px;font-size:11px;color:#9CA3AF;text-align:center;}
  .footer a{color:#9CA3AF;}
</style>
</head>
<body>
<div class="wrap">
<div class="card">

  <div class="hd">
    <div style="width:28px;height:28px;background:#1a1a1a;border-radius:7px;border:1px solid #333;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a"/>
        <rect x="9.5" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4"/>
        <rect x="1" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4"/>
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a"/>
      </svg>
    </div>
    <span class="hd-name">FlowLeads</span>
  </div>

  <div class="body">

    <div class="eyebrow">Kauf bestätigt</div>
    <div class="greeting">${greetingName}</div>
    <p class="sub">Ihre Microsite ist aktiv. Hier sind alle Varianten für den sofortigen Start.</p>

    <div class="chip">
      <span class="chip-dot"></span>
      ${safeCheck} &middot; aktiv
    </div>

    <a href="${safeSuccessUrl}" class="cta">Microsite ansehen und Code kopieren &rarr;</a>

    <div class="divider"></div>
    <div class="section-lbl">Ihre Einbettungs-Varianten</div>

    <div class="variant">
      <div class="v-icon">🔗</div>
      <div style="flex:1;min-width:0;">
        <div class="v-title">Direkt-Link</div>
        <div class="v-sub">Für E-Mail, WhatsApp, Social Media</div>
        <span class="v-code">${safeDirectUrl}</span>
        <a href="${safeSuccessUrl}" class="v-action">&rarr; Auf Bestätigungsseite kopieren</a>
      </div>
    </div>

    <div class="variant">
      <div class="v-icon" style="font-family:monospace;font-size:11px;color:#6B7280;font-weight:700;">&lt;/&gt;</div>
      <div style="flex:1;min-width:0;">
        <div class="v-title">iFrame einbetten</div>
        <div class="v-sub">Direkt auf Ihrer Website</div>
        <span class="v-code">${safeIframe.substring(0, 80)}…</span>
        <a href="${safeSuccessUrl}" class="v-action">&rarr; Vollständigen Code auf Bestätigungsseite kopieren</a>
      </div>
    </div>

    <div class="variant">
      <div class="v-icon">⬜</div>
      <div style="flex:1;min-width:0;">
        <div class="v-title">QR-Code</div>
        <div class="v-sub">Für Visitenkarte, Flyer, Messestand</div>
        <a href="${safeSuccessUrl}" class="v-action">&rarr; QR-Code auf Bestätigungsseite herunterladen</a>
      </div>
    </div>

    <div class="steps">
      <div class="steps-lbl">So geht&apos;s</div>
      <div class="step"><span class="step-n">1.</span><span>Bestätigungsseite öffnen — Link oben oder im Button</span></div>
      <div class="step"><span class="step-n">2.</span><span>Direkt-Link oder iFrame-Code per Klick kopieren</span></div>
      <div class="step"><span class="step-n">3.</span><span>QR-Code herunterladen und drucken lassen</span></div>
    </div>

    <div class="hint">
      Bei Fragen: <a href="mailto:${safeContact}">${safeContact}</a><br/><br/>
      <strong style="color:#374151;">Datenschutz:</strong> Bitte ergänzen Sie Ihre Datenschutzerklärung
      um die Einbindung der Microsite. Die Verarbeitung der Kundendaten liegt in Ihrer Verantwortung.
    </div>

  </div>

  <div class="footer">
    &copy; ${new Date().getFullYear()} FlowLeads &middot; Belal Masdjedi &middot; Seitzstraße 15, 80538 München<br/>
    <a href="${safeAppUrl}/impressum">Impressum</a> &middot;
    <a href="${safeAppUrl}/datenschutz">Datenschutz</a> &middot;
    <a href="${safeAppUrl}/agb">AGB</a>
  </div>

</div>
</div>
</body>
</html>`;

  return { subject, html };
}
