"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { config } from "@/config";

interface CustomerLoginFormProps {
  handleLogin: (formData: FormData) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    link?: string;
  }>;
}

export default function CustomerLoginForm({
  handleLogin,
}: CustomerLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await handleLogin(formData);
      if (result.success) {
        toast({
          title: "Success",
          description:
            result.message ||
            "Login link sent successfully. Please check your email.",
        });
      } else {
        throw new Error(result.error || "Failed to create login link");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex items-center justify-between">
          <Link href={"/"}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 text-foreground dark:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
            {config.name}
          </h2>
        </div>
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white">
              Customer Invoice Access
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Log in to view all your previous single payments and subscriptions
              as invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground dark:text-gray-300"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-white dark:bg-gray-700 text-foreground dark:text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                {isLoading ? "Processing..." : "Access Invoices"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              We&apos;ll send you a secure link to access your invoices. No
              password required.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
