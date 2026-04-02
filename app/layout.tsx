import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowLeads — Digitale Microsites für Versicherungsmakler",
  description:
    "Fertige Microsites mit Rechnern zur Leadgenerierung, Bedarfsanalyse und Gesprächsvorbereitung. Einmal kaufen, dauerhaft nutzen.",
  metadataBase: new URL("https://getflowleads.com"),
  openGraph: {
    title: "FlowLeads — Mehr Anfragen. Weniger Aufwand.",
    description:
      "Fertige Microsites für Versicherungsmakler — zur Leadgenerierung, Bedarfsanalyse oder live in der Beratung.",
    url: "https://getflowleads.com",
    siteName: "FlowLeads",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowLeads — Mehr Anfragen. Weniger Aufwand.",
    description: "Fertige Microsites für Versicherungsmakler.",
  },
  verification: {
    google: "J2h3DZAsWDWdDJ3Tkj-sRovZ99z8jF-kw4DYzWe1eC0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${dmSans.variable} bg-white text-[#111]`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${dmSans.className} antialiased`}
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
