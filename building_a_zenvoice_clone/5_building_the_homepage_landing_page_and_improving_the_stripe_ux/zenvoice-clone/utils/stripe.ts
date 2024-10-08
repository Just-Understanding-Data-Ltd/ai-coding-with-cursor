import Stripe from "stripe";
import { config } from "@/config";

const stripeConfig =
  config.stripe[
    process.env.NODE_ENV === "production" ? "production" : "development"
  ];

export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: "2024-09-30.acacia",
});
