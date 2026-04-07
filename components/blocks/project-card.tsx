import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Project } from "@/lib/mocks/site-content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={project.href}>
      <Card className={`
        spotlight-border h-full rounded-[1.8rem] transition-transform duration-300
        hover:-translate-y-1
      `}>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 type-label">{project.status}</div>
              <h3 className="font-serif text-3xl tracking-[-0.05em]">{project.title}</h3>
            </div>
            <Badge variant="muted">{project.status}</Badge>
          </div>
          <p className="text-sm leading-6 text-muted">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
