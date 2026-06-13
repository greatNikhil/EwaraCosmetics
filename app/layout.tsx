import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Providers } from "./providers";
import { AuthBootstrap } from "@/components/AuthBootstrap";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StatsSection } from "@/components/StatsSection ";
import { Newsletter } from "@/components/Newsletter";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { Plus_Jakarta_Sans } from "next/font/google";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.ewaraofficial.com";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Ewara Cosmetics",
  title: {
    default: "Ewara Cosmetics | Premium Beauty, Skincare & Self-Care",
    template: "%s | Ewara Cosmetics",
  },
  description:
    "Shop Ewara Cosmetics for premium skincare, hair care, fragrance, and self-care essentials with secure checkout and India-wide delivery.",
  keywords: [
    "Ewara Cosmetics",
    "Ewara Official",
    "skincare",
    "hair care",
    "beauty products",
    "fragrance",
    "cosmetics India",
  ],
  authors: [{ name: "Ewara Cosmetics" }],
  creator: "Ewara Cosmetics",
  publisher: "Ewara Cosmetics",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Ewara Cosmetics",
    title: "Ewara Cosmetics | Premium Beauty, Skincare & Self-Care",
    description:
      "Premium beauty, skincare, hair care, and fragrance products from Ewara Cosmetics.",
    images: [
      {
        url: "/logoewara.jpeg",
        width: 1200,
        height: 630,
        alt: "Ewara Cosmetics",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ewara Cosmetics | Premium Beauty, Skincare & Self-Care",
    description:
      "Discover premium beauty, skincare, hair care, and fragrance products from Ewara Cosmetics.",
    images: ["/logoewara.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: "/logoewara.jpeg",
    shortcut: "/logoewara.jpeg",
    apple: "/logoewara.jpeg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          async
          defer
          strategy="beforeInteractive"
        />
      </head>
      <body className={plusJakartaSans.variable}>
        <AnalyticsScripts />
        <Providers>
          <AuthBootstrap />
          <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
            <Navbar />
            <main className="relative">{children}</main>
            <StatsSection />
            <Newsletter />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
