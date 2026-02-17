import type { ReactNode } from "react";
import { AppleCard } from "@/components/ui/glass-card";
import { Title } from "@/components/ui/typography/title";

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
      <AppleCard className="mb-6">
        <div className="mb-6">
          <Title level={3} className="mb-2">
            {title}
          </Title>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
        <div className="space-y-6">{children}</div>
      </AppleCard>
    </section>
  );
}
