"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/actions/stripe";

interface PaymentButtonProps {
  priceId: string;
  mode: "payment" | "subscription";
  buttonText: string;
}

export function PaymentButton({
  priceId,
  mode,
  buttonText,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await createCheckoutSession({
        priceId,
        mode,
        successUrl: "/dashboard",
        cancelUrl: "/login",
      });
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/90"
    >
      {isLoading ? "Processing..." : buttonText}
    </Button>
  );
}
