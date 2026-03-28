"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import DemoCTA from "@/components/ui/DemoCTA";
import { useMakler } from "@/components/ui/MaklerContext";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import type { CheckTheme } from "./checkStandardT";

type FormData = { name: string; email: string; tel: string };

type Props = {
  fd: FormData;
  setFd: Dispatch<SetStateAction<FormData>>;
  onSubmit: () => void;
  onBack: () => void;
  T: CheckTheme;
};

export default function CheckKitKontaktForm({ fd, setFd, onSubmit, onBack, T }: Props) {
  const MAKLER = useMakler();
  const [consent, setConsent] = useState(false);
  if (MAKLER.isDemoMode) {
    return <DemoCTA slug={MAKLER.slug} />;
  }

  const valid = Boolean(fd.name.trim() && fd.email.trim() && consent);
  const fields = [
    { k: "name" as const, l: "Name", t: "text" as const, ph: "Ihre Agentur", req: true },
    { k: "email" as const, l: "E-Mail", t: "email" as const, ph: "max@beispiel.de", req: true },
    { k: "tel" as const, l: "Telefon", t: "tel" as const, ph: "089 123 456 78", req: false },
  ];

  return (
    <>
      <div style={{ ...T.section, marginBottom: "0" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#999",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Gespräch anfragen
        </div>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {fields.map(({ k, l, t, ph, req }, i, arr) => (
            <div key={k} style={i < arr.length - 1 ? T.row : T.rowLast}>
              <label style={T.fldLbl}>
                {l}
                {req ? " *" : ""}
              </label>
              <input
                type={t}
                placeholder={ph}
                value={fd[k]}
                onChange={(e) => setFd((f) => ({ ...f, [k]: e.target.value }))}
                style={{ ...T.inputEl, marginTop: "6px" }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "14px", marginBottom: "100px" }}>
          <CheckKontaktBeforeSubmitBlock
            maklerName={MAKLER.name}
            consent={consent}
            onConsentChange={setConsent}
          />
        </div>
      </div>
      <div style={T.footer}>
        <button
          type="button"
          style={T.btnPrim(!valid)}
          onClick={() => {
            if (valid) onSubmit();
          }}
          disabled={!valid}
        >
          Gespräch anfragen
        </button>
        <button type="button" style={T.btnSec} onClick={onBack}>
          Zurück
        </button>
      </div>
    </>
  );
}
