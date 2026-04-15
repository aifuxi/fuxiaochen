import Link from "next/link";
import type React from "react";

type CmsAuthFrameProps = {
  children: React.ReactNode;
  description: string;
  title: string;
};

export function CmsAuthFrame({ children, description, title }: CmsAuthFrameProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10">
      <div
        className={`
          pointer-events-none absolute inset-0
          bg-[linear-gradient(180deg,rgba(16,185,129,0.1),transparent_32%),linear-gradient(135deg,rgba(99,102,241,0.08),transparent_58%)]
        `}
      />
      <div
        className={`
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
          bg-[size:64px_64px]
        `}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className={`
          grid w-full gap-8
          lg:grid-cols-[1fr_0.92fr]
        `}>
          <div className="flex flex-col justify-center gap-8">
            <Link className="inline-flex items-center gap-3 no-underline" href="/">
              <div className={`
                flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-black
              `}>
                SB
              </div>
              <span className="font-mono text-[1.75rem] font-bold text-foreground">
                Super<em className="text-primary not-italic">Blog</em>
              </span>
            </Link>

            <div className="space-y-4">
              <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">
                CMS
              </div>
              <h1 className={`
                font-serif text-4xl tracking-[-0.05em] text-foreground
                lg:text-5xl
              `}>
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted">{description}</p>
            </div>
          </div>

          <div className={`
            rounded-[2rem] border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-1)]
            p-8
          `}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
