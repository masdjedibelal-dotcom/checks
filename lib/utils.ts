export function alpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function normalizeHex6(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  let h = input.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(h)) return null;
  return h;
}

/** Relative luminance (sRGB), 0–1 (WCAG) */
function relativeLuminance(hex: string): number {
  const h = normalizeHex6(hex);
  if (!h) return 1;
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Lesbare Textfarbe auf **voller** Akzentfläche (Buttons, Logo-Kachel, Checkbox-Häkchen auf Vollfarbe).
 * Wählt #ffffff oder #111111 je nach besserem Kontrast.
 */
export function textOnAccent(accentHex: string): "#ffffff" | "#111111" {
  const L = relativeLuminance(accentHex);
  const contrastWhite = (1 + 0.05) / (L + 0.05);
  const contrastBlack = (L + 0.05) / 0.05;
  return contrastWhite >= contrastBlack ? "#ffffff" : "#111111";
}

export const fmt = (n: number) =>
  Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

export const fmtK = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + " Mio. €"
    : n >= 10_000
      ? Math.round(n / 1000) + "K €"
      : fmt(n);
