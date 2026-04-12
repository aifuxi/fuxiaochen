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
            设计系统 v1
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl hero-title text-balance">
              Chen <span className="text-primary italic">Serif</span>：面向内容、产品界面及其背后 CMS 的排版系统。
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              一个由 Tailwind CSS v4 设计令牌、Base UI 组件和 ByteMD 写作工作流塑造的编辑优先界面系统。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ size: "lg" }))} href="/articles">
              浏览文章
              <ArrowRight className="size-4" />
            </Link>
            <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/design-spec">
              查看设计规范
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="type-label">系统概览</div>
              <p className="text-sm leading-6 text-muted">
                公共站点和编辑后台使用统一的视觉语言，组件逻辑不隐藏在第三方主题之后。
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
