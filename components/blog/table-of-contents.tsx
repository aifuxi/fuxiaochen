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
          ".glass-prose h1, .glass-prose h2, .glass-prose h3",
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
    <div className="custom-scrollbar sticky top-32 max-h-[calc(100vh-9rem)] space-y-4 overflow-y-auto pr-2">
      <div
        className={`mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-[var(--accent-color)]`}
      >
        <div className="h-2 w-2 rounded-full bg-[var(--accent-color)]" />
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
                  "block rounded-2xl px-3 py-2 text-sm transition-all duration-300",
                  heading.level === 3 && "pl-6",
                  activeId === heading.id
                    ? "bg-[var(--accent-color)]/10 font-medium text-[var(--accent-color)] shadow-sm backdrop-blur-sm"
                    : `
                      text-[var(--text-color-secondary)]
                      hover:bg-[var(--glass-bg)] hover:text-[var(--text-color)]
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
