import { eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { session } from "@/database/schema";

// ═══════════════════════════════════════════════════
// SESSION MUTATIONS
// ═══════════════════════════════════════════════════

/**
 *
 * param data
 * param data.sessionToken
 * param data.userId
 * param data.expires
 * @param data
 * @param data.sessionToken
 * @param data.userId
 * @param data.expires
 */
export async function createSession(data: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): Promise<typeof session.$inferSelect | undefined> {
  const [newSession] = await database.insert(session).values(data).returning();
  return newSession;
}

/**
 *
 * param sessionToken
 * param data
 * param data.expires
 * @param sessionToken
 * @param data
 * @param data.expires
 */
export async function updateSession(
  sessionToken: string,
  data: { expires?: Date }
): Promise<typeof session.$inferSelect | undefined> {
  const [updatedSession] = await database
    .update(session)
    .set(data)
    .where(eq(session.sessionToken, sessionToken))
    .returning();
  return updatedSession;
}

/**
 *
 * param sessionToken
 * @param sessionToken
 */
export async function deleteSession(
  sessionToken: string
): Promise<typeof session.$inferSelect | undefined> {
  const [deletedSession] = await database
    .delete(session)
    .where(eq(session.sessionToken, sessionToken))
    .returning();
  return deletedSession;
}

/**
 *
 * param userId
 * @param userId
 */
export async function deleteSessionsByUserId(
  userId: string
): Promise<(typeof session.$inferSelect)[]> {
  return await database.delete(session).where(eq(session.userId, userId)).returning();
}

/**
 *
 */
export async function deleteExpiredSessions(): Promise<(typeof session.$inferSelect)[]> {
  const now = new Date();
  return await database.delete(session).where(eq(session.expires, now)).returning();
}
