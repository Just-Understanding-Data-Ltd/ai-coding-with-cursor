"use client";

import { useState } from "react";
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
import { Loader2, Copy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface ShareableLinkGeneratorProps {
  userId: string;
  stripeAccountId: string;
}

export default function ShareableLinkGenerator({
  userId,
  stripeAccountId,
}: ShareableLinkGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

  const generateLink = async () => {
    if (!stripeAccountId) {
      toast({
        title: "Error",
        description: "Stripe account not available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const linkId = uuidv4();
      const { error } = await supabase.from("private_links").insert({
        email: customerEmail,
        user_id: userId,
        stripe_account_id: stripeAccountId,
        link: linkId,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days from now
      });

      if (error) throw error;

      const link = `${window.location.origin}/invoice/login/${userId}/${linkId}`;
      setGeneratedLink(link);
      toast({
        title: "Success",
        description: "Login link generated successfully",
      });
    } catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Error",
        description: "Failed to generate login link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({ title: "Copied", description: "Link copied to clipboard" });
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          Generate Shareable Login Link
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Create a secure login link for your customers to access their
          invoices. They can use this link to self-serve and view their billing
          information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="customerEmail"
            className="text-gray-900 dark:text-white"
          >
            Customer Email (Optional)
          </Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="customer@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <Button
          onClick={generateLink}
          disabled={isLoading || !stripeAccountId}
          className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/90"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generate Link
        </Button>
        {generatedLink && (
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">
              Shareable Login Link
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                value={generatedLink}
                readOnly
                className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={copyLink}
                className="text-gray-900 dark:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this link with your customer to provide them access to their
              invoices.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
