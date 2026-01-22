import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt
 *
 * @param {string} password - Plain text password
 * @param {number} rounds - Bcrypt salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password: string, rounds: number = 10): Promise<string> {
  return bcrypt.hash(password, rounds);
}
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
