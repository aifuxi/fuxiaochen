"use client";

import { useEffect } from "react";

export function SiteEffects() {
  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const spotlightCards = Array.from(document.querySelectorAll<HTMLElement>(".spotlight-card"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    revealElements.forEach((element) => observer.observe(element));

    const handlers = spotlightCards.map((card) => {
      const handler = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
      };

      card.addEventListener("mousemove", handler);

      return { card, handler };
    });

    return () => {
      observer.disconnect();
      handlers.forEach(({ card, handler }) => card.removeEventListener("mousemove", handler));
    };
  }, []);

  return null;
}
