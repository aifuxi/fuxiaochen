import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "fx_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function config() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!username || !password || !secret || secret.length < 32) return null;
  return { username, password, secret };
}

function equal(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function validCredentials(username: string, password: string) {
  const credentials = config();
  if (!credentials) return false;

  const validUsername = equal(username, credentials.username);
  const validPassword = equal(password, credentials.password);
  return validUsername && validPassword;
}

function signature(expires: number, credentials: NonNullable<ReturnType<typeof config>>) {
  return createHmac("sha256", credentials.secret)
    .update(`v1:${expires}:${credentials.username}:${credentials.password}`)
    .digest("hex");
}

export function createSession() {
  const credentials = config();
  if (!credentials) return null;

  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expires}.${signature(expires, credentials)}`;
}

export function validSession(token: string | undefined) {
  const credentials = config();
  if (!credentials || !token) return false;

  const match = /^(\d{13})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;

  const expires = Number(match[1]);
  if (expires <= Date.now() || expires > Date.now() + SESSION_MAX_AGE * 1000) return false;

  return timingSafeEqual(
    Buffer.from(match[2], "hex"),
    Buffer.from(signature(expires, credentials), "hex"),
  );
}
