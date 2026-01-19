import { and, eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { authenticator } from "@/database/schema";

// ═══════════════════════════════════════════════════
// AUTHENTICATOR QUERIES
// ═══════════════════════════════════════════════════

/**
 *
 * param credentialID
 * @param credentialID
 */
export async function getAuthenticatorByCredentialId(credentialID: string) {
  return await database.query.authenticator.findFirst({
    where: eq(authenticator.credentialID, credentialID),
  });
}

/**
 *
 * param userId
 * @param userId
 */
export async function getAuthenticatorsByUserId(userId: string) {
  return await database.query.authenticator.findMany({
    where: eq(authenticator.userId, userId),
  });
}

/**
 *
 * param userId
 * param credentialID
 * @param userId
 * @param credentialID
 */
export async function getAuthenticator(userId: string, credentialID: string) {
  return await database.query.authenticator.findFirst({
    where: and(eq(authenticator.userId, userId), eq(authenticator.credentialID, credentialID)),
  });
}
