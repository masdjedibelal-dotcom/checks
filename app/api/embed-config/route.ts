import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceRole } from "@/lib/supabaseService";

export const runtime = "nodejs";

function safeHex(raw: string | null | undefined): string {
  if (!raw) return "#1a3a5c";
  const c = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9A-Fa-f]{6}$/.test(c) ? c : "#1a3a5c";
}

/** Öffentlicher Lookup per Lizenz-Token (geheim); nur aktive Käufe. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseServiceRole();
  } catch {
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("purchases")
    .select("name, firma, email, accent_color, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: data.name,
    firma: data.firma ?? "",
    email: data.email,
    primaryColor: safeHex(data.accent_color),
  });
}
