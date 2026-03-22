"use client";

import { useEffect } from "react";
import type { Template } from "@/lib/katalog";

export type DemoModalProps = {
  template: Template | null;
  onClose: () => void;
  onBuy: (template: Template) => void;
};

export default function DemoModal({
  template,
  onClose,
  onBuy,
}: DemoModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = template ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [template]);

  if (!template) return null;

  /** Next.js-App-Route — keine statischen *.html-Demos */
  const demoUrl = `/demo/${template.slug}`;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/55 p-5 transition-opacity duration-[220ms]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex h-[88vh] max-h-[780px] w-full max-w-[400px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-[transform] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#f0f0f0] px-[18px] py-3.5">
          <div>
            <div
              id="demo-modal-title"
              className="text-[13px] font-bold text-[#111]"
            >
              {template.name.includes("—")
                ? template.name.split("—")[0].trim()
                : template.name}
            </div>
            <div className="mt-px text-[11px] text-[#aaa]">
              Live-Demo — so sieht es Ihr Kunde
            </div>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-base text-[#888] transition hover:bg-[#eee] hover:text-[#111]"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>
        <iframe
          key={template.slug}
          src={demoUrl}
          title={`Demo: ${template.name}`}
          className="min-h-0 w-full flex-1 border-0 bg-[#f0f2f5]"
        />
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#f0f0f0] px-[18px] py-3 pb-4">
          <div className="text-lg font-bold tracking-[-0.03em] text-[#111]">
            {template.preis} €{" "}
            <small className="text-[11px] font-normal text-[#bbb]">
              einmalig
            </small>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg bg-[#111] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#c9a96e]"
            onClick={() => onBuy(template)}
          >
            Anpassen & kaufen
          </button>
        </div>
      </div>
    </div>
  );
}
