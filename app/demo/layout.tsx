"use client";

import { useEffect } from "react";

/**
 * Rechner injizieren u.a. `* { scrollbar-width: none }` / versteckte Webkit-Scrollbars.
 * In einem iframe (Demo-Modal) wirkt das wie „nur erste Seite sichtbar“ — hier Scroll
 * wieder erlauben und sichtbar machen.
 */
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const id = "checkkit-demo-scroll-override";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      html, body {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-width: auto !important;
        -ms-overflow-style: scrollbar !important;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
        display: block !important;
      }
    `;
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return <>{children}</>;
}
