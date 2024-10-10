"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await handleLogin(formData);
      if (result.success) {
        setIsLinkSent(true);
        setEmail(formData.get("email") as string);
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

  function resetForm() {
    setIsLinkSent(false);
    setEmail("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex items-center justify-between">
          <Link href={"/"}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {config.name}
          </h2>
        </div>
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Customer Invoice Access
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {isLinkSent
                ? "Check your email for the login link."
                : "Log in to view all your previous single payments and subscriptions as invoices."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLinkSent ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We&apos;ve sent a login link to <strong>{email}</strong>.
                  Please check your inbox and click the link to access your
                  invoices.
                </p>
                <Button
                  onClick={resetForm}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Send to a different email
                </Button>
              </div>
            ) : (
              <form action={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isLoading ? "Processing..." : "Access Invoices"}
                </Button>
              </form>
            )}
            {!isLinkSent && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                We&apos;ll send you a secure link to access your invoices. No
                password required.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
