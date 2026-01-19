/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Password Hasher - Secure Password Hashing Helper
 * ═══════════════════════════════════════════════════════════════════════════
 */

import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
