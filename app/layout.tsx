import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--nv-font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--nv-font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Newen — Lo que sentís, puede ser acompañado",
    template: "%s | Newen",
  },
  description:
    "Plataforma que conecta personas en momentos difíciles con counselors humanistas verificados. Buscanos.",
  keywords: [
    "counseling", "acompañamiento", "salud mental", "bienestar",
    "terapia", "counselor", "Newen", "ayuda emocional",
  ],
  authors: [{ name: "Clr. Ari Mangini — Etherea" }],
  creator: "Etherea",
  publisher: "Etherea",
  metadataBase: new URL("https://app.buscanos.com.ar"),
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Newen",
    title: "Newen — Lo que sentís, puede ser acompañado",
    description: "Conectamos personas con counselors humanistas verificados.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
  appleWebApp: {
    capable: true,
    title: "Newen",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#7dba8f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Newen" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${dmSerifDisplay.variable} ${dmSans.variable}`}
        style={{
          background: "var(--nv-bg-base)",
          color: "var(--nv-text-primary)",
          fontFamily: "var(--nv-font-body)",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
