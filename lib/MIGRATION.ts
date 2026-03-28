/**
 * ─── SO WIRD EIN RECHNER MIGRIERT ────────────────────────────────────────────
 *
 * VORHER (JSX standalone — MAKLER hardcoded oben im File):
 *
 *   const MAKLER = {
 *     name: "Ihre Agentur",
 *     firma: "Ihre Agentur",
 *     ...
 *   };
 *   const C = MAKLER.primaryColor;
 *
 * NACHHER (TSX im Next.js Projekt — MAKLER aus Context):
 *
 *   import { useMakler } from '@/components/ui/MaklerContext';
 *
 *   export default function BUKTGRechner() {
 *     const MAKLER = useMakler();   // ← einzige Änderung
 *     const C = MAKLER.primaryColor;
 *     // ... Rest des Codes bleibt 1:1 gleich
 *   }
 *
 * Hinweis: Liegen `C` oder Style-Objekte (`T`, `buildT(C)`) auf Modulebene,
 * müssen sie in die Komponente (oder `useMemo(() => buildT(C), [C])`) wandern.
 *
 * ─── MIGRATION CHECKLIST ──────────────────────────────────────────────────────
 *
 * [ ] Datei von .jsx → .tsx umbenennen (optional)
 * [ ] 'use client'; als erste Zeile hinzufügen
 * [ ] Global-Setup-Block entfernen (Google Fonts IIFE, CSS inject) — Fonts ggf. im Layout
 * [ ] MAKLER-Konstante oben im File entfernen
 * [ ] import { useMakler } from '@/components/ui/MaklerContext'; hinzufügen
 * [ ] const MAKLER = useMakler(); als erste Zeile in der Komponente
 * [ ] fmt(), fmtK(), alpha() → aus @/lib/utils importieren (optional)
 * [ ] Export: export default function Name() bleibt gleich
 *
 * Demo-Route: `ShellWrapper` setzt den Context aus URL-Parametern (`name`, `firma`, …).
 */

export {};
