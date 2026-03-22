"use client";

import { useEffect, useMemo, useState } from "react";
import { MAKLER } from "@/lib/config";
import type { Template } from "@/lib/katalog";
import { normalizeDomainHost } from "@/lib/licenseUtils";
import { alpha } from "@/lib/utils";

export type KonfiguratorForm = {
  name: string;
  firma: string;
  email: string;
  /** Optionale Website-Domain für Metadaten (Checkout / Fulfillment) */
  website: string;
  akzentfarbe: string;
  headline: string;
  unterzeile: string;
  cta: string;
  danke: string;
};

export type KonfiguratorOverlayProps = {
  template: Template | null;
  onClose: () => void;
  onCheckout: (form: KonfiguratorForm) => void;
};

const PRESETS = [
  "#c9a96e",
  "#1a3a5c",
  "#166534",
  "#7c3aed",
  "#be185d",
  "#b45309",
  "#dc2626",
  "#0369a1",
  "#059669",
];

export default function KonfiguratorOverlay({
  template,
  onClose,
  onCheckout,
}: KonfiguratorOverlayProps) {
  const [form, setForm] = useState<KonfiguratorForm>(() => ({
    name: "",
    firma: MAKLER.firma,
    email: "",
    website: "",
    akzentfarbe: template?.accentColor ?? MAKLER.primaryColor,
    headline: "Was haben Sie bereits?",
    unterzeile: "Tippen Sie an was vorhanden ist.",
    cta: "Weiter →",
    danke: "Wir melden uns innerhalb von 24 Stunden.",
  }));

  useEffect(() => {
    if (template)
      setForm((f) => ({ ...f, akzentfarbe: template.accentColor }));
  }, [template]);

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

  const initials = useMemo(() => {
    const parts = form.name.trim().split(/\s+/).filter(Boolean);
    const s = parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    return s || "M";
  }, [form.name]);

  const err = useMemo(() => {
    const domainOk = Boolean(normalizeDomainHost(form.website));
    return {
      name: !form.name.trim(),
      email: !form.email.trim(),
      website: !domainOk,
    };
  }, [form.name, form.email, form.website]);

  if (!template) return null;

  const c = form.akzentfarbe;

  const set = (k: keyof KonfiguratorForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const shortName = template.name.includes("—")
    ? template.name.split("—")[0].trim()
    : template.name;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-end justify-center bg-black/45 transition-opacity duration-[220ms]"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-[22px] bg-white shadow-2xl md:mb-0 md:rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#f0f0f0] px-[26px] py-[18px]">
          <div>
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a96e]">
              Template anpassen
            </div>
            <div className="text-lg font-bold tracking-[-0.04em] text-[#111]">
              {shortName}
            </div>
          </div>
          <button
            type="button"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#f5f5f5] text-[17px] text-[#888] transition hover:bg-[#eee] hover:text-[#111]"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
          <div className="max-h-[50vh] overflow-y-auto border-b border-[#f0f0f0] px-[26px] py-[22px] md:max-h-none md:border-b-0 md:border-r md:border-[#f0f0f0]">
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ccc]">
                <span>Branding</span>
                <span className="h-px flex-1 bg-[#f0f0f0]" />
              </div>
              <Field
                label="Ihr Name"
                value={form.name}
                onChange={(v) => set("name", v)}
                err={err.name}
              />
              <Field
                label="Firmenname"
                value={form.firma}
                onChange={(v) => set("firma", v)}
              />
              <Field
                label="E-Mail für Leads"
                value={form.email}
                onChange={(v) => set("email", v)}
                err={err.email}
                type="email"
              />
              <Field
                label="Ihre Website-Domain *"
                value={form.website}
                onChange={(v) => set("website", v)}
                err={err.website}
                placeholder="mustermann-versicherungen.de"
              />
              <p className="-mt-1 mb-3 text-[10px] leading-snug text-[#999]">
                Ohne https:// — der eingebettete Check ist nur auf dieser Domain freigeschaltet.
              </p>
              <div className="mb-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-[#555]">
                  Akzentfarbe
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => set("akzentfarbe", e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-black/10"
                  />
                  <input
                    value={c}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (/^#[0-9a-fA-F]{6}$/.test(v)) set("akzentfarbe", v);
                      else set("akzentfarbe", e.target.value);
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-black/10 bg-[#fafaf8] px-3 py-2 text-sm"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => set("akzentfarbe", hex)}
                      className="h-6 w-6 rounded-md border-2 border-transparent transition hover:scale-110"
                      style={{
                        background: hex,
                        borderColor: c === hex ? "#0d0d0d" : "transparent",
                      }}
                      aria-label={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ccc]">
                <span>Texte</span>
                <span className="h-px flex-1 bg-[#f0f0f0]" />
              </div>
              <Field
                label="Begrüßungs-Headline"
                value={form.headline}
                onChange={(v) => set("headline", v)}
              />
              <Field
                label="Unterzeile"
                value={form.unterzeile}
                onChange={(v) => set("unterzeile", v)}
              />
              <Field
                label="Button-Text (CTA)"
                value={form.cta}
                onChange={(v) => set("cta", v)}
              />
              <Field
                label="Danke-Text"
                value={form.danke}
                onChange={(v) => set("danke", v)}
              />
            </div>
          </div>

          <div className="hidden flex-col bg-[#f7f7f5] md:flex">
            <div className="shrink-0 border-b border-[#f0f0f0] bg-white px-[18px] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#bbb]">
              Live-Vorschau
            </div>
            <div className="flex flex-1 items-start justify-center overflow-y-auto p-6">
              <div
                className="w-[258px] overflow-hidden rounded-[20px] bg-white shadow-xl"
                style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
              >
                <div className="flex items-center justify-between border-b border-black/[0.05] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-md text-[10px] font-extrabold text-black"
                      style={{ background: c }}
                    >
                      {initials}
                    </div>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: c }}
                    >
                      {form.firma || MAKLER.firma}
                    </span>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                    style={{
                      background: alpha(c, 0.1),
                      color: c,
                    }}
                  >
                    Check
                  </span>
                </div>
                <div className="h-0.5 bg-black/[0.08]">
                  <div
                    className="h-full w-[28%]"
                    style={{ background: c }}
                  />
                </div>
                <div className="p-3.5">
                  <div
                    className="mb-1.5 text-[8px] font-bold uppercase tracking-wide"
                    style={{ color: c }}
                  >
                    {shortName} · Schritt 1
                  </div>
                  <div className="mb-1 text-[13px] font-extrabold leading-tight text-[#0d0d0d]">
                    {form.headline}
                  </div>
                  <div className="mb-3 text-[10px] leading-snug text-black/45">
                    {form.unterzeile}
                  </div>
                  <div className="mb-3 flex flex-col gap-1.5">
                    {["BU", "Haftpflicht", "KTG", "Risiko"].map((x, i) => (
                      <div
                        key={x}
                        className="flex items-center gap-2 rounded-lg bg-[#f5f4f0] px-2.5 py-2"
                      >
                        <div
                          className="flex h-3.5 w-3.5 items-center justify-center rounded border text-[8px] font-bold"
                          style={{
                            borderColor: i < 2 ? "transparent" : "rgba(0,0,0,0.15)",
                            background: i < 2 ? c : "transparent",
                            color: i < 2 ? "#000" : "transparent",
                          }}
                        >
                          {i < 2 ? "✓" : ""}
                        </div>
                        <span className="text-[10px] font-medium text-black/55">
                          {x}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-lg py-2.5 text-center text-[11px] font-bold text-black"
                    style={{ background: c }}
                  >
                    {form.cta}
                  </button>
                  <p className="mt-2 text-center text-[9px] text-black/30">
                    Von <strong>{form.name || "Max Mustermann"}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#f0f0f0] bg-white px-[26px] py-3.5">
          <div>
            <div className="text-xl font-bold tracking-[-0.05em] text-[#111]">
              {template.preis} €
            </div>
            <div className="text-[11px] text-[#bbb]">einmalig</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(err.name || err.email || err.website) && (
              <span className="text-[11px] text-[#e53e3e]">
                Name, E-Mail und Website-Domain nötig
              </span>
            )}
            <button
              type="button"
              className="rounded-lg border-[1.5px] border-[#ebebeb] bg-transparent px-3.5 py-2.5 text-[13px] text-[#888] transition hover:border-[#bbb] hover:text-[#111]"
              onClick={onClose}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-[#111] px-[22px] py-2.5 text-[13px] font-bold text-white transition hover:bg-[#c9a96e]"
              onClick={() => {
                if (err.name || err.email || err.website) return;
                onCheckout(form);
              }}
            >
              Jetzt kaufen →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  err,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  err?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-[11px] font-semibold text-[#555]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-[1.5px] border-[#ebebeb] bg-[#fafafa] px-3 py-2.5 text-[13px] text-[#111] outline-none transition-colors focus:border-[#c9a96e] focus:bg-white"
        style={{ borderColor: err ? "#dc2626" : undefined }}
      />
    </div>
  );
}
