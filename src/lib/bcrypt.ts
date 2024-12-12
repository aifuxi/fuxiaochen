import bcrypt from "bcryptjs";

export function hashPassword(pwd: string) {
  return bcrypt.hash(pwd, 10);
}

export function comparePassword(s: string, hash: string) {
  return bcrypt.compare(s, hash);
}
