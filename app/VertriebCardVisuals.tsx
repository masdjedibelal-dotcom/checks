import Image from "next/image";
import type { ReactNode } from "react";

/** Situations-Visuals für „Einsatz im Vertrieb“ — kein Formular-UI, nur Andeutung des Nutzens */

/** Card 1: Neue Kontakte generieren (Link, QR, Web → Smartphone → Kontakt) */
export function VertriebVisNeukontakt(): ReactNode {
  return (
    <div className="vertrieb-ec-vis vertrieb-ec-vis--raster" aria-hidden>
      <Image
        src="/images/vertrieb-neue-kontakte.png"
        alt=""
        width={2048}
        height={2048}
        className="vertrieb-ec-raster-img"
        sizes="(max-width: 768px) 85vw, 280px"
      />
    </div>
  );
}

/** Card 2: Bestandskunden aktivieren (Person, Lebensereignisse, Kalender, Nachricht) */
export function VertriebVisBestand(): ReactNode {
  return (
    <div className="vertrieb-ec-vis vertrieb-ec-vis--raster" aria-hidden>
      <Image
        src="/images/vertrieb-bestandskunden.png"
        alt=""
        width={2048}
        height={2048}
        className="vertrieb-ec-raster-img"
        sizes="(max-width: 768px) 85vw, 280px"
      />
    </div>
  );
}

/** Card 3: Gespräche vorbereiten (Dokument, Kennzahlen, Euro, Check zwischen zwei Personen) */
export function VertriebVisGespraech(): ReactNode {
  return (
    <div className="vertrieb-ec-vis vertrieb-ec-vis--raster" aria-hidden>
      <Image
        src="/images/vertrieb-gespraeche-vorbereiten.png"
        alt=""
        width={2048}
        height={2048}
        className="vertrieb-ec-raster-img"
        sizes="(max-width: 768px) 85vw, 280px"
      />
    </div>
  );
}

export function VertriebCardVisual({ index }: { index: number }): ReactNode {
  if (index === 0) return <VertriebVisNeukontakt />;
  if (index === 1) return <VertriebVisBestand />;
  return <VertriebVisGespraech />;
}
