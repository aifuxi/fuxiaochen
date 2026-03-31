import type { ReactNode } from "react";

export function AuthShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6 py-12">
      <div
        className={`
          pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(16_185_129_/_0.15),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgb(59_130_246_/_0.1),transparent)]
        `}
      />
      <div
        className={`
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgb(255_255_255_/_0.02)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_0.02)_1px,transparent_1px)]
          bg-[size:64px_64px]
        `}
      />
      <div className={`
        relative z-10 w-full max-w-[440px] rounded-[1.5rem] border border-border bg-card/95 p-8
        shadow-[var(--shadow-lg)] backdrop-blur-2xl
      `}>
        <div className="mb-8 space-y-3 text-center">
          <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
            Chen CMS
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          <p className="text-sm leading-7 text-muted">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
