import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StatsSection } from "@/components/StatsSection ";
import { Newsletter } from "@/components/Newsletter";
import localFont from "next/font/local";
const montage = localFont({
  src: "../public/fonts/ewara.otf",
  variable: "--font-ewara",
});
export const metadata: Metadata = {
  title: "Ewara Cosmetics",
  description:
    "Luxury beauty products built for modern skincare and self-care experiences.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={montage.className}>
        <Providers>
          <div className="min-h-screen bg-[#f3ede7] text-[#4a2c2a]">
            <Navbar />
            <main>{children}</main>
            <StatsSection />
            <Newsletter />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
