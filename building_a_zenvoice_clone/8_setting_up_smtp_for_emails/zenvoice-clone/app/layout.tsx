import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ClientSideProviders from "@/components/providers/ClientSideProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "User Management App",
  description: "A Next.js app with Supabase authentication and user management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class" // Use 'attribute' instead of 'themeAttribute'
          defaultTheme="system"
          enableSystem
        >
          <main className="min-h-screen bg-background">
            <ClientSideProviders>{children}</ClientSideProviders>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
