"use client";
import { Button } from "@/components/ui/button";

import { useAdminWorkspace } from "./admin-context";
import "./admin-media.css";

const states = {
  queued: "等待上传",
  preparing: "准备文件",
  uploading: "正在上传",
  verifying: "服务端核验中",
  done: "已保存",
  error: "上传失败",
};
export function MediaUploadStatus() {
  const { mediaUploads, uploadingMedia, retryMediaUpload, clearMediaUploads } = useAdminWorkspace();
  if (!mediaUploads.length) return null;
  return (
    <section className="admin-media-upload-status" aria-label="文件上传状态">
      <div className="admin-media-upload-heading">
        <strong>上传状态</strong>
        <Button
          size="compact"
          variant="ghost"
          onClick={clearMediaUploads}
          disabled={uploadingMedia}
        >
          清除已结束项
        </Button>
      </div>
      <ul>
        {mediaUploads.map((job) => (
          <li key={job.id}>
            <span className="admin-media-upload-name">{job.name}</span>
            <output>
              {states[job.status]}
              {job.status === "uploading" ? ` · ${job.progress}%` : ""}
            </output>
            {job.status === "uploading" && (
              <progress max={100} value={job.progress} aria-label={`${job.name} 上传进度`} />
            )}
            {job.error && <span className="admin-media-error">{job.error}</span>}
            {job.status === "error" && (
              <Button
                size="compact"
                onClick={() => void retryMediaUpload(job.id)}
                disabled={uploadingMedia}
              >
                重试
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
