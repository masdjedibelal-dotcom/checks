import type { ReactNode } from "react";

/** Situations-Visuals für „Einsatz im Vertrieb“ — kein Formular-UI, nur Andeutung des Nutzens */

function IconHaus({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 8.5L10 3l7 5.5V17a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1V8.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconKind({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 16.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconJob({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3.5" y="6.5" width="13" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6.5V5.5a2 2 0 012-2h2a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Card 1: Traffic → Nutzer → Kontakt (Ergebnis + QR + Social-Andeutung) */
export function VertriebVisNeukontakt(): ReactNode {
  return (
    <div className="vertrieb-ec-vis vertrieb-ec-vis--traffic" aria-hidden>
      <div className="vertrieb-ec-phone vertrieb-ec-phone--light">
        <div className="vertrieb-ec-phone-bar" />
        <div className="vertrieb-ec-phone-body">
          <div className="vertrieb-ec-phone-notch" />
          <div className="vertrieb-ec-phone-screen">
            <div className="vertrieb-ec-phone-eyebrow">Ihre Einschätzung</div>
            <div className="vertrieb-ec-phone-big">1.850 €</div>
            <div className="vertrieb-ec-phone-sub">monatliche Lücke</div>
            <div className="vertrieb-ec-phone-barmini">
              <span className="vertrieb-ec-phone-barmini-a" />
              <span className="vertrieb-ec-phone-barmini-b" />
              <span className="vertrieb-ec-phone-barmini-c" />
            </div>
          </div>
        </div>
      </div>
      <div className="vertrieb-ec-traffic-side">
        <div className="vertrieb-ec-qr" title="">
          {Array.from({ length: 49 }).map((_, i) => (
            <span
              key={i}
              className={`vertrieb-ec-qr-cell${[0, 2, 6, 8, 40, 42, 46, 48].includes(i) ? " on" : ""}`}
            />
          ))}
        </div>
        <div className="vertrieb-ec-social">
          <div className="vertrieb-ec-social-dots">
            <span className="vertrieb-ec-social-dot" />
            <span className="vertrieb-ec-social-dot" />
            <span className="vertrieb-ec-social-dot" />
          </div>
          <span className="vertrieb-ec-social-label">Teilen</span>
        </div>
      </div>
    </div>
  );
}

/** Card 2: Lebensereignis → Anlass */
export function VertriebVisBestand(): ReactNode {
  return (
    <div className="vertrieb-ec-vis vertrieb-ec-vis--life" aria-hidden>
      <div className="vertrieb-ec-phone vertrieb-ec-phone--mist">
        <div className="vertrieb-ec-phone-bar vertrieb-ec-phone-bar--mist" />
        <div className="vertrieb-ec-phone-body vertrieb-ec-phone-body--mist">
          <div className="vertrieb-ec-phone-notch vertrieb-ec-phone-notch--mist" />
          <div className="vertrieb-ec-phone-screen vertrieb-ec-phone-screen--mist">
            <div className="vertrieb-ec-phone-themen">3 Themen relevant</div>
            <div className="vertrieb-ec-phone-row">Jobwechsel</div>
            <div className="vertrieb-ec-phone-row">Familie</div>
            <div className="vertrieb-ec-phone-row">Immobilie</div>
          </div>
        </div>
      </div>
      <div className="vertrieb-ec-life-icons">
        <IconHaus className="vertrieb-ec-life-ico" />
        <IconKind className="vertrieb-ec-life-ico" />
        <IconJob className="vertrieb-ec-life-ico" />
      </div>
    </div>
  );
}

/** Card 3: Klarheit vor Gespräch (ruhiger Ergebnis-Screen) */
export function VertriebVisGespraech(): ReactNode {
  return (
    <div className="vertrieb-ec-vis vertrieb-ec-vis--clarity" aria-hidden>
      <div className="vertrieb-ec-clarity-panel">
        <div className="vertrieb-ec-clarity-eyebrow">Ihre Struktur</div>
        <div className="vertrieb-ec-clarity-pills">
          <span className="vertrieb-ec-clarity-pill">Basis</span>
          <span className="vertrieb-ec-clarity-pill vertrieb-ec-clarity-pill--on">Rundum</span>
          <span className="vertrieb-ec-clarity-pill">Premium</span>
        </div>
        <div className="vertrieb-ec-clarity-lines">
          <div className="vertrieb-ec-clarity-line">
            <span className="vertrieb-ec-clarity-check">✓</span> Haftpflicht
          </div>
          <div className="vertrieb-ec-clarity-line">
            <span className="vertrieb-ec-clarity-check">✓</span> BU
          </div>
          <div className="vertrieb-ec-clarity-line dim">
            <span className="vertrieb-ec-clarity-plus">+</span> Krankentagegeld
          </div>
        </div>
      </div>
    </div>
  );
}

export function VertriebCardVisual({ index }: { index: number }): ReactNode {
  if (index === 0) return <VertriebVisNeukontakt />;
  if (index === 1) return <VertriebVisBestand />;
  return <VertriebVisGespraech />;
}
