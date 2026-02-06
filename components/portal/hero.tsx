import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden py-32 text-center">
      {/* Background Gradient Blob */}
      <div className={`
        absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full
        bg-[var(--accent-color)] opacity-5 blur-[120px]
      `} />

      <div className="max-w-4xl animate-in space-y-6 px-4 duration-1000 fade-in slide-in-from-bottom-8">
        <h1 className={`
          text-5xl font-bold tracking-tight text-[var(--text-color)]
          md:text-7xl
        `}>
          探索 <br />
          <span className="bg-gradient-to-r from-[var(--accent-color)] to-purple-500 bg-clip-text text-transparent">
            数字创造
          </span>
        </h1>

        <p className={`
          mx-auto max-w-2xl text-lg leading-relaxed text-[var(--text-color-secondary)]
          md:text-xl
        `}>
          分享关于前端开发、设计系统和现代 Web 架构的思考。
          基于 Next.js 16 和 Liquid Glass 美学构建。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/blog"
            className={`
              group relative inline-flex items-center gap-2 rounded-full bg-[var(--accent-color)] px-8 py-3 text-white
              shadow-lg transition-all duration-300
              hover:-translate-y-1 hover:opacity-90 hover:shadow-xl
            `}
          >
            开始阅读
            <ArrowRight className={`
              h-4 w-4 transition-transform
              group-hover:translate-x-1
            `} />
          </Link>
          <Link
            href="/about"
            className={`
              inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-8 py-3
              text-[var(--text-color)] backdrop-blur-md transition-all duration-300
              hover:bg-white/80 hover:shadow-md
              dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:hover:bg-white/10
            `}
          >
            关于我
          </Link>
        </div>
      </div>
    </section>
  );
}
