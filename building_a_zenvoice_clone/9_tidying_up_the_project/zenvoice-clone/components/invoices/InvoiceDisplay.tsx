"use client";

import React, { useState, useEffect } from "react";
import { InvoiceTable } from "./InvoiceTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomInvoice } from "@/types/customTypes";
import { fetchInvoicesAction } from "@/app/actions/fetchInvoicesAction";

interface InvoiceDisplayProps {
  initialInvoices: {
    singlePayments: CustomInvoice[];
    subscriptions: CustomInvoice[];
  };
  linkId: string;
}

export function InvoiceDisplay({
  initialInvoices,
  linkId,
}: InvoiceDisplayProps) {
  const [activeTab, setActiveTab] = useState("single-payments");
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const result = await fetchInvoicesAction(
          linkId,
          activeTab as "single-payments" | "subscriptions"
        );
        setInvoices(result);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [activeTab, linkId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleInvoiceUpdate = (
    updatedInvoices: CustomInvoice[],
    type: "single-payments" | "subscriptions"
  ) => {
    setInvoices((prev) => ({
      ...prev,
      [type]: updatedInvoices,
    }));
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="single-payments">Single Payments</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
      </TabsList>
      <TabsContent value="single-payments">
        <InvoiceTable
          invoices={invoices.singlePayments}
          type="single-payment"
          onInvoiceUpdate={(updatedInvoices) =>
            handleInvoiceUpdate(updatedInvoices, "single-payments")
          }
        />
      </TabsContent>
      <TabsContent value="subscriptions">
        <InvoiceTable
          invoices={invoices.subscriptions}
          type="subscription"
          onInvoiceUpdate={(updatedInvoices) =>
            handleInvoiceUpdate(updatedInvoices, "subscriptions")
          }
        />
      </TabsContent>
    </Tabs>
  );
}
