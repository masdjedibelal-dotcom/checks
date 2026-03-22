import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import crypto from "crypto";
import { buildOnboardingEmailHtml, onboardingEmailSubject } from "@/lib/flowleadsOnboardingEmail";
import { flowleadsContactEmail, formatResendFrom } from "@/lib/flowleadsMailConfig";
import { normalizeDomainHost } from "@/lib/licenseUtils";
import { getSupabaseServiceRole } from "@/lib/supabaseService";

export const runtime = "nodejs";

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

function generateToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Stripe nicht konfiguriert" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Keine Signatur" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("Stripe webhook signature:", e);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata;
  if (!meta?.email?.trim() || !meta?.name?.trim() || !meta?.slug?.trim()) {
    console.error("checkout.session.completed: fehlende Metadaten", meta);
    return NextResponse.json({ error: "metadata" }, { status: 400 });
  }

  const domain = normalizeDomainHost(meta.domain);
  if (!domain) {
    console.error("checkout.session.completed: domain fehlt", meta);
    return NextResponse.json({ error: "domain required" }, { status: 400 });
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
  const accent = meta.accent_color?.trim() || "#1a3a5c";

  const { error: insertError } = await supabase.from("purchases").insert({
    email: meta.email.trim(),
    name: meta.name.trim(),
    firma: meta.firma?.trim() || null,
    slug: meta.slug.trim(),
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
  if (resendKey && process.env.RESEND_FROM_EMAIL?.trim()) {
    const resend = new Resend(resendKey);
    const { error: mailErr } = await resend.emails.send({
      from,
      to: meta.email.trim(),
      replyTo: flowleadsContactEmail(),
      subject: onboardingEmailSubject(meta.slug.trim()),
      html: buildOnboardingEmailHtml({
        name: meta.name.trim(),
        firma: meta.firma?.trim() || "",
        slug: meta.slug.trim(),
        token,
        domain,
      }),
    });
    if (mailErr) {
      console.error("Resend error:", mailErr);
      return NextResponse.json({ error: "E-Mail Versand fehlgeschlagen" }, { status: 500 });
    }
  } else {
    console.warn("RESEND_API_KEY / RESEND_FROM_EMAIL fehlt — kein Versand");
  }

  return NextResponse.json({ received: true });
}
