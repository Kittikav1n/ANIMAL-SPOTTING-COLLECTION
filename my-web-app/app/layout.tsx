import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/ui/createOC/navigation";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

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
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col font-sans bg-background text-foreground overflow-hidden">
        <AuthProvider>
          <Navigation />
          <div className="flex-1 flex flex-col h-full sm:pl-20">
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                classNames: {
                  toast: "rounded-xl border shadow-md font-sans",
                  warning: "!bg-[#FBF3D5] !text-[#6B4E16] !border-[#B88928]/30",
                  success: "!bg-[#E0ECDD] !text-[#2F452C] !border-[#526E4E]/30", 
                  error: "!bg-[#FDECEC] !text-[#AE3C32] !border-[#AE3C32]/30", 
                  info: "!bg-white !text-slate-800 !border-slate-200",
                },
              }}
            />
          </div>
        </AuthProvider>
        <script
          src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"
          async
        />
      </body>
    </html>
  );
}
