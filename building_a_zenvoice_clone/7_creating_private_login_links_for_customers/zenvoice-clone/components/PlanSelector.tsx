"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { createCheckoutSession } from "@/app/actions/stripe";
import { getPlans } from "@/config";
import { Plan } from "@/config";
import { CheckoutSessionData } from "@/types/auth";

export function PlanSelector({
  successUrl = "/login",
  cancelUrl = "/",
  userEmail,
}: {
  successUrl?: string;
  cancelUrl?: string;
  userEmail?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(userEmail || "");
  const plans = getPlans();

  const handleSelectPlan = async (plan: Plan) => {
    if (!userEmail && plan.mode === "subscription" && !email) {
      alert("Please enter your email address for subscription plans.");
      return;
    }

    setIsLoading(true);
    try {
      const checkoutData: CheckoutSessionData = {
        priceId: plan.priceId,
        mode: plan.mode,
        successUrl,
        cancelUrl,
        customerEmail:
          plan.mode === "subscription" ? userEmail || email : undefined,
        metadata: {
          planName: plan.name,
        },
        invoice_creation:
          plan.mode === "payment" ? { enabled: true } : undefined,
        tax_id_collection:
          plan.mode === "subscription"
            ? {
                enabled: true,
                required: "if_supported",
              }
            : undefined,
      };

      const checkoutUrl = await createCheckoutSession(checkoutData);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!userEmail && (
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address (required for subscription plans)
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-2xl font-bold">{plan.price}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {plan.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan)}
                disabled={
                  isLoading ||
                  (plan.mode === "subscription" && !userEmail && !email)
                }
                className="w-full"
              >
                {isLoading ? "Processing..." : `Select ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
