"use client";

import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { usePathname, useSearchParams } from "next/navigation";
import { gtmPageView } from "@/lib/gtm";
import { createQueryClient } from "@/lib/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && pathname) {
      gtmPageView({ page_path: pathname });
    }
  }, [pathname, searchParams]);

  return null;
}

interface ClientSideProvidersProps {
  children: ReactNode;
  dehydratedState?: unknown;
}

export default function ClientSideProviders({
  children,
  dehydratedState,
}: ClientSideProvidersProps) {
  const queryClient = createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense>
            <AnalyticsTracker />
          </Suspense>
          {children}
          <Toaster
            position="top-right"
            containerStyle={{
              zIndex: 100000000,
            }}
            toastOptions={{
              duration: 5000,
              className: "bg-background text-foreground border rounded-md",
              style: {
                padding: "0.75rem",
                minWidth: "200px",
              },
              success: {
                className: "border-success",
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff",
                },
              },
              error: {
                className: "border-destructive",
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </ThemeProvider>
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
