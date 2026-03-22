"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KATALOG, type Template } from "@/lib/katalog";
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

const CHECK_CARDS = [
  {
    slug: "bedarfscheck" as const,
    tag: "Neukunden",
    name: "Versicherungs-Check",
    desc: "Für Erstgespräche — zeigt sofort, was fehlt",
    longDesc:
      "Der Kunde markiert, was er bereits abgesichert hat und wo Lücken sind. Daraus werden drei nachvollziehbare Pakete mit kurzer Begründung — perfekt, um vor dem Erstgespräch Gesprächsbedarf zu erzeugen, ohne ins Tarifdetail zu gehen.",
    price: "79",
  },
  {
    slug: "lebenssituations-check" as const,
    tag: "Bestandskunden",
    name: "Lebenssituations-Check",
    desc: "Nachwuchs, Jobwechsel — macht Anpassungsbedarf sichtbar",
    longDesc:
      "Lebensereignisse wie Heirat, Kind, Umzug oder Jobwechsel werden strukturiert erfasst und mit dem bestehenden Schutz abgeglichen. So wird sichtbar, wo Verträge nachgezogen oder angepasst werden sollten — ideal für Bestandskunden-Mails und Jahresgespräche.",
    price: "79",
  },
  {
    slug: "einkommens-check" as const,
    tag: "BU & KTG",
    name: "Einkommens-Check",
    desc: "Zeigt Einbruch bei Krankheit Monat für Monat",
    longDesc:
      "Krankentagegeld und BU werden auf einer Zeitleiste dargestellt: wie lange reicht das Geld, wo entsteht die Lücke, was wäre sinnvoll? Inklusive Einordnung und grober Richtung — ohne konkrete Tarifempfehlung im Tool.",
    price: "59",
  },
  {
    slug: "gkv-pkv" as const,
    tag: "PKV-Wechsel",
    name: "GKV vs. PKV",
    desc: "Klare Einordnung statt Tarifvergleich",
    longDesc:
      "Prüfung der Wechselvoraussetzungen (u. a. Jahresarbeitsentgeltgrenze), Beitragslogik und Familienfälle. Der Kunde bekommt eine verständliche Einordnung, ob ein Wechsel grundsätzlich in Frage kommt — ohne Vergleichsrechner und ohne Produktliste.",
    price: "49",
  },
  {
    slug: "vorsorge-check" as const,
    tag: "Altersvorsorge",
    name: "Vorsorge-Check",
    desc: "Rentenlücke + Riester + 3 Strategien",
    longDesc:
      "Renteninformation, gewünschter Standard und Sparverhalten fließen ein. Es entstehen Rentenlücke, grobe Deckung und drei Strategien (Basis, ausgewogen, ambitioniert) mit Riester-Hinweis wo sinnvoll — alles als Orientierung für das spätere Beratungsgespräch.",
    price: "59",
  },
  {
    slug: "risikoleben" as const,
    tag: "Familie & Kredit",
    name: "Risikoleben-Check",
    desc: "Versorgungslücke → empfohlene Summe",
    longDesc:
      "Aus Einkommen, Verbindlichkeiten und Familienstand wird die Versorgungslücke bei Todesfall grob beziffert — in Abgrenzung zu gesetzlicher Witwen- und Waisenrente. Ergebnis: eine einordnende Empfehlungssumme, kein Produktvergleich.",
    price: "59",
  },
  {
    slug: "pflege-check" as const,
    tag: "Pflegevorsorge",
    name: "Pflege-Check",
    desc: "Eigenanteil nach Pflegegrad greifbar machen",
    longDesc:
      "Pflegegrad und gewünschter Lebensstandard führen zu einem nachvollziehbaren Eigenanteil und einer Einordnung der Kosten. Zusätzlich Überblick über typische Absicherungsbausteine — damit der Kunde das Thema nicht mehr abstrakt, sondern in Euro sieht.",
    price: "49",
  },
  {
    slug: "immobilien-check" as const,
    tag: "Immobilien",
    name: "Immobilien-Check",
    desc: "Kaufen vs. Mieten, Anschluss & Wohngebäude",
    longDesc:
      "Drei Module: Mieten versus Kaufen (mit grober Sensitivität), Anschlussfinanzierung nach Ablauf der Zinsbindung sowie Wohngebäude-Risiko. Strukturierte Fragen, klare Zwischenergebnisse — geeignet für Immobilien- und Finanzierungsseiten.",
    price: "59",
  },
] as const;

const TRUST_ITEMS: { label: string; icon: ReactNode }[] = [
  {
    label: "iFrame auf jeder Website",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Mobile-first",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Leads direkt an Sie",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Einmalig kaufen",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h3l1-2h8l1 2h3v12H4V7z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const FEATURE_ITEMS = [
  {
    kicker: "Kundenerlebnis",
    title: "Vom Besucher zur Beratungsanfrage",
    body:
      "In klaren Schritten führen die Checks durch Situation, Bedarf und nächsten Schritt — ohne Fachjargon und ohne Tarifvergleich. Ihre Besucher verstehen das Problem, bevor Sie ins Gespräch kommen.",
  },
  {
    kicker: "Ergebnis",
    title: "Klare Zahlen statt Tarifdschungel",
    body:
      "Am Ende stehen konkrete Kennzahlen und Einordnungen: Lücken, Deckungsgrade, empfohlene Richtungen. Der Kunde sieht Handlungsbedarf in Prozent und Euro — nicht in Produktlisten.",
  },
  {
    kicker: "Setup",
    title: "In Minuten live — ohne Entwickler",
    body:
      "Check wählen, Name, Farbe und Kontaktdaten eintragen, iFrame-Code erhalten und auf Ihrer Website einfügen. Keine Programmierung und kein eigenes Hosting-Projekt — Sie bleiben Makler, wir liefern das Werkzeug.",
  },
] as const;

function LogoMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <rect x="1" y="1" width="4.2" height="4.2" rx=".8" fill="white" />
      <rect x="6.8" y="1" width="4.2" height="4.2" rx=".8" fill="white" opacity=".5" />
      <rect x="1" y="6.8" width="4.2" height="4.2" rx=".8" fill="white" opacity=".5" />
      <rect x="6.8" y="6.8" width="4.2" height="4.2" rx=".8" fill="white" />
    </svg>
  );
}

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
          <div className="logo-mark">
            <LogoMark />
          </div>
          FlowLeads
        </div>
        <div className="nav-links">
          <a href="#feature">Funktionen</a>
          <a href="#checks">Checks</a>
          <a href="#how">Setup</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-right">
          <a href="#faq" className="btn-ghost">
            Fragen?
          </a>
          <a href="#checks" className="btn-cta">
            Checks ansehen →
          </a>
        </div>
      </nav>

      <section style={{ background: "var(--bg)", paddingBottom: 0 }}>
        <div className="hero">
          <div className="hero-avatars au">
            <div className="avatar-stack">
              <div className="avatar" style={{ background: "#e8d5c4" }}>
                M
              </div>
              <div className="avatar" style={{ background: "#c8dce8" }}>
                T
              </div>
              <div className="avatar" style={{ background: "#d4e8c8" }}>
                S
              </div>
              <div className="avatar" style={{ background: "#e8c8d8" }}>
                A
              </div>
            </div>
            <span className="hero-avatar-text">Bereits von Maklern genutzt</span>
          </div>

          <div className="hero-tag au d1">
            <span className="tag-dot" />
            Für Versicherungsmakler
          </div>

          <h1 className="au d2">
            Wenn Kunden verstehen,
            <br />
            <span className="underline">handeln sie</span>. Und fragen an.
          </h1>

          <p className="hero-sub au d3">
            FlowLeads verwandelt Website-Besucher in qualifizierte Anfragen — mit interaktiven Checks, die Kunden ihre Lücke selbst erkennen lassen.
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
            <a href="#feature" className="btn-demo-lg">
              So funktioniert&apos;s
            </a>
          </div>

          <div className="trust au d4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="trust-item">
                <span className="trust-ico" aria-hidden>
                  {item.icon}
                </span>
                <span className="trust-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="feature" className="s" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div className="s-label">Funktionen</div>
          <h2>
            Alles was Sie brauchen,
            <br />
            um Anfragen zu erzeugen
          </h2>

          <div className="feature-grid">
            {FEATURE_ITEMS.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-kicker">{f.kicker}</div>
                <h3>{f.title}</h3>
                <p className="feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="s" style={{ background: "var(--surface)" }}>
        <div className="inner">
          <div className="s-label">So funktioniert&apos;s</div>
          <h2>
            In 4 Schritten zu
            <br />
            mehr Anfragen
          </h2>
          <p className="s-sub">Kein Entwickler. Kein Abo. Einmalig kaufen.</p>
          <div className="how-row">
            {[
              {
                n: "01",
                t: "Check auswählen",
                p: "Den passenden Rechner für Neukunden, Bestandskunden oder einen konkreten Anlass wählen.",
              },
              {
                n: "02",
                t: "Anpassen",
                p: "Name, Firma, Akzentfarbe und Kontaktdaten eintragen — fertig.",
              },
              {
                n: "03",
                t: "Einbinden",
                p: "Per iFrame auf Ihrer Website, Landingpage oder Unterseite platzieren.",
              },
              {
                n: "04",
                t: "Leads erhalten",
                p: "Anfragen gehen direkt an Ihre E-Mail. Kein Umweg, kein Portal.",
              },
            ].map((cell) => (
              <div key={cell.n} className="how-cell">
                <div className="how-n">{cell.n}</div>
                <h3>{cell.t}</h3>
                <p>{cell.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="checks" className="s checks-section" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div>
            <div className="s-label">Die 8 Checks</div>
            <h2>
              Ein System,
              <br />
              das Anfragen erzeugt
            </h2>
          </div>
          <div className="checks-grid">
            {CHECK_CARDS.map((c) => {
              const tmpl = KATALOG.find((t) => t.slug === c.slug);
              return (
                <div key={c.slug} className="c-card">
                  <div className="c-top">
                    <div className="c-tag">{c.tag}</div>
                    <div className="c-name">{c.name}</div>
                    <div className="c-desc">{c.desc}</div>
                    <p className="c-long">{c.longDesc}</p>
                  </div>
                  <div className="c-foot">
                    <div className="c-price">
                      {c.price} € <small>einmalig</small>
                    </div>
                    <div className="c-btns">
                      <button
                        type="button"
                        className="c-demo"
                        disabled={!tmpl}
                        onClick={() => tmpl && setDemoT(tmpl)}
                      >
                        Demo
                      </button>
                      <button
                        type="button"
                        className="c-buy"
                        disabled={!tmpl}
                        onClick={() => tmpl && setBuyT(tmpl)}
                      >
                        Kaufen
                      </button>
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

      <section className="s" style={{ background: "var(--surface)" }}>
        <div className="inner">
          <div className="s-label">Rechtliches</div>
          <h2>Rechtliche Einordnung</h2>
          <div className="legal-einordnung">
            <p>
              Die Rechner werden als technische Lösung bereitgestellt und vom jeweiligen Versicherungsmakler auf seiner
              eigenen Website eingebunden.
            </p>
            <p>
              Der Makler ist für die Inhalte, die Einbindung sowie die Verarbeitung der Kundendaten verantwortlich.
              FlowLeads stellt ausschließlich die technische Infrastruktur und die Berechnungslogik zur Verfügung.
            </p>
            <div className="legal-subblock">
              <h3>Hinweis</h3>
              <p>
                Die Inhalte und Ergebnisse der Rechner dienen der unverbindlichen Orientierung und ersetzen keine
                individuelle Beratung.
              </p>
            </div>
            <div className="legal-subblock">
              <h3>Integration</h3>
              <p>
                Die Rechner werden per iFrame auf der Website des jeweiligen Anbieters eingebunden. Eine eigene
                Verarbeitung der im Rechner eingegebenen Daten durch FlowLeads erfolgt nicht.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="s" style={{ background: "var(--bg)" }}>
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
            Checks ansehen →
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
