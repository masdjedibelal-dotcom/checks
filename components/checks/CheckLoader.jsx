"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Nur Fallback, wenn kein Makler-`checkmarkColor` übergeben wird — kein fixes Violett mehr */
export const LOADER_CHECKMARK = "#64748B";

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
  /** Fallback ohne bedarfContext — klassischer Vierzeiler */
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
  immo: [
    "Prüfe Kreditauflagen der Banken...",
    "Checke Gefahrenzone für Starkregen (ZÜRS)...",
    "Berechne notwendige Versicherungssumme für den Neubau...",
    "Erstelle Objekt-Schutzprofil...",
  ],
};

function buildImmoLoaderMessages(ctx) {
  const fallback = loaderTexts.immo;
  const custom = [];
  if (ctx?.finanzierung === true) {
    custom.push("Prüfe Kreditauflagen der Banken...");
  }
  custom.push("Checke Gefahrenzone für Starkregen (ZÜRS)...");
  if (ctx?.bauphase === true) {
    custom.push("Berechne notwendige Versicherungssumme für den Neubau...");
  }
  const out = [...custom];
  let i = 0;
  while (out.length < 4) {
    out.push(fallback[i % fallback.length]);
    i += 1;
  }
  return out.slice(0, 4);
}

/** Pauschale m² → Orientierungs-Summe Hausrat (nur Loader-Storytelling) */
function buildJahresLoaderMessages(ctx) {
  const fallback = loaderTexts.jahrescheck;
  const custom = [];
  if (ctx?.netIncome != null && ctx.netIncome > 0) {
    custom.push(
      `Vergleiche neues Netto von ${ctx.netIncome} € mit BU-Standards…`,
    );
  }
  if (ctx?.householdCount != null && ctx.householdCount > 0) {
    custom.push(
      `Prüfe Haftungsumfang für ${ctx.householdCount} Personen im Haushalt…`,
    );
  }
  if (ctx?.housingSize != null && ctx.housingSize > 0) {
    custom.push(
      `Berechne Quadratmeter-Pauschale für ${ctx.housingSize} m²…`,
    );
  }
  const out = [...custom];
  let i = 0;
  while (out.length < 4) {
    out.push(fallback[i % fallback.length]);
    i += 1;
  }
  return out.slice(0, 4);
}

function jahresContextHasData(ctx) {
  if (!ctx || typeof ctx !== "object") return false;
  const ni = ctx.netIncome;
  const hs = ctx.housingSize;
  const hc = ctx.householdCount;
  return (
    (ni != null && ni > 0) ||
    (hs != null && hs > 0) ||
    (hc != null && hc > 0)
  );
}

const SPIN_INJECT_ID = "check-loader-spin-keyframes";
const BEDARF_PULSE_ID = "check-loader-bedarf-pulse-keyframes";

function ensureSpinKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPIN_INJECT_ID)) return;
  const s = document.createElement("style");
  s.id = SPIN_INJECT_ID;
  s.textContent = `@keyframes checkLoaderSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(s);
}

function ensureBedarfPulseKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(BEDARF_PULSE_ID)) return;
  const s = document.createElement("style");
  s.id = BEDARF_PULSE_ID;
  s.textContent = `@keyframes bedarfShieldPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.09);opacity:0.88}}`;
  document.head.appendChild(s);
}

const BEDARF_JOB_LABEL = {
  buero: "Büro & Verwaltung",
  koerperlich: "Handwerk & körperliche Tätigkeit",
  medizinisch_sozial: "Sozial- & Medizinberufe",
  sonstiges: "Ihrer Tätigkeit",
};

const BEDARF_FAM_LABEL = {
  ledig: "Einzelperson",
  partnerschaft: "Partnerschaft",
  mit_kindern: "Familie mit Kindern",
};

function buildBedarfLoaderMessages(ctx) {
  const job =
    (ctx.jobType && BEDARF_JOB_LABEL[ctx.jobType]) || "Ihrer beruflichen Situation";
  const age = typeof ctx.age === "number" ? ctx.age : "—";
  const fam =
    (ctx.familyStatus && BEDARF_FAM_LABEL[ctx.familyStatus]) || "Ihre Lebenssituation";
  return [
    "Prüfe Absicherung der Arbeitskraft...",
    `Checke Haftungsrisiken für ${job}...`,
    `Kalkuliere Vorsorgebedarf für Alter ${age}...`,
    `Analysiere Familien-Schutz für ${fam}...`,
    "Erstelle individuelles Basis-Paket...",
  ];
}

const BEDARF_LOADER_MS = 3000;
const BEDARF_TEXT_INTERVAL_MS = 800;

function BedarfRadarLoader({ bedarfContext, onComplete, accentColor = LOADER_CHECKMARK }) {
  const messages = buildBedarfLoaderMessages(bedarfContext);
  const [idx, setIdx] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    ensureBedarfPulseKeyframes();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, BEDARF_TEXT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [messages.length]);

  useEffect(() => {
    const done = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, BEDARF_LOADER_MS);
    return () => window.clearTimeout(done);
  }, []);

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "calc(100vh - 54px)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 32px",
        fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        aria-hidden
        style={{
          fontSize: "56px",
          lineHeight: 1,
          marginBottom: "28px",
          animation: "bedarfShieldPulse 1.25s ease-in-out infinite",
          filter: "drop-shadow(0 6px 20px rgba(17,24,39,0.08))",
        }}
      >
        🛡️
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: accentColor,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Bedarfs-Radar
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#111",
          lineHeight: 1.35,
          textAlign: "center",
          marginBottom: "8px",
          maxWidth: "min(340px, 100%)",
          letterSpacing: "-0.2px",
          minHeight: "3.2em",
          transition: "opacity 0.25s ease",
        }}
        key={idx}
        className="fade-in"
      >
        {messages[idx]}
      </div>
      <div style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", maxWidth: "280px", lineHeight: 1.45 }}>
        Ihre Angaben werden mit typischen Risikofeldern abgeglichen.
      </div>
    </div>
  );
}

function ClassicCheckLoader({
  type,
  onComplete,
  title = "Wir berechnen Ihr Ergebnis…",
  checkmarkColor = LOADER_CHECKMARK,
  /** Wenn gesetzt (mind. 4 Zeilen), ersetzt die Standard-Texte für diesen Lauf */
  overrideTexts,
}) {
  const texts =
    Array.isArray(overrideTexts) && overrideTexts.length >= 4
      ? overrideTexts.slice(0, 4)
      : (loaderTexts[type] ?? loaderTexts.pflege);
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
          border: "3px solid #E5E7EB",
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

/**
 * @param {object} props
 * @param {keyof typeof loaderTexts} props.type
 * @param {() => void} props.onComplete — nach 2.400 ms (klassisch) bzw. 3 s (bedarf + bedarfContext)
 * @param {string} [props.title]
 * @param {string} [props.checkmarkColor]
 * @param {{ age?: number, jobType?: string, familyStatus?: string, employmentStatus?: string }} [props.bedarfContext] — für type "bedarf": personalisierte Lade-Texte
 * @param {{ netIncome?: number | null, housingSize?: number | null, householdCount?: number | null }} [props.jahresContext] — für type "jahrescheck": Schritte mit Ihren Angaben
 * @param {{ finanzierung?: boolean, bauphase?: boolean }} [props.immoContext] — für type "immo": Zustands-Check
 */
export function CheckLoader({
  type,
  onComplete,
  title = "Wir berechnen Ihr Ergebnis…",
  checkmarkColor = LOADER_CHECKMARK,
  bedarfContext,
  jahresContext,
  immoContext,
}) {
  if (type === "bedarf" && bedarfContext) {
    return (
      <BedarfRadarLoader
        bedarfContext={bedarfContext}
        onComplete={onComplete}
        accentColor={checkmarkColor}
      />
    );
  }
  const jahresOverride =
    type === "jahrescheck" && jahresContextHasData(jahresContext)
      ? buildJahresLoaderMessages(jahresContext)
      : undefined;
  const immoOverride =
    type === "immo" && immoContext && typeof immoContext === "object"
      ? buildImmoLoaderMessages(immoContext)
      : undefined;
  return (
    <ClassicCheckLoader
      type={type}
      onComplete={onComplete}
      title={title}
      checkmarkColor={checkmarkColor}
      overrideTexts={jahresOverride ?? immoOverride}
    />
  );
}
