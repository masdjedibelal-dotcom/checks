"use client";

/** Voller Viewport-Spinner bis `useCheckConfig().isReady` — Styles in `globals.css`. */
export function CheckConfigLoadingShell() {
  return (
    <div className="check-config-loading" role="status" aria-label="Lädt">
      <div className="check-config-loading__spinner" aria-hidden />
    </div>
  );
}
