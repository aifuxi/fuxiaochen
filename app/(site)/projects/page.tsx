import { ProjectCard } from "@/components/site/project-card";
import { projects } from "@/lib/mock/design-content";

export default function ProjectsPage() {
  return (
    <div className={`
      container-shell space-y-10 py-8
      md:py-12
    `}>
      <section className="space-y-5 py-8">
        <div className="flex items-center gap-3">
          <div className="hero-label-dot" />
          <span className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
            Projects
          </span>
        </div>
        <h1 className="font-serif leading-[0.94] font-medium tracking-[-0.05em] text-[var(--text-h1)]">
          Work shaped around clarity,
          <br />
          atmosphere and maintainability.
        </h1>
        <p className="max-w-2xl text-lg leading-9 text-muted">
          这些项目覆盖 editorial 站点、设计系统文档和内容运营后台，页面只展示静态前端表现，不接任何业务接口。
        </p>
      </section>
      <div className={`
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-4
      `}>
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </div>
  );
}
