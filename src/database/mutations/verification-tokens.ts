import { db as database } from "@/database/db";
import { verificationToken } from "@/database/schema";
import { and, eq, lt } from "drizzle-orm";

// ═══════════════════════════════════════════════════
// VERIFICATION TOKEN MUTATIONS
// ═══════════════════════════════════════════════════

export async function createVerificationToken(data: {
  identifier: string;
  token: string;
  expires: Date;
}): Promise<typeof verificationToken.$inferSelect | undefined> {
  const [newToken] = await database.insert(verificationToken).values(data).returning();
  return newToken;
}

export async function deleteVerificationToken(
  identifier: string,
  token: string
): Promise<typeof verificationToken.$inferSelect | undefined> {
  const [deletedToken] = await database
    .delete(verificationToken)
    .where(and(eq(verificationToken.identifier, identifier), eq(verificationToken.token, token)))
    .returning();
  return deletedToken;
}

export async function deleteVerificationTokensByIdentifier(
  identifier: string
): Promise<(typeof verificationToken.$inferSelect)[]> {
  return await database
    .delete(verificationToken)
    .where(eq(verificationToken.identifier, identifier))
    .returning();
}

export async function deleteExpiredVerificationTokens(): Promise<
  (typeof verificationToken.$inferSelect)[]
> {
  const now = new Date();
  return await database
    .delete(verificationToken)
    .where(lt(verificationToken.expires, now))
    .returning();
}
