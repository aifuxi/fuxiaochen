"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        `
          glass-panel fixed right-8 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full transition-all
          duration-300
          hover:-translate-y-1 hover:shadow-lg
          focus:outline-none
        `,
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-10 opacity-0",
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5 text-[var(--text-color)]" />
    </button>
  );
}
