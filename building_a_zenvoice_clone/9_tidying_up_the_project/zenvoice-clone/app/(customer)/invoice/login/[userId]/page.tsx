import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CustomerLoginForm from "@/components/CustomerLoginForm";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";
import LoginEmail from "@/components/emails/LoginEmail";
import { config } from "@/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function CustomerLoginPage({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const handleLogin = async (formData: FormData) => {
    "use server";
    const formEmail = formData.get("email") as string;

    const supabase = createClient();
    const newLink = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

    const { error } = await supabase.from("private_links").insert({
      email: formEmail,
      link: newLink,
      expires_at: expiresAt.toISOString(),
      user_id: params.userId,
    });

    if (error) {
      console.error("Error inserting private link:", error);
      return { success: false, error: "Failed to create login link" };
    }

    const { error: emailError } = await resend.emails.send({
      from: "SwiftVoice <noreply@swiftvoice.co>",
      to: formEmail,
      subject: "Access Your Invoices",
      react: LoginEmail({
        loginUrl: `${config.auth.siteUrl}/invoices/${newLink}`,
        companyName: config.company.name,
      }),
    });

    if (error || emailError) {
      console.error("Error sending email:", error);
      return { success: false, error: "Failed to send login email" };
    }

    return { success: true, message: "Login link sent successfully" };
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <div className="w-full">
        <CustomerLoginForm handleLogin={handleLogin} />
      </div>
    </div>
  );
}
