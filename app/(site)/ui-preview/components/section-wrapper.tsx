import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";

interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionWrapper({
  id,
  title,
  description,
  children,
}: SectionWrapperProps) {
  return (
    <section id={id} className="scroll-mt-8">
      <GlassCard className="mb-6">
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="space-y-6">{children}</div>
      </GlassCard>
    </section>
  );
}
