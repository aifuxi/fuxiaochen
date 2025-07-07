import { compareSync, hashSync } from "bcryptjs";

export function hashPassword(password: string) {
  return hashSync(password);
}

export function checkPassword(password: string, hashedPassword: string) {
  return compareSync(password, hashedPassword);
}
