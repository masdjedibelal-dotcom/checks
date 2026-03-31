import type { CSSProperties } from "react";
import type { Template } from "@/lib/katalog";

const strikeStyle: CSSProperties = {
  textDecoration: "line-through",
  color: "#ef4444",
  fontSize: "13px",
  marginRight: "6px",
};

type Props = {
  template: Template;
  /** z. B. Konfigurator-Fuß: größere Schrift für Aktionspreis */
  strongClassName?: string;
};

/**
 * Gemeinsame Preiszeile: Freemium-Badge oder durchgestrichener Listenpreis + Aktionspreis.
 */
export function TemplatePriceCore({ template, strongClassName }: Props) {
  if (template.badge === "freemium") {
    return (
      <span className="ck-card-price-badge--freemium">🎁 1 € — Kostenlos starten</span>
    );
  }
  return (
    <>
      {template.preisOriginal != null && (
        <span style={strikeStyle}>{template.preisOriginal} €</span>
      )}
      <strong className={strongClassName}>{template.preis} €</strong>
    </>
  );
}
