// app/demo/layout.tsx
// Demo-Seiten haben kein Site-Layout — nur der Rechner, fullscreen

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#ffffff' }}>
      {children}
    </div>
  );
}
