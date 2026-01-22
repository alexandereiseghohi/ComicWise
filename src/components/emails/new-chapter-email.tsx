// ═══════════════════════════════════════════════════
// NEW CHAPTER EMAIL TEMPLATE
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

interface NewChapterEmailProps {
  userName: string;
  userEmail: string;
  comicTitle: string;
  comicCoverUrl: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterUrl: string;
  releaseDate: string;
}

export const NewChapterEmail = ({
  userName = "Comic Reader",
  userEmail,
  comicTitle = "Amazing Comic Series",
  comicCoverUrl = "https://comicwise.app/placeholder-cover.jpg",
  chapterNumber = 42,
  chapterTitle = "The Epic Conclusion",
  chapterUrl = "https://comicwise.app/read/comic/chapter-42",
  releaseDate = new Date().toLocaleDateString(),
}: NewChapterEmailProps) => (
  <Html>
    <Head />
    <Preview>{`New chapter of ${comicTitle} is now available - Chapter ${chapterNumber}`}</Preview>
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
          <Heading style={heading}>New Chapter Available! 📖</Heading>
        </Section>

        <Section style={content}>
          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            Great news! A new chapter of <strong>{comicTitle}</strong> has just been released. Your
            favorite series is back with another exciting installment!
          </Text>

          <Section style={comicCard}>
            <Img src={comicCoverUrl} width="200" height="280" alt={comicTitle} style={coverImage} />
            <Section style={chapterInfo}>
              <Heading as="h2" style={comicTitleStyle}>
                {comicTitle}
              </Heading>
              <Text style={chapterMeta}>
                <strong>
                  Chapter {chapterNumber}: {chapterTitle}
                </strong>
              </Text>
              <Text style={releaseInfo}>Released: {releaseDate}</Text>
            </Section>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={chapterUrl}>
              Read Chapter {chapterNumber} Now
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={tipsBox}>
            <Text style={tipsHeading}>📌 Quick Tips:</Text>
            <Text style={tipItem}>• Bookmark this chapter to continue later</Text>
            <Text style={tipItem}>• Share your thoughts in the comments</Text>
            <Text style={tipItem}>• Rate the chapter after reading</Text>
          </Section>

          <Text style={paragraph}>
            Don&apos;t miss out on the action! Read the latest chapter before everyone else starts
            talking about it.
          </Text>

          <Hr style={hr} />

          <Text style={smallText}>
            You&apos;re receiving this email because you bookmarked <strong>{comicTitle}</strong>{" "}
            and opted in to chapter notifications.{" "}
            <Link style={link} href="https://comicwise.app/account/notifications">
              Manage your notification preferences
            </Link>
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
          <Text style={footerText}>ComicWise, Inc. | 123 Comic Street, Reading City, RC 12345</Text>
          <Text style={footerText}>
            <Link style={footerLink} href="https://comicwise.app/unsubscribe">
              Unsubscribe
            </Link>{" "}
            |{" "}
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

export default NewChapterEmail;

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

const comicCard = {
  backgroundColor: "f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const coverImage = {
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  margin: "0 auto 16px",
};

const chapterInfo = {
  textAlign: "center" as const,
};

const comicTitleStyle = {
  fontSize: "22px",
  lineHeight: "1.4",
  fontWeight: "700",
  color: "1a1a1a",
  margin: "8px 0",
};

const chapterMeta = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "5469d4",
  margin: "8px 0",
};

const releaseInfo = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "64748b",
  margin: "4px 0",
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
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};

const tipsBox = {
  backgroundColor: "f0f9ff",
  borderLeft: "4px solid 3b82f6",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const tipsHeading = {
  fontSize: "15px",
  lineHeight: "22px",
  fontWeight: "600",
  color: "1e40af",
  margin: "0 0 8px 0",
};

const tipItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "1e40af",
  margin: "4px 0",
};

const smallText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "64748b",
  margin: "16px 0",
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
