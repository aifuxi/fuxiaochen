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
          fixed right-6 bottom-6 z-40 flex size-12 items-center justify-center rounded-full border border-white/10
          bg-black/70 text-foreground shadow-md backdrop-blur-xl transition-all duration-[var(--duration-normal)]
          hover:-translate-y-1 hover:border-primary/40 hover:text-primary hover:shadow-lg
          focus:outline-none
          focus-visible:ring-2 focus-visible:ring-primary/40
        `,
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-10 opacity-0",
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
