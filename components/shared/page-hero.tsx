import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PageHero({
  className,
  eyebrow,
  title,
  description,
  badge,
}: {
  className?: string;
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <section className={cn(`
      relative overflow-hidden rounded-[2rem] border border-border bg-card/80 px-6 py-16 shadow-[var(--shadow-lg)]
      backdrop-blur-xl
      md:px-10
    `, className)}>
      <div
        className={`
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_top_left,rgb(16_185_129_/_0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgb(255_255_255_/_0.06),transparent_20%)]
        `}
      />
      <div className="relative z-10 max-w-3xl space-y-5">
        {badge ? <Badge variant="primary">{badge}</Badge> : null}
        {eyebrow ? (
          <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.92] font-medium tracking-[-0.05em]">
          {title}
        </h1>
        <p className={`
          max-w-2xl text-base leading-8 text-muted
          md:text-lg
        `}>
          {description}
        </p>
      </div>
    </section>
  );
}
