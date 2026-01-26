import appConfig, { env } from "@/appConfig";
import nodemailer from "nodemailer";

import type { Transporter } from "nodemailer";

// ═══════════════════════════════════════════════════
// TRANSPORTER CONFIGURATION
// ═══════════════════════════════════════════════════

let transporter: Transporter | null = null;

function createTransporter(): Transporter {
  if (!transporter) {
    // Cast to any to avoid strict typing mismatches with nodemailer transport options
    transporter = nodemailer.createTransport({
      host: (appConfig.email as any).host,
      port: (appConfig.email as any).port,
      secure: (appConfig.email as any).secure,
      auth:
        ((appConfig.email as any).auth?.user ?? "") && ((appConfig.email as any).auth?.pass ?? "")
          ? {
              user: (appConfig.email as any).auth?.user ?? "",
              pass: (appConfig.email as any).auth?.pass ?? "",
            }
          : undefined,
    } as any);
  }
  return transporter;
}

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════
// CORE EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: options.from || (appConfig.email as any).from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    } as any;

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// ═══════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════

function getEmailTemplate(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; background-color: f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: ffffff; }
        .header { background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; color: ffffff; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); color: ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { opacity: 0.9; }
        .footer { background-color: f9fafb; padding: 30px; text-align: center; color: 6b7280; font-size: 14px; border-top: 1px solid e5e7eb; }
        .footer a { color: 667eea; text-decoration: none; }
        .divider { height: 1px; background-color: e5e7eb; margin: 30px 0; }
        p { margin: 0 0 16px 0; color: 4b5563; }
        .info-box { background-color: f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid 667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 ComicWise</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>ComicWise</strong> - Your Modern Comic Reading Platform</p>
          <p><a href="${env.NEXT_PUBLIC_APP_URL}">Visit ComicWise</a></p>
          <p style="margin-top: 20px; font-size: 12px;">
            If you didn't request this email, please ignore it or <a href="${env.NEXT_PUBLIC_APP_URL}/contact">contact support</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════
// SPECIFIC EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<EmailResult> {
  const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const content = `
    <h2>Welcome to ComicWise, ${name}! 🎉</h2>
    <p>Thank you for registering with ComicWise. We're excited to have you join our community of comic enthusiasts!</p>
    <p>To get started, please verify your email address by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <div class="info-box">
      <p style="margin: 0;"><strong>⏱️ This link will expire in 24 hours.</strong></p>
    </div>
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: 667eea; font-size: 14px;">${verificationUrl}</p>
  `;

  return sendEmail({
    to: email,
    subject: "Verify your ComicWise email address",
    html: getEmailTemplate("Verify Email", content),
    text: `Welcome to ComicWise, ${name}!\n\nPlease verify your email by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<EmailResult> {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password for your ComicWise account. If you didn't make this request, you can safely ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <div class="info-box">
      <p style="margin: 0;"><strong>⏱️ This link will expire in 1 hour.</strong></p>
      <p style="margin: 8px 0 0 0;">For security reasons, please change your password from a trusted device.</p>
    </div>
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: 667eea; font-size: 14px;">${resetUrl}</p>
  `;

  return sendEmail({
    to: email,
    subject: "Reset your ComicWise password",
    html: getEmailTemplate("Password Reset", content),
    text: `Hi ${name},\n\nWe received a request to reset your password.\n\nReset your password by visiting: ${resetUrl}\n\nThis link will expire in 1 hour.`,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  const content = `
    <h2>Welcome to ComicWise! 🎉</h2>
    <p>Hi ${name},</p>
    <p>Your email has been successfully verified! You're all set to explore our vast collection of comics.</p>
    <h3>What's Next?</h3>
    <ul>
      <li>🔍 <strong>Discover</strong> - Browse thousands of comics across multiple genres</li>
      <li>📖 <strong>Read</strong> - Enjoy high-quality reading experience</li>
      <li>🔖 <strong>Bookmark</strong> - Save your favorite comics and track your progress</li>
      <li>💬 <strong>Engage</strong> - Comment and connect with other readers</li>
    </ul>
    <div style="text-align: center;">
      <a href="${env.NEXT_PUBLIC_APP_URL}/comics" class="button">Start Reading</a>
    </div>
    <div class="divider"></div>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to ComicWise!",
    html: getEmailTemplate("Welcome", content),
    text: `Welcome to ComicWise, ${name}!\n\nYour email has been verified. Start exploring comics at: ${env.NEXT_PUBLIC_APP_URL}/comics`,
  });
}

export async function sendPasswordChangedEmail(email: string, name: string): Promise<EmailResult> {
  const content = `
    <h2>Password Changed Successfully</h2>
    <p>Hi ${name},</p>
    <p>This email confirms that your password has been successfully changed.</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>🔒 If you didn't make this change:</strong></p>
      <p style="margin: 8px 0 0 0;">Please contact our support team immediately to secure your account.</p>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${env.NEXT_PUBLIC_APP_URL}/profile" class="button">Go to Profile</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Your ComicWise password has been changed",
    html: getEmailTemplate("Password Changed", content),
    text: `Hi ${name},\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact support immediately.`,
  });
}

export async function sendNewComicNotification(
  email: string,
  name: string,
  comicTitle: string,
  comicId: number
): Promise<EmailResult> {
  const comicUrl = `${env.NEXT_PUBLIC_APP_URL}/comics/${comicId}`;

  const content = `
    <h2>New Comic Available! 📚</h2>
    <p>Hi ${name},</p>
    <p>A new comic you might be interested in has been added to ComicWise:</p>
    <div class="info-box">
      <h3 style="margin: 0 0 8px 0;">${comicTitle}</h3>
      <p style="margin: 0;">Check it out now and be the first to read!</p>
    </div>
    <div style="text-align: center;">
      <a href="${comicUrl}" class="button">Read Now</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `New Comic: ${comicTitle}`,
    html: getEmailTemplate("New Comic", content),
    text: `Hi ${name},\n\nA new comic "${comicTitle}" is now available on ComicWise!\n\nRead it at: ${comicUrl}`,
  });
}

export async function sendNewChapterNotification(
  email: string,
  name: string,
  comicTitle: string,
  chapterTitle: string,
  comicId: number,
  chapterId: number
): Promise<EmailResult> {
  const chapterUrl = `${env.NEXT_PUBLIC_APP_URL}/comics/${comicId}/read/${chapterId}`;

  const content = `
    <h2>New Chapter Released! 📖</h2>
    <p>Hi ${name},</p>
    <p>A new chapter is available for a comic in your bookmarks:</p>
    <div class="info-box">
      <h3 style="margin: 0 0 8px 0;">${comicTitle}</h3>
      <p style="margin: 0;"><strong>${chapterTitle}</strong></p>
    </div>
    <div style="text-align: center;">
      <a href="${chapterUrl}" class="button">Read Chapter</a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `New Chapter: ${comicTitle} - ${chapterTitle}`,
    html: getEmailTemplate("New Chapter", content),
    text: `Hi ${name},\n\nNew chapter for "${comicTitle}": ${chapterTitle}\n\nRead it at: ${chapterUrl}`,
  });
}

export async function sendCommentNotificationEmail(
  email: string,
  name: string,
  comicTitle: string,
  chapterTitle: string
): Promise<EmailResult> {
  const content = `
    <h2>New Comment on Your Bookmarked Comic 💬</h2>
    <p>Hi ${name},</p>
    <p>Someone commented on a chapter in a comic you bookmarked:</p>
    <div class="info-box">
      <h3 style="margin: 0 0 8px 0;">${comicTitle}</h3>
      <p style="margin: 0;"><strong>${chapterTitle}</strong></p>
    </div>
    <div style="text-align: center;">
      <a href="${env.NEXT_PUBLIC_APP_URL}/bookmarks" class="button">View Bookmarks</a>
    </div>
    <p style="font-size: 12px; color: 6b7280; margin-top: 20px;">You can manage your notification preferences in your profile settings.</p>
  `;

  return sendEmail({
    to: email,
    subject: `New Comment: ${comicTitle}`,
    html: getEmailTemplate("New Comment", content),
    text: `Hi ${name},\n\nSomeone commented on "${comicTitle}" - ${chapterTitle}\n\nView your bookmarks at: ${env.NEXT_PUBLIC_APP_URL}/bookmarks`,
  });
}

// ═══════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════

export const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendNewComicNotification,
  sendNewChapterNotification,
  sendCommentNotificationEmail,
};

export default emailService;
