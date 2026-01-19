"use server";

// ═══════════════════════════════════════════════════
// COMPREHENSIVE WORKFLOW SYSTEM (Next.js 16)
// ═══════════════════════════════════════════════════

import appConfig from "@/appConfig";
import emailService, { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";
import { z } from "zod";

// ═══════════════════════════════════════════════════
// WORKFLOW TYPES & SCHEMAS
// ═══════════════════════════════════════════════════

export type WorkflowType =
  | "user.welcome"
  | "user.verification"
  | "user.password-reset"
  | "user.account-updated"
  | "user.account-deleted"
  | "comic.created"
  | "comic.updated"
  | "comic.deleted"
  | "chapter.created"
  | "chapter.updated"
  | "chapter.deleted"
  | "bookmark.created"
  | "bookmark.reminder"
  | "comment.created"
  | "comment.reply"
  | "admin.notification";

export interface WorkflowPayload {
  type: WorkflowType;
  data: Record<string, unknown>;
  recipientEmail: string;
  recipientName?: string;
  metadata?: Record<string, unknown>;
}

const workflowPayloadSchema = z
  .object({
    type: z.enum([
      "user.welcome",
      "user.verification",
      "user.password-reset",
      "user.account-updated",
      "user.account-deleted",
      "comic.created",
      "comic.updated",
      "comic.deleted",
      "chapter.created",
      "chapter.updated",
      "chapter.deleted",
      "bookmark.created",
      "bookmark.reminder",
      "comment.created",
      "comment.reply",
      "admin.notification",
    ]),
    data: z.record(z.string(), z.any()),
    recipientEmail: z.string().email(),
    recipientName: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .strict();

// ═══════════════════════════════════════════════════
// WORKFLOW EXECUTION ENGINE
// ═══════════════════════════════════════════════════

export async function executeWorkflow(payload: WorkflowPayload) {
  try {
    // Validate payload
    const validatedPayload = workflowPayloadSchema.parse(payload);

    // Rate limiting for email workflows
    const rateLimitKey = `workflow:${validatedPayload.recipientEmail}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, {
      limit: appConfig.rateLimit.email,
      window: 60000, // 1 minute window
    });

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for workflow: ${validatedPayload.type}`);
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: new Date(rateLimitResult.reset),
      };
    }

    // Execute workflow based on type
    const result = await routeWorkflow(validatedPayload);

    return result;
  } catch (error) {
    console.error("Workflow execution error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Workflow execution failed",
    };
  }
}

// ═══════════════════════════════════════════════════
// WORKFLOW ROUTER
// ═══════════════════════════════════════════════════

async function routeWorkflow(payload: WorkflowPayload) {
  switch (payload.type) {
    // User workflows
    case "user.welcome":
      return await sendWelcomeEmail(payload);
    case "user.verification":
      return await sendVerificationEmail(payload);
    case "user.password-reset":
      return await sendPasswordResetEmail(payload);
    case "user.account-updated":
      return await sendAccountUpdatedEmail(payload);
    case "user.account-deleted":
      return await sendAccountDeletedEmail(payload);

    // Comic workflows
    case "comic.created":
      return await sendComicCreatedNotification(payload);
    case "comic.updated":
      return await sendComicUpdatedNotification(payload);
    case "comic.deleted":
      return await sendComicDeletedNotification(payload);

    // Chapter workflows
    case "chapter.created":
      return await sendChapterCreatedNotification(payload);
    case "chapter.updated":
      return await sendChapterUpdatedNotification(payload);
    case "chapter.deleted":
      return await sendChapterDeletedNotification(payload);

    // Bookmark workflows
    case "bookmark.created":
      return await sendBookmarkCreatedNotification(payload);
    case "bookmark.reminder":
      return await sendBookmarkReminder(payload);

    // Comment workflows
    case "comment.created":
      return await sendCommentNotification(payload);
    case "comment.reply":
      return await sendCommentReplyNotification(payload);

    // Admin workflows
    case "admin.notification":
      return await sendAdminNotification(payload);

    default:
      throw new Error(`Unknown workflow type: ${payload.type}`);
  }
}

// ═══════════════════════════════════════════════════
// USER WORKFLOW IMPLEMENTATIONS
// ═══════════════════════════════════════════════════

async function sendWelcomeEmail(payload: WorkflowPayload) {
  const { recipientEmail, recipientName } = payload;

  const result = await emailService.sendWelcomeEmail({
    name: recipientName || "Comic Reader",
    email: recipientEmail,
  });

  return { success: result.success };
}

async function sendVerificationEmail(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;

  const result = await emailService.sendVerificationEmail({
    name: recipientName || "Comic Reader",
    email: recipientEmail,
    verificationToken: data["token"] as string,
  });

  return { success: result.success };
}

async function sendPasswordResetEmail(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;

  const result = await emailService.sendPasswordResetEmail({
    name: recipientName || "Comic Reader",
    email: recipientEmail,
    resetToken: data["token"] as string,
    ipAddress: data["ipAddress"] as string | undefined,
  });

  return { success: result.success };
}

export async function sendNewComicNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const comicUrl = `${appConfig.url}/comics/${data["comicId"]}`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `New Comic: ${data["comicTitle"]}`,
    html: `
      <h1>New Comic Available!</h1>
      <p>Hi ${recipientName || "there"},</p>
      <p>A new comic has been added to ComicWise:</p>
      <h2>${data["comicTitle"]}</h2>
      <p>${data["comicDescription"]}</p>
      <a href="${comicUrl}" style="display: inline-block; padding: 12px 24px; background-color: 667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
        Read Now
      </a>
    `,
  });

  return { success: result.success };
}

async function sendNewChapterNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;

  const result = await emailService.sendNewChapterEmail({
    userName: recipientName || "Comic Reader",
    userEmail: recipientEmail,
    comicTitle: data["comicTitle"] as string,
    comicCoverUrl:
      (data["comicCoverUrl"] as string) || "https://comicwise.app/placeholder-cover.jpg",
    chapterNumber: data["chapterNumber"] as number,
    chapterTitle: data["chapterTitle"] as string,
    chapterSlug: data["chapterSlug"] as string,
    releaseDate: (data["releaseDate"] as string) || new Date().toLocaleDateString(),
  });

  return { success: result.success };
}

async function sendBookmarkReminder(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const bookmarksUrl = `${appConfig.url}/bookmarks`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: "Continue Reading Your Bookmarked Comics",
    html: `
      <h1>Reading Reminder</h1>
      <p>Hi ${recipientName || "there"},</p>
      <p>You have ${data["bookmarkCount"]} bookmarked comics waiting for you!</p>
      <p>Don't forget to continue your reading journey.</p>
      <a href="${bookmarksUrl}" style="display: inline-block; padding: 12px 24px; background-color: 667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
        View Bookmarks
      </a>
    `,
  });

  return { success: result.success };
}

async function sendCommentNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;

  const result = await emailService.sendCommentNotificationEmail({
    userName: recipientName || "Comic Reader",
    userEmail: recipientEmail,
    commenterName: data["commenterName"] as string,
    commenterAvatar: data["commenterAvatar"] as string | undefined,
    commentText: data["commentContent"] as string,
    comicTitle: data["comicTitle"] as string,
    chapterNumber: data["chapterNumber"] as number | undefined,
    commentId: data["commentId"] as string,
    commentType: (data["commentType"] as "reply" | "mention" | "new") || "new",
  });

  return { success: result.success };
}

// ═══════════════════════════════════════════════════
// BATCH WORKFLOW EXECUTION
// ═══════════════════════════════════════════════════

export async function executeBatchWorkflow(payloads: WorkflowPayload[]) {
  const results = await Promise.allSettled(payloads.map((payload) => executeWorkflow(payload)));

  return {
    total: results.length,
    succeeded: results.filter((r) => r.status === "fulfilled" && r.value.success).length,
    failed: results.filter((r) => r.status === "rejected" || !r.value.success).length,
    results,
  };
}
async function sendAccountUpdatedEmail(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;

  const result = await emailService.sendAccountUpdatedEmail({
    name: recipientName || "Comic Reader",
    email: recipientEmail,
    changeType: (data["changeType"] as "password" | "email" | "profile") || "profile",
    changeDetails: data["changes"] as string | undefined,
    ipAddress: data["ipAddress"] as string | undefined,
  });

  return { success: result.success };
}

// ═══════════════════════════════════════════════════
// ACCOUNT DELETION WORKFLOW
// ═══════════════════════════════════════════════════

async function sendAccountDeletedEmail(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const deletionDate = new Date().toLocaleDateString();

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Your ${appConfig.name} Account Has Been Deleted`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Account Deleted</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              This email confirms that your ${appConfig.name} account has been permanently deleted on ${deletionDate}.
            </p>

            <div style="background-color: fef3c7; border-left: 4px solid f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: 92400e; font-weight: 500;">⚠️ Account Deletion Details:</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: 92400e;">
                <li>All personal information has been removed</li>
                <li>Your reading history and bookmarks have been deleted</li>
                <li>Your comments and ratings have been anonymized</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            ${
              data["reason"]
                ? `
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>Reason for deletion:</strong> ${data["reason"]}
            </p>
            `
                : ""
            }

            <p style="font-size: 16px; margin-bottom: 20px;">
              If you deleted your account by mistake or wish to create a new account, you can register again at any time.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appConfig.url}/register" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Create New Account
              </a>
            </div>

            <p style="font-size: 14px; color: 6b7280; margin-top: 30px;">
              Thank you for being part of the ${appConfig.name} community. We're sorry to see you go!
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

// ═══════════════════════════════════════════════════
// COMIC MANAGEMENT WORKFLOWS
// ═══════════════════════════════════════════════════

async function sendComicCreatedNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const comicUrl = `${appConfig.url}/comics/${data["comicSlug"] || data["comicId"]}`;
  const coverUrl = (data["comicCoverUrl"] as string) || `${appConfig.url}/placeholder-cover.jpg`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `New Comic Added: ${data["comicTitle"]}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📚 New Comic Available!</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              Great news! A new comic has been added to ${appConfig.name} that you might enjoy:
            </p>

            <div style="background-color: f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              ${
                coverUrl
                  ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${coverUrl}" alt="${data["comicTitle"]}" style="max-width: 200px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              </div>
              `
                  : ""
              }

              <h2 style="color: 667eea; margin: 0 0 15px 0; font-size: 24px; text-align: center;">${data["comicTitle"]}</h2>

              ${
                data["comicAuthor"]
                  ? `
              <p style="text-align: center; color: 6b7280; margin-bottom: 15px;">
                <strong>By:</strong> ${data["comicAuthor"]}
              </p>
              `
                  : ""
              }

              ${
                data["comicGenres"]
                  ? `
              <p style="text-align: center; margin-bottom: 15px;">
                <span style="display: inline-block; padding: 4px 12px; background-color: databaseeafe; color: 1e40af; border-radius: 20px; font-size: 14px; margin: 2px;">${data["comicGenres"]}</span>
              </p>
              `
                  : ""
              }

              ${
                data["comicDescription"]
                  ? `
              <p style="color: 4b5563; line-height: 1.8; margin-top: 20px;">
                ${data["comicDescription"]}
              </p>
              `
                  : ""
              }
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${comicUrl}" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Start Reading
              </a>
            </div>

            <p style="font-size: 14px; color: 6b7280; margin-top: 30px; text-align: center;">
              You're receiving this because you're subscribed to new comic notifications.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
            <p style="margin: 5px 0;">
              <a href="${appConfig.url}/settings/notifications" style="color: 9ca3af; text-decoration: underline;">Manage Notifications</a>
            </p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

async function sendComicUpdatedNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const comicUrl = `${appConfig.url}/comics/${data["comicSlug"] || data["comicId"]}`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Comic Updated: ${data["comicTitle"]}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📝 Comic Updated</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              The comic <strong>${data["comicTitle"]}</strong> has been updated with new information.
            </p>

            ${
              data["changes"]
                ? `
            <div style="background-color: eff6ff; border-left: 4px solid 3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: 1e40af; font-weight: 600;">📋 What's Changed:</p>
              <ul style="margin: 0; padding-left: 20px; color: 1e3a8a;">
                ${(data["changes"] as string[]).map((change) => `<li>${change}</li>`).join("")}
              </ul>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
              <a href="${comicUrl}" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                View Comic
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

async function sendComicDeletedNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const alternativesUrl = `${appConfig.url}/comics`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Comic Removed: ${data["comicTitle"]}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ef4444 0%, dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🗑️ Comic Removed</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              We're writing to inform you that the comic <strong>${data["comicTitle"]}</strong> has been removed from ${appConfig.name}.
            </p>

            ${
              data["reason"]
                ? `
            <div style="background-color: fef2f2; border-left: 4px solid ef4444; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: 991b1b;">
                <strong>Reason:</strong> ${data["reason"]}
              </p>
            </div>
            `
                : ""
            }

            <p style="font-size: 16px; margin-bottom: 20px;">
              Any bookmarks or comments related to this comic have been preserved in your account history.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${alternativesUrl}" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Browse Other Comics
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

// ═══════════════════════════════════════════════════
// CHAPTER MANAGEMENT WORKFLOWS
// ═══════════════════════════════════════════════════

async function sendChapterCreatedNotification(payload: WorkflowPayload) {
  return await sendNewChapterNotification(payload);
}

async function sendChapterUpdatedNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const chapterUrl = `${appConfig.url}/comics/${data["comicSlug"]}/read/${data["chapterSlug"]}`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Chapter Updated: ${data["comicTitle"]} - Chapter ${data["chapterNumber"]}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📖 Chapter Updated</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              A chapter you're following has been updated with improvements:
            </p>

            <div style="background-color: f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <h2 style="color: 667eea; margin: 0 0 10px 0; font-size: 22px;">${data["comicTitle"]}</h2>
              <p style="color: 6b7280; font-size: 18px; margin: 0;">Chapter ${data["chapterNumber"]}${data["chapterTitle"] ? `: ${data["chapterTitle"]}` : ""}</p>
            </div>

            ${
              data["updateDetails"]
                ? `
            <div style="background-color: eff6ff; border-left: 4px solid 3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: 1e40af; font-weight: 600;">✨ Updates:</p>
              <p style="margin: 0; color: 1e3a8a;">${data["updateDetails"]}</p>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
              <a href="${chapterUrl}" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Read Updated Chapter
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

async function sendChapterDeletedNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const comicUrl = `${appConfig.url}/comics/${data["comicSlug"]}`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Chapter Removed: ${data["comicTitle"]} - Chapter ${data["chapterNumber"]}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, f59e0b 0%, d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Chapter Removed</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              We're writing to inform you that Chapter ${data["chapterNumber"]} of <strong>${data["comicTitle"]}</strong> has been removed.
            </p>

            ${
              data["reason"]
                ? `
            <div style="background-color: fef3c7; border-left: 4px solid f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: 92400e;">
                <strong>Reason:</strong> ${data["reason"]}
              </p>
            </div>
            `
                : ""
            }

            <p style="font-size: 16px; margin-bottom: 20px;">
              Your reading progress and bookmarks have been adjusted accordingly.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${comicUrl}" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                View Comic
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

// ═══════════════════════════════════════════════════
// BOOKMARK & ADMIN WORKFLOWS
// ═══════════════════════════════════════════════════

async function sendBookmarkCreatedNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const bookmarksUrl = `${appConfig.url}/bookmarks`;
  const comicUrl = `${appConfig.url}/comics/${data["comicSlug"]}`;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `Bookmark Added: ${data["comicTitle"]}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, 667eea 0%, 764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔖 Bookmark Added</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "there"},</p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              You've successfully bookmarked <strong>${data["comicTitle"]}</strong>!
            </p>

            <div style="background-color: f0fdf4; border-left: 4px solid 10b981; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: 065f46; font-weight: 600;">📚 Quick Tips:</p>
              <ul style="margin: 0; padding-left: 20px; color: 047857;">
                <li>We'll notify you when new chapters are released</li>
                <li>Your reading progress is automatically saved</li>
                <li>Access all bookmarks from your library</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${comicUrl}" style="display: inline-block; padding: 14px 32px; background-color: 667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 5px;">
                Continue Reading
              </a>
              <a href="${bookmarksUrl}" style="display: inline-block; padding: 14px 32px; background-color: 10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 5px;">
                View All Bookmarks
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}

async function sendCommentReplyNotification(payload: WorkflowPayload) {
  return await sendCommentNotification(payload);
}

async function sendAdminNotification(payload: WorkflowPayload) {
  const { recipientEmail, recipientName, data } = payload;
  const adminUrl = `${appConfig.url}/admin`;
  const priority = (data["priority"] as string) || "normal";
  const priorityColors = {
    low: { bg: "f0fdf4", border: "10b981", text: "065f46" },
    normal: { bg: "eff6ff", border: "3b82f6", text: "1e40af" },
    high: { bg: "fef3c7", border: "f59e0b", text: "92400e" },
    critical: { bg: "fef2f2", border: "ef4444", text: "991b1b" },
  };
  const colors = priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal;

  const result = await sendEmail({
    to: recipientEmail,
    subject: `[${priority.toUpperCase()}] ${data["title"] || "Admin Notification"}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: 333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, 1f2937 0%, 111827 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Admin Notification</h1>
          </div>
          <div style="background-color: ffffff; padding: 40px; border: 1px solid e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipientName || "Admin"},</p>

            <div style="background-color: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: ${colors.text}; font-weight: 600; text-transform: uppercase;">
                ${priority === "critical" ? "🚨" : priority === "high" ? "⚠️" : "ℹ️"} ${priority} Priority
              </p>
              <h2 style="margin: 0 0 15px 0; color: ${colors.text}; font-size: 20px;">
                ${data["title"] || "System Notification"}
              </h2>
              ${
                data["message"]
                  ? `
              <p style="margin: 0; color: ${colors.text};">
                ${data["message"]}
              </p>
              `
                  : ""
              }
            </div>

            ${
              data["details"]
                ? `
            <div style="background-color: f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: 374151; font-size: 16px;">📋 Details:</h3>
              <pre style="background-color: ffffff; padding: 15px; border-radius: 4px; border: 1px solid e5e7eb; overflow-x: auto; font-size: 14px; line-height: 1.5; margin: 0;">${JSON.stringify(data["details"], null, 2)}</pre>
            </div>
            `
                : ""
            }

            ${
              data["actionRequired"]
                ? `
            <div style="background-color: fef3c7; border: 2px solid f59e0b; padding: 15px; margin: 25px 0; border-radius: 6px; text-align: center;">
              <p style="margin: 0; color: 92400e; font-weight: 600; font-size: 16px;">
                ⚡ Action Required
              </p>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data["actionUrl"] || adminUrl}" style="display: inline-block; padding: 14px 32px; background-color: 1f2937; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                ${data["actionLabel"] || "Go to Admin Dashboard"}
              </a>
            </div>

            <p style="font-size: 12px; color: 9ca3af; margin-top: 25px; padding-top: 20px; border-top: 1px solid e5e7eb;">
              <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br>
              ${data["category"] ? `<strong>Category:</strong> ${data["category"]}<br>` : ""}
              ${data["userId"] ? `<strong>Related User:</strong> ${data["userId"]}` : ""}
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: 9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${appConfig.name} - Admin System</p>
          </div>
        </body>
      </html>
    `,
  });

  return { success: result.success };
}
