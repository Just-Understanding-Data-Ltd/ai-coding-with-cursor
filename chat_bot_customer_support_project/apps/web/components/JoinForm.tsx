"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@repo/supabase";
import { config } from "@/config";
import { checkUserExists } from "../app/join/actions";

const formSchema = z.object({
  email: z.string().email(),
  full_name: z
    .string()
    .transform((name) => name.trim())
    .refine((name) => name.length > 0, {
      message: "Full name is required",
    }),
  password: z.string().min(6).default("FakePassword#123"),
});

type Invitation = Database["public"]["Tables"]["invitations"]["Row"] & {
  organizations: {
    name: string;
  } | null;
};

interface JoinFormProps {
  invitation: Invitation | null; // Marked nullable in case it's invalid
}

export function JoinForm({ invitation }: JoinFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const supabase = createClient();

  // If the invitation itself is invalid or expired, show a centred error state.
  if (!invitation) {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-100 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <div className="text-red-600">Invalid or expired invitation</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: invitation.email,
      full_name: "",
      password: "FakePassword#123",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Check if user exists using the server action
      const userExists = await checkUserExists(data.email);

      if (userExists) {
        // If user exists, send magic link
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${config.auth.siteUrl}${config.auth.authCallbackUrl}`,
          },
        });

        if (magicLinkError) {
          throw magicLinkError;
        }

        setSuccessMsg("We've sent you a magic link. Please check your inbox!");
        return;
      }

      // If user doesn't exist, create a new account
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: `${config.auth.siteUrl}${config.auth.authCallbackUrl}`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Immediately redirect on successful sign-up
      window.location.href = config.auth.authCallbackUrl;
    } catch (error: any) {
      console.error("Join error:", error);
      setErrorMsg(
        error.message || "Failed to process your request. Please try again."
      );
    } finally {
      // Clear loading state if we're not redirecting
      if (!window.location.href.includes(config.auth.authCallbackUrl)) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="px-6 py-8">
            <CardTitle className="text-xl font-semibold">
              Join {invitation.organizations?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            {successMsg && (
              <div className="mb-4 rounded-md bg-green-100 p-3 text-center text-green-800">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  {...form.register("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...form.register("full_name")} />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full"
              >
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
