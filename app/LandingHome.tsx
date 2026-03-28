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

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
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
          <a href="#problem">Warum FlowLeads</a>
          <a href="#how">Wie es funktioniert</a>
          <a href="#tools">Checks</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-right">
          <a href="#faq" className="btn-ghost">
            Fragen?
          </a>
          <a href="#tools" className="btn-cta">
            Checks ansehen
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg)", paddingBottom: 0 }}>
        <div className="hero">
          <div className="hero-tag au d1">
            <span className="tag-dot" />
            Für Versicherungsmakler &amp; -vermittler
          </div>

          <h1 className="au d2">
            Digitale Erstberatung<br />
            für Versicherungsmakler
          </h1>

          <p className="hero-sub au d3">
            Ihre Kunden beantworten die wichtigsten Fragen vor dem Gespräch —<br />
            und kommen mit konkretem Bedarf statt offenen Fragen.
          </p>

          <div className="hero-btns au d4">
            <a href="#tools" className="btn-primary-lg">
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
              So funktioniert es
            </a>
          </div>
        </div>
      </section>

      {/* ── PROBLEM → LÖSUNG ────────────────────────────────────────────────── */}
      <section id="problem" className="s" style={{ background: "#ffffff" }}>
        <div className="inner">
          <div className="prob-sol-grid">

            {/* LEFT: Problem */}
            <div>
              <div className="s-label">Das Problem</div>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", marginBottom: "28px", lineHeight: 1.2 }}>
                Warum Erstgespräche<br />oft ineffizient sind
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Kunden wissen nicht, was sie brauchen",
                  "Grundlagen müssen jedes Mal neu erklärt werden",
                  "Gespräche starten ohne klare Struktur",
                  "Potenzial bleibt ungenutzt",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px 16px",
                      background: "#F8F6F2",
                      borderRadius: "12px",
                      borderLeft: "3px solid rgba(220,38,38,0.25)",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#ef4444", flexShrink: 0, fontWeight: "700", marginTop: "2px" }}>✕</span>
                    <span style={{ fontSize: "14px", color: "#374151", lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Lösung */}
            <div
              style={{
                background: "#F8F6F2",
                borderRadius: "20px",
                padding: "36px 32px",
                border: "1px solid rgba(31,41,55,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#059669",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                Die Lösung
              </div>
              <h3
                style={{
                  fontSize: "clamp(20px, 2.5vw, 26px)",
                  fontWeight: "700",
                  color: "#1F2937",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.25,
                  marginBottom: "16px",
                  fontFamily: "var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                Genau hier setzen<br />die Checks an
              </h3>
              <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: "28px" }}>
                Ihre Kunden beantworten die wichtigsten Fragen selbst —
                Sie starten direkt mit einem klaren Bedarf.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                {[
                  "Kunden qualifizieren sich selbst vor",
                  "Weniger Erklärungsaufwand im Gespräch",
                  "Gespräch startet mit konkretem Bedarf",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#d1fae5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1 4.5l2.5 2.5L8 1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="#tools" className="btn-primary-lg">
                Checks ansehen
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="s" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div className="s-label" style={{ justifyContent: "center" }}>So funktioniert&apos;s</div>
          <h2 style={{ textAlign: "center", marginBottom: "12px" }}>So funktioniert es</h2>
          <p style={{ textAlign: "center", fontSize: "17px", color: "#6B7280", lineHeight: 1.65, maxWidth: "460px", margin: "0 auto 48px" }}>
            Drei Schritte — von der ersten Frage zur qualifizierten Anfrage.
          </p>
          <div className="how-3-grid">
            {[
              {
                num: "01",
                title: "Kunde startet Check",
                sub: "über Link, Website oder QR-Code",
                detail: "Kein Onboarding, kein Login — der Kunde öffnet den Check und legt direkt los.",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 9h5M9 6.5l2.5 2.5L9 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Kunde beantwortet Fragen",
                sub: "strukturierter Ablauf in wenigen Minuten",
                detail: "Einfache, verständliche Fragen. Kein Fachwissen nötig.",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Sie erhalten die Anfrage",
                sub: "mit konkretem Bedarf und Ausgangssituation",
                detail: "Direkt in Ihrem Postfach — kein Portal, kein Umweg.",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path d="M3 6l6 4.5L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(31,41,55,0.07)",
                  borderRadius: "20px",
                  padding: "28px 24px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px", color: "#b8884a", marginBottom: "16px" }}>
                  {step.num}
                </div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(201,169,110,0.12)",
                    border: "1px solid rgba(201,169,110,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b8884a",
                    marginBottom: "16px",
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", letterSpacing: "-0.2px", lineHeight: 1.3, marginBottom: "8px" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#b8884a", marginBottom: "12px" }}>
                  → {step.sub}
                </div>
                <div style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHECKS ──────────────────────────────────────────────────────────── */}
      <section id="tools" className="s checks-section">
        <div className="inner">
          <div className="s-label">8 Gesprächsöffner</div>
          <h2 className="checks-section-headline">
            Ihre wichtigsten Vertriebssituationen<br />
            digital abgedeckt
          </h2>
          <p className="checks-section-tagline">
            Jeder Check ist auf einen konkreten Beratungsanlass ausgelegt.
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
                      <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.6, marginBottom: "10px" }}>
                        {c.erlebnis}
                      </p>
                      <div style={{ borderTop: "1px solid #EAE5DC", paddingTop: "10px", marginTop: "2px" }}>
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
                        {c.price} € <small>einmalig</small> · Ihre Microsite
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

      {/* ── TRUST ───────────────────────────────────────────────────────────── */}
      <section id="trust" className="dark-s">
        <div className="inner">
          <div className="s-label">Warum es funktioniert</div>
          <h2>Warum das im Vertrieb funktioniert</h2>
          <div className="trust-grid">
            {[
              "Kunde versteht seine Situation selbst",
              "Weniger Erklärungsaufwand im Gespräch",
              "Klarer Bedarf statt vager Anfrage",
              "Höhere Abschlusswahrscheinlichkeit",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "20px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(201,169,110,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                    <path d="M1 5l3.5 3.5L11 1" stroke="#b8884a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: "15px", fontWeight: "500", color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="cta-s">
        <div className="cta-left">
          <h2>
            Sehen Sie selbst,<br />
            wie Ihre Kunden den Check durchlaufen.
          </h2>
          <p>
            Testen Sie die Checks oder integrieren Sie sie<br />
            direkt in Ihre Website.
          </p>
        </div>
        <div className="cta-right">
          <a href="#tools" className="btn-primary-lg">
            Demo ansehen
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
            Checks testen
          </a>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
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

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer>
        <div>
          <div className="footer-logo">
            <div className="logo-mark" style={{ width: 20, height: 20, borderRadius: 5 }}>
              <LogoMarkSm />
            </div>
            FlowLeads
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(0,0,0,0.45)",
              marginTop: 6,
              maxWidth: 220,
              lineHeight: 1.45,
            }}
          >
            Digitale Erstberatung für Versicherungsmakler.
          </div>
        </div>
        <div className="footer-links">
          <Link href="/">Startseite</Link>
          <a href="#tools">Checks</a>
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
