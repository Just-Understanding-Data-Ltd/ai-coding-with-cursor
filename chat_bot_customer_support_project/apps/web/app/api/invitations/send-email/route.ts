import { Resend } from "resend";
import { NextResponse } from "next/server";
import TeamInvitationEmail from "@/components/emails/TeamInvitationEmail";
import { config } from "@/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, token, organizationName, inviterName, membershipType } =
      await request.json();

    const signUpUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/join?token=${token}`;

    await resend.emails.send({
      from: `${config.name} <onboarding@octospark.ai>`,
      to: email,
      subject: `You've been invited to join ${organizationName} on ${config.name}`,
      react: TeamInvitationEmail({
        organizationName,
        inviterName,
        signUpUrl,
        role: membershipType,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return NextResponse.json(
      { error: "Failed to send invitation email" },
      { status: 500 }
    );
  }
}
