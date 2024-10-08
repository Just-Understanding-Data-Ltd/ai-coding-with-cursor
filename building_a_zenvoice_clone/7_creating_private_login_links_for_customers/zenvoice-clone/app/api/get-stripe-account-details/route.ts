import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: "2024-09-30.acacia",
      typescript: true,
    });

    const account = await stripe.accounts.retrieve();

    const accountData = account;
    const name =
      accountData.business_profile?.name ||
      accountData.settings?.dashboard?.display_name ||
      "Unknown";

    let icon: string | null = null;
    if (
      accountData.settings?.branding?.icon &&
      typeof accountData.settings.branding.icon !== "string"
    ) {
      const file = await stripe.files.retrieve(
        accountData.settings.branding.icon.id
      );
      icon = file.url;
    } else {
      icon = (accountData.settings?.branding?.icon as string) || null;
    }
    return NextResponse.json({ name, icon });
  } catch (error) {
    console.error("Error fetching Stripe account details:", error);
    return NextResponse.json(
      { error: "Failed to fetch Stripe account details" },
      { status: 500 }
    );
  }
}
