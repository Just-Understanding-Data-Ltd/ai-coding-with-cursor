"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { config } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { useTheme } from "next-themes";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${config.auth.siteUrl}${config.auth.authCallbackUrl}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-6 w-full min-w-[300px] max-w-lg mx-auto"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full h-10"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className={`w-full ${
          theme === "dark"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        <div className="w-full flex items-center justify-center">
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </>
          )}
        </div>
      </Button>
      <div className="w-full">
        {(message || error) && (
          <>
            {message && (
              <Alert
                className={`mt-4 ${
                  theme === "dark"
                    ? "bg-green-800 text-green-100"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert
                variant="destructive"
                className={`mt-4 ${
                  theme === "dark"
                    ? "bg-red-800 text-red-100"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </form>
  );
}
