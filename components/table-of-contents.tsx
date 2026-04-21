"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  content: string;
};

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    // Parse headings from markdown content
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      matches.push({ id, text, level });
    }

    setHeadings(matches);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24">
      <h4 className="text-foreground mb-4 text-sm font-semibold">
        On This Page
      </h4>
      <ul className="flex flex-col gap-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? "1rem" : "0" }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className={cn(
                "text-muted-foreground hover:text-foreground block transition-colors",
                activeId === heading.id && "text-foreground font-medium",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
