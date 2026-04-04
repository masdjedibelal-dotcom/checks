"use client";

type Props = {
  telefon: string;
  primaryColor: string;
};

/** Runder Anruf-Button rechts im zentrierten Check-Header */
export function CheckHeaderPhoneButton({ telefon, primaryColor }: Props) {
  const t = telefon.trim();
  if (!t) return null;
  return (
    <a
      href={`tel:${t}`}
      style={{
        position: "absolute",
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: `${primaryColor}15`,
        color: primaryColor,
        flexShrink: 0,
        textDecoration: "none",
      }}
      aria-label={`Anrufen: ${t}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
