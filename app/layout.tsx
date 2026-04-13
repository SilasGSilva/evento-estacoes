import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { PwaManifestDebug } from "@/components/pwa-manifest-debug";
import { SeasonAtmosphere } from "@/components/season-atmosphere";
import { WhatsAppSupportFloat } from "@/components/whatsapp-support-float";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Café & Cura - Estações 2026",
  description:
    "Um encontro para mulheres curadas na raiz e firmadas em sua identidade",
  manifest: "/manifest.json",
  openGraph: {
    title: "Café & Cura - Estações 2026",
    description: "Um encontro para mulheres curadas na raiz e firmadas em sua identidade",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/hero-banner.png",
        width: 1920,
        height: 1080,
        alt: "Banner oficial do evento ESTAÇÕES 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Café & Cura - Estações 2026",
    description: "Um encontro para mulheres curadas na raiz e firmadas em sua identidade",
    images: ["/hero-banner.png"],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32" },
      { url: "/logo.png", sizes: "192x192" },
      { url: "/logo.png", sizes: "512x512" },
    ],
    apple: "/logo.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ESTAÇÕES",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#003366",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className="relative flex min-h-full flex-col overflow-x-hidden bg-surface text-primary">
        <SeasonAtmosphere />
        <div className="relative z-10 flex min-h-full flex-col">{children}</div>
        <Analytics />
        <WhatsAppSupportFloat />
        {process.env.NODE_ENV === "development" && <PwaManifestDebug />}
      </body>
    </html>
  );
}
