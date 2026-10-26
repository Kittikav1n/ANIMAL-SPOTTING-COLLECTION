import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/ui/createOC/Navigation";
import MapBackground from "@/components/ui/createOC/MapBackground";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Animal Spotting Collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans text-foreground relative">
          <MapBackground />
          <Navigation />
          <div className="flex-1 pb-24 md:pb-0 md:pl-20 relative z-10">
            {children}
          </div>
        </body>
      </html>
  );
}
