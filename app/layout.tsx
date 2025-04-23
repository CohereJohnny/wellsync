import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/context/supabase-context";
import { MainToolbar } from "@/components/layout/main-toolbar";

// Load Inter font with all required subsets and display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: "WellSync AI",
  description: "AI-driven Fault Management Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <SupabaseProvider>
          <MainToolbar />
          <main className="min-h-screen bg-background pt-16">
            {children}
          </main>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
} 