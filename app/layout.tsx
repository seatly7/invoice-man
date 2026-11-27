import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { cn } from "cn";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Invoice-Man - Cetak Invoice & Struk Kasir",
  description: "Aplikasi cetak invoice PDF dan struk kasir thermal 80mm cepat & hemat kuota.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
   <html lang="id" className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
