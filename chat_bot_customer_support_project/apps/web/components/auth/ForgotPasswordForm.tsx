"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { config } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, SendIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(
        error.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="forgot-password-form">
      <form
        onSubmit={handleResetPassword}
        className="space-y-4"
        data-testid="forgot-password-form"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="h-11"
            data-testid="email-input"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
          data-testid="reset-password-button"
        >
          <div className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending reset link...</span>
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </div>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className={`font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={(e) => loading && e.preventDefault()}
            tabIndex={loading ? -1 : 0}
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
