import { createClient } from "@/utils/supabase/server";

export async function decryptStripeApiKey(
  encryptedKey: string
): Promise<string> {
  if (typeof window === "undefined") {
    // Server-side decryption
    const supabase = createClient();
    const { data, error } = await supabase.rpc("decrypt_stripe_api_key", {
      encrypted_key: encryptedKey,
    });

    if (error) {
      console.error("Error decrypting Stripe API key:", error);
      throw new Error("Failed to decrypt Stripe API key");
    }

    return data;
  } else {
    // Client-side decryption (you may want to implement a different approach for client-side)
    throw new Error("Client-side decryption not implemented");
  }
}
