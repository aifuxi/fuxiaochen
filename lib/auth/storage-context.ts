import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";

// 明文令牌仅在单次适配器调用中存在，用于 RETURNING 和当前会话的读取。
// 数据库存哈希；不跨请求缓存，不允许哈希值被当作新的登录凭证。
export const sessionTokens = new AsyncLocalStorage<Map<string, string>>();
export const loginWriteContext = new AsyncLocalStorage<{
  passwordHash: string | null;
  previousToken: string | undefined;
}>();

export const passkeyWriteContext = new AsyncLocalStorage<{
  kind: "registration" | "authentication" | "management";
  actorToken?: string;
  previousToken?: string;
  passwordHash?: string | null;
  credential?: {
    id: number;
    userId: number;
    counter: number;
    publicKey: string;
    credentialID: string;
  };
  verifiedCounter?: number;
}>();

export function sessionTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
