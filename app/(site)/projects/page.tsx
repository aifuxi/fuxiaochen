import { ProjectGallery } from "@/components/blocks/project-gallery";
import { SiteSectionHeading } from "@/components/blocks/site-section-heading";
import { getPublicSite, listPublicProjects } from "@/lib/public/public-content-client";

export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([
    listPublicProjects({ page: 1, pageSize: 50 }),
    getPublicSite(),
  ]);

  return (
    <div className="space-y-12 pb-24">
      <section className="px-8 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="这里按时间与主题整理了全部项目，先看总览，再进入完整目录。"
              eyebrow="Archive / 项目"
              meta={`${projects.total} 个项目`}
              title="项目归档"
            />
            <div className={`
              grid gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            `}>
              {site.projectStats.map((item) => (
                <div key={item.label} className="glass-card rounded-[1.75rem] border border-white/10 p-6">
                  <div className="text-primary-accent font-serif text-4xl tracking-[-0.04em]">{item.value}</div>
                  <div className="font-mono-tech mt-2 text-[11px] tracking-[0.22em] text-muted uppercase">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6 text-sm leading-7 text-muted">
              项目列表保持完整归档视角，不做精选筛选，便于按发布时间和内容连续阅读。
            </div>
          </div>
        </div>
      </section>
      <ProjectGallery projects={projects.items} />
    </div>
  );
}
