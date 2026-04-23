"use client";

import { useEffect, useState } from "react";

import { extractMarkdownHeadings } from "@/lib/markdown-headings";
import { cn } from "@/lib/utils";

import { siteCopy } from "@/constants/site-copy";

type TableOfContentsProps = {
  content: string;
};

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState(() =>
    extractMarkdownHeadings(content),
  );

  useEffect(() => {
    setHeadings(extractMarkdownHeadings(content));
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
        {siteCopy.toc.title}
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
