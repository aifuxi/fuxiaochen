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
    <div className="sticky top-32 space-y-4 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center gap-2 text-neon-cyan font-display font-bold uppercase tracking-wider text-sm mb-4">
        <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
        Table of Contents
      </div>
      <nav className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />
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
                  "block pl-4 py-1 text-sm transition-all duration-300 border-l-2",
                  heading.level === 3 && "pl-8",
                  activeId === heading.id
                    ? "text-neon-cyan border-neon-cyan bg-neon-cyan/5 font-medium shadow-[0_0_10px_rgba(0,255,255,0.1)]"
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/20",
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
