import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/ui/createOC/Navigation";

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
      <body className="h-full flex flex-col font-sans bg-background text-foreground overflow-hidden">
        <Navigation />
        <div className="flex-1 flex flex-col h-full md:pl-20">
          {children}
        </div>
      </body>
    </html>
  );
}
