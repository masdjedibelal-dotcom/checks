import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatResendFrom, flowleadsContactEmail } from "@/lib/flowleadsMailConfig";
import { publicAppUrl } from "@/lib/licenseUtils";
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
  "immobilien-check": "Immobilienabsicherung",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MAX_LEAD_HIGHLIGHTS = 12;
const MAX_HIGHLIGHT_LABEL = 80;
const MAX_HIGHLIGHT_VALUE = 220;

function parseLeadHighlights(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { label: string; value: string }[] = [];
  for (const item of raw) {
    if (out.length >= MAX_LEAD_HIGHLIGHTS) break;
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const label =
      typeof o.label === "string" ? o.label.trim().slice(0, MAX_HIGHLIGHT_LABEL) : "";
    const value =
      typeof o.value === "string" ? o.value.trim().slice(0, MAX_HIGHLIGHT_VALUE) : "";
    if (!label || !value) continue;
    out.push({ label, value });
  }
  return out;
}

function highlightsEmailBlock(highlights: { label: string; value: string }[]): string {
  if (highlights.length === 0) return "";
  const rows = highlights
    .map(
      (h) => `<div class="kv-row" style="align-items:flex-start;">
          <span class="kv-label" style="flex:1;min-width:0;text-align:left;">${escapeHtml(h.label)}</span>
          <span class="kv-val" style="max-width:55%;word-break:break-word;">${escapeHtml(h.value)}</span>
        </div>`,
    )
    .join("");
  return `<div class="kv-wrap" style="margin-bottom:20px;">
      <div class="kv-head">
        <div class="kv-head-lbl">Ergebnis-Kennzahlen</div>
      </div>
      <div class="kv-body">${rows}</div>
    </div>`;
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

  const PAKET_KEYS = new Set(["basis", "komfort", "premium"]);
  const rawPakete = body.gewaehltePakete;
  let gewaehltePakete: string[] = [];
  if (Array.isArray(rawPakete)) {
    gewaehltePakete = Array.from(
      new Set(
        rawPakete.filter((x): x is string => typeof x === "string" && PAKET_KEYS.has(x)),
      ),
    );
  }

  const highlights = parseLeadHighlights(body.highlights);

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

  const paketLabel: Record<string, string> = {
    basis: "Basis",
    komfort: "Komfort",
    premium: "Premium",
  };
  const paketText =
    slug === "bedarfscheck" && gewaehltePakete.length > 0
      ? gewaehltePakete.map((k) => paketLabel[k] ?? k).join(", ")
      : "";
  const safePakete = escapeHtml(paketText);

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromRaw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resendKey || !fromRaw) {
    console.error("RESEND_API_KEY oder RESEND_FROM_EMAIL fehlt");
    return NextResponse.json({ error: "E-Mail-Versand nicht konfiguriert" }, { status: 500 });
  }

  const appUrl = publicAppUrl();
  const safeAppUrl = escapeHtml(appUrl);
  const safeContact = escapeHtml(flowleadsContactEmail());
  const mailtoLead = `mailto:${encodeURIComponent(kundenEmail)}?subject=${encodeURIComponent(`Re: Ihre Anfrage über ${toolName}`)}`;
  const mailtoSimple = `mailto:${encodeURIComponent(kundenEmail)}`;

  const paketBlock = paketText
    ? `<div class="kv-wrap" style="margin-bottom:20px;">
      <div class="kv-head">
        <div class="kv-head-lbl">Gewünschte Absicherungspakete</div>
      </div>
      <div class="kv-body" style="padding:16px;">
        <div style="font-size:14px;font-weight:600;color:#111827;">${safePakete}</div>
        <div class="hint" style="margin-top:8px;line-height:1.45;">
          Vom Kunden im Versicherungs-Check ausgewählt — mehrfach möglich.
        </div>
      </div>
    </div>`
    : "";

  const resend = new Resend(resendKey);
  const { error: mailErr } = await resend.emails.send({
    from: formatResendFrom(fromRaw),
    to: [purchase.email],
    replyTo: kundenEmail,
    subject: `Neue Anfrage über ${toolName} — ${kundenName}`,
    html: `<!DOCTYPE html>
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
  .kv-head-lbl{font-size:10px;font-weight:700;color:#9CA3AF;letter-spacing:1px;text-transform:uppercase;}
  .kv-wrap{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;}
  .kv-head{padding:12px 16px;background:#F9FAFB;border-bottom:1px solid #F3F4F6;}
  .kv-body{padding:0 16px 4px;}
  .kv-row{padding:12px 0;border-bottom:1px solid #F3F4F6;display:flex;justify-content:space-between;gap:12px;align-items:center;}
  .kv-row:last-child{border-bottom:none;}
  .kv-label{font-size:13px;color:#6B7280;}
  .kv-val{font-size:13px;font-weight:600;color:#111827;text-align:right;flex-shrink:0;}
  .kv-val a{color:#185FA5;font-weight:600;text-decoration:none;}
  .meta-box{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;margin-bottom:24px;}
  .meta-box-lbl{font-size:10px;font-weight:700;color:#9CA3AF;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;}
  .meta-box-title{font-size:14px;font-weight:700;color:#111827;}
  .meta-box-sub{font-size:12px;color:#9CA3AF;margin-top:4px;line-height:1.45;}
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

    <div class="eyebrow">Neue Anfrage</div>
    <div class="greeting">${safeName} möchte ein Gespräch.</div>
    <p class="sub">${escapeHtml(now)} · ${safeTool}</p>

    <div class="chip">
      <span class="chip-dot"></span>
      ${safeTool} &middot; eingegangen
    </div>

    <div class="divider"></div>

    <div class="kv-wrap" style="margin-bottom:20px;">
      <div class="kv-head">
        <div class="kv-head-lbl">Kontaktdaten</div>
      </div>
      <div class="kv-body" style="padding-top:4px;">
        <div class="kv-row">
          <span class="kv-label">Name</span>
          <span class="kv-val">${safeName}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">E-Mail</span>
          <a class="kv-val" href="${escapeHtml(mailtoSimple)}">${safeEmail}</a>
        </div>
        <div class="kv-row">
          <span class="kv-label">Telefon</span>
          <span class="kv-val">${safeTel}</span>
        </div>
      </div>
    </div>

    <div class="meta-box">
      <div class="meta-box-lbl">Anfrage über</div>
      <div class="meta-box-title">${safeTool}</div>
      <div class="meta-box-sub">Eingebunden auf Ihrer Website</div>
    </div>

    ${paketBlock}

    ${highlightsEmailBlock(highlights)}

    <div class="hint" style="margin-bottom:24px;">
      Bei Fragen zum Produkt: <a href="mailto:${safeContact}">${safeContact}</a>
    </div>

    <a href="${escapeHtml(mailtoLead)}" class="cta" style="margin-bottom:0;">Jetzt antworten &rarr;</a>

  </div>

  <div class="footer">
    &copy; ${new Date().getFullYear()} FlowLeads &middot; Max Schreiber &middot; Seitzstraße 16, 80538 München<br/>
    <a href="${safeAppUrl}/impressum">Impressum</a> &middot;
    <a href="${safeAppUrl}/datenschutz">Datenschutz</a> &middot;
    <a href="${safeAppUrl}/agb">AGB</a>
  </div>

</div>
</div>
</body>
</html>`,
  });

  if (mailErr) {
    console.error("Resend lead mail:", mailErr);
    return NextResponse.json({ error: "E-Mail-Versand fehlgeschlagen" }, { status: 502 });
  }

  const leadRow: Record<string, unknown> = {
    token,
    slug,
    kunden_name: kundenName,
    kunden_email: kundenEmail,
    kunden_tel: kundenTel || null,
    makler_email: purchase.email,
  };
  if (slug === "bedarfscheck" && gewaehltePakete.length > 0) {
    leadRow.gewaehlte_pakete = JSON.stringify(gewaehltePakete);
  }
  if (highlights.length > 0) {
    leadRow.highlights = JSON.stringify(highlights);
  }

  const { error: leadErr } = await supabase.from("leads").insert(leadRow);
  if (leadErr) {
    console.error("Supabase leads insert:", leadErr);
  }

  return NextResponse.json({ success: true });
}
