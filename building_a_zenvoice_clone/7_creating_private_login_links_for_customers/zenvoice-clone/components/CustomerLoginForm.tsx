"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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

interface CustomerLoginFormProps {
  handleLogin: (
    email: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function CustomerLoginForm({
  handleLogin,
}: CustomerLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();
  const { toast } = useToast();

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const result = await handleLogin(data.email);
      if (result.success) {
        toast({
          title: "Success",
          description: "Login link sent successfully. Please check your email.",
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Invoice Access</CardTitle>
        <CardDescription>
          Log in to view all your previous single payments and subscriptions as
          invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              {...register("email", { required: true })}
              type="email"
              placeholder="Enter your email"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Access Invoices"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          We&apos;ll send you a secure link to access your invoices. No password
          required.
        </p>
      </CardContent>
    </Card>
  );
}
