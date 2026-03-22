import type { Metadata } from "next";
import Link from "next/link";
import { ImpressumLegalContent, LegalDocPage } from "@/content/flowleadsSiteLegal";
import "../legal-pages.css";

export const metadata: Metadata = {
  title: "Impressum — FlowLeads",
  description: "Impressum und Anbieterkennzeichnung FlowLeads.",
};

export default function ImpressumPage() {
  return (
    <LegalDocPage
      title="Impressum"
      prepend={
        <Link href="/" className="flow-leads-legal-back">
          ← Zurück zur Startseite
        </Link>
      }
    >
      <ImpressumLegalContent />
    </LegalDocPage>
  );
}
