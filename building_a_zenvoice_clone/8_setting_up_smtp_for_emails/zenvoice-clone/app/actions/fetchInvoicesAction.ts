"use server";

import { createClient } from "@/utils/supabase/server";
import { fetchInvoices } from "@/utils/stripe";

export async function fetchInvoicesAction(linkId: string) {
  const supabase = createClient();

  const { data: linkData, error } = await supabase
    .from("private_links")
    .select("*, users!inner(*, stripe_accounts(*))")
    .eq("link", linkId)
    .single();

  if (error || !linkData) {
    console.error("Error fetching link data:", error);
    throw new Error("Invalid link");
  }

  if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
    throw new Error("Expired link");
  }

  return await fetchInvoices(linkData.email, linkData.users.stripe_accounts);
}
