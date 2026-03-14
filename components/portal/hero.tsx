import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden py-32 text-center">
      {/* Background Gradient Blob */}
      <div
        className={`
          absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary
          opacity-10 blur-[100px]
        `}
      />

      <div className="max-w-4xl animate-in space-y-6 px-4 duration-1000 fade-in slide-in-from-bottom-8">
        <h1
          className={`
            text-5xl font-bold tracking-tight text-foreground
            md:text-7xl
          `}
        >
          探索 <br />
          <span className="text-primary">
            数字创造
          </span>
        </h1>

        <p
          className={`
            mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground
            md:text-xl
          `}
        >
          分享关于前端开发、设计系统和现代 Web 架构的思考。 基于 Next.js 16 和
          Apple Human Interface 风格构建。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/blog"
            className={`
              group relative inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-primary-foreground
              shadow-sm transition-all duration-200 ease-in-out
              hover:bg-primary/90
            `}
          >
            开始阅读
            <ArrowRight
              className={`
                h-4 w-4 transition-transform duration-200
                group-hover:translate-x-1
              `}
            />
          </Link>
          <Link
            href="/about"
            className={`
              inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-8 py-3 text-foreground
              transition-all duration-200 ease-in-out
              hover:bg-accent
            `}
          >
            关于我
          </Link>
        </div>
      </div>
    </section>
  );
}
