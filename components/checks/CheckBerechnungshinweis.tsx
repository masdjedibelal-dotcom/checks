"use client";

import { useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function CheckBerechnungshinweis({ children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "12px",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        style={{
          width: "100%",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fafafa",
          cursor: "pointer",
          border: "none",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#888",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="6" stroke="#aaa" strokeWidth="1.2" />
            <path
              d="M7 6v4M7 4.5v.5"
              stroke="#aaa"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Wie berechnen wir das?
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="#aaa"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          style={{
            padding: "12px 16px",
            fontSize: "12px",
            color: "#666",
            lineHeight: 1.7,
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
