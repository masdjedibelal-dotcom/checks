import {
  buildLicensedIframeCode,
  escapeHtml,
  slugToDisplayName,
} from "@/lib/flowleadsEmbed";

export type OnboardingEmailParams = {
  name: string;
  firma: string;
  slug: string;
  token: string;
  domain: string;
};

export function buildOnboardingEmailHtml(p: OnboardingEmailParams): string {
  const iframeCode = buildLicensedIframeCode(p.slug, p.token, p.domain);
  const firstName = p.name.trim().split(/\s+/)[0] || p.name;
  const checkLabel = slugToDisplayName(p.slug);
  const safeIframeInBox = escapeHtml(iframeCode);
  const safeDomain = escapeHtml(p.domain);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><style>
  body{font-family:'DM Sans',system-ui,sans-serif;background:#f0ede6;color:#1a1a1a;margin:0;padding:0;}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;}
  .hd{background:#1a1a1a;padding:28px 32px;display:flex;align-items:center;gap:10px;}
  .hd-logo{background:#b8884a;width:32px;height:32px;border-radius:8px;}
  .hd-name{color:#fff;font-size:16px;font-weight:700;}
  .body{padding:32px;}
  h2{font-size:22px;font-weight:700;margin-bottom:8px;letter-spacing:-.3px;}
  p{font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:16px;}
  .code-box{background:#f7f6f3;border:1px solid #e5e7eb;border-radius:10px;padding:16px;font-family:monospace;font-size:12px;color:#374151;word-break:break-all;line-height:1.7;margin:20px 0;}
  .steps{background:#fdf6ec;border:1px solid #f0d9b5;border-radius:10px;padding:18px 20px;margin:20px 0;}
  .steps h3{font-size:13px;font-weight:700;color:#b8884a;margin-bottom:10px;}
  .step{font-size:13px;color:#4b5563;margin-bottom:7px;display:flex;gap:10px;}
  .step-n{font-weight:700;color:#b8884a;flex-shrink:0;}
  .hint{font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;margin-top:16px;line-height:1.65;}
  .ft{padding:20px 32px;background:#faf9f6;border-top:1px solid #f3f4f6;font-size:12px;color:#9ca3af;text-align:center;}
</style></head>
<body>
<div class="wrap">
  <div class="hd">
    <div class="hd-logo"></div>
    <span class="hd-name">FlowLeads</span>
  </div>
  <div class="body">
    <h2>Ihr Check ist bereit, ${escapeHtml(firstName)}.</h2>
    <p>Ihr <strong>${escapeHtml(checkLabel)}</strong> wurde erfolgreich konfiguriert und ist jetzt aktiv. Fügen Sie den folgenden Code auf Ihrer Website ein.</p>

    <strong style="font-size:13px;color:#374151;display:block;margin-bottom:8px;">Ihr iFrame-Code:</strong>
    <div class="code-box">${safeIframeInBox}</div>

    <div class="steps">
      <h3>So binden Sie den Check ein</h3>
      <div class="step"><span class="step-n">01</span><span>Code oben kopieren</span></div>
      <div class="step"><span class="step-n">02</span><span>Im Website-Editor ein „HTML/Einbettungs“-Element einfügen</span></div>
      <div class="step"><span class="step-n">03</span><span>Code einfügen — fertig</span></div>
      <div class="step"><span class="step-n">04</span><span>Funktioniert auf: WordPress, Jimdo, Squarespace, Wix, Webflow</span></div>
    </div>

    <div class="hint">
      <strong style="color:#374151;">Wichtige Hinweise:</strong><br/>
      Der Check ist lizenziert für die Domain <strong>${safeDomain}</strong>.
      Einbindung auf anderen Domains ist nicht gestattet.<br/><br/>
      Die Einbindung und Verarbeitung der Kundendaten liegt in Ihrer Verantwortung.
      Bitte ergänzen Sie Ihre Datenschutzerklärung entsprechend.<br/><br/>
      Mit der Einbindung übernehmen Sie die Verantwortung gemäß Ihrer GewO-Erlaubnis (§ 34d).<br/><br/>
      Bei Fragen: <a href="mailto:support@flowleads.de" style="color:#b8884a;">support@flowleads.de</a>
    </div>
  </div>
  <div class="ft">© ${new Date().getFullYear()} FlowLeads · <a href="https://flowleads.de/impressum" style="color:#9ca3af;">Impressum</a> · <a href="https://flowleads.de/datenschutz" style="color:#9ca3af;">Datenschutz</a></div>
</div>
</body>
</html>`;
}

export function onboardingEmailSubject(slug: string): string {
  return `Ihr FlowLeads-Check ist bereit — ${slugToDisplayName(slug)}`;
}
