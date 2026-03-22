"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildLicensedIframeCode, slugToDisplayName } from "@/lib/flowleadsEmbed";

type PurchaseData = {
  name: string;
  firma: string | null;
  slug: string;
  token: string;
  domain: string;
};

type SuccessClientProps = {
  contactEmail: string;
};

export default function SuccessClient({ contactEmail }: SuccessClientProps) {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [data, setData] = useState<PurchaseData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    const purchaseId: string = sessionId;

    let cancelled = false;
    const maxAttempts = 8;
    const delayMs = 1200;

    async function poll(attempt: number) {
      try {
        const r = await fetch(`/api/purchase?session_id=${encodeURIComponent(purchaseId)}`);
        if (r.ok) {
          const d = (await r.json()) as PurchaseData;
          if (!cancelled) {
            setData(d);
            setLoading(false);
          }
          return;
        }
        if (r.status === 404 && attempt < maxAttempts) {
          setTimeout(() => poll(attempt + 1), delayMs);
          return;
        }
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      } catch {
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
  }, [sessionId]);

  const iframeCode = data
    ? buildLicensedIframeCode(data.slug, data.token, data.domain)
    : "";

  const copy = async () => {
    if (!iframeCode) return;
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0ede6",
          fontFamily: "DM Sans, system-ui, sans-serif",
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: 14 }}>
          Lade Ihre Bestellung… (Webhook kann einige Sekunden brauchen)
        </div>
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
          fontFamily: "DM Sans, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          <p style={{ marginBottom: 16 }}>
            Die Bestellung wurde noch nicht gefunden oder die Session-ID fehlt. Bitte prüfen Sie Ihre E-Mail —
            sobald die Zahlung bestätigt ist, erhalten Sie den Code auch dort.
          </p>
          <a href="/templates" style={{ color: "#b8884a", fontWeight: 600 }}>
            Zurück zu den Checks
          </a>
        </div>
      </div>
    );
  }

  const firstName = data?.name.trim().split(/\s+/)[0] || data?.name;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0ede6",
        fontFamily: "DM Sans, system-ui, sans-serif",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#d1fae5",
              border: "1.5px solid #6ee7b7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden>
              <path
                d="M2 10l7 8L22 2"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), ui-serif, Georgia, serif",
              fontSize: 32,
              fontWeight: 400,
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
              marginBottom: 8,
            }}
          >
            {data ? `Danke, ${firstName}.` : "Kauf erfolgreich."}
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.65 }}>
            Ihr{" "}
            <strong style={{ color: "#1a1a1a" }}>
              {data ? slugToDisplayName(data.slug) : "Check"}
            </strong>{" "}
            ist aktiv. Eine E-Mail mit diesem Code wurde an Sie gesendet.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Ihr iFrame-Code</span>
            <button
              type="button"
              onClick={() => void copy()}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 8,
                background: copied ? "#d1fae5" : "#1a1a1a",
                color: copied ? "#16a34a" : "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {copied ? "✓ Kopiert" : "Code kopieren"}
            </button>
          </div>
          <pre
            style={{
              padding: "18px 20px",
              fontSize: 12,
              fontFamily: "ui-monospace, monospace",
              color: "#374151",
              lineHeight: 1.7,
              overflowX: "auto",
              margin: 0,
              background: "#faf9f6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {iframeCode}
          </pre>
        </div>

        <div
          style={{
            background: "#fdf6ec",
            border: "1px solid #f0d9b5",
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#b8884a",
              marginBottom: 16,
            }}
          >
            So binden Sie den Check ein
          </div>
          {[
            ["01", "Code oben kopieren"],
            ["02", "Im Website-Editor ein HTML-/Einbettungs-Element einfügen"],
            ["03", "Code einfügen und speichern"],
            ["04", "Fertig — der Check ist live auf Ihrer Website"],
          ].map(([n, t]) => (
            <div
              key={n}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(184,136,74,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 800, color: "#b8884a" }}>{n}</span>
              </div>
              <span style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        {data && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "16px 18px",
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: "#1a1a1a" }}>Lizenziert für:</strong> {data.domain}
            <br />
            Einbindung auf anderen Domains ist nicht gestattet.
            <br />
            Bei Fragen:{" "}
            <a href={`mailto:${contactEmail}`} style={{ color: "#b8884a" }}>
              {contactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
