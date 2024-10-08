import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { config } from "@/config";
import { Database } from "@/types/types";
import { SubscriptionStatus } from "@/types/auth";

// Implement a basic logging mechanism (consider replacing with a more robust solution in production)
const logger = {
  error: (message: string, meta?: unknown) => console.error(message, meta),
  warn: (message: string, meta?: unknown) => console.warn(message, meta),
  info: (message: string, meta?: unknown) => console.info(message, meta),
};

// Select the appropriate Stripe configuration based on the environment
const stripeConfig =
  config.stripe[
    process.env.NODE_ENV === "production" ? "production" : "development"
  ];

// Function to update user information in the database
async function updateUser(
  userId: string,
  updateData: Partial<Database["public"]["Tables"]["users"]["Update"]>
) {
  const supabase = createAdminClient();

  const { error: updateError } = await supabase
    .from("users")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    logger.error(`Error updating user: ${updateError.message}`);
    throw new Error(`Failed to update user: ${updateError.message}`);
  }

  logger.info(`User updated successfully`);
}

// Function to create a new user based on Stripe customer information
async function createUserFromStripeCustomer(
  stripeCustomerId: string,
  email: string
) {
  const supabase = createAdminClient();

  logger.info(`Attempting to create user with email: ${email}`);

  // First, check if a user with this email already exists
  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    logger.info(
      `User with email ${email} already exists, returning existing user ID`
    );
    return existingUser.id;
  }

  if (existingUserError && existingUserError.code !== "PGRST116") {
    logger.error(
      `Error checking for existing user: ${existingUserError.message}`
    );
    throw new Error(
      `Error checking for existing user: ${existingUserError.message}`
    );
  }

  // If no existing user, create a new one
  const { data: newUser, error: createUserError } =
    await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { stripe_customer_id: stripeCustomerId },
    });

  if (createUserError) {
    logger.error(`Failed to create auth user: ${createUserError.message}`);
    throw new Error(`Failed to create auth user: ${createUserError.message}`);
  }

  logger.info(`Auth user created with ID: ${newUser.user.id}`);

  // Allow time for the database trigger to create the user in the public.users table
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify that the user was created in the public.users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", newUser.user.id)
    .single();

  if (userError || !userData) {
    logger.error(
      `Failed to verify user creation in public.users table: ${
        userError?.message || "User not found"
      }`
    );
    throw new Error(
      `Failed to verify user creation in public.users table: ${
        userError?.message || "User not found"
      }`
    );
  }

  logger.info(
    `User successfully created and verified in public.users table with ID: ${newUser.user.id}`
  );

  return newUser.user.id;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  // Validate the Stripe webhook event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (err) {
    const errorMessage = `Webhook Error: ${
      err instanceof Error ? err.message : "Unknown Error"
    }`;
    logger.error(errorMessage);
    return new NextResponse(errorMessage, { status: 400 });
  }

  try {
    // Process different types of Stripe events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info(
          `Processing checkout.session.completed for session ${session.id}`
        );

        let userId = session.client_reference_id;
        const userEmail =
          session.customer_details?.email || session.customer_email;

        if (!userId && userEmail) {
          logger.info(
            `No user ID found, attempting to create user with email: ${userEmail}`
          );
          try {
            userId = await createUserFromStripeCustomer(
              session.customer as string,
              userEmail
            );
            logger.info(`Created new user with ID: ${userId}`);
          } catch (error) {
            logger.error(
              `Failed to create user: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }

        if (userId) {
          let subscriptionStatus: SubscriptionStatus = {
            type: "NotSubscribed",
          };

          if (session.mode === "subscription") {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            subscriptionStatus = {
              type: "Subscribed",
              planId: subscription.items.data[0].price.id,
            };
          } else if (session.mode === "payment") {
            subscriptionStatus = {
              type: "Subscribed",
              planId:
                session.metadata?.planId ||
                session.line_items?.data[0]?.price?.id ||
                "",
            };
          }

          try {
            await updateUser(userId, {
              is_subscribed: subscriptionStatus.type === "Subscribed",
              stripe_customer_id: session.customer as string,
              stripe_price_id:
                subscriptionStatus.type === "Subscribed"
                  ? subscriptionStatus.planId
                  : null,
            });
            logger.info(`Updated user ${userId} with subscription status`);
          } catch (error) {
            logger.error(
              `Failed to update user: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        } else {
          logger.error("User ID not found and could not be created");
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Retrieve the checkout session that created this subscription
        const session = await stripe.checkout.sessions.retrieve(
          subscription.metadata.checkout_session_id
        );
        const userId = session.client_reference_id;

        if (userId) {
          await updateUser(userId, {
            is_subscribed: subscription.status === "active",
            stripe_price_id: subscription.items.data[0].price.id,
          });
        } else {
          logger.error("User ID not found in session client_reference_id");
        }
        break;
      }
      case "invoice.paid": {
        // Handle successful invoice payment
        const invoice = event.data.object as Stripe.Invoice;
        // @ts-expect-error - metadata is not always available
        const userId = invoice.metadata.userId;

        if (userId) {
          await updateUser(userId, { is_subscribed: true });
        } else {
          logger.error("User ID not found in invoice metadata");
        }
        break;
      }
      case "invoice.payment_failed": {
        // Handle failed invoice payment
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn(`Payment failed for invoice ${invoice.id}`);
        // Consider implementing user notification or recovery action
        break;
      }
      case "customer.updated": {
        // Handle customer information updates
        const customer = event.data.object as Stripe.Customer;
        const userId = customer.metadata.supabaseUuid;

        if (userId) {
          await updateUser(userId, {
            email: customer.email || null,
            full_name: customer.name || null,
          });
        } else {
          logger.error("User ID not found in customer metadata");
        }
        break;
      }
      case "customer.deleted": {
        // Handle customer deletion
        const customer = event.data.object as Stripe.Customer;
        const userId = customer.metadata.supabaseUuid;

        if (userId) {
          await updateUser(userId, {
            is_subscribed: false,
            stripe_customer_id: null,
            stripe_price_id: null,
          });
        } else {
          logger.error("User ID not found in customer metadata");
        }
        break;
      }
      case "payment_intent.succeeded": {
        // Log successful payment intent
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info(`Payment succeeded for amount ${paymentIntent.amount}`);
        break;
      }
      case "payment_intent.payment_failed": {
        // Log failed payment intent
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.warn(`Payment failed for amount ${paymentIntent.amount}`);
        break;
      }
      case "charge.succeeded": {
        // Log successful charge
        const charge = event.data.object as Stripe.Charge;
        logger.info(
          `Charge succeeded for amount ${charge.amount}, customer: ${charge.customer}`
        );
        break;
      }
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error(`Error processing webhook: ${errorMessage}`, { event });
    return new NextResponse(`Webhook error: ${errorMessage}`, { status: 500 });
  }
}
