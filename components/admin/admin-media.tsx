"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Copy, Eye, ImageIcon, Search, Trash2, Upload, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

import type { MediaItem } from "./mock-data";

import { useAdminWorkspace } from "./admin-context";
import "./admin-data-workspace.css";
import "./admin-media.css";

export function AdminMedia() {
  const { media, onUploadMedia, onDeleteMedia, onMessage, uploadingMedia } = useAdminWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const previewTrigger = useRef<HTMLElement>(null);
  const deleteTrigger = useRef<HTMLElement>(null);
  const uploadTrigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const term = query.trim().toLocaleLowerCase();
  const filtered = media.filter((item) => item.name.toLocaleLowerCase().includes(term));
  const preview = media.find((item) => item.id === previewId);
  const target = media.find((item) => item.id === deleteId);

  const clearSearch = () => {
    setQuery("");
    searchInput.current?.focus();
  };

  const copyUrl = async (item: MediaItem) => {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(new URL(item.url, window.location.origin).href);
      onMessage(
        item.temporary
          ? "临时图片链接已复制，仅当前浏览器会话可用"
          : "图片链接已复制，可在 Markdown 中引用",
      );
    } catch {
      onMessage("复制失败，请检查浏览器剪贴板权限后重试");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="admin-media admin-data-page">
      <input
        ref={fileInput}
        hidden
        type="file"
        accept="image/*"
        multiple
        aria-label="选择本地图片"
        disabled={uploadingMedia}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          void onUploadMedia(files);
        }}
      />
      <div className="admin-page-heading">
        <div>
          <h1>媒体资产库</h1>
          <p>统一管理博文配图、图表与封面素材，支持一键复制图片链接。</p>
        </div>
        <Button
          ref={uploadTrigger}
          variant="primary"
          size="compact"
          disabled={uploadingMedia}
          onClick={() => fileInput.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          {uploadingMedia ? "正在读取图片…" : "上传本地图片"}
        </Button>
      </div>
      <div className="admin-data-workspace">
        <div className="admin-data-toolbar admin-media-filter">
          <div className="admin-media-search">
            <label htmlFor="media-search" className="sr-only">
              搜索图片文件名
            </label>
            <InputGroup size="compact">
              <InputGroupInput
                ref={searchInput}
                id="media-search"
                placeholder="搜索图片文件名…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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
          <output className="admin-media-count">
            共计 <strong>{filtered.length}</strong> 份素材
          </output>
        </div>
        {filtered.length ? (
          <div className="admin-media-grid">
            {filtered.map((item) => (
              <Card key={item.id} className="admin-media-card">
                <CardStage className="admin-media-thumbnail">
                  <Image src={item.url} alt={item.name} width={1000} height={667} unoptimized />
                  <div className="admin-media-actions">
                    <Button
                      size="compact"
                      aria-label={`预览 ${item.name}`}
                      onClick={(event) => {
                        previewTrigger.current = event.currentTarget;
                        setPreviewId(item.id);
                      }}
                    >
                      <Eye size={16} aria-hidden="true" />
                      预览
                    </Button>
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
                </CardStage>
                <div className="admin-media-details">
                  <h2 title={item.name}>{item.name}</h2>
                  <div className="admin-media-meta">
                    <span>{item.dimension}</span>
                    <span>{item.size}</span>
                  </div>
                  <div className="admin-media-footer">
                    <span>
                      {item.time.slice(5)}
                      {item.temporary ? " · 临时" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="compact"
                      className="admin-media-delete"
                      aria-label={`删除 ${item.name}`}
                      onClick={(event) => {
                        deleteTrigger.current = event.currentTarget;
                        setDeleteId(item.id);
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="admin-media-empty">
            <ImageIcon size={32} aria-hidden="true" />
            <h2>未找到对应媒体素材</h2>
            <p>清空搜索条件，或添加新的本地图片。</p>
            <div className="admin-form-actions">
              {query && (
                <Button size="compact" onClick={clearSearch}>
                  清空搜索
                </Button>
              )}
              <Button
                variant="primary"
                size="compact"
                disabled={uploadingMedia}
                onClick={() => fileInput.current?.click()}
              >
                上传本地图片
              </Button>
            </div>
          </div>
        )}
      </div>
      <p className="admin-media-note">
        演示数据 · 本地图片仅在当前会话预览，不上传服务器，刷新后恢复初始素材。
      </p>
      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      >
        <DialogContent className="admin-modal admin-media-preview" finalFocus={previewTrigger}>
          {preview && (
            <>
              <div className="admin-modal-heading">
                <div>
                  <DialogTitle>{preview.name}</DialogTitle>
                  <DialogDescription>
                    {preview.temporary
                      ? "本地图片预览，链接仅在当前浏览器会话可用。"
                      : "演示素材预览 · 上传时间为北京时间"}
                  </DialogDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="关闭图片预览"
                  onClick={() => setPreviewId(null)}
                >
                  <X size={18} />
                </Button>
              </div>
              <CardStage className="admin-media-preview-frame">
                <Image src={preview.url} alt={preview.name} width={1000} height={667} unoptimized />
              </CardStage>
              <dl className="admin-media-preview-meta">
                <div>
                  <dt>文件体积</dt>
                  <dd>{preview.size}</dd>
                </div>
                <div>
                  <dt>图片分辨率</dt>
                  <dd>{preview.dimension}</dd>
                </div>
                <div>
                  <dt>上传时间</dt>
                  <dd>{preview.time}</dd>
                </div>
                <div>
                  <dt>媒体格式</dt>
                  <dd>{preview.type}</dd>
                </div>
              </dl>
              <div className="admin-form-actions">
                <Button variant="primary" disabled={copying} onClick={() => void copyUrl(preview)}>
                  <Copy size={16} aria-hidden="true" />
                  {copying ? "正在复制…" : "复制图片链接"}
                </Button>
                <Button onClick={() => setPreviewId(null)}>关闭</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent
          className="admin-confirm"
          finalFocus={() =>
            deleteTrigger.current?.isConnected ? deleteTrigger.current : uploadTrigger.current
          }
        >
          <DialogTitle>确认移除此素材？</DialogTitle>
          <DialogDescription>
            将从当前模拟会话移除「{target?.name}」。刷新后恢复初始素材，本地文件不会被删除。
          </DialogDescription>
          <div className="admin-form-actions">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (target) onDeleteMedia(target.id);
                setDeleteId(null);
              }}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
