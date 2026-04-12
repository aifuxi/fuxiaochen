"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

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
      <section className="relative px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((item) => (
              <button
                key={item.value}
                className={cn(
                  "tag-pill font-mono-tech rounded-full px-5 py-2 text-xs tracking-wider uppercase",
                  filter === item.value && "active",
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

      <section className="relative px-8 pb-32">
        <div className={`
          mx-auto grid max-w-7xl gap-8
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {filteredProjects.map((project, index) => (
            <article
              key={project.slug}
              className="project-card glass-card shimmer-border spotlight-card reveal overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="overflow-hidden">
                {project.coverImageUrl ? (
                  <Image
                    alt={project.coverImageAlt ?? project.title}
                    className="card-image h-48 w-full object-cover"
                    height={400}
                    src={project.coverImageUrl}
                    width={600}
                  />
                ) : (
                  <div className="card-image h-48 w-full bg-white/5" />
                )}
              </div>
              <div className="relative z-10 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`
                    font-mono-tech text-primary-accent rounded-full bg-primary/20 px-3 py-1 text-xs tracking-wider
                    uppercase
                  `}>
                    {project.label}
                  </span>
                </div>
                <h3 className="mb-2 font-serif text-xl">{project.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted">{project.description}</p>
                <div className="mb-4 flex items-center gap-3">
                  {project.techNames.map((tag) => (
                    <span key={tag} className="font-mono-tech rounded bg-white/5 px-2 py-1 text-xs text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-muted">{project.metric}</div>
                  <div className={`
                    arrow-btn text-primary-accent flex items-center gap-2 transition-all duration-300
                    hover:gap-3
                  `}>
                    <span className="font-mono-tech text-xs tracking-wider uppercase">查看</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
