import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Wayfindr — Your AI Travel Companion",
  description: "Your pace. Your budget. Your vibe. Tell Wayfindr where you're dreaming of and get a personalised day-by-day itinerary built around you.",
  openGraph: {
    title: "Wayfindr — Your AI Travel Companion",
    description: "Your pace. Your budget. Your vibe. Tell Wayfindr where you're dreaming of and get a personalised day-by-day itinerary built around you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        <NextTopLoader color="#C94A2B" shadow="0 0 10px #C94A2B" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
