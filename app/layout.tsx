import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CheckKit — Checks & Rechner für Makler",
  description:
    "Interaktive Versicherungs-Checks und Rechner — kaufen, konfigurieren, per iFrame einbetten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${instrumentSerif.variable} bg-white text-[#111]`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className={`${inter.className} antialiased`}
        style={{
          background: "#ffffff",
          color: "#111111",
        }}
      >
        {children}
      </body>
    </html>
  );
}
