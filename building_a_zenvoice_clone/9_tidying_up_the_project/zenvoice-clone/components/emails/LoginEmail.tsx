import React from "react";
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

interface LoginEmailProps {
  loginUrl: string;
  companyName: string;
}

export default function LoginEmail({ loginUrl, companyName }: LoginEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Access Your Invoices</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Access Your Invoices</Heading>
          <Text style={text}>Hello,</Text>
          <Text style={text}>
            You&apos;ve requested access to your invoices from {companyName}.
            Click the button below to view and manage your invoices:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Access Invoices
            </Button>
          </Section>
          <Text style={text}>
            This link will expire in 24 hours for security reasons. If you
            didn&apos;t request this, please ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            &copy; {new Date().getFullYear()} {companyName}. All rights
            reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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
