"use client";

import Link from "next/link";
import { useState } from "react";

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
    tag: "Neukunden",
    name: "Versicherungs-Check",
    desc: "Für Erstgespräche — zeigt sofort, was fehlt",
    price: "79",
  },
  {
    tag: "Bestandskunden",
    name: "Lebenssituations-Check",
    desc: "Nachwuchs, Jobwechsel — macht Anpassungsbedarf sichtbar",
    price: "79",
  },
  {
    tag: "BU & KTG",
    name: "Einkommens-Check",
    desc: "Zeigt Einbruch bei Krankheit Monat für Monat",
    price: "59",
  },
  {
    tag: "PKV-Wechsel",
    name: "GKV vs. PKV",
    desc: "Klare Einordnung statt Tarifvergleich",
    price: "49",
  },
  {
    tag: "Altersvorsorge",
    name: "Vorsorge-Check",
    desc: "Rentenlücke + Riester + 3 Strategien",
    price: "59",
  },
  {
    tag: "Familie & Kredit",
    name: "Risikoleben-Check",
    desc: "Versorgungslücke → empfohlene Summe",
    price: "59",
  },
  {
    tag: "Pflegevorsorge",
    name: "Pflege-Check",
    desc: "Eigenanteil nach Pflegegrad greifbar machen",
    price: "49",
  },
  {
    tag: "Immobilien",
    name: "Immobilien-Check",
    desc: "Kaufen vs. Mieten, Anschluss & Wohngebäude",
    price: "59",
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
          <Link href="/templates" className="btn-cta">
            Checks ansehen →
          </Link>
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
            <Link href="/templates" className="btn-primary-lg">
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
            </Link>
            <a href="#feature" className="btn-demo-lg">
              So funktioniert&apos;s
            </a>
          </div>

          <div className="trust au d4">
            {["iFrame auf jeder Website", "Mobile-first", "Leads direkt an Sie", "Einmalig kaufen"].map(
              (label) => (
                <div key={label} className="trust-pill">
                  <div className="trust-check">
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                      <path
                        d="M1 3l2 2L7 1"
                        stroke="#16a34a"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {label}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <div className="partners">
        <div className="partners-inner">
          <div className="partners-label">Einsetzbar auf</div>
          <div className="marquee-wrap">
            <div className="marquee-track">
            {[
              "WordPress",
              "Jimdo",
              "Squarespace",
              "Wix",
              "Webflow",
              "HTML-Seiten",
              "Landingpages",
              "Jede Website",
              "WordPress",
              "Jimdo",
              "Squarespace",
              "Wix",
              "Webflow",
              "HTML-Seiten",
              "Landingpages",
              "Jede Website",
            ].map((name, i) => (
              <span key={`${name}-${i}`} className="m-item">
                {name}
              </span>
            ))}
            </div>
          </div>
        </div>
      </div>

      <section id="feature" className="s" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div className="s-label">Funktionen</div>
          <h2>
            Alles was Sie brauchen,
            <br />
            um Anfragen zu erzeugen
          </h2>

          <div className="bento">
            <div className="bento-card">
              <div className="bento-body">
                <div className="bento-tag">Kundenerlebnis</div>
                <h3>Vom Besucher zur Beratungsanfrage</h3>
                <p>In 3 Schritten — ohne Fachchinesisch, ohne Tarifvergleich.</p>
              </div>
              <div className="bento-mock" style={{ padding: "20px 20px 0" }}>
                <div className="mini-phone" style={{ maxWidth: "100%", margin: 0 }}>
                  <div className="mp-bar" />
                  <div className="mp-hd">
                    <div className="mp-logo">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                        <rect x=".5" y=".5" width="3" height="3" rx=".5" fill="white" />
                        <rect x="5.5" y=".5" width="3" height="3" rx=".5" fill="white" opacity=".5" />
                        <rect x=".5" y="5.5" width="3" height="3" rx=".5" fill="white" opacity=".5" />
                        <rect x="5.5" y="5.5" width="3" height="3" rx=".5" fill="white" />
                      </svg>
                    </div>
                    <span className="mp-lbl">Vorsorge-Check</span>
                  </div>
                  <div className="mp-body">
                    <div className="mp-ey">Ihre Rentenanalyse</div>
                    <div className="mp-h">520 €/Mon. fehlen</div>
                    <div className="mp-s">ab Rentenbeginn mit 67</div>
                  </div>
                  <div className="mp-kpis">
                    <div className="mp-k">
                      <div className="mp-kv r">520 €</div>
                      <div className="mp-kl">Lücke/Mon.</div>
                    </div>
                    <div className="mp-k">
                      <div className="mp-kv">64 %</div>
                      <div className="mp-kl">Deckung</div>
                    </div>
                    <div className="mp-k">
                      <div className="mp-kv">32 J.</div>
                      <div className="mp-kl">bis Rente</div>
                    </div>
                  </div>
                  <div className="mp-btn">Strategie besprechen →</div>
                </div>
              </div>
            </div>

            <div className="bento-card">
              <div className="bento-body">
                <div className="bento-tag">Ergebnis</div>
                <h3>Klare Zahlen statt Tarifdschungel</h3>
                <p>Der Kunde sieht sofort, wo Handlungsbedarf besteht.</p>
              </div>
              <div className="bento-mock" style={{ margin: "0 20px 0" }}>
                <div className="result-rows">
                  <div className="result-row">
                    <span className="rr-label">Monatliche Rentenlücke</span>
                    <span className="rr-val red">
                      − 520 € <span className="rr-badge badge-red">Kritisch</span>
                    </span>
                  </div>
                  <div className="result-row">
                    <span className="rr-label">Deckungsgrad</span>
                    <span className="rr-val">64 %</span>
                  </div>
                  <div className="result-row">
                    <span className="rr-label">Empfohlene Strategie</span>
                    <span className="rr-val gold">
                      Hybrid <span className="rr-badge badge-green">Empfohlen</span>
                    </span>
                  </div>
                  <div className="result-row">
                    <span className="rr-label">Monatlicher Beitrag</span>
                    <span className="rr-val">ab 184 €</span>
                  </div>
                  <div className="result-row">
                    <span className="rr-label">Steuerersparnis/Jahr</span>
                    <span className="rr-val">~660 €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-card wide">
              <div className="bento-wide-grid">
                <div className="bento-body">
                  <div className="bento-tag">Setup</div>
                  <h3>
                    In Minuten live —
                    <br />
                    ohne Entwickler
                  </h3>
                  <p>Check auswählen, anpassen, per iFrame einbinden. Fertig.</p>
                </div>
                <div style={{ padding: "32px 24px 0" }}>
                  <div className="step-list">
                    {[
                      { n: "done", t: "Check auswählen", s: "8 Checks für jeden Anlass", done: true },
                      { n: "done", t: "Anpassen", s: "Name, Farbe, Kontakt", done: true },
                      { n: "3", t: "Per iFrame einbinden", s: "Code kopieren & einfügen", done: false },
                      { n: "4", t: "Leads erhalten", s: "Direkt an Ihre E-Mail", done: false },
                    ].map((step) => (
                      <div key={step.t} className="step-item">
                        <div className={`step-n ${step.done ? "done" : ""}`}>
                          {step.done ? (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                              <path
                                d="M1 4l3 3 5-6"
                                stroke="#16a34a"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            step.n
                          )}
                        </div>
                        <div>
                          <div className="step-t">{step.t}</div>
                          <div className="step-s">{step.s}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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

      <section id="checks" className="s" style={{ background: "var(--bg)" }}>
        <div className="inner">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: 0,
            }}
          >
            <div>
              <div className="s-label">Die 8 Checks</div>
              <h2>
                Ein System,
                <br />
                das Anfragen erzeugt
              </h2>
            </div>
            <Link href="/templates" className="btn-primary-lg" style={{ alignSelf: "flex-end" }}>
              Alle ansehen →
            </Link>
          </div>
          <div className="checks-grid">
            {CHECK_CARDS.map((c) => (
              <div key={c.name} className="c-card">
                <div className="c-top">
                  <div className="c-tag">{c.tag}</div>
                  <div className="c-name">{c.name}</div>
                  <div className="c-desc">{c.desc}</div>
                </div>
                <div className="c-foot">
                  <div className="c-price">
                    {c.price} € <small>einmalig</small>
                  </div>
                  <div className="c-btns">
                    <Link href="/templates" className="c-demo">
                      Demo
                    </Link>
                    <Link href="/templates" className="c-buy">
                      Kaufen
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="legal-note">
            <strong>Hinweis:</strong> Vor dem Livegang sollten alle Texte von einem Anwalt geprüft werden — die
            dargestellte Einordnung ist eine fundierte Basis, kein Rechtsrat.
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
          <Link href="/templates" className="btn-gold">
            Checks ansehen →
          </Link>
          <a href="#feature" className="btn-wh">
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
          <Link href="/templates">Checks</Link>
          <a href="#how">Setup</a>
          <a href="#faq">FAQ</a>
          <a href="#">Kontakt</a>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </div>
        <span className="footer-copy">© 2026 FlowLeads</span>
      </footer>
    </div>
  );
}
