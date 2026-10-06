"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IMAGE_MAX_BYTES, type MediaItem } from "@/lib/media/schema";

import { useAdminWorkspace } from "../admin-context";
import { MediaUploadStatus } from "../media-upload-status";
import { PostQueryStatus } from "../post-status";
import { useMediaList } from "../use-media";
import { useDebouncedPostQuery } from "../use-posts";

export function EditorMediaPicker({
  onInsert,
  onClose,
}: {
  onInsert: (image: MediaItem, alt: string) => void;
  onClose: () => void;
}) {
  const { mediaRevision, onUploadMedia, uploadingMedia, postPending } = useAdminWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const term = useDebouncedPostQuery(query);
  const result = useMediaList({ q: term, kind: "image", page }, mediaRevision);
  const data = result.data;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="post-media-picker" finalFocus={false}>
        <DialogTitle>插入图片</DialogTitle>
        <DialogDescription>
          选择媒体库中的图片，或上传后选择。图片最多 {IMAGE_MAX_BYTES / (1024 * 1024)} MiB。
        </DialogDescription>
        <div className="post-media-picker-tools">
          <Input
            aria-label="搜索图片文件名"
            value={query}
            maxLength={200}
            placeholder="搜索图片…"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              setSelected(null);
            }}
          />
          <Button
            type="button"
            disabled={uploadingMedia || postPending}
            onClick={() => fileInput.current?.click()}
          >
            上传图片
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            className="sr-only"
            aria-label="上传文章图片"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              setQuery("");
              setPage(1);
              setSelected(null);
              void onUploadMedia(files);
            }}
          />
        </div>
        <MediaUploadStatus />
        {result.loading && <output>正在加载图片…</output>}
        <PostQueryStatus {...result} loading={false} />
        <div className="post-media-picker-grid" aria-busy={result.loading}>
          {data?.items
            .filter((item) => item.status === "ready" && item.url)
            .map((image) => (
              <Button
                type="button"
                key={image.id}
                variant="ghost"
                aria-pressed={selected?.id === image.id}
                disabled={postPending}
                onClick={() => {
                  setSelected(image);
                  setAlt(image.name);
                }}
              >
                {/* oxlint-disable-next-line nextjs/no-img-element -- 媒体域名由运行时配置，不依赖 Next.js 的构建期远程域名白名单。 */}
                <img src={image.url!} alt="" loading="lazy" />
                <span>{image.name}</span>
              </Button>
            ))}
        </div>
        {data && !data.total && (
          <output>{term ? "没有匹配的图片。" : "媒体库中还没有图片。"}</output>
        )}
        {data && data.pageCount > 1 && (
          <div className="post-media-picker-pagination">
            <Button
              type="button"
              disabled={data.page <= 1}
              onClick={() => {
                setPage(data.page - 1);
                setSelected(null);
              }}
            >
              上一页
            </Button>
            <span>
              {data.page} / {data.pageCount}
            </span>
            <Button
              type="button"
              disabled={data.page >= data.pageCount}
              onClick={() => {
                setPage(data.page + 1);
                setSelected(null);
              }}
            >
              下一页
            </Button>
          </div>
        )}
        <label className="post-editor-field" htmlFor="post-image-alt">
          图片替代文字
          <Input
            id="post-image-alt"
            maxLength={2000}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="描述图片内容，供无法看到图片的读者使用"
          />
        </label>
        <div className="admin-form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!selected || result.loading || Boolean(result.error) || postPending}
            onClick={() => {
              // 插入前再次确认当前页中素材仍可用，避免选择后刷新已删除的素材。
              const image = data?.items.find(
                (item) => item.id === selected?.id && item.status === "ready" && item.url,
              );
              if (image) onInsert(image, alt);
            }}
          >
            插入图片
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
