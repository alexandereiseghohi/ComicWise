import appConfig from "@/appConfig";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  email: string;
  token: string;
}

export default function PasswordResetEmail({ name, email, token }: PasswordResetEmailProps) {
  const resetUrl = `${appConfig.url}/reset-password?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your ComicWise password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Password Reset Request</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {name},</Text>

            <Text style={paragraph}>
              We received a request to reset your password for your ComicWise account. Click the
              button below to create a new password.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              This password reset link will expire in 1 hour for security reasons.
            </Text>

            <Text style={note}>
              If the button above doesn&apos;t work, copy and paste the following link into your
              browser:
              <br />
              <Link href={resetUrl} style={link}>
                {resetUrl}
              </Link>
            </Text>

            <Section style={warningBox}>
              <Text style={warningTitle}>⚠️ Important Security Notice</Text>
              <Text style={warningText}>
                If you didn&apos;t request a password reset, please ignore this email. Your password
                will remain unchanged. However, if you&apos;re concerned about your account
                security, please contact our support team immediately.
              </Text>
            </Section>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              This email was sent to {email}
              <br />
              ComicWise - Your Comic Reading Companion
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 24px",
  textAlign: "center" as const,
};

const h1 = {
  color: "1f2937",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const content = {
  padding: "0 48px",
};

const paragraph = {
  color: "374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "ef4444",
  borderRadius: "6px",
  color: "fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const note = {
  backgroundColor: "f3f4f6",
  border: "1px solid e5e7eb",
  borderRadius: "6px",
  color: "6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  padding: "16px",
  margin: "24px 0",
};

const warningBox = {
  backgroundColor: "fef2f2",
  border: "1px solid fecaca",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
};

const warningTitle = {
  color: "991b1b",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const warningText = {
  color: "7f1d1d",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const footerSection = {
  borderTop: "1px solid e5e7eb",
  marginTop: "32px",
  padding: "24px 48px",
};

const footerText = {
  color: "9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
};

const link = {
  color: "3b82f6",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};
