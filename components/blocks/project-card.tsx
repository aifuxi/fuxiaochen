import Image from "next/image";
import Link from "next/link";

import type { PublicProjectDto } from "@/lib/public/public-content-dto";

export function ProjectCard({ project }: { project: PublicProjectDto }) {
  const href = project.externalUrl?.trim() || project.sourceUrl?.trim() || "/projects";

  return (
    <Link
      className="flex h-full flex-col overflow-hidden rounded-[1.75rem] editorial-panel"
      href={href}
    >
      <div className={`
        border-b
        border-[color:var(--color-line-subtle)]
      `}>
        {project.coverImageUrl ? (
          <Image
            alt={project.coverImageAlt ?? project.title}
            className="h-28 w-full object-cover opacity-90"
            height={500}
            src={project.coverImageUrl}
            width={800}
          />
        ) : (
          <div className="h-28 w-full bg-white/[0.02]" />
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.18em] text-muted uppercase">
          <span className="text-primary">{project.label}</span>
          <span aria-hidden="true" className="text-muted-soft">
            /
          </span>
          <span>{project.techNames.join(" · ")}</span>
        </div>
        <h3 className="font-serif text-2xl leading-tight tracking-[-0.04em] text-foreground">
          {project.title}
        </h3>
        <p className="max-w-3xl text-sm leading-7 text-muted">{project.description}</p>
        <div className={`
          mt-auto flex items-end justify-between gap-4 border-t
          border-[color:var(--color-line-subtle)]
          pt-4
        `}>
          <div className="space-y-1">
            <div className="font-mono-tech text-[11px] tracking-[0.16em] text-muted uppercase">
              案例摘要
            </div>
            {project.metric ? <div className="text-sm text-foreground">{project.metric}</div> : null}
          </div>
          <div className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">
            查看 →
          </div>
        </div>
      </div>
    </Link>
  );
}
