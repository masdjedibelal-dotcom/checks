import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatResendFrom } from "@/lib/flowleadsMailConfig";
import { getSupabaseServiceRole } from "@/lib/supabaseService";

export const runtime = "nodejs";

const SLUG_NAMES: Record<string, string> = {
  bedarfscheck: "Versicherungs-Check",
  "lebenssituations-check": "Lebenssituations-Check",
  "einkommens-check": "Einkommensabsicherung",
  "gkv-pkv": "KV-Navigator",
  "vorsorge-check": "Vorsorge-Check",
  risikoleben: "Risikoleben-Check",
  "pflege-check": "Pflege-Check",
  "immobilien-check": "Immo-Schutz-Dach",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const kundenName = typeof body.kundenName === "string" ? body.kundenName.trim() : "";
  const kundenEmail = typeof body.kundenEmail === "string" ? body.kundenEmail.trim() : "";
  const kundenTel =
    typeof body.kundenTel === "string"
      ? body.kundenTel.trim()
      : typeof body.kundenTelefon === "string"
        ? body.kundenTelefon.trim()
        : "";

  if (!token || !slug || !kundenName || !kundenEmail) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  if (!SLUG_NAMES[slug]) {
    return NextResponse.json({ error: "Ungültiger Check" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseServiceRole();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server nicht konfiguriert" }, { status: 500 });
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("email")
    .eq("token", token)
    .eq("status", "active")
    .maybeSingle();

  if (purchaseError || !purchase?.email) {
    return NextResponse.json({ error: "Token ungültig" }, { status: 400 });
  }

  const toolName = SLUG_NAMES[slug] ?? slug;
  const now = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

  const safeName = escapeHtml(kundenName);
  const safeEmail = escapeHtml(kundenEmail);
  const safeTel = escapeHtml(kundenTel || "—");
  const safeTool = escapeHtml(toolName);

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromRaw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resendKey || !fromRaw) {
    console.error("RESEND_API_KEY oder RESEND_FROM_EMAIL fehlt");
    return NextResponse.json({ error: "E-Mail-Versand nicht konfiguriert" }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const { error: mailErr } = await resend.emails.send({
    from: formatResendFrom(fromRaw),
    to: [purchase.email],
    replyTo: kundenEmail,
    subject: `Neue Anfrage über ${toolName} — ${kundenName}`,
    html: `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/></head>
<body style="font-family:'DM Sans',Helvetica,Arial,
sans-serif;background:#f0ede6;margin:0;padding:40px 16px;">
<div style="max-width:520px;margin:0 auto;
background:#fff;border-radius:16px;overflow:hidden;
border:1px solid #e5e7eb;">

  <div style="background:#0f1a14;padding:22px 28px;
  display:flex;align-items:center;gap:10px;">
    <div style="width:32px;height:32px;background:#1a1a1a;
    border-radius:8px;display:inline-flex;align-items:center;
    justify-content:center;flex-shrink:0;">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a"/>
        <rect x="9.5" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4"/>
        <rect x="1" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4"/>
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a"/>
      </svg>
    </div>
    <span style="color:#fff;font-size:16px;font-weight:700;letter-spacing:-.3px;">
      FlowLeads
    </span>
  </div>

  <div style="padding:28px;">
    <div style="background:#fdf6ec;border:1px solid #f0d9b5;
    border-radius:10px;padding:14px 16px;margin-bottom:24px;
    display:flex;align-items:center;gap:10px;">
      <div style="width:8px;height:8px;border-radius:50%;
      background:#b8884a;flex-shrink:0;"></div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#1a1a1a;">Neue Anfrage eingegangen</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:2px;">${escapeHtml(now)} · ${safeTool}</div>
      </div>
    </div>

    <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-.4px;margin-bottom:20px;">
      ${safeName} möchte ein Gespräch.
    </h2>

    <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
      <div style="padding:12px 16px;background:#faf9f6;border-bottom:1px solid #f3f4f6;">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;">
          Kontaktdaten
        </div>
      </div>
      <div style="padding:0 16px;">
        <div style="padding:12px 0;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:#6b7280;">Name</span>
          <span style="font-size:13px;font-weight:600;color:#1a1a1a;">${safeName}</span>
        </div>
        <div style="padding:12px 0;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:#6b7280;">E-Mail</span>
          <a href="mailto:${encodeURIComponent(kundenEmail)}"
          style="font-size:13px;font-weight:600;color:#b8884a;">${safeEmail}</a>
        </div>
        <div style="padding:12px 0;display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:#6b7280;">Telefon</span>
          <span style="font-size:13px;font-weight:600;color:#1a1a1a;">${safeTel}</span>
        </div>
      </div>
    </div>

    <div style="background:#f7f6f3;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
      <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">Anfrage über</div>
      <div style="font-size:14px;font-weight:600;color:#1a1a1a;">${safeTool}</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:2px;">Eingebunden auf Ihrer Website</div>
    </div>

    <a href="mailto:${encodeURIComponent(kundenEmail)}?subject=${encodeURIComponent(`Re: Ihre Anfrage über ${toolName}`)}"
    style="display:block;width:100%;padding:13px;background:#0f1a14;color:#fff;border-radius:10px;
    font-size:14px;font-weight:700;text-align:center;text-decoration:none;box-sizing:border-box;">
      Jetzt antworten →
    </a>
  </div>

  <div style="padding:16px 28px;background:#faf9f6;border-top:1px solid #f3f4f6;font-size:11px;
  color:#9ca3af;text-align:center;">
    © 2026 FlowLeads ·
    <a href="https://versicherung-leadrechner.netlify.app"
    style="color:#9ca3af;">flowleads.de</a>
  </div>
</div>
</body>
</html>`,
  });

  if (mailErr) {
    console.error("Resend lead mail:", mailErr);
    return NextResponse.json({ error: "E-Mail-Versand fehlgeschlagen" }, { status: 502 });
  }

  const { error: leadErr } = await supabase.from("leads").insert({
    token,
    slug,
    kunden_name: kundenName,
    kunden_email: kundenEmail,
    kunden_tel: kundenTel || null,
    makler_email: purchase.email,
  });
  if (leadErr) {
    console.error("Supabase leads insert:", leadErr);
  }

  return NextResponse.json({ success: true });
}
