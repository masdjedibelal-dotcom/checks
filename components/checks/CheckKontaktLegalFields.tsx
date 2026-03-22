"use client";

import type { CSSProperties } from "react";
import {
  CHECK_CONSENT_TEXT,
  CHECK_LEAD_NOTICE,
  checkDataForwardingNote,
} from "./checkLegalCopy";

const leadStyle: CSSProperties = {
  fontSize: 12,
  color: "#666",
  lineHeight: 1.55,
  marginBottom: 14,
};

const forwardStyle: CSSProperties = {
  fontSize: 12,
  color: "#555",
  lineHeight: 1.6,
  marginBottom: 10,
};

const labelStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  cursor: "pointer",
  marginBottom: 4,
};

const consentSpanStyle: CSSProperties = {
  fontSize: 11,
  color: "#666",
  lineHeight: 1.5,
};

export function CheckKontaktLeadLine({ style }: { style?: CSSProperties }) {
  return <p style={{ ...leadStyle, ...style }}>{CHECK_LEAD_NOTICE}</p>;
}

type BeforeSubmitProps = {
  maklerName: string;
  consent: boolean;
  onConsentChange: (v: boolean) => void;
  style?: CSSProperties;
};

export function CheckKontaktBeforeSubmitBlock({
  maklerName,
  consent,
  onConsentChange,
  style,
}: BeforeSubmitProps) {
  return (
    <>
      <p style={{ ...forwardStyle, ...style }}>{checkDataForwardingNote(maklerName)}</p>
      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsentChange(e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span style={consentSpanStyle}>{CHECK_CONSENT_TEXT}</span>
      </label>
    </>
  );
}
