"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Wait for the content to be rendered
    const timer = setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll(
          ".prose-brand h1, .prose-brand h2, .prose-brand h3",
        ),
      );

      const headingData = elements.map((element) => ({
        id: element.id,
        text: element.textContent || "",
        level: parseInt(element.tagName.charAt(1)),
      }));

      setHeadings(headingData);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -66% 0px",
        threshold: 0.1,
      },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-28 max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto pr-2">
      <div className="text-label mb-4 flex items-center gap-2 text-primary">
        <div className="h-2 w-2 rounded-full bg-primary" />
        目录
      </div>
      <nav className="relative">
        <ul className="space-y-1">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(`#${heading.id}`)?.scrollIntoView({
                    behavior: "smooth",
                  });
                  setActiveId(heading.id);
                }}
                className={cn(
                  "block rounded-[var(--radius-md)] px-3 py-2 text-sm transition-all duration-[var(--duration-normal)]",
                  heading.level === 3 && "pl-6",
                  activeId === heading.id
                    ? "bg-primary/10 font-medium text-primary shadow-sm"
                    : `
                      text-muted-foreground
                      hover:bg-white/5 hover:text-foreground
                    `,
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
