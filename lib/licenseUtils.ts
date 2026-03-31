export function publicAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_URL?.trim() ||
    "https://getflowleads.com";
  return raw.replace(/\/$/, "");
}

export function appHostname(): string | null {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;
  if (!base) return null;
  try {
    return new URL(base).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

export function normalizeDomainHost(raw: string | null | undefined): string {
  if (!raw || !String(raw).trim()) return "";
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]!
    .split("?")[0]!
    .replace(/^www\./i, "");
}
