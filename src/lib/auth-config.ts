import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { User as AuthUser, NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { user as userTable } from "@/database/schema";
import { DrizzleAdapter } from "@/lib/auth-adapter";

const _sessionMaxAge = appConfig?.session?.maxAge ?? 7 * 24 * 60 * 60;
const _sessionUpdateAge = appConfig?.session?.updateAge ?? 24 * 60 * 60;

export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt" as const,
    maxAge: _sessionMaxAge,
    updateAge: _sessionUpdateAge,
  },
  // During unit tests we avoid initializing the real Drizzle adapter since the
  // database may be a test placeholder. Only create the adapter in non-test
  // environments.
  adapter: process.env.NODE_ENV === "test" ? undefined : DrizzleAdapter(database as any),
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
    newUser: "/sign-up",
    signOut: "/sign-out",
    verifyRequest: "/verify-request",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "youremail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials) return null;

        const email = String(credentials.email ?? "");
        const password = String(credentials.password ?? "");

        if (!email || !password) {
          throw new Error("Invalid credentials");
        }

        const userRecord = await database.query.user.findFirst({
          where: eq(userTable.email, email),
        });

        if (!userRecord) {
          throw new Error("No user found with this email");
        }

        if (!userRecord.password) {
          throw new Error("This account was created with OAuth. Use Google Sign-in");
        }

        const isPasswordValid = await bcrypt.compare(password, userRecord.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        if (!userRecord.emailVerified && appConfig.features.emailVerification) {
          throw new Error("Please verify your email before signing in");
        }

        return {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name ?? "",
          image: userRecord.image ?? null,
          role: userRecord.role ?? "user",
          emailVerified: userRecord.emailVerified,
        } as unknown as AuthUser;
      },
    }),
    ...((appConfig?.auth?.providers?.google ?? false) &&
    process.env["AUTH_GOOGLE_CLIENT_ID"] &&
    process.env["AUTH_GOOGLE_CLIENT_SECRET"]
      ? [
          GoogleProvider({
            clientId: process.env["AUTH_GOOGLE_CLIENT_ID"],
            clientSecret: process.env["AUTH_GOOGLE_CLIENT_SECRET"],
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...((appConfig?.auth?.providers?.github ?? false) &&
    process.env["AUTH_GITHUB_CLIENT_ID"] &&
    process.env["AUTH_GITHUB_CLIENT_SECRET"]
      ? [
          GithubProvider({
            clientId: process.env["AUTH_GITHUB_CLIENT_ID"],
            clientSecret: process.env["AUTH_GITHUB_CLIENT_SECRET"],
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      if (account.provider === "credentials") {
        return true;
      }

      if (account.provider === "google" && user?.email) {
        // Auto-create user on Google sign-in
        const existingUser = await database.query.user.findFirst({
          where: eq(userTable.email, user.email),
        });

        if (!existingUser) {
          await database.insert(userTable).values({
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            role: "user",
          });
        }

        return true;
      }

      return false;
    },

    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: AuthUser;
      trigger?: string;
      session?: unknown;
    }) {
      if (user) {
        token.id = user.id ?? "";
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.picture = user.image ?? null;
      }

      if (trigger === "update" && session) {
        const sessionData = session as Record<string, unknown>;
        token = { ...token, ...sessionData };
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
        session.user.email = String(token.email ?? "");
        session.user.name = String(token.name ?? "");
        session.user.image = (token.picture as string) ?? null;
      }

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }: { user: AuthUser }) {
      console.log(`✅ User signed in: ${user.email}`);
    },
    async signOut() {
      console.log("👋 User signed out");
    },
  },
  secret: appConfig?.auth?.secret ?? process.env["AUTH_SECRET"] ?? undefined,
} as const;

export default authOptions;
