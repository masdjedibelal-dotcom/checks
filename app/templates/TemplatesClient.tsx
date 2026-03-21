"use client";

import { useState } from "react";
import Link from "next/link";
import type { Template } from "@/lib/katalog";
import TemplateGalerie from "@/components/marketing/TemplateGalerie";
import DemoModal from "@/components/ui/DemoModal";
import KonfiguratorOverlay, {
  type KonfiguratorForm,
} from "@/components/ui/KonfiguratorOverlay";

export default function TemplatesClient() {
  const [demoT, setDemoT] = useState<Template | null>(null);
  const [buyT, setBuyT] = useState<Template | null>(null);

  async function handleCheckout(form: KonfiguratorForm, template: Template) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: template.slug,
          templateName: template.name,
          preis: template.preis,
          maklerEmail: form.email,
          maklerName: form.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Checkout fehlgeschlagen");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert("Keine Checkout-URL erhalten. STRIPE_SECRET_KEY gesetzt?");
    } catch {
      alert("Netzwerkfehler beim Checkout.");
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="sticky top-0 z-[100] border-b border-[#f0f0f0] bg-white/90 backdrop-blur-[16px]">
        <nav className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-5 min-[860px]:px-10">
          <Link
            href="/templates"
            className="text-[17px] font-bold tracking-[-0.03em] text-[#111] no-underline"
          >
            Check<span className="text-[#c9a96e]">Kit</span>
          </Link>
          <div className="flex items-center gap-7">
            <Link
              href="/templates"
              className="hidden text-[13px] font-medium text-[#777] no-underline transition-colors hover:text-[#111] sm:inline"
            >
              Startseite
            </Link>
            <a
              href="#wie-es-funktioniert"
              className="hidden text-[13px] font-medium text-[#777] no-underline transition-colors hover:text-[#111] md:inline"
            >
              So funktioniert&apos;s
            </a>
            <a
              href="mailto:hallo@checkkit.de"
              className="rounded-lg bg-[#111] px-[18px] py-2 text-[13px] font-semibold text-white no-underline transition-opacity hover:opacity-[0.82]"
            >
              Kontakt
            </a>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-28 min-[860px]:px-10">
        <div className="animate-fade-up pb-12 pt-[72px]">
          <h1 className="mb-3 max-w-[900px] text-[clamp(28px,4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.5px] text-[#111]">
            Interaktive Checks für
            <br />
            Versicherungsmakler.
          </h1>
          <p className="animate-fade-up-delay max-w-[460px] text-base leading-[1.65] text-[#888]">
            Einmal kaufen, mit Ihren Daten konfigurieren, per iFrame auf Ihrer
            Website einbetten. Fertig in 5 Minuten.
          </p>
        </div>

        <TemplateGalerie
          onDemo={(t) => setDemoT(t)}
          onBuy={(t) => {
            setDemoT(null);
            setBuyT(t);
          }}
        />

        <section
          id="wie-es-funktioniert"
          className="mt-24 scroll-mt-24 rounded-[22px] border border-[#f0f0f0] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:p-12"
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc]">
            So funktioniert&apos;s
          </p>
          <h2 className="mb-10 max-w-xl text-xl font-bold tracking-[-0.04em] text-[#111] md:text-2xl">
            In Minuten live —{" "}
            <span className="text-[#c9a96e]">anpassen, kaufen, einbetten.</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Anpassen & kaufen", "Name, Farbe, Kontakt — Live-Vorschau, dann Checkout."],
              ["02", "Datei erhalten", "Nach dem Kauf: fertige Einbettung / Assets per E-Mail."],
              ["03", "Hosten", "Auf Ihrem Server oder statischem Hosting."],
              ["04", "iFrame", "Ein Code-Schnipsel — Leads landen bei Ihnen."],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-6"
              >
                <div className="mb-3 text-3xl font-extrabold leading-none text-black/[0.08]">
                  {n}
                </div>
                <h3 className="mb-2 text-sm font-bold text-[#111]">{t}</h3>
                <p className="text-xs leading-relaxed text-[#888]">{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#f0f0f0] bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-5 py-10 text-center sm:flex-row sm:text-left min-[860px]:px-10">
          <div className="text-base font-bold text-[#111]">
            Check<span className="text-[#c9a96e]">Kit</span>
          </div>
          <div className="flex gap-7 text-xs font-medium text-[#777]">
            <Link href="/templates" className="hover:text-[#111]">
              Vorlagen
            </Link>
            <a href="mailto:hallo@checkkit.de" className="hover:text-[#111]">
              Kontakt
            </a>
          </div>
          <p className="text-xs text-[#bbb]">
            © {new Date().getFullYear()} CheckKit
          </p>
        </div>
      </footer>

      <DemoModal
        template={demoT}
        onClose={() => setDemoT(null)}
        onBuy={(t) => {
          setDemoT(null);
          setBuyT(t);
        }}
      />

      <KonfiguratorOverlay
        template={buyT}
        onClose={() => setBuyT(null)}
        onCheckout={(form) => {
          if (!buyT) return;
          void handleCheckout(form, buyT);
        }}
      />
    </div>
  );
}
