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
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Ewara Cosmetics",
  description:
    "Luxury beauty products built for modern skincare and self-care experiences.",
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
