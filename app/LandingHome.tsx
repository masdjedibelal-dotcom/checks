"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { scrollCheckDocumentToTop } from "@/lib/checkScrollToTop";
import { KATALOG, type Template } from "@/lib/katalog";
import {
  CHECK_FLOW_META,
  CheckFlowPhoneMock,
  type CheckFlowSlug,
} from "./check-flow-checks";

/** Landing-Karten mit Raster-Mockup statt CSS-Phone */
const CK_CARD_RASTER: Partial<
  Record<CheckFlowSlug, { src: string; alt: string }>
> = {
  "immobilien-check": {
    src: "/images/ck-card-immobilien-check.png",
    alt: "Immo-Schutz-Dach: Vorschau auf dem Smartphone",
  },
  "lebenssituations-check": {
    src: "/images/ck-card-jahresgespraech.png",
    alt: "Lebenssituations-Check: Anlässe, Status-Karten und Ergebnis-CTA auf dem Smartphone",
  },
  "einkommens-check": {
    src: "/images/ck-card-einkommens-check.png",
    alt: "Einkommens-Check: Vorschau mit Betrag, Balken und Handlungsimpuls auf dem Smartphone",
  },
  "gkv-pkv": {
    src: "/images/ck-card-gkv-pkv.png",
    alt: "KV-Navigator: GKV vs. PKV mit Beitragsvergleich und Ersparnis auf dem Smartphone",
  },
  "vorsorge-check": {
    src: "/images/ck-card-vorsorge-check.png",
    alt: "Vorsorge-Check: Rentenlücke mit Betrag, Schichten-Balken und Strategieauswahl auf dem Smartphone",
  },
  risikoleben: {
    src: "/images/ck-card-risikoleben.png",
    alt: "Risikoleben: Familienabsicherung mit empfohlener Versicherungssumme auf dem Smartphone",
  },
  "pflege-check": {
    src: "/images/ck-card-pflege-check.png",
    alt: "Pflege-Check: monatliche Eigenbelastung und Ergebnisübersicht auf dem Smartphone",
  },
  bedarfscheck: {
    src: "/images/ck-card-bedarfscheck.png",
    alt: "Versicherungs-Check: Absicherungspakete mit Stufen und Kennzeichnung auf dem Smartphone",
  },
};
import { VertriebCardVisual } from "./VertriebCardVisuals";
import DemoModal from "@/components/ui/DemoModal";
import KonfiguratorOverlay, {
  type KonfiguratorForm,
} from "@/components/ui/KonfiguratorOverlay";

const FAQ_ITEMS = [
  {
    q: "Wie baue ich die Microsite ein?",
    a: "Per iFrame — einfach kopieren und einfügen. Nach dem Kauf erhalten Sie per E-Mail einen personalisierten Einbettungscode mit Ihrem Namen, Ihrer Farbe und Ihren Kontaktdaten.",
  },
  {
    q: "Wohin gehen die Leads?",
    a: "Direkt an Sie. Die Anfrage geht per E-Mail an die Adresse, die Sie beim Kauf angegeben haben. Kein Portal, kein Umweg.",
  },
  {
    q: "Wer ist für die Einbindung und Datenverarbeitung verantwortlich?",
    a: "Die Microsites werden auf der Website des jeweiligen Maklers eingebunden. Anfragen gehen direkt an den jeweiligen Anbieter. Die konkrete rechtliche Einbindung und Datenschutzhinweise erfolgen daher über dessen Website.",
  },
  {
    q: "Funktioniert das auf dem Handy?",
    a: "Ja — alle Microsites sind mobile-first entwickelt und auf Touch-Bedienung optimiert. Die meisten Ihrer Kunden werden die Microsite auf dem Smartphone nutzen.",
  },
  {
    q: "Kann ich Design und Inhalte anpassen?",
    a: "Ja — Farben, Name und Kontaktdaten sind individuell anpassbar. Die Microsite erscheint dann in Ihrem Look.",
  },
  {
    q: "Gibt es Folgekosten oder ein Abo?",
    a: "Nein — Sie zahlen einmalig und nutzen die Microsite dauerhaft. Kein Abo, keine monatlichen Kosten, keine versteckten Gebühren.",
  },
  {
    q: "Brauche ich eine eigene Website?",
    a: "Nein — die Microsites lassen sich auf jeder bestehenden Website einbinden. Das funktioniert auf Jimdo, Squarespace, WordPress und den meisten Baukastensystemen.",
  },
];

const WHY_FLOWLEADS_POINTS = [
  "Einmal kaufen, dauerhaft nutzen",
  "Sofort einsetzbar ohne Setup",
  "Leads direkt bei Ihnen",
  "Optimiert für Smartphone",
  "In Minuten angepasst",
  "Klarer Einstieg für jedes Gespräch",
] as const;

const VERTRIEB_BLOCKS = [
  {
    titel: "Neue Kontakte generieren",
    text: "Ihre Microsite wird über Website, Social Media oder QR-Code geteilt und bringt Nutzer dazu, aktiv auf Sie zuzukommen.",
  },
  {
    titel: "Bestandskunden aktivieren",
    text: "Veränderungen im Leben Ihrer Kunden werden zum Anlass, sich wieder bei Ihnen zu melden.",
  },
  {
    titel: "Gespräche vorbereiten",
    text: "Ihre Kunden beschäftigen sich vorab mit ihrer Situation und kommen mit einem konkreten Anliegen.",
  },
];

function LandingModalsPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

const FACTS_CARDS = [
  {
    icon: "trend" as const,
    stat: "2–3x mehr Anfragen",
    body: "Mehr Nutzer starten aktiv eine Anfrage statt passiv zu bleiben.",
  },
  {
    icon: "clock" as const,
    stat: "bis zu 50% weniger Zeit im Erstgespräch",
    body: "Alle relevanten Informationen liegen vor – kein Einstieg bei null.",
  },
  {
    icon: "target" as const,
    stat: "2x höhere Abschlussquote",
    body: "Sie sprechen mit Interessenten, nicht mit unklaren Leads.",
  },
] as const;

function FactsCardIcon({ name }: { name: (typeof FACTS_CARDS)[number]["icon"] }) {
  const svgProps = {
    className: "facts-card-icon-svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };
  if (name === "trend") {
    return (
      <svg {...svgProps}>
        <path
          d="M4 17V7M4 17h16M4 17l5-5 4 4 6-8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M12 7.5V12l3.5 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

const HOW_TIMELINE_STEPS = [
  {
    emoji: "✨",
    title: "Aufmerksamkeit entsteht",
    desc: "Der Nutzer bleibt an einem Thema hängen, das ihn direkt betrifft.",
  },
  {
    emoji: "🔥",
    title: "Interesse wird konkret",
    desc: "Die Microsite macht seine Situation greifbar und zeigt, warum das Thema für ihn relevant ist.",
  },
  {
    emoji: "📩",
    title: "Anfrage wird ausgelöst",
    desc: "Aus einem abstrakten Gedanken wird ein konkreter nächster Schritt und der Nutzer meldet sich bei Ihnen.",
  },
] as const;

function HowAnfragenTimelineSection() {
  const tlRef = useRef<HTMLDivElement>(null);
  const [blockVisible, setBlockVisible] = useState(false);

  useEffect(() => {
    const el = tlRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setBlockVisible(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="how-section">
      <div className="how-section-inner">
        <header className="how-tl-header fade-up">
          <p className="how-tl-eyebrow">Ablauf</p>
          <h2 className="how-h2">So wird aus Interesse eine Anfrage</h2>
          <p className="how-tl-sub">
            Storytelling und interaktive Microsites machen aus erstem Interesse einen klaren Handlungsimpuls.
          </p>
        </header>

        <div
          ref={tlRef}
          className={`how-timeline-block${blockVisible ? " how-timeline-block--visible" : ""}`}
        >
          <div className="how-timeline-wrap">
            <div className="how-timeline-line" aria-hidden>
              <div className="how-timeline-line-fill" />
            </div>

            <div className="how-timeline-steps">
              {HOW_TIMELINE_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`how-tl-step how-tl-step--${i + 1}`}
                  style={
                    {
                      "--how-step-delay": `${0.14 + i * 0.08}s`,
                    } as CSSProperties
                  }
                >
                  <div className="how-tl-step-marker" aria-hidden="true">
                    {step.emoji}
                  </div>
                  <div className="how-tl-step-content">
                    <h3 className="how-tl-content-title">{step.title}</h3>
                    <p className="how-tl-content-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="how-tl-cta-wrap">
            <a href="#tools" className="how-tl-cta">
              Microsites ansehen
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactsSection() {
  return (
    <section className="facts-section" aria-labelledby="facts-heading">
      <div className="facts-inner">
        <p className="facts-bridge fade-up">Für Versicherungsagenturen.</p>
        <h2 id="facts-heading" className="facts-h2 fade-up d1">
          Was das konkret bedeutet
        </h2>
        <p className="facts-sub fade-up d2">
          Klare Ergebnisse für Ihren Vertrieb – messbar im Alltag.
        </p>

        <div className="facts-grid">
          {FACTS_CARDS.map((card, i) => (
            <article
              key={card.stat}
              className="facts-card fade-up"
              style={{ transitionDelay: `${0.05 + i * 0.05}s` }}
            >
              <span className="facts-card-icon" aria-hidden>
                <FactsCardIcon name={card.icon} />
              </span>
              <p className="facts-card-stat">{card.stat}</p>
              <div className="facts-card-rule" aria-hidden />
              <p className="facts-card-body">{card.body}</p>
            </article>
          ))}
        </div>
        <p className="facts-note fade-up d3">
          Angaben orientieren sich an typischer Nutzung im Feld; konkrete Ergebnisse hängen von Ihrem Einsatz ab.
        </p>
      </div>
    </section>
  );
}

export default function LandingHome() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [demoT, setDemoT] = useState<Template | null>(null);
  const [buyT, setBuyT] = useState<Template | null>(null);
  const [ctaFinalReveal, setCtaFinalReveal] = useState(false);
  const ctaFinalRef = useRef<HTMLElement | null>(null);
  const demoTRef = useRef<Template | null>(null);
  demoTRef.current = demoT;

  // Nach Reload oder erneutem Mount der Startseite: immer ganz oben (inkl. #anker / iOS).
  useLayoutEffect(() => {
    scrollCheckDocumentToTop();
  }, []);

  // ── CTA final: bewusstes „Ankommen“ mit kurzer Verzögerung ───────────────
  useEffect(() => {
    const el = ctaFinalRef.current;
    if (!el) return;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        observer.disconnect();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ms = reduceMotion ? 0 : 200;
        delayTimer = setTimeout(() => setCtaFinalReveal(true), ms);
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, []);

  // ── Scroll-triggered fade-up ──────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".flow-leads-landing .fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeDemoModal = () => { setDemoT(null); };
    const openConfig = (slug: unknown) => {
      const fromSlug = typeof slug === "string" && slug.trim()
        ? KATALOG.find((t) => t.slug === slug) : null;
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
      if (!res.ok) { alert(data.error || "Checkout fehlgeschlagen"); return; }
      if (data.url) { window.location.href = data.url; return; }
      alert("Keine Checkout-URL erhalten.");
    } catch {
      alert("Netzwerkfehler beim Checkout.");
    }
  }

  return (
    <div className="flow-leads-landing">

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav className="landing-nav" aria-label="Hauptnavigation">
        <div className="logo">
          <div className="logo-mark">
            <svg
              width="28"
              height="28"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect width="48" height="48" rx="12" fill="#0F172A" />
              <path
                d="M16 14H30V18H20V22H28V26H20V34H16V14Z"
                fill="white"
              />
              <path d="M32 14H36V34H26V30H32V14Z" fill="white" />
            </svg>
          </div>
          <span>FlowLeads</span>
        </div>
        <div className="nav-links">
          <a href="#how">Wie es funktioniert</a>
          <a href="#tools">Microsites</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-right">
          <a href="#tools" className="btn-cta">Microsites ansehen</a>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero">

          {/* Left: Text */}
          <div className="hero-text">
            <h1 className="au d1">
              Mehr Anfragen. Weniger Aufwand. Mehr Abschluss.
            </h1>

            <p className="hero-sub au d2">
              Fertige Microsites mit Rechnern, die Kunden durch ihre Situation führen — mobil,
              individualisiert und überall einsetzbar: QR-Code, Social Media oder direkt auf Ihrer
              Website.
            </p>

            <div className="hero-btns au d3">
              <a href="#tools" className="btn-hero-cta">
                Microsites ansehen
              </a>
            </div>
          </div>

          {/* Right: Hero-Grafik (Smartphone-Mockup) */}
          <div className="hero-visual au d4">
            <div className="hero-float-wrap">
              <div className="hero-phones-clip">
                <Image
                  src="/images/hero_mock.png"
                  alt="FlowLeads Microsite auf dem Smartphone: Check mit Symbolen, Ergebnis 1.840 € und unterer Aktionsleiste"
                  fill
                  priority
                  sizes="(max-width: 960px) min(88vw, 340px), min(calc(50vw - 84px), 360px)"
                  className="hero-phones-img"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <FactsSection />

      {/* ── SO ENTSTEHEN ANFRAGEN (Timeline) ──────────────────────────────── */}
      <HowAnfragenTimelineSection />

      {/* ── CHECKS ────────────────────────────────────────────────────────── */}
      <section id="tools" className="checks-section">
        <div className="inner">
          <div className="s-label fade-up">Acht Microsites</div>
          <h2 className="checks-section-headline fade-up d1">
            Microsites die<br />Anfragen erzeugen
          </h2>
          <div className="checks-section-taglines fade-up d2">
            <p className="checks-section-tagline">
              Jede Microsite bringt Nutzer dazu, sich aktiv mit ihrer Situation zu beschäftigen und den nächsten Schritt zu gehen.
            </p>
            <p className="checks-section-tagline">
              Einmal einsetzen und kontinuierlich neue Kontaktpunkte schaffen.
            </p>
          </div>
          <div className="ck-cards">
            {CHECK_FLOW_META.map((c, i) => {
              const tmpl = KATALOG.find((t) => t.slug === c.slug);
              const raster = CK_CARD_RASTER[c.slug];
              return (
                <div
                  key={c.slug}
                  className="ck-card fade-up"
                  style={{ transitionDelay: `${(i % 2) * 0.05}s` }}
                >
                  <div
                    className={
                      raster
                        ? "ck-card-preview ck-card-preview--raster"
                        : "ck-card-preview"
                    }
                  >
                    {raster ? (
                      <div className="ck-card-raster-clip">
                        <Image
                          src={raster.src}
                          alt={raster.alt}
                          fill
                          sizes="(max-width: 680px) min(92vw, 300px), min(42vw, 300px)"
                          className="ck-card-raster-img"
                        />
                      </div>
                    ) : (
                      <CheckFlowPhoneMock slug={c.slug} />
                    )}
                  </div>
                  <div className="ck-card-right">
                    <div>
                      <div className={`ck-card-cat ${c.catClass}`}>{c.cat}</div>
                      <div className="ck-card-name">{tmpl?.name ?? c.name}</div>
                      <p className="ck-card-hook">{c.hook}</p>
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

      {/* ── EINSATZ IM VERTRIEB (Eyecatcher) ────────────────────────────── */}
      <section className="vertrieb-ec">
        <div className="vertrieb-ec-inner">
          <div className="vertrieb-ec-head fade-up">
            <p className="vertrieb-ec-eyebrow">Einsatz im Vertrieb</p>
            <h2 className="vertrieb-ec-h2">So nutzen Sie Microsites im Alltag</h2>
            <p className="vertrieb-ec-sub">
              Einmal erstellt und flexibel einsetzbar — genau dort, wo Ihre Kunden sind.
            </p>
          </div>

          <div className="vertrieb-ec-grid">
            {VERTRIEB_BLOCKS.map((block, i) => {
              const variant = i === 0 ? "dark" : i === 1 ? "mist" : "soft";
              return (
                <div
                  key={block.titel}
                  className={`vertrieb-ec-card vertrieb-ec-card--${variant} fade-up`}
                  style={{ transitionDelay: `${i * 0.09}s` }}
                >
                  <VertriebCardVisual index={i} />
                  <h3 className="vertrieb-ec-card-title">{block.titel}</h3>
                  <p className="vertrieb-ec-card-text">{block.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WARUM FLOWLEADS — Premium Card ──────────────────────────────── */}
      <section className="benefits-section s">
        <div className="benefits-premium-shell">
          <div className="benefits-premium-card fade-up">
            <svg className="benefits-premium-grad-defs" aria-hidden focusable="false">
              <defs>
                <linearGradient id="fl-premium-check-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ddd6fe" />
                  <stop offset="50%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#99f6e4" />
                </linearGradient>
              </defs>
            </svg>
            <p className="benefits-premium-eyebrow">Warum FlowLeads</p>
            <h2 className="benefits-premium-h2">Mehr Anfragen ohne Setup</h2>
            <div className="benefits-premium-sub">
              <p>
                Alles, was Sie brauchen, um Microsites einzusetzen und Anfragen zu generieren.
              </p>
              <p>Ohne Tools, ohne laufende Kosten, ohne Aufwand.</p>
            </div>

            <h3 className="benefits-premium-list-head">So funktioniert es für Sie</h3>
            <ul className="benefits-premium-list" role="list">
              {WHY_FLOWLEADS_POINTS.map((line) => (
                <li key={line} className="benefits-premium-row">
                  <span className="benefits-premium-row-text">{line}</span>
                  <span className="benefits-premium-check" aria-hidden>
                    <svg
                      className="benefits-premium-check-svg"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 8.2L6.8 11.5L12.5 4.5"
                        stroke="url(#fl-premium-check-stroke)"
                        strokeWidth="1.15"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                </li>
              ))}
            </ul>

            <div className="benefits-premium-divider" aria-hidden />
            <p className="benefits-premium-bottom">
              Einmal integriert — kontinuierlich neue Anfragen
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <div>
            <div className="s-label fade-up">FAQ</div>
            <h2 className="checks-section-headline fade-up d1">Häufige Fragen</h2>
            <div className="checks-section-taglines fade-up d2">
              <p className="checks-section-tagline">Alles Wichtige auf einen Blick.</p>
            </div>
          </div>
          <div className="faq fade-up d1">
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
                      <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section
        ref={ctaFinalRef}
        className={`cta-final${ctaFinalReveal ? " cta-final--reveal" : ""}`}
        aria-labelledby="cta-final-heading"
      >
        <div className="cta-final-inner">
          <div className="s-label cta-final-s-label">Acht Microsites</div>
          <h2 id="cta-final-heading" className="cta-final-h2">
            Starten Sie mit Ihrer ersten Microsite
          </h2>
          <p className="cta-final-sub">
            Wählen Sie die passende Microsite und setzen Sie sie direkt ein.
          </p>
          <div className="cta-final-btn-wrap">
            <a href="#tools" className="btn-cta">
              Microsites ansehen
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER — minimalistisch, nur Orientierung ───────────────────── */}
      <footer className="footer-slim">
        <div className="footer-slim-inner">
          <p className="footer-slim-brand">
            <span className="footer-slim-name">FlowLeads</span>
            <span className="footer-slim-sep" aria-hidden>
              ·
            </span>
            <span className="footer-slim-tag">Digitale Erstberatung für Versicherungsmakler.</span>
          </p>
          <nav className="footer-slim-nav" aria-label="Rechtliches">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/agb">AGB</Link>
          </nav>
          <p className="footer-slim-copy">© 2026 FlowLeads</p>
        </div>
      </footer>

      <LandingModalsPortal>
        <DemoModal
          template={demoT}
          onClose={() => setDemoT(null)}
          onBuy={(t) => { setDemoT(null); setBuyT(t); }}
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
