import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PublicSiteStatDto } from "@/lib/public/public-content-dto";

export function HeroSection({ stats = [] }: { stats?: PublicSiteStatDto[] }) {
  return (
    <section className="shell-container pt-6">
      <div className={`
        grid items-end gap-8
        lg:grid-cols-[1.4fr_0.9fr]
      `}>
        <div className="space-y-8">
          <Badge className="w-fit" variant="primary">
            Design System v1
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl hero-title text-balance">
              Chen <span className="text-primary italic">Serif</span> for content, product surfaces, and the CMS behind
              them.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              An editorial-first interface system shaped by Tailwind CSS v4 tokens, Base UI primitives, and ByteMD
              writing workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ size: "lg" }))} href="/articles">
              Explore Articles
              <ArrowRight className="size-4" />
            </Link>
            <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/design-spec">
              View Design Spec
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="type-label">System Snapshot</div>
              <p className="text-sm leading-6 text-muted">
                One visual language across the public site and the editorial desk, without hiding component logic behind
                a vendor theme.
              </p>
            </div>
            <div className={`
              grid gap-3
              sm:grid-cols-3
              lg:grid-cols-1
            `}>
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                  <div className="font-serif text-4xl tracking-[-0.05em]">{item.value}</div>
                  <div className="mt-2 type-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
