import { DrizzleAdapter as NextAuthDrizzleAdapter } from "@auth/drizzle-adapter";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Adapter } from "next-auth/adapters";

import type * as schema from "@/database/schema";
import { account, authenticator, session, user, verificationToken } from "@/database/schema";

/**
 * Initialize Drizzle ORM adapter for NextAuth v5
 * Maps Drizzle schema tables to NextAuth tables
 * param database - Drizzle database instance
 * @param database
 */
export function DrizzleAdapter(database: NodePgDatabase<typeof schema>): Adapter {
  const standardAdapter = NextAuthDrizzleAdapter(database, {
    usersTable: user,
    accountsTable: account,
    sessionsTable: session,
    verificationTokensTable: verificationToken,
    authenticatorsTable: authenticator,
  }) as Adapter;
  return {
    ...standardAdapter,
    /**
     * Override the `createUser` method to include the custom field logic.
     * param user
     * @param user
     */
    async createUser(user) {
      // Add custom logic here, e.g., generating a default username
      // If you need to persist custom fields, do so separately after creation
      if (!standardAdapter.createUser) {
        throw new Error("standardAdapter.createUser is not available");
      }
      const createdUser = await standardAdapter.createUser(user);
      // Optionally, update role or other custom fields here if needed
      return createdUser;
    },

    /**
     * Override the `updateUser` method if needed for custom fields.
     * param user
     * @param user
     */
    async updateUser(user) {
      // You can add logic to handle updates to the 'username' field here
      if (!standardAdapter.updateUser) {
        throw new Error("standardAdapter.updateUser is not available");
      }
      const updatedUser = await standardAdapter.updateUser(user);
      return updatedUser;
    },
  };

  // You can override other methods like `getUser` or `getSessionAndUser`
  // to ensure they return the custom fields correctly if necessary.
}
