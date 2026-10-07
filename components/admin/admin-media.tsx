"use client";

import { Checkbox } from "@base-ui/react/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  File,
  ImageIcon,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { MediaItem, MediaReferences } from "@/lib/media/schema";

import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDIA_SIZE_HINT } from "@/lib/media/schema";

import { useAdminWorkspace } from "./admin-context";
import { MediaUploadStatus } from "./media-upload-status";
import { RecordLocator, useRecordTarget } from "./record-locator";
import { mediaRequest, useMediaList } from "./use-media";
import { AdminRequestError, usePostQuery } from "./use-posts";
import "./admin-data-workspace.css";
import "./admin-media.css";

function bytesLabel(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KiB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}
function dateLabel(value: string) {
  return new Date(value).toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).slice(0, 16);
}
function Picture({ item, preview = false }: { item: MediaItem; preview?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed || !item.url)
    return <output className="admin-media-image-fallback">图片加载失败，请稍后重试。</output>;
  return (
    <Image
      src={item.url}
      alt={item.name}
      width={item.width ?? 1000}
      height={item.height ?? 667}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={preview ? "admin-media-full-image" : undefined}
    />
  );
}

export function AdminMedia() {
  const record = useRecordTarget();
  const { onUploadMedia, onDeleteMedia, onMessage, uploadingMedia, mediaRevision } =
    useAdminWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const previewTrigger = useRef<HTMLElement>(null);
  const deleteTrigger = useRef<HTMLElement>(null);
  const uploadTrigger = useRef<HTMLButtonElement>(null);
  const deletingRef = useRef(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [page, setPage] = useState(1);
  const list = useMediaList({ q: query, kind, page, record }, mediaRevision);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [target, setTarget] = useState<MediaItem | null>(null);
  const [copying, setCopying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [forceKey, setForceKey] = useState("");
  const [referenceRevision, setReferenceRevision] = useState(0);
  const references = usePostQuery(
    target ? `/${target.id}/references` : null,
    referenceRevision,
    mediaRequest<MediaReferences>,
  );
  const referenceKey =
    target && references.data ? `${target.id}:${references.data.fingerprint}` : "";
  const force = Boolean(referenceKey) && forceKey === referenceKey;
  const setForce = (value: boolean) => setForceKey(value ? referenceKey : "");
  const located = useRef<string | undefined>(undefined);
  useEffect(() => {
    const item = list.data?.items[0];
    if (item && item.status === "ready" && record !== located.current && item.id === record) {
      located.current = record;
      setPreview(item);
    }
    if (!record) located.current = undefined;
  }, [record, list.data]);
  const clearSearch = () => {
    setQuery("");
    setKind("all");
    setPage(1);
    searchInput.current?.focus();
  };
  const copyUrl = async (item: MediaItem) => {
    if (copying || !item.url) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(item.url);
      onMessage("永久文件链接已复制。");
    } catch {
      onMessage("复制失败，请检查浏览器剪贴板权限后重试。");
    } finally {
      setCopying(false);
    }
  };
  const confirmDelete = async () => {
    if (
      !target ||
      deletingRef.current ||
      !references.data ||
      references.loading ||
      references.error ||
      (references.data.count > 0 && !force)
    )
      return;
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError("");
    try {
      await onDeleteMedia(target.id, { force, referenceFingerprint: references.data.fingerprint });
      setTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "删除失败，请重试。");
      if (
        error instanceof AdminRequestError &&
        ["REFERENCES_CHANGED", "RESOURCE_IN_USE"].includes(error.code)
      ) {
        setForce(false);
        setReferenceRevision((value) => value + 1);
      }
      list.reload();
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  };
  return (
    <div className="admin-media admin-data-page">
      <input
        ref={fileInput}
        hidden
        type="file"
        multiple
        aria-label="选择图片或附件"
        disabled={uploadingMedia}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          void onUploadMedia(files);
        }}
      />
      <RecordLocator
        record={record}
        loading={list.loading}
        error={list.error}
        found={Boolean(list.data?.items.length)}
      />
      <div className="admin-page-heading">
        <div>
          <h1>媒体资产库</h1>
          <p>管理博文配图与下载附件，复制已保存文件的永久链接。</p>
        </div>
        <Button
          ref={uploadTrigger}
          variant="primary"
          size="compact"
          disabled={uploadingMedia}
          onClick={() => fileInput.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          {uploadingMedia ? "正在上传文件…" : "上传文件"}
        </Button>
      </div>
      <MediaUploadStatus />
      <div className="admin-data-workspace">
        <div className="admin-data-toolbar admin-media-filter">
          <div className="admin-media-search">
            <label htmlFor="media-search" className="sr-only">
              搜索文件名
            </label>
            <InputGroup size="compact">
              <InputGroupInput
                ref={searchInput}
                id="media-search"
                placeholder="搜索文件名…"
                value={query}
                maxLength={200}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
              <InputGroupAddon>
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="compact" aria-label="清空搜索" onClick={clearSearch}>
                    <X size={16} aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
          <div className="admin-media-kind">
            <Select
              value={kind}
              items={[
                { value: "all", label: "全部文件" },
                { value: "image", label: "图片" },
                { value: "attachment", label: "附件" },
              ]}
              onValueChange={(value) => {
                setKind(value ?? "all");
                setPage(1);
              }}
            >
              <SelectTrigger size="compact" aria-label="文件类型">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部文件</SelectItem>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="attachment">附件</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <output className="admin-media-count">
            {list.data ? (
              <>
                共计 <strong>{list.data.total}</strong> 份素材
              </>
            ) : (
              "等待查询结果"
            )}
          </output>
        </div>
        {list.loading && <output className="admin-media-empty">正在加载媒体…</output>}
        {list.error && (
          <div className="admin-media-empty" role="alert">
            <p className="admin-media-error">{list.error}</p>
            <Button size="compact" onClick={list.reload}>
              重新加载
            </Button>
          </div>
        )}
        {list.data &&
          (list.data.items.length ? (
            <>
              <div className="admin-media-grid">
                {list.data.items.map((item) => (
                  <Card key={item.id} className="admin-media-card">
                    <CardStage className="admin-media-thumbnail">
                      {item.status === "deleting" ? (
                        <span className="admin-media-image-fallback">删除待重试</span>
                      ) : item.kind === "image" ? (
                        <Picture item={item} />
                      ) : (
                        <div className="admin-media-attachment">
                          <File size={48} aria-hidden="true" />
                          <span>下载附件</span>
                        </div>
                      )}
                      {item.status === "ready" && (
                        <div className="admin-media-actions">
                          {item.kind === "image" ? (
                            <Button
                              size="compact"
                              aria-label={`预览 ${item.name}`}
                              onClick={(event) => {
                                previewTrigger.current = event.currentTarget;
                                setPreview(item);
                              }}
                            >
                              <Eye size={16} aria-hidden="true" />
                              预览
                            </Button>
                          ) : (
                            <a
                              className="admin-media-download"
                              href={item.url ?? undefined}
                              download
                              rel="noopener noreferrer"
                              referrerPolicy="no-referrer"
                              aria-label={`下载 ${item.name}`}
                            >
                              <Download size={16} aria-hidden="true" />
                              下载
                            </a>
                          )}
                          <Button
                            size="compact"
                            variant="primary"
                            disabled={copying}
                            aria-label={`复制 ${item.name} 的链接`}
                            onClick={() => void copyUrl(item)}
                          >
                            <Copy size={15} aria-hidden="true" />
                            复制
                          </Button>
                        </div>
                      )}
                    </CardStage>
                    <div className="admin-media-details">
                      <h2 title={item.name}>{item.name}</h2>
                      <div className="admin-media-meta">
                        <span>
                          {item.kind === "image" ? `${item.width}×${item.height}` : "附件"}
                        </span>
                        <span>{bytesLabel(item.bytes)}</span>
                      </div>
                      <div className="admin-media-footer">
                        <time dateTime={item.uploadedAt}>
                          {dateLabel(item.uploadedAt).slice(5)}
                        </time>
                        <Button
                          variant="ghost"
                          size="compact"
                          className="admin-media-delete"
                          aria-label={`${item.status === "deleting" ? "重试删除" : "删除"} ${item.name}`}
                          onClick={(event) => {
                            deleteTrigger.current = event.currentTarget;
                            setDeleteError("");
                            setTarget(item);
                            setForce(false);
                          }}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-media-empty">
              <ImageIcon size={32} aria-hidden="true" />
              <h2>{query || kind !== "all" ? "未找到对应媒体素材" : "媒体库暂无文件"}</h2>
              <p>上传图片或附件，通过核验后即可使用永久链接。</p>
              <div className="admin-form-actions">
                {(query || kind !== "all") && (
                  <Button size="compact" onClick={clearSearch}>
                    清空筛选
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="compact"
                  disabled={uploadingMedia}
                  onClick={() => fileInput.current?.click()}
                >
                  上传文件
                </Button>
              </div>
            </div>
          ))}
        {list.data && (
          <div className="admin-post-pagination">
            <output aria-live="polite">
              显示第 {list.data.total ? (list.data.page - 1) * list.data.pageSize + 1 : 0}–
              {Math.min(list.data.page * list.data.pageSize, list.data.total)} 条，共{" "}
              {list.data.total} 条
            </output>
            <nav aria-label="媒体分页">
              <Button
                variant="ghost"
                size="compact"
                aria-label="上一页"
                disabled={list.data.page <= 1}
                onClick={() => setPage(Math.max(1, (list.data?.page ?? 1) - 1))}
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </Button>
              <span
                aria-current="page"
                aria-label={`第 ${list.data.page} 页，共 ${list.data.pageCount} 页`}
              >
                {list.data.page} / {list.data.pageCount}
              </span>
              <Button
                variant="ghost"
                size="compact"
                aria-label="下一页"
                disabled={list.data.page >= list.data.pageCount}
                onClick={() => setPage((list.data?.page ?? 1) + 1)}
              >
                <ChevronRight size={17} aria-hidden="true" />
              </Button>
            </nav>
          </div>
        )}
      </div>
      <p className="admin-media-note">{MEDIA_SIZE_HINT}文件上传并通过核验后保存；附件强制下载。</p>
      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="admin-modal admin-media-preview" finalFocus={previewTrigger}>
          {preview && (
            <>
              <div className="admin-modal-heading">
                <div>
                  <DialogTitle>{preview.name}</DialogTitle>
                  <DialogDescription>已保存图片 · 上传时间为北京时间</DialogDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="关闭图片预览"
                  onClick={() => setPreview(null)}
                >
                  <X size={18} aria-hidden="true" />
                </Button>
              </div>
              <CardStage className="admin-media-preview-frame">
                <Picture key={preview.id} item={preview} preview />
              </CardStage>
              <dl className="admin-media-preview-meta">
                <div>
                  <dt>文件体积</dt>
                  <dd>{bytesLabel(preview.bytes)}</dd>
                </div>
                <div>
                  <dt>图片分辨率</dt>
                  <dd>
                    {preview.width}×{preview.height}
                  </dd>
                </div>
                <div>
                  <dt>上传时间</dt>
                  <dd>{dateLabel(preview.uploadedAt)}</dd>
                </div>
                <div>
                  <dt>媒体格式</dt>
                  <dd>{preview.mime}</dd>
                </div>
              </dl>
              <div className="admin-form-actions">
                <Button variant="primary" disabled={copying} onClick={() => void copyUrl(preview)}>
                  <Copy size={16} aria-hidden="true" />
                  {copying ? "正在复制…" : "复制永久链接"}
                </Button>
                <Button onClick={() => setPreview(null)}>关闭</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open && !deletingRef.current) setTarget(null);
        }}
      >
        <DialogContent
          className="admin-confirm"
          finalFocus={() =>
            deleteTrigger.current?.isConnected ? deleteTrigger.current : uploadTrigger.current
          }
        >
          <DialogTitle>确认永久删除此文件？</DialogTitle>
          <DialogDescription>
            将永久删除「{target?.name}」及 OSS
            文件。已在文章或其他位置引用的链接会失效，此操作无法恢复。
          </DialogDescription>
          {references.loading && <output>正在核对内部引用…</output>}
          {references.error && (
            <div>
              <p role="alert">{references.error}</p>
              <Button onClick={references.reload}>重新查询引用</Button>
            </div>
          )}
          {references.data && (
            <div className="admin-modal-section">
              <p>
                {references.data.count
                  ? `仍有 ${references.data.count} 处内部引用：`
                  : "未发现内部引用。外部网站或手动保存的链接仍可能失效。"}
              </p>
              <ul className="admin-media-references">
                {references.data.items.map((item) => (
                  <li key={`${item.kind}:${item.id}:${item.field}`}>
                    <Link href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </Link>
                    <span>
                      {" "}
                      · {item.field}
                      {item.occurrences > 1 ? ` × ${item.occurrences}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {references.data.count > 0 && (
                <label htmlFor="admin-force-media-delete" className="admin-media-force">
                  <Checkbox.Root
                    id="admin-force-media-delete"
                    checked={force}
                    onCheckedChange={setForce}
                    disabled={deleting}
                    className="admin-force-checkbox"
                  >
                    <Checkbox.Indicator aria-hidden="true">✓</Checkbox.Indicator>
                  </Checkbox.Root>
                  <span>我理解引用链接将失效，仍要永久删除</span>
                </label>
              )}
            </div>
          )}
          {deleteError && (
            <p className="admin-media-error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="admin-form-actions">
            <Button variant="ghost" disabled={deleting} onClick={() => setTarget(null)}>
              取消
            </Button>
            <Button
              className="admin-danger"
              disabled={
                deleting ||
                references.loading ||
                Boolean(references.error) ||
                !references.data ||
                (references.data.count > 0 && !force)
              }
              onClick={() => void confirmDelete()}
            >
              {deleting ? "正在删除…" : deleteError ? "重试删除" : force ? "强制删除" : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
