"use client";

import { useMemo } from "react";

import type { TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function TocNav({ items }: { items: TocItem[] }) {
  const nestedItems = useMemo(() => items.filter((item) => item.depth <= 3), [items]);

  if (nestedItems.length === 0) {
    return null;
  }

  return (
    <aside className="rounded-[1.8rem] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 type-label">On This Page</div>
      <ul className="space-y-1.5">
        {nestedItems.map((item) => (
          <li key={item.id}>
            <a
              className={cn(
                `
                  block rounded-xl px-3 py-2 text-sm text-muted transition-colors
                  hover:bg-white/6 hover:text-foreground
                `,
                item.depth === 3 && "ml-4 text-xs",
              )}
              href={`#${item.id}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
