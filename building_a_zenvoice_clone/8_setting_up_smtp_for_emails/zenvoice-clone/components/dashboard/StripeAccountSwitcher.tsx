"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface StripeAccount {
  id: number;
  stripe_account_id: string;
  encrypted_stripe_api_key: string;
  name: string;
  icon: string | null;
}

interface StripeAccountSwitcherProps {
  accounts: StripeAccount[];
  setStripeAccounts: React.Dispatch<React.SetStateAction<StripeAccount[]>>;
  selectedAccountId: string | null;
  onAccountSelect: (accountId: string) => void;
  onAccountsChanged: () => void;
  setSelectedAccountId: (accountId: string | null) => void;
}

export default function StripeAccountSwitcher({
  accounts,
  setStripeAccounts,
  selectedAccountId,
  onAccountSelect,
  onAccountsChanged,
  setSelectedAccountId,
}: StripeAccountSwitcherProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<StripeAccount | null>(
    null
  );
  const [newApiKey, setNewApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      const updatedAccounts = await Promise.all(
        accounts.map(async (account) => {
          const { data: decryptedKey, error } = await supabase.rpc(
            "decrypt_stripe_api_key",
            { encrypted_key: account.encrypted_stripe_api_key }
          );
          if (error) {
            console.error("Error decrypting API key:", error);
            return account;
          }
          const details = await fetchStripeAccountDetails(decryptedKey);
          return { ...account, name: details.name, icon: details.icon };
        })
      );
      setStripeAccounts(updatedAccounts);
    };

    fetchAccountDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (account: StripeAccount) => {
    setEditingAccount(account);
    setNewApiKey("");
    setIsEditModalOpen(true);
  };

  const handleDelete = async (account: StripeAccount) => {
    const { error } = await supabase
      .from("stripe_accounts")
      .delete()
      .eq("id", account.id);

    if (error) {
      console.error("Error deleting Stripe account:", error);
      toast({
        title: "Error",
        description: "Failed to delete Stripe account",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Stripe account deleted successfully",
      });

      if (selectedAccountId === account.stripe_account_id) {
        setSelectedAccountId(null);
      }

      setStripeAccounts((prevAccounts) =>
        prevAccounts.filter((a) => a.id !== account.id)
      );
      onAccountsChanged();
      router.refresh();
    }
  };

  const handleEditSubmit = async () => {
    if (!editingAccount) return;

    setIsLoading(true);
    try {
      const isValid = await validateApiKey(newApiKey.trim());
      if (!isValid) {
        throw new Error("Invalid Stripe API key");
      }

      const { data: encryptedKey, error: encryptError } = await supabase.rpc(
        "encrypt_stripe_api_key",
        { api_key: newApiKey.trim() }
      );

      if (encryptError) throw encryptError;

      const { error } = await supabase
        .from("stripe_accounts")
        .update({ encrypted_stripe_api_key: encryptedKey })
        .eq("id", editingAccount.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stripe API key updated successfully",
      });

      setIsEditModalOpen(false);
      setNewApiKey("");

      // Update the local state
      setStripeAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === editingAccount.id
            ? { ...account, encrypted_stripe_api_key: encryptedKey }
            : account
        )
      );

      onAccountsChanged();
      router.refresh();
    } catch (error) {
      console.error("Error updating Stripe API key:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update Stripe API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccount = accounts.find(
    (account) => account.stripe_account_id === selectedAccountId
  );

  return (
    <div className="space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedAccount ? (
              <div className="flex items-center">
                {selectedAccount.icon && (
                  <Image
                    src={selectedAccount.icon}
                    alt={selectedAccount.name}
                    width={24}
                    height={24}
                  />
                )}
                {selectedAccount.name}
              </div>
            ) : (
              "Select Account"
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Stripe Accounts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                className="flex justify-between"
              >
                <div
                  className="flex items-center"
                  onClick={() => onAccountSelect(account.stripe_account_id)}
                >
                  {account.icon && (
                    <Image
                      src={account.icon}
                      alt={account.name}
                      width={24}
                      height={24}
                    />
                  )}
                  <span>{account.name}</span>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(account);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(account);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No accounts available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Stripe API Key</h2>
            <Input
              type="password"
              placeholder="Enter new API key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setIsEditModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={isLoading}>
                {isLoading ? "Updating..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("/api/validate-stripe-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      throw new Error("Invalid API key");
    }

    return true;
  } catch (error) {
    console.error("Error validating Stripe API key:", error);
    return false;
  }
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
