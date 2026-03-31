import { cn } from "@/lib/utils";

export function SectionHeader({
  className,
  eyebrow,
  title,
  description,
}: {
  className?: string;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? (
        <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.04em]">
        {title}
      </h2>
      {description ? (
        <p className={`
          max-w-3xl text-sm leading-7 text-muted
          md:text-base
        `}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
