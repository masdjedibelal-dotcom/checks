/**
 * true = Marketing-Demo / gleiche Origin ohne Lizenz (iframe Modal, Embed-Test, …).
 * false = eingebetteter Check mit Kauf-Lizenz (?token=…&domain=…).
 */
export function isCheckDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  const token = q.get("token")?.trim();
  const domain = q.get("domain")?.trim();
  if (token && domain) return false;
  return true;
}
