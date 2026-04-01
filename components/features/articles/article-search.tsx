import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { filterTags } from "@/lib/mock/design-content";

export function ArticleSearch() {
  return (
    <section className="spotlight-card rounded-[1.5rem] border border-white/10 bg-card p-6 backdrop-blur-xl">
      <div className={`
        grid gap-5
        xl:grid-cols-[1.3fr_220px]
      `}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <Input
            className="h-12 rounded-[0.9rem] border-border bg-white/5 pl-10"
            placeholder="Search articles, topics, notes..."
          />
        </div>
        <select className={`
          h-12 rounded-[0.9rem] border border-border bg-white/5 px-4 text-sm text-fg transition-colors outline-none
          focus:border-primary
        `}>
          <option>All Topics</option>
          <option>Design Systems</option>
          <option>Editorial UI</option>
          <option>CMS</option>
        </select>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {filterTags.map((tag, index) => (
          <button
            key={tag}
            type="button"
            className={`
              rounded-full px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors
              ${
              index === 0
                ? "bg-primary text-primary-fg"
                : `
                  bg-white/6 text-muted
                  hover:text-fg
                `
            }
            `}
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
