"use client";

import { useLayoutEffect, type DependencyList } from "react";

/** Viewport zuverlässig nach oben (Demo, iframe, iOS — scrollingElement + html/body + window). */
export function scrollCheckDocumentToTop() {
  if (typeof document === "undefined") return;
  const root = document.scrollingElement ?? document.documentElement;
  if (root) root.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
}

/** Nach Schritt-/Phasenwechsel scrollen — nach DOM-Update, vor Paint. */
export function useCheckScrollToTop(deps: DependencyList) {
  useLayoutEffect(() => {
    scrollCheckDocumentToTop();
    // Abhängigkeiten kommen bewusst von außen (je Check unterschiedlich).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- DependencyList wird pro Rechner explizit übergeben
  }, deps);
}
