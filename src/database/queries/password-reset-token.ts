import { db } from "@/database/db";
import { passwordResetToken } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getPasswordResetToken(token: string) {
  const [result] = await db
    .select()
    .from(passwordResetToken)
    .where(eq(passwordResetToken.token, token))
    .limit(1);
  return result;
}
