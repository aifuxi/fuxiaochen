"use client";

import { ScrollArea } from "@base-ui/react/scroll-area";
import { ArrowUpRight, ChevronRight, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { DialogContent, PreviewScrollbar } from "./preview-components";
import styles from "./preview.module.css";
import { WorkbenchDemo } from "./workbench-demos";
import { WorkbenchFoundations } from "./workbench-foundations";
import { findSection, resolveSection, sectionGroups, type SectionId } from "./workbench-model";

export default function DesignWorkbench() {
  const { theme, setTheme } = useTheme();
  const [activeId, setActiveId] = useState<SectionId>("colors");
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const mainRef = useRef<HTMLElement>(null);
  const directoryButtonRef = useRef<HTMLButtonElement>(null);
  const navigationPending = useRef(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { section, group } = findSection(activeId);

  useEffect(() => {
    // Hash 保留可分享入口与浏览器历史；旧章节链接继续映射到对应工作区。
    const syncLocation = () => setActiveId(resolveSection(window.location.hash.slice(1)));
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const showNotice = useCallback((message: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(""), 3500);
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
    // 保留修饰键打开新标签页的原生链接行为。
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
    navigationPending.current = true;
    setActiveId(id);
    setDirectoryOpen(false);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!directoryOpen) mainRef.current?.focus({ preventScroll: true });
  }

  const directory = (
    <nav aria-label="设计规范目录" className="workbench-nav">
      {sectionGroups.map((item) => (
        <div className="workbench-nav-group" key={item.label}>
          <p className="workbench-nav-label">{item.label}</p>
          {item.sections.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              aria-current={activeId === entry.id ? "page" : undefined}
              onClick={(event) => navigate(event, entry.id)}
              className="workbench-nav-link"
            >
              {entry.label}
              {activeId === entry.id && <ChevronRight size={14} aria-hidden="true" />}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className={cn(styles.scope, "design-showcase workbench")} data-preview-theme={theme}>
      <a
        href="#workbench-content"
        className="workbench-skip"
        onClick={(event) => {
          // 跳过导航只改变焦点，不能覆盖当前主题的深链接。
          event.preventDefault();
          mainRef.current?.focus({ preventScroll: true });
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
      >
        跳转到工作区
      </a>
      <header className="workbench-header">
        <div className="workbench-brand">
          <span className="workbench-brand-mark" aria-hidden="true">
            d.
          </span>
          <span>Design spec</span>
          <span className="workbench-brand-description">设计试验区</span>
        </div>
        <div className="workbench-header-actions">
          <span className="workbench-scope-label">全站主题</span>
          <Button
            type="button"
            variant="secondary"
            size="compact"
            className="workbench-theme-toggle"
            aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setNotice("");
            }}
          >
            {theme === "dark" ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
            {theme === "dark" ? "浅色" : "深色"}
          </Button>
          <Link href="/" className="workbench-back">
            返回网站 <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <aside className="workbench-sidebar">
        <ScrollArea.Root className={`${styles.scrollArea} workbench-sidebar-scroll`}>
          <ScrollArea.Viewport
            render={<section />}
            className={`${styles.scrollViewport} workbench-sidebar-viewport`}
            aria-label="可滚动的设计规范目录"
          >
            <ScrollArea.Content className="workbench-sidebar-content">
              {directory}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <PreviewScrollbar />
        </ScrollArea.Root>
      </aside>

      <div className="workbench-mobile-bar">
        <Dialog
          open={directoryOpen}
          onOpenChange={(open) => {
            if (open) navigationPending.current = false;
            setDirectoryOpen(open);
          }}
        >
          <DialogTrigger
            render={<Button ref={directoryButtonRef} size="compact" variant="ghost" />}
          >
            <Menu size={18} aria-hidden="true" />
            目录
          </DialogTrigger>
          <span className="workbench-breadcrumb">
            {group.label}
            <ChevronRight size={12} aria-hidden="true" />
            {section.label}
          </span>
          <DialogContent
            finalFocus={() =>
              navigationPending.current ? mainRef.current : directoryButtonRef.current
            }
          >
            <div className="design-showcase workbench-directory-content">
              <div className="workbench-directory-heading">
                <DialogTitle className="text-lg font-semibold">设计规范目录</DialogTitle>
                <DialogClose
                  render={
                    <Button
                      size="compact"
                      variant="ghost"
                      className="workbench-directory-close"
                      aria-label="关闭目录"
                    />
                  }
                >
                  <X size={18} aria-hidden="true" />
                </DialogClose>
              </div>
              {directory}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <main
        ref={mainRef}
        tabIndex={-1}
        id="workbench-content"
        className="workbench-main"
        data-page-motion
      >
        <div className="workbench-content">
          <header id={activeId} className="workbench-page-heading">
            <h1>{section.label}</h1>
            <p className="workbench-introduction">{section.description}</p>
          </header>
          <div key={activeId} className="workbench-view">
            {group.label === "基础" || activeId === "guidelines" ? (
              <WorkbenchFoundations sectionId={activeId} onNotice={showNotice} />
            ) : (
              <WorkbenchDemo sectionId={activeId} onNotice={showNotice} />
            )}
          </div>
          <footer className="workbench-footer">
            Afterglow <span aria-hidden="true">·</span> 设计工作台 <span aria-hidden="true">/</span>{" "}
            Semi 默认主题 + modern
          </footer>
        </div>
      </main>
      <output className="workbench-notice" aria-live="polite" aria-atomic="true">
        {notice && <span>{notice}</span>}
      </output>
    </div>
  );
}
