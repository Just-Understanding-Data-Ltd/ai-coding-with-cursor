import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { config } from "@/config";

interface TeamInvitationEmailProps {
  organizationName: string;
  inviterName: string;
  signUpUrl: string;
  role: string;
}

export default function TeamInvitationEmail({
  organizationName,
  inviterName,
  signUpUrl,
  role,
}: TeamInvitationEmailProps) {
  const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };

  const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "600px",
  };

  const h1 = {
    color: "#333333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "0 0 20px",
  };

  const text = {
    color: "#333333",
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "20px",
  };

  const buttonContainer = {
    textAlign: "center" as const,
    margin: "30px 0",
  };

  const button = {
    backgroundColor: "#6366f1",
    borderRadius: "4px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 20px",
    width: "auto",
  };

  const hr = {
    borderColor: "#e6e6e6",
    margin: "30px 0",
  };

  const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
  };

  return (
    <Html>
      <Head />
      <Preview>
        Join {organizationName} on {config.name}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Organization Invitation</Heading>
          <Text style={text}>Hello,</Text>
          <Text style={text}>
            {inviterName} has invited you to join {organizationName} as a {role}
            .
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={signUpUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={text}>This invitation link will expire in 7 days.</Text>
          <Hr style={hr} />
          <Text style={footer}>
            &copy; {new Date().getFullYear()} AI Rank Tracker. All rights
            reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
