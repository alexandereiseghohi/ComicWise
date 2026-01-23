import bcrypt from "bcryptjs";

/**
 * Hash a plaintext password using bcrypt (async).
 * Returned value is the bcrypt hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
