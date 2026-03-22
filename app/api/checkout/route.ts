import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizeDomainHost } from "@/lib/licenseUtils";

/**
 * Fallback-Price-IDs (historisch). Wenn Stripe „No such price“ meldet, passen sie nicht zu
 * STRIPE_SECRET_KEY — dann auf Netlify `STRIPE_PRICE_IDS_JSON` setzen (Slug → price_…).
 */
const DEFAULT_STRIPE_PRICE_IDS: Record<string, string> = {
  bedarfscheck: "price_1TDlFRCWQbLUwqOtPni0DcmM",
  "lebenssituations-check": "price_1TDlFqCWQbLUwqOt5AirEA3x",
  "einkommens-check": "price_1TDlG6CWQbLUwqOtLDMljOen",
  "gkv-pkv": "price_1TDlGMCWQbLUwqOtrCOzgPzm",
  "vorsorge-check": "price_1TDlGbCWQbLUwqOtiy2e6TkD",
  risikoleben: "price_1TDlGqCWQbLUwqOtwhkLZNc3",
  "pflege-check": "price_1TDlH4CWQbLUwqOtmW6laQsr",
  "immobilien-check": "price_1TDlHICWQbLUwqOtFct53MTA",
};

function parseStripePriceOverrides(): Record<string, string> {
  const raw = process.env.STRIPE_PRICE_IDS_JSON?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.startsWith("price_")) out[k] = v;
    }
    return out;
  } catch (e) {
    console.error("STRIPE_PRICE_IDS_JSON ungültig:", e);
    return {};
  }
}

function resolvedStripePriceIds(): Record<string, string> {
  return { ...DEFAULT_STRIPE_PRICE_IDS, ...parseStripePriceOverrides() };
}

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY fehlt in .env.local" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  /** Neues Format (FlowLeads) */
  const slugNew = typeof body.slug === "string" ? body.slug : undefined;
  const emailNew = typeof body.email === "string" ? body.email : undefined;
  const nameNew = typeof body.name === "string" ? body.name : undefined;

  /** Altes Format (Legacy-Konfigurator) */
  const slugLegacy =
    typeof body.templateSlug === "string" ? body.templateSlug : undefined;
  const emailLegacy =
    typeof body.maklerEmail === "string" ? body.maklerEmail : undefined;
  const nameLegacy =
    typeof body.maklerName === "string" ? body.maklerName : undefined;

  const slug = slugNew ?? slugLegacy;
  const email = (emailNew ?? emailLegacy ?? "").trim();
  const name = (nameNew ?? nameLegacy ?? "").trim();

  const firma = typeof body.firma === "string" ? body.firma : "";
  const domain = normalizeDomainHost(
    typeof body.domain === "string" ? body.domain : typeof body.website === "string" ? body.website : ""
  );
  const accentColor =
    typeof body.accentColor === "string" && body.accentColor.trim()
      ? body.accentColor.trim()
      : typeof body.akzentfarbe === "string" && body.akzentfarbe.trim()
        ? body.akzentfarbe.trim()
        : "#1a3a5c";

  const headline = typeof body.headline === "string" ? body.headline : "";
  const unterzeile = typeof body.unterzeile === "string" ? body.unterzeile : "";
  const cta = typeof body.cta === "string" ? body.cta : "";
  const danke = typeof body.danke === "string" ? body.danke : "";
  const templateName =
    typeof body.templateName === "string" ? body.templateName : "";

  if (!slug || !email || !name) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  if (!domain) {
    return NextResponse.json(
      { error: "Website-Domain ist erforderlich (ohne https://)" },
      { status: 400 }
    );
  }

  const priceIds = resolvedStripePriceIds();
  const priceId = priceIds[slug];
  if (!priceId) {
    return NextResponse.json({ error: "Ungültiger Check" }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "http://localhost:3000";

  const stripe = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      metadata: {
        slug,
        name,
        firma: firma || "",
        domain,
        accent_color: accentColor,
        email,
        template_name: templateName,
        headline,
        unterzeile,
        cta,
        danke,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe hat keine Checkout-URL geliefert." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout.sessions.create:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: err.message,
          stripeType: err.type,
          stripeCode: err.code ?? undefined,
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Checkout fehlgeschlagen (Server)." },
      { status: 500 }
    );
  }
}
