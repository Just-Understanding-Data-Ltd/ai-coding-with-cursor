import { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Database } from "../../../packages/supabase/src";

export class BillingService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async handleStripeWebhook(event: Stripe.Event) {
    const { type } = event;

    try {
      switch (type) {
        case "customer.subscription.created":
          return await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription
          );

        case "customer.subscription.updated":
          return await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );

        case "customer.subscription.deleted":
          return await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );

        default:
          console.log(`Unhandled event type ${type}`);
      }
    } catch (error) {
      console.error(`Error handling webhook event ${type}:`, error);
      throw error;
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    const { data: organization, error: orgError } = await this.supabase
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (orgError || !organization) {
      throw new Error(`Organization not found for customer ${customerId}`);
    }

    const { error } = await this.supabase
      .from("organizations")
      .update({
        is_subscribed: true,
      })
      .eq("id", organization.id);

    if (error) {
      throw new Error(
        `Failed to update organization subscription status: ${error.message}`
      );
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    const { data: organization, error: orgError } = await this.supabase
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (orgError || !organization) {
      throw new Error(`Organization not found for customer ${customerId}`);
    }

    const isActive = subscription.status === "active";

    const { error } = await this.supabase
      .from("organizations")
      .update({
        is_subscribed: isActive,
      })
      .eq("id", organization.id);

    if (error) {
      throw new Error(
        `Failed to update organization subscription status: ${error.message}`
      );
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    const { data: organization, error: orgError } = await this.supabase
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (orgError || !organization) {
      throw new Error(`Organization not found for customer ${customerId}`);
    }

    const { error } = await this.supabase
      .from("organizations")
      .update({
        is_subscribed: false,
      })
      .eq("id", organization.id);

    if (error) {
      throw new Error(
        `Failed to update organization subscription status: ${error.message}`
      );
    }
  }
}
