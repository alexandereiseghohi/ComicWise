import type { User as DatabaseUser } from "@/typesdatabase";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "user" | "admin" | "moderator";
    };
  }

  interface User extends DatabaseUser {
    role: "user" | "admin" | "moderator";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "admin" | "moderator";
  }
}
