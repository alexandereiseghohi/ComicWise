import { db } from "@/database/db";
import { passwordResetToken } from "@/database/schema";
import { and, eq, gt } from "drizzle-orm";

export async function getPasswordResetToken(token: string) {
  const [resetToken] = await db
    .select()
    .from(passwordResetToken)
    .where(and(eq(passwordResetToken.token, token), gt(passwordResetToken.expires, new Date())))
    .limit(1);

  return resetToken;
}
