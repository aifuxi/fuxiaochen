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
    let frameId = 0;

    const updateActiveHeading = () => {
      const offset = 112;
      const activeHeading = headings
        .map(({ id }) => document.getElementById(id))
        .filter((element): element is HTMLElement => Boolean(element))
        .reduce<HTMLElement | null>((current, element) => {
          if (element.getBoundingClientRect().top > offset) {
            return current;
          }

          return element;
        }, null);

      setActiveId(activeHeading?.id ?? headings[0]?.id ?? "");
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateActiveHeading);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
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
