import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AuthButton from '@/components/AuthButton';

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "My Cigar Cellar",
  description: "Cigar inventory, logging, pairings, and journal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable} bg-black text-white`}>
        <Providers>
  <AuthButton />
  {children}
</Providers>
      </body>
    </html>
  );
}