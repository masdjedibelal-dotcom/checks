import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizeDomainHost } from "@/lib/licenseUtils";

/** Katalog-Slugs → Stripe Price IDs (Versicherungs-Check = bedarfscheck im Katalog) */
const PRICE_IDS: Record<string, string> = {
  bedarfscheck: "price_1TDlFRCWQbLUwqOtPni0DcmM",
  "lebenssituations-check": "price_1TDlFqCWQbLUwqOt5AirEA3x",
  "einkommens-check": "price_1TDlG6CWQbLUwqOtLDMljOen",
  "gkv-pkv": "price_1TDlGMCWQbLUwqOtrCOzgPzm",
  "vorsorge-check": "price_1TDlGbCWQbLUwqOtiy2e6TkD",
  risikoleben: "price_1TDlGqCWQbLUwqOtwhkLZNc3",
  "pflege-check": "price_1TDlH4CWQbLUwqOtmW6laQsr",
  "immobilien-check": "price_1TDlHICWQbLUwqOtFct53MTA",
};

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

  /** Altes Format (Konfigurator / TemplatesClient vor Migration) */
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

  const priceId = PRICE_IDS[slug];
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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/templates`,
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

  return NextResponse.json({ url: session.url });
}
