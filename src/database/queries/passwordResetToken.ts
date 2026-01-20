import { db } from "@/database/db";
import { and, eq, gt } from "drizzle-orm";

export async function getPasswordResetToken(token: string) {
  const [passwordResetToken] = await db
    .select()
    .from(passwordResetToken)
    .where(and(eq(passwordResetToken.token, token), gt(passwordResetToken.expiresAt, new Date())))
    .limit(1);

  return passwordResetToken;
}
