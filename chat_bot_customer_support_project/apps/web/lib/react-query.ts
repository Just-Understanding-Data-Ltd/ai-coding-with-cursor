import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default settings for queries
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 1,
      },
    },
  });
}
