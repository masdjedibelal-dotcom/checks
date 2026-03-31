type TrackEventParams = {
  event_type:
    | "check_started"
    | "check_completed"
    | "lead_submitted"
    | "demo_opened";
  slug?: string;
  token?: string;
  firma?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    // Tracking-Fehler nie zum Nutzer durchlassen
  }
}
