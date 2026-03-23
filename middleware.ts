import { NextRequest, NextResponse } from "next/server";

async function sha256First16(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function fetchPurchaseByToken(
  token: string
): Promise<{ id: string; status: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/purchases?token=eq.${encodeURIComponent(token)}&select=id,status&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );

  if (!res.ok) return null;
  const rows = (await res.json()) as { id: string; status: string }[];
  return rows[0] ?? null;
}

function logTokenUsage(token: string, path: string, ipHash: string): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  void fetch(`${url}/rest/v1/token_usage`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ token, path, ip_hash: ipHash }),
  }).catch(() => {});
}

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/demo/")) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/demo/embed-test")) {
    return NextResponse.next();
  }

  const token = req.nextUrl.searchParams.get("token");

  if (!token?.trim()) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new NextResponse("Lizenzserver nicht konfiguriert.", { status: 503 });
  }

  const data = await fetchPurchaseByToken(token.trim());
  if (!data) {
    return new NextResponse("Ungültiger Token.", { status: 403 });
  }

  if (data.status !== "active") {
    return new NextResponse("Lizenz inaktiv.", { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await sha256First16(ip);
  logTokenUsage(token.trim(), req.nextUrl.pathname, ipHash);

  return NextResponse.next();
}

export const config = {
  matcher: ["/demo/:path*"],
};
