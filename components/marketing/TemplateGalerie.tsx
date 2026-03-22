"use client";

import { useMemo, useState } from "react";
import { FILTER_TABS, KATALOG, type Template, type TemplateKategorie } from "@/lib/katalog";
import TemplateCard from "./TemplateCard";

type Props = {
  onDemo: (t: Template) => void;
  onBuy: (t: Template) => void;
};

export default function TemplateGalerie({ onDemo, onBuy }: Props) {
  const [filter, setFilter] = useState<"alle" | TemplateKategorie>("alle");

  const filtered = useMemo(() => {
    if (filter === "alle") return KATALOG;
    return KATALOG.filter((t) => t.kategorie === filter);
  }, [filter]);

  const sections = useMemo(() => {
    const order: TemplateKategorie[] = [
      "alle-kunden",
      "luecken",
      "finanzen",
    ];
    const labels: Record<TemplateKategorie, string> = {
      "alle-kunden": "Für alle Kunden",
      luecken: "Lücken aufdecken",
      finanzen: "Finanzentscheidungen",
    };
    if (filter !== "alle") {
      const cat = filter;
      return [{ cat, label: labels[cat], items: filtered }];
    }
    return order
      .map((cat) => ({
        cat,
        label: labels[cat],
        items: KATALOG.filter((t) => t.kategorie === cat),
      }))
      .filter((s) => s.items.length > 0);
  }, [filter, filtered]);

  return (
    <div className="pb-[100px]">
      <div className="mb-10">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Kategorien"
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`rounded-full px-4 py-[7px] text-[13px] font-medium transition-[border-color,color,background] duration-[180ms] ${
                  active
                    ? "border-[1.5px] border-[#111] bg-[#111] font-semibold text-white"
                    : "border-[1.5px] border-[#e8e8e8] bg-white text-[#666] hover:border-[#ccc] hover:text-[#111]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {sections.map(({ cat, label, items }, idx) => (
        <section key={cat}>
          <div
            className={`mb-6 flex items-center gap-3 ${idx > 0 ? "mt-12" : ""}`}
          >
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#bbb]">
              {label}
            </span>
            <div className="h-px min-w-0 flex-1 bg-[#f0f0f0]" />
          </div>
          <div className="grid grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[860px]:grid-cols-3 min-[500px]:gap-4 min-[860px]:gap-6">
            {items.map((t) => (
              <TemplateCard
                key={t.slug}
                template={t}
                onDemo={onDemo}
                onBuy={onBuy}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
