export function alpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const fmt = (n: number) =>
  Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";

export const fmtK = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + " Mio. €"
    : n >= 10_000
      ? Math.round(n / 1000) + "K €"
      : fmt(n);
