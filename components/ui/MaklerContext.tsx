'use client';

import { createContext, useContext } from 'react';

// ─── Typ ──────────────────────────────────────────────────────────────────────
export type MaklerConfig = {
  name:         string;
  firma:        string;
  email:        string;
  telefon:      string;
  primaryColor: string;
};

// ─── Default (Fallback wenn kein URL-Parameter) ────────────────────────────────
export const MAKLER_DEFAULT: MaklerConfig = {
  name:         'Max Mustermann',
  firma:        'Mustermann Versicherungen',
  email:        'kontakt@mustermann-versicherungen.de',
  telefon:      '089 123 456 78',
  primaryColor: '#1a3a5c',
};

// ─── Context ──────────────────────────────────────────────────────────────────
const MaklerContext = createContext<MaklerConfig>(MAKLER_DEFAULT);

export const useMakler = () => useContext(MaklerContext);

export { MaklerContext };
