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

const BENEFITS = [
  { title: "Einmal kaufen", desc: "Keine laufenden Kosten. Kein Abo. Sie kaufen einmal und nutzen den Check dauerhaft." },
  { title: "Sofort einsetzbar", desc: "Kein Setup notwendig. Per iFrame auf jeder Website in Minuten live." },
  { title: "Leads direkt bei Ihnen", desc: "Keine Plattform dazwischen. Anfragen kommen direkt in Ihr Postfach." },
  { title: "Mobile-first", desc: "Optimiert für Smartphone. Weil Ihre Kunden dort sind." },
  { title: "Schnell angepasst", desc: "Farbe, Name und Kontaktdaten ändern — fertig. Ihr Branding, Ihre Microsite." },
  { title: "Besserer Einstieg", desc: "Gespräche starten nicht bei null — Ihre Kunden kommen mit konkretem Kontext." },
];

const USE_CASES = [
  {
    title: "Auf Ihrer Website eingebunden",
    sub: "Direkt als Teil Ihrer Seite — ohne Weiterleitung, ohne fremdes Branding.",
  },
  {
    title: "Im Gespräch per QR-Code",
    sub: "Zeigen Sie dem Kunden den Check direkt auf dem Tisch — schneller Einstieg, klarer Rahmen.",
  },
  {
    title: "Als Zielseite für Kampagnen",
    sub: "Für Anzeigen oder Newsletter — jeder Check ist eine eigenständige Landingpage.",
  },
  {
    title: "Für Neukunden und Bestand",
    sub: "Erstgespräch oder Jahresgespräch — je nach Check und Anlass.",
  },
];

const VERTRIEB_BLOCKS = [
  {
    nr: "01",
    titel: "Neue Kunden online gewinnen",
    text: "Kunden starten eigenständig eine Microsite und erkennen ihren Bedarf. Sie erhalten eine qualifizierte Anfrage statt eines unvorbereiteten Erstgesprächs.",
    checks: ["Einkommens-Check", "Vorsorge-Check", "GKV vs. PKV"],
    accent: "#1D4ED8",
  },
  {
    nr: "02",
    titel: "Bestandskunden gezielt ansprechen",
    text: "Veränderungen im Leben Ihrer Kunden führen automatisch zu neuen Beratungsanlässen — ohne dass Sie aktiv nachfassen müssen.",
    checks: ["Lebenssituations-Check", "Versicherungs-Check"],
    accent: "#6D28D9",
  },
  {
    nr: "03",
    titel: "Gespräche effizient zum Abschluss führen",
    text: "Kunden kommen mit einer konkreten Situation und einer ersten Einschätzung. Sie steigen direkt in die Lösung ein — ohne lange Einleitung.",
    checks: ["Risikoleben-Check", "Pflege-Check", "Immobilien-Check"],
    accent: "#C2410C",
  },
];

function LandingModalsPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function LandingHome() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [demoT, setDemoT] = useState<Template | null>(null);
  const [buyT, setBuyT] = useState<Template | null>(null);
  const [vertriebHover, setVertriebHover] = useState<number | null>(null);
  const demoTRef = useRef<Template | null>(null);
  demoTRef.current = demoT;

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
          <a href="#tools">Checks</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-right">
          <a href="#tools" className="btn-cta">Demo starten</a>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero">
          {/* Text */}
          <div className="hero-text">
            <div className="hero-badge au d1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Für Versicherungsmakler &amp; -vermittler
            </div>

            <h1 className="au d2">
              Mehr Anfragen mit fertigen Microsites
            </h1>

            <p className="hero-sub au d3">
              Für konkrete Beratungssituationen im Versicherungsvertrieb.
              Einfach einbinden und flexibel einsetzen.
            </p>

            <p className="hero-meta au d3">Für Neukunden und Bestand</p>

            <div className="hero-btns au d4">
              <a href="#tools" className="btn-primary-lg">
                Demo starten
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <p className="hero-micro au d4">Keine Anmeldung · sofort testen</p>

            <div className="hero-proof au d4">
              {["Einmalig kaufen", "In 5 Minuten eingebunden", "Leads direkt per E-Mail"].map((t) => (
                <div key={t} className="hero-proof-item">
                  <div className="hero-proof-dot" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Phone Mocks */}
          <div className="hero-visual au d3">
            <div className="hero-mock-primary">
              <CheckFlowPhoneMock slug="einkommens-check" />
            </div>
            <div className="hero-mock-secondary">
              <CheckFlowPhoneMock slug="vorsorge-check" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────────────── */}
      <section className="story-section">
        <div className="story-inner fade-up">
          <div className="s-label">Das Problem</div>
          <h2 className="story-h2">Der Einstieg passiert heute zu spät</h2>
          <p className="story-big">
            Die eigentliche Situation Ihrer Kunden wird oft erst im Gespräch klar.
            Bis dahin bleibt vieles allgemein — und Sie beginnen immer wieder bei null.
          </p>
          <p className="story-small">
            Ob Erstgespräch oder Bestand:<br />
            Ohne strukturierten Einstieg fehlt oft der konkrete Anlass.
          </p>
          <div className="story-highlight">
            <p className="story-highlight-main">
              FlowLeads verlagert diesen Einstieg nach vorne.
            </p>
            <p className="story-highlight-sub">
              Ihre Kunden gehen ihre Situation selbst durch und kommen mit einer klareren Ausgangssituation auf Sie zu.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how" className="how-section">
        <div className="how-header fade-up">
          <div className="s-label">So funktioniert es</div>
          <h2 className="how-h2">Drei Schritte zum qualifizierten Lead</h2>
        </div>
        <div className="how-steps">
          {[
            {
              num: "01",
              title: "Kunde startet",
              desc: "Über Website, QR-Code oder Link. Ohne Login, ohne Hürde.",
            },
            {
              num: "02",
              title: "Microsite führt durch die Situation",
              desc: "Der Kunde versteht, was für ihn relevant ist. Ohne Fachbegriffe.",
            },
            {
              num: "03",
              title: "Anfrage bei Ihnen",
              desc: "Sie erhalten Kontaktdaten und Ausgangssituation — nicht nur eine Anfrage, sondern Kontext.",
            },
          ].map((step, i) => (
            <div
              key={step.num}
              className="how-step fade-up"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="how-step-ghost">{step.num}</div>
              <div className="how-step-num">{step.num}</div>
              <div className="how-step-title">{step.title}</div>
              <div className="how-step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHECKS ────────────────────────────────────────────────────────── */}
      <section id="tools" className="checks-section">
        <div className="inner">
          <div className="s-label fade-up">8 fertige Microsites</div>
          <h2 className="checks-section-headline fade-up d1">
            Microsites für Ihre wichtigsten<br />Beratungssituationen
          </h2>
          <p className="checks-section-tagline fade-up d2">
            Jede Microsite bildet einen konkreten Anlass im Vertrieb ab.
          </p>
          <div className="ck-cards">
            {CHECK_FLOW_META.map((c, i) => {
              const tmpl = KATALOG.find((t) => t.slug === c.slug);
              return (
                <div
                  key={c.slug}
                  className="ck-card fade-up"
                  style={{ transitionDelay: `${(i % 2) * 0.08}s` }}
                >
                  <div className="ck-card-preview">
                    <CheckFlowPhoneMock slug={c.slug} />
                  </div>
                  <div className="ck-card-right">
                    <div>
                      <div className={`ck-card-cat ${c.catClass}`}>{c.cat}</div>
                      <div className="ck-card-name">{c.name}</div>
                      <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.6, marginBottom: "12px" }}>
                        {c.erlebnis}
                      </p>
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                          Ihr Vorteil im Vertrieb
                        </span>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#1F2937", lineHeight: 1.5, margin: 0 }}>
                          {c.benefit}
                        </p>
                      </div>
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

      {/* ── VERTRIEB-EINSATZ ──────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: "56px" }}>
            <div className="s-label">Einsatz im Vertrieb</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: "700", color: "#111", letterSpacing: "-0.5px", lineHeight: 1.2, marginTop: "8px", marginBottom: "12px" }}>
              So setzen Sie Microsites<br />in Ihrem Vertrieb ein
            </h2>
            <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.65, maxWidth: "520px" }}>
              Jede Microsite ist auf eine konkrete Beratungssituation ausgelegt — vom ersten Kontakt bis zum Abschluss.
            </p>
          </div>

          {/* 3 Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {VERTRIEB_BLOCKS.map((block, i) => {
              const hov = vertriebHover === i;
              return (
                <div
                  key={block.nr}
                  className="fade-up"
                  style={{ transitionDelay: `${i * 0.09}s` }}
                  onMouseEnter={() => setVertriebHover(i)}
                  onMouseLeave={() => setVertriebHover(null)}
                >
                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "14px",
                      padding: "28px 32px",
                      background: "#fff",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "24px",
                      alignItems: "start",
                      cursor: "default",
                      transition: "box-shadow 0.22s ease, transform 0.22s ease",
                      boxShadow: hov ? "0 8px 32px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                      transform: hov ? "translateY(-2px)" : "translateY(0)",
                    }}
                  >
                    {/* Left: number + content */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: block.accent, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                        {block.nr}
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px", lineHeight: 1.25, marginBottom: "10px" }}>
                        {block.titel}
                      </div>
                      <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.65, margin: 0, maxWidth: "540px" }}>
                        {block.text}
                      </p>
                    </div>

                    {/* Right: check list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0, minWidth: "170px" }}>
                      {block.checks.map((c) => (
                        <div
                          key={c}
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            padding: "5px 12px",
                            border: "1px solid #F3F4F6",
                            borderRadius: "6px",
                            background: "#FAFAF8",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────────────────────── */}
      <section className="use-cases-section">
        <div className="use-cases-inner">
          <div className="use-cases-left fade-up">
            <div className="s-label">Einsatz</div>
            <h2 className="use-cases-h2">
              Einsetzbar in Ihrem<br />gesamten Vertrieb
            </h2>
          </div>
          <div className="use-cases-list fade-up d1">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="use-case-item">
                <div className="use-case-title">{uc.title}</div>
                <div className="use-case-sub">{uc.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────────────────────── */}
      <section className="benefits-section s">
        <div className="inner">
          <div className="s-label fade-up">Warum FlowLeads</div>
          <h2 className="benefits-h2 fade-up d1">
            Warum FlowLeads<br />funktioniert
          </h2>
          <div className="benefits-grid">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                className="benefit-card fade-up"
                style={{ transitionDelay: `${(i % 3) * 0.07}s` }}
              >
                <div className="benefit-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="benefit-title">{b.title}</div>
                <div className="benefit-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <div className="fade-up">
            <div className="s-label">FAQ</div>
            <h2 className="faq-h2">Häufige Fragen</h2>
            <p className="faq-sub">Alles Wichtige auf einen Blick.</p>
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
      <section className="cta-final">
        <div className="cta-final-inner">
          <div className="cta-final-eyebrow">Los geht&apos;s</div>
          <h2 className="cta-final-h2">
            Starten Sie mit Ihrer<br />ersten Microsite
          </h2>
          <p className="cta-final-sub">
            Wählen Sie den passenden Check und setzen Sie ihn direkt ein.
          </p>
          <div className="cta-final-btns">
            <a href="#tools" className="btn-primary-lg">
              Demo starten
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className="cta-final-proof">
            {["Einmalig kaufen · kein Abo", "Direkt per iFrame einbinden", "Leads direkt in Ihr Postfach"].map((t) => (
              <div key={t} className="cta-proof-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7l3.5 3.5L12 3" stroke="#b8884a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer>
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-mark" style={{ width: 22, height: 22, borderRadius: 6, background: "#1F2937", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <rect x=".5" y=".5" width="3.5" height="3.5" rx=".6" fill="white"/>
                <rect x="6" y=".5" width="3.5" height="3.5" rx=".6" fill="white" opacity=".5"/>
                <rect x=".5" y="6" width="3.5" height="3.5" rx=".6" fill="white" opacity=".5"/>
                <rect x="6" y="6" width="3.5" height="3.5" rx=".6" fill="white"/>
              </svg>
            </div>
            FlowLeads
          </div>
          <div className="footer-tagline">Digitale Erstberatung für Versicherungsmakler.</div>
        </div>
        <div className="footer-links">
          <Link href="/">Startseite</Link>
          <a href="#tools">Checks</a>
          <a href="#how">Wie es funktioniert</a>
          <a href="#faq">FAQ</a>
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
