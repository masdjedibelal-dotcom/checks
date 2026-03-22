"use client";

import type { Template } from "@/lib/katalog";
import PhoneMockPreview from "./PhoneMockPreview";

function cardHeadline(name: string) {
  const i = name.indexOf("—");
  return i === -1 ? name : name.slice(i + 1).trim();
}

type Props = {
  template: Template;
  onDemo: (t: Template) => void;
  onBuy: (t: Template) => void;
};

export default function TemplateCard({ template, onDemo, onBuy }: Props) {
  const c = template.accentColor;
  const audienceLabel = template.tags[0] ?? "";

  return (
    <article className="group flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[5px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.04)]">
      <PhoneMockPreview slug={template.slug} accentColor={c} />

      <div className="flex flex-1 flex-col px-[22px] pb-4 pt-5">
        <p
          className="mb-1.5 text-[11px] font-semibold tracking-[0.02em]"
          style={{ color: c }}
        >
          {audienceLabel}
        </p>
        <h3 className="mb-1.5 text-[15px] font-bold leading-snug tracking-[-0.02em] text-[#111]">
          {cardHeadline(template.name)}
        </h3>
        <p className="flex-1 text-[13px] leading-[1.55] text-[#888] line-clamp-3">
          {template.desc}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2.5 px-[22px] pb-5 pt-3.5">
        <div className="text-[17px] font-bold tracking-[-0.03em] text-[#111]">
          {template.preis} €{" "}
          <small className="text-[11px] font-normal text-[#bbb]">einmalig</small>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border-[1.5px] border-[#e8e8e8] bg-transparent px-3.5 py-2 text-[12px] font-semibold text-[#666] transition hover:border-[#bbb] hover:text-[#111]"
            onClick={() => onDemo(template)}
          >
            Demo
          </button>
          <button
            type="button"
            className="whitespace-nowrap rounded-lg bg-[#111] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#c9a96e]"
            onClick={() => onBuy(template)}
          >
            Kaufen
          </button>
        </div>
      </div>
    </article>
  );
}
