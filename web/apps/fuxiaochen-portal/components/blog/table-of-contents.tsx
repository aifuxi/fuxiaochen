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
          ".blog-content h1, .blog-content h2, .blog-content h3",
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
      <div className="mb-4 flex items-center gap-2 font-display text-sm font-bold tracking-wider text-neon-cyan uppercase">
        <span className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
        目录 / Table of Contents
      </div>
      <nav className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/10" />
        <ul className="space-y-1">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`} className="relative">
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
                  "block border-l-2 py-1 pl-4 text-sm transition-all duration-300",
                  heading.level === 3 && "pl-8",
                  activeId === heading.id
                    ? "border-neon-cyan bg-neon-cyan/5 font-medium text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]"
                    : "border-transparent text-gray-500 hover:border-white/20 hover:text-gray-300",
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
