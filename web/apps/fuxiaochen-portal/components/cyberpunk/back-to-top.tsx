"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Visibility check
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 300);

      // Progress calculation
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight > 0) {
        const scrollPercent = scrollTop / docHeight;
        setProgress(Math.min(100, Math.max(0, scrollPercent * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Circle properties
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 group cursor-pointer!",
        "transition-all duration-500 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none",
      )}
      aria-label="回到顶部 / Back to Top"
    >
      {/* Glow Effect Background */}
      <div className="absolute inset-0 rounded-full bg-neon-cyan/5 blur-md group-hover:bg-neon-cyan/20 transition-all duration-300" />

      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] group-hover:border-neon-cyan/50 transition-all duration-300">
        {/* Progress Ring SVG */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 transform"
          viewBox="0 0 56 56"
        >
          {/* Track */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/10"
          />
          {/* Progress Indicator */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-neon-cyan transition-all duration-100 ease-linear"
          />
        </svg>

        {/* Icon */}
        <div className="relative z-10 text-neon-cyan group-hover:text-white transition-colors duration-300 group-hover:-translate-y-1 transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </div>

        {/* Tech Decor Dots */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-neon-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Label Tooltip (Optional, shows on hover) */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 border border-neon-cyan/30 text-neon-cyan text-xs font-mono uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm translate-x-2 group-hover:translate-x-0 pointer-events-none">
        TOP
      </span>
    </button>
  );
}
