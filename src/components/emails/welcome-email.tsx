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

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ComicWise - Start your reading journey!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Welcome to ComicWise!</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {name},</Text>

            <Text style={paragraph}>
              Welcome to ComicWise! We&apos;re excited to have you join our community of comic
              enthusiasts. Your account has been successfully created and verified.
            </Text>

            <Text style={paragraph}>Here&apos;s what you can do now:</Text>

            <ul style={list}>
              <li style={listItem}>📚 Browse thousands of comics from various genres</li>
              <li style={listItem}>🔖 Bookmark your favorite series</li>
              <li style={listItem}>📖 Track your reading progress</li>
              <li style={listItem}>💬 Join discussions with fellow readers</li>
            </ul>

            <Section style={buttonContainer}>
              <Button style={button} href={`${appConfig.url}/comics`}>
                Start Reading
              </Button>
            </Section>

            <Text style={paragraph}>
              If you have any questions or need assistance, feel free to reach out to our support
              team.
            </Text>

            <Text style={footer}>
              Happy reading!
              <br />
              The ComicWise Team
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              You received this email because you signed up for ComicWise.
              <br />
              <Link href={`${appConfig.url}/profile/settings`} style={link}>
                Manage your preferences
              </Link>
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

const list = {
  color: "374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "8px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "3b82f6",
  borderRadius: "6px",
  color: "fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footer = {
  color: "6b7280",
  fontSize: "14px",
  lineHeight: "24px",
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
};
