import { KATALOG } from "@/lib/katalog";
import { normalizeDomainHost, publicAppUrl } from "@/lib/licenseUtils";

export { appHostname, normalizeDomainHost, publicAppUrl } from "@/lib/licenseUtils";

/** Anzeigename für E-Mails / Success (Kurzname vor „—“) */
export function slugToDisplayName(slug: string): string {
  const t = KATALOG.find((x) => x.slug === slug);
  if (!t) return slug;
  const i = t.name.indexOf("—");
  return i >= 0 ? t.name.slice(0, i).trim() : t.name;
}

export function buildLicensedDemoUrl(slug: string, token: string, domain: string): string {
  const base = publicAppUrl();
  const d = normalizeDomainHost(domain);
  const q = new URLSearchParams({
    token,
    domain: d,
  });
  return `${base}/demo/${encodeURIComponent(slug)}?${q.toString()}`;
}

export function buildLicensedIframeCode(slug: string, token: string, domain: string): string {
  const url = buildLicensedDemoUrl(slug, token, domain);
  return `<iframe
  src="${url}"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius:12px;"
  allow="clipboard-write"
></iframe>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
