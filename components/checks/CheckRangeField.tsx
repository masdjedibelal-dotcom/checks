"use client";

import { useState, type CSSProperties } from "react";
import type { CheckTheme } from "./checkStandardT";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
  hint?: string;
  unit?: string;
  C: string;
  T: CheckTheme;
};

export default function CheckRangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  hint,
  unit = "",
  C,
  T,
}: Props) {
  const [iv, setIv] = useState(String(value));
  const [f, setF] = useState(false);
  const hs = (v: number) => {
    onChange(v);
    if (!f) setIv(String(v));
  };
  const hb = () => {
    setF(false);
    const r = parseFloat(iv.replace(/[^\d.-]/g, ""));
    if (!isNaN(r)) {
      const c = Math.min(max, Math.max(min, Math.round(r / step) * step));
      onChange(c);
      setIv(String(c));
    } else setIv(String(value));
  };

  return (
    <div style={{ marginBottom: "22px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <label style={{ ...T.fldLbl }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type="text"
            inputMode="numeric"
            value={f ? iv : String(value)}
            onFocus={() => {
              setF(true);
              setIv(String(value));
            }}
            onBlur={hb}
            onChange={(e) => setIv(e.target.value)}
            style={{
              width: "90px",
              padding: "5px 8px",
              border: `1px solid ${f ? C : "#e8e8e8"}`,
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "600",
              color: f ? "#111" : C,
              textAlign: "right",
              outline: "none",
              background: f ? "#fff" : `${C}08`,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          />
          {unit ? (
            <span style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}>{unit}</span>
          ) : null}
        </div>
      </div>
      {!f && display ? (
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{display}</div>
      ) : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => hs(+e.target.value)}
        style={{ width: "100%", "--accent": C } as CSSProperties}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#ccc",
          marginTop: "4px",
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
      {hint ? <div style={T.fldHint}>{hint}</div> : null}
    </div>
  );
}
