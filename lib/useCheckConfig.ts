"use client";

import { useLayoutEffect, useState } from "react";

export interface CheckConfig {
  name: string;
  firma: string;
  email: string;
  telefon: string;
  primaryColor: string;
}

const DEFAULT_CONFIG: CheckConfig = {
  name: "Max Mustermann",
  firma: "Mustermann Versicherungen",
  email: "kontakt@mustermann-versicherungen.de",
  telefon: "089 123 456 78",
  primaryColor: "#1a3a5c",
};

const EMPTY_CONTACT: Pick<CheckConfig, "name" | "firma" | "email" | "telefon"> = {
  name: "",
  firma: "",
  email: "",
  telefon: "",
};

export function useCheckConfig(): CheckConfig {
  const [config, setConfig] = useState<CheckConfig>(DEFAULT_CONFIG);

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return;

    setConfig((prev) => ({
      ...prev,
      ...EMPTY_CONTACT,
    }));

    fetch(`/api/embed-config?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        if (data.error || !data.name || typeof data.name !== "string") return;

        const accent =
          (typeof data.accent_color === "string" && data.accent_color.trim()) ||
          (typeof data.primaryColor === "string" && data.primaryColor.trim()) ||
          DEFAULT_CONFIG.primaryColor;

        setConfig({
          name: String(data.name).trim(),
          firma:
            typeof data.firma === "string" ? data.firma.trim() : "",
          email:
            typeof data.email === "string" ? data.email.trim() : "",
          telefon:
            typeof data.telefon === "string" ? data.telefon.trim() : "",
          primaryColor: accent,
        });
      })
      .catch(() => {});
  }, []);

  return config;
}
