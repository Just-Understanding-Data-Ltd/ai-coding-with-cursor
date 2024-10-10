import React from "react";
import { AlertCircle } from "lucide-react";

export function NoInvoicesFound() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
      <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Invoices Found</h2>
      <p className="text-gray-600 text-center">
        We couldn&apos;t find any invoices associated with your email address.
        If you believe this is an error, please contact support.
      </p>
    </div>
  );
}
