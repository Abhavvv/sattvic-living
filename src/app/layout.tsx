import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sattvic Living | Premium Wellness, Yoga & Ayurveda Platform",
  description: "A sanctuary for spiritual health, organic nourishment, mindfulness, and Ayurvedic wisdom. Discover yoga courses, meal plans, books, and articles.",
  keywords: ["Wellness", "Yoga", "Ayurveda", "Sattvic", "Mindfulness", "Organic Meals", "Healthy Living"],
  authors: [{ name: "Sattvic Living Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-[#F8F4EC] text-[#2D3E35]`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
