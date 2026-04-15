"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/blocks/project-card";
import type { PublicProjectDto } from "@/lib/public/public-content-dto";
import { cn } from "@/lib/utils";

type ProjectGalleryProps = {
  projects: PublicProjectDto[];
};

const filters = [
  { label: "全部", value: "all" },
  { label: "Web 应用", value: "web" },
  { label: "设计系统", value: "design" },
  { label: "Mobile", value: "mobile" },
  { label: "开源", value: "open-source" },
] as const;

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");

  const filteredProjects = useMemo(() => {
    if (filter === "all") {
      return projects;
    }

    return projects.filter((project) => project.categorySlug === filter);
  }, [filter, projects]);

  return (
    <>
      <section className="px-8 py-8">
        <div className="site-frame">
          <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] px-4 py-4 editorial-panel">
            {filters.map((item) => (
              <button
                key={item.value}
                className={cn(
                  `
                    rounded-full border
                    border-[color:var(--color-line-default)]
                    bg-transparent px-4 py-2 text-[11px] tracking-[0.18em] text-muted uppercase transition-colors
                  `,
                  filter === item.value && `
                    border-[color:var(--color-line-strong)]
                    bg-white/[0.02] text-foreground
                  `,
                )}
                type="button"
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 pb-32">
        <div className="site-frame">
          <div
            className={`
              grid gap-8
              md:grid-cols-2
              lg:grid-cols-3
            `}
          >
            {filteredProjects.map((project) => (
              <div key={project.slug}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
