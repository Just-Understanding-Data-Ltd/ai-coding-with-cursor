import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/utils/stripe";
import { BillingService } from "@/lib/billing";
import { createClient } from "@/utils/supabase/server";

const logger = {
  error: (message: string, meta?: unknown) => console.error(message, meta),
  warn: (message: string, meta?: unknown) => console.warn(message, meta),
  info: (message: string, meta?: unknown) => console.info(message, meta),
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("=== Webhook received ===");
  let event: Stripe.Event;
  let rawBody: string;
  const signature = req.headers.get("stripe-signature");

  try {
    // 1. Read the raw body as text
    rawBody = await req.text();

    // 2. Verify signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : ""}`,
      {
        status: 400,
      }
    );
  }

  const supabase = await createClient();
  const billingService = new BillingService(supabase);

  try {
    console.log("=== Processing event ===", event.type);
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await billingService.handleStripeWebhook(event);
        break;

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info(
          `Processing checkout.session.completed for session ${session.id}`
        );

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await billingService.handleStripeWebhook({
            ...event,
            type: "customer.subscription.created",
            data: { object: subscription },
          });
        }
        break;
      }

      default: {
        logger.info(`Unhandled event type ${event.type}`);
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error(`Error processing webhook: ${errorMessage}`, { event });
    return new NextResponse(`Webhook error: ${errorMessage}`, { status: 500 });
  }
}
