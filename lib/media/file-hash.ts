import { sha256 } from "@noble/hashes/sha2.js";

export async function fileSha256(file: Blob, signal: AbortSignal) {
  const hash = sha256.create();
  const chunkBytes = 4 * 1024 * 1024;
  try {
    // 分块只用于摘要计算；直传仍发送原始 File，不改变完整性校验或引入分片上传。
    for (let offset = 0; offset < file.size; offset += chunkBytes) {
      signal.throwIfAborted();
      const chunk = await file.slice(offset, offset + chunkBytes).arrayBuffer();
      signal.throwIfAborted();
      hash.update(new Uint8Array(chunk));
    }
    signal.throwIfAborted();
    return Array.from(hash.digest(), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } finally {
    hash.destroy();
  }
}
