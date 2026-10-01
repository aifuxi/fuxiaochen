import Link from "next/link";

import { ArrowRight } from "@/components/icons";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <header className="relative mx-auto flex w-full max-w-[1200px] items-center px-5 py-7 md:px-8">
        <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-[18px] font-bold text-black">
          〰
        </span>
        <span className="ml-3 text-[14px] font-medium tracking-[-.03em]">fuxiaochen</span>
        <Link
          href="/login"
          className="ml-auto text-xs text-[var(--color-muted)] transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
        >
          登录 <ArrowRight className="inline-block" size={13} aria-hidden="true" />
        </Link>
      </header>
      <main className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-5 pb-24 md:px-8">
        <p className="mb-5 font-mono text-[11px] tracking-[.18em] text-[var(--color-subtle)] uppercase">
          FUXIAOCHEN
        </p>
        <h1 className="font-display text-[48px] font-medium tracking-[-.055em] text-white sm:text-[64px]">
          fuxiaochen
        </h1>
        <p className="mt-4 text-[15px] text-[var(--color-muted)]">欢迎来到我的站点。</p>
        <Link
          href="/design-spec"
          className="ds-button ds-button-primary mt-9 inline-flex h-8 w-fit items-center gap-2 rounded-full px-3"
        >
          查看 Design spec <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </main>
    </div>
  );
}
