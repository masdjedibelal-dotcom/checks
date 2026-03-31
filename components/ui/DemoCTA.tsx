'use client';

import { useMakler } from '@/components/ui/MaklerContext';
import { TemplatePriceCore } from '@/components/ui/TemplatePriceCore';
import { KATALOG } from '@/lib/katalog';

type Props = { slug: string };

export default function DemoCTA({ slug }: Props) {
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const template = KATALOG.find((t) => t.slug === slug);

  return (
    <div
      style={{
        margin: '0 24px 100px',
        border: `1px solid ${C}30`,
        borderRadius: '10px',
        overflow: 'hidden',
        background: `${C}06`,
      }}
    >
      <div style={{ padding: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            color: C,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          Demo-Version
        </div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
          Das gefällt Ihnen?
        </div>
        <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.55, marginBottom: '16px' }}>
          Im vollständigen Template können Ihre Kunden direkt eine Anfrage senden — personalisiert mit
          Ihrer Farbe, Ihrem Namen und Logo.
        </div>
        <a
          href="/"
          style={{
            display: 'block',
            width: '100%',
            padding: '13px 20px',
            background: C,
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Template kaufen
          {template ? (
            <>
              {" — "}
              <TemplatePriceCore template={template} />
            </>
          ) : null}
        </a>
        <div style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', marginTop: '8px' }}>
          Einmalkauf · sofort per iFrame einbettbar · kein Abo
        </div>
      </div>
    </div>
  );
}
