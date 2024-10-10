"use client";

import React, { useState, useEffect } from "react";
import { InvoiceTable } from "./InvoiceTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomInvoice } from "@/types/customTypes";
import { fetchInvoicesAction } from "@/app/actions/fetchInvoicesAction";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { PulseLoader } from "react-spinners";
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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const result = await fetchInvoicesAction(linkId);
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Loading Your Invoices</h1>
        <PulseLoader color="#4F46E5" size={15} margin={2} />
      </div>
    );
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
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {theme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-gray-100 dark:bg-gray-800 rounded-none border-b border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="single-payments"
            className="w-1/2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-none transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
          >
            Single Payments
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="w-1/2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-none transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
          >
            Subscriptions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="single-payments" className="mt-6 px-4">
          <InvoiceTable
            invoices={invoices.singlePayments}
            type="single-payment"
            onInvoiceUpdate={(updatedInvoices) =>
              handleInvoiceUpdate(updatedInvoices, "single-payments")
            }
          />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-6 px-4">
          <InvoiceTable
            invoices={invoices.subscriptions}
            type="subscription"
            onInvoiceUpdate={(updatedInvoices) =>
              handleInvoiceUpdate(updatedInvoices, "subscriptions")
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
