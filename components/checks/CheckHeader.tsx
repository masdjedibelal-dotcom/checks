"use client";

import { useMakler } from "@/components/ui/MaklerContext";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
import { CheckProgressBar } from "@/components/checks/CheckProgressBar";
import { CheckHeaderPhoneButton } from "@/components/checks/CheckHeaderPhoneButton";

type Props = {
  firma: string;
  telefon?: string;
  /** @deprecated ungenutzt; Eyebrow im Hero */
  badge?: string;
  steps: readonly string[];
  currentStep: number;
  accent: string;
  showProgressBar?: boolean;
};

export function CheckHeader(props: Props) {
  const { firma, telefon = "", steps, currentStep, accent, showProgressBar = true } = props;
  const { embedInIframe } = useMakler();

  if (embedInIframe) return null;

  return (
    <>
      <div
        className="check-header check-sticky-header"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(31,41,55,0.06)",
          padding: "16px 20px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(26,58,92,0.2)",
          }}
        >
          <MaklerFirmaAvatarInitials firma={firma} />
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#1F2937",
            letterSpacing: "-0.1px",
            textAlign: "center",
          }}
        >
          {firma}
        </span>
        <CheckHeaderPhoneButton telefon={telefon} primaryColor={accent} />
      </div>
      {showProgressBar ? <CheckProgressBar steps={steps} currentStep={currentStep} accent={accent} /> : null}
    </>
  );
}
