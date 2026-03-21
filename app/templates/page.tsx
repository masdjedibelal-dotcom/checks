import type { Metadata } from "next";
import TemplatesClient from "./TemplatesClient";

export const metadata: Metadata = {
  title: "Templates — CheckKit",
  description: "Interaktive Checks und Rechner für Versicherungsmakler",
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
