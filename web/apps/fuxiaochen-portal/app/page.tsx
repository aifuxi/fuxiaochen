import { AboutMe } from "@/components/cyberpunk/about-me";
import { Changelog } from "@/components/cyberpunk/changelog";
import { GlitchHero } from "@/components/cyberpunk/glitch-hero";
import { NeonBlogCard } from "@/components/cyberpunk/neon-blog-card";

export default function HomePage() {
  const blogs = [
    {
      title: "React Server Components 的未来",
      excerpt: "分析 RSC 对现代 Web 开发的影响，以及它如何改变前端架构的范式。",
      tags: ["React", "Next.js", "Web"],
      date: "2024-03-20",
      slug: "future-of-rsc",
    },
    {
      title: "为元宇宙设计界面",
      excerpt: "空间计算的 UI/UX 原则，以及如何在 Web 上创建沉浸式的 3D 体验。",
      tags: ["Design", "3D", "UX"],
      date: "2024-03-18",
      slug: "designing-for-metaverse",
    },
    {
      title: "AI 时代的网络安全",
      excerpt: "保护数字资产免受复杂的 AI 驱动攻击。深入探讨零信任架构。",
      tags: ["Security", "AI", "Tech"],
      date: "2024-03-15",
      slug: "cybersecurity-ai",
    },
  ];

  return (
    <>
      <GlitchHero />

      <main className="max-w-7xl mx-auto px-4 pb-20 space-y-32">
        {/* Blog Section */}
        <section id="blog" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white uppercase tracking-wider">
                最新 <span className="text-neon-cyan">发布</span>
              </h2>
              <p className="text-gray-400 font-mono text-sm">
                /// ACCESSING_ARCHIVES... 正在访问档案...
              </p>
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {["所有系统", "开发技术", "设计艺术", "网络安全", "硬件装备"].map(
                (cat, i) => (
                  <button
                    key={cat}
                    className={`px-4 py-2 rounded border text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                      i === 0
                        ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_var(--color-neon-cyan)]"
                        : "border-white/20 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/5"
                    }`}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-neon-cyan to-transparent opacity-50" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <NeonBlogCard key={i} {...blog} cover={undefined} />
            ))}
          </div>
        </section>

        {/* Info Grid */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AboutMe />
          <div id="changelog">
            <Changelog />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 mt-20 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-mono tracking-widest">
            © 2024 PORTAL.OS // SYSTEM ONLINE 系统在线
          </p>
        </div>
      </footer>
    </>
  );
}
