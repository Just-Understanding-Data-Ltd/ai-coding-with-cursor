import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();
    const stripe = new Stripe(apiKey, { apiVersion: "2024-09-30.acacia" });

    // Attempt to fetch a list of customers to validate the API key
    await stripe.customers.list({ limit: 1 });

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error validating Stripe API key:", error);
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
