import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CustomerLoginForm from "@/components/CustomerLoginForm";
import { v4 as uuidv4 } from "uuid";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const link = searchParams.link as string;
  let email = searchParams.email as string;
  let stripeAccountId: string | null = null;

  if (link) {
    const { data, error } = await supabase
      .from("private_links")
      .select("email, stripe_account_id")
      .eq("link", link)
      .single();

    if (error || !data) {
      redirect("/invoice/login?error=invalid_link");
    }

    email = data.email;
    stripeAccountId = data.stripe_account_id;
  }

  const handleLogin = async (formEmail: string) => {
    "use server";

    const supabase = createClient();
    const newLink = uuidv4(); // Generate a unique link
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

    const { data, error } = await supabase
      .from("private_links")
      .insert({
        email: formEmail,
        link: newLink,
        expires_at: expiresAt.toISOString(),
        stripe_account_id: stripeAccountId,
      })
      .select();

    if (error) {
      console.error("Error inserting private link:", error);
      return { success: false, error: "Failed to create login link" };
    }

    // For development, log the generated link
    console.log(
      "Generated login link:",
      `${process.env.NEXT_PUBLIC_SITE_URL}/invoice/login/${newLink}`
    );

    return { success: true, message: "Login link created successfully" };
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <CustomerLoginForm handleLogin={handleLogin} />
      </div>
    </div>
  );
}
