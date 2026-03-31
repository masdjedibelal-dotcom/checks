"use client";

import { useLayoutEffect, useState } from "react";

export interface CheckConfig {
  name: string;
  firma: string;
  email: string;
  telefon: string;
  primaryColor: string;
}

export type CheckConfigWithReady = CheckConfig & { isReady: boolean };

const DEFAULT_CONFIG: CheckConfig = {
  name: "Ihre Agentur",
  firma: "Ihre Agentur",
  email: "kontakt@ihre-agentur.de",
  telefon: "089 123 456 78",
  primaryColor: "#1a3a5c",
};

const EMPTY_CONTACT: Pick<CheckConfig, "name" | "firma" | "email" | "telefon"> = {
  name: "",
  firma: "",
  email: "",
  telefon: "",
};

export function useCheckConfig(): CheckConfigWithReady {
  const [config, setConfig] = useState<CheckConfig>(DEFAULT_CONFIG);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setIsReady(true);
      return;
    }

    setConfig((prev) => ({
      ...prev,
      ...EMPTY_CONTACT,
    }));

    fetch(`/api/embed-config?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        if (data.error || !data.name || typeof data.name !== "string") {
          setConfig(DEFAULT_CONFIG);
          return;
        }

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
      .catch(() => {
        setConfig(DEFAULT_CONFIG);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  return { ...config, isReady };
}
