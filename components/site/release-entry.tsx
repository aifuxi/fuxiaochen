export function ReleaseEntry({
  version,
  date,
  summary,
  changes,
}: {
  version: string;
  date: string;
  summary: string;
  changes: Array<{ type: string; text: string }>;
}) {
  return (
    <article className="relative pl-8">
      <span className={`
        absolute top-2 left-0 size-[10px] rounded-full bg-primary shadow-[0_0_0_4px_rgb(16_185_129_/_0.2)]
      `} />
      <span className="absolute top-6 left-1 h-[calc(100%+2rem)] w-px bg-border" />
      <div className="rounded-[1rem] border border-white/10 bg-card p-6 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className={`
            rounded-full border border-primary/35 bg-primary/12 px-3 py-1 font-mono text-xs tracking-[0.16em]
            text-primary uppercase
          `}>
            {version}
          </div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
            {date}
          </div>
        </div>
        <p className="mb-5 text-base leading-8 text-fg">{summary}</p>
        <div className="space-y-3">
          {changes.map((change) => (
            <div key={`${version}-${change.text}`} className="flex items-start gap-3">
              <span
                className={`
                  rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] uppercase
                  ${
                  change.type === "added"
                    ? "bg-primary/12 text-primary"
                    : change.type === "improved"
                      ? "bg-info/12 text-info"
                      : change.type === "bugfix"
                        ? "bg-error/12 text-error"
                        : change.type === "changed"
                          ? "bg-warning/12 text-warning"
                          : "bg-white/10 text-muted"
                }
                `}
              >
                {change.type}
              </span>
              <p className="text-sm leading-7 text-muted">{change.text}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
