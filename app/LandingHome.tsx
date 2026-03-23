"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KATALOG, type Template } from "@/lib/katalog";
import { CHECK_FLOW_META, CheckFlowPhoneMock } from "./check-flow-checks";
import DemoModal from "@/components/ui/DemoModal";
import KonfiguratorOverlay, {
  type KonfiguratorForm,
} from "@/components/ui/KonfiguratorOverlay";

const FAQ_ITEMS = [
  {
    q: "Wie baue ich das Tool ein?",
    a: "Per iFrame — einfach kopieren und einfügen. Nach dem Kauf erhalten Sie per E-Mail einen personalisierten Einbettungscode mit Ihrem Namen, Ihrer Farbe und Ihren Kontaktdaten.",
  },
  {
    q: "Wohin gehen die Leads?",
    a: "Direkt an Sie. Die Anfrage geht per E-Mail an die Adresse, die Sie beim Kauf angegeben haben. Kein Portal, kein Umweg.",
  },
  {
    q: "Wer ist für die Einbindung und Datenverarbeitung verantwortlich?",
    a: "Die Tools werden auf der Website des jeweiligen Maklers eingebunden. Anfragen gehen direkt an den jeweiligen Anbieter. Die konkrete rechtliche Einbindung und Datenschutzhinweise erfolgen daher über dessen Website.",
  },
  {
    q: "Funktioniert das auf dem Handy?",
    a: "Ja — alle Tools sind mobile-first entwickelt und auf Touch-Bedienung optimiert. Die meisten Ihrer Kunden werden das Tool auf dem Smartphone nutzen.",
  },
  {
    q: "Kann ich Design und Inhalte anpassen?",
    a: "Ja — Farben, Name und Kontaktdaten sind individuell anpassbar. Das Tool erscheint dann in Ihrem Look.",
  },
  {
    q: "Gibt es Folgekosten oder ein Abo?",
    a: "Nein — Sie zahlen einmalig und nutzen das Tool dauerhaft. Kein Abo, keine monatlichen Kosten, keine versteckten Gebühren.",
  },
  {
    q: "Brauche ich eine eigene Website?",
    a: "Nein — die Tools lassen sich auf jeder bestehenden Website einbinden. Das funktioniert auf Jimdo, Squarespace, WordPress und den meisten Baukastensystemen.",
  },
];

/** Modals an `document.body` — nicht von `.flow-leads-landing` (overflow/z-index) eingeschränkt */
function LandingModalsPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function LogoMarkSm() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <rect x=".5" y=".5" width="3.5" height="3.5" rx=".6" fill="white" />
      <rect x="6" y=".5" width="3.5" height="3.5" rx=".6" fill="white" opacity=".5" />
      <rect x=".5" y="6" width="3.5" height="3.5" rx=".6" fill="white" opacity=".5" />
      <rect x="6" y="6" width="3.5" height="3.5" rx=".6" fill="white" />
    </svg>
  );
}

export default function LandingHome() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [demoT, setDemoT] = useState<Template | null>(null);
  const [buyT, setBuyT] = useState<Template | null>(null);
  const demoTRef = useRef<Template | null>(null);
  demoTRef.current = demoT;

  useEffect(() => {
    const closeDemoModal = () => {
      setDemoT(null);
    };
    const openConfig = (slug: unknown) => {
      const fromSlug =
        typeof slug === "string" && slug.trim()
          ? KATALOG.find((t) => t.slug === slug)
          : null;
      const tmpl = fromSlug ?? demoTRef.current;
      if (tmpl) setBuyT(tmpl);
    };
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "openConfig") return;
      closeDemoModal();
      openConfig(e.data.slug);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  async function handleCheckout(form: KonfiguratorForm, template: Template) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: template.slug,
          email: form.email,
          name: form.name,
          firma: form.firma,
          telefon: form.telefon,
          accentColor: form.akzentfarbe,
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
      alert("Keine Checkout-URL erhalten.");
    } catch {
      alert("Netzwerkfehler beim Checkout.");
    }
  }

  return (
    <div className="flow-leads-landing">
      <nav>
        <div className="logo">
          <div className="logo-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="1" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" />
              <rect x="9.5" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4" />
              <rect x="1" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" />
            </svg>
          </div>
          <span>FlowLeads</span>
        </div>
        <div className="nav-links">
          <a href="#how">Wie es funktioniert</a>
          <a href="#tools">Tools</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-right">
          <a href="#faq" className="btn-ghost">
            Fragen?
          </a>
          <a href="#tools" className="btn-cta">
            Tools ansehen
          </a>
        </div>
      </nav>

      <section style={{ background: "var(--bg)", paddingBottom: 0 }}>
        <div className="hero">
          <div className="hero-tag au d1">
            <span className="tag-dot" />
            Für Versicherungsmakler &amp; -vermittler
          </div>

          <h1 className="au d2">
            Ihre Website bringt keine Anfragen?
            <br />
            Dann fehlt ein <span className="hero-moment-flow">Rechner</span>.
          </h1>

          <p className="hero-sub au d3">
            FlowLeads gibt Ihnen fertige Bedarfsrechner —<br />
            einbetten, verlinken oder als QR-Code drucken.<br />
            Besucher berechnen ihre Versorgungslücke und<br />
            fragen direkt bei Ihnen an.
          </p>

          <div className="hero-btns au d4">
            <a href="#tools" className="btn-primary-lg">
              Tools ansehen
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href="#how" className="btn-demo-lg">
              Wie es funktioniert
            </a>
          </div>

          <div className="wf-wrap au d4">
            <div className="wf-row">
              <div className="wf-ico" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M9 1L3 9h5l-1 6 7-9H9L9 1z"
                    stroke="#b8884a"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="wf-body">
                <div className="wf-title">Einmalig kaufen — dauerhaft nutzen</div>
                <p className="wf-text">
                  Kein Abo. Keine Plattformgebühren. Einmal kaufen und für immer auf Ihrer Website einsetzen.
                </p>
              </div>
            </div>
            <div className="wf-row">
              <div className="wf-ico" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8h12M9 3l5 5-5 5"
                    stroke="#b8884a"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="wf-body">
                <div className="wf-title">Leads direkt in Ihr Postfach</div>
                <p className="wf-text">
                  Keine Plattform, kein Portal, keine Provision. Anfragen landen direkt bei Ihnen.
                </p>
              </div>
            </div>
            <div className="wf-row">
              <div className="wf-ico" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="1" width="10" height="14" rx="2" stroke="#b8884a" strokeWidth="1.4" />
                  <path d="M7 12h2" stroke="#b8884a" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="wf-body">
                <div className="wf-title">In 5 Minuten live</div>
                <p className="wf-text">
                  iFrame-Code per E-Mail — auf jeder Website einfügen, fertig. Kein Entwickler nötig.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={{ background: "#0f1a14" }}>
        <div className="tl-wrap">
          <div className="tl-header">
            <div className="tl-label">Wie es funktioniert</div>
            <h2 className="tl-headline">Vom Besucher zur Beratungsanfrage</h2>
            <p className="tl-sub">
              Egal ob Website, Link oder QR-Code —<br />
              der Ablauf ist immer gleich.
            </p>
          </div>

          <div className="tl-items">
            <div className="tl-line" />

            {[
              {
                num: "01",
                label: "Einbindung",
                title: "Tool auf Ihrer Website platzieren",
                desc: "Ein Tool auswählen, mit Ihrem Namen und Ihrer Farbe anpassen — per iFrame auf jeder Website einbetten. Kein Entwickler nötig.",
              },
              {
                num: "02",
                label: "Kundenerlebnis",
                title: "Kunde startet das Tool",
                desc: "In 3 Minuten beantwortet der Kunde einfache Fragen zu seiner Situation — ohne Fachwissen, ohne Tarifvergleich.",
              },
              {
                num: "03",
                label: "Ergebnis",
                title: "Kunde sieht seine Lücke",
                desc: "Am Ende steht eine klare Zahl — Rentenlücke, Einkommenseinbruch oder Versorgungslücke. Handlungsbedarf in Euro, nicht in Produktlisten.",
              },
              {
                num: "04",
                label: "Lead",
                title: "Anfrage geht direkt an Sie",
                desc: "Der Kunde fragt ein Gespräch an — direkt an Ihre E-Mail. Kein Portal, kein Umweg, keine Provision an Dritte.",
              },
            ].map((step) => (
              <div key={step.num} className="tl-item">
                <div className="tl-num">{step.num}</div>
                <div className="tl-right">
                  <div className="tl-step-label">{step.label}</div>
                  <div className="tl-title">{step.title}</div>
                  <div className="tl-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="s checks-section checks-section--dark" style={{ background: "#ffffff" }}>
        <div className="inner">
          <div className="s-label">Die 8 Tools</div>
          <h2 className="checks-section-headline">
            8 Bedarfsrechner — für jeden Anlass einer
          </h2>
          <p className="checks-section-tagline">
            Jeder Rechner führt den Besucher in<br />
            3 Minuten zur Anfrage.
          </p>
          <div className="ck-cards">
            {CHECK_FLOW_META.map((c) => {
              const tmpl = KATALOG.find((t) => t.slug === c.slug);
              return (
                <div key={c.slug} className="ck-card">
                  <div className="ck-card-preview">
                    <CheckFlowPhoneMock slug={c.slug} />
                  </div>
                  <div className="ck-card-right">
                    <div>
                      <div className={`ck-card-cat ${c.catClass}`}>{c.cat}</div>
                      <div className="ck-card-name">{c.name}</div>
                      <div className="ck-card-context">{c.context}</div>
                      <p className="ck-card-erlebnis">{c.erlebnis}</p>
                    </div>
                    <div className="ck-card-foot">
                      <div className="ck-card-price">
                        {c.price} € <small>einmalig</small>
                      </div>
                      <div className="ck-card-btns">
                        <button
                          type="button"
                          className="ck-demo"
                          disabled={!tmpl}
                          onClick={() => tmpl && setDemoT(tmpl)}
                        >
                          Demo
                        </button>
                        <button
                          type="button"
                          className="ck-buy"
                          disabled={!tmpl}
                          onClick={() => tmpl && setBuyT(tmpl)}
                        >
                          Kaufen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="einsatz" className="dark-s">
        <div className="inner">
          <div className="s-label">Einsatz</div>
          <h2>Mehr Anfragen — auf drei Wegen</h2>
          <p className="s-sub">
            Fertige Bedarfsrechner die Sie auf Ihrer Website einbetten, als Link teilen oder als QR-Code drucken
            können.
          </p>
          <div className="use-grid use-grid--single">
            {[
              {
                t: "iFrame einbetten",
                p: "Direkt auf Ihrer Website — ein Code-Snippet genügt.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <rect
                      x="1"
                      y="2"
                      width="12"
                      height="9"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5 6l-2 1.5L5 9M9 6l2 1.5L9 9"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
              },
              {
                t: "Als Link teilen",
                p: "Per E-Mail, WhatsApp oder in der Social-Media-Bio.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M6.5 9.5a2.5 2.5 0 0 1 0-3.5l2-2a2.5 2.5 0 0 1 3.5 3.5l-1 1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.5 6.5a2.5 2.5 0 0 1 0 3.5l-2 2a2.5 2.5 0 0 1-3.5-3.5l1-1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
              },
              {
                t: "QR-Code drucken",
                p: "Auf Visitenkarte oder Flyer — Kunde scannt und startet.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path
                      d="M10 10h1.5v1.5H10V10zm2.5 0H14v1.5h-1.5V10zM10 12.5h1.5V14H10v-1.5zm2.5 0H14V14h-1.5v-1.5z"
                      fill="currentColor"
                    />
                  </svg>
                ),
              },
            ].map((u) => (
              <div
                key={u.t}
                className="use-card"
                style={{
                  border: "1px solid rgba(184,136,74,0.3)",
                  background: "rgba(184,136,74,0.06)",
                }}
              >
                <div className="use-icon">{u.icon}</div>
                <h3>{u.t}</h3>
                <p>{u.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="s faq-section" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div className="s-label">FAQ</div>
          <h2>Häufige Fragen</h2>
          <div className="faq">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className={`faq-row${faqOpen === i ? " open" : ""}`}>
                <div
                  className="faq-q"
                  role="button"
                  tabIndex={0}
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFaqOpen(faqOpen === i ? null : i);
                    }
                  }}
                >
                  {item.q}
                  <div className="faq-ico">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path
                        d="M5 2v6M2 5h6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-s">
        <div className="cta-left">
          <h2>
            Ihr nächster Lead wartet auf
            <br />
            einen Rechner.
          </h2>
          <p>Verwandeln Sie Website-Besucher in echte Anfragen. Einmalig kaufen, dauerhaft nutzen.</p>
        </div>
        <div className="cta-right">
          <a href="#tools" className="btn-primary-lg">
            Tools ansehen
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="#tools" className="btn-wh">
            Demo ansehen
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-logo">
          <div className="logo-mark" style={{ width: 20, height: 20, borderRadius: 5 }}>
            <LogoMarkSm />
          </div>
          FlowLeads
        </div>
        <div className="footer-links">
          <Link href="/">Startseite</Link>
          <a href="#tools">Tools</a>
          <a href="#how">Wie es funktioniert</a>
          <a href="#faq">FAQ</a>
          <a href="#">Kontakt</a>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </div>
        <span className="footer-copy">© 2026 FlowLeads</span>
      </footer>

      <LandingModalsPortal>
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
      </LandingModalsPortal>
    </div>
  );
}
