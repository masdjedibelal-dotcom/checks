// app/embed-test/page.tsx
// Einfache Testseite für Makler: zeigt den iFrame-Code und eine Live-Vorschau
// URL: /embed-test?slug=einkommens-check&name=Anna+Berger&firma=Berger+Versicherung&farbe=c0392b

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { buildIFrameCode, buildDemoUrl, type IFrameConfig } from '@/lib/iframe';
import { KATALOG } from '@/lib/katalog';

function EmbedTestContent() {
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);

  const slug  = params.get('slug')  || 'bedarfscheck';
  const name  = params.get('name')  || 'Max Mustermann';
  const firma = params.get('firma') || 'Mustermann Versicherungen';
  const email = params.get('email') || 'kontakt@mustermann-versicherungen.de';
  const farbe = params.get('farbe') || '1a3a5c';

  const config: IFrameConfig = { slug, name, firma, email, farbe };
  const code    = buildIFrameCode(config);
  const demoUrl = buildDemoUrl(config);
  const template = KATALOG.find(t => t.slug === slug);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', fontFamily: "'DM Sans', var(--font-sans), system-ui, sans-serif" }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
          CheckKit — Embed Test
        </div>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
          {template?.name || slug}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {firma} · {name} · Farbe #{farbe}
        </div>
      </div>

      {/* iFrame Code */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ihr Einbettungs-Code
          </div>
          <button
            onClick={copy}
            style={{
              padding: '6px 14px',
              background: copied ? '#059669' : '#1a3a5c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Kopiert' : 'Code kopieren'}
          </button>
        </div>
        <pre style={{
          background: '#f5f5f5',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '12px',
          lineHeight: '1.6',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          color: '#333',
        }}>
          {code}
        </pre>
      </div>

      {/* Live-Vorschau */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
          Live-Vorschau
        </div>
        <div style={{ border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden' }}>
          <iframe
            src={demoUrl}
            width="100%"
            height="750"
            frameBorder="0"
            scrolling="no"
            style={{ display: 'block', border: 'none' }}
            title={`${firma} — ${template?.name || slug}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function EmbedTestPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: '#999' }}>Lädt...</div>}>
      <EmbedTestContent />
    </Suspense>
  );
}
