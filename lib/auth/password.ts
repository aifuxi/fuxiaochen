import "server-only";
import { argon2id, hash, verify } from "argon2";

const passwordOptions = { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

// 与真实密码使用相同参数，让不存在的账号也执行密码校验。
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,p=1,t=2$Ze1XOgpZ7+fP5hlWvG92/A$foc5l3DERoL1EA5thLLgpmgNrStA6IcAZ+ncpuHFQCs";

export function hashPassword(password: string) {
  return hash(password, passwordOptions);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
