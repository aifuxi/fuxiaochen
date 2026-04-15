"use client";

import { useEffect, useMemo, useState } from "react";

import type { TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function TocNav({ items }: { items: TocItem[] }) {
  const nestedItems = useMemo(() => items.filter((item) => item.depth <= 3), [items]);
  const [activeId, setActiveId] = useState<string | null>(nestedItems[0]?.id ?? null);

  useEffect(() => {
    const contentRoot = document.querySelector<HTMLElement>("[data-article-content]");

    if (!contentRoot) {
      return;
    }

    const sections = Array.from(contentRoot.querySelectorAll<HTMLElement>("h2, h3")).filter((section) =>
      nestedItems.some((item) => item.title.trim() === section.textContent?.trim()),
    );

    nestedItems.forEach((item, index) => {
      const section = sections[index];
      if (section && !section.id) {
        section.id = item.id;
      }
    });

    const onScroll = () => {
      const scrollY = window.scrollY + 200;
      const currentSection = [...sections].reverse().find((section) => scrollY >= section.offsetTop) ?? null;
      setActiveId(currentSection?.id ?? nestedItems[0]?.id ?? null);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [nestedItems]);

  if (nestedItems.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-28 rounded-2xl border border-white/6 bg-transparent p-4">
      <div className="mb-4">
        <div className="type-label">页面目录</div>
        <p className="mt-2 text-xs leading-5 text-muted">快速跳转到本文的章节。</p>
      </div>
      <ul className="space-y-1">
        {nestedItems.map((item) => (
          <li key={item.id}>
            <a
              className={cn(
                `
                  block rounded-lg px-3 py-1.5 text-sm leading-6 text-muted transition-colors
                  hover:text-foreground
                `,
                activeId === item.id && "text-foreground",
                item.depth === 3 && "ml-3 text-xs",
              )}
              aria-current={activeId === item.id ? "location" : undefined}
              href={`#${item.id}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
