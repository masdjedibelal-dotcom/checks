import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
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
      className={`${GeistSans.variable} ${instrumentSerif.variable} ${dmSans.variable} bg-white text-[#111]`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className={`${GeistSans.className} antialiased`}
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
