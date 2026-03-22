import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceRole } from "@/lib/supabaseService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId?.trim()) {
    return NextResponse.json({ error: "No session" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseServiceRole();
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("purchases")
    .select("name, firma, slug, token, domain")
    .eq("stripe_session_id", sessionId.trim())
    .maybeSingle();

  if (error) {
    console.error("purchase lookup:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
