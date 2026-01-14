import { AboutMe } from "@/components/cyberpunk/about-me";
import { Changelog } from "@/components/cyberpunk/changelog";
import { GlitchHero } from "@/components/cyberpunk/glitch-hero";
import { NeonBlogCard } from "@/components/cyberpunk/neon-blog-card";

export default function HomePage() {
  const blogs = [
    {
      title: "The Future of React Server Components",
      excerpt:
        "Analyzing the impact of RSC on modern web development and how it shifts the paradigm of frontend architecture.",
      tags: ["React", "Next.js", "Web"],
      date: "2024-03-20",
      slug: "future-of-rsc",
    },
    {
      title: "Designing for the Metaverse",
      excerpt:
        "UI/UX principles for spatial computing and how to create immersive 3D experiences on the web.",
      tags: ["Design", "3D", "UX"],
      date: "2024-03-18",
      slug: "designing-for-metaverse",
    },
    {
      title: "Cybersecurity in the Age of AI",
      excerpt:
        "Protecting digital assets against sophisticated AI-driven attacks. A deep dive into zero-trust architecture.",
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
                Latest <span className="text-neon-cyan">Transmissions</span>
              </h2>
              <p className="text-gray-400 font-mono text-sm">
                /// ACCESSING_ARCHIVES...
              </p>
            </div>

            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                "All_Systems",
                "Development",
                "Design",
                "Security",
                "Hardware",
              ].map((cat, i) => (
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
              ))}
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
            © 2024 PORTAL.OS // SYSTEM ONLINE
          </p>
        </div>
      </footer>
    </>
  );
}
