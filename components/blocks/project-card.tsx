import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/mocks/site-content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className="project-card glass-card shimmer-border spotlight-card block overflow-hidden" href={project.href}>
      <div className="relative">
        <Image alt={project.title} className="card-image h-64 w-full object-cover" height={500} src={project.image} width={800} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="mb-3 flex items-center gap-3">
            <Badge className={`
              font-mono-tech text-primary-accent border-0 bg-primary/20 text-xs tracking-wider uppercase
            `} variant="primary">
              {project.label}
            </Badge>
            <span className="font-mono-tech text-xs text-white/60">{project.tags.join(", ")}</span>
          </div>
          <h3 className="mb-2 font-serif text-2xl text-white">{project.title}</h3>
          <p className="mb-4 text-sm leading-relaxed font-light text-white/70">{project.description}</p>
          <div className="font-mono-tech flex items-center gap-2 text-xs text-white/70">
            <span>{project.metric}</span>
          </div>
          <div className={`
            text-primary-accent arrow-btn mt-4 flex items-center gap-2 text-xs transition-all duration-300
            hover:gap-3
          `}>
            <span className="font-mono-tech tracking-wider uppercase">View Project</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
