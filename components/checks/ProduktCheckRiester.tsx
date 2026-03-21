"use client";

import ProduktCheck, { CHECK_RIESTER } from "./ProduktCheck_Template";

export default function ProduktCheckRiester() {
  /* Template erwartet strukturell denselben Check-Typ; empfehlungen-Keys unterscheiden sich pro Produkt. */
  return (
    <ProduktCheck checkConfig={CHECK_RIESTER as Parameters<typeof ProduktCheck>[0]["checkConfig"]} />
  );
}
