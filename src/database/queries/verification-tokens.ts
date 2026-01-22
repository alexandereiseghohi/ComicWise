import { db as database } from "@/database/db";
import { verificationToken } from "@/database/schema";
import { and, eq, gt } from "drizzle-orm";

// ═══════════════════════════════════════════════════
// VERIFICATION TOKEN QUERIES
// ═══════════════════════════════════════════════════

export async function getVerificationToken(identifier: string, token: string) {
  return await database.query.verificationToken.findFirst({
    where: and(eq(verificationToken.identifier, identifier), eq(verificationToken.token, token)),
  });
}

export async function getValidVerificationToken(identifier: string, token: string) {
  const now = new Date();
  return await database.query.verificationToken.findFirst({
    where: and(
      eq(verificationToken.identifier, identifier),
      eq(verificationToken.token, token),
      gt(verificationToken.expires, now)
    ),
  });
}

export async function getVerificationTokensByIdentifier(identifier: string) {
  return await database.query.verificationToken.findMany({
    where: eq(verificationToken.identifier, identifier),
  });
}
