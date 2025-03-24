"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { config } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleOAuthLogin = async (provider: "google") => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("OAuth login error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${config.auth.siteUrl}${config.auth.authCallbackUrl}`,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Check your email for the login link!");
    } catch (error: any) {
      console.error("Magic link login error:", error);
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        toast.success("Signed in successfully!");
        // Redirect to callback handler which will redirect to the appropriate page
        router.push(config.auth.authCallbackUrl);
        return;
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMagicLinkForm = () => {
    if (!loading) {
      setShowMagicLinkForm(!showMagicLinkForm);
    }
  };

  return (
    <div className="space-y-6" data-testid="login-form">
      <Button
        onClick={() => handleOAuthLogin("google")}
        disabled={loading}
        variant="outline"
        className="relative w-full h-11 bg-white border-gray-300 hover:bg-gray-50 font-medium"
        data-testid="google-login-button"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <div className="absolute left-4 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
              />
              <path
                fill="#34A853"
                d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
              />
              <path
                fill="#4A90E2"
                d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
              />
            </svg>
          </div>
        )}
        <span>{loading ? "Signing in..." : "Continue with Google"}</span>
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>

      {!showMagicLinkForm ? (
        <div className="space-y-4">
          <form
            onSubmit={handlePasswordLogin}
            className="space-y-4"
            data-testid="password-login-form"
          >
            <div className="space-y-2">
              <Label htmlFor="email-password" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email-password"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-11"
                data-testid="email-input-password"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className={`text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 ${
                    loading ? "pointer-events-none opacity-50" : ""
                  }`}
                  onClick={(e) => loading && e.preventDefault()}
                  tabIndex={loading ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
                data-testid="password-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="password-submit-button"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign in with Password</span>
                  </>
                )}
              </div>
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={toggleMagicLinkForm}
              disabled={loading}
              className={`text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 ${
                loading ? "opacity-50" : ""
              }`}
            >
              Sign in with Magic Link instead
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <form
            onSubmit={handleOTPLogin}
            className="space-y-4"
            data-testid="email-login-form"
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
              data-testid="email-submit-button"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Magic Link</span>
                  </>
                )}
              </div>
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={toggleMagicLinkForm}
              disabled={loading}
              className={`text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 ${
                loading ? "opacity-50" : ""
              }`}
            >
              Sign in with Password instead
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className={`font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={(e) => loading && e.preventDefault()}
            tabIndex={loading ? -1 : 0}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
