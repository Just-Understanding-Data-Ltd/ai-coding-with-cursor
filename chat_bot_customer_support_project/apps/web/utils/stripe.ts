import Stripe from "stripe";
import { config } from "@/config";

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-01-27.acacia",
});
