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

interface VerificationEmailProps {
  name: string;
  email: string;
  token: string;
}

export default function VerificationEmail({ name, email, token }: VerificationEmailProps) {
  const verificationUrl = `${appConfig.url}/verify-email?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Verify your email address for ComicWise</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Verify Your Email Address</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {name},</Text>

            <Text style={paragraph}>
              Thank you for signing up for ComicWise! To complete your registration and start
              exploring our vast collection of comics, please verify your email address.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              This verification link will expire in 24 hours for security reasons.
            </Text>

            <Text style={note}>
              If the button above doesn&apos;t work, copy and paste the following link into your
              browser:
              <br />
              <Link href={verificationUrl} style={link}>
                {verificationUrl}
              </Link>
            </Text>

            <Text style={warning}>
              If you didn&apos;t create an account on ComicWise, please ignore this email or contact
              our support team if you have concerns.
            </Text>
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
  backgroundColor: "10b981",
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

const warning = {
  color: "9ca3af",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "32px",
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
