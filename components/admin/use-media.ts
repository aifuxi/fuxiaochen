"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MediaItem, MediaList, UploadTicket } from "@/lib/media/schema";

import { fileSha256 } from "@/lib/media/file-hash";
import { ATTACHMENT_MAX_BYTES, fileKind, IMAGE_MAX_BYTES, uploadSchema } from "@/lib/media/schema";

import { AdminRequestError, usePostQuery } from "./use-posts";

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
export function useMediaList(
  filters: { q: string; kind: string; page: number; record?: string },
  revision: number,
) {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: "12" });
  if (filters.record) params.set("record", filters.record);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.kind !== "all") params.set("kind", filters.kind);
  return usePostQuery(`?${params}`, revision, mediaRequest<MediaList>);
}
export type UploadJob = {
  id: string;
  name: string;
  progress: number;
  status: "queued" | "preparing" | "uploading" | "verifying" | "done" | "error";
  error: string;
};
type InternalJob = UploadJob & {
  file: File;
  ticket?: UploadTicket;
  uploaded?: boolean;
  sha256?: string;
};
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
    // 浏览器为原始 File 自动提供已签名的 Content-Length，不手动设置禁止写入的请求头。
    xhr.send(file);
  });
}
export function useMediaUploads(onMessage: (message: string) => void) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [revision, setRevision] = useState(0);
  const records = useRef(new Map<string, InternalJob>());
  const controllers = useRef(new Map<string, AbortController>());
  const running = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const currentControllers = controllers.current;
    return () => {
      mounted.current = false;
      for (const controller of currentControllers.values()) controller.abort();
    };
  }, []);
  const publish = useCallback(() => {
    if (mounted.current)
      setJobs(
        Array.from(records.current.values(), ({ id, name, status, progress, error }) => ({
          id,
          name,
          status,
          progress,
          error,
        })),
      );
  }, []);
  const update = useCallback(
    (job: InternalJob, data: Partial<InternalJob>) => {
      Object.assign(job, data);
      publish();
    },
    [publish],
  );
  const run = useCallback(
    async (job: InternalJob): Promise<boolean> => {
      const controller = new AbortController();
      controllers.current.set(job.id, controller);
      running.current += 1;
      update(job, { status: "preparing", error: "" });
      try {
        const kind = fileKind(job.file);
        const cap = kind === "image" ? IMAGE_MAX_BYTES : ATTACHMENT_MAX_BYTES;
        if (!job.file.size || job.file.size > cap)
          throw new Error(
            `${kind === "image" ? "图片" : "附件"}必须大于 0 字节且最多 ${cap / (1024 * 1024)} MiB。`,
          );
        if (!job.sha256) {
          job.sha256 = await fileSha256(job.file, controller.signal);
        }
        if (controller.signal.aborted) return false;
        if (
          !job.ticket ||
          (!job.uploaded && new Date(job.ticket.expiresAt).getTime() <= Date.now())
        ) {
          const input = uploadSchema.parse({
            name: job.file.name,
            kind,
            bytes: job.file.size,
            sha256: job.sha256,
          });
          job.ticket = await mediaRequest<UploadTicket>("/uploads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
            signal: controller.signal,
          });
          job.uploaded = false;
        }
        if (!job.uploaded) {
          update(job, { status: "uploading", progress: 0 });
          await directUpload(job.ticket, job.file, controller.signal, (progress) =>
            update(job, { progress }),
          );
          job.uploaded = true;
        }
        update(job, { status: "verifying", progress: 100 });
        await mediaRequest<MediaItem>(`/uploads/${job.ticket.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          signal: controller.signal,
        });
        update(job, { status: "done" });
        if (mounted.current) setRevision((value) => value + 1);
        return true;
      } catch (error) {
        if (controller.signal.aborted) return false;
        if (
          error instanceof AdminRequestError &&
          ["INVALID_INPUT", "UPLOAD_EXPIRED", "NOT_FOUND"].includes(error.code)
        ) {
          job.ticket = undefined;
          job.uploaded = false;
        }
        update(job, {
          status: "error",
          error: error instanceof Error ? error.message : "上传失败，请重试。",
        });
        return false;
      } finally {
        controllers.current.delete(job.id);
        running.current -= 1;
      }
    },
    [update],
  );
  const upload = useCallback(
    async (files: File[]) => {
      if (
        !files.length ||
        running.current ||
        Array.from(records.current.values()).some((job) => job.status === "queued")
      )
        return;
      const unfinished = Array.from(records.current.values()).filter(
        (job) => job.status !== "done",
      ).length;
      if (files.length + unfinished > 20) {
        onMessage("最多同时保留 20 个未完成文件，请完成或移除失败项后继续。");
        return;
      }
      for (const [id, job] of records.current)
        if (job.status === "done") records.current.delete(id);
      const added = files.map((file): InternalJob => ({
        file,
        name: file.name,
        id: crypto.randomUUID(),
        status: "queued",
        progress: 0,
        error: "",
      }));
      for (const job of added) records.current.set(job.id, job);
      publish();
      let index = 0;
      const worker = async () => {
        while (index < added.length && mounted.current) {
          const job = added[index++];
          await run(job);
        }
      };
      await Promise.all([worker(), worker()]);
      if (mounted.current) {
        const successes = added.filter((job) => job.status === "done").length;
        onMessage(
          `已保存 ${successes} 个文件${successes < added.length ? `，${added.length - successes} 个失败，可逐项重试` : ""}。`,
        );
      }
    },
    [onMessage, publish, run],
  );
  const retry = useCallback(
    async (id: string) => {
      const job = records.current.get(id);
      if (!job || job.status !== "error" || running.current >= 2) return;
      const saved = await run(job);
      if (mounted.current && saved) onMessage(`「${job.name}」已保存。`);
    },
    [onMessage, run],
  );
  const clear = useCallback(() => {
    for (const [id, job] of records.current)
      if (job.status === "done" || job.status === "error") records.current.delete(id);
    publish();
  }, [publish]);
  const remove = useCallback(
    async (id: string) => {
      await mediaRequest<{ id: string }>(`/${id}`, { method: "DELETE" });
      if (mounted.current) setRevision((value) => value + 1);
      onMessage("文件已永久删除。");
    },
    [onMessage],
  );
  return {
    mediaRevision: revision,
    mediaUploads: jobs,
    onUploadMedia: upload,
    retryMediaUpload: retry,
    clearMediaUploads: clear,
    onDeleteMedia: remove,
    uploadingMedia: jobs.some((job) => !["done", "error"].includes(job.status)),
  };
}
