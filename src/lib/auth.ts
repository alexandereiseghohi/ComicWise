import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { user } from "@/database/schema";
import { authOptions } from "@/lib/auth-config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import NextAuth from "next-auth";
// Type assertion to satisfy NextAuth's strict typing
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

/**
 * Hash password helper
 * @param password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, appConfig.security?.bcryptRounds ?? 10);
}

/**
 * Get the current user's session
 * Safe to call from Server Components
 */
export async function getSession(): Promise<Session | null> {
  try {
    return await auth();
  } catch {
    return null;
  }
}

/**
 * Get the currently logged-in user with full details from database
 */
export async function getCurrentUser(): Promise<typeof user.$inferSelect | null> {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await database.query.user.findFirst({
      where: eq(user.email, session.user.email),
    });

    return currentUser || null;
  } catch {
    return null;
  }
}

/**
 * Get current user ID safely
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user has specific role
 * param requiredRole
 * @param requiredRole
 */
export async function hasRole(requiredRole: "admin" | "moderator" | "user"): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;

  if (requiredRole === "admin") {
    return currentUser.role === "admin";
  }

  if (requiredRole === "moderator") {
    return currentUser.role === "admin" || currentUser.role === "moderator";
  }

  return true;
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth(): Promise<typeof user.$inferSelect> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Authentication required");
  }

  return currentUser;
}

/**
 * Require specific role - throw error if not authorized
 * param requiredRole
 * @param requiredRole
 */
export async function requireRole(
  requiredRole: "admin" | "moderator"
): Promise<typeof user.$inferSelect> {
  const currentUser = await requireAuth();
  const hasRequiredRole = await hasRole(requiredRole);

  if (!hasRequiredRole) {
    throw new Error(`${requiredRole} role required`);
  }

  return currentUser;
}
