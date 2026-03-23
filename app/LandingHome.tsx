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
          accentColor: form.akzentfarbe,
          templateName: template.name,
          headline: form.headline,
          unterzeile: form.unterzeile,
          cta: form.cta,
          danke: form.danke,
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
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="1" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" />
              <rect x="9.5" y="1" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4" />
              <rect x="1" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" opacity="0.4" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" rx=".8" fill="#b8884a" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.3px",
              color: "#1a1a1a",
            }}
          >
            FlowLeads
          </span>
        </div>
        <div className="nav-links">
          <a href="#how">So funktioniert&apos;s</a>
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
            Für Versicherungsmakler
          </div>

          <h1 className="au d2">
            Ihre Website bringt keine Anfragen?
            <br />
            Dann fehlt unser <span className="hero-moment-flow">Leadmagnet</span>.
          </h1>

          <p className="hero-sub au d3">
            FlowLeads sorgt dafür, dass Kunden ihre Lücke selbst erkennen — und genau in diesem Moment aktiv Beratung anfragen.
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
              So funktioniert&apos;s
            </a>
          </div>

          <div className="vt-wrap au d4">
            <div className="vt-label">Warum FlowLeads</div>
            <h2 className="vt-h2">
              Der einfachste Weg
              <br />
              zu mehr Anfragen
            </h2>

            {[
              {
                badge: "Kein Abo",
                title: "Einmalig kaufen — dauerhaft nutzen",
                desc: "Kein Abo, keine Plattformgebühren, keine monatlichen Kosten. Einmal kaufen und dauerhaft auf Ihrer Website einsetzen.",
              },
              {
                badge: "Direkt",
                title: "Leads gehen direkt an Sie",
                desc: "Keine Plattform, kein Portal, keine Provision. Anfragen landen direkt in Ihrem Postfach.",
              },
              {
                badge: "5 Minuten",
                title: "In Minuten live",
                desc: "iFrame-Code nach dem Kauf per E-Mail — auf jeder Website einfügen, fertig. Kein Entwickler nötig.",
              },
              {
                badge: "Mobile",
                title: "Mobile-first entwickelt",
                desc: "Alle Tools sind für Smartphone optimiert — wo die meisten Ihrer Kunden sind.",
              },
              {
                badge: "8 Tools",
                title: "Für jeden Anlass das passende Tool",
                desc: "Von Neukunden bis Bestandskunden, von BU bis Immobilien — für jeden Gesprächsanlass gibt es das passende Tool.",
              },
            ].map((item) => (
              <div key={item.badge} className="vt-row">
                <div className="vt-badge">{item.badge}</div>
                <div className="vt-content">
                  <div className="vt-title">{item.title}</div>
                  <div className="vt-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" style={{ background: "#0f1a14" }}>
        <div className="tl-wrap">
          <div className="tl-header">
            <div className="tl-label">So funktioniert&apos;s</div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(26px, 3.2vw, 40px)",
                fontWeight: 400,
                color: "#ffffff",
                letterSpacing: "-.3px",
                lineHeight: 1.15,
                marginBottom: "10px",
              }}
            >
              Vom Besucher zur
              <br />
              Beratungsanfrage
            </h2>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              In 4 Schritten — ohne Kaltstart, ohne Tarifvergleich.
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
                badge: "WordPress · Jimdo · Webflow · Wix",
              },
              {
                num: "02",
                label: "Kundenerlebnis",
                title: "Kunde startet das Tool",
                desc: "In 3 Minuten beantwortet der Kunde einfache Fragen zu seiner Situation — ohne Fachwissen, ohne Tarifvergleich.",
                badge: "Mobile-first · Touch-optimiert",
              },
              {
                num: "03",
                label: "Ergebnis",
                title: "Kunde sieht seine Lücke",
                desc: "Am Ende steht eine klare Zahl — Rentenlücke, Einkommenseinbruch oder Versorgungslücke. Handlungsbedarf in Euro, nicht in Produktlisten.",
                badge: "Konkret · Personalisiert · Verständlich",
              },
              {
                num: "04",
                label: "Lead",
                title: "Anfrage geht direkt an Sie",
                desc: "Der Kunde fragt ein Gespräch an — direkt an Ihre E-Mail. Kein Portal, kein Umweg, keine Provision an Dritte.",
                badge: "Direkt · Qualifiziert · Kein Kaltstart",
              },
            ].map((step) => (
              <div key={step.num} className="tl-item">
                <div className="tl-num">{step.num}</div>
                <div className="tl-right">
                  <div className="tl-step-label">{step.label}</div>
                  <div className="tl-title">{step.title}</div>
                  <div className="tl-desc">{step.desc}</div>
                  <div className="tl-badge">
                    <div className="tl-badge-dot" />
                    {step.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="s checks-section" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div className="s-label">Die 8 Tools</div>
          <h2 className="checks-section-headline">
            8 Tools, die aus Interesse
            <br />
            konkrete Anfragen machen
          </h2>
          <p className="checks-section-tagline">
            Jedes Tool greift einen echten Anlass auf – und führt den Kunden mit wenigen Schritten ins Gespräch.
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
          <h2>
            Überall einsetzbar —
            <br />
            nicht nur die Startseite
          </h2>
          <p className="s-sub">Auf jeder Seite, für jeden Anlass, für jeden Kanal.</p>
          <div className="use-grid">
            {[
              {
                t: "Website",
                p: "Direkt nach dem Hero — Besucher werden sofort zu Leads.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="1" y="2" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                t: "Produktseiten",
                p: "BU-Seite mit Einkommens-Check, Rentenvorsorge mit Vorsorge-Check.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 10l-3.1 1.5.6-3.5L3 5.5l3.5-.5z"
                      fill="currentColor"
                      opacity=".6"
                    />
                  </svg>
                ),
              },
              {
                t: "Kampagnen",
                p: "Für Google Ads, Meta oder E-Mail mit konkretem Anlass.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                    <path
                      d="M5.5 8l2 2L10.5 6"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                t: "Bestandskunden",
                p: "Check-Link per E-Mail — reaktiviert ohne Kaltakquise.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M2 4h12v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                t: "Erstgespräch",
                p: "Strukturierter Einstieg — digital, modern, direkt.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M8 3v4l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                ),
              },
              {
                t: "Social Media",
                p: "Link in Bio, Stories oder Beiträgen als Lead-Magnet.",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="3" y="1" width="6" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M6 13h7M10 4v9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((u) => (
              <div key={u.t} className="use-card">
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
            Entdecken Sie die
            <br />
            <span className="underline-w">Möglichkeiten</span> von FlowLeads
          </h2>
          <p>Verwandeln Sie Website-Besucher in echte Anfragen. Einmalig kaufen, dauerhaft nutzen.</p>
        </div>
        <div className="cta-right">
          <a href="#tools" className="btn-gold">
            Tools ansehen
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
          <a href="#how">Setup</a>
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
