"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Stripe from "stripe";
import { useRouter } from "next/navigation";

interface StripeAccountManagerProps {
  userId: string;
  onAccountAdded: () => Promise<void>;
}

export default function StripeAccountManager({
  userId,
  onAccountAdded,
}: StripeAccountManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ apiKey: string }>();
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: { apiKey: string }) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const trimmedApiKey = data.apiKey.trim();
      // Validate the API key
      const stripe = new Stripe(trimmedApiKey, {
        apiVersion: "2024-09-30.acacia",
      });
      const account = await stripe.accounts.retrieve();

      // Encrypt the API key using the RPC function
      const { data: encryptedKey, error: encryptError } = await supabase.rpc(
        "encrypt_stripe_api_key",
        {
          api_key: trimmedApiKey,
        }
      );

      if (encryptError) {
        console.error("Encryption error:", encryptError);
        throw encryptError;
      }

      if (typeof encryptedKey !== "string") {
        throw new Error("Encrypted key is not a string");
      }

      // Save the encrypted API key and account ID to the database
      const { error } = await supabase.from("stripe_accounts").upsert(
        {
          user_id: userId,
          encrypted_stripe_api_key: encryptedKey,
          stripe_account_id: account.id,
        },
        {
          onConflict: "user_id,stripe_account_id",
        }
      );

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Account Already Exists",
            description:
              "This Stripe account is already linked to your user account.",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Stripe account added successfully",
        });
      }

      reset(); // Clear the input after successful submission
      await onAccountAdded(); // Call this function after successfully adding an account
      router.refresh(); // Refresh the page to update the UI
    } catch (error) {
      console.error("Error adding Stripe account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add Stripe account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          Add Stripe account
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Your customers will be able to generate, edit & download invoices
          under this account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-900 dark:text-white">
          <li>
            <a
              href="https://dashboard.stripe.com/apikeys/create?name=Invoicely&permissions%5B%5D=rak_file_write&permissions%5B%5D=rak_customer_read&permissions%5B%5D=rak_payment_intent_read&permissions%5B%5D=rak_bucket_connect_read&permissions%5B%5D=rak_credit_note_read&permissions%5B%5D=rak_checkout_session_read&permissions%5B%5D=rak_charge_read"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline dark:text-blue-400"
            >
              Generate a restricted API key
            </a>
          </li>
          <li>
            Do not change any resource permissions and click [Create Key] at the
            bottom right of the Stripe page.
          </li>
          <li>Copy and paste the new API below</li>
        </ol>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              {...register("apiKey", { required: true })}
              type="password"
              placeholder="rk_live_******************"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-0 top-0 h-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Stripe Account"
              )}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          It will populate invoices with your Stripe account public business
          details
        </p>
      </CardContent>
    </Card>
  );
}
