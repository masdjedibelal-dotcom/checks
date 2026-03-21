# CheckKit — Cursor Projektdokumentation

## Was ist CheckKit?

CheckKit ist eine Microsite-as-a-Service Plattform für Versicherungsmakler.
Makler kaufen interaktive Checks und Rechner, konfigurieren sie mit ihren Daten
(Name, Firma, Farbe) und betten sie per iFrame auf ihrer Website ein.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS + inline styles (bestehende Komponenten nutzen inline styles)
- **Fonts:** Geist (sans) + Instrument Serif — via `next/font/google`
- **Deployment:** Vercel
- **Zahlungen:** Stripe (Checkout Sessions)

---

## Projektstruktur

```
checkkit/
├── app/
│   ├── layout.tsx                    # Root layout, Fonts, Metadata
│   ├── page.tsx                      # Startseite (index.html als Referenz)
│   ├── templates/
│   │   └── page.tsx                  # Template-Galerie mit Konfigurator-Overlay
│   ├── demo/
│   │   ├── [slug]/
│   │   │   └── page.tsx              # Demo-Seiten — lädt die jeweilige Check-Komponente
│   └── api/
│       └── checkout/
│           └── route.ts              # Stripe Checkout Session erstellen
├── components/
│   ├── checks/                       # Alle Check-Komponenten
│   │   ├── Bedarfscheck.tsx
│   │   ├── JahresCheck.tsx
│   │   ├── BUKTGRechner.tsx
│   │   ├── RentenRechner.tsx
│   │   ├── RisikolebenRechner.tsx
│   │   ├── ZinseszinsVisualisierer.tsx
│   │   ├── AnschlussfinanzierungRechner.tsx
│   │   ├── ElternzeitRechner.tsx
│   │   ├── GKVPKVRechner.tsx
│   │   ├── ProduktCheck.tsx          # Konfigurierbar: BU, Wohngebäude, Riester, Haftpflicht, Kfz
│   │   └── LueckenRechner.tsx        # Konfigurierbar: 5 Lückenrechner
│   ├── ui/
│   │   ├── Shell.tsx                 # Gemeinsamer Header + Progressbar + Footer
│   │   ├── DemoModal.tsx             # Modal-Wrapper für Template-Galerie
│   │   └── KonfiguratorOverlay.tsx   # Konfigurator-Sheet mit Live-Vorschau
│   └── marketing/
│       ├── TemplateGalerie.tsx       # Grid + Filter + Cards
│       └── TemplateCard.tsx          # Einzelne Karte mit Mock-Preview
├── lib/
│   ├── config.ts                     # Makler-Konfiguration (zentral)
│   ├── katalog.ts                    # Alle Templates mit Metadaten
│   └── utils.ts                      # alpha(), fmt(), fmtK() Helfer
├── public/
│   └── fonts/
└── CURSOR.md                         # Diese Datei
```

---

## Zentrale Konfiguration — lib/config.ts

```typescript
// lib/config.ts
// Makler trägt hier einmal seine Daten ein — gilt für alle Checks

export const MAKLER = {
  name:         "Max Mustermann",
  firma:        "Mustermann Versicherungen",
  email:        "kontakt@mustermann-versicherungen.de",
  telefon:      "089 123 456 78",
  primaryColor: "#1a3a5c",
} as const;

export type MaklerConfig = typeof MAKLER;
```

Alle Check-Komponenten importieren `MAKLER` aus `lib/config.ts`.
Kein hardcoded Name/Farbe in den Komponenten.

---

## Template-Katalog — lib/katalog.ts

```typescript
// lib/katalog.ts

export type Template = {
  slug:        string;
  icon:        string;
  name:        string;           // Kundenfrage, z.B. "Ist meine Familie wirklich abgesichert?"
  desc:        string;           // Kurzbeschreibung
  tags:        string[];         // z.B. ["Familien mit Kindern", "Witwerrente"]
  kategorie:   TemplateKategorie;
  preis:       number;           // in Euro
  accentColor: string;           // Default-Akzentfarbe für Demo
};

export type TemplateKategorie = 
  | 'alle-kunden'
  | 'luecken'
  | 'finanzen'
  | 'anlass';

export const KATALOG: Template[] = [
  {
    slug:        'bedarfscheck',
    icon:        '🎯',
    name:        'Bedarfscheck — Welche Versicherungen brauche ich?',
    desc:        'Kunde gibt Profil und Bestand ein — bekommt 3 fertige Pakete mit Begründung.',
    tags:        ['Neukunden', 'Vor dem Erstgespräch'],
    kategorie:   'alle-kunden',
    preis:       79,
    accentColor: '#c9a96e',
  },
  {
    slug:        'jahrescheck',
    icon:        '📋',
    name:        'Jahrescheck — Was hat sich verändert?',
    desc:        'Bestandskunde wählt Lebensereignisse — Ergebnis zeigt konkreten Handlungsbedarf.',
    tags:        ['Bestandskunden', 'Jährlich versenden'],
    kategorie:   'alle-kunden',
    preis:       79,
    accentColor: '#166534',
  },
  {
    slug:        'bu-ktg',
    icon:        '💼',
    name:        'Was passiert wenn ich ausfalle?',
    desc:        'Realer Einkommensverlauf bei Krankheit und BU — Monat für Monat.',
    tags:        ['Einkommensschutz', '5 Szenarien'],
    kategorie:   'luecken',
    preis:       59,
    accentColor: '#7c3aed',
  },
  {
    slug:        'rente',
    icon:        '🌱',
    name:        'Wie groß ist meine Rentenlücke?',
    desc:        '3-Schichten-Visualisierung + 3 Strategien mit konkreter Sparrate.',
    tags:        ['Altersvorsorge', 'Sparrate berechnen'],
    kategorie:   'luecken',
    preis:       59,
    accentColor: '#059669',
  },
  {
    slug:        'risikoleben',
    icon:        '❤️',
    name:        'Ist meine Familie wirklich abgesichert?',
    desc:        'Witwen-/Waisenrente eingerechnet — zeigt die echte Versorgungslücke.',
    tags:        ['Familien mit Kindern'],
    kategorie:   'luecken',
    preis:       59,
    accentColor: '#be185d',
  },
  {
    slug:        'zinseszins',
    icon:        '📈',
    name:        'Was kostet 10 Jahre warten?',
    desc:        'Zeigt den konkreten Unterschied zwischen früh und spät starten.',
    tags:        ['Junge Kunden', 'ETF-Sparplan'],
    kategorie:   'finanzen',
    preis:       49,
    accentColor: '#059669',
  },
  {
    slug:        'gkv-pkv',
    icon:        '🏥',
    name:        'GKV oder PKV — was lohnt sich?',
    desc:        'Beiträge, Leistungen, klare Empfehlung mit Familienbonus und Berufsstatus.',
    tags:        ['Gehaltssprung', 'PKV-Wechsel'],
    kategorie:   'finanzen',
    preis:       49,
    accentColor: '#dc2626',
  },
  {
    slug:        'anschluss',
    icon:        '🏠',
    name:        'Was kostet meine Anschlussfinanzierung?',
    desc:        'Alte vs. neue Rate nach Zinsbindungsende — mit Bausparer-Einrechnung.',
    tags:        ['Eigenheimbesitzer', 'Zinsbindung läuft aus'],
    kategorie:   'finanzen',
    preis:       49,
    accentColor: '#b45309',
  },
  {
    slug:        'bu-check',
    icon:        '💼',
    name:        'Reicht meine BU-Rente noch?',
    desc:        'Nach Gehaltssprung, Jobwechsel oder Familienzuwachs — mit Nachversicherungs-Empfehlung.',
    tags:        ['Nach Gehaltssprung', 'Jobwechsel'],
    kategorie:   'anlass',
    preis:       49,
    accentColor: '#7c3aed',
  },
  {
    slug:        'elternzeit',
    icon:        '👶',
    name:        'Was bleibt in der Elternzeit übrig?',
    desc:        'Elterngeld für beide Partner, Haushaltslücke, Versicherungs-Checkliste.',
    tags:        ['Baby bekommen', 'Elternzeit'],
    kategorie:   'anlass',
    preis:       49,
    accentColor: '#be185d',
  },
  {
    slug:        'riester',
    icon:        '🌱',
    name:        'Hole ich alle Riester-Zulagen raus?',
    desc:        'Prüft ob Grundzulage, Kinderzulage und Bonus korrekt beantragt sind.',
    tags:        ['Nach Geburt', 'Riester'],
    kategorie:   'anlass',
    preis:       49,
    accentColor: '#b45309',
  },
];
```

---

## Shell-Komponente — components/ui/Shell.tsx

Jeder Check nutzt dieselbe Shell. Props:

```typescript
type ShellProps = {
  icon:        string;        // Emoji
  badge:       string;        // z.B. "Bedarfscheck"
  badgeColor?: string;        // Default: MAKLER.primaryColor
  progPct:     number;        // 0–100
  eyebrow?:    string;
  title?:      string;
  lead?:      string;
  children:    React.ReactNode;
  footer?:     React.ReactNode;
  onBack?:     () => void;    // Zeigt ← Button im Header
};
```

---

## Demo-Seiten — app/demo/[slug]/page.tsx

```typescript
// app/demo/[slug]/page.tsx
import { KATALOG } from '@/lib/katalog';
import { notFound } from 'next/navigation';

// Dynamisch die richtige Komponente laden
const DEMO_COMPONENTS: Record<string, React.ComponentType> = {
  bedarfscheck: () => import('@/components/checks/Bedarfscheck'),
  jahrescheck:  () => import('@/components/checks/JahresCheck'),
  'bu-ktg':     () => import('@/components/checks/BUKTGRechner'),
  rente:        () => import('@/components/checks/RentenRechner'),
  risikoleben:  () => import('@/components/checks/RisikolebenRechner'),
  zinseszins:   () => import('@/components/checks/ZinseszinsVisualisierer'),
  'gkv-pkv':    () => import('@/components/checks/GKVPKVRechner'),
  anschluss:    () => import('@/components/checks/AnschlussfinanzierungRechner'),
  'bu-check':   () => import('@/components/checks/ProduktCheck'),
  elternzeit:   () => import('@/components/checks/ElternzeitRechner'),
  riester:      () => import('@/components/checks/ProduktCheck'),
};

export default async function DemoPage({ params }: { params: { slug: string } }) {
  const template = KATALOG.find(t => t.slug === params.slug);
  if (!template) notFound();
  
  const Component = (await DEMO_COMPONENTS[params.slug]?.()).default;
  if (!Component) notFound();
  
  return <Component />;
}

export function generateStaticParams() {
  return KATALOG.map(t => ({ slug: t.slug }));
}
```

---

## Demo-Modal — components/ui/DemoModal.tsx

Das Modal wird in der Template-Galerie genutzt.
Lädt die Demo als eingebettete Komponente (kein iframe nötig).

```typescript
type DemoModalProps = {
  template:  Template | null;
  onClose:   () => void;
  onBuy:     (template: Template) => void;
};
```

- Öffnet sich über die Galerie
- Zeigt die Check-Komponente direkt gerendert (nicht iframe)
- Footer: Preis + „Anpassen & kaufen" Button
- Schließt sich bei Klick außerhalb oder Escape

---

## Konfigurator-Overlay — components/ui/KonfiguratorOverlay.tsx

Öffnet sich nach Klick auf „Anpassen & kaufen".

```typescript
type KonfiguratorProps = {
  template:  Template | null;
  onClose:   () => void;
  onCheckout:(config: MaklerConfig) => void;
};
```

**Formularfelder:**
- Name (Text)
- Firmenname (Text)
- E-Mail für Leads (Email)
- Akzentfarbe (Color Picker + Hex Input + 9 Presets)
- Begrüßungs-Headline (Text)
- Unterzeile (Text)
- CTA-Button Text (Text)
- Danke-Text (Text)

**Rechts:** Live-Vorschau — Phone-Mock der sich in Echtzeit aktualisiert

---

## Stripe Checkout — app/api/checkout/route.ts

```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { templateSlug, templateName, preis, maklerEmail, maklerName } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: preis * 100,
        product_data: {
          name: `CheckKit — ${templateName}`,
          description: `Einmalige Lizenz · Personalisiert für ${maklerName}`,
        },
      },
      quantity: 1,
    }],
    customer_email: maklerEmail,
    metadata: { templateSlug, maklerName, maklerEmail },
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_URL}/templates`,
  });
  
  return Response.json({ url: session.url });
}
```

**Nach dem Kauf:**
- Webhook empfängt `checkout.session.completed`
- Sendet konfigurierte HTML-Datei per E-Mail an Makler
- (oder: Makler bekommt sofort Download-Link)

---

## Farbsystem — lib/utils.ts

```typescript
// lib/utils.ts

export const alpha = (hex: string, a: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

export const fmt  = (n: number) => Math.round(Math.abs(n)).toLocaleString('de-DE') + ' €';
export const fmtK = (n: number) => n >= 1000000
  ? (n / 1000000).toFixed(1) + ' Mio. €'
  : n >= 10000
  ? Math.round(n / 1000) + 'K €'
  : fmt(n);
```

---

## Bestehende JSX-Dateien konvertieren

Die fertigen Rechner liegen als `.jsx` vor. So konvertieren:

1. Datei in `components/checks/` kopieren, Endung → `.tsx`
2. `import { useState } from 'react'` bleibt gleich
3. `MAKLER`-Objekt oben im File entfernen → stattdessen importieren:
   ```typescript
   import { MAKLER } from '@/lib/config';
   ```
4. `alpha()`, `fmt()`, `fmtK()` → importieren aus `@/lib/utils`
5. Global-Setup-Block (`(() => { ... })()`) entfernen — Fonts laufen über `layout.tsx`
6. Export: `export default function CheckName()` bleibt gleich

---

## Vorhandene JSX-Dateien (alle fertig gebaut)

| Datei | Komponente | Preis |
|---|---|---|
| `Bedarfscheck.jsx` | Bedarfscheck | 79 € |
| `JahresCheck_v4.jsx` | JahresCheck | 79 € |
| `BU_KTG_Rechner.jsx` | BUKTGRechner | 59 € |
| `Renten_Rechner.jsx` | RentenRechner | 59 € |
| `Risikoleben_Rechner.jsx` | RisikolebenRechner | 59 € |
| `Zinseszins_Visualisierer.jsx` | ZinseszinsVisualisierer | 49 € |
| `Anschlussfinanzierung_Rechner.jsx` | AnschlussfinanzierungRechner | 49 € |
| `Elternzeit_Rechner.jsx` | ElternzeitRechner | 49 € |
| `GKV_PKV_Rechner.jsx` | GKVPKVRechner | 49 € |
| `ProduktCheck_Template.jsx` | ProduktCheck (5 Checks) | 49 € |
| `Lueckenrechner.jsx` | LueckenRechner (5 Rechner) | 49 € |

---

## Design-System

**Farben (alle hardcoded, keine CSS-Variablen):**
```
Background:  #fafaf8
Surface:     #ffffff
Ink:         #0d0d0d
Mid:         rgba(0,0,0,0.45)
Muted:       rgba(0,0,0,0.28)
Rule:        rgba(0,0,0,0.07)
Gold:        #c9a96e  ← Haupt-Akzent CheckKit
```

**Schriften:**
- Headlines: `Geist` (800 weight, letter-spacing: -2px)
- Preise/Display: `Instrument Serif` (italic für Akzente)
- Body: `Geist` (400/500/600)

**Karten:**
- border-radius: 16px
- border: 1px solid rgba(0,0,0,0.07)
- Hover: translateY(-4px) + gold border + radial glow

**Dark Mode:** Explizit deaktiviert auf allen Seiten:
```html
<html style="background:#fafaf8;color:#0d0d0d;">
<meta name="color-scheme" content="light">
```

---

## Environment Variables (.env.local)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_URL=https://checkkit.de
RESEND_API_KEY=re_...         # E-Mail-Versand nach Kauf
```

---

## Setup-Befehle

```bash
npx create-next-app@latest checkkit --typescript --tailwind --app
cd checkkit
npm install stripe @stripe/stripe-js resend

# Fonts in layout.tsx
# Geist ist in Next.js 14 bereits built-in:
import { GeistSans } from 'geist/font/sans';
```

---

## Cursor-Prompts die gut funktionieren

**Neue Komponente aus JSX konvertieren:**
> "Konvertiere `BU_KTG_Rechner.jsx` zu einer TypeScript React-Komponente in `components/checks/BUKTGRechner.tsx`. Importiere MAKLER aus `@/lib/config` und die Utility-Funktionen aus `@/lib/utils`. Entferne den globalen Setup-Block. Behalte alle Styles und Logik exakt bei."

**Demo-Seite hinzufügen:**
> "Erstelle `app/demo/bu-ktg/page.tsx` die die `BUKTGRechner` Komponente rendert. Kein Layout drum herum, nur die Komponente direkt — die Seite wird als Demo im Modal gezeigt."

**Checkout-Flow:**
> "Implementiere den Stripe Checkout in `app/api/checkout/route.ts` nach der Spezifikation in CURSOR.md. Nach erfolgreicher Zahlung soll eine E-Mail mit dem Download-Link über Resend gesendet werden."
