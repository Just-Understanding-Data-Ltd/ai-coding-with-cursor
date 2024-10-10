"use server";

import { stripe } from "@/utils/stripe";
import { createClient } from "@/utils/supabase/server";
import { config } from "@/config";
import { CheckoutSessionData, UserStatus } from "@/types/auth";

async function createOrRetrieveCustomer(email: string): Promise<string> {
  const customers = await stripe.customers.list({ email: email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  } else {
    const newCustomer = await stripe.customers.create({ email: email });
    return newCustomer.id;
  }
}

export async function createCheckoutSession(
  data: CheckoutSessionData
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userStatus: UserStatus = {
    auth: user
      ? { type: "Authenticated", userId: user.id }
      : { type: "NotAuthenticated" },
    subscription: { type: "NotSubscribed" },
  };

  let stripeCustomerId: string | null = null;

  if (user) {
    const { data: userData, error } = await supabase
      .from("users")
      .select("stripe_customer_id, is_subscribed, stripe_price_id")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }

    if (userData.is_subscribed) {
      userStatus.subscription = {
        type: "Subscribed",
        planId: userData.stripe_price_id || "",
      };
    }

    stripeCustomerId = userData.stripe_customer_id;
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [{ price: data.priceId, quantity: 1 }],
    mode: data.mode,
    success_url: `${config.auth.siteUrl}${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.auth.siteUrl}${data.cancelUrl}`,
    metadata: {
      ...data.metadata,
      userStatus: JSON.stringify(userStatus),
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  };

  if (user) {
    sessionParams.client_reference_id = user.id;
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    }
  } else if (data.mode === "subscription" && data.customerEmail) {
    // For non-authenticated users making a subscription, create or retrieve a customer
    stripeCustomerId = await createOrRetrieveCustomer(data.customerEmail);
    sessionParams.customer = stripeCustomerId;
  } else if (data.mode === "payment") {
    // For one-time payments, we can use customer_email
    sessionParams.customer_email = data.customerEmail;
  }

  // Add invoice creation for one-time payments
  if (data.mode === "payment" && data.invoice_creation?.enabled) {
    sessionParams.invoice_creation = {
      enabled: data.invoice_creation.enabled,
      invoice_data: data.invoice_creation.invoice_data,
    };
  }

  // Add optional tax ID collection and customer update only when we have a customer
  if (data.tax_id_collection?.enabled && sessionParams.customer) {
    sessionParams.tax_id_collection = {
      enabled: true,
    };
    sessionParams.customer_update = {
      name: "auto",
      address: "auto",
    };
  }

  if (data.mode === "subscription") {
    sessionParams.subscription_data = {
      trial_period_days: 14,
      metadata: {
        ...data.metadata,
        userStatus: JSON.stringify(userStatus),
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (session.url) {
    return session.url;
  } else {
    throw new Error("Failed to create checkout session");
  }
}

// New function to handle successful subscriptions
export async function handleSuccessfulSubscription(sessionId: string) {
  const supabase = createClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    const userId = session.metadata?.userId;
    if (userId) {
      await supabase
        .from("users")
        .update({ is_subscribed: true })
        .eq("id", userId);
    }
  }
}

export async function createBillingPortalSession(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (error || !userData?.stripe_customer_id) {
    throw new Error("Failed to fetch Stripe customer ID");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: userData.stripe_customer_id,
    return_url: `${config.auth.siteUrl}${config.auth.dashboardUrl}`,
  });

  return session.url;
}
