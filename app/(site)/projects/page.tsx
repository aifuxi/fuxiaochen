import { PageIntro } from "@/components/blocks/page-intro";
import { ProjectCard } from "@/components/blocks/project-card";
import { projects } from "@/lib/mocks/site-content";

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        description="A compact index of interfaces, tools, and system fragments that share the same editorial visual language."
        eyebrow="Projects"
        title="Adjacent products, utilities, and experiments."
      />
      <section className={`
        shell-container grid gap-5
        lg:grid-cols-3
      `}>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>
    </>
  );
}
