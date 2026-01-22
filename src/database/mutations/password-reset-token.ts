import { db } from "@/database/db";
import { passwordResetToken } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function createPasswordResetToken(data: {
  email: string;
  token: string;
  expires: Date;
}) {
  return await db.insert(passwordResetToken).values(data);
}

export async function deletePasswordResetToken(token: string) {
  return await db.delete(passwordResetToken).where(eq(passwordResetToken.token, token));
}

export async function deletePasswordResetTokenByEmail(email: string) {
  return await db.delete(passwordResetToken).where(eq(passwordResetToken.email, email));
}
