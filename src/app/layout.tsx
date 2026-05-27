import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grace Holdings | Building Uganda's Future",
  description: "Grace Holdings is Uganda's premier construction, engineering, and procurement company. Specializing in civil engineering, building construction, road & bridge construction, engineering consultancy, and comprehensive supply services.",
  keywords: ["Grace Holdings", "Uganda", "Kampala", "construction", "civil engineering", "building", "roads", "bridges", "procurement", "solar energy", "water treatment"],
  authors: [{ name: "Grace Holdings" }],
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "Grace Holdings | Building Uganda's Future",
    description: "Premier construction, engineering, and procurement company in Uganda.",
    siteName: "Grace Holdings",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grace Holdings | Building Uganda's Future",
    description: "Premier construction, engineering, and procurement company in Uganda.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
