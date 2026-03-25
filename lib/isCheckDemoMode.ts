/**
 * true = Marketing-Demo ohne Lizenz-Token (Modal, Landing, …).
 * false = eingebettete Microsite mit gültigem ?token=…
 */
export function isCheckDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const token = new URLSearchParams(window.location.search).get("token")?.trim();
  if (token) return false;
  return true;
}
