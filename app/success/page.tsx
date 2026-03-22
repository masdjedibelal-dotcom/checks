import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
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
      <SuccessClient />
    </Suspense>
  );
}
