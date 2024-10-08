import Stripe from "stripe";

// Subscription status
export type SubscriptionStatus =
  | { type: "NotSubscribed" }
  | { type: "Subscribed"; planId: string }
  | { type: "PendingSubscription"; checkoutSessionId: string };

// Authentication status
export type AuthStatus =
  | { type: "Authenticated"; userId: string }
  | { type: "NotAuthenticated" };

// Combined user status
export type UserStatus = {
  auth: AuthStatus;
  subscription: SubscriptionStatus;
};

// Checkout mode
export type CheckoutMode = "subscription" | "payment";

// Checkout session data
export interface CheckoutSessionData {
  priceId: string;
  mode: CheckoutMode;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
  invoice_creation?: {
    enabled: boolean;
    invoice_data?: Stripe.Checkout.SessionCreateParams.InvoiceCreation.InvoiceData;
  };
  tax_id_collection?: {
    enabled: boolean;
    required?: "if_supported" | "never";
  };
  customer_update?: {
    name?: "auto" | "never";
    address?: "auto" | "never";
  };
}
