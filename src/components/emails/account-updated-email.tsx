// ═══════════════════════════════════════════════════
// ACCOUNT UPDATED EMAIL TEMPLATE
// ═══════════════════════════════════════════════════

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AccountUpdatedEmailProps {
  userName: string;
  userEmail: string;
  changeType: "password" | "email" | "profile";
  changeDetails?: string;
  ipAddress?: string;
}

export const AccountUpdatedEmail = ({
  userName = "Comic Reader",
  userEmail,
  changeType = "profile",
  changeDetails,
  ipAddress,
}: AccountUpdatedEmailProps) => {
  const getChangeTitle = () => {
    switch (changeType) {
      case "password":
        return "Password Changed";
      case "email":
        return "Email Address Updated";
      case "profile":
        return "Profile Updated";
      default:
        return "Account Updated";
    }
  };

  const getChangeMessage = () => {
    switch (changeType) {
      case "password":
        return "Your password has been successfully changed. You can now use your new password to sign in to your account.";
      case "email":
        return "Your email address has been successfully updated. All future communications will be sent to your new email address.";
      case "profile":
        return "Your profile information has been successfully updated.";
      default:
        return "Your account has been successfully updated.";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Your ComicWise account has been updated</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://comicwise.app/logo.png"
              width="48"
              height="48"
              alt="ComicWise"
              style={logo}
            />
            <Heading style={heading}>{getChangeTitle()}</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>This is a confirmation that {getChangeMessage()}</Text>

            {changeDetails && (
              <Section style={detailsBox}>
                <Text style={detailsText}>
                  <strong>Change Details:</strong>
                  <br />
                  {changeDetails}
                </Text>
              </Section>
            )}

            {ipAddress && (
              <Section style={infoBox}>
                <Text style={infoText}>
                  <strong>Security Information:</strong>
                  <br />
                  IP Address: {ipAddress}
                  <br />
                  Date & Time: {new Date().toLocaleString()}
                  <br />
                  Device: Web Browser
                </Text>
              </Section>
            )}

            <Hr style={hr} />

            <Section style={warningBox}>
              <Text style={warningText}>
                🔒 <strong>Didn&apos;t make this change?</strong> If you didn&apos;t authorize this
                change, your account may have been compromised. Please reset your password
                immediately and contact our support team.
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href="https://comicwise.app/account/security">
                Review Account Security
              </Button>
            </Section>

            <Text style={paragraph}>
              If you have any questions or concerns,{" "}
              <Link style={link} href="https://comicwise.app/support">
                contact our support team
              </Link>
              . We&apos;re here to help!
            </Text>

            <Text style={paragraph}>
              Best regards,
              <br />
              The ComicWise Team
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent to{" "}
              <Link style={footerLink} href={`mailto:${userEmail}`}>
                {userEmail}
              </Link>
            </Text>
            <Text style={footerText}>
              ComicWise, Inc. | 123 Comic Street, Reading City, RC 12345
            </Text>
            <Text style={footerText}>
              <Link style={footerLink} href="https://comicwise.app/privacy">
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link style={footerLink} href="https://comicwise.app/terms">
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AccountUpdatedEmail;

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const main = {
  backgroundColor: "f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  marginBottom: "16px",
};

const heading = {
  fontSize: "28px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "1a1a1a",
  margin: "0",
};

const content = {
  padding: "0 40px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "484848",
  margin: "16px 0",
};

const detailsBox = {
  backgroundColor: "f8fafc",
  borderRadius: "4px",
  padding: "16px",
  margin: "16px 0",
};

const detailsText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "484848",
  margin: "0",
};

const infoBox = {
  backgroundColor: "f0f9ff",
  borderLeft: "4px solid 3b82f6",
  borderRadius: "4px",
  padding: "16px",
  margin: "16px 0",
};

const infoText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "1e40af",
  margin: "0",
};

const warningBox = {
  backgroundColor: "fef2f2",
  borderLeft: "4px solid dc2626",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "7f1d1d",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "5469d4",
  borderRadius: "6px",
  color: "fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const link = {
  color: "5469d4",
  textDecoration: "underline",
};

const hr = {
  borderColor: "e6ebf1",
  margin: "32px 0",
};

const footer = {
  padding: "0 40px",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "16px",
  color: "8898aa",
  margin: "4px 0",
  textAlign: "center" as const,
};

const footerLink = {
  color: "8898aa",
  textDecoration: "underline",
};
