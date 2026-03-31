import { PageHero } from "@/components/shared/page-hero";
import { ProjectCard } from "@/components/site/project-card";

const projects = [
  {
    title: "Design System Showcase",
    description: "Token-driven design doc route backed by shared UI primitives and demo patterns.",
    stack: ["Design", "Radix", "CVA"],
  },
  {
    title: "Blog Platform",
    description: "Public site scaffold ready for hero sections, archive cards and article detail composition.",
    stack: ["Next.js", "Tailwind", "Prisma"],
  },
  {
    title: "CMS Console",
    description: "Dashboard shell for analytics, settings and content operations with reusable layout surfaces.",
    stack: ["Auth", "Tables", "Forms"],
  },
] as const;

export default function ProjectsPage() {
  return (
    <div className={`
      container-shell space-y-10 py-10
      md:py-14
    `}>
      <PageHero
        badge="Projects"
        eyebrow="Portfolio"
        title="Projects are mapped to dedicated site business components."
        description="The page-level scaffold is now independent from card structure, so project views can evolve without reshaping the whole route."
      />
      <div className={`
        grid gap-6
        lg:grid-cols-3
      `}>
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </div>
  );
}
