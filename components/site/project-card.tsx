import { ArrowUpRight } from "lucide-react";

export function ProjectCard({
  title,
  description,
  tags,
  links,
  image,
}: {
  title: string;
  description: string;
  tags: readonly string[];
  links: readonly string[];
  image: string;
}) {
  return (
    <article
      className={`
        spotlight-card group overflow-hidden rounded-[1.5rem] border border-white/10 bg-card transition-all
        duration-[400ms] ease-[var(--ease-smooth)]
        hover:-translate-y-2 hover:border-primary/35
      `}
    >
      <div className="aspect-[1.1] overflow-hidden">
        <img
          alt={title}
          className={`
            h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-smooth)]
            group-hover:scale-105
          `}
          src={image}
        />
      </div>
      <div className="space-y-5 p-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/6 px-3 py-1 font-mono text-[11px] tracking-[0.16em] text-muted uppercase"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-[2rem] font-medium tracking-[-0.04em] text-fg">
            {title}
          </h3>
          <p className="text-sm leading-7 text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {links.map((item) => (
            <button
              key={item}
              type="button"
              className={`
                inline-flex items-center gap-2 text-sm text-fg transition-colors
                hover:text-primary
              `}
            >
              {item}
              <ArrowUpRight className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
