import { permanentRedirect } from "next/navigation";

/** Öffentliche Vorlagen-Galerie — nicht verlinkt; Nutzer sollen nur die FlowLeads-Startseite nutzen. */
export default function TemplatesPage() {
  permanentRedirect("/");
}
