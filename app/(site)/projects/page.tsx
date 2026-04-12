import { ProjectGallery } from "@/components/blocks/project-gallery";
import { getPublicSite, listPublicProjects } from "@/lib/public/public-content-client";

export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([
    listPublicProjects({ page: 1, pageSize: 50 }),
    getPublicSite(),
  ]);

  return (
    <div>
      <section className="relative px-8 pt-32 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="hero-label-dot" />
              <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">我的作品</span>
            </div>
            <h1 className={`
              font-serif text-6xl tracking-tighter
              lg:text-7xl
            `} style={{ lineHeight: 0.95 }}>
              精选
              <br />
              <span className="text-primary-accent italic">项目</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              展示我在设计系统、Web 开发和创意技术方面工作的项目集合。每个项目都代表着一个独特的挑战与解决方案。
            </p>
          </div>

          <div className={`
            mt-12 grid grid-cols-2 gap-4
            md:grid-cols-4
          `}>
            {site.projectStats.map((item) => (
              <div key={item.label} className="glass-card rounded-2xl border border-white/8 p-6 text-center">
                <div className="text-primary-accent mb-1 font-serif text-4xl">{item.value}</div>
                <div className="font-mono-tech text-xs tracking-widest text-muted uppercase">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ProjectGallery projects={projects.items} />
    </div>
  );
}
