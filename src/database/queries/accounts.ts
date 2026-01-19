import { and, eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { account } from "@/database/schema";

// ═══════════════════════════════════════════════════
// ACCOUNT QUERIES
// ═══════════════════════════════════════════════════

/**
 *
 * param userId
 * param provider
 * @param userId
 * @param provider
 */
export async function getAccountByProvider(userId: string, provider: string) {
  return await database.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.provider, provider)),
  });
}

/**
 *
 * param userId
 * @param userId
 */
export async function getAccountsByUserId(userId: string) {
  return await database.query.account.findMany({
    where: eq(account.userId, userId),
  });
}

/**
 *
 * param provider
 * param providerAccountId
 * @param provider
 * @param providerAccountId
 */
export async function getAccountByProviderAccountId(provider: string, providerAccountId: string) {
  return await database.query.account.findFirst({
    where: and(eq(account.provider, provider), eq(account.providerAccountId, providerAccountId)),
  });
}
