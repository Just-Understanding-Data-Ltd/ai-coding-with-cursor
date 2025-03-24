"use client";

import GlobalError from "@/components/error/global-route-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <GlobalError error={error} resetAction={reset} />;
}
