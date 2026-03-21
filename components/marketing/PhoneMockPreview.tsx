"use client";

import { alpha } from "@/lib/utils";

/** Hintergrund der Karten-Preview wie in der statischen HTML-Vorlage */
const PREVIEW_BG: Record<string, string> = {
  bedarfscheck: "linear-gradient(160deg,#fdf8ee 0%,#f0e8cc 100%)",
  jahrescheck: "linear-gradient(160deg,#edf7ed 0%,#c8e6c8 100%)",
  "bu-ktg": "linear-gradient(160deg,#f0ecff 0%,#d9d0ff 100%)",
  rente: "linear-gradient(160deg,#ecfdf5 0%,#bbf7d0 100%)",
  risikoleben: "linear-gradient(160deg,#fdf2f8 0%,#f5c6e8 100%)",
  zinseszins: "linear-gradient(160deg,#ecfdf5 0%,#bbf7d0 100%)",
  "gkv-pkv": "linear-gradient(160deg,#fff5f5 0%,#ffc9c9 100%)",
  anschluss: "linear-gradient(160deg,#fffbeb 0%,#fde68a 100%)",
  "bu-check": "linear-gradient(160deg,#f0ecff 0%,#d9d0ff 100%)",
  elternzeit: "linear-gradient(160deg,#fdf2f8 0%,#f5c6e8 100%)",
  riester: "linear-gradient(160deg,#fffbeb 0%,#fde68a 100%)",
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
    case "jahrescheck":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Jahrescheck 2025
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
    case "bu-ktg":
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
    case "rente":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Rentenlücke
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
            <div className="text-[15px] font-black tracking-tight" style={{ color: c }}>
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
    case "zinseszins":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Früh vs. Spät
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Was kostet 10 Jahre warten?
          </div>
          <div className="mb-2 flex h-[30px] items-end gap-0.5">
            <div
              className="flex-1 rounded-t-[2px] bg-[#d1fae5]"
              style={{ height: "20%" }}
            />
            <div
              className="flex-1 rounded-t-[2px] bg-[#6ee7b7]"
              style={{ height: "36%" }}
            />
            <div
              className="flex-1 rounded-t-[2px] bg-[#34d399]"
              style={{ height: "55%" }}
            />
            <div
              className="flex-1 rounded-t-[2px] bg-[#10b981]"
              style={{ height: "72%" }}
            />
            <div
              className="flex-1 rounded-t-[2px] bg-[#059669]"
              style={{ height: "90%" }}
            />
            <div
              className="flex-1 rounded-t-[2px] border border-dashed border-[#059669] bg-[#d1fae5]"
              style={{ height: "36%" }}
            />
            <div
              className="flex-1 rounded-t-[2px] bg-[#a7f3d0]"
              style={{ height: "55%" }}
            />
          </div>
          <CtaBtn c={c}>Unterschied sehen</CtaBtn>
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
    case "anschluss":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Anschlussfinanzierung
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Neue Rate ab 2026
          </div>
          <div className="mb-1.5 grid grid-cols-2 gap-[3px]">
            <div className="rounded bg-black/[0.05] p-1 text-center">
              <div className="text-[7px] text-[#aaa]">Aktuell</div>
              <div className="text-[10px] font-extrabold">987 €</div>
            </div>
            <div className="rounded bg-[#fee2e2] p-1 text-center">
              <div className="text-[7px] text-[#aaa]">Neu</div>
              <div className="text-[10px] font-extrabold text-[#dc2626]">
                1.312 €
              </div>
            </div>
          </div>
          <div className="mb-1.5 text-[8px] font-bold text-[#dc2626]">
            +325 €/Monat mehr
          </div>
          <CtaBtn c={c}>Optimieren →</CtaBtn>
        </>
      );
    case "bu-check":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            BU-Karriere-Check
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Was hat sich verändert?
          </div>
          <div className="mb-2 grid grid-cols-2 gap-[3px]">
            <div
              className="rounded px-1 py-1 text-center text-[8px] font-bold"
              style={{ background: alpha(c, 0.15), color: c }}
            >
              📈 Gehalt
            </div>
            <div className="rounded bg-black/[0.05] px-1 py-1 text-center text-[8px] text-[#666]">
              💼 Jobwechsel
            </div>
            <div
              className="rounded px-1 py-1 text-center text-[8px] font-bold"
              style={{ background: alpha(c, 0.15), color: c }}
            >
              👶 Kind
            </div>
            <div className="rounded bg-black/[0.05] px-1 py-1 text-center text-[8px] text-[#666]">
              🚀 Selbst.
            </div>
          </div>
          <CtaBtn c={c}>Ergebnis →</CtaBtn>
        </>
      );
    case "elternzeit":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Elternzeit
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Was bleibt übrig?
          </div>
          <div className="mb-1.5 grid grid-cols-2 gap-[3px]">
            <div className="rounded bg-black/[0.05] p-1 text-center">
              <div className="text-[7px] text-[#aaa]">Vorher</div>
              <div className="text-[10px] font-extrabold">5.200 €</div>
            </div>
            <div
              className="rounded p-1 text-center"
              style={{ background: alpha(c, 0.08) }}
            >
              <div className="text-[7px] text-[#aaa]">Während EZ</div>
              <div className="text-[10px] font-extrabold" style={{ color: c }}>
                3.370 €
              </div>
            </div>
          </div>
          <div className="mb-1.5 text-[8px] font-bold" style={{ color: c }}>
            −1.830 €/Monat Lücke
          </div>
          <CtaBtn c={c}>Absichern →</CtaBtn>
        </>
      );
    case "riester":
      return (
        <>
          <div
            className="mb-1 text-[7px] font-bold uppercase tracking-[0.08em]"
            style={{ color: c }}
          >
            Riester-Check
          </div>
          <div className="mb-2 text-[11px] font-extrabold leading-tight text-[#111]">
            Alle Zulagen beantragt?
          </div>
          <div className="mb-1.5 rounded border border-[#fca5a5] bg-[#fee2e2] p-1.5">
            <div className="text-[8px] font-bold text-[#dc2626]">
              ⚠ Kinderzulage fehlt!
            </div>
            <div className="text-[11px] font-black text-[#dc2626]">
              300 €/Jahr
            </div>
          </div>
          <CtaBtn c={c}>Jetzt regeln →</CtaBtn>
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
