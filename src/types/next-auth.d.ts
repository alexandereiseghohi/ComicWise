import "next-auth";
import type { UserRole } from "./database";

declare module "next-auth" {
  interface User {
    id: string;
    role?: UserRole | string;
  }

  interface Session {
    user: User;
  }
}
