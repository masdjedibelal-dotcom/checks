import { Suspense } from "react";
import { flowleadsContactEmail } from "@/lib/flowleadsMailConfig";
import SuccessClient from "./SuccessClient";

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
            background: "#f0ede6",
            fontFamily: "system-ui, sans-serif",
            color: "#9ca3af",
            fontSize: 14,
          }}
        >
          Lade…
        </div>
      }
    >
      <SuccessClient contactEmail={contactEmail} />
    </Suspense>
  );
}
