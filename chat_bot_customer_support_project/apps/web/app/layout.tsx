import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import type { Viewport } from "next";
import ClientSideProviders from "@/components/providers/ClientSideProviders";
import { generateSEOMetadata } from "@/lib/seo";
import { GoogleTagManager } from "@next/third-parties/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { config } from "@/config";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// This will pass the relevant metadata to the page, you can overwrite with specific function arguments to generateSEOMetadata()
export const metadata = generateSEOMetadata();

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <NuqsAdapter>
          {process.env.NODE_ENV === "production" && (
            // This is for Google Tag Manager:
            <GoogleTagManager gtmId={config.googleTagManagerId} />
          )}
          <ClientSideProviders>
            <main className="min-h-screen bg-background">{children}</main>
          </ClientSideProviders>
        </NuqsAdapter>
      </body>
    </html>
  );
}
