import argon2 from "argon2";
import crypto from "crypto";

/**
 * Hashes a plain password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
  });
}

/**
 * Verifies a plain password against an Argon2id hash.
 * Returns false on mismatch or invalid hash format.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Generates a high-entropy 256-bit cryptographically secure session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a SHA-256 hash of a session token for secure database storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
