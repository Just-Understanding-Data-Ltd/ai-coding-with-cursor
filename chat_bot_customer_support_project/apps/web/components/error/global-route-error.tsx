"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ContactSupportButton from "@/components/buttons/ContactSupportButton";

export default function Error({
  error,
  resetAction,
}: {
  error: Error & { digest?: string };
  resetAction: () => void;
}) {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-6 p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "An unexpected error occurred."}
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="outline" size="sm" onClick={resetAction}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <ContactSupportButton />
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
