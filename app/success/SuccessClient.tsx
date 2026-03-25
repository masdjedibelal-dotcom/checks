"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  buildLicensedDemoUrl,
  buildLicensedIframeCode,
  slugToDisplayName,
} from "@/lib/flowleadsEmbed";
type PurchaseData = {
  name: string;
  firma: string | null;
  slug: string;
  token: string;
  domain: string | null;
};

type SuccessClientProps = {
  contactEmail: string;
};

export default function SuccessClient({ contactEmail }: SuccessClientProps) {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [data, setData] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pollKey, setPollKey] = useState(0);
  const [tab, setTab] = useState<"iframe" | "link" | "qr">("iframe");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    const purchaseId = sessionId;
    let cancelled = false;
    const maxAttempts = 25;
    const delayMs = 2000;

    async function poll(attempt: number) {
      try {
        const r = await fetch(`/api/purchase?session_id=${encodeURIComponent(purchaseId)}`);
        if (r.ok) {
          const d = (await r.json()) as PurchaseData;
          if (!cancelled) {
            setData(d);
            setLoading(false);
            setNotFound(false);
          }
          return;
        }
        if ((r.status === 500 || r.status === 404) && attempt < maxAttempts) {
          setTimeout(() => poll(attempt + 1), delayMs);
          return;
        }
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      } catch {
        if (attempt < maxAttempts && !cancelled) {
          setTimeout(() => poll(attempt + 1), delayMs);
          return;
        }
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    void poll(0);
    return () => {
      cancelled = true;
    };
  }, [sessionId, pollKey]);

  const directUrl = data ? buildLicensedDemoUrl(data.slug, data.token) : "";
  const iframeCode = data ? buildLicensedIframeCode(data.slug, data.token) : "";

  useEffect(() => {
    if (!directUrl) {
      setQrDataUrl("");
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(directUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0f1a14", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [directUrl]);

  useEffect(() => {
    setCopied(false);
  }, [tab]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !data) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `flowleads-${data.slug}-qr.png`;
    a.click();
  };

  const S = {
    page: {
      minHeight: "100vh",
      background: "#f0ede6",
      fontFamily: "'DM Sans', var(--font-sans), system-ui, sans-serif",
      padding: "48px 24px",
    },
    wrap: { maxWidth: "600px", margin: "0 auto" },
    checkCircle: {
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: "#d1fae5",
      border: "1.5px solid #6ee7b7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
    },
    h1: {
      fontFamily: "'DM Sans', var(--font-sans), system-ui, sans-serif",
      fontSize: "30px",
      fontWeight: "700",
      color: "#1a1a1a",
      letterSpacing: "-.5px",
      marginBottom: "6px",
      textAlign: "center" as const,
    },
    sub: {
      fontSize: "15px",
      color: "#6b7280",
      lineHeight: "1.65",
      textAlign: "center" as const,
      marginBottom: "36px",
    },
    tabWrap: {
      display: "flex",
      gap: "0",
      marginBottom: "20px",
      background: "#fff",
      borderRadius: "12px",
      padding: "4px",
      border: "1px solid #e5e7eb",
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: "9px",
      borderRadius: "9px",
      fontSize: "13px",
      fontWeight: "600" as const,
      cursor: "pointer",
      border: "none",
      background: active ? "#0f1a14" : "transparent",
      color: active ? "#fff" : "#9ca3af",
      transition: "all .18s",
    }),
    card: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "16px",
    },
    cardHd: {
      padding: "14px 20px",
      borderBottom: "1px solid #f3f4f6",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardHdLabel: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#1a1a1a",
      textTransform: "uppercase" as const,
      letterSpacing: ".5px",
    },
    copyBtn: (active: boolean) => ({
      fontSize: "12px",
      fontWeight: "600",
      padding: "6px 14px",
      borderRadius: "8px",
      background: active ? "#d1fae5" : "#0f1a14",
      color: active ? "#16a34a" : "#fff",
      border: "none",
      cursor: "pointer",
      transition: "all .2s",
    }),
    code: {
      padding: "18px 20px",
      fontSize: "12px",
      fontFamily: "ui-monospace, monospace",
      color: "#374151",
      lineHeight: "1.7",
      overflowX: "auto" as const,
      margin: 0,
      background: "#faf9f6",
      whiteSpace: "pre-wrap" as const,
      wordBreak: "break-all" as const,
    },
    linkBox: {
      padding: "18px 20px",
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },
    linkText: {
      flex: 1,
      fontSize: "13px",
      color: "#374151",
      wordBreak: "break-all" as const,
      lineHeight: "1.55",
    },
    qrWrap: {
      padding: "32px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "20px",
    },
    qrImg: {
      width: "200px",
      height: "200px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
    },
    dlBtn: {
      fontSize: "13px",
      fontWeight: "700",
      padding: "10px 20px",
      borderRadius: "9px",
      background: "#0f1a14",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      transition: "all .2s",
    },
    stepsBox: {
      background: "#fdf6ec",
      border: "1px solid #f0d9b5",
      borderRadius: "14px",
      padding: "20px 22px",
      marginBottom: "16px",
    },
    stepsTitle: {
      fontSize: "10px",
      fontWeight: "700",
      color: "#b8884a",
      letterSpacing: "1.5px",
      textTransform: "uppercase" as const,
      marginBottom: "14px",
    },
    step: {
      fontSize: "13px",
      color: "#4b5563",
      lineHeight: "1.55",
      padding: "4px 0",
      display: "flex",
      gap: "8px",
    },
    stepNum: { color: "#b8884a", fontWeight: "700", flexShrink: 0 },
    hint: {
      fontSize: "12px",
      color: "#9ca3af",
      lineHeight: "1.65",
      textAlign: "center" as const,
      marginTop: "8px",
    },
  };

  const steps = {
    iframe: [
      "Code oben kopieren",
      'Im Website-Editor ein "HTML / Einbettungs-Element" einfügen',
      "Code einfügen und Seite speichern",
      "Fertig — die Microsite ist live auf Ihrer Website",
    ],
    link: [
      "Link kopieren",
      "In E-Mail, WhatsApp oder Social Media einfügen",
      "Oder als Button auf Ihrer Website verlinken",
      "Kunde klickt und startet die Microsite direkt",
    ],
    qr: [
      "QR-Code als PNG herunterladen",
      "Auf Visitenkarte, Flyer oder Broschüre platzieren",
      "Kunde scannt mit dem Smartphone",
      "Die Microsite öffnet sich direkt — ohne Tippen",
    ],
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: "#f0ede6",
          fontFamily: "'DM Sans', var(--font-sans), system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
          Lade Ihre Bestellung…
        </div>
        <a href="/" style={{ color: "#b8884a", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          ← Zurück zur Startseite
        </a>
      </div>
    );
  }

  if (notFound || !sessionId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0ede6",
          padding: 24,
          fontFamily: "'DM Sans', var(--font-sans), system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center", color: "#6b7280", fontSize: 14, lineHeight: 1.65 }}>
          <p style={{ marginBottom: 12 }}>
            {sessionId
              ? "Ihre Zahlung kann schon durch sein, der Eintrag erscheint erst, wenn Stripe den Webhook an diese Seite geschickt hat (meist unter einer Minute)."
              : "In der Adresszeile fehlt die Session-ID (z. B. nach manuellem Aufruf von /success). Nutzen Sie den Link aus der Stripe-Weiterleitung oder die E-Mail."}
          </p>
          <p style={{ marginBottom: 16 }}>
            Bitte prüfen Sie auch Ihre E-Mail — dort stehen iFrame, Link und Hinweis zur Bestätigungsseite, sobald der Versand geklappt hat.
          </p>
          {sessionId ? (
            <button
              type="button"
              onClick={() => {
                setNotFound(false);
                setLoading(true);
                setPollKey((k) => k + 1);
              }}
              style={{
                display: "block",
                margin: "0 auto 16px",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 10,
                background: "#0f1a14",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Erneut laden
            </button>
          ) : null}
          <a href="/" style={{ color: "#b8884a", fontWeight: 600 }}>
            Zurück zur Startseite
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const firstName = data.name.trim().split(/\s+/)[0] || data.name;

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.checkCircle}>
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden>
            <path
              d="M2 9l6 7L20 2"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 style={S.h1}>Danke, {firstName}.</h1>
        <p style={S.sub}>
          Ihr{" "}
          <strong style={{ color: "#1a1a1a" }}>{slugToDisplayName(data.slug)}</strong> ist aktiv. Wählen Sie, wie Sie
          es einsetzen möchten.
        </p>

        <div style={S.tabWrap}>
          {(["iframe", "link", "qr"] as const).map((t) => (
            <button key={t} type="button" style={S.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "iframe" ? "⟨/⟩ iFrame" : t === "link" ? "🔗 Direkt-Link" : "⬜ QR-Code"}
            </button>
          ))}
        </div>

        <div style={S.card}>
          <div style={S.cardHd}>
            <span style={S.cardHdLabel}>
              {tab === "iframe" ? "Ihr iFrame-Code" : tab === "link" ? "Ihr Direkt-Link" : "Ihr QR-Code"}
            </span>
            {tab !== "qr" ? (
              <button type="button" style={S.copyBtn(copied)} onClick={() => void copy(tab === "iframe" ? iframeCode : directUrl)}>
                {copied ? "✓ Kopiert" : "Kopieren"}
              </button>
            ) : null}
          </div>

          {tab === "iframe" ? <pre style={S.code}>{iframeCode}</pre> : null}

          {tab === "link" ? (
            <div style={S.linkBox}>
              <span style={S.linkText}>{directUrl}</span>
              <button type="button" style={S.copyBtn(copied)} onClick={() => void copy(directUrl)}>
                {copied ? "✓" : "Kopieren"}
              </button>
            </div>
          ) : null}

          {tab === "qr" ? (
            <div style={S.qrWrap}>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data-URL aus qrcode, kein next/image
                <img src={qrDataUrl} alt="QR-Code zum Direkt-Link" style={S.qrImg} />
              ) : null}
              <button type="button" style={S.dlBtn} onClick={downloadQR} disabled={!qrDataUrl}>
                QR-Code herunterladen
              </button>
              <p style={S.hint}>PNG · 300×300px · Druckoptimiert</p>
            </div>
          ) : null}
        </div>

        <div style={S.stepsBox}>
          <div style={S.stepsTitle}>So geht&apos;s</div>
          {steps[tab].map((s, i) => (
            <div key={i} style={S.step}>
              <span style={S.stepNum}>{i + 1}.</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <p style={S.hint}>
          Bei Fragen:{" "}
          <a href={`mailto:${contactEmail}`} style={{ color: "#b8884a" }}>
            {contactEmail}
          </a>
        </p>

        <p style={{ ...S.hint, marginTop: 20 }}>
          <a href="/" style={{ color: "#b8884a", fontWeight: 600, textDecoration: "none" }}>
            ← Zurück zur Startseite
          </a>
        </p>
      </div>
    </div>
  );
}
