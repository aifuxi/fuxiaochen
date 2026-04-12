import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { PublicProjectDto } from "@/lib/public/public-content-dto";

export function ProjectCard({ project }: { project: PublicProjectDto }) {
  return (
    <Link className="project-card glass-card shimmer-border spotlight-card block overflow-hidden" href={project.href}>
      <div className="relative">
        {project.coverImageUrl ? (
          <Image
            alt={project.coverImageAlt ?? project.title}
            className="card-image h-64 w-full object-cover"
            height={500}
            src={project.coverImageUrl}
            width={800}
          />
        ) : (
          <div className="card-image h-64 w-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="mb-3 flex items-center gap-3">
            <Badge className={`
              font-mono-tech text-primary-accent border-0 bg-primary/20 text-xs tracking-wider uppercase
            `} variant="primary">
              {project.label}
            </Badge>
            <span className="font-mono-tech text-xs text-white/60">{project.techNames.join(", ")}</span>
          </div>
          <h3 className="mb-2 font-serif text-2xl text-white">{project.title}</h3>
          <p className="mb-4 text-sm leading-relaxed font-light text-white/70">{project.description}</p>
          {project.metric ? (
            <div className="font-mono-tech flex items-center gap-2 text-xs text-white/70">
              <span>{project.metric}</span>
            </div>
          ) : null}
          <div className={`
            text-primary-accent arrow-btn mt-4 flex items-center gap-2 text-xs transition-all duration-300
            hover:gap-3
          `}>
            <span className="font-mono-tech tracking-wider uppercase">查看项目</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
