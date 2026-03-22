import { NextRequest, NextResponse } from "next/server";
import { appHostname, normalizeDomainHost } from "@/lib/licenseUtils";

type PurchaseRow = { status: string; domain: string };

async function fetchPurchaseByToken(token: string): Promise<PurchaseRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/purchases?token=eq.${encodeURIComponent(token)}&select=status,domain&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );

  if (!res.ok) return null;
  const rows = (await res.json()) as PurchaseRow[];
  return rows[0] ?? null;
}

function hostFromReferer(referer: string): string {
  try {
    return new URL(referer).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function domainMatchesReferer(dbDomain: string, refererHost: string): boolean {
  const d = normalizeDomainHost(dbDomain);
  if (!d || !refererHost) return false;
  if (refererHost === d) return true;
  if (refererHost.endsWith(`.${d}`)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/demo/")) {
    return NextResponse.next();
  }

  // Entwickler- und Marketing-Tools ohne Lizenz-Token
  if (pathname.startsWith("/demo/embed-test")) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isDev = process.env.NODE_ENV === "development";
  const appHost = appHostname();
  const referer = req.headers.get("referer") || "";
  const refererHost = referer ? hostFromReferer(referer) : "";

  const token = req.nextUrl.searchParams.get("token");

  // Ohne Token: nur lokale Entwicklung oder eingebettete Vorschau auf der eigenen App
  if (!token?.trim()) {
    if (isDev) return NextResponse.next();
    if (appHost && refererHost === appHost) return NextResponse.next();
    return new NextResponse("Zugriff nicht autorisiert.", { status: 403 });
  }

  if (!supabaseUrl || !serviceKey) {
    if (isDev) return NextResponse.next();
    return new NextResponse("Lizenzserver nicht konfiguriert.", { status: 503 });
  }

  const data = await fetchPurchaseByToken(token.trim());
  if (!data) {
    return new NextResponse("Ungültiger Token.", { status: 403 });
  }

  if (data.status !== "active") {
    return new NextResponse("Lizenz inaktiv.", { status: 403 });
  }

  const dbDomain = normalizeDomainHost(data.domain);

  if (isDev) {
    return NextResponse.next();
  }

  // Produktion: Referer muss Kundendomain oder die eigene App (Success-Vorschau) sein
  if (!refererHost) {
    return new NextResponse("Referer erforderlich.", { status: 403 });
  }

  const fromOurApp = appHost ? refererHost === appHost : false;
  const fromCustomer = domainMatchesReferer(dbDomain, refererHost);

  if (!fromOurApp && !fromCustomer) {
    return new NextResponse("Domain nicht autorisiert.", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/demo/:path*"],
};
