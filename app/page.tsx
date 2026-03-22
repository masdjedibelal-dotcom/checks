import type { Metadata } from "next";
import LandingHome from "./LandingHome";
import "./flow-leads-landing.css";

export const metadata: Metadata = {
  title: "FlowLeads — Mehr Anfragen. Direkt von Ihrer Website.",
  description:
    "FlowLeads verwandelt Website-Besucher in qualifizierte Anfragen — mit interaktiven Checks für Versicherungsmakler. Einmalig kaufen, per iFrame einbinden.",
};

export default function HomePage() {
  return <LandingHome />;
}
