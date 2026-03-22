import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import crypto from "crypto";
import { buildOnboardingEmailHtml, onboardingEmailSubject } from "@/lib/flowleadsOnboardingEmail";
import { flowleadsContactEmail, formatResendFrom } from "@/lib/flowleadsMailConfig";
import { normalizeDomainHost } from "@/lib/licenseUtils";
import { getSupabaseServiceRole } from "@/lib/supabaseService";

export const runtime = "nodejs";
/** Roh-Body für Stripe-Signatur — keine statische Optimierung, kein JSON-Parsing vorher. */
export const dynamic = "force-dynamic";

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

function generateToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * GET vermeidet irreführendes „405“ im Browser. Stripe-Webhooks nutzen ausschließlich POST
 * mit Roh-Body und `stripe-signature`.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhook",
    usage: "Nur POST (Stripe). GET dient nur zur Prüfung, ob die Route erreichbar ist.",
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 500 });
  }

  // Wichtig: exakt der Roh-String wie von Stripe gesendet — nicht req.json() verwenden.
  const rawBody = await req.text();
  if (!rawBody.length) {
    console.error("Stripe webhook: leerer Body");
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Keine Signatur" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(rawBody, sig, secret);
  } catch (e) {
    console.error("Stripe webhook signature:", e);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};

  const email =
    (typeof meta.email === "string" && meta.email.trim()) ||
    (typeof session.customer_email === "string" && session.customer_email.trim()) ||
    (session.customer_details?.email && String(session.customer_details.email).trim()) ||
    "";

  const name =
    (typeof meta.name === "string" && meta.name.trim()) ||
    (session.customer_details?.name && String(session.customer_details.name).trim()) ||
    "";

  const slug = typeof meta.slug === "string" ? meta.slug.trim() : "";

  if (!email || !name || !slug) {
    console.error("checkout.session.completed: fehlende Pflichtfelder", {
      meta,
      customer_email: session.customer_email,
      hasCustomerDetails: !!session.customer_details,
    });
    return NextResponse.json(
      {
        error: "metadata",
        code: "missing_checkout_fields",
        hint: "email/name/slug — prüfe Checkout-Session metadata oder customer_email / customer_details.",
      },
      { status: 400 }
    );
  }

  const domain = normalizeDomainHost(typeof meta.domain === "string" ? meta.domain : "");
  if (!domain) {
    console.error("checkout.session.completed: domain fehlt", meta);
    return NextResponse.json(
      { error: "domain required", code: "missing_domain" },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServiceRole();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Supabase nicht konfiguriert" }, { status: 500 });
  }

  const { data: existing } = await supabase
    .from("purchases")
    .select("id, token")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const token = generateToken();
  const accent =
    typeof meta.accent_color === "string" && meta.accent_color.trim()
      ? meta.accent_color.trim()
      : "#1a3a5c";

  const { error: insertError } = await supabase.from("purchases").insert({
    email,
    name,
    firma: typeof meta.firma === "string" ? meta.firma.trim() || null : null,
    slug,
    token,
    domain,
    accent_color: accent,
    stripe_session_id: session.id,
    status: "active",
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Supabase insert error:", insertError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = formatResendFrom(process.env.RESEND_FROM_EMAIL);
  const resendTestEmail = process.env.RESEND_TEST_EMAIL?.trim();
  if (resendTestEmail && resendTestEmail !== email) {
    console.warn(
      "Resend: RESEND_TEST_EMAIL aktiv — to:",
      resendTestEmail,
      "| Käufer (DB):",
      email
    );
  }
  if (resendKey && process.env.RESEND_FROM_EMAIL?.trim()) {
    const resend = new Resend(resendKey);
    const { error: mailErr } = await resend.emails.send({
      from,
      to: [resendTestEmail || email],
      replyTo: flowleadsContactEmail(),
      subject: onboardingEmailSubject(slug),
      html: buildOnboardingEmailHtml({
        name,
        firma: typeof meta.firma === "string" ? meta.firma.trim() : "",
        slug,
        token,
        domain,
      }),
    });
    if (mailErr) {
      // Lizenz ist bereits in Supabase — 200, damit Stripe nicht endlos retriert und die Success-Seite den Kauf findet.
      console.error("Resend error (Kauf gespeichert, E-Mail ggf. manuell senden):", mailErr);
    }
  } else {
    console.warn("RESEND_API_KEY / RESEND_FROM_EMAIL fehlt — kein Versand");
  }

  return NextResponse.json({ received: true });
}
