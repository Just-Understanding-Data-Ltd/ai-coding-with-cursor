"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export async function checkUserExists(email: string): Promise<boolean> {
  const supabase = await createAdminClient();

  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("email", email);

    if (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }

    return count !== null && count > 0;
  } catch (err) {
    console.error("Error checking user existence:", err);
    throw err;
  }
}
