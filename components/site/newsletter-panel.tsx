import { Mail } from "lucide-react";

export function NewsletterPanel() {
  return (
    <section className={`
      relative overflow-hidden rounded-[2rem] border border-white/10 bg-card px-6 py-10 backdrop-blur-xl
      md:px-10 md:py-14
    `}>
      <div className={`
        pointer-events-none absolute inset-0
        bg-[radial-gradient(circle_at_top_left,rgb(16_185_129_/_0.18),transparent_32%),linear-gradient(135deg,rgb(255_255_255_/_0.04),transparent_40%)]
      `} />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className={`
          mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono
          text-[11px] tracking-[0.18em] text-primary uppercase
        `}>
          <Mail className="size-3.5" />
          Newsletter
        </div>
        <h2 className={`
          gradient-text font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-medium tracking-[-0.05em]
        `}>
          Notes on systems, writing and calm software.
        </h2>
        <p className={`
          mx-auto mt-5 max-w-2xl text-sm leading-8 text-muted
          md:text-base
        `}>
          每月一封，记录界面系统、内容结构与前端实现中的关键决策。
        </p>
        <form className={`
          mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 p-3
          md:flex-row
        `}>
          <input
            className={`
              h-12 flex-1 rounded-[0.9rem] border border-white/10 bg-white/6 px-4 text-sm text-fg transition-colors
              outline-none
              placeholder:text-muted
              focus:border-primary
            `}
            placeholder="you@example.com"
            type="email"
          />
          <button
            className={`
              h-12 rounded-[0.9rem] bg-primary px-6 font-mono text-xs font-semibold tracking-[0.16em] text-primary-fg
              uppercase transition-all
              hover:-translate-y-px hover:bg-primary-h
            `}
            type="submit"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
