"use client";

import { useState, type ReactNode } from "react";

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
        padding: "16px",
        borderRadius: "12px",
        border: `1px solid ${focused ? accent : "#e8e8e8"}`,
        background: "#fff",
        boxShadow: focused ? `0 0 0 3px ${accent}12` : "none",
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
          style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}
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
              padding: "6px 10px",
              border: `1.5px solid ${focused ? accent : "#e8e8e8"}`,
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "700",
              color: focused ? "#111" : accent,
              textAlign: "right",
              outline: "none",
              background: focused ? "#fff" : `${accent}08`,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: "border-color 0.15s, background 0.15s",
            }}
          />
          {unit ? (
            <span
              style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}
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
            color: "#888",
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
          height: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "5px",
            background: "#efefef",
            borderRadius: "3px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            height: "5px",
            width: `${pct}%`,
            background: accent,
            borderRadius: "3px",
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
            border: `2.5px solid ${accent}`,
            boxShadow: `0 2px 6px ${accent}40`,
            pointerEvents: "none",
            transition: "left 0.1s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "#ccc",
          marginTop: "6px",
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
        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "8px" }}>
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
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={value ? `${label} (${value})` : label}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "10px",
        border: `1.5px solid ${selected ? accent : "#e8e8e8"}`,
        background: selected ? `${accent}08` : "#fff",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
        boxShadow: selected ? `0 2px 8px ${accent}20` : "none",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}
    >
      {icon ? (
        <div
          style={{
            color: selected ? accent : "#aaa",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
        >
          {icon}
        </div>
      ) : null}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: selected ? accent : "#111",
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
        {description ? (
          <div
            style={{
              fontSize: "11px",
              color: "#aaa",
              marginTop: "2px",
              lineHeight: 1.4,
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
          border: `1.5px solid ${selected ? accent : "#ddd"}`,
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
              stroke="white"
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
        padding: "14px 16px",
        background: checked ? `${accent}07` : "#fff",
        cursor: "pointer",
        transition: "background 0.15s",
        borderBottom: showDivider ? "1px solid #f5f5f5" : "none",
      }}
    >
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "6px",
          flexShrink: 0,
          border: `1.5px solid ${checked ? accent : "#e0e0e0"}`,
          background: checked ? accent : "#fafafa",
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
              stroke="white"
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
            fontSize: "13px",
            fontWeight: checked ? "600" : "400",
            color: checked ? "#111" : "#555",
            letterSpacing: checked ? "-0.1px" : "0",
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
        {description ? (
          <div
            style={{
              fontSize: "11px",
              color: "#aaa",
              marginTop: "2px",
              lineHeight: 1.4,
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
  color = "#999",
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
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        marginBottom: "10px",
        marginTop: "4px",
      }}
    >
      {label}
    </div>
  );
}
