import { db as database } from "@/database/db";
import { session } from "@/database/schema";
import { and, eq, gt } from "drizzle-orm";

// ═══════════════════════════════════════════════════
// SESSION QUERIES
// ═══════════════════════════════════════════════════

export async function getSessionByToken(sessionToken: string) {
  return await database.query.session.findFirst({
    where: eq(session.sessionToken, sessionToken),
  });
}

export async function getSessionsByUserId(userId: string) {
  return await database.query.session.findMany({
    where: eq(session.userId, userId),
  });
}

export async function getActiveSessions(userId: string) {
  const now = new Date();
  return await database
    .select()
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expires, now)));
}
