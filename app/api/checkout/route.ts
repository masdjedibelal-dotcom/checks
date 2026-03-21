import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY fehlt in .env.local" },
      { status: 500 }
    );
  }

  let body: {
    templateSlug?: string;
    templateName?: string;
    preis?: number;
    maklerEmail?: string;
    maklerName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body" }, { status: 400 });
  }

  const { templateSlug, templateName, preis, maklerEmail, maklerName } = body;
  if (
    !templateSlug ||
    !templateName ||
    typeof preis !== "number" ||
    !maklerEmail ||
    !maklerName
  ) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const stripe = new Stripe(key);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(preis * 100),
          product_data: {
            name: `CheckKit — ${templateName}`,
            description: `Einmalige Lizenz · Personalisiert für ${maklerName}`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: maklerEmail,
    metadata: {
      templateSlug,
      maklerName,
      maklerEmail,
    },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/templates`,
  });

  return NextResponse.json({ url: session.url });
}
