"use client";

import { redirect } from "next/navigation";
import { InvoiceDisplay } from "@/components/invoices/InvoiceDisplay";
import { ThemeProvider } from "next-themes";

export default function InvoiceAccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token as string;

  if (!token) {
    redirect("/invoice/login");
  }

  // In a real implementation, you would validate the token here
  // and fetch the customer's invoices based on the token

  console.log(`Accessing private invoices page with token: ${token}`);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="container mx-auto p-4">
        <InvoiceDisplay
          initialInvoices={{ singlePayments: [], subscriptions: [] }}
          linkId={token}
        />
      </div>
    </ThemeProvider>
  );
}
