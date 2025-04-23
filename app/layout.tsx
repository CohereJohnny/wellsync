import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
// Remove unused imports
// import { Toaster } from "@/components/ui/toaster";
// import { SupabaseProvider } from "@/context/supabase-context";
// import { MainToolbar } from "@/components/layout/main-toolbar";
// import I18nClientProvider from "@/components/i18n-client-provider";

// Load Inter font
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

// Minimal Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Note: lang="en" might need to be dynamic if not handled by locale layout
    <html lang="en" suppressHydrationWarning>
      <head />
      {/* Apply font class to body */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Children are rendered by the nested locale layout */}
        {children}
      </body>
    </html>
  );
} 