import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultSiteConfig, resolveSiteUrl } from "@/lib/public-site";
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
  metadataBase: resolveSiteUrl(),
  title: defaultSiteConfig.project_name,
  description: defaultSiteConfig.hero_subtitle,
  applicationName: defaultSiteConfig.project_name,
  keywords: [
    "projeto social",
    "educação social",
    "voluntariado",
    "Almirante Tamandaré",
    "Lamenha Grande",
  ],
  openGraph: {
    siteName: defaultSiteConfig.project_name,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
