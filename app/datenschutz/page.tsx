import type { Metadata } from "next";
import Link from "next/link";
import { DatenschutzLegalContent, LegalDocPage } from "@/content/flowleadsSiteLegal";
import "../legal-pages.css";

export const metadata: Metadata = {
  title: "Datenschutz — FlowLeads",
  description: "Datenschutzerklärung der FlowLeads-Website.",
};

export default function DatenschutzPage() {
  return (
    <LegalDocPage
      title="Datenschutzerklärung"
      prepend={
        <Link href="/" className="flow-leads-legal-back">
          ← Zurück zur Startseite
        </Link>
      }
    >
      <DatenschutzLegalContent />
    </LegalDocPage>
  );
}
