'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
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
  children: React.ReactNode;
};

export default function ShellWrapper({ children }: ShellWrapperProps) {
  const params = useSearchParams();

  const makler = useMemo<MaklerConfig>(() => {
    const name   = sanitize(params.get('name'));
    const firma  = sanitize(params.get('firma'));
    const email  = sanitize(params.get('email'), 120);
    const tel    = sanitize(params.get('tel'), 30);
    const farbe  = validateHex(params.get('farbe'));

    return {
      name:         name  || MAKLER_DEFAULT.name,
      firma:        firma || MAKLER_DEFAULT.firma,
      email:        email || MAKLER_DEFAULT.email,
      telefon:      tel   || MAKLER_DEFAULT.telefon,
      primaryColor: farbe,
    };
  }, [params]);

  return (
    <MaklerContext.Provider value={makler}>
      {children}
    </MaklerContext.Provider>
  );
}
