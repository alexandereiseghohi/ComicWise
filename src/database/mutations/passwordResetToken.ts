import { eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { passwordResetToken } from "@/database/schema";

/**
 *
 * param data
 * param data.email
 * param data.token
 * param data.expires
 * @param data
 * @param data.email
 * @param data.token
 * @param data.expires
 */
export async function createPasswordResetToken(data: {
  email: string;
  token: string;
  expires: Date;
}): Promise<typeof passwordResetToken.$inferSelect | undefined> {
  const [newToken] = await database
    .insert(passwordResetToken)
    .values({
      email: data.email,
      token: data.token,
      expires: data.expires,
    })
    .returning();
  return newToken;
}

/**
 *
 * param token
 * @param token
 */
export async function deletePasswordResetToken(
  token: string
): Promise<typeof passwordResetToken.$inferSelect | undefined> {
  const [deletedToken] = await database
    .delete(passwordResetToken)
    .where(eq(passwordResetToken.token, token))
    .returning();
  return deletedToken;
}

/**
 *
 * param email
 * @param email
 */
export async function deletePasswordResetTokensByEmail(
  email: string
): Promise<(typeof passwordResetToken.$inferSelect)[]> {
  const deletedTokens = await database
    .delete(passwordResetToken)
    .where(eq(passwordResetToken.email, email))
    .returning();
  return deletedTokens;
}
