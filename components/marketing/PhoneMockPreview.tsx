"use client";

import { alpha } from "@/lib/utils";

/** Hintergrund der Karten-Preview wie in der statischen HTML-Vorlage */
const PREVIEW_BG: Record<string, string> = {
  bedarfscheck: "linear-gradient(160deg,#fdf8ee 0%,#f0e8cc 100%)",
  "lebenssituations-check":
    "linear-gradient(160deg,#edf7ed 0%,#c8e6c8 100%)",
  "einkommens-check": "linear-gradient(160deg,#f0ecff 0%,#d9d0ff 100%)",
  "vorsorge-check": "linear-gradient(160deg,#ecfdf5 0%,#bbf7d0 100%)",
  risikoleben: "linear-gradient(160deg,#fdf2f8 0%,#f5c6e8 100%)",
  "gkv-pkv": "linear-gradient(160deg,#fff5f5 0%,#ffc9c9 100%)",
  "pflege-check": "linear-gradient(160deg,#e0f2fe 0%,#bae6fd 100%)",
  "immobilien-check": "linear-gradient(160deg,#fffbeb 0%,#fde68a 100%)",
};

function PhoneShell({
  c,
  children,
}: {
  c: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-[180px] shrink-0 overflow-hidden rounded-t-[22px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]">
      <div className="h-1 w-full" style={{ background: c }} />
      <div className="flex items-center justify-between border-b border-black/[0.05] px-3 pb-2 pt-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] text-[9px] font-extrabold text-white"
            style={{ background: c }}
          >
            M
          </div>
          <span
            className="truncate text-[9px] font-bold"
            style={{ color: c }}
          >
            Mustermann Vers.
          </span>
        </div>
        <div
          className="shrink-0 rounded-[20px] px-1.5 py-0.5 text-[8px] font-semibold"
          style={{ background: alpha(c, 0.1), color: c }}
        >
          Check
        </div>
      </div>
      <div className="px-3 pb-3 pt-3">{children}</div>
    </div>
  );
}

function CtaBtn({ c, children }: { c: string; children: React.ReactNode }) {
  const darkText = c.toLowerCase() === "#c9a96e";
  return (
    <div
      className="block w-full rounded-lg py-2 text-center text-[9px] font-bold text-white"
      style={{ background: c, color: darkText ? "#000" : "#fff" }}
    >
      {children}
    </div>
  );
}

function MockInner({ slug, c }: { slug: string; c: string }) {
  switch (slug) {
    case "bedarfscheck":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Schritt 1 von 3
          </div>
          <div className="mb-0.5 text-[11px] font-extrabold leading-tight text-[#111]">
            Erzählen Sie uns von sich
          </div>
          <div className="mb-2.5 text-[9px] leading-snug text-[#999]">
            Für Ihre Empfehlung
          </div>
          <div className="mb-2 grid grid-cols-2 gap-[3px]">
            <div
              className="rounded px-1 py-1 text-center text-[8px] font-bold"
              style={{ background: alpha(c, 0.15), color: c }}
            >
              Angestellt
            </div>
            <div className="rounded bg-black/[0.05] px-1 py-1 text-center text-[8px] text-[#666]">
              Selbstständig
            </div>
            <div
              className="rounded px-1 py-1 text-center text-[8px] font-bold"
              style={{ background: alpha(c, 0.15), color: c }}
            >
              Familie
            </div>
            <div className="rounded bg-black/[0.05] px-1 py-1 text-center text-[8px] text-[#666]">
              Single
            </div>
          </div>
          <CtaBtn c={c}>Weiter →</CtaBtn>
        </>
      );
    case "lebenssituations-check":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Lebenssituations-Check
          </div>
          <div className="mb-0.5 text-[11px] font-extrabold leading-tight text-[#111]">
            Was haben Sie bereits?
          </div>
          <div className="mb-2.5 text-[9px] leading-snug text-[#999]">
            5 Sparten · 35 Produkte
          </div>
          <div className="mb-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 rounded-md bg-[#f7f7f5] px-2 py-1">
              <div
                className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] text-[7px] font-bold text-black"
                style={{ background: c }}
              >
                ✓
              </div>
              <span className="text-[9px] font-medium text-[#444]">
                BU vorhanden
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-[#f7f7f5] px-2 py-1">
              <div
                className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] text-[7px] font-bold text-black"
                style={{ background: c }}
              >
                ✓
              </div>
              <span className="text-[9px] font-medium text-[#444]">
                Haftpflicht
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-[#f7f7f5] px-2 py-1">
              <div className="h-3 w-3 shrink-0 rounded-[3px] border border-[#ddd]" />
              <span className="text-[9px] font-medium text-[#aaa]">
                Hausrat
              </span>
            </div>
          </div>
          <CtaBtn c={c}>Weiter →</CtaBtn>
        </>
      );
    case "einkommens-check":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Einkommensverlauf
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Was passiert wenn ich ausfalle?
          </div>
          <div className="mb-2 flex flex-col gap-[3px]">
            {(
              [
                ["#059669", "30%", "100%"],
                ["#d97706", "20%", "67%"],
                ["#dc2626", "4%", "0%"],
                [c, "18%", "45%"],
              ] as const
            ).map(([col, w, lab]) => (
              <div key={lab} className="flex items-center gap-[3px]">
                <div
                  className="h-[5px] w-[5px] shrink-0 rounded-full"
                  style={{ background: col }}
                />
                <div className="h-1 min-w-0 flex-1 rounded-[3px] bg-black/[0.06]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{ background: col, width: w }}
                  />
                </div>
                <span
                  className="w-[22px] shrink-0 text-right text-[7px] font-bold"
                  style={{ color: col }}
                >
                  {lab}
                </span>
              </div>
            ))}
          </div>
          <CtaBtn c={c}>Lücke schließen →</CtaBtn>
        </>
      );
    case "vorsorge-check":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Vorsorge-Check
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Wie groß ist meine Rentenlücke?
          </div>
          <div className="mb-1 flex h-[5px] overflow-hidden rounded-[3px] bg-black/[0.07]">
            <div
              className="h-full w-[62%]"
              style={{
                background: "linear-gradient(90deg,#0369a1,#7c3aed,#059669)",
              }}
            />
          </div>
          <div className="mb-2 grid grid-cols-2 gap-[3px]">
            <div className="rounded bg-[#dbeafe] p-1 text-center">
              <div className="text-[7px] text-[#aaa]">Schicht 1</div>
              <div className="text-[10px] font-extrabold text-[#0369a1]">
                1.200€
              </div>
            </div>
            <div className="rounded bg-[#fee2e2] p-1 text-center">
              <div className="text-[7px] text-[#aaa]">Lücke</div>
              <div className="text-[10px] font-extrabold text-[#dc2626]">
                1.040€
              </div>
            </div>
          </div>
          <CtaBtn c={c}>Strategie wählen</CtaBtn>
        </>
      );
    case "risikoleben":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Risikoleben
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Familie absichern
          </div>
          <div
            className="mb-1.5 rounded-md border p-1.5"
            style={{
              background: alpha(c, 0.07),
              borderColor: alpha(c, 0.2),
            }}
          >
            <div
              className="text-[15px] font-black tracking-tight"
              style={{ color: c }}
            >
              285.000 €
            </div>
            <div className="mt-0.5 text-[8px] text-[#aaa]">
              fehlende Versicherungssumme
            </div>
          </div>
          <div className="mb-1.5 text-[8px] text-[#888]">
            Witwen-/Waisenrente eingerechnet
          </div>
          <CtaBtn c={c}>Lücke schließen</CtaBtn>
        </>
      );
    case "gkv-pkv":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            GKV vs. PKV
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Was lohnt sich für mich?
          </div>
          <div className="mb-1 flex h-[5px] overflow-hidden rounded-[3px]">
            <div className="h-full w-[65%] bg-[#059669]" />
            <div className="h-full flex-1 bg-[#7c3aed]" />
          </div>
          <div className="mb-1.5 flex justify-between text-[8px] font-bold">
            <span className="text-[#059669]">GKV 65%</span>
            <span className="text-[#7c3aed]">PKV 35%</span>
          </div>
          <div className="mb-1.5 rounded bg-[#ecfdf5] px-1.5 py-0.5 text-[8px] font-bold text-[#059669]">
            → Empfehlung: GKV
          </div>
          <CtaBtn c={c}>Gespräch anfragen</CtaBtn>
        </>
      );
    case "pflege-check":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Pflege-Check
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Eigenanteil nach Pflegegrad
          </div>
          <div
            className="mb-1.5 rounded-md border p-1.5"
            style={{
              background: alpha(c, 0.08),
              borderColor: alpha(c, 0.25),
            }}
          >
            <div className="text-[15px] font-black" style={{ color: c }}>
              ca. 1.850 €
            </div>
            <div className="mt-0.5 text-[8px] text-[#aaa]">
              Ø monatlicher Eigenanteil (PG 3)
            </div>
          </div>
          <CtaBtn c={c}>Produkte ansehen</CtaBtn>
        </>
      );
    case "immobilien-check":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Immobilien-Check
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Kaufen · Finanzieren · Absichern
          </div>
          <div className="mb-1.5 grid grid-cols-3 gap-[2px] text-center">
            <div className="rounded bg-black/[0.06] px-0.5 py-1 text-[7px] font-bold text-[#444]">
              Miete
            </div>
            <div
              className="rounded px-0.5 py-1 text-[7px] font-bold text-white"
              style={{ background: c }}
            >
              Anschluss
            </div>
            <div className="rounded bg-black/[0.06] px-0.5 py-1 text-[7px] font-bold text-[#444]">
              Gebäude
            </div>
          </div>
          <div className="mb-1.5 text-[8px] text-[#888]">
            Neue Rate vs. alte Rate — in einem Flow
          </div>
          <CtaBtn c={c}>Modul wählen →</CtaBtn>
        </>
      );
    default:
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Check
          </div>
          <div className="mb-2 text-[11px] font-extrabold text-[#111]">
            Vorschau
          </div>
          <CtaBtn c={c}>Weiter →</CtaBtn>
        </>
      );
  }
}

export default function PhoneMockPreview({
  slug,
  accentColor,
}: {
  slug: string;
  accentColor: string;
}) {
  const bg =
    PREVIEW_BG[slug] ??
    `linear-gradient(160deg, ${alpha(accentColor, 0.2)} 0%, #f7f7f5 100%)`;
  return (
    <div
      className="relative flex min-h-[260px] flex-col items-center justify-end overflow-hidden px-7 pb-0 pt-7"
      style={{ background: bg }}
    >
      <PhoneShell c={accentColor}>
        <MockInner slug={slug} c={accentColor} />
      </PhoneShell>
    </div>
  );
}
