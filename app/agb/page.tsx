import type { Metadata } from "next";
import Link from "next/link";
import { AgbLegalContent, LegalDocPage } from "@/content/flowleadsSiteLegal";
import "../legal-pages.css";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen — FlowLeads",
  description: "AGB / Nutzungsbedingungen für die technischen Tools von FlowLeads.",
};

export default function AgbPage() {
  return (
    <LegalDocPage
      title="Nutzungsbedingungen"
      prepend={
        <Link href="/" className="flow-leads-legal-back">
          ← Zurück zur Startseite
        </Link>
      }
    >
      <AgbLegalContent />
    </LegalDocPage>
  );
}
