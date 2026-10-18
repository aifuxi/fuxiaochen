"use client";

import type { MouseEvent } from "react";

import { ListTree, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { HeadingEntry } from "@/lib/posts/outline";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ArticleOutline({ entries }: { entries: HeadingEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const destination = useRef<HTMLElement | null>(null);
  const readingHeading = useRef<HTMLElement | null>(null);
  const minimumLevel = Math.min(...entries.map((entry) => entry.level));

  useEffect(() => {
    const headings = entries.map((entry) => document.getElementById(entry.id));
    const update = () => {
      let current = entries[0]?.id ?? "";
      for (const heading of headings)
        if (heading && heading.getBoundingClientRect().top <= 129) current = heading.id;
      setActive(current);
    };
    // 比 96px 锚点留白多出 32px，避免恰好停在 observer 边界时漏掉章节更新。
    // 只在标题穿过视口边界时更新，不逐帧监听整篇文章滚动。
    const observer = new IntersectionObserver(update, {
      rootMargin: "-128px 0px 0px",
      threshold: [0, 1],
    });
    for (const heading of headings) if (heading) observer.observe(heading);
    window.addEventListener("hashchange", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", update);
    };
  }, [entries]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", resize);
    return () => desktop.removeEventListener("change", resize);
  }, []);

  if (!entries.length) return null;

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const heading = document.getElementById(id);
    if (!heading) return;
    event.preventDefault();
    destination.current = open ? heading : null;
    setOpen(false);
    setActive(id);
    // 仅更新 hash，保留 returnTo；无脚本时真实 href 仍能跳转。
    if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
    heading.scrollIntoView({ block: "start", behavior: "instant" });
    heading.focus({ preventScroll: true });
  };
  const links = () => (
    <ol className="site-article-outline-links">
      {entries.map((entry) => (
        <li
          key={entry.id}
          style={{ paddingInlineStart: Math.max(0, entry.level - minimumLevel) * 12 }}
        >
          <a
            href={`#${entry.id}`}
            title={entry.title}
            aria-current={active === entry.id ? "location" : undefined}
            onClick={(event) => navigate(event, entry.id)}
          >
            {entry.title}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <aside className="site-article-outline" aria-label="文章目录">
      <nav className="site-article-outline-desktop" aria-label="文章章节">
        <p className="site-article-outline-label">文章目录</p>
        {links()}
      </nav>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          destination.current = null;
          if (next) readingHeading.current = document.getElementById(active);
          setOpen(next);
        }}
      >
        <DialogTrigger
          className="site-article-outline-trigger"
          aria-label="打开文章目录"
          render={<Button variant="secondary" size="compact" />}
        >
          <ListTree size={16} aria-hidden="true" />
          文章目录
          <span className="site-article-outline-current">
            {entries.find((entry) => entry.id === active)?.title}
          </span>
        </DialogTrigger>
        <DialogContent
          className="site-article-outline-dialog"
          finalFocus={() =>
            destination.current ??
            (window.matchMedia("(min-width: 1024px)").matches ? readingHeading.current : true)
          }
        >
          <div className="site-article-outline-heading">
            <DialogTitle>文章目录</DialogTitle>
            <Button
              variant="ghost"
              size="compact"
              aria-label="关闭文章目录"
              onClick={() => setOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
          <nav aria-label="文章章节">{links()}</nav>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
