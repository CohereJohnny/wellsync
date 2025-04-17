import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";


const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "WellSync AI",
  description: "AI-driven Fault Management Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font using className or variable */}
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
} 