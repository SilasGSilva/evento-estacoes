import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-surface text-primary">
        <SeasonAtmosphere />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <main className="flex-1">{children}</main>
          <footer className="mt-4 border-t border-gray-100/10 py-4">
            <div className="mx-auto flex w-full max-w-full flex-col space-y-3 px-8 text-center sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:text-left lg:px-12">
              <a
                href="https://www.instagram.com/adjd.shangrila/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-primary/80 transition hover:text-primary hover:underline sm:justify-start"
              >
                <Image
                  src="/logo.png"
                  alt="Logo AD Jardim Shangri-la"
                  width={32}
                  height={32}
                  className="h-8 w-8 max-h-8 rounded-full"
                />
                <span className="text-sm">AD Jardim Shangri-la</span>
              </a>

              <p className="text-xs text-gray-400">
                Developed by{" "}
                <a
                  href="https://www.linkedin.com/in/silas-gomes-21761080/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 transition hover:text-gray-500 hover:underline"
                >
                  Silas Gomes
                </a>
                {" "} | Frontend Software Engineer
              </p>
            </div>
          </footer>
        </div>
        <Analytics />
        <WhatsAppSupportFloat />
        {process.env.NODE_ENV === "development" && <PwaManifestDebug />}
      </body>
    </html>
  );
}
