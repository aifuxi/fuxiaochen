type SiteSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
};

export function SiteSectionHeading({
  description,
  eyebrow,
  meta,
  title,
}: SiteSectionHeadingProps) {
  return (
    <div className="space-y-4">
      <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">
        {eyebrow}
      </div>
      <div
        className={`
          flex flex-col gap-4
          lg:flex-row lg:items-end lg:justify-between
        `}
      >
        <div className="space-y-3">
          <h2 className={`
            font-serif text-4xl tracking-[-0.05em] text-foreground
            lg:text-5xl
          `}>
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
          ) : null}
        </div>
        {meta ? (
          <div className="font-mono-tech text-xs tracking-[0.18em] text-muted uppercase">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
