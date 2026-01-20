import { db } from "@/database/db";
import { passwordResetToken } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function createPasswordResetToken(data: {
  email: string;
  token: string;
  expires: Date;
}) {
  const [newToken] = await db
    .insert(passwordResetToken)
    .values({
      email: data.email,
      token: data.token,
      expires: data.expires,
    })
    .returning();

  return newToken;
}

export async function deletePasswordResetToken(token: string) {
  await db.delete(passwordResetToken).where(eq(passwordResetToken.token, token));
}

export async function deletepasswordResetTokenByEmail(email: string) {
  await db.delete(passwordResetToken).where(eq(passwordResetToken.email, email));
}
