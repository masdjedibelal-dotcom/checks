"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const LOADER_CHECKMARK = "#7c3aed";

/** Vier Schritte à 600 ms, Gesamt 2.400 ms — zentral für alle Checks */
export const loaderTexts = {
  pflege: [
    "Prüfe gesetzliche Leistungen…",
    "Berechne Eigenanteil (EEE)…",
    "Gleiche Einkünfte ab…",
    "Analysiere Kapitalbedarf…",
  ],
  risikoleben: [
    "Ermittle notwendigen Einkommensersatz...",
    "Berücksichtige Inflation & Preissteigerung...",
    "Prüfe Restschuld aus Finanzierung...",
    "Berechne optimale Versicherungssumme...",
  ],
  rente: [
    "Rufe aktuelle Rentenwert-Anpassung ab…",
    "Berechne Brutto-Netto-Differenz im Alter…",
    "Analysiere Inflation & Kaufkraftverlust…",
    "Ermittle monatliche Rentenlücke…",
  ],
  bu: [
    "Prüfe staatliche Erwerbsminderungsrente…",
    "Analysiere Netto-Bedarf bei Berufsunfähigkeit…",
    "Berücksichtige Fixkosten & Lebensstandard…",
    "Ermittle notwendige monatliche Rente…",
  ],
  kranken: [
    "Analysiere Beitragsentwicklung…",
    "Prüfe Tarifoptionen…",
    "Berechne Arbeitgeberzuschuss…",
    "Ermittle Beitragsverlauf…",
  ],
  gkvpkv: [
    "Prüfe Versicherungspflichtgrenze...",
    "Abgleich mit Berufsgruppe...",
    "Analysiere Leistungs-Prioritäten...",
    "Ermittle optimale System-Tendenz...",
  ],
  immobilie: [
    "Prüfe Zinskonditionen…",
    "Abgleich Eigenkapital…",
    "Berechne Tilgungsrate…",
    "Ermittle Darlehenshöhe…",
  ],
  bedarf: [
    "Scanne Risikofelder…",
    "Prüfe Grundschutz…",
    "Priorisiere Vorsorgebedarf…",
    "Erstelle Profil…",
  ],
  jahrescheck: [
    "Vergleiche Markt-Tarife…",
    "Prüfe Deckungs-Rabatte…",
    "Analysiere Einsparpotenzial…",
    "Berechne Jahresbeitrag…",
  ],
};

const SPIN_INJECT_ID = "check-loader-spin-keyframes";

function ensureSpinKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPIN_INJECT_ID)) return;
  const s = document.createElement("style");
  s.id = SPIN_INJECT_ID;
  s.textContent = `@keyframes checkLoaderSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(s);
}

/**
 * @param {object} props
 * @param {keyof typeof loaderTexts} props.type
 * @param {() => void} props.onComplete — nach 2.400 ms
 * @param {string} [props.title]
 * @param {string} [props.checkmarkColor]
 */
export function CheckLoader({ type, onComplete, title = "Wir berechnen Ihr Ergebnis…", checkmarkColor = LOADER_CHECKMARK }) {
  const texts = loaderTexts[type] ?? loaderTexts.pflege;
  const [completed, setCompleted] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    ensureSpinKeyframes();
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setCompleted(1), 600);
    const t2 = window.setTimeout(() => setCompleted(2), 1200);
    const t3 = window.setTimeout(() => setCompleted(3), 1800);
    const t4 = window.setTimeout(() => setCompleted(4), 2400);
    const done = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(done);
    };
  }, [type]);

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "calc(100vh - 54px)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 32px",
        fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "3px solid #EDE9FE",
          borderTopColor: checkmarkColor,
          animation: "checkLoaderSpin 0.88s linear infinite",
          marginBottom: "28px",
          flexShrink: 0,
        }}
        aria-hidden
      />
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#111",
          lineHeight: 1.3,
          textAlign: "center",
          marginBottom: "36px",
          maxWidth: "320px",
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </div>
      <div style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {texts.map((label, i) => {
          const done = completed > i;
          return (
            <div
              key={i}
              className={done ? "fade-in" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: done ? 1 : 0.42,
                transition: "opacity 0.35s ease",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: done ? checkmarkColor : "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.35s ease",
                }}
              >
                {done ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                    <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ddd" }} />
                )}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: done ? "#111" : "#bbb",
                  fontWeight: done ? "600" : "400",
                  textAlign: "left",
                  lineHeight: 1.45,
                  transition: "color 0.3s ease, font-weight 0.3s ease",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
