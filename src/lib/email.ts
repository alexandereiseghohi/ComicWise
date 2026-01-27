// ═══════════════════════════════════════════════════
// EMAIL SERVICE - Send Emails with React Email Templates
// ═══════════════════════════════════════════════════

import appConfig, { isDevelopment } from "@/appConfig";
import AccountUpdatedEmail from "@/components/emails/account-updated-email";
import CommentNotificationEmail from "@/components/emails/comment-notification-email";
import NewChapterEmail from "@/components/emails/new-chapter-email";
import PasswordResetEmail from "@/components/emails/password-reset-email";
import VerificationEmail from "@/components/emails/verification-email";
import WelcomeEmail from "@/components/emails/welcome-email";
import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import type { SendEmailOptions } from "@/types";

// ═══════════════════════════════════════════════════
// NODEMAILER TRANSPORTER SETUP
// ═══════════════════════════════════════════════════

// Create transporter only when email configuration looks valid. Tests and
// non-email environments may not provide `appConfig` or `appConfig.email`, so
// guard access to avoid throwing at module initialization.
const _emailCfg = appConfig?.email ?? ({} as any);
let transporter: any;

if (_emailCfg && _emailCfg.host && _emailCfg.port !== undefined && _emailCfg.port !== null) {
  // Normalize email configuration shape from appConfig
  const portNumber = Number(_emailCfg.port) || 587;
  const secure =
    typeof (_emailCfg as any).secure === "boolean" ? (_emailCfg as any).secure : portNumber === 465;
  const authUser = _emailCfg.user ?? ((_emailCfg as any).auth?.user as string) ?? "";
  const authPass = _emailCfg.password ?? ((_emailCfg as any).auth?.pass as string) ?? "";

  // Build transport options guarded to match nodemailer expectations
  const transportOptions: any = {
    host: _emailCfg.host,
    port: portNumber,
    secure,
  };

  if (authUser && authPass) {
    transportOptions.auth = { user: authUser, pass: authPass };
  }

  transporter = nodemailer.createTransport(transportOptions);

  // Verify transporter configuration in development only
  if ((_emailCfg.enabled ?? false) && isDevelopment && typeof transporter.verify === "function") {
    transporter
      .verify()
      .then(() => {
        console.log("✅ Email server is ready to send messages");
      })
      .catch((error: unknown) => {
        console.error("❌ Email transporter verification failed:", error);
      });
  }
} else {
  // Provide a no-op transporter for test and disabled environments so imports
  // don't fail and sendEmail can still be exercised safely.
  transporter = {
    sendMail: async (opts: any) => {
      console.warn(
        "⚠️ Nodemailer not configured - skipping sendMail in this environment",
        opts?.to
      );
      return { messageId: "noop" };
    },
    verify: async () => true,
  } as const;
}

// ═══════════════════════════════════════════════════
// EMAIL SENDING FUNCTIONS
// ═══════════════════════════════════════════════════

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured transporter
 * @param root0
 * @param root0.to
 * @param root0.subject
 * @param root0.html
 * @param root0.text
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!(appConfig.email?.enabled ?? false)) {
    console.warn("⚠️ Email feature is disabled. Skipping email send.");
    return { success: false, error: "Email feature is disabled" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${appConfig.name}" <${appConfig.email.from}>`,
      to,
      subject,
      html,
      text: text || undefined,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// ═══════════════════════════════════════════════════
// TEMPLATE-SPECIFIC EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Send welcome email to new users
 * @param params
 * @param params.name
 * @param params.email
 */
export async function sendWelcomeEmail(params: { name: string; email: string }) {
  const html = await render(WelcomeEmail({ name: params.name, email: params.email }));

  return sendEmail({
    to: params.email,
    subject: `Welcome to ${appConfig.name}! 🎉`,
    html,
  });
}

/**
 * Send email verification link
 * @param params
 * @param params.name
 * @param params.email
 * @param params.verificationToken
 */
export async function sendVerificationEmail(params: {
  name: string;
  email: string;
  verificationToken: string;
}) {
  const html = await render(
    VerificationEmail({
      name: params.name,
      email: params.email,
      token: params.verificationToken,
    })
  );

  return sendEmail({
    to: params.email,
    subject: `Verify your ${appConfig.name} email address`,
    html,
  });
}

/**
 * Send password reset email
 * @param params
 * @param params.name
 * @param params.email
 * @param params.resetToken
 * @param params.ipAddress
 */
export async function sendPasswordResetEmail(params: {
  name: string;
  email: string;
  resetToken: string;
  ipAddress?: string;
}) {
  const html = await render(
    PasswordResetEmail({
      resetLink: `${process.env["NEXT_PUBLIC_APP_URL"]}/reset-password?token=${params.resetToken}`,
      userEmail: params.email,
    })
  );

  return sendEmail({
    to: params.email,
    subject: `Reset your ${appConfig.name} password`,
    html,
  });
}

/**
 * Send account updated notification
 * @param params
 * @param params.name
 * @param params.email
 * @param params.changeType
 * @param params.changeDetails
 * @param params.ipAddress
 */
export async function sendAccountUpdatedEmail(params: {
  name: string;
  email: string;
  changeType: "password" | "email" | "profile";
  changeDetails?: string;
  ipAddress?: string;
}) {
  const html = await render(
    AccountUpdatedEmail({
      userName: params.name,
      userEmail: params.email,
      changeType: params.changeType,
      changeDetails: params.changeDetails,
      ipAddress: params.ipAddress,
    })
  );

  return sendEmail({
    to: params.email,
    subject: `Your ${appConfig.name} account has been updated`,
    html,
  });
}

/**
 * Send new chapter notification
 * @param params
 * @param params.userName
 * @param params.userEmail
 * @param params.comicTitle
 * @param params.comicCoverUrl
 * @param params.chapterNumber
 * @param params.chapterTitle
 * @param params.chapterSlug
 * @param params.releaseDate
 */
export async function sendNewChapterEmail(params: {
  userName: string;
  userEmail: string;
  comicTitle: string;
  comicCoverUrl: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterSlug: string;
  releaseDate: string;
}) {
  const chapterUrl = `${appConfig.url}/read/${params.chapterSlug}`;

  const html = await render(
    NewChapterEmail({
      userName: params.userName,
      userEmail: params.userEmail,
      comicTitle: params.comicTitle,
      comicCoverUrl: params.comicCoverUrl,
      chapterNumber: params.chapterNumber,
      chapterTitle: params.chapterTitle,
      chapterUrl,
      releaseDate: params.releaseDate,
    })
  );

  return sendEmail({
    to: params.userEmail,
    subject: `New chapter of ${params.comicTitle} is available!`,
    html,
  });
}

/**
 * Send new chapter notification (simplified)
 * @param params
 * @param params.to
 * @param params.userName
 * @param params.comicTitle
 * @param params.chapterTitle
 * @param params.chapterNumber
 * @param params.chapterUrl
 */
export async function sendNewChapterNotification(params: {
  to: string;
  userName: string;
  comicTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterUrl: string;
}) {
  const html = await render(
    NewChapterEmail({
      userName: params.userName,
      userEmail: params.to,
      comicTitle: params.comicTitle,
      comicCoverUrl: "",
      chapterNumber: params.chapterNumber,
      chapterTitle: params.chapterTitle,
      chapterUrl: params.chapterUrl,
      releaseDate: new Date().toLocaleDateString(),
    })
  );

  return sendEmail({
    to: params.to,
    subject: `New chapter of ${params.comicTitle} is available!`,
    html,
  });
}

/**
 * Send comment notification
 * @param params
 * @param params.userName
 * @param params.userEmail
 * @param params.commenterName
 * @param params.commenterAvatar
 * @param params.commentText
 * @param params.comicTitle
 * @param params.chapterNumber
 * @param params.commentId
 * @param params.commentType
 */
export async function sendCommentNotificationEmail(params: {
  userName: string;
  userEmail: string;
  commenterName: string;
  commenterAvatar?: string;
  commentText: string;
  comicTitle: string;
  chapterNumber?: number;
  commentId: string;
  commentType: "reply" | "mention" | "new";
}) {
  const commentUrl = `${appConfig.url}/comic/${params.comicTitle}comment-${params.commentId}`;

  const html = await render(
    CommentNotificationEmail({
      userName: params.userName,
      userEmail: params.userEmail,
      commenterName: params.commenterName,
      commenterAvatar: params.commenterAvatar,
      commentText: params.commentText,
      comicTitle: params.comicTitle,
      chapterNumber: params.chapterNumber,
      commentUrl,
      commentType: params.commentType,
    })
  );

  const getSubject = () => {
    switch (params.commentType) {
      case "reply":
        return `${params.commenterName} replied to your comment`;
      case "mention":
        return `${params.commenterName} mentioned you in a comment`;
      case "new":
        return `New comment on ${params.comicTitle}`;
      default:
        return "New activity on ComicWise";
    }
  };

  return sendEmail({
    to: params.userEmail,
    subject: getSubject(),
    html,
  });
}

// ═══════════════════════════════════════════════════
// BATCH EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Send email to multiple recipients (for notifications)
 * @param recipients
 * @param emailGenerator
 */
export async function sendBulkEmails(
  recipients: string[],
  emailGenerator: (email: string) => Promise<SendEmailOptions>
) {
  if (!appConfig?.features?.email) {
    console.warn("⚠️ Email feature is disabled. Skipping bulk email send.");
    return { success: false, error: "Email feature is disabled" };
  }

  const results = await Promise.allSettled(
    recipients.map(async (email) => {
      const emailOptions = await emailGenerator(email);
      // Convert SendEmailOptions to SendEmailParams (single recipient only)
      const recipientEmail = Array.isArray(emailOptions.to) ? emailOptions.to[0] : emailOptions.to;
      if (!recipientEmail) {
        throw new Error("No recipient email provided");
      }
      return sendEmail({
        to: recipientEmail,
        subject: emailOptions.subject,
        html: emailOptions.html,
      });
    })
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`📧 Bulk email results: ${successful} sent, ${failed} failed`);

  return {
    success: failed === 0,
    results: {
      total: recipients.length,
      successful,
      failed,
    },
  };
}

// ═══════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════

export const emailService = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountUpdatedEmail,
  sendNewChapterEmail,
  sendCommentNotificationEmail,
  sendBulkEmails,
};

export default emailService;
