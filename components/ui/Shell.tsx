'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { MaklerContext, MAKLER_DEFAULT, type MaklerConfig } from './MaklerContext';

// ─── Hex-Validierung (Security: kein Script-Injection via Farbe) ───────────────
function validateHex(value: string | null): string {
  if (!value) return MAKLER_DEFAULT.primaryColor;
  const cleaned = value.startsWith('#') ? value : `#${value}`;
  return /^#[0-9A-Fa-f]{6}$/.test(cleaned) ? cleaned : MAKLER_DEFAULT.primaryColor;
}

// ─── String-Sanitizer (kein HTML, max. Länge) ─────────────────────────────────
function sanitize(value: string | null, maxLen = 80): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '')   // HTML-Tags entfernen
    .replace(/[<>"'`]/g, '')   // Gefährliche Zeichen entfernen
    .trim()
    .slice(0, maxLen);
}

// ─── Shell-Wrapper ────────────────────────────────────────────────────────────
type ShellWrapperProps = {
  children:    React.ReactNode;
  isDemoMode?: boolean;
  slug?:       string;
};

type LicensedMakler = {
  name: string;
  firma: string;
  email: string;
  telefon: string;
  primaryColor: string;
};

export default function ShellWrapper({
  children,
  isDemoMode: isDemoRoute = false,
  slug = '',
}: ShellWrapperProps) {
  const params = useSearchParams();
  const token = params.get('token')?.trim() ?? '';

  const [licensed, setLicensed] = useState<LicensedMakler | null>(null);
  const [embedInIframe, setEmbedInIframe] = useState(false);

  useLayoutEffect(() => {
    setEmbedInIframe(typeof window !== 'undefined' && window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!token) {
      setLicensed(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/embed-config?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: LicensedMakler | Record<string, unknown> | null) => {
        if (cancelled || !j || typeof j !== "object" || !("name" in j) || !j.name)
          return;
        const primary =
          typeof j.primaryColor === "string"
            ? j.primaryColor
            : typeof (j as { accent_color?: string }).accent_color === "string"
              ? (j as { accent_color: string }).accent_color
              : null;
        setLicensed({
          name: sanitize(String(j.name), 80),
          firma: sanitize(typeof j.firma === "string" ? j.firma : "", 80),
          email: sanitize(typeof j.email === "string" ? j.email : "", 120),
          telefon: sanitize(typeof j.telefon === "string" ? j.telefon : "", 40),
          primaryColor: validateHex(primary),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  /** Query-Params ODER gültiger Kauf-Token → personalisiertes Embed, kein Kauf-CTA. */
  const embedPersonalized = useMemo(() => {
    const keys = ['name', 'firma', 'email', 'farbe', 'tel'] as const;
    const fromQuery = keys.some((k) => Boolean(params.get(k)?.trim()));
    return fromQuery || Boolean(token);
  }, [params, token]);

  const isDemoMode = isDemoRoute && !embedPersonalized;

  const makler = useMemo<MaklerConfig>(() => {
    if (licensed) {
      return {
        name: licensed.name,
        firma: licensed.firma,
        email: licensed.email,
        telefon: licensed.telefon,
        primaryColor: licensed.primaryColor,
        isDemoMode: false,
        slug,
        embedInIframe,
      };
    }

    const name = sanitize(params.get('name'));
    const firma = sanitize(params.get('firma'));
    const email = sanitize(params.get('email'), 120);
    const tel = sanitize(params.get('tel'), 30);
    const farbe = validateHex(params.get('farbe'));

    return {
      name: name || MAKLER_DEFAULT.name,
      firma: firma || MAKLER_DEFAULT.firma,
      email: email || MAKLER_DEFAULT.email,
      telefon: tel || MAKLER_DEFAULT.telefon,
      primaryColor: farbe,
      isDemoMode,
      slug,
      embedInIframe,
    };
  }, [params, isDemoMode, slug, licensed, embedInIframe]);

  return (
    <MaklerContext.Provider value={makler}>
      {children}
    </MaklerContext.Provider>
  );
}
