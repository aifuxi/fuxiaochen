import "server-only";
import { argon2id, hash, verify } from "argon2";

const passwordOptions = { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string) {
  return hash(password, passwordOptions);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
