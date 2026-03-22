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
    q: "Wie baue ich den Check ein?",
    a: "Per iFrame — einfach kopieren und einfügen. Nach dem Kauf erhalten Sie per E-Mail einen personalisierten Einbettungscode mit Ihrem Namen, Ihrer Farbe und Ihren Kontaktdaten.",
  },
  {
    q: "Wohin gehen die Leads?",
    a: "Direkt an Sie. Die Anfrage geht per E-Mail an die Adresse, die Sie beim Kauf angegeben haben. Kein Portal, kein Umweg.",
  },
  {
    q: "Wer ist für die Einbindung und Datenverarbeitung verantwortlich?",
    a: "Die Checks werden auf der Website des jeweiligen Maklers eingebunden. Anfragen gehen direkt an den jeweiligen Anbieter. Die konkrete rechtliche Einbindung und Datenschutzhinweise erfolgen daher über dessen Website.",
  },
  {
    q: "Funktioniert das auf dem Handy?",
    a: "Ja — alle Checks sind mobile-first entwickelt und auf Touch-Bedienung optimiert. Die meisten Ihrer Kunden werden den Check auf dem Smartphone nutzen.",
  },
  {
    q: "Kann ich Design und Inhalte anpassen?",
    a: "Ja — Farben, Name und Kontaktdaten sind individuell anpassbar. Der Check erscheint dann in Ihrem Look.",
  },
  {
    q: "Gibt es Folgekosten oder ein Abo?",
    a: "Nein — Sie zahlen einmalig und nutzen den Check dauerhaft. Kein Abo, keine monatlichen Kosten, keine versteckten Gebühren.",
  },
  {
    q: "Brauche ich eine eigene Website?",
    a: "Nein — die Checks lassen sich auf jeder bestehenden Website einbinden. Das funktioniert auf Jimdo, Squarespace, WordPress und den meisten Baukastensystemen.",
  },
];

const WHY_FLOWLEADS_CARDS: {
  title: string;
  desc: string;
  highlight: string;
  icon: ReactNode;
}[] = [
  {
    title: "Keine Plattform. Keine Umwege. Deine Anfrage.",
    desc: "Der Kunde landet direkt bei dir – ohne Zwischenanbieter.",
    highlight: "Kein Wettbewerb, keine Lead-Verluste.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 6h16v12H4V6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M4 9l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Passt in jede Website – ohne Aufwand",
    desc: "Einfach per iFrame einbinden und sofort nutzen.",
    highlight: "Kein Projekt, keine Technik.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Optimiert für echte Nutzung – nicht nur für Desktop",
    desc: "Deine Kunden nutzen den Check mobil, schnell und intuitiv.",
    highlight: "Genau dort, wo Entscheidungen entstehen.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Einmal einrichten – dauerhaft nutzen",
    desc: "Kein Abo, keine laufenden Kosten.",
    highlight: "Einmal kaufen, immer einsetzen.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 6v6l4 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const HOW_FLOW_STEPS: {
  step: string;
  micro?: string;
  title: string;
  desc: string;
  highlight: string;
}[] = [
  {
    step: "01",
    micro: "Input",
    title: "Sie wählen den passenden Check",
    desc: "Für Neukunden, Bestandskunden\noder konkrete Anlässe.",
    highlight: "Jeder Check ist auf einen klaren Einsatz gebaut.",
  },
  {
    step: "02",
    micro: "Ergebnis",
    title: "Sie machen ihn zu Ihrem eigenen",
    desc: "Name, Farben und Kontaktdaten eintragen.",
    highlight: "Der Check sieht aus wie Teil Ihrer Website.",
  },
  {
    step: "03",
    micro: "Anfrage",
    title: "Sie fügen ihn einfach ein",
    desc: "Per iFrame auf Ihrer Website oder Landingpage.",
    highlight: "Einmal einbauen – sofort live.",
  },
  {
    step: "04",
    title: "Ihre Kunden stellen die Anfrage",
    desc: "Der Kunde versteht seine Situation\nund meldet sich aktiv bei Ihnen.",
    highlight: "Kein Nachfassen. Kein Überreden.",
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
          domain: form.website,
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
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
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
          <a href="#checks">Checks</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-right">
          <a href="#faq" className="btn-ghost">
            Fragen?
          </a>
          <a href="#checks" className="btn-cta">
            Checks ansehen
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
            <a href="#checks" className="btn-primary-lg">
              Checks ansehen
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

          <div className="why-flowleads au d4">
            <h2 className="why-flowleads-title">Warum FlowLeads funktioniert</h2>
            <p className="why-flowleads-scroll-hint" aria-hidden>
              Weiter →
            </p>
            <div className="why-cards-scroll">
              {WHY_FLOWLEADS_CARDS.map((card) => (
                <div key={card.title} className="why-card">
                  <div className="why-card-ico" aria-hidden>
                    {card.icon}
                  </div>
                  <h3 className="why-card-headline">{card.title}</h3>
                  <p className="why-card-desc">{card.desc}</p>
                  <p className="why-card-highlight">👉 {card.highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="s how-flow-section" style={{ background: "var(--surface)" }}>
        <div className="inner">
          <div className="s-label">So funktioniert&apos;s</div>
          <h2 className="how-flow-h2">In wenigen Minuten auf Ihrer Website – ohne Technikstress</h2>
          <p className="how-flow-sub">Kein Entwickler. Kein Projekt. Kein Setup-Chaos.</p>
          <div className="how-flow-cards-row">
            {HOW_FLOW_STEPS.map((row, i) => (
              <div key={row.step} className="how-flow-step">
                <div className="how-flow-card">
                  <div className="how-flow-card-top">
                    <span className="how-flow-num">{row.step}</span>
                    {row.micro ? (
                      <span className={`how-flow-micro how-flow-micro--pulse how-flow-micro--i${i}`}>
                        {row.micro}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="how-flow-title">{row.title}</h3>
                  <p className="how-flow-body">{row.desc}</p>
                  <p className="how-flow-highlight">👉 {row.highlight}</p>
                </div>
                {i < HOW_FLOW_STEPS.length - 1 ? (
                  <span className="how-flow-arrow" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="checks" className="s checks-section" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div className="s-label">Die 8 Checks</div>
          <h2 className="checks-section-headline">
            8 Checks, die aus Interesse
            <br />
            konkrete Anfragen machen
          </h2>
          <p className="checks-section-tagline">
            Jeder Check greift einen echten Anlass auf – und führt den Kunden mit wenigen Schritten ins Gespräch.
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

      <section className="s legal-compact-section" style={{ background: "var(--bg)" }} aria-labelledby="legal-compact-heading">
        <div className="inner">
          <div className="legal-compact-card">
            <h3 id="legal-compact-heading" className="legal-compact-title">
              Einfach eingebunden, direkt bei Ihnen
            </h3>
            <p className="legal-compact-line">Die Checks werden per iFrame auf Ihrer Website eingebunden.</p>
            <p className="legal-compact-line">Anfragen gehen direkt an Sie.</p>
            <p className="legal-compact-line">
              Die datenschutzrechtliche Einbindung erfolgt über Ihre Website und Ihre Datenschutzhinweise.
            </p>
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
          <a href="#checks" className="btn-gold">
            Checks ansehen
          </a>
          <a href="#checks" className="btn-wh">
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
          <a href="#checks">Checks</a>
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
