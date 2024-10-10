"use client";

import { useState, useEffect, useCallback } from "react";
import StripeAccountManager from "@/components/dashboard/StripeAccountManager";
import StripeAccountSwitcher from "@/components/dashboard/StripeAccountSwitcher";
import ShareableLinkGenerator from "@/components/dashboard/ShareableLinkGenerator";
import { createClient } from "@/utils/supabase/client";
import { StripeAccount as CustomStripeAccount } from "@/types/customTypes";

type StripeAccount = CustomStripeAccount;

// Update the prop type
interface DashboardProps {
  userId: string;
  initialStripeAccounts: StripeAccount[];
}

export default function Dashboard({
  userId,
  initialStripeAccounts,
}: DashboardProps) {
  const [stripeAccounts, setStripeAccounts] = useState<StripeAccount[]>(
    initialStripeAccounts
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const supabase = createClient();

  useEffect(() => {
    if (stripeAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(stripeAccounts[0].stripe_account_id);
    }
  }, [stripeAccounts, selectedAccountId]);

  const refreshAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("stripe_accounts")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching Stripe accounts:", error);
    } else {
      const accountsWithDetails = await Promise.all(
        (data as StripeAccount[]).map(async (account) => {
          const { data: decryptedKey, error } = await supabase.rpc(
            "decrypt_stripe_api_key",
            { encrypted_key: account.encrypted_stripe_api_key || "" } // Add fallback for null
          );
          if (error) {
            console.error("Error decrypting API key:", error);
            return { ...account, name: "Unknown", icon: null };
          }
          const details = await fetchStripeAccountDetails(decryptedKey);
          return { ...account, ...details };
        })
      );
      setStripeAccounts(accountsWithDetails);
    }
  }, [userId, supabase]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="lg:col-span-2">
        <StripeAccountManager
          userId={userId}
          onAccountAdded={refreshAccounts}
        />
      </div>
      <div className="space-y-8">
        <StripeAccountSwitcher
          // @ts-expect-error: StripeAccount type is not fully defined
          accounts={stripeAccounts}
          setStripeAccounts={
            setStripeAccounts as React.Dispatch<
              React.SetStateAction<CustomStripeAccount[]>
            >
          }
          selectedAccountId={selectedAccountId}
          onAccountSelect={setSelectedAccountId}
          onAccountsChanged={refreshAccounts}
          setSelectedAccountId={setSelectedAccountId}
        />
        <ShareableLinkGenerator
          userId={userId}
          stripeAccountId={selectedAccountId || ""}
        />
      </div>
    </div>
  );
}

async function fetchStripeAccountDetails(
  apiKey: string
): Promise<{ name: string; icon: string | null }> {
  try {
    const response = await fetch("/api/get-stripe-account-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Stripe account details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Stripe account details:", error);
    return { name: "Unknown", icon: null };
  }
}
