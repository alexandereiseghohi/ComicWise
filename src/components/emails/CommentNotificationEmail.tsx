// ═══════════════════════════════════════════════════
// COMMENT NOTIFICATION EMAIL TEMPLATE
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

interface CommentNotificationEmailProps {
  userName: string;
  userEmail: string;
  commenterName: string;
  commenterAvatar?: string;
  commentText: string;
  comicTitle: string;
  chapterNumber?: number;
  commentUrl: string;
  commentType: "reply" | "mention" | "new";
}

export const CommentNotificationEmail = ({
  userName = "Comic Reader",
  userEmail,
  commenterName = "Fellow Reader",
  commenterAvatar,
  commentText = "Great chapter! I loved the plot twist at the end.",
  comicTitle = "Amazing Comic Series",
  chapterNumber,
  commentUrl = "https://comicwise.app/comic/chaptercomment-123",
  commentType = "reply",
}: CommentNotificationEmailProps) => {
  const getNotificationTitle = () => {
    switch (commentType) {
      case "reply":
        return `${commenterName} replied to your comment`;
      case "mention":
        return `${commenterName} mentioned you in a comment`;
      case "new":
        return `New comment on ${comicTitle}`;
      default:
        return "New activity on ComicWise";
    }
  };

  const getNotificationMessage = () => {
    const location = chapterNumber ? `Chapter ${chapterNumber} of ${comicTitle}` : comicTitle;

    switch (commentType) {
      case "reply":
        return `${commenterName} replied to your comment on ${location}.`;
      case "mention":
        return `${commenterName} mentioned you in a comment on ${location}.`;
      case "new":
        return `${commenterName} left a new comment on ${location}.`;
      default:
        return `New activity on ${location}.`;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{getNotificationTitle()}</Preview>
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
            <Heading style={heading}>💬 New Comment Activity</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>{getNotificationMessage()}</Text>

            <Section style={commentCard}>
              <Section style={commenterInfo}>
                {commenterAvatar ? (
                  <Img
                    src={commenterAvatar}
                    width="40"
                    height="40"
                    alt={commenterName}
                    style={avatar}
                  />
                ) : (
                  <div style={avatarPlaceholder}>{commenterName.charAt(0).toUpperCase()}</div>
                )}
                <Section style={commenterDetails}>
                  <Text style={commenterNameText}>{commenterName}</Text>
                  <Text style={timestamp}>{new Date().toLocaleString()}</Text>
                </Section>
              </Section>

              <Section style={commentBody}>
                <Text style={commentTextStyle}>&quot;{commentText}&quot;</Text>
              </Section>

              <Section style={comicInfo}>
                <Text style={comicInfoText}>
                  📖 {comicTitle}
                  {chapterNumber && ` - Chapter ${chapterNumber}`}
                </Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={commentUrl}>
                View Comment & Reply
              </Button>
            </Section>

            <Hr style={hr} />

            <Section style={tipsBox}>
              <Text style={tipsText}>
                💡 <strong>Community Guidelines:</strong> Keep the conversation friendly and
                respectful. Report any inappropriate comments to our moderation team.
              </Text>
            </Section>

            <Text style={smallText}>
              You&apos;re receiving this because you&apos;re following this comic or participated in
              this discussion.{" "}
              <Link style={link} href="https://comicwise.app/account/notifications">
                Manage notification preferences
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
            <Text style={footerText}>
              ComicWise, Inc. | 123 Comic Street, Reading City, RC 12345
            </Text>
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
};

export default CommentNotificationEmail;

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

const commentCard = {
  backgroundColor: "f8fafc",
  borderRadius: "8px",
  border: "1px solid e6ebf1",
  padding: "20px",
  margin: "24px 0",
};

const commenterInfo = {
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
};

const avatar = {
  borderRadius: "50%",
  marginRight: "12px",
};

const avatarPlaceholder = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "5469d4",
  color: "fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  fontWeight: "600",
  marginRight: "12px",
};

const commenterDetails = {
  flex: 1,
};

const commenterNameText = {
  fontSize: "15px",
  fontWeight: "600",
  color: "1a1a1a",
  margin: "0 0 2px 0",
};

const timestamp = {
  fontSize: "13px",
  color: "64748b",
  margin: "0",
};

const commentBody = {
  padding: "16px",
  backgroundColor: "ffffff",
  borderRadius: "6px",
  borderLeft: "3px solid 5469d4",
  margin: "12px 0",
};

const commentTextStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "1a1a1a",
  margin: "0",
  fontStyle: "italic" as const,
};

const comicInfo = {
  marginTop: "12px",
};

const comicInfoText = {
  fontSize: "13px",
  color: "64748b",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "8b5cf6",
  borderRadius: "6px",
  color: "fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const tipsBox = {
  backgroundColor: "f0f9ff",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const tipsText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "1e40af",
  margin: "0",
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
