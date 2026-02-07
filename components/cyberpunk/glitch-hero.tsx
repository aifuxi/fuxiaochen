import Link from "next/link";
import { getChangelogsAction } from "@/app/actions/changelog";

export async function GlitchHero() {
  const { data } = await getChangelogsAction({
    page: 1,
    pageSize: 1,
    order: "desc",
    sortBy: "createdAt",
  });
  const changelogs = data?.lists;
  const version = changelogs?.[0]?.version || "unknown";
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,97,255,0.05),transparent_60%)]" />

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="z-10 space-y-8 px-4 text-center">
        <div
          className={`
            mb-4 inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1 backdrop-blur-sm
          `}
        >
          <span className="text-xs tracking-[0.2em] text-neon-cyan uppercase">
            系统版本 {version}
          </span>
        </div>

        <h1
          className={`
            relative bg-gradient-to-br from-neon-cyan via-white to-neon-magenta bg-clip-text text-6xl font-black
            tracking-tighter text-transparent uppercase
            md:text-8xl
            lg:text-9xl
          `}
        >
          <span className="relative z-10">
            赛博
            <br />
            原住民
          </span>
          <span className="absolute inset-0 z-0 animate-pulse text-neon-cyan opacity-30 blur-sm">
            赛博
            <br />
            原住民
          </span>
        </h1>

        <p
          className={`
            mx-auto max-w-2xl text-lg leading-relaxed font-light tracking-[0.5em] text-neon-purple uppercase
            md:text-2xl
          `}
        >
          探索数字前沿
        </p>

        <div
          className={`
            flex flex-col justify-center gap-6 pt-12
            md:flex-row
          `}
        >
          <Link
            href="/blog"
            className={`
              clip-path-polygon border border-neon-cyan bg-neon-cyan/10 px-10 py-4 font-bold tracking-widest
              text-neon-cyan uppercase shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300
              hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]
            `}
          >
            进入博客
          </Link>
          <Link
            href="/changelog"
            className={`
              border border-white/20 px-10 py-4 font-bold tracking-widest text-white uppercase transition-all
              duration-300
              hover:border-white/40 hover:bg-white/5
            `}
          >
            查看日志
          </Link>
        </div>
      </div>
    </section>
  );
}
