import { Suspense } from "react";
import { flowleadsContactEmail } from "@/lib/flowleadsMailConfig";
import SuccessClient from "./SuccessClient";

/** UI mit Tabs (iFrame / Direkt-Link / QR) in `SuccessClient` — `useSearchParams` erfordert Suspense. */
export default function SuccessPage() {
  const contactEmail = flowleadsContactEmail();
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            fontFamily: "'DM Sans', var(--font-sans), system-ui, sans-serif",
            color: "#9ca3af",
            fontSize: 14,
          }}
        >
          Lade Ihre Bestellung…
        </div>
      }
    >
      <SuccessClient contactEmail={contactEmail} />
    </Suspense>
  );
}
