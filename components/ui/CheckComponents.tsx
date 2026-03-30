"use client";

import { useState, type ReactNode } from "react";
import { textOnAccent } from "@/lib/utils";
import type { CheckT } from "@/lib/checkStandardT";

/** Farbe für Gesetzes-/Normverweise in Berechnungshinweisen (siehe CheckBerechnungshinweis) */
export const CHECK_GES_REF_STYLE = { color: "#B8884A" } as const;

export function CheckGesetzRef({ children }: { children: ReactNode }) {
  return <span style={CHECK_GES_REF_STYLE}>{children}</span>;
}

// ─── PROGRESS (ohne Header-Zeile; gleiche Tokens wie CheckHeader) ────────────
export function CheckProgressDots({
  T,
  current,
  total,
  fillPct,
}: {
  T: CheckT;
  /** 1-basierter Schritt */
  current: number;
  total: number;
  /** Optional 0–100; sonst (current/total)*100 */
  fillPct?: number;
}) {
  const pct = fillPct != null ? fillPct : total > 0 ? (current / total) * 100 : 0;
  const metaText = `Fast geschafft · Schritt ${current} von ${total}`;

  return (
    <div style={T.progWrap}>
      <div
        style={{
          ...T.progTrack,
          borderRadius: "999px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={T.progFill(Math.min(100, Math.max(0, pct)))} />
      </div>
      <div style={T.progMeta}>{metaText}</div>
    </div>
  );
}

// ─── DANKE (Standard-Layout mit checkStandardT) ──────────────────────────────
export function DankeScreen({
  T,
  C,
  name,
  makler,
  onBack,
  message = "Wir melden uns innerhalb von 24 Stunden.",
  resetLabel = "Neue Berechnung starten",
}: {
  T: CheckT;
  C: string;
  name?: string;
  makler: { name: string; firma: string; telefon: string; email: string };
  onBack: () => void;
  message?: string;
  resetLabel?: string;
}) {
  return (
    <div style={T.dankeScreen}>
      <div style={T.dankeRing(C)}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 10l4.5 4.5L16 6"
            stroke={C}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={T.dankeH}>
        {name ? `Danke, ${name.split(" ")[0]}.` : "Anfrage gesendet."}
      </div>
      <div style={T.dankeBody}>{message}</div>
      <div style={T.maklerCard}>
        <div style={T.maklerTop}>
          <div style={T.maklerName}>{makler.name}</div>
          <div style={T.maklerFirma}>{makler.firma}</div>
        </div>
        <div style={T.maklerLinks}>
          <a href={`tel:${makler.telefon}`} style={T.maklerLink(C)}>
            {makler.telefon}
          </a>
          <a href={`mailto:${makler.email}`} style={T.maklerLink(C)}>
            {makler.email}
          </a>
        </div>
      </div>
      <button type="button" onClick={onBack} style={{ ...T.btnSec, marginTop: "16px" }}>
        {resetLabel}
      </button>
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type InputCardProps = {
  children: ReactNode;
  focused?: boolean;
  accent: string;
};

export type SliderCardProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  display?: string;
  hint?: string;
  accent: string;
  onChange: (v: number) => void;
};

type SelectionCardProps = {
  value?: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  selected: boolean;
  accent: string;
  onClick: () => void;
};

type CheckRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  accent: string;
  onClick: () => void;
  /** @default true */
  showDivider?: boolean;
};

// ─── 1. INPUT CARD WRAPPER ─────────────────────────────────────────────────
export function InputCard({ children, focused, accent }: InputCardProps) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRadius: "18px",
        border: `1px solid ${focused ? accent : "rgba(17,24,39,0.06)"}`,
        background: "rgba(255,255,255,0.96)",
        boxShadow: focused
          ? `0 8px 24px rgba(17,24,39,0.08), 0 0 0 1px ${accent}33`
          : "0 2px 10px rgba(17,24,39,0.04)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}

// ─── 2. SLIDER CARD ───────────────────────────────────────────────────────────
export function SliderCard({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  display,
  hint,
  accent,
  onChange,
}: SliderCardProps) {
  const [inputVal, setInputVal] = useState(String(value));
  const [focused, setFocused] = useState(false);

  const handleBlur = () => {
    setFocused(false);
    const raw = parseFloat(inputVal.replace(/[^\d.-]/g, ""));
    if (!isNaN(raw)) {
      const clamped = Math.min(
        max,
        Math.max(min, Math.round(raw / step) * step),
      );
      onChange(clamped);
      setInputVal(String(clamped));
    } else {
      setInputVal(String(value));
    }
  };

  const span = max - min;
  const pct = span === 0 ? 0 : ((value - min) / span) * 100;

  return (
    <InputCard focused={focused} accent={accent}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <label
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#6B7280",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type="text"
            inputMode="numeric"
            value={focused ? inputVal : String(value)}
            onFocus={() => {
              setFocused(true);
              setInputVal(String(value));
            }}
            onBlur={handleBlur}
            onChange={(e) => setInputVal(e.target.value)}
            aria-label={label}
            style={{
              width: "96px",
              padding: "8px 12px",
              border: `1px solid ${focused ? accent : "rgba(31,41,55,0.08)"}`,
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: "700",
              color: focused ? "#1F2937" : accent,
              textAlign: "right",
              outline: "none",
              background: focused ? "#fff" : `color-mix(in srgb, ${accent} 8%, white)`,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              boxShadow: "inset 0 1px 2px rgba(17,24,39,0.03)",
              transition: "border-color 0.15s, background 0.15s",
            }}
          />
          {unit ? (
            <span
              style={{ fontSize: "12px", color: "#9CA3AF", flexShrink: 0 }}
            >
              {unit}
            </span>
          ) : null}
        </div>
      </div>

      {display && !focused ? (
        <div
          style={{
            fontSize: "12px",
            color: "#6B7280",
            marginBottom: "10px",
            marginTop: "-8px",
          }}
        >
          {display}
        </div>
      ) : null}

      <div
        style={{
          position: "relative",
          height: "22px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "6px",
            background: "rgba(31,41,55,0.08)",
            borderRadius: "999px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            height: "6px",
            width: `${pct}%`,
            background: accent,
            borderRadius: "999px",
            transition: "width 0.1s ease",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => {
            onChange(+e.target.value);
            setInputVal(String(+e.target.value));
          }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            height: "20px",
            opacity: 0,
            cursor: "pointer",
            margin: 0,
            padding: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `calc(${pct}% - 10px)`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#fff",
            border: `2px solid ${accent}`,
            boxShadow: "0 2px 8px rgba(17,24,39,0.12)",
            pointerEvents: "none",
            transition: "left 0.1s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#9CA3AF",
          marginTop: "8px",
        }}
      >
        <span>
          {min}
          {unit ? ` ${unit}` : ""}
        </span>
        <span>
          {max}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>

      {hint ? (
        <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "10px" }}>
          {hint}
        </div>
      ) : null}
    </InputCard>
  );
}

// ─── 3. SELECTION CARD ────────────────────────────────────────────────────────
export function SelectionCard({
  label,
  description,
  icon,
  selected,
  accent,
  onClick,
  value,
}: SelectionCardProps) {
  const markOnAccent = textOnAccent(accent);
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={value ? `${label} (${value})` : label}
      onClick={onClick}
      style={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "18px",
        borderRadius: "18px",
        border: `1.5px solid ${selected ? accent : "rgba(17,24,39,0.06)"}`,
        background: selected
          ? `color-mix(in srgb, ${accent} 8%, white)`
          : "rgba(255,255,255,0.96)",
        cursor: "pointer",
        textAlign: "left",
        transition:
          "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
        boxShadow: selected
          ? "0 10px 28px rgba(26,58,92,0.12)"
          : "0 2px 10px rgba(17,24,39,0.04)",
        minHeight: "66px",
      }}
    >
      {icon ? (
        <div
          style={{
            color: selected ? accent : "#98A2B3",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
        >
          {icon}
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: selected ? accent : "#1F2937",
            lineHeight: 1.3,
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {label}
        </div>
        {description ? (
          <div
            style={{
              fontSize: "13px",
              color: "#6B7280",
              marginTop: "3px",
              lineHeight: 1.45,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          flexShrink: 0,
          border: `1.5px solid ${selected ? accent : "#E5E7EB"}`,
          background: selected ? accent : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
        }}
      >
        {selected ? (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke={markOnAccent}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </button>
  );
}

// ─── 4. CHECK ROW ─────────────────────────────────────────────────────────────
export function CheckRow({
  label,
  description,
  checked,
  accent,
  onClick,
  showDivider = true,
}: CheckRowProps) {
  const markOnAccent = textOnAccent(accent);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: "flex",
        alignItems: checked && description ? "flex-start" : "center",
        gap: "14px",
        padding: "14px 18px",
        background: checked
          ? `color-mix(in srgb, ${accent} 6%, white)`
          : "rgba(255,255,255,0.96)",
        cursor: "pointer",
        transition: "background 0.15s",
        borderBottom: showDivider ? "1px solid #f5f5f5" : "none",
      }}
    >
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "7px",
          flexShrink: 0,
          border: `1.5px solid ${checked ? accent : "#E5E7EB"}`,
          background: checked ? accent : "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          boxShadow: checked ? `0 2px 6px ${accent}30` : "none",
          marginTop: description ? "2px" : "0",
        }}
      >
        {checked ? (
          <svg width="11" height="9" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke={markOnAccent}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: checked ? "600" : "400",
            color: "#1F2937",
            letterSpacing: checked ? "-0.1px" : "0",
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
        {description ? (
          <div
            style={{
              fontSize: "13px",
              color: "#6B7280",
              marginTop: "2px",
              lineHeight: 1.45,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── 5. SECTION HEADER ────────────────────────────────────────────────────────
export function SectionHeader({
  label,
  color = "#9CA3AF",
}: {
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: "700",
        color,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        marginBottom: "10px",
        marginTop: "4px",
      }}
    >
      {label}
    </div>
  );
}
