"use client";

import { useEffect, useState } from "react";
import { InvoiceDisplay } from "@/components/invoices/InvoiceDisplay";
import { fetchInvoicesAction } from "@/app/actions/fetchInvoicesAction";
import { CustomInvoice } from "@/types/customTypes";
import { PulseLoader } from "react-spinners";

export default function CustomerInvoicePage({
  params,
}: {
  params: { linkId: string };
}) {
  const [invoices, setInvoices] = useState<{
    singlePayments: CustomInvoice[];
    subscriptions: CustomInvoice[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const result = await fetchInvoicesAction(params.linkId);
        setInvoices(result);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError(
          "An error occurred while fetching your invoices. Please try again later."
        );
      }
    }

    loadInvoices();
  }, [params.linkId]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Invoices</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!invoices) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Loading Your Invoices</h1>
        <PulseLoader color="#4F46E5" size={15} margin={2} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Invoices</h1>
      <InvoiceDisplay linkId={params.linkId} initialInvoices={invoices} />
    </div>
  );
}
