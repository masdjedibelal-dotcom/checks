'use client';

import { createContext, useContext } from 'react';

// ─── Typ ──────────────────────────────────────────────────────────────────────
export type MaklerConfig = {
  name:         string;
  firma:        string;
  email:        string;
  telefon:      string;
  primaryColor: string;
  isDemoMode:   boolean;
  slug:         string;
};

// ─── Default (Fallback wenn kein URL-Parameter) ────────────────────────────────
export const MAKLER_DEFAULT: MaklerConfig = {
  name:         'Ihre Agentur',
  firma:        'Ihre Agentur',
  email:        'kontakt@ihre-agentur.de',
  telefon:      '089 123 456 78',
  primaryColor: '#1a3a5c',
  isDemoMode:   false,
  slug:         '',
};

// ─── Context ──────────────────────────────────────────────────────────────────
const MaklerContext = createContext<MaklerConfig>(MAKLER_DEFAULT);

export const useMakler = () => useContext(MaklerContext);

export { MaklerContext };
