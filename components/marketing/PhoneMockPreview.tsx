"use client";

import { alpha, textOnAccent } from "@/lib/utils";

const PREVIEW_BG: Record<string, string> = {
  bedarfscheck: "linear-gradient(160deg,#fdf8ee 0%,#f0e8cc 100%)",
  "lebenssituations-check": "linear-gradient(160deg,#edf7ed 0%,#c8e6c8 100%)",
  "einkommens-check": "linear-gradient(160deg,#f0ecff 0%,#d9d0ff 100%)",
  "vorsorge-check": "linear-gradient(160deg,#ecfdf5 0%,#bbf7d0 100%)",
  risikoleben: "linear-gradient(160deg,#fdf2f8 0%,#f5c6e8 100%)",
  "gkv-pkv": "linear-gradient(160deg,#fff5f5 0%,#ffc9c9 100%)",
  "pflege-check": "linear-gradient(160deg,#e0f2fe 0%,#bae6fd 100%)",
  "immobilien-check": "linear-gradient(160deg,#fffbeb 0%,#fde68a 100%)",
};

function PhoneShell({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <div className="w-[180px] shrink-0 overflow-hidden rounded-t-[22px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]">
      <div className="h-1 w-full" style={{ background: c }} />
      <div className="flex items-center justify-between border-b border-black/[0.05] px-3 pb-2 pt-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] text-[9px] font-extrabold"
            style={{ background: c, color: textOnAccent(c) }}
          >
            M
          </div>
          <span className="truncate text-[9px] font-bold" style={{ color: c }}>
            Mustermann Vers.
          </span>
        </div>
        <div
          className="shrink-0 rounded-[20px] px-1.5 py-0.5 text-[8px] font-semibold"
          style={{ background: alpha(c, 0.1), color: c }}
        >
          Ergebnis
        </div>
      </div>
      <div className="px-3 pb-3 pt-3">{children}</div>
    </div>
  );
}

function ResultBadge({ label }: { label: string }) {
  return (
    <div className="mt-2 rounded-full border border-[#e8e8e8] px-2 py-0.5 text-center text-[7px] font-medium text-[#9CA3AF]">
      {label}
    </div>
  );
}

function MockInner({ slug, c }: { slug: string; c: string }) {
  switch (slug) {
    /* ── 1. Bedarfscheck ──────────────────────────────────────── */
    case "bedarfscheck":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Ihre Absicherung</div>
          <div
            className="mb-0.5 text-[26px] font-black leading-none tracking-tight"
            style={{ color: c }}
          >
            Rundum
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">
            Ihr ideales Paket
          </div>
          <div className="mb-2 flex gap-1">
            {(["Basis", "Rundum", "Maximal"] as const).map((t, i) => (
              <div
                key={t}
                className="flex-1 rounded py-1 text-center text-[7px] font-bold"
                style={
                  i === 1
                    ? { background: c, color: "white" }
                    : { background: "rgba(0,0,0,0.05)", color: "#9CA3AF" }
                }
              >
                {t}
              </div>
            ))}
          </div>
          <ResultBadge label="Ergebnis nach 2 Min." />
        </>
      );

    /* ── 2. Lebenssituations-Check ────────────────────────────── */
    case "lebenssituations-check":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Das ist jetzt relevant</div>
          <div className="mb-0.5 text-[26px] font-black leading-none tracking-tight text-[#111]">
            3 Themen
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">
            konkrete Handlungspunkte
          </div>
          <div className="mb-2 flex flex-col gap-1">
            {["Einkommen absichern", "Familie prüfen", "Vorsorge anpassen"].map(
              (t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 rounded-md bg-[#f7f7f5] px-2 py-[5px]"
                >
                  <div
                    className="h-[5px] w-[5px] shrink-0 rounded-full"
                    style={{ background: c }}
                  />
                  <span className="text-[8px] font-medium text-[#444]">{t}</span>
                </div>
              )
            )}
          </div>
          <ResultBadge label="Kunde sieht seinen Bedarf" />
        </>
      );

    /* ── 3. Einkommens-Check ──────────────────────────────────── */
    case "einkommens-check":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Ihre Einkommenslücke</div>
          <div className="mb-0.5 text-[28px] font-black leading-none tracking-tight text-[#dc2626]">
            1.850 €
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">monatliche Lücke</div>
          <div className="mb-2 flex flex-col gap-[4px]">
            {(
              [
                { label: "Netto", w: "100%", color: "#111" },
                { label: "Leistung", w: "58%", color: "#059669" },
                { label: "Lücke", w: "42%", color: "#dc2626" },
              ] as const
            ).map(({ label, w, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-8 shrink-0 text-[7px] text-[#9CA3AF]">
                  {label}
                </span>
                <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: w, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ResultBadge label="Ergebnis nach 2 Min." />
        </>
      );

    /* ── 4. GKV vs. PKV ───────────────────────────────────────── */
    case "gkv-pkv":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Ihre Tendenz</div>
          <div
            className="mb-0.5 text-[32px] font-black leading-none tracking-tight"
            style={{ color: c }}
          >
            PKV
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">
            auf Basis Ihrer Angaben
          </div>
          <div className="mb-2 rounded-lg border border-black/[0.06] bg-[#f9f9f9] px-2 py-1.5">
            <div className="mb-1 flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">GKV</span>
              <span className="font-bold text-[#9CA3AF]">410 €/Mon.</span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="font-semibold" style={{ color: c }}>
                PKV
              </span>
              <span className="font-bold" style={{ color: c }}>
                290 €/Mon.
              </span>
            </div>
            <div className="mt-1.5 rounded bg-[#f0fdf4] px-1.5 py-0.5 text-[7px] font-semibold text-[#059669]">
              → 120 € Ersparnis / Monat
            </div>
          </div>
          <ResultBadge label="Klare Entscheidung" />
        </>
      );

    /* ── 5. Vorsorge-Check ────────────────────────────────────── */
    case "vorsorge-check":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Ihre Rentenlücke</div>
          <div className="mb-0.5 text-[28px] font-black leading-none tracking-tight text-[#dc2626]">
            1.200 €
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">
            monatlich · ab Rentenalter
          </div>
          <div className="mb-1 flex h-[6px] overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full w-[58%]" style={{ background: c }} />
            <div className="h-full flex-1 bg-[#dc2626]" />
          </div>
          <div className="mb-2 flex justify-between text-[7px]">
            <span style={{ color: c }}>Gedeckt 58 %</span>
            <span className="text-[#dc2626]">Lücke 42 %</span>
          </div>
          <ResultBadge label="Zukunft sichtbar machen" />
        </>
      );

    /* ── 6. Risikoleben ───────────────────────────────────────── */
    case "risikoleben":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Absicherungsbedarf</div>
          <div
            className="mb-0.5 text-[24px] font-black leading-none tracking-tight"
            style={{ color: c }}
          >
            250.000 €
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">für Ihre Familie</div>
          <div className="mb-2 rounded-lg border border-black/[0.06] bg-[#f9f9f9] px-2 py-1.5">
            <div className="mb-1 flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">Vorhanden</span>
              <span className="font-bold text-[#9CA3AF]">0 €</span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">Bedarf</span>
              <span className="font-bold" style={{ color: c }}>
                250.000 €
              </span>
            </div>
          </div>
          <ResultBadge label="Ergebnis nach 2 Min." />
        </>
      );

    /* ── 7. Pflege-Check ──────────────────────────────────────── */
    case "pflege-check":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">
            Eigenanteil Pflegeheim
          </div>
          <div className="mb-0.5 text-[24px] font-black leading-none tracking-tight text-[#dc2626]">
            2.300 €
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">
            monatlich · Pflegegrad 3
          </div>
          <div className="mb-2 rounded-lg border border-[#F2D4D0] bg-[#FFF6F5] px-2 py-1.5">
            <div className="mb-1 flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">Pflegekasse</span>
              <span className="font-bold text-[#111]">1.262 €</span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">Eigenanteil</span>
              <span className="font-bold text-[#dc2626]">2.300 €</span>
            </div>
          </div>
          <ResultBadge label="Der Schockmoment" />
        </>
      );

    /* ── 8. Immobilien-Check ──────────────────────────────────── */
    case "immobilien-check":
      return (
        <>
          <div className="mb-0.5 text-[7px] text-[#9CA3AF]">Monatliche Rate</div>
          <div
            className="mb-0.5 text-[28px] font-black leading-none tracking-tight"
            style={{ color: c }}
          >
            1.450 €
          </div>
          <div className="mb-2.5 text-[8px] text-[#9CA3AF]">Kaufen · Rate/Monat</div>
          <div className="mb-2 rounded-lg border border-black/[0.06] bg-[#f9f9f9] px-2 py-1.5">
            <div className="mb-1 flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">Kaufen (Rate)</span>
              <span className="font-bold" style={{ color: c }}>
                1.450 €
              </span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-[#9CA3AF]">Mieten</span>
              <span className="font-bold text-[#059669]">1.200 €</span>
            </div>
            <div className="mt-1.5 text-[7px] text-[#9CA3AF]">
              + 250 € · Break-even ab Jahr 12
            </div>
          </div>
          <ResultBadge label="Vergleich auf einen Blick" />
        </>
      );

    default:
      return (
        <>
          <div className="mb-1 text-[7px] text-[#9CA3AF]">Ergebnis</div>
          <div className="mb-2 text-[22px] font-black leading-none tracking-tight text-[#111]">
            —
          </div>
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
