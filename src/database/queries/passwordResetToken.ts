import { db as database } from "@/database/db";
import { passwordResetToken } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getPasswordResetToken(token: string) {
  return await database.query.passwordResetToken.findFirst({
    where: eq(passwordResetToken.token, token),
  });
}

export async function getValidPasswordResetToken(token: string) {
  return await database.query.passwordResetToken.findFirst({
    where: eq(passwordResetToken.token, token),
  });
}

export async function getPasswordResetTokensByEmail(email: string) {
  return await database.query.passwordResetToken.findMany({
    where: eq(passwordResetToken.email, email),
  });
}
