"use client";

import type { UploadTicket } from "@/lib/media/schema";

import { AdminRequestError } from "./use-posts";

export async function mediaRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/media${path}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new AdminRequestError("无法读取媒体服务响应，请重试。", "INVALID_RESPONSE");
  }
  if (!body || typeof body !== "object")
    throw new AdminRequestError("媒体服务响应无效，请重试。", "INVALID_RESPONSE");
  if (!response.ok)
    throw new AdminRequestError(
      body.error?.message ?? "媒体请求失败，请重试。",
      body.error?.code ?? "REQUEST_FAILED",
    );
  if (!("data" in body))
    throw new AdminRequestError("媒体服务响应缺少数据，请重试。", "INVALID_RESPONSE");
  return body.data;
}
function directUpload(
  ticket: UploadTicket,
  file: File,
  signal: AbortSignal,
  progress: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = (error?: Error) => {
      signal.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve();
    };
    xhr.open("PUT", ticket.url);
    xhr.timeout = 15 * 60_000;
    xhr.withCredentials = false;
    for (const [name, value] of Object.entries(ticket.headers)) xhr.setRequestHeader(name, value);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) progress(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener(
      "load",
      () =>
        finish(
          xhr.status >= 200 && xhr.status < 300
            ? undefined
            : new Error("OSS 上传失败，请检查上传权限、签名有效期和 CORS 后重试。"),
        ),
      { once: true },
    );
    xhr.addEventListener(
      "error",
      () => finish(new Error("上传连接失败，请检查网络及 OSS CORS 后重试。")),
      { once: true },
    );
    xhr.addEventListener("timeout", () => finish(new Error("上传超时，请重试。")), { once: true });
    xhr.addEventListener("abort", () => finish(new DOMException("上传已取消", "AbortError")), {
      once: true,
    });
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      finish(new DOMException("上传已取消", "AbortError"));
      return;
    }
    // 原始 File 直接发送给 OSS，浏览器自行设置 Content-Length。
    xhr.send(file);
  });
}
// 文件内容始终由浏览器直传；不计算摘要，也不调用服务端完成或校验接口。
export async function uploadEditorImage(
  file: File,
  signal: AbortSignal,
  progress: (percent: number) => void,
) {
  const ticket = await mediaRequest<UploadTicket>("/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type || "application/octet-stream" }),
    signal,
  });
  signal.throwIfAborted();
  await directUpload(ticket, file, signal, progress);
  signal.throwIfAborted();
  return ticket.publicUrl;
}
